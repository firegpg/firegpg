/*
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "MPL"); you may not use this file
 * except in compliance with the MPL. You may obtain a copy of
 * the MPL at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the MPL is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the MPL for the specific language governing
 * rights and limitations under the MPL.
 * 
 * The Original Code is protoZilla.
 * 
 * The Initial Developer of the Original Code is Ramalingam Saravanan.
 * Portions created by Ramalingam Saravanan <svn@xmlterm.org> are
 * Copyright (C) 2000 Ramalingam Saravanan. All Rights Reserved.
 * 
 * Contributor(s):
 * 
 * Alternatively, the contents of this file may be used under the
 * terms of the GNU General Public License (the "GPL"), in which case
 * the provisions of the GPL are applicable instead of
 * those above. If you wish to allow use of your version of this
 * file only under the terms of the GPL and not to allow
 * others to use your version of this file under the MPL, indicate
 * your decision by deleting the provisions above and replace them
 * with the notice and other provisions required by the GPL.
 * If you do not delete the provisions above, a recipient
 * may use your version of this file under either the MPL or the
 * GPL.
 */

// Logging of debug output 
// The following define statement should occur before any include statements
#define FORCE_PR_LOG       /* Allow logging even in release build */

#include "ipc.h"
#include "prlog.h"
#include "nsCOMPtr.h"
#include "nsCRT.h"
#include "nsAutoLock.h"
#include "nsIInputStream.h"
#include "nsIThread.h"
#include "nsIHttpChannel.h"
#include "nsString.h"
#include "nsIURI.h"
#include "nsNetUtil.h"
#include "nsReadableUtils.h"

#include "nsPipeConsole.h"

#ifdef PR_LOGGING
PRLogModuleInfo* gPipeConsoleLog = NULL;
#endif

#define ERROR_LOG(args)    PR_LOG(gPipeConsoleLog,PR_LOG_ERROR,args)
#define WARNING_LOG(args)  PR_LOG(gPipeConsoleLog,PR_LOG_WARNING,args)
#define DEBUG_LOG(args)    PR_LOG(gPipeConsoleLog,PR_LOG_DEBUG,args)

#define NS_PIPE_CONSOLE_BUFFER_SIZE   (1024)

static const PRUint32 kCharMax = NS_PIPE_CONSOLE_BUFFER_SIZE;

///////////////////////////////////////////////////////////////////////////////

// nsPipeConsole implementation

// nsISupports implementation
NS_IMPL_THREADSAFE_ISUPPORTS4(nsPipeConsole,
                              nsIStreamListener,
                              nsIPipeListener,
                              nsIPipeConsole,
                              nsIRunnable)


// nsPipeConsole implementation
nsPipeConsole::nsPipeConsole()
  : mFinalized(PR_FALSE),
    mJoinable(PR_FALSE),
    mThreadJoined(PR_FALSE),
    mOverflowed(PR_FALSE),

    mLock(nsnull),

    mConsoleBuf(""),
    mConsoleMaxLines(0),
    mConsoleMaxCols(0),

    mByteCount(0),
    mConsoleLines(0),
    mConsoleLineLen(0),
    mConsoleNewChars(0),

    mPipeWrite(IPC_NULL_HANDLE),
    mPipeRead(IPC_NULL_HANDLE),

    mPipeThread(nsnull)
{
    NS_INIT_ISUPPORTS();

#ifdef PR_LOGGING
  if (gPipeConsoleLog == nsnull) {
    gPipeConsoleLog = PR_NewLogModule("nsPipeConsole");
  }
#endif

#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeConsole:: <<<<<<<<< CTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif
}


nsPipeConsole::~nsPipeConsole()
{
  nsresult rv;
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeConsole:: >>>>>>>>> DTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

  Finalize(PR_TRUE);

  if (mLock)
    PR_DestroyLock(mLock);
}


///////////////////////////////////////////////////////////////////////////////
// nsPipeConsole methods:
///////////////////////////////////////////////////////////////////////////////

nsresult
nsPipeConsole::Finalize(PRBool destructor)
{
  DEBUG_LOG(("nsPipeConsole::Finalize: \n"));

  if (mFinalized)
    return NS_OK;

  mFinalized = PR_TRUE;

  nsCOMPtr<nsIPipeConsole> self;
  if (!destructor) {
    // Hold a reference to ourselves to prevent our DTOR from being called
    // while finalizing. Automatically released upon returning.
    self = this;
  }

  if (mPipeThread && !mThreadJoined) {
    // Interrupt thread; may fail
    mPipeThread->Interrupt();
  }

  // Close write pipe
  if (mPipeWrite) {
    IPC_Close(mPipeWrite);
    mPipeWrite = IPC_NULL_HANDLE;
  }

  // Release owning refs
  mPipeThread = nsnull;
  mObserver = nsnull;
  mObserverContext = nsnull;

  // Clear console
  mConsoleBuf.Assign("");
  mConsoleLines = 0;
  mConsoleLineLen = 0;
  mConsoleNewChars = 0;

  mConsoleMaxLines = 0;
  mConsoleMaxCols = 0;

  return NS_OK;
}

nsresult
nsPipeConsole::Init()
{
  DEBUG_LOG(("nsPipeConsole::Init: \n"));

  if (mLock == nsnull) {
    mLock = PR_NewLock();
    if (mLock == nsnull)
      return NS_ERROR_OUT_OF_MEMORY;
  }

  // add shutdown observer
  nsCOMPtr<nsIObserverService> observ(do_GetService("@mozilla.org/observer-service;1"));
  if (observ)
    observ->AddObserver(this, "xpcom-shutdown", PR_FALSE);
  
  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIPipeConsole methods (thread-safe)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeConsole::Open(PRInt32 maxRows, PRInt32 maxCols, PRBool joinable)
{
  nsresult rv;

  DEBUG_LOG(("nsPipeConsole::Open: %d, %d, %d\n", maxRows, maxCols,
                                                  (int) joinable));
  rv = Init();
  if (NS_FAILED(rv))
    return rv;

  mJoinable = joinable;

  if ((maxRows < 0) || (maxCols < 0))
    return NS_ERROR_FAILURE;

  mConsoleMaxLines = maxRows;
  mConsoleMaxCols  = ((maxCols > 0) && (maxCols < 3)) ? 3: maxCols;

  // Create pipe pair
  PRStatus status = IPC_CreateInheritablePipe(&mPipeRead, &mPipeWrite,
                                              PR_FALSE, PR_TRUE);
  if (status != PR_SUCCESS) {
    ERROR_LOG(("nsPipeConsole::Open: IPC_CreateInheritablePipe failed\n"));
    return NS_ERROR_FAILURE;
  }

  // Spin up a new thread to handle STDOUT polling
  PRThreadState threadState = mJoinable ? PR_JOINABLE_THREAD
                                        : PR_UNJOINABLE_THREAD;
  rv = NS_NewThread(getter_AddRefs(mPipeThread), this, 0, threadState);
  if (NS_FAILED(rv))
    return rv;

  return NS_OK;
}


NS_IMETHODIMP
nsPipeConsole::HasNewData(PRBool *_retval)
{
  nsAutoLock lock(mLock);

  //DEBUG_LOG(("nsPipeConsole::HasNewData:\n"));

  *_retval = (mConsoleNewChars > 0);

  return NS_OK;
}


NS_IMETHODIMP
nsPipeConsole::GetData(char** _retval)
{
  DEBUG_LOG(("nsPipeConsole::GetData:\n"));

  mConsoleNewChars = mConsoleBuf.Length();

  return GetNewData(_retval);
}


NS_IMETHODIMP
nsPipeConsole::GetNewData(char** _retval)
{
  nsAutoLock lock(mLock);

  DEBUG_LOG(("nsPipeConsole::GetNewData:\n"));

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  // Compute offset of "new" portion of string
  PRInt32 consoleLen = mConsoleBuf.Length();
  PRInt32 offset = consoleLen - mConsoleNewChars;

  if ((offset < 0) || (offset > consoleLen)) {
    ERROR_LOG(("nsPipeConsole::GetData: Internal error - Invalid console offset"));
    return NS_ERROR_FAILURE;
  }

  // Copy portion of console data to be returned
  nsCAutoString consoleCopy (mConsoleBuf);
  if (offset)
    consoleCopy.Cut(0,offset);

  // Replace any NULs with '0'
  consoleCopy.ReplaceChar(char(0),'0');

  // Duplicate new C string
  *_retval = ToNewCString(consoleCopy);
  if (!*_retval)
    return NS_ERROR_OUT_OF_MEMORY;

  mConsoleNewChars = 0;

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIPipeListener methods (thread-safe)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeConsole::Observe(nsIRequestObserver* observer, nsISupports* context)
{
  nsAutoLock lock(mLock);
  DEBUG_LOG(("nsPipeConsole::Observe: %p, %p\n", observer, context));

  mObserver = observer;
  mObserverContext = context;

  return NS_OK;
}


NS_IMETHODIMP
nsPipeConsole::GetJoinable(PRBool *_retval)
{
  DEBUG_LOG(("nsPipeConsole::GetJoinable: %d\n", (int) mJoinable));

  *_retval = mJoinable;

  return NS_OK;
}


NS_IMETHODIMP
nsPipeConsole::Join()
{
  nsresult rv;

  if (!mJoinable)
    return NS_ERROR_FAILURE;

  {
    // Nested lock to avoid deadlock while waiting for Join
    nsAutoLock lock(mLock);
    DEBUG_LOG(("nsPipeConsole::Join:\n"));

    if (mThreadJoined || !mPipeThread)
      return NS_OK;

    if (mPipeWrite) {
      // Close write pipe before joining
      IPC_Close(mPipeWrite);
      mPipeWrite = IPC_NULL_HANDLE;
    }

    // Assume that this join will succeed to prevent double joining
    mThreadJoined = PR_TRUE;
  }

  rv = mPipeThread->Join();
  if (NS_FAILED(rv))
    return rv;

  return NS_OK;
}


NS_IMETHODIMP
nsPipeConsole::Shutdown()
{
  nsAutoLock lock(mLock);
  DEBUG_LOG(("nsPipeConsole::Shutdown:\n"));

  Finalize(PR_FALSE);

  return NS_OK;
}


NS_IMETHODIMP
nsPipeConsole::GetFileDesc(IPCFileDesc* *_retval)
{
  nsAutoLock lock(mLock);

  DEBUG_LOG(("nsPipeConsole::GetFileDesc:\n"));

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  if (mPipeWrite == IPC_NULL_HANDLE)
    return NS_ERROR_FAILURE;

  *_retval = mPipeWrite;
  return NS_OK;
}


NS_IMETHODIMP
nsPipeConsole::GetOverflowed(PRBool *_retval)
{
  nsAutoLock lock(mLock);

  DEBUG_LOG(("nsPipeConsole::GetOverflowed: %d\n", (int) mOverflowed));

  *_retval = mOverflowed;

  return NS_OK;
}


NS_IMETHODIMP
nsPipeConsole::GetByteData(PRUint32 *count, char **data)
{
  nsAutoLock lock(mLock);

  DEBUG_LOG(("nsPipeConsole::GetByteData:\n"));

  if (!count || !data)
    return NS_ERROR_NULL_POINTER;

  // Copy bytes
  *count = mConsoleBuf.Length();
  *data = NS_REINTERPRET_CAST(char*, nsMemory::Alloc((*count)+1));
  if (!*data)
    return NS_ERROR_OUT_OF_MEMORY;

  memcpy(*data, mConsoleBuf.get(), *count);

  // NUL terminate byte array(just to be safe!)
  (*data)[*count] = '\0';

  mConsoleNewChars = 0;

  return NS_OK;
}


NS_IMETHODIMP
nsPipeConsole::Write(const char* str)
{
  // Note: Locking occurs in WriteBuf

  DEBUG_LOG(("nsPipeConsole::Write: %s\n", str));

  PRUint32 len = strlen(str);
  if (!len)
    return NS_OK;
  
  return WriteBuf(str, len);
}

NS_METHOD
nsPipeConsole::WriteBuf(const char* buf, PRUint32 count)
{
  nsAutoLock lock(mLock);

  DEBUG_LOG(("nsPipeConsole::WriteBuf: %d\n", count));

  mByteCount += count;

  if ((count <= 0) || !mConsoleMaxLines)
    return NS_OK;

  PRInt32 consoleOldLen = mConsoleBuf.Length();

  PRInt32 appendOffset = 0;

  PRInt32 j;

  // Count and append new lines (folding extra-long lines)
  for (j=0; j<(PRInt32)count; j++) {
    if (buf[j] == '\n') {
      // End-of-line
      mConsoleLineLen = 0;
      mConsoleLines++;

    } else if (mConsoleMaxCols &&
               ((int)mConsoleLineLen >= mConsoleMaxCols)) {
      // Fold line
      mConsoleLineLen = 1;
      mConsoleLines++;

      // Append characters upto this point
      if (j > appendOffset)
        mConsoleBuf.Append(buf+appendOffset, j-appendOffset);

      // Append newline
      mConsoleBuf.Append('\n');

      appendOffset = j;

    } else {
      // Extend line
      mConsoleLineLen++;
    }
  }

  // Append all remaining characters
  mConsoleBuf.Append(buf+appendOffset, count-appendOffset);

  PRInt32 deleteLines = mConsoleLines - mConsoleMaxLines;

  PRInt32 consoleLen = mConsoleBuf.Length();
  mConsoleNewChars += consoleLen - consoleOldLen;

  if (deleteLines > 0) {
    PRInt32 newOffset;
    PRInt32 linesLocated = 0;
    PRInt32 offset = 0;

    mOverflowed = PR_TRUE;

    while ((offset < consoleLen) && (linesLocated < deleteLines)) {
      newOffset = mConsoleBuf.FindChar('\n', offset);
      if (newOffset == kNotFound) break;
      offset = newOffset + 1;
      linesLocated++;
    }

    if (linesLocated != deleteLines) {

      ERROR_LOG(("nsPipeConsole::WriteBuf: linesLocated(%d) != deleteLines(%d)\n", linesLocated, deleteLines));

      return NS_ERROR_FAILURE;
    }

    mConsoleBuf.Cut(0,offset);
    mConsoleLines -= deleteLines;
  }

  if (mConsoleNewChars > mConsoleBuf.Length())
    mConsoleNewChars = mConsoleBuf.Length();

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIRequestObserver methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeConsole::OnStartRequest(nsIRequest *aRequest, nsISupports *aContext)
{
  DEBUG_LOG(("nsPipeConsole::OnStartRequest:\n"));

  nsCOMPtr<nsIRequestObserver> observer;
  nsCOMPtr<nsISupports> observerContext;
  {
    nsAutoLock lock(mLock);

    if (!mObserver)
      return NS_OK;

    observer = mObserver;
    observerContext = mObserverContext;
  }

  return observer->OnStartRequest(aRequest, observerContext);
}

NS_IMETHODIMP
nsPipeConsole::OnStopRequest(nsIRequest* aRequest, nsISupports* aContext,
                             nsresult aStatus)
{
  DEBUG_LOG(("nsPipeConsole::OnStopRequest:\n"));

  nsCOMPtr<nsIRequestObserver> observer;
  nsCOMPtr<nsISupports> observerContext;
  {
    nsAutoLock lock(mLock);

    if (!mObserver)
      return NS_OK;

    observer = mObserver;
    observerContext = mObserverContext;
  }

  return observer->OnStopRequest(aRequest, observerContext, aStatus);
}

///////////////////////////////////////////////////////////////////////////////
// nsIStreamListener method
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeConsole::OnDataAvailable(nsIRequest* aRequest, nsISupports* aContext,
                              nsIInputStream *aInputStream,
                              PRUint32 aSourceOffset,
                              PRUint32 aLength)
{
  nsresult rv = NS_OK;

  DEBUG_LOG(("nsPipeConsole::OnDataAVailable: %d\n", aLength));

  char buf[kCharMax];
  PRUint32 readCount, readMax;

  while (aLength > 0) {
    readMax = (aLength < kCharMax) ? aLength : kCharMax;
    rv = aInputStream->Read((char *) buf, readMax, &readCount);
    if (NS_FAILED(rv)){
      ERROR_LOG(("nsPipeConsole::OnDataAvailable: Error in reading from input stream, %x\n", rv));
      return rv;
    }

    if (readCount <= 0) return NS_OK;

    rv = WriteBuf(buf, readCount);
    if (NS_FAILED(rv)) return rv;

    aLength -= readCount;
  }

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIRunnable methods:
// (runs as a new thread)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeConsole::Run()
{
  nsresult rv = NS_OK;

#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeConsole::Run: myThread=%p\n", myThread.get()));
#endif

  // Blocked read loop
  while (1) {
    char buf[kCharMax];
    PRInt32 readCount;

    // Read data from pipe (blocking)
    readCount = IPC_Read(mPipeRead, (char *) buf, kCharMax);

    DEBUG_LOG(("nsPipeConsole::Run: Read %d chars\n", readCount));

    if (readCount <= 0)
      break;

    // Append data read to console
    WriteBuf(buf, readCount);
  }

  // Clear any NSPR interrupt
  PR_ClearInterrupt();

  // Close read pipe
  IPC_Close(mPipeRead);
  mPipeRead = IPC_NULL_HANDLE;

  return NS_OK;
}

//-----------------------------------------------------------------------------
// nsIObserver impl
//-----------------------------------------------------------------------------

NS_IMETHODIMP
nsPipeConsole::Observe(nsISupports *subject, const char *topic, const PRUnichar *data)
{
    DEBUG_LOG(("nsPipeConsole::Observe: topic=%s\n", topic));
    
    if (strcmp(topic, "xpcom-shutdown") == 0)
        Shutdown();
    return NS_OK;
}
