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
 * Patrick Brunschwig <patrick@mozilla-enigmail.org>
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
#include "mozilla/Mutex.h"
#include "nsIInputStream.h"
#include "nsIThread.h"
#include "nsIHttpChannel.h"
#include "nsNetUtil.h"
#include "nsDirectoryServiceUtils.h"
#include "nsDirectoryServiceDefs.h"
#include "nsNetCID.h"
#include "nsStringGlue.h"

#include "nsIPCBuffer.h"

#ifdef PR_LOGGING
PRLogModuleInfo* gIPCBufferLog = NULL;
#endif

#define ERROR_LOG(args)    PR_LOG(gIPCBufferLog,PR_LOG_ERROR,args)
#define WARNING_LOG(args)  PR_LOG(gIPCBufferLog,PR_LOG_WARNING,args)
#define DEBUG_LOG(args)    PR_LOG(gIPCBufferLog,PR_LOG_DEBUG,args)

#define NS_PIPE_CONSOLE_BUFFER_SIZE   (1024)

static const PRUint32 kCharMax = NS_PIPE_CONSOLE_BUFFER_SIZE;

///////////////////////////////////////////////////////////////////////////////

// nsIPCBuffer implementation

using namespace mozilla;

// nsISupports implementation
NS_IMPL_THREADSAFE_ISUPPORTS6(nsIPCBuffer,
                              nsIRequestObserver,
                              nsIStreamListener,
                              nsIPipeListener,
                              nsIIPCBuffer,
                              nsIInputStream,
                              nsIRunnable)


// nsIPCBuffer implementation
nsIPCBuffer::nsIPCBuffer() :
    mFinalized(PR_FALSE),
    mInitialized(PR_FALSE),
    mThreadJoined(PR_FALSE),
    mOverflowed(PR_FALSE),
    mOverflowFile(PR_FALSE),

    mRequestStarted(PR_FALSE),
    mRequestStopped(PR_FALSE),

    mLock("nsIPCBuffer.lock"),
    mMaxBytes(0),
    mByteCount(0),
    mStreamOffset(0),

    mByteBuf(""),

    mPipeWrite(IPC_NULL_HANDLE),
    mPipeRead(IPC_NULL_HANDLE),

    mTempFile(nsnull),
    mTempOutStream(nsnull),
    mTempInStream(nsnull),

    mPipeThread(nsnull),
    mObserver(nsnull),
    mObserverContext(nsnull)
{
#ifdef PR_LOGGING
  if (!gIPCBufferLog) {
    gIPCBufferLog = PR_NewLogModule("nsIPCBuffer");
  }
#endif

#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsIPCBuffer:: <<<<<<<<< CTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif
}


nsIPCBuffer::~nsIPCBuffer()
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsIPCBuffer:: >>>>>>>>> DTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

  Finalize(PR_TRUE);

}


///////////////////////////////////////////////////////////////////////////////
// nsIPCBuffer methods:
///////////////////////////////////////////////////////////////////////////////

nsresult
nsIPCBuffer::Finalize(PRBool destructor)
{
  DEBUG_LOG(("nsIPCBuffer::Finalize: \n"));

  if (mFinalized)
    return NS_OK;

  mFinalized = PR_TRUE;

  nsCOMPtr<nsIIPCBuffer> self;
  if (!destructor) {
    // Hold a reference to ourselves to prevent our DTOR from being called
    // while finalizing. Automatically released upon returning.
    self = this;
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

  RemoveTempFile();

  // Clear console
  mByteBuf.Assign("");

  return NS_OK;
}

nsresult
nsIPCBuffer::Init()
{
  DEBUG_LOG(("nsIPCBuffer::Init: \n"));

  mInitialized = PR_TRUE;

  return NS_OK;
}

NS_IMETHODIMP
nsIPCBuffer::Open(PRInt32 maxBytes, PRBool overflowFile)
{
  nsresult rv;

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_FALSE(mInitialized, NS_ERROR_ALREADY_INITIALIZED);

  DEBUG_LOG(("nsIPCBuffer::Open: %d, %d\n", maxBytes, (int) overflowFile));
  rv = Init();
  NS_ENSURE_SUCCESS(rv, rv);

  if (maxBytes <= 0) {
    mMaxBytes = PR_INT32_MAX;
  }
  else {
    mMaxBytes = maxBytes;
  }
  mOverflowFile = overflowFile;

  return NS_OK;
}


NS_IMETHODIMP
nsIPCBuffer::OpenURI(nsIURI* aURI, PRInt32 maxBytes, PRBool synchronous,
                     nsIRequestObserver* observer, nsISupports* context,
                     PRBool overflowFile)
{
  DEBUG_LOG(("nsIPCBuffer::OpenURI: \n"));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_FALSE(mInitialized, NS_ERROR_ALREADY_INITIALIZED);

  // check input params. observer and context may be null
  NS_ENSURE_ARG(aURI);

  nsresult rv;

  rv = Init();
  NS_ENSURE_SUCCESS(rv, rv);

  if (maxBytes <= 0) {
    mMaxBytes = PR_INT32_MAX;
  }
  else {
    mMaxBytes = maxBytes;
  }
  mOverflowFile = overflowFile;

  mObserver = observer;
  mObserverContext = context;

  nsCOMPtr<nsIIOService> ioService(do_GetService(NS_IOSERVICE_CONTRACTID, &rv));
  NS_ENSURE_SUCCESS(rv, rv);

  nsCOMPtr<nsIChannel> channel;
  rv = ioService->NewChannelFromURI(aURI, getter_AddRefs(channel));
  NS_ENSURE_SUCCESS(rv, rv);

  nsCOMPtr<nsISupports> ctxt = do_QueryInterface(aURI);

  if (!synchronous) {
    // Initiate asynchronous loading of URI
    rv = channel->AsyncOpen( (nsIStreamListener*) this, ctxt );
    NS_ENSURE_SUCCESS(rv, rv);

    DEBUG_LOG(("nsIPCBuffer::OpenURI: Starting asynchronous load ...\n"));
    return NS_OK;
  }

  // Synchronous loading (DOESN'T USUALLY WORK!!!)
  DEBUG_LOG(("nsIPCBuffer::OpenURI: Starting synchronous load ...\n"));
  nsCOMPtr<nsIInputStream> inputStream;
  rv = channel->Open(getter_AddRefs(inputStream));
  NS_ENSURE_SUCCESS(rv, rv);

  OnStartRequest(nsnull, mObserverContext);

  PRUint32 readCount;
  char buf[1024];

  while (1) {
    // Read and append output until end-of-file
    rv = inputStream->Read((char *) buf, 1024, &readCount);
    NS_ENSURE_SUCCESS(rv, rv);

    if (!readCount) break;

    rv = WriteBuf(buf, readCount);
    NS_ENSURE_SUCCESS(rv, rv);
  }

  // Close input stream
  inputStream->Close();

  OnStopRequest(nsnull, mObserverContext, 0);

  return NS_OK;
}


NS_IMETHODIMP
nsIPCBuffer::GetStopped(PRBool* _retval)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  NS_ENSURE_ARG(_retval);
  *_retval = mRequestStopped;
  return NS_OK;
}


NS_IMETHODIMP
nsIPCBuffer::GetTotalBytes(PRUint32* _retval)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  NS_ENSURE_ARG(_retval);
  *_retval = mByteCount;
  return NS_OK;
}


NS_IMETHODIMP
nsIPCBuffer::OpenInputStream(nsIInputStream** result)
{
  DEBUG_LOG(("nsIPCBuffer::OpenInputStream: \n"));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsresult rv;

  if (!mRequestStopped) {
    ERROR_LOG(("nsIPCBuffer::OpenInputStream: ERROR - request not stopped\n"));
    return NS_ERROR_NOT_INITIALIZED;
  }

  mStreamOffset = 0;

  if (mByteCount && mTempFile) {
    rv = OpenTempInStream();
    NS_ENSURE_SUCCESS(rv, rv);
  }

  NS_ADDREF(*result = this);
  return NS_OK;
}


#define SAFE_TMP_FILENAME "nsenig.tmp"

nsresult
nsIPCBuffer::CreateTempFile()
{
  nsresult rv;

  DEBUG_LOG(("nsIPCBuffer::CreateTempFile: \n"));

  if (mTempFile)
    return NS_ERROR_FILE_ALREADY_EXISTS;

  nsCOMPtr<nsIProperties> directoryService =
    do_GetService(NS_DIRECTORY_SERVICE_CONTRACTID, &rv);
  directoryService->Get(NS_OS_TEMP_DIR, NS_GET_IID(nsIFile),
    getter_AddRefs(mTempFile));

  NS_ABORT_IF_FALSE(mTempFile, "No temp folder?");

  if (! mTempFile)
    return NS_ERROR_UNEXPECTED;

  mTempFile->AppendNative(nsDependentCString(SAFE_TMP_FILENAME));
  rv = mTempFile->CreateUnique(nsIFile::NORMAL_FILE_TYPE, 00600);
  NS_ENSURE_SUCCESS(rv, rv);

  nsCAutoString nativePath;
  mTempFile->GetNativePath(nativePath);

  DEBUG_LOG(("nsIPCBuffer::CreateTempFile: %s\n",
            nativePath.get()));

  mTempOutStream = do_CreateInstance(
    "@mozilla.org/network/file-output-stream;1",
    &rv);
  NS_ENSURE_SUCCESS(rv, rv);

  rv = mTempOutStream->Init(mTempFile, PR_WRONLY | PR_CREATE_FILE | PR_TRUNCATE,
    00600, 0);
  return rv;
}


nsresult
nsIPCBuffer::WriteTempOutStream(const char* buf, PRUint32 count)
{
  if (!mTempOutStream)
    return NS_ERROR_NOT_AVAILABLE;

  if (!count)
    return NS_OK;

  PRUint32 writeCount;
  nsresult rv = mTempOutStream->Write(buf, count, &writeCount);

  if (writeCount != count)
    return NS_ERROR_FAILURE;

  return rv;
}

nsresult
nsIPCBuffer::CloseTempOutStream()
{
  nsresult rv = NS_OK;

  DEBUG_LOG(("nsIPCBuffer::CloseTempOutStream: \n"));

  if (mTempOutStream) {
    nsresult flushRV = mTempOutStream->Flush();
    rv = mTempOutStream->Close();

    if (NS_SUCCEEDED(rv) && NS_FAILED(flushRV))
      rv = flushRV;
    mTempOutStream = nsnull;
  }

  return rv;
}

nsresult
nsIPCBuffer::OpenTempInStream()
{
  nsresult rv;

  DEBUG_LOG(("nsIPCBuffer::OpenTempInStream: \n"));

  if (!mTempFile)
    return NS_ERROR_NOT_AVAILABLE;

  if (mTempOutStream) {
    ERROR_LOG(("nsIPCBuffer::OpenTempInStream: ERROR - TempOutStream still open!\n"));
    return NS_ERROR_UNEXPECTED;
  }

  mTempInStream  = do_CreateInstance("@mozilla.org/network/file-input-stream;1",
    &rv);
  NS_ENSURE_SUCCESS(rv, rv);

  rv = mTempInStream->Init(mTempFile, PR_RDONLY, 00600, 0);
  return rv;
}


nsresult
nsIPCBuffer::CloseTempInStream()
{
  DEBUG_LOG(("nsIPCBuffer::CloseTempInStream: \n"));
  nsresult rv = NS_OK;

  if (mTempInStream) {
    rv = mTempInStream->Close();
    mTempInStream = nsnull;
  }

  return rv;
}



nsresult
nsIPCBuffer::RemoveTempFile()
{
  DEBUG_LOG(("nsIPCBuffer::RemoveTempFile: \n"));

  nsresult rv;

  if (mTempOutStream) {
    // Close overflow file
    CloseTempOutStream();
  }

  if (mTempInStream) {
    // Close overflow file
    CloseTempInStream();
  }

  if (mTempFile) {
    // delete temp file
    nsCAutoString nativePath;
    mTempFile->GetNativePath(nativePath);
    DEBUG_LOG(("nsIPCBuffer::RemoveTempFile: Removing %s\n",
                nativePath.get()));

    rv = mTempFile->Remove(PR_FALSE);
    NS_ENSURE_SUCCESS(rv, rv);

    mTempFile = nsnull;
  }

  return NS_OK;
}


NS_IMETHODIMP
nsIPCBuffer::GetData(char** _retval)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  MutexAutoLock lock(mLock);

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  // Copy portion of console data to be returned
  nsCAutoString bufCopy (mByteBuf);

  // Replace any NULs with '0'
  PRInt32 nulIndex = 0;
  while (nulIndex != -1) {
    nulIndex = bufCopy.FindChar(char(0));
    if (nulIndex != -1) {
      bufCopy.Replace(nulIndex, 1, "0", 1);
    }
  }

  // Duplicate new C string
  *_retval = ToNewCString(bufCopy);
  if (!*_retval)
    return NS_ERROR_OUT_OF_MEMORY;

  return NS_OK;
}


///////////////////////////////////////////////////////////////////////////////
// nsIPipeListener methods (thread-safe)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsIPCBuffer::Observe(nsIRequestObserver* observer, nsISupports* context)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  NS_ENSURE_ARG(observer);

  MutexAutoLock lock(mLock);
  DEBUG_LOG(("nsIPCBuffer::Observe: %p, %p\n", observer, context));

  mObserver = observer;
  mObserverContext = context;

  return NS_OK;
}


NS_IMETHODIMP
nsIPCBuffer::GetJoinable(PRBool *_retval)
{
  DEBUG_LOG(("nsIPCBuffer::GetJoinable: 1\n"));

  *_retval = PR_TRUE;

  return NS_OK;
}


NS_IMETHODIMP
nsIPCBuffer::Shutdown()
{
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);
  // allow to perform even if mFinalized is true

  MutexAutoLock lock(mLock);
  DEBUG_LOG(("nsIPCBuffer::Shutdown:\n"));

  Finalize(PR_FALSE);

  return NS_OK;
}



NS_IMETHODIMP
nsIPCBuffer::GetByteData(PRUint32 *count, char **data)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  MutexAutoLock lock(mLock);

  DEBUG_LOG(("nsIPCBuffer::GetByteData:\n"));

  if (!count || !data)
    return NS_ERROR_NULL_POINTER;

  // Copy bytes
  *count = mByteBuf.Length();
  *data = reinterpret_cast<char*>(nsMemory::Alloc((*count)+1));
  if (!*data)
    return NS_ERROR_OUT_OF_MEMORY;

  memcpy(*data, mByteBuf.get(), *count);

  // NUL terminate byte array (just to be safe!)
  (*data)[*count] = '\0';

  return NS_OK;
}


NS_IMETHODIMP
nsIPCBuffer::GetOverflowed(PRBool *_retval)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  MutexAutoLock lock(mLock);

  DEBUG_LOG(("nsIPCBuffer::GetOverflowed: %d\n", (int) mOverflowed));

  *_retval = mOverflowed;

  return NS_OK;
}


NS_IMETHODIMP
nsIPCBuffer::Write(const char* str)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  NS_ENSURE_ARG(str);

  // Note: Locking occurs in WriteBuf

  DEBUG_LOG(("nsIPCBuffer::Write: %s\n", str));

  PRUint32 len = strlen(str);
  if (!len)
    return NS_OK;

  return WriteBuf(str, len);
}


NS_IMETHODIMP
nsIPCBuffer::WriteBuf(const char* buf, PRUint32 count)
{
  DEBUG_LOG(("nsIPCBuffer::WriteBuf: %d (%d)\n", count, mByteCount));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  NS_ENSURE_ARG(buf);

  nsresult rv;
  MutexAutoLock lock(mLock);

  if (count <= 0)
    return NS_OK;

  mByteCount += count;

  if (mOverflowed) {
    if (!mOverflowFile)
      return NS_OK;

    rv = WriteTempOutStream(buf, count);

    return rv;
  }

  // Find space available in buffer
  PRInt32 nAvail = mMaxBytes - mByteBuf.Length();

  if (nAvail >= (PRInt32) count) {
    mByteBuf.Append(buf, count);
    return NS_OK;
  }

  if (nAvail > 0) {
    mByteBuf.Append(buf, nAvail);
  }

  mOverflowed = PR_TRUE;
  DEBUG_LOG(("nsIPCBuffer::WriteBuf: buffer overflow\n"));

  if (!mOverflowFile)
    return NS_OK;

  CreateTempFile();

  // Write out previously buffered data first
  rv = WriteTempOutStream(mByteBuf.get(), mByteBuf.Length());
  NS_ENSURE_SUCCESS(rv, rv);

  rv = WriteTempOutStream(buf+nAvail, count-nAvail);
  return rv;
}

NS_IMETHODIMP
nsIPCBuffer::Join()
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsresult rv;

  {
    // Nested lock to avoid deadlock while waiting for Join
    MutexAutoLock lock(mLock);
    DEBUG_LOG(("nsIPCBuffer::Join:\n"));

    if (mThreadJoined || !mPipeThread)
      return NS_OK;

    if (mPipeWrite) {
      // Close write pipe before joining
      IPC_Close(mPipeWrite);
      mPipeWrite = IPC_NULL_HANDLE;
    }
  }

  rv = mPipeThread->Shutdown();

  NS_ENSURE_SUCCESS(rv, rv);

  mThreadJoined = PR_TRUE;
  return NS_OK;
}


NS_IMETHODIMP
nsIPCBuffer::GetFileDesc(IPCFileDesc **_retval)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsresult rv;

  MutexAutoLock lock(mLock);

  DEBUG_LOG(("nsIPCBuffer::GetFileDesc:\n"));

  NS_ENSURE_ARG_POINTER(_retval);

  if (!mFinalized && !mPipeThread) {
    // Create pipe pair
    PRStatus status = IPC_CreateInheritablePipe(&mPipeRead, &mPipeWrite,
                                              PR_FALSE, PR_TRUE);
    if (status != PR_SUCCESS) {
      ERROR_LOG(("nsIPCBuffer::GetFileDesc: IPC_CreateInheritablePipe failed\n"));
      return NS_ERROR_FAILURE;
    }

    // Spin up a new thread to handle STDOUT polling
    rv = NS_NewThread(getter_AddRefs(mPipeThread), this);

    NS_ENSURE_SUCCESS(rv, rv);
  }

  if (mPipeWrite == IPC_NULL_HANDLE)
    return NS_ERROR_FAILURE;

  *_retval = mPipeWrite;
  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIRequestObserver methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsIPCBuffer::OnStartRequest(nsIRequest *aRequest, nsISupports *aContext)
{
  DEBUG_LOG(("nsIPCBuffer::OnStartRequest:\n"));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsIRequestObserver* observer;
  nsISupports* observerContext;
  {
    MutexAutoLock lock(mLock);

    mRequestStarted = PR_TRUE;

    if (!mObserver)
      return NS_OK;

    observer = mObserver;
    observerContext = mObserverContext;
  }

  return observer->OnStartRequest(aRequest, observerContext);
}

NS_IMETHODIMP
nsIPCBuffer::OnStopRequest(nsIRequest* aRequest, nsISupports* aContext,
                             nsresult aStatus)
{
  DEBUG_LOG(("nsIPCBuffer::OnStopRequest:\n"));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsIRequestObserver* observer;
  nsISupports* observerContext;
  {
    MutexAutoLock lock(mLock);

    mRequestStopped = PR_TRUE;
    CloseTempOutStream();

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
nsIPCBuffer::OnDataAvailable(nsIRequest* aRequest, nsISupports* aContext,
                              nsIInputStream *aInputStream,
                              PRUint32 aSourceOffset,
                              PRUint32 aLength)
{
  nsresult rv = NS_OK;

  DEBUG_LOG(("nsIPCBuffer::OnDataAVailable: %d\n", aLength));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  NS_ENSURE_ARG(aInputStream);
  NS_ENSURE_ARG_MIN(aLength, 0);

  char buf[kCharMax];
  PRUint32 readCount, readMax;

  while (aLength > 0) {
    readMax = (aLength < kCharMax) ? aLength : kCharMax;
    rv = aInputStream->Read((char *) buf, readMax, &readCount);
    if (NS_FAILED(rv)) {
      ERROR_LOG(("nsIPCBuffer::OnDataAvailable: Error in reading from input stream, %x\n",
        rv));
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
nsIPCBuffer::Run()
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsIPCBuffer::Run: myThread=%p\n", myThread.get()));
#endif

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  // Blocked read loop
  while (1) {
    char buf[kCharMax];
    PRInt32 readCount;

    // Read data from pipe (blocking)
    readCount = IPC_Read(mPipeRead, (char *) buf, kCharMax);

    DEBUG_LOG(("nsIPCBuffer::Run: Read %d chars\n", readCount));

    if (readCount <= 0)
      break;

#if 0
    // Debugging code
    if (readCount < (int) kCharMax) {
      buf[readCount] = '\0';
      DEBUG_LOG(("nsIPCBuffer::Run: buf='%s'\n", buf));
    }
#endif

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

///////////////////////////////////////////////////////////////////////////////
// nsIInputStream methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsIPCBuffer::Available(PRUint32* _retval)
{
  NS_ENSURE_ARG(_retval);

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  *_retval = (mByteCount > mStreamOffset) ?
              mByteCount - mStreamOffset : 0;

  DEBUG_LOG(("nsIPCBuffer::Available: %d (%d)\n", *_retval, mByteCount));

  return NS_OK;
}

NS_IMETHODIMP
nsIPCBuffer::Read(char* buf, PRUint32 count,
                         PRUint32 *readCount)
{
  DEBUG_LOG(("nsIPCBuffer::Read: %d\n", count));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsresult rv;

  if (!buf || !readCount)
    return NS_ERROR_NULL_POINTER;

  PRInt32 avail = (mByteCount > mStreamOffset) ?
                   mByteCount - mStreamOffset : 0;

  PRUint32 readyCount = ((PRUint32) avail > count) ? count : avail;

  if (readyCount) {
    if (mTempInStream) {
      rv = mTempInStream->Read((char *)buf, readyCount, readCount);
      NS_ENSURE_SUCCESS(rv, rv);
    } else {
      memcpy(buf, mByteBuf.get()+mStreamOffset, readyCount);
      *readCount = readyCount;
    }
  }

  mStreamOffset += *readCount;

  if (mStreamOffset >= mByteCount) {
    Close();
  }

  return NS_OK;
}

NS_IMETHODIMP
nsIPCBuffer::ReadSegments(nsWriteSegmentFun writer,
                          void * aClosure, PRUint32 count,
                          PRUint32 *readCount)
{
  DEBUG_LOG(("nsIPCBuffer::ReadSegments: %d\n", count));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsresult rv;

  if (!readCount)
    return NS_ERROR_NULL_POINTER;

  PRUint32 avail, readyCount, writeCount;

  *readCount = 0;
  if (!mTempInStream) {

    while ((count > 0) && (mStreamOffset < mByteCount)) {
      avail = mByteCount - mStreamOffset;
      readyCount = ((PRUint32) avail > count) ? count : avail;

      rv = writer((nsIInputStream*)(this),
                  aClosure, mByteBuf.get()+mStreamOffset,
                  mStreamOffset, readyCount, &writeCount);
      NS_ENSURE_SUCCESS(rv, rv);

      if (!writeCount)
        return (NS_ERROR_FAILURE);

      DEBUG_LOG(("nsIPCBuffer::ReadSegments: writer %d\n", writeCount));

      *readCount    += writeCount;
      mStreamOffset += writeCount;
      count         -= writeCount;
    }

  } else {
    char buf[kCharMax];

    while ((count > 0) && (mStreamOffset < mByteCount)) {
      avail = (count < kCharMax) ? count : kCharMax;
      rv = mTempInStream->Read((char *) buf, avail, &readyCount);
      NS_ENSURE_SUCCESS(rv, rv);

      if (!readyCount) {
        ERROR_LOG(("nsIPCBuffer::ReadSegments: Error in reading from TempInputStream\n"));
        return NS_ERROR_FAILURE;
      }

      rv = writer((nsIInputStream*)(this),
                  aClosure, buf,
                  mStreamOffset, readyCount, &writeCount);
      NS_ENSURE_SUCCESS(rv, rv);
      if (!writeCount)
        return NS_ERROR_FAILURE;

      DEBUG_LOG(("nsIPCBuffer::ReadSegments: writer %d (Temp)\n", writeCount));

      *readCount    += writeCount;
      mStreamOffset += writeCount;
      count         -= writeCount;
    }
  }

  if (mStreamOffset >= mByteCount) {
    // End-of-file
    Close();
  }

  return NS_OK;
}

NS_IMETHODIMP
nsIPCBuffer::IsNonBlocking(PRBool *aNonBlocking)
{
  DEBUG_LOG(("nsIPCBuffer::IsNonBlocking: \n"));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  *aNonBlocking = (!mTempInStream);
  return NS_OK;
}

NS_IMETHODIMP
nsIPCBuffer::Close()
{
  DEBUG_LOG(("nsIPCBuffer::Close: \n"));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  mStreamOffset = 0;
  mByteCount = 0;
  mByteBuf.Assign("");

  RemoveTempFile();
  return NS_OK;
}
