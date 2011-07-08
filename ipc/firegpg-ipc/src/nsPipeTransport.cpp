/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
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
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * ***** END LICENSE BLOCK ***** */


// Logging of debug output
// The following define statement should occur before any include statements
#define FORCE_PR_LOG       /* Allow logging even in release build */

#include "ipc.h"
#include "nsPipeTransport.h"
#include "prlog.h"
#include "mozilla/Mutex.h"
#include "plstr.h"
#include "nsAutoPtr.h"
#include "nsStringGlue.h"
#include "netCore.h"

#include "nsComponentManagerUtils.h"
#include "nsServiceManagerUtils.h"
#include "nsIServiceManager.h"
#include "nsIProxyObjectManager.h"
#include "nsIObserver.h"
#include "nsIProcess.h"
#include "nsIURI.h"
#include "nsIHttpChannel.h"

#include "nsXPCOMCIDInternal.h"
#include "nsThreadUtils.h"
#include "nsIEventTarget.h"


#ifdef PR_LOGGING
PRLogModuleInfo* gPipeTransportLog = NULL;
#endif

#define ERROR_LOG(args)    PR_LOG(gPipeTransportLog,PR_LOG_ERROR,args)
#define WARNING_LOG(args)  PR_LOG(gPipeTransportLog,PR_LOG_WARNING,args)
#define DEBUG_LOG(args)    PR_LOG(gPipeTransportLog,PR_LOG_DEBUG,args)

#ifdef XP_WIN
// Workaround for bug(?) in Win32 implementation of PR_Poll,
// which seems to return PR_POLL_NVAL instead of PR_POLL_READ
// See mozilla/nsprpub/pr/src/md/windows/w32poll.c)
#define POLL_READ_FLAGS   (PR_POLL_READ | PR_POLL_NVAL)
#else
#define POLL_READ_FLAGS    PR_POLL_READ
#endif

// If defined, use pollable events to interrupt pipe transport threads
#define PIPETRANSPORT_USE_POLLABLE_EVENT

static const PRUint32 kCharMax = NS_PIPE_TRANSPORT_DEFAULT_SEGMENT_SIZE;

// Default time after which a process is assumed to be dead (in ms.)
#define DEFAULT_PROCESS_TIMEOUT_IN_MS  3600*1000

// Time to wait after transmitting any kill string to process (in milliseconds)
#define KILL_WAIT_TIME_IN_MS 20

///////////////////////////////////////////////////////////////////////////////

using namespace mozilla;

nsPipeTransport::nsPipeTransport() :
      mInitialized(PR_FALSE),
      mFinalized(PR_FALSE),
      mNoProxy(PR_FALSE),
      mStartedRequest(PR_FALSE),

      mPipeState(PIPE_NOT_YET_OPENED),
      mStdoutStream(STREAM_NOT_YET_OPENED),
      mCancelStatus(NS_OK),

      mLoadFlags(LOAD_NORMAL),
      mNotificationFlags(0),

      mCommand(""),
      mKillString(""),
      mCwd(""),
      mStartupFlags(0),

      mProcess(IPC_NULL_HANDLE),
      mKillWaitInterval(PR_MillisecondsToInterval(KILL_WAIT_TIME_IN_MS)),
      mExitCode(0),
      mPid(-1),

      mBufferSegmentSize(NS_PIPE_TRANSPORT_DEFAULT_SEGMENT_SIZE),
      mBufferMaxSize(NS_PIPE_TRANSPORT_DEFAULT_BUFFER_SIZE),
      mHeadersMaxSize(NS_PIPE_TRANSPORT_DEFAULT_HEADERS_SIZE),

      mExecBuf(""),
      mStdinWrite(IPC_NULL_HANDLE),
      mStderrConsole(nsnull),

      mPipeTransportWriter(nsnull)

{
    mExecutable.AssignLiteral("");
    mCreatorThread = nsnull;

#ifdef PR_LOGGING
  if (!gPipeTransportLog) {
    gPipeTransportLog = PR_NewLogModule("nsPipeTransport");
  }
#endif

#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsPipeTransport:: <<<<<<<<< CTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

}


nsPipeTransport::~nsPipeTransport()
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsPipeTransport:: >>>>>>>>> DTOR(%p): myThread=%p START\n",
         this, myThread.get()));
#endif

  Finalize(PR_TRUE);

  // Release refs to objects that do not hold strong refs to this
  mInputStream  = nsnull;
  mOutputStream = nsnull;
  mCreatorThread = nsnull;

  DEBUG_LOG(("nsPipeTransport:: ********* DTOR(%p) END\n", this));
}

//
// --------------------------------------------------------------------------
// nsISupports implementation...
// --------------------------------------------------------------------------
//

NS_IMPL_THREADSAFE_ISUPPORTS10(nsPipeTransport,
                              nsIPipeTransport,
                              nsIProcess,
                              nsIPipeTransportHeaders,
                              nsIPipeTransportListener,
                              nsIRequest,
                              nsIRequestObserver,
                              nsIOutputStream,
                              nsIStreamListener,
                              nsIInputStreamCallback,
                              nsIOutputStreamCallback)

///////////////////////////////////////////////////////////////////////////////
// nsIPipeTransport methods
///////////////////////////////////////////////////////////////////////////////


NS_IMETHODIMP nsPipeTransport::InitWithWorkDir(nsIFile *executable,
                                               nsIFile *cwd,
                                               PRUint32 startupFlags)
{
  nsresult rv;

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_FALSE(mInitialized, NS_ERROR_ALREADY_INITIALIZED);

  if (mPipeState != PIPE_NOT_YET_OPENED) {
    return NS_ERROR_ALREADY_INITIALIZED;
  }

  NS_ENSURE_ARG(executable);

  executable->Normalize();

  // check if file is executable
  PRBool isExecutable;
#ifndef XP_MACOSX
  // Bug 322865 prevents this from working on Mac OS X
  rv = executable->IsExecutable(&isExecutable);
#else
  rv = executable->Exists(&isExecutable);
#endif
  NS_ENSURE_SUCCESS(rv, rv);
  if (! isExecutable) return NS_ERROR_FILE_READ_ONLY;

#ifdef XP_WIN
  rv = executable->GetTarget(mExecutable);
  if (NS_FAILED(rv) || mExecutable.IsEmpty())
#endif
  rv = executable->GetPath(mExecutable);
  NS_ENSURE_SUCCESS(rv, rv);

  DEBUG_LOG(("nsPipeTransport::Initialize: executable=[%s]\n",
    mExecutable.get()));

  if (cwd) {
    PRBool isDirectory;
    cwd->Normalize();
    rv = cwd->IsDirectory(&isDirectory);
    NS_ENSURE_SUCCESS(rv, rv);

    if (!isDirectory)
      return NS_ERROR_FILE_NOT_DIRECTORY;

#ifdef XP_WIN
    rv = cwd->GetNativeTarget(mCwd);
    if (NS_FAILED(rv) || mExecutable.IsEmpty())
#endif
    rv = cwd->GetNativePath( mCwd );
    NS_ENSURE_SUCCESS(rv, rv);

    DEBUG_LOG(("nsPipeTransport::Initialize: working dir=[%s]\n", mCwd.get()));
  }
  else {
    mCwd = "";
    DEBUG_LOG(("nsPipeTransport::Initialize: no working dir set\n"));
  }
  mStartupFlags = startupFlags;
  mInitialized = PR_TRUE;

  return NS_OK;
}


NS_IMETHODIMP nsPipeTransport::Init(nsIFile *executable)
{
  return InitWithWorkDir(executable, nsnull, INHERIT_PROC_ATTRIBS);
}

NS_IMETHODIMP nsPipeTransport::OpenPipe(const PRUnichar **args,
                                        PRUint32 argCount,
                                        const PRUnichar **env,
                                        PRUint32 envCount,
                                        PRUint32 timeoutMS,
                                        const char *killString,
                                        PRBool noProxy,
                                        PRBool mergeStderr,
                                        nsIPipeListener* stderrConsole)
{
  nsresult rv;

  DEBUG_LOG(("nsPipeTransport::OpenPipe: [%d]\n",
             envCount));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  if (! (mergeStderr || (stderrConsole)))
    // either mergeStderr or stderrConsole must be defined
    return NS_ERROR_INVALID_ARG;

  if (mPipeState != PIPE_NOT_YET_OPENED)
    return NS_ERROR_ALREADY_INITIALIZED;

  mNoProxy = noProxy;

  if (! mergeStderr)
    mStderrConsole = stderrConsole;

  PRIntervalTime timeoutInterval  =
                     PR_MillisecondsToInterval(DEFAULT_PROCESS_TIMEOUT_IN_MS);
  if (timeoutMS > 0) {
    // Specified process timeout
    timeoutInterval = PR_MillisecondsToInterval(timeoutMS);
  }

  mKillString.Assign(killString);

  // Create pipes for stdin/stdout/stderr
  PRStatus status;
  int npipe;
  IPCFileDesc* stdinRead   = nsnull;
  IPCFileDesc* stdoutWrite = nsnull;
  IPCFileDesc* stdoutRead  = nsnull;
  IPCFileDesc* stderrWrite = nsnull;
  IPCFileDesc* stderrRead  = nsnull;
#ifdef XP_WIN
  // PR_Poll does not seem to work with pipes in Win32
  // Merge STDOUT and STDERR directly, if need be
  npipe = 2;
#else
  // Merging STDOUT and STDERR directly does not seem to work in Unix
  // Use PR_Poll if STDERR is to be merged
  // Mac OS X behaves like a twitter between Win32 and Unix
  npipe = mergeStderr ? 3 : 2;
#endif

  IPCFileDesc* stderrPipe;

  for (int ipipe = 0; ipipe < npipe; ipipe++) {
    // Create pipe pair
    IPCFileDesc* fd[2];
    status = IPC_CreateInheritablePipe(&fd[0], &fd[1],
                                      (ipipe == 0), (ipipe != 0));
    if (status != PR_SUCCESS) {
      ERROR_LOG(("nsPipeTransport::Open: Error in creating pipe %d\n", ipipe));
      return NS_ERROR_FAILURE;
    }

    // Copy pipe file descriptors
    if (ipipe == 0) {            // STDIN
      stdinRead   = fd[0];
      mStdinWrite = fd[1];

    } else if (ipipe == 1) {     // STDOUT
        stdoutRead  = fd[0];
        stdoutWrite = fd[1];

    } else {                     // STDERR
        stderrRead  = fd[0];
        stderrWrite = fd[1];
    }
  }

#ifndef XP_MACOSX
  if (stderrWrite) {
    // This STDOUT/STDERR merging technique works on Unix only (uses PR_Poll)
    stderrPipe = stderrWrite;

  } else
#endif
  if (mergeStderr) {
    // This STDOUT/STDERR merging technique works on Win32 and Mac OS X only
    // (uses same FD)
    stderrPipe = stdoutWrite;

  } else {
    // Re-direct STDERR to console
    nsCOMPtr<nsIPipeListener> console(mStderrConsole);

    rv = console->GetFileDesc(&stderrPipe);
    NS_ENSURE_SUCCESS(rv, rv);

    DEBUG_LOG(("nsPipeTransport::Open: stderrPipe=0x%p\n", stderrPipe));
  }

  rv = CopyArgsAndCreateProcess(args, argCount, env, envCount, stdinRead,
    stdoutWrite, stderrPipe);

  if (NS_FAILED(rv)) {
    if (mStderrConsole) {
      // close stderr console
      nsCOMPtr<nsIPipeListener> console(mStderrConsole);
      console->Shutdown();
      mStderrConsole = nsnull;
    }
    return rv;
  }


  // Close process-side STDIN/STDOUT/STDERR pipes
  IPC_Close(stdinRead);
  stdinRead = nsnull;

  IPC_Close(stdoutWrite);
  stdoutWrite = nsnull;

  if (stderrWrite) {
    IPC_Close(stderrWrite);
    stderrWrite = nsnull;
  }

  // Create polling helper class (will be deleted when thread terminates?)
  nsStdoutPoller* stdoutPoller = new nsStdoutPoller();
  if (!stdoutPoller)
    return NS_ERROR_OUT_OF_MEMORY;

  mStdoutPoller = stdoutPoller; // owning ref

  // Initialize polling helper class
  rv = stdoutPoller->Init(stdoutRead, stderrRead, timeoutInterval, mStderrConsole);
  NS_ENSURE_SUCCESS(rv, rv);

  mPipeState = PIPE_OPEN;

  return NS_OK;
}

nsresult
nsPipeTransport::CopyArgsAndCreateProcess(const PRUnichar **args,
                                          PRUint32 argCount,
                                          const PRUnichar **env,
                                          PRUint32 envCount,
                                          IPCFileDesc* stdinRead,
                                          IPCFileDesc* stdoutWrite,
                                          IPCFileDesc* stderrPipe)
{
  PRUint32 j;

  char** argList = nsnull;

  // Extended copy of argument list (execpath, args, NULL)
  argList = (char **) PR_Malloc(sizeof(char *) * (argCount + 2) );
  if (!argList)
    return NS_ERROR_OUT_OF_MEMORY;

  argList[0] = ToNewUTF8String(mExecutable);

  for (j=0; j < argCount; j++) {
#ifdef XP_OS2
    nsCAutoString tmpArg ( args[j] );
    if (tmpArg.FindChar(' ', 0) >= 0) {
      tmpArg.Insert("\"", 0);
      tmpArg.Append("\"");
      args[j] = ToNewUTF8String(tmpArg);
    }
#endif
    argList[j+1] = ToNewUTF8String(nsDependentString(args[j]));
    DEBUG_LOG(("nsPipeTransport::CopyArgsAndCreateProcess: arg[%d] = %s\n",
      j+1, argList[j+1]));
  }

  argList[argCount+1] = nsnull;

  char** envList = nsnull;
  if (envCount > 0) {
    // Extended copy of environment variable list (env, nsnull)
    envList = (char **) PR_Malloc(sizeof(char *) * (envCount + 1) );
    if (!envList) {
      PR_Free(argList);
      return NS_ERROR_OUT_OF_MEMORY;
    }

    for (j=0; j < envCount; j++)
      envList[j] = ToNewUTF8String(nsDependentString(env[j]));

    envList[envCount] = nsnull;
  }


  /* Create NSPR process */
  mProcess = IPC_CreateProcessRedirected(ToNewUTF8String(mExecutable),
                                         argList, envList,
                                         mCwd.Equals("") ? nsnull : mCwd.get(),
                                         stdinRead,
                                         stdoutWrite, stderrPipe,
                                         mStartupFlags & PROCESS_DETACHED ?
                                          PR_TRUE : PR_FALSE);

  // Do some clean-up for pointers on stack
  // before checking if process creation succeeded
  // (Clean-up for pointers in member variables will be done by the DTOR)

  // Free argument/environment lists
  PR_Free(argList);
  if (envList) PR_Free(envList);

  if (mProcess == IPC_NULL_HANDLE) {
    // Process creation failed
    ERROR_LOG(("nsPipeTransport::Open: Error in creating process ...\n"));
    return NS_ERROR_FILE_EXECUTION_FAILED;
  }

  DEBUG_LOG(("nsPipeTransport::Open: Created process %p, %s\n",
       mProcess, mExecutable.get()));

  IPC_GetProcessId (mProcess, &mPid);
  return NS_OK;
}


// Should only be called from the thread that created the nsIPipeTransport
nsresult
nsPipeTransport::Finalize(PRBool destructor)
{
  if (mFinalized || !mInitialized)
    return NS_OK;

  nsresult rv = NS_OK;

  DEBUG_LOG(("nsPipeTransport::Finalize: \n"));

  if (mPipeState == PIPE_CLOSED)
    return NS_OK;

  nsCOMPtr<nsIPipeTransport> self;
  if (!destructor) {
    // Hold a reference to ourselves to prevent our DTOR from being called
    // while finalizing. Automatically released upon returning.
    self = this;
  }

  mPipeState = PIPE_CLOSED;

  // Close standard output
  mStdoutStream = STREAM_CLOSED;

  PRBool alreadyInterrupted = PR_FALSE;

  if (mStdoutPoller) {
    // Interrupt Stdout thread
    // (calls to OnStopRequest are handled by that thread)
    rv = mStdoutPoller->Interrupt(&alreadyInterrupted);
    if (NS_FAILED(rv)) {
      ERROR_LOG(("nsPipeTransport::Finalize: Failed to interrupt Stdout thread, %x\n",
        rv));
    }
    else if (mNoProxy) {
      // Join poller thread to free resources (may block)
      rv = mStdoutPoller->Join();
      if (NS_FAILED(rv)) {
        ERROR_LOG(("nsPipeTransport::Finalize: Failed to shutdown Stdout thread, %x\n",
          rv));
      }
    }
  }

  nsresult joinRV = NS_OK;

  if (mPipeTransportWriter) {
    joinRV = mPipeTransportWriter->Join();
    if (NS_FAILED(joinRV)) {
      ERROR_LOG(("nsPipeTransport::Finalize: Failed to shutdown Stdin thread, %x\n",
        joinRV));
    }
    mPipeTransportWriter = nsnull;
  }

  if (NS_FAILED(joinRV))
    rv = joinRV;

  // Kill process to wake up thread blocked for input from process
  // NOTE: This should always be done after "interrupting" the thread
  //       so that the interrupt flag is set.

  Kill();

  mFinalized = PR_TRUE; // don't do this before Kill(), otherwise kill fails

  // Release refs to input arguments
  mListener         = nsnull;
  mContext          = nsnull;
  mLoadGroup        = nsnull;

  // Release owning refs
  mStderrConsole    = nsnull;
  mHeaderProcessor  = nsnull;

  // Release refs to objects that hold strong refs to this
  mStdoutPoller = nsnull;

  // Clear buffer
  mExecBuf.Assign("");

  return rv;
}

NS_IMETHODIMP
nsPipeTransport::Kill(void)
{
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  if ((mProcess == IPC_NULL_HANDLE) || (mStartupFlags & PROCESS_DETACHED))
    return NS_OK;

  // Process cleanup

  if ((mStdinWrite != IPC_NULL_HANDLE) &&
      mKillString.get() && (strlen(mKillString.get()) > 0)) {
    // Transmit kill string to process
    PRInt32 writeCount;
    writeCount = IPC_Write(mStdinWrite, mKillString.get(),
                           strlen(mKillString.get()));

    if (writeCount != (int) strlen(mKillString.get())) {
      WARNING_LOG(("Kill: Failed to send kill string\n"));
    }

    // Wait a few milliseconds for cleanup
    PR_Sleep(mKillWaitInterval);
  }

  // Close our end of STDIN pipe, if open
  CloseStdin();

  PRStatus status;
  // Kill process
  status = IPC_KillProcess(mProcess);

  if (status != PR_SUCCESS)
    DEBUG_LOG(("nsPipeTransport::Kill: Failed to kill process\n"));
  else
    DEBUG_LOG(("nsPipeTransport::Kill: Killed process\n"));


  // Reap process (to avoid memory leaks in NSPR)
  // **NOTE** This could cause this (UI?) thread to hang
  status = IPC_WaitProcess(mProcess, &mExitCode);

  if (status != PR_SUCCESS)
    WARNING_LOG(("nsPipeTransport::Kill: Failed to reap process\n"));

  mProcess = IPC_NULL_HANDLE;

  return status;
}

NS_IMETHODIMP
nsPipeTransport::GetHeaderProcessor(nsIPipeTransportHeaders* *_retval)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  NS_IF_ADDREF(*_retval = mHeaderProcessor.get());

  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::SetHeaderProcessor(nsIPipeTransportHeaders* aHeaderProcessor)
{
  DEBUG_LOG(("nsPipeTransport::SetHeaderProcessor: \n"));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  mHeaderProcessor = aHeaderProcessor;
  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::GetStderrConsole(nsIPipeListener* *_retval)
{
  DEBUG_LOG(("nsPipeTransport::GetStderrConsole: \n"));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  NS_IF_ADDREF(*_retval = mStderrConsole.get());

  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::GetIsRunning(PRBool* attached)
{
  DEBUG_LOG(("nsPipeTransport::GetIsRunning: \n"));

  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsresult rv;

  if (mStdoutPoller) {
    PRBool interrupted;
    rv = mStdoutPoller->IsInterrupted(&interrupted);
    NS_ENSURE_SUCCESS(rv, rv);

    *attached = !interrupted;

  } else {
    *attached = PR_FALSE;
  }

  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::Join()
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsresult rv;
  DEBUG_LOG(("nsPipeTransport::Join: \n"));

  if (!mNoProxy)
    return NS_ERROR_FAILURE;

  // Close STDIN, if open
  CloseStdin();

  if (mStdoutPoller) {
    rv = mStdoutPoller->Join();
    NS_ENSURE_SUCCESS(rv, rv);
    mStdoutPoller = nsnull;
  }

  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::Terminate()
{
  DEBUG_LOG(("nsPipeTransport::Terminate: \n"));

  // no check to mInitialized or mFinalized on purpose

  // Clean up, killing process if need be
  return Finalize(PR_FALSE);
}

NS_IMETHODIMP
nsPipeTransport::GetPid(PRUint32* _retval)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  if (mProcess == IPC_NULL_HANDLE)
    return NS_ERROR_NOT_AVAILABLE;

  if (mPid < 0) // OS doesn't support PIDs
    return NS_ERROR_NOT_IMPLEMENTED;

  *_retval = mPid;
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::GetExitValue(PRInt32* _retval)
{
  DEBUG_LOG(("nsPipeTransport::ExitCode: \n"));

  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsresult rv;

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  if (mStdoutPoller) {
    // Fail if poller has not been interrupted
    PRBool interrupted;
    rv = mStdoutPoller->IsInterrupted(&interrupted);
    if (NS_FAILED(rv))
      DEBUG_LOG(("interrupted returned failure\n"));
    NS_ENSURE_SUCCESS(rv, rv);

    if (!interrupted)
      return NS_ERROR_ABORT;
  }

  // Kill process, if need be
  // (Needed for synchronous reads where StopRequest is not called)
  Kill();

  *_retval = mExitCode;

  DEBUG_LOG(("nsPipeTransport::ExitCode: exit code = %d\n", mExitCode));

  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::GetBufferSegmentSize(PRUint32 *aBufferSegmentSize)
{
  DEBUG_LOG(("nsPipeTransport::GetBufferSegmentSize: \n"));
  *aBufferSegmentSize = mBufferSegmentSize;
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::SetBufferSegmentSize(PRUint32 aBufferSegmentSize)
{
  DEBUG_LOG(("nsPipeTransport::SetBufferSegmentSize: \n"));
  mBufferSegmentSize = aBufferSegmentSize;
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::GetBufferMaxSize(PRUint32 *aBufferMaxSize)
{
  DEBUG_LOG(("nsPipeTransport::GetBufferMaxSize: \n"));
  *aBufferMaxSize = mBufferMaxSize;
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::SetBufferMaxSize(PRUint32 aBufferMaxSize)
{
  DEBUG_LOG(("nsPipeTransport::SetBufferMaxSize: \n"));
  mBufferMaxSize = aBufferMaxSize;
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::GetHeadersMaxSize(PRUint32 *aHeadersMaxSize)
{
  DEBUG_LOG(("nsPipeTransport::GetHeadersMaxSize: \n"));
  *aHeadersMaxSize = mHeadersMaxSize;
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::SetHeadersMaxSize(PRUint32 aHeadersMaxSize)
{
  DEBUG_LOG(("nsPipeTransport::SetHeadersMaxSize: \n"));
  mHeadersMaxSize = aHeadersMaxSize;
  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::GetLoggingEnabled(PRBool *aLoggingEnabled)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);
  NS_ENSURE_TRUE(mStdoutPoller, NS_ERROR_NOT_INITIALIZED);

  return mStdoutPoller->GetLoggingEnabled(aLoggingEnabled);
}

NS_IMETHODIMP
nsPipeTransport::SetLoggingEnabled(PRBool aLoggingEnabled)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);
  NS_ENSURE_TRUE(mStdoutPoller, NS_ERROR_NOT_INITIALIZED);

  return mStdoutPoller->SetLoggingEnabled(aLoggingEnabled);
}

#ifndef _IPC_FORCE_INTERNAL_API
nsresult
NS_NewPipe(nsIInputStream **pipeIn,
           nsIOutputStream **pipeOut,
           PRUint32 segmentSize,
           PRUint32 maxSize,
           PRBool nonBlockingInput,
           PRBool nonBlockingOutput,
           nsIMemory *segmentAlloc)
{
  if (segmentSize == 0)
      segmentSize = 4096;

  // Handle maxSize of PR_UINT32_MAX as a special case
  PRUint32 segmentCount;
  if (maxSize == PR_UINT32_MAX)
    segmentCount = PR_UINT32_MAX;
  else
    segmentCount = maxSize / segmentSize;

  nsIAsyncInputStream *in;
  nsIAsyncOutputStream *out;
  nsresult rv = NS_NewPipe2(&in, &out, nonBlockingInput, nonBlockingOutput,
                            segmentSize, segmentCount, segmentAlloc);
  if (NS_FAILED(rv)) return rv;

  *pipeIn = in;
  *pipeOut = out;
  return NS_OK;
}

nsresult
NS_NewPipe2(nsIAsyncInputStream **pipeIn,
            nsIAsyncOutputStream **pipeOut,
            PRBool nonBlockingInput,
            PRBool nonBlockingOutput,
            PRUint32 segmentSize,
            PRUint32 segmentCount,
            nsIMemory *segmentAlloc)
{
  nsresult rv;


  nsCOMPtr<nsIPipe> pipe =
    do_CreateInstance("@mozilla.org/pipe;1", &rv);
  NS_ENSURE_SUCCESS(rv, rv);

  if (!pipe)
      return NS_ERROR_OUT_OF_MEMORY;

  rv = pipe->Init(nonBlockingInput,
                  nonBlockingOutput,
                  segmentSize,
                  segmentCount,
                  segmentAlloc);
  if (NS_FAILED(rv)) {
    NS_ADDREF(pipe);
    NS_RELEASE(pipe);
    NS_ENSURE_SUCCESS(rv, rv);
  }

  pipe->GetInputStream(pipeIn);
  pipe->GetOutputStream(pipeOut);

  return NS_OK;
}
#endif

NS_IMETHODIMP
nsPipeTransport::OpenInputStream(PRUint32 offset,
                                 PRUint32 count,
                                 PRUint32 flags,
                                 nsIInputStream **result)
{
  DEBUG_LOG(("nsPipeTransport::OpenInputStream: \n"));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);

  nsresult rv = NS_OK;

  if (mPipeState != PIPE_OPEN)
    return NS_ERROR_NOT_INITIALIZED;

  // Check if Stdout stream has already been opened
  if (mStdoutStream != STREAM_NOT_YET_OPENED)
    return NS_ERROR_NOT_AVAILABLE;

  mStdoutStream = STREAM_SYNC_OPEN;

  // Blocking input
  PRBool nonBlockingInput = PR_FALSE;

  // Blocking output
  PRBool nonBlockingOutput = PR_FALSE;

  // Open pipe to handle STDOUT
  rv = NS_NewPipe(getter_AddRefs(mInputStream),
                  getter_AddRefs(mOutputStream),
                  mBufferSegmentSize, mBufferMaxSize,
                  nonBlockingInput, nonBlockingOutput);
  NS_ENSURE_SUCCESS(rv, rv);

  // Spin up a new thread to handle STDOUT polling
  rv = mStdoutPoller->AsyncStart(mOutputStream, nsnull, PR_FALSE, 0);
  NS_ENSURE_SUCCESS(rv, rv);

  NS_ADDREF(*result = mInputStream);

  return rv;
}

NS_IMETHODIMP
nsPipeTransport::OpenOutputStream(PRUint32 offset,
                                  PRUint32 count,
                                  PRUint32 flags,
                                  nsIOutputStream **result)
{
  DEBUG_LOG(("nsPipeTransport::OpenOutputStream: \n"));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);

  if (mPipeState != PIPE_OPEN)
    return NS_ERROR_NOT_INITIALIZED;

  NS_ADDREF(*result = this);
  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::GetListener(nsIStreamListener **result)
{
  DEBUG_LOG(("nsPipeTransport::GetListener: \n"));
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);

  if (mPipeState != PIPE_OPEN)
    return NS_ERROR_NOT_INITIALIZED;

  NS_ADDREF(*result = this);
  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::AsyncRead(nsIStreamListener *listener,
                           nsISupports *ctxt,
                           PRUint32 offset,
                           PRUint32 count,
                           PRUint32 flags,
                           nsIRequest **_retval)
{
  nsresult rv;

  DEBUG_LOG(("nsPipeTransport::AsyncRead:\n"));
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);


  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  if (mPipeState != PIPE_OPEN)
    return NS_ERROR_NOT_INITIALIZED;

  // Check if Stdout stream has already been opened
  if (mStdoutStream != STREAM_NOT_YET_OPENED)
    return NS_ERROR_NOT_AVAILABLE;

  mStdoutStream = STREAM_ASYNC_OPEN;

  nsCOMPtr<nsIPipeTransportListener> pipeListener (nsnull);

  if (listener) {
    // Initialize listening interface
    rv = IPC_GET_THREAD(mCreatorThread);
    if (NS_FAILED(rv)) return NS_ERROR_FAILURE;

    mListener = listener;
    mContext  = ctxt;

    // Non-blocking input stream
    PRBool nonBlockingInput = PR_TRUE;

    // Always block output
    PRBool nonBlockingOutput = PR_FALSE;

    // Now generate proxied pipe observer/listener to enable async calling
    // from the polling thread to the current (UI?) thread
    nsCOMPtr<nsIProxyObjectManager> proxyMgr =
                              do_GetService(NS_XPCOMPROXY_CONTRACTID, &rv);
    NS_ENSURE_SUCCESS(rv, rv);

    // Open pipe to handle STDOUT
    nsCOMPtr<nsIAsyncInputStream> asyncInputStream;
    nsCOMPtr<nsIAsyncOutputStream> asyncOutputStream;

    rv = NS_NewPipe2(getter_AddRefs(asyncInputStream),
                     getter_AddRefs(asyncOutputStream),
                     nonBlockingInput, nonBlockingOutput);
    NS_ENSURE_SUCCESS(rv, rv);

    mInputStream = asyncInputStream;
    mOutputStream = asyncOutputStream;

    nsCOMPtr<nsIThread> eventQ;

    if (!mNoProxy) {
      rv = NS_GetCurrentThread(getter_AddRefs(eventQ));
      NS_ENSURE_SUCCESS(rv, rv);
    }

    // Set input stream observer (using event queue, if need be)
    rv = asyncInputStream->AsyncWait((nsIInputStreamCallback*) this,
                                      0, 0, eventQ);
    NS_ENSURE_SUCCESS(rv, rv);

    if (mNoProxy) {
      pipeListener = this;

    } else {
      nsIPipeTransportListener* temListener = this;
      rv = proxyMgr->GetProxyForObject(NS_PROXY_TO_CURRENT_THREAD, //current thread
                                       NS_GET_IID(nsIPipeTransportListener),
                                       temListener,
                                       NS_PROXY_SYNC | NS_PROXY_ALWAYS,
                                       getter_AddRefs(pipeListener));
      NS_ENSURE_SUCCESS(rv, rv);
    }
  }

  // Spin up a new thread to handle STDOUT polling
  PRUint32 mimeHeadersMaxSize = mHeaderProcessor ? mHeadersMaxSize : 0;
  rv = mStdoutPoller->AsyncStart(mOutputStream, pipeListener,
                                 (mNoProxy),
                                 mimeHeadersMaxSize);
  NS_ENSURE_SUCCESS(rv, rv);

  NS_ADDREF(*_retval = this);
  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::WriteSync(const char *buf, PRUint32 count)
{
  DEBUG_LOG(("nsPipeTransport::WriteSync: %d\n", count));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_ARG(buf);

  nsresult rv;
  PRUint32 writeCount;
  rv = Write(buf, count, &writeCount);
  NS_ENSURE_SUCCESS(rv, rv);

  if (writeCount != count) {
      DEBUG_LOG(("nsPipeTransport::WriteSync: written %d instead of %d bytes\n",
        writeCount, count));
    return NS_ERROR_FAILURE;
  }

  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::CloseStdin(void)
{
  DEBUG_LOG(("nsPipeTransport::CloseStdin: \n"));
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);

  // Close STDIN write pipe
  // NOTE: This will prevent any kill string from being transmitted

  if (mStdinWrite != IPC_NULL_HANDLE)
    IPC_Close(mStdinWrite);

  mStdinWrite = IPC_NULL_HANDLE;

  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::WriteAsync(nsIInputStream *inStr, PRUint32 count,
                            PRBool closeAfterWrite)
{
  DEBUG_LOG(("nsPipeTransport::WriteAsync: %d\n", count));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);

  if (mPipeState != PIPE_OPEN) {
    if (mPipeState == PIPE_NOT_YET_OPENED)
      return NS_ERROR_NOT_INITIALIZED;

    if (mPipeState == PIPE_CLOSED)
      return NS_BASE_STREAM_CLOSED;

    return NS_ERROR_FAILURE;
  }

  if (mStdinWrite == IPC_NULL_HANDLE)
    return NS_BASE_STREAM_CLOSED;

  // Create stdin writing helper class
  nsStdinWriter* stdinWriter = new nsStdinWriter();
  if (!stdinWriter)
    return NS_ERROR_OUT_OF_MEMORY;

  mPipeTransportWriter = stdinWriter;

  nsresult rv;
  rv = mPipeTransportWriter->WriteFromStream(inStr, count, mStdinWrite,
                                            closeAfterWrite);

  if (closeAfterWrite) {
    mStdinWrite = IPC_NULL_HANDLE;  // Different thread will close STDIN
  }

  return rv;
}

// Read the next line
NS_IMETHODIMP
nsPipeTransport::ReadLine(PRInt32 maxOutputLen,
                            char* *_retval)
{
  nsresult rv;

  DEBUG_LOG(("nsPipeTransport::ReadLine: maxOutputLen=%d\n", maxOutputLen));

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  NS_ENSURE_TRUE(maxOutputLen != 0, NS_ERROR_INVALID_ARG);

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  if (!mInputStream) {
    nsCOMPtr<nsIInputStream> inputStream;
    rv = OpenInputStream(0, PRUint32(-1), 0, getter_AddRefs(inputStream));
    NS_ENSURE_SUCCESS(rv, rv);
  }

  NS_ABORT_IF_FALSE(mInputStream,
    "Why didn't OpenInputStream set mInputStream?");

  if (mStdoutStream != STREAM_SYNC_OPEN)
    return NS_ERROR_NOT_AVAILABLE;

  PRInt32 retCount = -1;

  char buf[kCharMax];
  PRUint32 readCount, readMax;

  PRUint32 remainingCount = (maxOutputLen > 0) ? maxOutputLen : kCharMax;

  if (! mExecBuf.IsEmpty()) {

    // Replace all \r\n and \r with \n

    PRInt32 lineIndex = 0;

    while (lineIndex != -1) {
      lineIndex = mExecBuf.Find("\r\n");
      if (lineIndex != -1)
        mExecBuf.Replace(lineIndex, 2, "\n", 1);
    }

    lineIndex = 0;
    while (lineIndex != -1) {
      lineIndex = mExecBuf.Find("\r");
      if (lineIndex != -1) {
        mExecBuf.Replace(lineIndex, 1, "\n", 1);
      }
    }

    retCount = mExecBuf.Find("\n");

    DEBUG_LOG(("nsPipeTransport::ReadLine: retCount=%d\n", retCount));
  }

  if (retCount < 0) {
    while (remainingCount > 0) {
      readMax = (remainingCount < kCharMax) ? remainingCount : kCharMax;

      PRBool interrupted = PR_FALSE;

      if (mStdoutPoller) {
        // Fail if poller has been interrupted and no more data in buffer
        rv = mStdoutPoller->IsInterrupted(&interrupted);
        NS_ENSURE_SUCCESS(rv, rv);

        if (interrupted && mExecBuf.IsEmpty())
          return NS_BASE_STREAM_CLOSED;
      }

      if (! interrupted) {
        rv = mInputStream->Read((char *) buf, kCharMax, &readCount);
        NS_ENSURE_SUCCESS(rv, rv);

        if (readCount < 0)
          return NS_ERROR_FAILURE;

        if (readCount == 0)
          break;             // End-of-file

        mExecBuf.Append(buf, readCount);
      }

      if (! mExecBuf.IsEmpty()) {
        PRInt32 lineIndex = 0;

        while (lineIndex != -1) {
          lineIndex = mExecBuf.Find("\r\n");
          if (lineIndex != -1) {
            mExecBuf.Replace(lineIndex, 2, "\n", 1);
          }
        }

        lineIndex = 0;
        while (lineIndex != -1) {
          lineIndex = mExecBuf.Find("\r");
          if (lineIndex != -1) {
            mExecBuf.Replace(lineIndex, 1, "\n", 1);
          }
        }

        retCount = mExecBuf.Find("\n");

        if (retCount >= 0 || interrupted) {
          break;
        }
      }

      if (maxOutputLen > 0) {
        // Limited read
        remainingCount -= readCount;
      } else {
        // Unlimited read
        remainingCount = kCharMax;
      }
    }
  }
  if (retCount < 0)
    retCount = mExecBuf.Length();  // Return everything

  if (maxOutputLen > 0 && retCount > maxOutputLen) retCount = maxOutputLen;

  // Duplicate output string and return it
  nsCAutoString outStr("");
  if (retCount > 0)
    outStr = Substring(mExecBuf, 0, retCount);

  if (retCount >= 0) {
    if (mExecBuf.Find("\n") == retCount)
      ++retCount;  // cut next \n character

    mExecBuf.Cut(0, retCount);
  }

  *_retval = PL_strdup(outStr.get());

  if (!*_retval)
    return NS_ERROR_OUT_OF_MEMORY;

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIRequest methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::GetName(nsACString &result)
{
  DEBUG_LOG(("nsPipeTransport::GetName: \n"));
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  if (!mCommand.IsEmpty()) {
    result = mCommand;
  } else {
    result = ToNewUTF8String(mExecutable);
  }

  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::IsPending(PRBool *result)
{

  DEBUG_LOG(("nsPipeTransport::IsPending: \n"));
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  *result = (mCancelStatus == NS_OK);
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::GetStatus(nsresult *status)
{

  DEBUG_LOG(("nsPipeTransport::GetStatus: \n"));
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  *status = mCancelStatus;
  return NS_OK;
}

// NOTE: We assume that OnStopRequest should not be called if
// request is canceled. This may be wrong!
NS_IMETHODIMP
nsPipeTransport::Cancel(nsresult status)
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsPipeTransport::Cancel, myThread=%p, status=%p\n",
         myThread.get(), status));
#endif

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  // Need a non-zero status code to cancel
  if (status == NS_OK)
    return NS_ERROR_FAILURE;

  if (mCancelStatus == NS_OK)
    mCancelStatus = status;

  StopRequest(status);

  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::Suspend(void)
{
  DEBUG_LOG(("nsPipeTransport::Suspend: \n"));
  return NS_ERROR_NOT_IMPLEMENTED;
}


NS_IMETHODIMP
nsPipeTransport::Resume(void)
{
  DEBUG_LOG(("nsPipeTransport::Resume: \n"));
  return NS_ERROR_NOT_IMPLEMENTED;
}


NS_IMETHODIMP
nsPipeTransport::GetLoadGroup(nsILoadGroup * *aLoadGroup)
{

  DEBUG_LOG(("nsPipeTransport::GetLoadGroup: \n"));
  NS_IF_ADDREF(*aLoadGroup = mLoadGroup);
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::SetLoadGroup(nsILoadGroup* aLoadGroup)
{

  DEBUG_LOG(("nsPipeTransport::SetLoadGroup: \n"));
  mLoadGroup = aLoadGroup;
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::GetLoadFlags(nsLoadFlags *aLoadFlags)
{

  DEBUG_LOG(("nsPipeTransport::GetLoadFlags: \n"));
  *aLoadFlags = mLoadFlags;
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::SetLoadFlags(nsLoadFlags aLoadFlags)
{

  DEBUG_LOG(("nsPipeTransport::SetLoadFlags: \n"));
  mLoadFlags = aLoadFlags;
  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIOutputStream methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::Close(void)
{
  DEBUG_LOG(("nsPipeTransport::Close: \n"));

  return CloseStdin();
}

NS_IMETHODIMP
nsPipeTransport::Write(const char *buf, PRUint32 count, PRUint32 *_retval)
{
  DEBUG_LOG(("nsPipeTransport::Write: %d\n", count));
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  *_retval = 0;

  if (mPipeState != PIPE_OPEN) {
    if (mPipeState == PIPE_NOT_YET_OPENED)
      return NS_ERROR_NOT_INITIALIZED;

    if (mPipeState == PIPE_CLOSED)
      return NS_BASE_STREAM_CLOSED;

    return NS_ERROR_FAILURE;
  }

  if (mStdinWrite == IPC_NULL_HANDLE)
    return NS_BASE_STREAM_CLOSED;

  if (count == 0) {
    return NS_OK;
  }

  // Write data
  PRInt32 writeCount = 0;
  writeCount = IPC_Write(mStdinWrite, buf, count);

  if (writeCount != (PRInt32) count) {
    PRErrorCode errCode = IPC_GetError();
    DEBUG_LOG(("nsPipeTransport::Write: Error in writing to fd %p (count=%d, writeCount=%d, error code=%d)\n",
               mStdinWrite, count, writeCount, errCode));
  }

  if (writeCount < 0)
    return NS_ERROR_FAILURE;

  *_retval = writeCount;
  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::Flush(void)
{
  // Do nothing
  DEBUG_LOG(("nsPipeTransport::Flush: \n"));
  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::WriteFrom(nsIInputStream *inStr, PRUint32 count,
                           PRUint32 *_retval)
{
  return NS_ERROR_NOT_IMPLEMENTED;
}

NS_IMETHODIMP
nsPipeTransport::WriteSegments(nsReadSegmentFun reader, void * closure,
                               PRUint32 count, PRUint32 *_retval)
{
  return NS_ERROR_NOT_IMPLEMENTED;
}

NS_IMETHODIMP
nsPipeTransport::IsNonBlocking(PRBool *result)
{
  DEBUG_LOG(("nsPipeTransport::IsNonBlocking: \n"));
  *result = PR_TRUE;
  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIRequestObserver methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::OnStartRequest(nsIRequest *aRequest, nsISupports *aContext)
{
  DEBUG_LOG(("nsPipeTransport::OnStartRequest:\n"));


  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::OnStopRequest(nsIRequest* aRequest, nsISupports* aContext,
                               nsresult aStatus)
{
  DEBUG_LOG(("nsPipeTransport::OnStopRequest:\n"));

  // Close STDIN, if open
  CloseStdin();

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIStreamListener method
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::OnDataAvailable(nsIRequest* aRequest, nsISupports* aContext,
                                 nsIInputStream *aInputStream,
                                 PRUint32 aSourceOffset,
                                 PRUint32 aLength)
{
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  NS_ENSURE_ARG(aInputStream);

  DEBUG_LOG(("nsPipeTransport::OnDataAVailable: %d\n", aLength));

  nsresult rv = NS_OK;

  char buf[kCharMax];
  PRUint32 readCount, readMax;

  while (aLength > 0) {
    readMax = (aLength < kCharMax) ? aLength : kCharMax;
    rv = aInputStream->Read((char *) buf, readMax, &readCount);
    if (NS_FAILED(rv)) {
      DEBUG_LOG(("nsPipeTransport::OnDataAvailable: Error in reading from input stream, %p\n",
        rv));
      return rv;
    }

    if (readCount <= 0) return NS_OK;

    rv = WriteSync(buf, readCount);
    NS_ENSURE_SUCCESS(rv, rv);

    aLength -= readCount;
  }

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIInputStreamCallback methods:
// (Should be invoked in the thread creating nsIPipeTransport object,
//  unless mNoProxy is true.)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::OnInputStreamReady(nsIAsyncInputStream* inStr)
{
  nsresult rv;

#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsPipeTransport::OnInputStreamReady, myThread=%p\n",
    myThread.get()));
#endif

  NS_ENSURE_ARG(inStr);

  if (mListener) {
    if (!mInputStream || !mCreatorThread)
      return NS_ERROR_NOT_INITIALIZED;

    PRUint32 available;
    rv = mInputStream->Available(&available);
    if (rv != NS_OK) {
      DEBUG_LOG(("nsPipeTransport::OnInputStreamReady: no data available\n"));
      return rv;
    }

    DEBUG_LOG(("nsPipeTransport::OnInputStreamReady: available=%d\n",
               available));

    nsRefPtr<nsStreamDispatcher> streamDispatch = new nsStreamDispatcher();
    if (!streamDispatch) return NS_ERROR_OUT_OF_MEMORY;
    rv = streamDispatch->Init(mListener, mContext, (nsIRequest*) this);
    NS_ENSURE_SUCCESS(rv, rv);

    rv = streamDispatch->DispatchOnDataAvailable(mInputStream, 0, available);
    NS_ENSURE_SUCCESS(rv, rv);

    rv = mCreatorThread->Dispatch(streamDispatch,
      nsIEventTarget::DISPATCH_SYNC);
    NS_ENSURE_SUCCESS(rv, rv);

    nsCOMPtr<nsIThread> eventQ;

    if (!mNoProxy) {
      rv = NS_GetCurrentThread(getter_AddRefs(eventQ));
      NS_ENSURE_SUCCESS(rv, rv);
    }

    // Re-set input stream observer (using event queue, if need be)
    rv = inStr->AsyncWait((nsIInputStreamCallback*) this, 0, 0, eventQ);
    NS_ENSURE_SUCCESS(rv, rv);

    return rv;
  }

  return NS_OK;
}

NS_IMETHODIMP nsPipeTransport::Run(PRBool blocking, const char **args,
                                    PRUint32 argCount)
{
  return NS_ERROR_NOT_IMPLEMENTED;
}

NS_IMETHODIMP nsPipeTransport::RunAsync(const char **args,
                                    PRUint32 argCount,
                                    nsIObserver* observer,
                                    PRBool holdWeak)
{
  return NS_ERROR_NOT_IMPLEMENTED;
}

NS_IMETHODIMP nsPipeTransport::Runw(PRBool blocking, const PRUnichar **args,
                                    PRUint32 argCount)
{
  return NS_ERROR_NOT_IMPLEMENTED;
}

NS_IMETHODIMP nsPipeTransport::RunwAsync(const PRUnichar **args,
                                    PRUint32 argCount,
                                    nsIObserver* observer,
                                    PRBool holdWeak)
{
  return NS_ERROR_NOT_IMPLEMENTED;
}

///////////////////////////////////////////////////////////////////////////////
// nsIOutputStreamCallback methods:
// (Should be invoked in the thread creating nsIPipeTransport object)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::OnOutputStreamReady(nsIAsyncOutputStream* outStr)
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsPipeTransport::OnOutputStreamReady, myThread=%p\n",
    myThread.get()));
#endif

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIPipeTransportHeaders methods:
// (Should be invoked in the thread creating nsIPipeTransport object)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::ParseMimeHeaders(const char* mimeHeaders, PRUint32 count,
                                  PRInt32 *retval)
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsPipeTransport::ParseMimeHeaders, myThread=%p\n",
    myThread.get()));
#endif

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);


  if (mHeaderProcessor)
    return mHeaderProcessor->ParseMimeHeaders(mimeHeaders, count, retval);

  return NS_ERROR_FAILURE;
}

///////////////////////////////////////////////////////////////////////////////
// nsIPipeTransportListener methods:
// (Should be invoked in the thread creating nsIPipeTransport object,
//  unless mNoProxy is true.)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::StartRequest()
{
  nsresult rv;
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsPipeTransport::StartRequest, myThread=%p\n",myThread.get()));
#endif

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  if (mListener) {
    // Starting processing of async output

    if (! mCreatorThread) return NS_ERROR_NOT_INITIALIZED;

    nsRefPtr<nsStreamDispatcher> streamDispatch = new nsStreamDispatcher();
    if (!streamDispatch) return NS_ERROR_OUT_OF_MEMORY;

    rv = streamDispatch->Init(mListener, mContext, (nsIRequest*) this);
    NS_ENSURE_SUCCESS(rv, rv);

    rv = streamDispatch->DispatchOnStartRequest();
    NS_ENSURE_SUCCESS(rv, rv);

    rv = mCreatorThread->Dispatch(streamDispatch,
      nsIEventTarget::DISPATCH_SYNC);
    NS_ENSURE_SUCCESS(rv, rv);

    mStartedRequest = PR_TRUE;
  }

  return NS_OK;
}

// aStatus == NS_OK for normal termination of request (called by StdoutPoller)
// aStatus != NS_OK for cancellation of request (called by Cancel)
// When invoking this method from the polling thread via a proxy, ensure that
// the UI thread is not blocked for synchronous read by closing the pipe.
NS_IMETHODIMP
nsPipeTransport::StopRequest(nsresult aStatus)
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsPipeTransport::StopRequest, myThread=%p, status=%p\n",
         myThread.get(), aStatus));
#endif

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  // NOTE: Should OnStopRequest be called if request is being cancelled?
  // We are assuming here that it does not need to be.
  // If this assumption is wrong, then there is a problem when saving
  // downloaded files using xpfe/components/xfer/src/nsStreamXferOp:
  // Canceling a download in progress calls nsStreamXferOp::OnStopRequest
  // followed by nsStreamXferOp::Stop, causing the BufferedOutputStream
  // to be closed each time, and causing nsBufferedOutputStream::Flush
  // to segfault on the second close.

  nsresult rv = NS_OK;

  if (mStartedRequest && mListener && (mCancelStatus == NS_OK) &&
      (aStatus == NS_OK)) {

    if (! mCreatorThread) return NS_ERROR_NOT_INITIALIZED;

    mStartedRequest = PR_FALSE;
    mCancelStatus = NS_BINDING_ABORTED;

    nsRefPtr<nsStreamDispatcher> streamDispatch = new nsStreamDispatcher();
    if (!streamDispatch) return NS_ERROR_OUT_OF_MEMORY;

    rv = streamDispatch->Init(mListener, mContext, (nsIRequest*) this);
    NS_ENSURE_SUCCESS(rv, rv);

    rv = streamDispatch->DispatchOnStopRequest(aStatus);
    NS_ENSURE_SUCCESS(rv, rv);

    rv = mCreatorThread->Dispatch(streamDispatch,
      nsIEventTarget::DISPATCH_SYNC);
  }

  if (!mNoProxy)
    Finalize(PR_FALSE);

  return rv;
}

///////////////////////////////////////////////////////////////////////////////

// nsStdoutPoller implementation

// nsISupports implementation
NS_IMPL_THREADSAFE_ISUPPORTS1 (nsStdoutPoller,
                               nsIRunnable)


// nsStdoutPoller implementation
nsStdoutPoller::nsStdoutPoller() :
    mInitialized(PR_FALSE),
    mFinalized(PR_FALSE),
    mLock("nsPipeTransport.lock"),
    mInterrupted(PR_FALSE),
    mLoggingEnabled(PR_FALSE),
    mJoinableThread(PR_FALSE),

    mHeadersBuf(""),
    mHeadersBufSize(0),
    mHeadersLastNewline(0),
    mRequestStarted(PR_FALSE),
    mContentLength(-1),

    mStdoutRead(IPC_NULL_HANDLE),
    mStderrRead(IPC_NULL_HANDLE),

    mPollCount(0),
    mPollableEvent(nsnull),
    mPollFD(nsnull)
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsStdoutPoller:: <<<<<<<<< CTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

}


nsStdoutPoller::~nsStdoutPoller()
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsStdoutPoller:: >>>>>>>>> DTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

  nsresult rv;

  if (mStdoutThread) {
    rv = mStdoutThread->Shutdown();
    DEBUG_LOG(("nsStdoutPoller::destructor: stdout shutdown: %d\n", rv));
    mStdoutThread = nsnull;
  }

  Finalize(PR_TRUE);

  // Free non-owning references/resources
  if (mPollableEvent)
    PR_DestroyPollableEvent(mPollableEvent);

  if (mStdoutRead != IPC_NULL_HANDLE) {
    IPC_Close(mStdoutRead);
    mStdoutRead = IPC_NULL_HANDLE;
  }

  if (mStderrRead != IPC_NULL_HANDLE) {
    IPC_Close(mStderrRead);
    mStderrRead = IPC_NULL_HANDLE;
  }

  if (mPollFD) {
    PR_Free(mPollFD);
    mPollFD = nsnull;
  }

  // Clear header buffer
  mHeadersBuf.Assign("");
}


///////////////////////////////////////////////////////////////////////////////
// nsStdoutPoller methods:
///////////////////////////////////////////////////////////////////////////////

nsresult
nsStdoutPoller::Init(IPCFileDesc*            aStdoutRead,
                     IPCFileDesc*            aStderrRead,
                     PRIntervalTime          aTimeoutInterval,
                     nsIPipeListener*        aConsole)
{
  // Should be invoked in the thread creating nsIPipeTransport object
  // Should be closed only in the polling thread

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_FALSE(mInitialized, NS_ERROR_ALREADY_INITIALIZED);

  mStdoutRead = aStdoutRead;
  mStderrRead = aStderrRead;

  mTimeoutInterval  = aTimeoutInterval;
  mConsole = aConsole;

  // Initialize polling structure
  mPollCount = 1;

#ifndef XP_WIN
  // Note: No polling for Win32
#ifdef USE_POLLING
  // Use pollable event to interrupt thread
  mPollableEvent = PR_NewPollableEvent();
  mPollCount ++;
#endif
#endif

  if (mStderrRead != IPC_NULL_HANDLE)
    mPollCount ++;

  mPollFD = (PRPollDesc*) PR_Malloc(sizeof(PRPollDesc)*mPollCount);
  if (!mPollFD)
    return NS_ERROR_OUT_OF_MEMORY;
  memset(mPollFD, 0, sizeof(PRPollDesc)*mPollCount);

#ifndef XP_WIN
  // Note: No polling for Win32
  if (mPollableEvent) {
    // Read pollable event before all others
    mPollFD[0].fd        = mPollableEvent;
    mPollFD[0].in_flags  = PR_POLL_READ;
    mPollFD[0].out_flags = 0;
  }

  if (mStderrRead != IPC_NULL_HANDLE) {
    // Read STDERR before STDOUT (is this always a good idea?)
    mPollFD[mPollCount-2].fd        = mStderrRead;
    mPollFD[mPollCount-2].in_flags  = PR_POLL_READ | PR_POLL_EXCEPT;
    mPollFD[mPollCount-2].out_flags = 0;
  }

  // Read STDOUT
  mPollFD[mPollCount-1].fd        = mStdoutRead;
  mPollFD[mPollCount-1].in_flags  = PR_POLL_READ | PR_POLL_EXCEPT;
  mPollFD[mPollCount-1].out_flags = 0;
#endif

  mInitialized = PR_TRUE;

  return NS_OK;
}


NS_IMETHODIMP
nsStdoutPoller::AsyncStart(nsIOutputStream*  aOutputStream,
                           nsIPipeTransportListener* aProxyPipeListener,
                           PRBool joinable,
                           PRUint32 aMimeHeadersMaxSize)
{
  // Should be invoked in the thread creating nsIPipeTransport object

  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  nsresult rv = NS_OK;

  DEBUG_LOG(("nsStdoutPoller::AsyncStart: %d / %d\n", aMimeHeadersMaxSize,
    joinable));

  mJoinableThread    = joinable;
  mHeadersBufSize    = aMimeHeadersMaxSize;

  mOutputStream      = aOutputStream;
  mProxyPipeListener = aProxyPipeListener;

  // Spin up a new thread to handle STDOUT polling (non-joinable)
  nsCOMPtr<nsIThread> stdoutThread;
  rv = NS_NewThread(getter_AddRefs(stdoutThread), (nsIRunnable*) this);
  NS_ENSURE_SUCCESS(rv, rv);

  mStdoutThread = stdoutThread;

  return rv;
}

nsresult
nsStdoutPoller::Finalize(PRBool destructor)
{
  nsresult rv = NS_OK;

  if (mFinalized)
    return NS_OK;

  mFinalized = PR_TRUE;

  {
    MutexAutoLock lock(mLock);
    // Set thread interrupted flag to avoid race conditions
    // when freeing mStdoutThread/mPollableEvent
    mInterrupted = PR_TRUE;
  }

  DEBUG_LOG(("nsStdoutPoller::Finalize:\n"));

  nsCOMPtr<nsIRunnable> self;
  if (!destructor) {
    // Hold a reference to ourselves to prevent our DTOR from being called
    // while finalizing. Automatically released upon returning.
    self = this;
  }

  // Release refs to input arguments
  mOutputStream = nsnull;
  mProxyPipeListener = nsnull;
  mConsole = nsnull;

  return rv;
}


NS_IMETHODIMP
nsStdoutPoller::GetLoggingEnabled(PRBool *aLoggingEnabled)
{
  MutexAutoLock lock(mLock);

  DEBUG_LOG(("nsStdoutPoller::GetLoggingEnabled: \n"));
  *aLoggingEnabled = mLoggingEnabled;
  return NS_OK;
}

NS_IMETHODIMP
nsStdoutPoller::SetLoggingEnabled(PRBool aLoggingEnabled)
{
  MutexAutoLock lock(mLock);

  DEBUG_LOG(("nsStdoutPoller::SetLoggingEnabled: %d\n", aLoggingEnabled));
  mLoggingEnabled = aLoggingEnabled;
  return NS_OK;
}


NS_IMETHODIMP
nsStdoutPoller::IsInterrupted(PRBool* interrupted)
{
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  {
    MutexAutoLock lock(mLock);

#ifdef FORCE_PR_LOG
    nsCOMPtr<nsIThread> myThread;
    IPC_GET_THREAD(myThread);
    DEBUG_LOG(("nsStdoutPoller::IsInterrupted: %p, myThread=%p\n",
           mInterrupted, myThread.get()));
#endif
    NS_ENSURE_ARG_POINTER(interrupted);

    *interrupted = mInterrupted;
  }

  return NS_OK;
}


/**
  * Joins polling thread (blocks until thread terminates)
  */
NS_IMETHODIMP
nsStdoutPoller::Join()
{
  DEBUG_LOG(("nsStdoutPoller::Join\n"));

  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  if (!mJoinableThread)
    return NS_ERROR_NOT_AVAILABLE;


  if (!mStdoutThread)
    return NS_OK;

  nsresult rv = NS_OK;
  rv = mStdoutThread->Shutdown();
  DEBUG_LOG(("nsStdoutPoller::Join, rv=%d\n", rv));

  mStdoutThread = nsnull;

  return rv;
}


/**
  * Interrupts polling thread. Maybe called from any thread.
  * Once interrupted, thread always remains interrupted.
  */
NS_IMETHODIMP
nsStdoutPoller::Interrupt(PRBool* alreadyInterrupted)
{

  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);

  {
    MutexAutoLock lock(mLock);

    if (!alreadyInterrupted)
      *alreadyInterrupted = mInterrupted;

    if (mInterrupted)
      return NS_OK;

    mInterrupted = PR_TRUE;
  }

#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsStdoutPoller::Interrupt: myThread=%p\n", myThread.get()));
#endif

  if (mPollableEvent) {
    // Interrupt thread
    PRStatus status;

    // Set pollable event to wake up thread
    status = PR_SetPollableEvent(mPollableEvent);
    if (status != PR_SUCCESS)
      return NS_ERROR_FAILURE;

  }

  return NS_OK;
}

nsresult
nsStdoutPoller::GetPolledFD(PRFileDesc*& aFileDesc)
{
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);

  nsresult rv;
  PRInt32 pollRetVal;

  aFileDesc = nsnull;

  if (mPollCount == 1) {
    // Read from STDOUT (blocking)
    DEBUG_LOG(("nsStdoutPoller::GetPolledFD: Blocked read from STDOUT\n"));

    aFileDesc = mPollFD[0].fd;
    return NS_OK;
  }

  DEBUG_LOG(("nsStdoutPoller::GetPolledFD: ***PR_Poll 0x%p,%d,%d\n",
             mPollFD, mPollCount, mTimeoutInterval));

  pollRetVal = PR_Poll(mPollFD, mPollCount, mTimeoutInterval);

  DEBUG_LOG(("nsStdoutPoller::GetPolledFD: PR_Poll returned value = %d\n",
    pollRetVal));

  if (pollRetVal < 0) {
    // PR_Poll error exit

    PRErrorCode errCode = PR_GetError();
    if (errCode == PR_PENDING_INTERRUPT_ERROR) {
      // Note: Interrupted; need to close all FDs
#ifdef FORCE_PR_LOG
      nsCOMPtr<nsIThread> myThread;
      rv = IPC_GET_THREAD(myThread);
      DEBUG_LOG(("nsStdoutPoller::GetPolledFD: Interrupted (NSPR) while polling, myThread=0x%p\n",
        myThread.get()));
#endif
    }

    ERROR_LOG(("nsStdoutPoller::GetPolledFD: PR_Poll error exit\n"));
    return NS_ERROR_FAILURE;
  }

  if (pollRetVal == 0) {
    // PR_Poll timed out

    ERROR_LOG(("nsStdoutPoller::GetPolledFD: PR_Poll timed out\n"));
    return NS_ERROR_FAILURE;
  }

  PRInt32 foundPollEvents = 0;
  // PR_Poll input available (pollRetVal > 0); process it
  PRBool errFlags = PR_FALSE;
  for (PRInt32 j=0; j<mPollCount; j++) {

    DEBUG_LOG(("nsStdoutPoller::GetPolledFD: mPollFD[%d].out_flags=0x%p\n",
            j, mPollFD[j].out_flags));

    if (mPollFD[j].out_flags) {
      // Out flags set for FD

      if (mPollFD[j].fd == mPollableEvent) {
        // Pollable event; return with null FD and normal status
        DEBUG_LOG(("nsStdoutPoller::GetPolledFD: mPollFD[%d]: Pollable event\n",
          j));

        PR_WaitForPollableEvent(mPollableEvent);
        return NS_OK;
      }

      if (mPollFD[j].out_flags & POLL_READ_FLAGS) {
        // Data available for reading from file descriptor (normal return)
        aFileDesc = mPollFD[j].fd;

        DEBUG_LOG(("nsStdoutPoller::GetPolledFD: mPollFD[%d]: Ready for reading\n",
          j));
        ++foundPollEvents;
        if (foundPollEvents == pollRetVal)
          return NS_OK;
      }

      // Exception/error condition; check next FD
#ifdef FORCE_PR_LOG
      nsCOMPtr<nsIThread> myThread;
      IPC_GET_THREAD(myThread);
      WARNING_LOG(("nsStdoutPoller::GetPolledFD: mPollFD[%d]: Exception/error 0x%x, myThread=0x%x\n",
        j, mPollFD[j].out_flags, myThread.get()));
#endif
      errFlags = PR_TRUE;
    }
  }

  // Return with null FD and normal status
  return NS_OK;
}



nsresult
nsStdoutPoller::HeaderSearch(const char* buf, PRUint32 count,
                             PRUint32 *headerOffset)
{
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);

  nsresult rv = NS_OK;

  *headerOffset = 0;

  if (!mProxyPipeListener)
    return NS_OK;

  if (mRequestStarted)
    return NS_OK;

  DEBUG_LOG(("nsStdoutPoller::HeaderSearch: count=%d, bufSize=%d\n",
             count, mHeadersBufSize));

  PRBool headerFound = PR_FALSE;
  PRBool startRequest = PR_FALSE;

  if (mHeadersBufSize == 0) {
    // Not looking for MIME headers; start request
    startRequest = PR_TRUE;

  }
  else {

    PRUint32 headersAvailable = mHeadersBufSize - mHeadersBuf.Length();
    NS_ASSERTION(headersAvailable != 0, "no header data available");

    PRBool lastSegment = (headersAvailable <= count);

    PRUint32 offset = 0;

    if (!buf || !count) {
      // Error/end-of-file; end headers search unsuccessfully
      startRequest = PR_TRUE;

    }
    else {
      PRUint32 scanLen = lastSegment ? headersAvailable : count;

      if (mHeadersBuf.IsEmpty())
        mHeadersLastNewline = 1;

      offset = scanLen;

      PRUint32 j = 0;
      while (j < scanLen) {

        if (mHeadersLastNewline > 0) {
          if ((mHeadersLastNewline == 1) && (buf[j] == '\r')) {
            // Skip over a single CR following a newline
            j++;
            mHeadersLastNewline++;
            if (j >= scanLen) break;
          }

          if (buf[j] == '\n') {
            // End-of-headers found
            offset = j + 1;
            headerFound = PR_TRUE;
            break;
          }
        }

        if (buf[j] == '\n')
          mHeadersLastNewline = 1;
        else
          mHeadersLastNewline = 0;

        j++;
      }

      DEBUG_LOG(("nsStdoutPoller::HeaderSearch: headerFound=%d, offset=%d\n",
              headerFound, offset));

      // Copy header portion to header buffer
      mHeadersBuf.Append(buf, offset);

      if (lastSegment)
        startRequest = PR_TRUE;
    }

    *headerOffset = offset;
  }

  if (headerFound || startRequest) {
    PRBool skipHeaders = PR_FALSE;

    if (mHeadersBufSize > 0) {
      // Try to parse headers
      PRInt32 contentLength = -1;
      rv = mProxyPipeListener->ParseMimeHeaders(mHeadersBuf.get(),
                                                mHeadersBuf.Length(),
                                                &contentLength);
      if (NS_SUCCEEDED(rv)) {
        // Headers parsed successfully
        mContentLength = contentLength;
        skipHeaders = PR_TRUE;
      }
    }

    // Call pipe listener to trigger OnStartRequest
    mRequestStarted = PR_TRUE;

    DEBUG_LOG(("nsStdoutPoller::HeaderSearch: Calling mProxyPipeListener->StartRequest\n"));

    rv = mProxyPipeListener->StartRequest();
    NS_ENSURE_SUCCESS(rv, rv);

    if (!skipHeaders && (mHeadersBufSize > 0)) {
      // Header search/parse failed; flush buffered data
      if (mOutputStream) {
        PRUint32 writeCount = 0;
        rv = mOutputStream->Write(mHeadersBuf.get(),
                                  mHeadersBuf.Length(), &writeCount);
        NS_ENSURE_SUCCESS(rv, rv);
      }
    }

    // Clear header buffer
    mHeadersBuf.Assign("");
  }

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIRunnable methods:
// (runs as a new thread)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsStdoutPoller::Run()
{
  NS_ENSURE_TRUE(mInitialized, NS_ERROR_NOT_INITIALIZED);
  NS_ENSURE_FALSE(mFinalized, NS_ERROR_NOT_AVAILABLE);

  nsresult rv = NS_OK;

#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsStdoutPoller::Run: myThread=%p\n", myThread.get()));
#endif

  if (!mPollCount)
    return NS_ERROR_NOT_INITIALIZED;

  // Polling loop
  while (1) {
    IPCFileDesc* readHandle;

#ifdef XP_WIN
    // No polling for Win32
    readHandle = mStdoutRead;
#else
    // Poll to determine file descriptor to read from
    rv = GetPolledFD(readHandle);
    NS_ENSURE_SUCCESS(rv, rv);

    if (!readHandle) {
      // Null handle means end-of-file/error
      DEBUG_LOG(("nsStdoutPoller::Run: Terminating polling\n"));
      break;
    }
#endif

    char buf[kCharMax];
    PRInt32 readCount;

    // Read data from handle (blocking)
    readCount = IPC_Read(readHandle, (char *) buf, kCharMax);

    DEBUG_LOG(("nsStdoutPoller::Run: Read %d chars\n", readCount));

    if (readCount < 0) {

      PRErrorCode errCode = IPC_GetError();
      if (errCode == PR_PENDING_INTERRUPT_ERROR) {
        // Note: Interrupted; need to close all FDs; exit loop normally
        DEBUG_LOG(("nsStdoutPoller::Run: Interrupted (NSPR) while reading\n"));

        rv = NS_OK;
        break;
      } else {
        // Exit loop with error status
        WARNING_LOG(("nsStdoutPoller::Run: Error in reading from fd %p (readCount=%d, error code=%d)\n",
                     readHandle, readCount, (int) errCode ));

        rv = NS_ERROR_FAILURE;
        break;
      }
    }

    if (readCount == 0) {
      // End of file; exit loop with normal status
      DEBUG_LOG(("nsStdoutPoller::Run: End-of-file in reading\n"));

      if (mConsole) {
        // Try to join console (i.e. wait for console thread to terminate)
        DEBUG_LOG(("nsStdoutPoller::Run: ***** Joining stderrConsole *****\n"));
        mConsole->Join();
      }

      rv = NS_OK;
      break;
    }

    PRBool interrupted;
    rv = IsInterrupted(&interrupted);
    if (NS_FAILED(rv)) break;

    if (interrupted) {
      // Thread termination signal received; discard read data and return
      WARNING_LOG(("nsStdoutPoller::Run: Thread interrupted; data discarded\n"));
      rv = NS_OK;
      break;
    }

    if (mLoggingEnabled && mConsole) {
      // Log data read to console
      mConsole->WriteBuf(buf, readCount);
    }

    PRUint32 headerOffset = 0;
    rv = HeaderSearch(buf, readCount, &headerOffset);
    if (NS_FAILED(rv)) break;

    if (readCount > (int) headerOffset) {
      // Write non-header portion to buffer output stream
      if (mOutputStream) {
        PRUint32 writeCount = 0;
        rv = mOutputStream->Write((char*) buf+headerOffset,
                                  readCount-headerOffset, &writeCount);
        if (NS_FAILED(rv)) break;
        DEBUG_LOG(("nsStdoutPoller::Run: writeCount=%d\n", writeCount));
        NS_ASSERTION(writeCount > 0, "writeCount <= 0");
      }
    }
  }

  // Clear any NSPR interrupt
  PR_ClearInterrupt();

  // Flush any MIME header stuff
  PRUint32 dummy;
  HeaderSearch(nsnull, 0, &dummy);

  PRBool alreadyInterrupted = PR_FALSE;
  Interrupt(&alreadyInterrupted);

  if (mOutputStream) {
    // Close output stream (unblocks synchronous reads)
    mOutputStream->Close();
  }

  if (mProxyPipeListener && mRequestStarted) {
    // Call pipe listener to trigger OnStopRequest,
    // usually on reaching end-of-file or end-of-content on Stdout,
    // which should be considered as normal exit.
    // Occasionally this might be due to a read error on Stdout.

    DEBUG_LOG(("nsStdoutPoller::Run: Calling mProxyPipeListener->StopRequest\n"));
    mProxyPipeListener->StopRequest(NS_OK);
    mRequestStarted = PR_FALSE;
  }

  // Kill process, and release owning references
  Finalize(PR_FALSE);

  DEBUG_LOG(("nsStdoutPoller::Run: exiting, rv=%p\n", rv));

  return rv;
}

///////////////////////////////////////////////////////////////////////////////

// nsStdinWriter implementation

// nsISupports implementation
NS_IMPL_THREADSAFE_ISUPPORTS1 (nsStdinWriter,
                               nsIRunnable)


// nsStdinWriter implementation
nsStdinWriter::nsStdinWriter() :
    mInputStream(nsnull),
    mCount(0),
    mPipe(IPC_NULL_HANDLE),
    mCloseAfterWrite(PR_FALSE),
    mThread(nsnull)
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsStdinWriter:: <<<<<<<<< CTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif
}


nsStdinWriter::~nsStdinWriter()
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsStdinWriter:: >>>>>>>>> DTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

  if (mThread) mThread->Shutdown();

  if (mPipe != IPC_NULL_HANDLE) {
    IPC_Close(mPipe);
    mPipe = IPC_NULL_HANDLE;
  }

  // Release ref to input stream
  mInputStream = nsnull;
}


///////////////////////////////////////////////////////////////////////////////
// nsStdinWriter methods:
///////////////////////////////////////////////////////////////////////////////

nsresult
nsStdinWriter::WriteFromStream(nsIInputStream *inStr, PRUint32 count,
                         IPCFileDesc* pipe, PRBool closeAfterWrite)
{
  DEBUG_LOG(("nsStdinWriter::WriteFromStream: count=%d\n", count));

  NS_ENSURE_ARG(inStr);
  NS_ENSURE_ARG(pipe);

  mInputStream = inStr;
  mCount = count;
  mPipe = pipe;
  mCloseAfterWrite = closeAfterWrite;

  nsresult rv = NS_NewThread(getter_AddRefs(mThread), (nsIRunnable*) this);
  return rv;
}
///////////////////////////////////////////////////////////////////////////////
// nsIRunnable methods:
// (runs as a new thread)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsStdinWriter::Run()
{
  NS_ENSURE_TRUE(mInputStream, NS_ERROR_NOT_INITIALIZED);

  nsresult rv = NS_OK;

#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsStdinWriter::Run: myThread=%p\n", myThread.get()));
#endif

  char buf[kCharMax];
  PRUint32 readCount, readMax;

  DEBUG_LOG(("nsStdinWriter::Run: mCount=%d\n", mCount));

  while (mCount > 0) {
    readMax = (mCount < kCharMax) ? mCount : kCharMax;
    rv = mInputStream->Read((char *) buf, readMax, &readCount);
    if (NS_FAILED(rv))
      break;

    if (!readCount) {
      ERROR_LOG(("nsStdinWriter::Run: readCount == 0\n"));
      rv = NS_ERROR_FAILURE;
      break;
    }

    mCount -= readCount;

    PRInt32 writeCount = 0;
    writeCount = IPC_Write(mPipe, buf, readCount);

    if (writeCount != (int) readCount) {
      PRErrorCode errCode = IPC_GetError();
      ERROR_LOG(("nsStdinWriter::Run: Error in writing to fd %p (count=%d, writeCount=%d, error code=%d)\n",
                 mPipe, readCount, writeCount, (int) errCode));

      rv = NS_ERROR_FAILURE;
      break;
    }

  }

  if (mCloseAfterWrite) {
    DEBUG_LOG(("nsStdinWriter::Run: Closing pipe/inputStream\n", rv));

    // Close pipe
    IPC_Close(mPipe);
    mPipe = IPC_NULL_HANDLE;

    // Close input stream
    mInputStream->Close();
  }

  DEBUG_LOG(("nsStdinWriter::Run: exiting, rv=%p\n", rv));

  return rv;
}


NS_IMETHODIMP
nsStdinWriter::Join()
{
  DEBUG_LOG(("nsStdinWriter::Join\n"));

  nsresult rv = NS_OK;

  if (mThread) {
    rv = mThread->Shutdown();
    mThread = nsnull;
  }
  return rv;
}

///////////////////////////////////////////////////////////////////////////////
// nsStreamDispatcher
///////////////////////////////////////////////////////////////////////////////

NS_IMPL_THREADSAFE_ISUPPORTS1 (nsStreamDispatcher,
                               nsIRunnable)

nsStreamDispatcher::nsStreamDispatcher() :
  mDispatchType(UNDEFINED),
  mPipeTransport(nsnull),
  mContext(nsnull),
  mInputStream(nsnull),
  mListener(nsnull)
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsStreamDispatcher:: <<<<<<<<< CTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif
}


nsStreamDispatcher::~nsStreamDispatcher()
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsStreamDispatcher:: >>>>>>>>> DTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

  // Release references
  mListener = nsnull;
  mContext = nsnull;
  mInputStream = nsnull;
  mPipeTransport = nsnull;
}

NS_IMETHODIMP
nsStreamDispatcher::Init(nsIStreamListener*  aListener,
                         nsISupports* context,
                         nsIRequest* pipeTransport)
{

  NS_ENSURE_ARG(aListener);
  NS_ENSURE_ARG(pipeTransport);
  mListener = aListener;
  mContext = context;
  mPipeTransport = pipeTransport;

  return NS_OK;
}

NS_IMETHODIMP
nsStreamDispatcher::DispatchOnDataAvailable(
                            nsIInputStream* inputStream,
                            PRUint32 startOffset,
                            PRUint32 count)
{
  DEBUG_LOG(("nsStreamDispatcher:: DispatchOnDataAvailable\n"));

  NS_ENSURE_ARG(inputStream);

  mDispatchType = ON_DATA_AVAILABLE;
  mInputStream = inputStream;
  mStartOffset = startOffset;
  mCount = count;

  return NS_OK;
}


NS_IMETHODIMP
nsStreamDispatcher::DispatchOnStartRequest()
{
  DEBUG_LOG(("nsStreamDispatcher:: DispatchOnStartRequest\n"));
  mDispatchType = ON_START_REQUEST;

  return NS_OK;
}

NS_IMETHODIMP
nsStreamDispatcher::DispatchOnStopRequest(nsresult status)
{
  DEBUG_LOG(("nsStreamDispatcher:: DispatchOnStopRequest\n"));

  mDispatchType = ON_STOP_REQUEST;
  mStatus = status;

  return NS_OK;
}



NS_IMETHODIMP
nsStreamDispatcher::Run()
{
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  IPC_GET_THREAD(myThread);
  DEBUG_LOG(("nsStreamDispatcher::Run: myThread=%p\n", myThread.get()));
#endif

  NS_ENSURE_TRUE(mListener, NS_ERROR_NOT_INITIALIZED);
  NS_ENSURE_TRUE(mPipeTransport, NS_ERROR_NOT_INITIALIZED);

  nsresult rv;

  switch (mDispatchType) {
    case ON_START_REQUEST:
      rv = mListener->OnStartRequest(mPipeTransport, mContext);
      break;
    case ON_DATA_AVAILABLE:
      rv = mListener->OnDataAvailable(mPipeTransport, mContext,
                                       mInputStream, mStartOffset, mCount);
      break;
    case ON_STOP_REQUEST:
      rv = mListener->OnStopRequest(mPipeTransport, mContext, mStatus);
      break;
    default:
      rv = NS_ERROR_NOT_AVAILABLE;
  }
  return rv;
}
