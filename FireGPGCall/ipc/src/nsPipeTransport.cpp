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
#include "nsAutoLock.h"
#include "nsCRT.h"
#include "nsReadableUtils.h"
#include "netCore.h"
#include "nsEventQueueUtils.h"

#include "nsIServiceManager.h"
#include "nsIProxyObjectManager.h"
#include "nsIURI.h"
#include "nsIHttpChannel.h"

#include "nsIIPCService.h"
#include "nsPipeTransport.h"

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

nsPipeTransport::nsPipeTransport()
    : mFinalized(PR_FALSE),
      mNoProxy(PR_FALSE),
      mStartedRequest(PR_FALSE),

      mPipeState(PIPE_NOT_YET_OPENED),
      mStdoutStream(STREAM_NOT_YET_OPENED),
      mCancelStatus(NS_OK),

      mLoadFlags(LOAD_NORMAL),
      mNotificationFlags(0),

      mExecutable(""),
      mCommand(""),
      mKillString(""),

      mProcess(IPC_NULL_HANDLE),
      mKillWaitInterval(PR_MillisecondsToInterval(KILL_WAIT_TIME_IN_MS)),
      mExitCode(0),

      mBufferSegmentSize(NS_PIPE_TRANSPORT_DEFAULT_SEGMENT_SIZE),
      mBufferMaxSize(NS_PIPE_TRANSPORT_DEFAULT_BUFFER_SIZE),
      mHeadersMaxSize(NS_PIPE_TRANSPORT_DEFAULT_HEADERS_SIZE),

      mExecBuf(""),

      mStdinWrite(IPC_NULL_HANDLE)
{
    NS_INIT_ISUPPORTS();

#ifdef PR_LOGGING
  if (gPipeTransportLog == nsnull) {
    gPipeTransportLog = PR_NewLogModule("nsPipeTransport");
  }
#endif

#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport:: <<<<<<<<< CTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

}


nsPipeTransport::~nsPipeTransport()
{
  nsresult rv;

#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport:: >>>>>>>>> DTOR(%p): myThread=%p START\n",
         this, myThread.get()));
#endif

  Finalize(PR_TRUE);

  // Release refs to objects that do not hold strong refs to this
  mInputStream  = nsnull;
  mOutputStream = nsnull;

  DEBUG_LOG(("nsPipeTransport:: ********* DTOR(%p) END\n", this));
}

//
// --------------------------------------------------------------------------
// nsISupports implementation...
// --------------------------------------------------------------------------
//

#ifdef MOZILLA_VERSION
NS_IMPL_THREADSAFE_ISUPPORTS8(nsPipeTransport, 
                              nsIPipeTransport, 
                              nsIPipeTransportHeaders,
                              nsIPipeTransportListener,
                              nsIRequest,
                              nsIOutputStream,
                              nsIStreamListener,
                              nsIInputStreamCallback,
                              nsIOutputStreamCallback)
#else // !MOZILLA_VERSION
// Mods for Mozilla version prior to 1.3b
NS_IMPL_THREADSAFE_ISUPPORTS8(nsPipeTransport, 
                              nsIPipeTransport, 
                              nsIPipeTransportHeaders,
                              nsIPipeTransportListener,
                              nsIRequest,
                              nsIOutputStream,
                              nsIStreamListener,
                              nsIInputStreamObserver,
                              nsIOutputStreamObserver)
#endif // !MOZILLA_VERSION

///////////////////////////////////////////////////////////////////////////////
// nsIPipeTransport methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP nsPipeTransport::InitCommand(const char *command,
                                           const char **env,
                                           PRUint32 envCount,
                                           PRUint32 timeoutMS,
                                           const char *killString,
                                           PRBool noProxy,
                                           PRBool mergeStderr,
                                           nsIPipeListener* console)
{
  nsresult rv;

  DEBUG_LOG(("nsPipeTransport::InitCommand: command=%s [%d]\n",
             command, envCount));

  if (!command)
    return NS_ERROR_FAILURE;

  mCommand = command;

  // Create a buffer of same size as the command string
  PRUint32 len = strlen(command);
  char* buf = (char*) PR_Malloc(sizeof(char) * (len+1) );

  // Parse command arguments separated by whitespace
  PRUint32 j;
  char quote = '\0';
  PRBool backquote = PR_FALSE;
  PRBool inArg = PR_FALSE;
  PRUint32 bufCount = 0;
  PRUint32 argCount = 0;

  for (j=0; j<len; j++) {
    char ch = command[j];
    if (!quote && !backquote) {
      // Unquoted character

      if ((ch == ' ') || (ch == '\t') || (ch == '\r') || (ch == '\n')) {
        // Whitespace (skip)

        if (inArg) {
          // End argument parsing; insert null character in buffer
          buf[bufCount++] = '\0';
          inArg = PR_FALSE;
        }

      } else if (!inArg) {
        // Non-whitespace character; start parsing new argument
        inArg = PR_TRUE;
        argCount++;
      }
    }

    if (inArg) {
      // Argument parsing

      if (backquote) {
        // Backquoted character; append to buffer
        buf[bufCount++] = ch;
        backquote = PR_FALSE;

      } else if (ch == '\\') {
        // Backquote following character
        backquote = PR_TRUE;

      } else if (quote == ch) {
        // Matching end quote
        quote = '\0';

      } else if (!quote && ((ch == '"') || (ch == '\'')) ) {
        // Start new quote
        quote = ch;

      } else {
        // Append character to buffer (quoted/unquoted)
        buf[bufCount++] = ch;
      }
    }
  }

  if (inArg)
    buf[bufCount++] = '\0';   // End argument parsing

  PR_ASSERT(bufCount <= (len+1)); // No buffer overflow

  if (quote) {
    ERROR_LOG(("nsPipeTransport::InitCommand: Unmatched quote in command string\n"));
    PR_Free(buf);
    return NS_ERROR_FAILURE;
  }

  if (!argCount) {
    ERROR_LOG(("nsPipeTransport::InitCommand: Blank/null command string\n"));
    PR_Free(buf);
    return NS_ERROR_FAILURE;
  }

  DEBUG_LOG(("nsPipeTransport::InitCommand: argCount=%d\n", argCount));

  // Argument list (includes command path as the first argument)
  char** args = (char **) PR_Malloc(sizeof(char *) * (argCount+1) );
  if (!args)
    return NS_ERROR_OUT_OF_MEMORY;

  PRUint32 argOffset = 0;
  for (j=0; j<argCount; j++) {
    args[j] = buf + argOffset;
    argOffset += strlen(args[j]) + 1;
  }

  PR_ASSERT(argOffset == bufCount);

  args[argCount] = NULL;

  rv = Init((const char*) args[0],
            (const char**) args+1, argCount-1, env, envCount,
            timeoutMS, killString, noProxy, mergeStderr,
            console);

  PR_Free(buf);

  return rv;
}


NS_IMETHODIMP nsPipeTransport::Init(const char *executable,
                                    const char **args,
                                    PRUint32 argCount,
                                    const char **env,
                                    PRUint32 envCount,
                                    PRUint32 timeoutMS,
                                    const char *killString,
                                    PRBool noProxy,
                                    PRBool mergeStderr,
                                    nsIPipeListener* console)
{
  nsresult rv;
  PRUint32 j;

  DEBUG_LOG(("nsPipeTransport::Init: executable=%s [%d]\n",
             executable, envCount));

  if (mPipeState != PIPE_NOT_YET_OPENED) {
    return NS_ERROR_ALREADY_INITIALIZED;
  }

  mNoProxy = noProxy;
  mConsole = console;

  PRIntervalTime timeoutInterval  =
                     PR_MillisecondsToInterval(DEFAULT_PROCESS_TIMEOUT_IN_MS);
  if (timeoutMS > 0) {
    // Specified process timeout
    timeoutInterval = PR_MillisecondsToInterval(timeoutMS);
  }

  mExecutable.Assign(executable);

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
  npipe = mergeStderr ? 3 : 2;
#endif

  for (int ipipe = 0; ipipe < npipe; ipipe++) {
    // Create pipe pair
    IPCFileDesc* fd[2];
    status = IPC_CreateInheritablePipe(&fd[0], &fd[1],
                                       (ipipe == 0), (ipipe != 0));
    if (status != PR_SUCCESS) {
      ERROR_LOG(("nsPipeTransport::Init: Error in creating pipe %d\n", ipipe));
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

  IPCFileDesc* stderrPipe;
  if (stderrWrite) {
    // This STDOUT/STDERR merging technique works on Unix only (uses PR_Poll)
    stderrPipe = stderrWrite;

  } else if (mergeStderr) {
    // This STDOUT/STDERR merging technique works on Win32 only (uses same FD)
    stderrPipe = stdoutWrite;

  } else {
    // Re-direct STDERR to console
    nsCOMPtr<nsIPipeListener> console(mConsole);

    if (!console) {
      nsCOMPtr<nsIIPCService> ipcserv = do_GetService( NS_IPCSERVICE_CONTRACTID, &rv );
      if (NS_FAILED(rv)) return rv;

      nsCOMPtr<nsIPipeConsole> ipcConsole;
      rv = ipcserv->GetConsole(getter_AddRefs(ipcConsole));
      if (NS_FAILED(rv)) return rv;

      console = ipcConsole;
    }

    rv = console->GetFileDesc(&stderrPipe);
    if (NS_FAILED(rv)) return rv;

    DEBUG_LOG(("nsPipeTransport::Init: stderrPipe=0x%p\n", stderrPipe));
  }

  char** argList = NULL;

  if (argCount < 0)
    return NS_ERROR_FAILURE;

  // Extended copy of argument list (execpath, args, NULL)
  argList = (char **) PR_Malloc(sizeof(char *) * (argCount + 2) );
  if (!argList)
    return NS_ERROR_OUT_OF_MEMORY;

  argList[0] = (char *) mExecutable.get();

  for (j=0; j < argCount; j++) {
    argList[j+1] = (char *)args[j];
    DEBUG_LOG(("nsPipeTransport::Init: arg[%d] = %s\n", j+1, args[j]));
  }
    
  argList[argCount+1] = NULL;

  char** envList = NULL;
  if (envCount > 0) {
    // Extended copy of environment variable list (env, NULL)
    envList = (char **) PR_Malloc(sizeof(char *) * (envCount + 1) );
    if (!envList)
      return NS_ERROR_OUT_OF_MEMORY;

    for (j=0; j < envCount; j++)
      envList[j] = (char *)env[j];
    
    envList[envCount] = NULL;
  }

  /* Create NSPR process */
  mProcess = IPC_CreateProcessRedirected(mExecutable.get(),
                                         argList, envList,
                                         nsnull, stdinRead,
                                         stdoutWrite, stderrPipe);

  // Do some clean-up for pointers on stack
  // before checking if process creation succeeded
  // (Clean-up for pointers in member variables will be done by the DTOR)

  // Free argument/environment lists
  PR_Free(argList);
  if (envList) PR_Free(envList);

  if (mProcess == IPC_NULL_HANDLE) {
    // Process creation failed
    ERROR_LOG(("nsPipeTransport::Init: Error in creating process ...\n"));
    return NS_ERROR_FILE_EXECUTION_FAILED;
  }

#ifdef XP_WIN
  DEBUG_LOG(("nsPipeTransport::Init: Created process %d, %s\n",
	     (int) mProcess, mExecutable.get() ));
#else
  DEBUG_LOG(("nsPipeTransport::Init: Created process %d, %s\n",
	     (int)(intptr_t) mProcess, mExecutable.get() ));
#endif

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
  rv = stdoutPoller->Init(stdoutRead, stderrRead, timeoutInterval, mConsole);
  if (NS_FAILED(rv))
    return rv;

  mPipeState = PIPE_OPEN;

  return NS_OK;
}


// Should only be called from the thread that created the nsIPipeTransport
nsresult
nsPipeTransport::Finalize(PRBool destructor)
{
  if (mFinalized)
    return NS_OK;

  mFinalized = PR_TRUE;

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
      ERROR_LOG(("nsPipeTransport::Finalize: Failed to interrupt Stdout thread, %x\n", rv));
      rv = NS_ERROR_FAILURE;

    } else if(mNoProxy) {
      // Join poller thread to free resources (may block)
      rv = mStdoutPoller->Join();
      if (NS_FAILED(rv)) {
        ERROR_LOG(("nsPipeTransport::Finalize: Failed to join Stdout thread, %x\n", rv));
        rv = NS_ERROR_FAILURE;
      }
    }
  }

  // Kill process to wake up thread blocked for input from process
  // NOTE: This should always be done after "interrupting" the thread
  //       so that the interrupt flag is set.
  KillProcess();

  // Release refs to input arguments
  mListener         = nsnull;
  mContext          = nsnull;
  mLoadGroup        = nsnull;

  // Release owning refs
  mConsole          = nsnull;
  mHeaderProcessor  = nsnull;

  // Release refs to objects that hold strong refs to this
  mStdoutPoller = nsnull;

  // Clear buffer
  mExecBuf.Assign("");

  return rv;
}

void
nsPipeTransport::KillProcess(void)
{
  // Process cleanup
  if (mProcess == IPC_NULL_HANDLE)
    return;

  if ((mStdinWrite != IPC_NULL_HANDLE) &&
      mKillString.get() && (strlen(mKillString.get()) > 0)) {
    // Transmit kill string to process
    PRInt32 writeCount;
    writeCount = IPC_Write(mStdinWrite, mKillString.get(),
                           strlen(mKillString.get()));

    if (writeCount != (int) strlen(mKillString.get())) {
      WARNING_LOG(("KillProcess: Failed to send kill string\n"));
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
    DEBUG_LOG(("nsPipeTransport::KillProcess: Failed to kill process\n"));
  else
    DEBUG_LOG(("nsPipeTransport::KillProcess: Killed process\n"));


  // Reap process (to avoid memory leaks in NSPR)
  // **NOTE** This could cause this (UI?) thread to hang
  status = IPC_WaitProcess(mProcess, &mExitCode);

  if (status != PR_SUCCESS)
    WARNING_LOG(("nsPipeTransport::KillProcess: Failed to reap process\n"));

  mProcess = IPC_NULL_HANDLE;

  return;
}

NS_IMETHODIMP
nsPipeTransport::GetHeaderProcessor(nsIPipeTransportHeaders* *_retval)
{
  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  NS_IF_ADDREF(*_retval = mHeaderProcessor.get());

  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::SetHeaderProcessor(nsIPipeTransportHeaders* aHeaderProcessor)
{

  DEBUG_LOG(("nsPipeTransport::SetHeaderProcessor: \n"));
  mHeaderProcessor = aHeaderProcessor;
  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::GetConsole(nsIPipeListener* *_retval)
{
  DEBUG_LOG(("nsPipeTransport::GetConsole: \n"));

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  NS_IF_ADDREF(*_retval = mConsole.get());

  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::IsAttached(PRBool* attached)
{
  nsresult rv;
  DEBUG_LOG(("nsPipeTransport::IsAttached: \n"));

  if (mStdoutPoller) {
    PRBool interrupted;
    rv = mStdoutPoller->IsInterrupted(&interrupted);
    if (NS_FAILED(rv)) return rv;

    *attached = !interrupted;

  } else {
    *attached = PR_FALSE;
  }

  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::Join()
{
  nsresult rv;
  DEBUG_LOG(("nsPipeTransport::Join: \n"));

  if (!mNoProxy)
    return NS_ERROR_FAILURE;

  // Close STDIN, if open
  CloseStdin();

  if (mStdoutPoller) {
    rv = mStdoutPoller->Join();
    if (NS_FAILED(rv)) return rv;
    mStdoutPoller = nsnull;
  }

  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::Terminate()
{
  DEBUG_LOG(("nsPipeTransport::Terminate: \n"));

  // Clean up, killing process if need be
  return Finalize(PR_FALSE);
}


NS_IMETHODIMP
nsPipeTransport::ExitCode(PRInt32* _retval)
{
  nsresult rv;
  DEBUG_LOG(("nsPipeTransport::ExitCode: \n"));

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  if (mStdoutPoller) {
    // Fail if poller has not been interrupted
    PRBool interrupted;
    rv = mStdoutPoller->IsInterrupted(&interrupted);
    if (NS_FAILED(rv)) return rv;

    if (!interrupted)
      return NS_ERROR_FAILURE;
  }

  // Kill process, if need be
  // (Needed for synchronous reads where StopRequest is not called)
  KillProcess();

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
  if (!mStdoutPoller)
    return NS_ERROR_NOT_INITIALIZED;

  return mStdoutPoller->GetLoggingEnabled(aLoggingEnabled);
}

NS_IMETHODIMP
nsPipeTransport::SetLoggingEnabled(PRBool aLoggingEnabled)
{
  if (!mStdoutPoller)
    return NS_ERROR_NOT_INITIALIZED;

  return mStdoutPoller->SetLoggingEnabled(aLoggingEnabled);
}

NS_IMETHODIMP
nsPipeTransport::OpenInputStream(PRUint32 offset,
                                 PRUint32 count,
                                 PRUint32 flags,
                                 nsIInputStream **result)
{
  nsresult rv = NS_OK;

  DEBUG_LOG(("nsPipeTransport::OpenInputStream: \n"));

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
  if (NS_FAILED(rv)) {
    return rv;
  }

  // Spin up a new thread to handle STDOUT polling
  rv = mStdoutPoller->AsyncStart(mOutputStream, nsnull, PR_FALSE, 0);
  if (NS_FAILED(rv)) return rv;

  rv = mInputStream->QueryInterface(NS_GET_IID(nsIInputStream),
                                    (void**)result);
  return rv;
}

NS_IMETHODIMP
nsPipeTransport::OpenOutputStream(PRUint32 offset,
                                  PRUint32 count,
                                  PRUint32 flags,
                                  nsIOutputStream **result)
{
  DEBUG_LOG(("nsPipeTransport::OpenOutputStream: \n"));
  if (mPipeState != PIPE_OPEN)
    return NS_ERROR_NOT_INITIALIZED;

  return this->QueryInterface(NS_GET_IID(nsIOutputStream), (void**)result);
}


NS_IMETHODIMP
nsPipeTransport::GetListener(nsIStreamListener **result)
{
  DEBUG_LOG(("nsPipeTransport::GetListener: \n"));
  if (mPipeState != PIPE_OPEN)
    return NS_ERROR_NOT_INITIALIZED;

  return this->QueryInterface(NS_GET_IID(nsIStreamListener), (void**)result);
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
    if (NS_FAILED(rv)) return rv;

#ifdef MOZILLA_VERSION
    // Open pipe to handle STDOUT
    nsCOMPtr<nsIAsyncInputStream> asyncInputStream;
    nsCOMPtr<nsIAsyncOutputStream> asyncOutputStream;

    rv = NS_NewPipe2(getter_AddRefs(asyncInputStream),
                     getter_AddRefs(asyncOutputStream),
                     nonBlockingInput, nonBlockingOutput);
    if (NS_FAILED(rv)) return rv;

    mInputStream = asyncInputStream;
    mOutputStream = asyncOutputStream;

    nsCOMPtr<nsIEventQueue> eventQ;

    if (!mNoProxy) {
      rv = NS_GetCurrentEventQ(getter_AddRefs(eventQ));
      if (NS_FAILED(rv)) return rv;
    }

    // Set input stream observer (using event queue, if need be)
    rv = asyncInputStream->AsyncWait((nsIInputStreamCallback*) this,
                                      0, 0, eventQ);
    if (NS_FAILED(rv)) return rv;

#else // !MOZILLA_VERSION
    // Mods for Mozilla version prior to 1.3b
    // Open pipe to handle STDOUT
    rv = NS_NewPipe(getter_AddRefs(mInputStream),
                    getter_AddRefs(mOutputStream),
                    mBufferSegmentSize, mBufferMaxSize,
                    nonBlockingInput, nonBlockingOutput);
    if (NS_FAILED(rv)) return rv;

    nsCOMPtr<nsIOutputStreamObserver> observer;

    if (mNoProxy) {
      observer = this;

    } else {
      // Set output stream observer using proxy
      nsCOMPtr<nsIOutputStreamObserver> temObserver = this;
      rv = proxyMgr->GetProxyForObject(NS_CURRENT_EVENTQ, //current thread
                                       NS_GET_IID(nsIOutputStreamObserver),
                                       temObserver,
                                       PROXY_SYNC | PROXY_ALWAYS,
                                       getter_AddRefs(observer));
      if (NS_FAILED(rv)) return rv;
    }

    nsCOMPtr<nsIObservableOutputStream> observableOut(do_QueryInterface(mOutputStream, &rv));
    if (NS_FAILED(rv)) return rv;

    rv = observableOut->SetObserver(observer);
    if (NS_FAILED(rv)) return rv;

    // Set input stream observer (no proxy needed)
    nsCOMPtr<nsIInputStreamObserver> inputStreamObserver = this;

    nsCOMPtr<nsIObservableInputStream> observableIn(do_QueryInterface(mInputStream, &rv));
    if (NS_FAILED(rv)) return rv;

    rv = observableIn->SetObserver(inputStreamObserver);
    if (NS_FAILED(rv)) return rv;

#endif // !MOZILLA_VERSION

    if (mNoProxy) {
      pipeListener = this;

    } else {
      nsCOMPtr<nsIPipeTransportListener> temListener = this;
      rv = proxyMgr->GetProxyForObject(NS_CURRENT_EVENTQ, //current thread
                                       NS_GET_IID(nsIPipeTransportListener),
                                       temListener,
                                       PROXY_SYNC | PROXY_ALWAYS,
                                       getter_AddRefs(pipeListener));
      if (NS_FAILED(rv)) return rv;
    }
  }

  // Spin up a new thread to handle STDOUT polling
  PRUint32 mimeHeadersMaxSize = mHeaderProcessor ? mHeadersMaxSize : 0;
  rv = mStdoutPoller->AsyncStart(mOutputStream, pipeListener,
                                 (mNoProxy != nsnull),
                                 mimeHeadersMaxSize);
  if (NS_FAILED(rv)) return rv;

  NS_ADDREF(*_retval = this);
  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::WriteSync(const char *buf, PRUint32 count)
{
  nsresult rv;
  DEBUG_LOG(("nsPipeTransport::WriteSync: %d\n", count));

  PRUint32 writeCount;
  rv = Write(buf, count, &writeCount);
  if (NS_FAILED(rv)) return rv;

  if (writeCount != count)
    return NS_ERROR_FAILURE;

  return NS_OK;
}


NS_IMETHODIMP
nsPipeTransport::CloseStdin(void)
{
  DEBUG_LOG(("nsPipeTransport::CloseStdin: \n"));
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

  nsCOMPtr<nsIPipeTransportWriter> pipeTransportWriter;
  pipeTransportWriter = stdinWriter;

  nsresult rv;
  rv = pipeTransportWriter->WriteFromStream(inStr, count, mStdinWrite,
                                            closeAfterWrite);

  if (closeAfterWrite) {
    mStdinWrite = IPC_NULL_HANDLE;  // Different thread will close STDIN
  }

  return rv;
}


// Execute a command whose output is delimited by a prompt string
// ("Expect" style command execution)
NS_IMETHODIMP
nsPipeTransport::ExecPrompt(const char* command, const char* prompt,
                            PRInt32 maxOutputLen, PRBool clearPrev,
                            char* *_retval)
{
  nsresult rv;

  DEBUG_LOG(("nsPipeTransport::ExecPrompt: command='%s', prompt='%s', maxOutputLen=%d, clearPrev=%p\n", command, prompt, maxOutputLen, clearPrev));

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  if (!mInputStream) {
    nsCOMPtr<nsIInputStream> inputStream;
    rv = OpenInputStream(0, PRUint32(-1), 0, getter_AddRefs(inputStream));
    if (NS_FAILED(rv)) return rv;
  }

  if (mStdoutStream != STREAM_SYNC_OPEN)
    return NS_ERROR_NOT_AVAILABLE;

  if (clearPrev) {
    // Clear any previous output data
    char buf[kCharMax];
    PRUint32 readCount, readMax;
    PRUint32 available = 0;
    rv = mInputStream->Available(&available);

    DEBUG_LOG(("nsPipeTransport::ExecPrompt: available=%d\n", available));

    while (available > 0) {
      readMax = (available < kCharMax) ? available : kCharMax;
      rv = mInputStream->Read((char *) buf, readMax, &readCount);
      if (NS_FAILED(rv)) return rv;
      if (readCount <= 0)
        break;
      available -= readCount;
    }

    // Clear Exec buffer as well
    mExecBuf.Assign("");
  }

  PRUint32 commandLen = strlen(command);

  if (commandLen > 0) {
    // Transmit command
    PRUint32 writeCount;
    rv = Write(command, commandLen, &writeCount);
    if (NS_FAILED(rv)) return rv;
  }

  PRInt32 returnCount = -1;
  PRUint32 promptLen = strlen(prompt);

  if (maxOutputLen != 0) {
    char buf[kCharMax];
    PRUint32 readCount, readMax;

    PRBool matchWithoutNewline = (promptLen > 1) && (prompt[0] == '\n');

    PRUint32 searchOffset = 0;

    PRUint32 remainingCount = (maxOutputLen > 0) ? maxOutputLen : kCharMax;

    while (remainingCount > 0) {
      readMax = (remainingCount < kCharMax) ? remainingCount : kCharMax;

      rv = mInputStream->Read((char *) buf, kCharMax, &readCount);
      if (NS_FAILED(rv)) return rv;

      if (readCount < 0)
        return NS_ERROR_FAILURE;

      if (readCount == 0)
        break;             // End-of-file

      mExecBuf.Append(buf, readCount);

      if (matchWithoutNewline && (mExecBuf.Length() >= promptLen-1)) {

        if (nsCRT::strncmp(mExecBuf.get(), prompt+1, promptLen-1) == 0) {
          // Prompt without newline matches output start; return null string
          returnCount = 0;
          mExecBuf.Cut(returnCount, promptLen-1);
          break;
        }

        matchWithoutNewline = PR_FALSE;
      }

      if ((promptLen > 0) && (mExecBuf.Length() >= promptLen)) {
        returnCount = mExecBuf.Find(prompt, PR_FALSE, searchOffset);

        if (returnCount >= 0) {
          // Prompt found; delete it from line
          if (prompt[0] == '\n') {
            returnCount++; // keep the newline
            mExecBuf.Cut(returnCount, promptLen-1);
          } else {
            mExecBuf.Cut(returnCount, promptLen);
          }
          break;
        }

        // Increment search offset
        searchOffset = mExecBuf.Length()-promptLen + 1;
      }

      if (maxOutputLen > 0) {
        // Limited read
        remainingCount -= readCount;
      } else {
        // Unlimited read
        remainingCount = kCharMax;
      }
    }

    if (returnCount < 0)
      returnCount = mExecBuf.Length();  // Return everything
  }
  
  // Duplicate output string and return it
  nsCAutoString outStr("");
  if (returnCount > 0) {
    mExecBuf.Left(outStr, returnCount);
    mExecBuf.Cut(0,returnCount);
  }
  *_retval = nsCRT::strdup(outStr.get());
  if (!*_retval)
    return NS_ERROR_OUT_OF_MEMORY;

  DEBUG_LOG(("nsPipeTransport::ExecPrompt: *_retval='%s'\n", *_retval));

  return NS_OK;
}

// Read the next line
NS_IMETHODIMP
nsPipeTransport::ReadLine(PRInt32 maxOutputLen,
                            char* *_retval)
{
  nsresult rv;

  DEBUG_LOG(("nsPipeTransport::ReadLine: maxOutputLen=%d\n", maxOutputLen));

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  if (!mInputStream) {
    nsCOMPtr<nsIInputStream> inputStream;
    rv = OpenInputStream(0, PRUint32(-1), 0, getter_AddRefs(inputStream));
    if (NS_FAILED(rv)) return rv;
  }

  if (mStdoutStream != STREAM_SYNC_OPEN)
    return NS_ERROR_NOT_AVAILABLE;


  PRInt32 returnCount = -1;

  if (maxOutputLen != 0) {
    char buf[kCharMax];
    PRUint32 readCount, readMax;

    PRUint32 remainingCount = (maxOutputLen > 0) ? maxOutputLen : kCharMax;
    
    if (mExecBuf.Length()>0) {
      mExecBuf.ReplaceSubstring("\r\n", "\n");
      mExecBuf.ReplaceSubstring("\r", "\n");
      returnCount = mExecBuf.Find("\n", PR_FALSE, 0);
      DEBUG_LOG(("nsPipeTransport::ReadLine: returnCount=%d\n", returnCount));
    }
    
    if (returnCount < 0) {
      while (remainingCount > 0) {
        readMax = (remainingCount < kCharMax) ? remainingCount : kCharMax;
  
        if (mStdoutPoller) {
          // Fail if poller has been interrupted
          PRBool interrupted;
          rv = mStdoutPoller->IsInterrupted(&interrupted);
          if (NS_FAILED(rv)) return rv;
      
          if (interrupted)
            return NS_BASE_STREAM_CLOSED;
        }
        rv = mInputStream->Read((char *) buf, kCharMax, &readCount);
        if (NS_FAILED(rv)) return rv;
  
        if (readCount < 0)
          return NS_ERROR_FAILURE;
  
        if (readCount == 0)
          break;             // End-of-file
  
        mExecBuf.Append(buf, readCount);
  
        if (mExecBuf.Length() >= 1) {
          mExecBuf.ReplaceSubstring("\r\n", "\n");
          mExecBuf.ReplaceSubstring("\r", "\n");
          returnCount = mExecBuf.Find("\n", PR_FALSE, 0);
  
          if (returnCount >= 0) {
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
    if (returnCount < 0)
      returnCount = mExecBuf.Length();  // Return everything
  }
  
  // Duplicate output string and return it
  nsCAutoString outStr("");
  if (returnCount >= 0) {
    mExecBuf.Left(outStr, returnCount);
    mExecBuf.Cut(0,returnCount+1);
  }
  *_retval = nsCRT::strdup(outStr.get());
  if (!*_retval)
    return NS_ERROR_OUT_OF_MEMORY;

  DEBUG_LOG(("nsPipeTransport::readLine: *_retval='%s'\n", *_retval));

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIRequest methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::GetName(nsACString &result)
{
  DEBUG_LOG(("nsPipeTransport::GetName: \n"));

  if (!mCommand.IsEmpty()) {
    result = mCommand;
  } else {
    result = mExecutable;
  }

  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::IsPending(PRBool *result)
{

  DEBUG_LOG(("nsPipeTransport::IsPending: \n"));
  *result = (mCancelStatus == NS_OK);
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::GetStatus(nsresult *status)
{

  DEBUG_LOG(("nsPipeTransport::GetStatus: \n"));
  *status = mCancelStatus;
  return NS_OK;
}

// NOTE: We assume that OnStopRequest should not be called if
// request is canceled. This may be wrong!
NS_IMETHODIMP
nsPipeTransport::Cancel(nsresult status)
{

#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport::Cancel, myThread=%p, status=%p\n",
         myThread.get(), status));
#endif

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
  nsresult rv = NS_OK;

  DEBUG_LOG(("nsPipeTransport::OnDataAVailable: %d\n", aLength));

  char buf[kCharMax];
  PRUint32 readCount, readMax;

  while (aLength > 0) {
    readMax = (aLength < kCharMax) ? aLength : kCharMax;
    rv = aInputStream->Read((char *) buf, readMax, &readCount);
    if (NS_FAILED(rv)){
      DEBUG_LOG(("nsPipeTransport::OnDataAvailable: Error in reading from input stream, %p\n", rv));
      return rv;
    }

    if (readCount <= 0) return NS_OK;

    rv = WriteSync(buf, readCount);
    if (NS_FAILED(rv)) return rv;

    aLength -= readCount;
  }

  return NS_OK;
}

#ifdef MOZILLA_VERSION

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
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport::OnInputStreamReady, myThread=%p\n", myThread.get()));
#endif

  if (mListener) {
    if (!mInputStream) 
      return NS_ERROR_NOT_INITIALIZED;

    PRUint32 available;
    rv = mInputStream->Available(&available);
    if (NS_FAILED(rv))
      return rv;

    DEBUG_LOG(("nsPipeTransport::OnInputStreamReady: available=%d\n",
               available));

    rv = mListener->OnDataAvailable((nsIRequest*) this, mContext,
                                     mInputStream, 0, available);
    if (NS_FAILED(rv)) return rv;

    nsCOMPtr<nsIEventQueue> eventQ;

    if (!mNoProxy) {
      rv = NS_GetCurrentEventQ(getter_AddRefs(eventQ));
      if (NS_FAILED(rv)) return rv;
    }

    // Re-set input stream observer (using event queue, if need be)
    rv = inStr->AsyncWait((nsIInputStreamCallback*) this, 0, 0, eventQ);
    if (NS_FAILED(rv)) return rv;

    return rv;
  }

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIOutputStreamCallback methods:
// (Should be invoked in the thread creating nsIPipeTransport object)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::OnOutputStreamReady(nsIAsyncOutputStream* outStr)
{
  nsresult rv;
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport::OnOutputStreamReady, myThread=%p\n", myThread.get()));
#endif

  return NS_OK;
}

#else  // !MOZILLA_VERSION
// Mods for Mozilla version prior to 1.3b

///////////////////////////////////////////////////////////////////////////////
// nsIInputStreamObserver methods:
// (Should be invoked in the thread creating nsIPipeTransport object)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::OnEmpty(nsIInputStream* inStr)
{
#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport::OnEmpty, myThread=%p\n", myThread.get()));
#endif

  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::OnClose(nsIInputStream* inStr)
{
#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport::OnClose, myThread=%p\n", myThread.get()));
#endif

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIOutputStreamObserver methods:
// (Should be invoked in the thread creating nsIPipeTransport object,
//  unless mNoProxy is true.)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::OnWrite(nsIOutputStream* outStr, PRUint32 aCount)
{
#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport::OnWrite, myThread=%p\n", myThread.get()));
  DEBUG_LOG(("nsPipeTransport::OnWrite, count=%d\n", aCount));
#endif

  if (mListener) {
    if (!mInputStream) 
      return NS_ERROR_NOT_INITIALIZED;

    return mListener->OnDataAvailable((nsIRequest*) this, mContext,
                                      mInputStream, 0, aCount);
  }
  return NS_OK;
}

NS_IMETHODIMP
nsPipeTransport::OnFull(nsIOutputStream* outStr)
{
#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport::OnFull, myThread=%p\n", myThread.get()));
#endif
  return NS_OK;
}

#endif // !MOZILLA_VERSION

///////////////////////////////////////////////////////////////////////////////
// nsIPipeTransportHeaders methods:
// (Should be invoked in the thread creating nsIPipeTransport object)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeTransport::ParseMimeHeaders(const char* mimeHeaders, PRUint32 count,
                                  PRInt32 *retval)
{
#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport::ParseMimeHeaders, myThread=%p\n", myThread.get()));
#endif

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
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport::StartRequest, myThread=%p\n",myThread.get()));
#endif

  if (mListener) {
    // Starting processing of async output
    rv = mListener->OnStartRequest((nsIRequest*) this, mContext);
    if (NS_FAILED(rv))
      return rv;
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
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeTransport::StopRequest, myThread=%p, status=%p\n",
         myThread.get(), aStatus));
#endif

  // NOTE: Should OnStopRequest be called if request is being cancelled?
  // We are assuming here that it does not need to be.
  // If this assumption is wrong, then there is a problem when saving
  // downloaded files using xpfe/components/xfer/src/nsStreamXferOp:
  // Canceling a download in progress calls nsStreamXferOp::OnStopRequest
  // followed by nsStreamXferOp::Stop, causing the BufferedOutputStream
  // to be closed each time, and causing nsBufferedOutputStream::Flush
  // to segfault on the second close.

  if (mStartedRequest && mListener && (mCancelStatus == NS_OK) &&
      (aStatus == NS_OK)) {
    mStartedRequest = PR_FALSE;
    mCancelStatus = NS_BINDING_ABORTED;
    mListener->OnStopRequest( (nsIRequest*) this, mContext, aStatus);
  }

  if (!mNoProxy)
    Finalize(PR_FALSE);

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////

// nsStdoutPoller implementation

// nsISupports implementation
NS_IMPL_THREADSAFE_ISUPPORTS2 (nsStdoutPoller,
                               nsIPipeTransportPoller,
                               nsIRunnable)


// nsStdoutPoller implementation
nsStdoutPoller::nsStdoutPoller()
  : mFinalized(PR_FALSE),
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
    NS_INIT_ISUPPORTS();

#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsStdoutPoller:: <<<<<<<<< CTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

  mLock = PR_NewLock();
}


nsStdoutPoller::~nsStdoutPoller()
{
  nsresult rv;
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsStdoutPoller:: >>>>>>>>> DTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

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

  PR_DestroyLock(mLock);
}


///////////////////////////////////////////////////////////////////////////////
// nsStdoutPoller methods:
///////////////////////////////////////////////////////////////////////////////

nsresult
nsStdoutPoller::Init(IPCFileDesc*            aStdoutRead,
                     IPCFileDesc*            aStderrRead,
                     PRIntervalTime          aTimeoutInterval,
                     nsIPipeListener*        aConsole)
{ // Should be invoked in the thread creating nsIPipeTransport object
  // Should be closed only in the polling thread
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

  return NS_OK;
}


NS_IMETHODIMP
nsStdoutPoller::AsyncStart(nsIOutputStream*  aOutputStream,
                           nsIPipeTransportListener* aProxyPipeListener,
                           PRBool joinable,
                           PRUint32 aMimeHeadersMaxSize)
{ // Should be invoked in the thread creating nsIPipeTransport object
  nsresult rv = NS_OK;

  DEBUG_LOG(("nsStdoutPoller::AsyncStart: %d\n", aMimeHeadersMaxSize));

  mJoinableThread    = joinable;
  mHeadersBufSize    = aMimeHeadersMaxSize;

  mOutputStream      = aOutputStream;
  mProxyPipeListener = aProxyPipeListener;

  // Spin up a new thread to handle STDOUT polling (non-joinable)
  nsCOMPtr<nsIThread> stdoutThread;
  PRThreadState threadState = mJoinableThread ? PR_JOINABLE_THREAD
                                              : PR_UNJOINABLE_THREAD;
  rv = NS_NewThread(getter_AddRefs(stdoutThread), (nsIRunnable*) this,
                    0, threadState);
  if (NS_FAILED(rv))
    return rv;

  mStdoutThread = stdoutThread;

  return NS_OK;
}

nsresult
nsStdoutPoller::Finalize(PRBool destructor)
{
  nsresult rv = NS_OK;

  if (mFinalized)
    return NS_OK;

  mFinalized = PR_TRUE;

  {
    nsAutoLock lock(mLock);
    // Set thread interrupted flag to avoid race conditions
    // when freeing mStdoutThread/mPollableEvent
    mInterrupted = PR_TRUE;
  }

  DEBUG_LOG(("nsStdoutPoller::Finalize:\n"));

  nsCOMPtr<nsIPipeTransportPoller> self;
  if (!destructor) {
    // Hold a reference to ourselves to prevent our DTOR from being called
    // while finalizing. Automatically released upon returning.
    self = this;
  }

  // Release refs to input arguments
  mOutputStream = nsnull;
  mProxyPipeListener = nsnull;
  mConsole = nsnull;

  // Release ref to owned thread
  mStdoutThread = nsnull;

  return rv;
}


NS_IMETHODIMP
nsStdoutPoller::GetLoggingEnabled(PRBool *aLoggingEnabled)
{
  nsAutoLock lock(mLock);

  DEBUG_LOG(("nsStdoutPoller::GetLoggingEnabled: \n"));
  *aLoggingEnabled = mLoggingEnabled;
  return NS_OK;
}

NS_IMETHODIMP
nsStdoutPoller::SetLoggingEnabled(PRBool aLoggingEnabled)
{
  nsAutoLock lock(mLock);

  DEBUG_LOG(("nsStdoutPoller::SetLoggingEnabled: %d\n", aLoggingEnabled));
  mLoggingEnabled = aLoggingEnabled;
  return NS_OK;
}


NS_IMETHODIMP
nsStdoutPoller::IsInterrupted(PRBool* interrupted)
{
  nsAutoLock lock(mLock);
  
#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsStdoutPoller::IsInterrupted: %p, myThread=%p\n", 
         mInterrupted, myThread.get()));
#endif

  if (!interrupted)
    return NS_ERROR_NULL_POINTER;

  *interrupted = mInterrupted;

  return NS_OK;
}


/** Joins polling thread (blocks until thread terminates)
 */
NS_IMETHODIMP
nsStdoutPoller::Join()
{
  nsresult rv;

  if (!mJoinableThread)
    return NS_ERROR_FAILURE;

  if (!mStdoutThread)
    return NS_OK;

  rv = mStdoutThread->Join();
  mStdoutThread = nsnull;

  return rv;
}


/** Interrupts polling thread. Maybe called from any thread.
 * Once interrupted, thread always remains interrupted.
 */
NS_IMETHODIMP
nsStdoutPoller::Interrupt(PRBool* alreadyInterrupted)
{
  {
    nsAutoLock lock(mLock);

    if (!alreadyInterrupted)
      *alreadyInterrupted = mInterrupted;

    if (mInterrupted)
      return NS_OK;

    mInterrupted = PR_TRUE;
  }

  nsresult rv;
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsStdoutPoller::Interrupt: myThread=%p\n", myThread.get()));
#endif

  if (mPollableEvent) {
    // Interrupt thread
    PRStatus status;

    // Set pollable event to wake up thread
    status = PR_SetPollableEvent(mPollableEvent);
    if (status != PR_SUCCESS)
      return NS_ERROR_FAILURE;

  } else if (mStdoutThread) {
    // Interrupt thread; may fail
    mStdoutThread->Interrupt();
  }

  return NS_OK;
}

nsresult
nsStdoutPoller::GetPolledFD(PRFileDesc*& aFileDesc)
{
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

  DEBUG_LOG(("nsStdoutPoller::GetPolledFD: PR_Poll returned value = %d\n", pollRetVal));

  if (pollRetVal < 0) {
    // PR_Poll error exit

    PRErrorCode errCode = PR_GetError();
    if (errCode == PR_PENDING_INTERRUPT_ERROR) {
      // Note: Interrupted; need to close all FDs
#ifdef FORCE_PR_LOG
      nsCOMPtr<nsIThread> myThread;
      rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
      DEBUG_LOG(("nsStdoutPoller::GetPolledFD: Interrupted (NSPR) while polling, myThread=0x%p\n", myThread.get()));
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

  // PR_Poll input available (pollRetVal > 0); process it
  PRBool errFlags = PR_FALSE;
  for (int j=0; j<mPollCount; j++) {

    DEBUG_LOG(("nsStdoutPoller::GetPolledFD: mPollFD[%d].out_flags=0x%p\n",
            j, mPollFD[j].out_flags));

    if (mPollFD[j].out_flags) {
      // Out flags set for FD

      if (mPollFD[j].fd == mPollableEvent) {
        // Pollable event; return with null FD and normal status
        DEBUG_LOG(("nsStdoutPoller::GetPolledFD: mPollFD[%d]: Pollable event\n", j));

        PR_WaitForPollableEvent(mPollableEvent);
        return NS_OK;

      } else if (mPollFD[j].out_flags & POLL_READ_FLAGS) {
        // Data available for reading from file descriptor (normal return)
        aFileDesc = mPollFD[j].fd;

        DEBUG_LOG(("nsStdoutPoller::GetPolledFD: mPollFD[%d]: Ready for reading\n", j));
        return NS_OK;

      } else {
        // Exception/error condition; check next FD
#ifdef FORCE_PR_LOG
        nsCOMPtr<nsIThread> myThread;
        rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
        WARNING_LOG(("nsStdoutPoller::GetPolledFD: mPollFD[%d]: Exception/error 0x%x, myThread=0x%x\n",
         j, mPollFD[j].out_flags, myThread.get()));
#endif
        errFlags = PR_TRUE;
      }
    }
  }

  // Return with null FD and normal status
  return NS_OK;
}



nsresult
nsStdoutPoller::HeaderSearch(const char* buf, PRUint32 count,
                             PRUint32 *headerOffset)
{
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

  if (mHeadersBufSize <= 0) {
    // Not looking for MIME headers; start request
    startRequest = PR_TRUE;

  } else {

    PRUint32 headersAvailable = mHeadersBufSize - mHeadersBuf.Length();
    NS_ASSERTION(headersAvailable > 0, "headersAvailable <= 0");

    PRBool lastSegment = (headersAvailable <= count);

    PRUint32 offset = 0;

    if (!buf || (count <= 0)) {
      // Error/end-of-file; end headers search unsuccessfully
      startRequest = PR_TRUE;

    } else {
      PRUint32 scanLen = lastSegment ? headersAvailable : count;

      if (mHeadersBuf.Length() == 0)
        mHeadersLastNewline = 1;

      offset = scanLen;

      PRUint32 j = 0;
      while (j<scanLen) {

        if (mHeadersLastNewline > 0) {
          if ((mHeadersLastNewline == 1) && (buf[j] == '\r')) {
            // Skip over a single CR following a newline
            j++;
            mHeadersLastNewline++;
            if (j>=scanLen) break;
          }

          if (buf[j] == '\n') {
            // End-of-headers found
            offset = j+1;
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
    if (NS_FAILED(rv)) return rv;

    if (!skipHeaders && (mHeadersBufSize > 0)) {
      // Header search/parse failed; flush buffered data
      if (mOutputStream) {
        PRUint32 writeCount = 0;
        rv = mOutputStream->Write(mHeadersBuf.get(),
                                  mHeadersBuf.Length(), &writeCount);
        if (NS_FAILED(rv)) return rv;
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
  nsresult rv = NS_OK;

#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
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
    if (NS_FAILED(rv)) return rv;

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
        DEBUG_LOG(("nsStdoutPoller::Run: ***** Joining console *****\n"));
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
NS_IMPL_THREADSAFE_ISUPPORTS2 (nsStdinWriter,
                               nsIPipeTransportWriter,
                               nsIRunnable)


// nsStdinWriter implementation
nsStdinWriter::nsStdinWriter()
  : mInputStream(nsnull),
    mCount(0),
    mPipe(IPC_NULL_HANDLE),
    mCloseAfterWrite(PR_FALSE)
{
    NS_INIT_ISUPPORTS();

#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsStdinWriter:: <<<<<<<<< CTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif
}


nsStdinWriter::~nsStdinWriter()
{
  nsresult rv;
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsStdinWriter:: >>>>>>>>> DTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

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

  mInputStream = inStr;
  mCount = count;
  mPipe = pipe;
  mCloseAfterWrite = closeAfterWrite;

  // Spin up a new thread to handle writing (non-joinable)
  nsCOMPtr<nsIThread> thread;
  nsresult rv = NS_NewThread(getter_AddRefs(thread), (nsIRunnable*) this);
  if (NS_FAILED(rv))
    return rv;

  return NS_OK;
}
///////////////////////////////////////////////////////////////////////////////
// nsIRunnable methods:
// (runs as a new thread)
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsStdinWriter::Run()
{
  nsresult rv = NS_OK;

#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
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

    if (readCount <= 0) {
      rv = NS_ERROR_FAILURE;
      break;
    }

    mCount -= readCount;

    PRInt32 writeCount = 0;
    writeCount = IPC_Write(mPipe, buf, readCount);

    if (writeCount != (int) readCount) {
      PRErrorCode errCode = IPC_GetError();
      DEBUG_LOG(("nsStdinWriter::Run: Error in writing to fd %p (count=%d, writeCount=%d, error code=%d)\n",
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
