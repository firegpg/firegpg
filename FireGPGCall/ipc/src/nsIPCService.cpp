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
#include "nspr.h"
#include "nsXPIDLString.h"
#include "nsCRT.h"
#include "nsReadableUtils.h"

#include "nsIServiceManager.h"
#include "nsIObserverService.h"
#include "nsIIOService.h"
#include "nsIInputStream.h"
#include "nsIByteArrayInputStream.h"
#include "nsIStringStream.h"
#include "nsIHttpChannel.h"
#include "nsIChannel.h"
#include "nsIURL.h"
#include "nsIScriptSecurityManager.h"
#include "nsNetUtil.h"

#include "nsIPipeConsole.h"
#include "nsIPipeTransport.h"
#include "nsIPCService.h"

#include "nsIPCModule.h"
#include "nsIPCBuffer.h"

#ifdef PR_LOGGING
PRLogModuleInfo* gIPCServiceLog = NULL;
#endif

#define ERROR_LOG(args)    PR_LOG(gIPCServiceLog,PR_LOG_ERROR,args)
#define WARNING_LOG(args)  PR_LOG(gIPCServiceLog,PR_LOG_WARNING,args)
#define DEBUG_LOG(args)    PR_LOG(gIPCServiceLog,PR_LOG_DEBUG,args)

#define IPCSERVICE_COOKIE_DIGITS 16
#define MAX_DATA_BYTES 2000000
static const PRUint32 kCharMax = 1024;

///////////////////////////////////////////////////////////////////////////////

nsIPCService::nsIPCService()
    : mInitialized(PR_FALSE)
{
  NS_INIT_ISUPPORTS();

#ifdef PR_LOGGING
  if (gIPCServiceLog == nsnull) {
    gIPCServiceLog = PR_NewLogModule("nsIPCService");
    PR_LOG(gIPCServiceLog,PR_LOG_ALWAYS,("Logging nsIPCService...\n"));
  }
#endif

  DEBUG_LOG(("nsIPCService:: <<<<<<<<< CTOR(%p)\n", this));
}

nsIPCService::~nsIPCService()
{

  DEBUG_LOG(("nsIPCService:: >>>>>>>>> DTOR(%p)\n", this));
}

//
// --------------------------------------------------------------------------
// nsISupports implementation...
// --------------------------------------------------------------------------
//

NS_IMPL_THREADSAFE_ISUPPORTS2(nsIPCService, nsIIPCService, nsIObserver)

NS_METHOD
nsIPCService::Init()
{
  nsresult rv;

  DEBUG_LOG(("nsIPCService::Init:\n"));

  if (mInitialized)
    return NS_OK;

  mInitialized = PR_TRUE;

  // Create a non-joinable pipeconsole
  mConsole = do_CreateInstance(NS_PIPECONSOLE_CONTRACTID, &rv);
  if (NS_FAILED(rv)) return rv;

  rv = mConsole->Open(500, 80, PR_FALSE);
  if (NS_FAILED(rv)) return rv;

  nsCOMPtr<nsIObserverService> observerSvc = 
           do_GetService("@mozilla.org/observer-service;1");

  if (observerSvc) {
    observerSvc->AddObserver(NS_STATIC_CAST(nsIObserver*, this),
                             NS_XPCOM_SHUTDOWN_OBSERVER_ID, PR_FALSE);
  }

  return NS_OK;
}

NS_METHOD
nsIPCService::Shutdown()
{
  DEBUG_LOG(("nsIPCService::Shutdown:\n"));

  if (!mInitialized)
    return NS_OK;

  if (mConsole) {
    mConsole->Shutdown();
    mConsole = nsnull;
  }

  IPC_Shutdown();

  nsCOMPtr<nsIObserverService> observerSvc = 
           do_GetService("@mozilla.org/observer-service;1");

  if (observerSvc) {
    observerSvc->RemoveObserver(NS_STATIC_CAST(nsIObserver*, this),
                                NS_XPCOM_SHUTDOWN_OBSERVER_ID);
  }

  mInitialized = PR_FALSE;

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIIPCService methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsIPCService::GetVersion(char **_retval)
{
  *_retval = nsCRT::strdup(IPC_MODULE_VERSION);
  if (!*_retval)
    return NS_ERROR_OUT_OF_MEMORY;

  DEBUG_LOG(("nsIPCService::GetVersion: %s\n", *_retval));
  return NS_OK;
}

NS_IMETHODIMP
nsIPCService::GetConsole(nsIPipeConsole* *_retval)
{

  if (!_retval || !mConsole)
    return NS_ERROR_FAILURE;

  NS_IF_ADDREF(*_retval = mConsole);
  return NS_OK;
}

NS_METHOD
nsIPCService::ExecCommand(const char* command,
                          PRBool useShell,
                          const char **env, PRUint32 envCount,
                          nsIPipeListener* errConsole,
                          nsIPipeTransport** _retval)
{
  nsresult rv;

  DEBUG_LOG(("nsIPCService::ExecCommand: %s [%d]\n", command, envCount));

  if (!_retval || !command)
    return NS_ERROR_NULL_POINTER;

  *_retval = nsnull;

  // Create a pipetransport instance
  nsCOMPtr<nsIPipeTransport> pipeTrans = do_CreateInstance(NS_PIPETRANSPORT_CONTRACTID, &rv);
  if (NS_FAILED(rv)) return rv;

  PRBool noProxy = PR_FALSE;
  PRBool mergeStderr = PR_FALSE;

  nsCOMPtr<nsIPipeListener> console (errConsole);

  if (!errConsole)
    errConsole = mConsole;

  if (useShell) {
#ifdef XP_WIN
    nsCAutoString commandStr ("command.com /c ");
    commandStr.Append(command);

    rv = pipeTrans->InitCommand(commandStr.get(),
                                env, envCount,
                                0, "",
                                noProxy, mergeStderr,
                                console);
    if (NS_FAILED(rv)) return rv;
#elif defined(XP_OS2)
    nsCAutoString commandStr ("cmd.exe /c ");
    commandStr.Append(command);

    rv = pipeTrans->InitCommand(commandStr.get(),
                                env, envCount,
                                0, "",
                                noProxy, mergeStderr,
                                console);
    if (NS_FAILED(rv)) return rv;
#else
    const char *executable = "/bin/sh";
    const char *args[] = {"-c", command};

    rv = pipeTrans->Init(executable,
                         (const char **)args, 2,
                         env, envCount,
                         0, "",
                         noProxy, mergeStderr,
                         console);
    if (NS_FAILED(rv)) return rv;
#endif
  } else {
    rv = pipeTrans->InitCommand(command,
                                env, envCount,
                                0, "",
                                noProxy, mergeStderr,
                                console);
    if (NS_FAILED(rv)) return rv;
  }

  NS_IF_ADDREF(*_retval = pipeTrans);
  return NS_OK;
}

NS_IMETHODIMP
nsIPCService::ExecSh(const char *command, char **_retval)
{
  DEBUG_LOG(("nsIPCService::ExecSh: %s\n", command));

  PRInt32 exitCode;
  return ExecPipe(command, PR_TRUE, nsnull, nsnull, 0, nsnull, 0,
                   _retval, nsnull, nsnull, nsnull, &exitCode);
}

NS_IMETHODIMP
nsIPCService::Exec(const char *command, char **_retval)
{
  DEBUG_LOG(("nsIPCService::Exec: %s\n", command));

  PRInt32 exitCode;
  return ExecPipe(command, PR_FALSE, nsnull, nsnull, 0, nsnull, 0,
                  _retval, nsnull, nsnull, nsnull, &exitCode);
}

// If outputError is null, use default console to capture error output
NS_IMETHODIMP
nsIPCService::ExecPipe(const char* command,
                       PRBool useShell,
                       const char* preInput,
                       const char* inputData, PRUint32 inputLength,
                       const char** env, PRUint32 envCount,
                       char** outputData, PRUint32* outputCount,
                       char** outputError, PRUint32* errorCount,
                       PRInt32* _retval)
{
  nsresult rv;

  DEBUG_LOG(("nsIPCService::ExecPipe: %s (%d)\n", command, inputLength));

  if (!_retval || !outputData || !command)
    return NS_ERROR_NULL_POINTER;

  *_retval = nsnull;
  *outputData = nsnull;

  nsCOMPtr<nsIPipeListener> pipeConsole;

  if (!outputError) {
    // Use default console
    pipeConsole = mConsole;

  } else {
    // Create a pipeconsole instance and open it
    *outputError = nsnull;
    *errorCount = 0;

    nsCOMPtr<nsIIPCBuffer> temBuffer = do_CreateInstance(NS_IPCBUFFER_CONTRACTID, &rv);
    if (NS_FAILED(rv)) return rv;

    rv = temBuffer->Open(MAX_DATA_BYTES, PR_FALSE);
    if (NS_FAILED(rv)) return rv;

    pipeConsole = do_QueryInterface(temBuffer);
    if (!pipeConsole)
      return NS_ERROR_FAILURE;
  }

  nsCAutoString commandStr (command);
  nsCAutoString commandOut ("");

  // Create a pipetransport instance to execute command
  nsCOMPtr<nsIPipeTransport> pipeTrans;
  rv = ExecCommand(command, useShell, env, envCount, pipeConsole,
                   getter_AddRefs(pipeTrans) );
  if (NS_FAILED(rv)) return rv;

  nsCOMPtr<nsIInputStream> inputStream;
  rv = pipeTrans->OpenInputStream(0, PRUint32(-1), 0,
                                  getter_AddRefs(inputStream));
  if (NS_FAILED(rv)) return rv;

  if (preInput && strlen(preInput)) {
    // Write pre-input data to process STDIN synchronously
    // (ignore errors, because process may already have exited, closing STDIN)
    rv = pipeTrans->WriteSync(preInput, strlen(preInput));
  }

  if (inputData && inputLength) {
    // Write input data to process stdin asynchronously
    char* inputBuf = (char*) nsMemory::Alloc(inputLength + 1);
    if (!inputBuf)
      return NS_ERROR_OUT_OF_MEMORY;

    memcpy(inputBuf, inputData, inputLength);

    nsCOMPtr<nsIByteArrayInputStream> byteInStream;
    rv = NS_NewByteArrayInputStream(getter_AddRefs(byteInStream),
                                    inputBuf, 
                                    inputLength);
    if (NS_FAILED(rv)) {
      nsMemory::Free(inputBuf);
      return NS_ERROR_FAILURE;
    }

    rv = pipeTrans->WriteAsync(byteInStream, inputLength, PR_TRUE);
    if (NS_FAILED(rv)) return rv;

  } else {
    // Close process STDIN
    rv = pipeTrans->CloseStdin();
    if (NS_FAILED(rv)) return rv;
  }

  PRUint32 readCount;
  char buf[kCharMax];

  while (1) {
    // Read and append output until end-of-file

    rv = inputStream->Read((char *) buf, kCharMax, &readCount);
    if (NS_FAILED(rv)) return rv;

    if (!readCount) break;

    commandOut.Append(buf, readCount);

    if (commandOut.Length() > MAX_DATA_BYTES) {
      DEBUG_LOG(("nsIPCService::ExecPipe: OVERFLOW - %d chars read on stdout\n", commandOut.Length() ));
      return NS_ERROR_FAILURE;
    }
  }

  // Close input stream
  inputStream->Close();

  if (outputError) {
    // Extract STDERR output
    rv = pipeConsole->GetByteData(errorCount, outputError);
    if (NS_FAILED(rv)) return rv;

    // Shutdown STDERR console
    pipeConsole->Shutdown();

    DEBUG_LOG(("nsIPCService::ExecPipe: errlen=%d\n", *errorCount));
  }

  DEBUG_LOG(("nsIPCService::ExecPipe: outlen=%d\n", commandOut.Length()));

  if (outputCount) {
    *outputCount = commandOut.Length();

    // Copy bytes
    *outputData = NS_REINTERPRET_CAST(char*,
                                      nsMemory::Alloc((*outputCount)+1));

    if (*outputData) {
      memcpy(*outputData, commandOut.get(), *outputCount);
      // NUL terminate byte array (just to be safe!)
      (*outputData)[*outputCount] = '\0';
    }

  } else {
    // Replace any NULs with '0' and return NUL terminated string
    commandOut.ReplaceChar(char(0),'0');
    *outputData = ToNewCString(commandOut);
  }

  if (!*outputData) {
    if (outputError && *outputError) {
      // Free error output string
      nsMemory::Free(*outputError);
      *outputError = nsnull;
    }
    return NS_ERROR_OUT_OF_MEMORY;
  }

  // Terminate process to release resources
  pipeTrans->Terminate();

  return pipeTrans->ExitCode(_retval);
}

NS_IMETHODIMP
nsIPCService::ExecAsync(const char* command,
                        PRBool useShell,
                        const char* preInput,
                        const char* inputData, PRUint32 inputLength, 
                        const char** env, PRUint32 envCount,
                        nsIPipeListener* outConsole,
                        nsIPipeListener* errConsole,
                        nsIRequestObserver* requestObserver,
                        nsIIPCRequest** _retval)
{
  nsresult rv;

  DEBUG_LOG(("nsIPCService::ExecAsync: %s (%d)\n", command, inputLength));

  if (!_retval || !command)
    return NS_ERROR_NULL_POINTER;

  *_retval = nsnull;

  // Create a pipetransport instance to execute command
  nsCOMPtr<nsIPipeTransport> pipeTrans;
  rv = ExecCommand(command, useShell, env, envCount,
                   errConsole, getter_AddRefs(pipeTrans) );
  if (NS_FAILED(rv)) return rv;

  // Create and initialize IPC request object
  nsIPCRequest* rawIPCRequest = new nsIPCRequest();
  if (!rawIPCRequest)
    return NS_ERROR_OUT_OF_MEMORY;

  nsCOMPtr<nsIIPCRequest> ipcRequest;
  ipcRequest = rawIPCRequest;

  rv = ipcRequest->Init(command, pipeTrans, outConsole, errConsole);
  if (NS_FAILED(rv)) return rv;

  if (outConsole && requestObserver) {
    rv = outConsole->Observe(requestObserver, ipcRequest);
    if (NS_FAILED(rv)) return rv;
  }

  // Asynchronous capturing of output by console
  nsCOMPtr<nsIRequest> pipeRequest;
  rv = pipeTrans->AsyncRead(outConsole ? outConsole : mConsole.get(),
                            nsnull, 0, PRUint32(-1), 0,
                            getter_AddRefs(pipeRequest) );
  if (NS_FAILED(rv)) return rv;

  if (preInput && strlen(preInput)) {
    // Write pre-input data to process STDIN synchronously
    // (ignore errors, because process may already have exited, closing STDIN)
    rv = pipeTrans->WriteSync(preInput, strlen(preInput));
  }

  if (inputData && inputLength) {
    // Write input data to process stdin asynchronously
    char* inputBuf = (char*) nsMemory::Alloc(inputLength + 1);
    if (!inputBuf)
      return NS_ERROR_OUT_OF_MEMORY;

    memcpy(inputBuf, inputData, inputLength);

    nsCOMPtr<nsIByteArrayInputStream> byteInStream;
    rv = NS_NewByteArrayInputStream(getter_AddRefs(byteInStream),
                                    inputBuf, 
                                    inputLength);
    if (NS_FAILED(rv)) {
      nsMemory::Free(inputBuf);
      return NS_ERROR_FAILURE;
    }

    rv = pipeTrans->WriteAsync(byteInStream, inputLength, PR_TRUE);
    if (NS_FAILED(rv)) return rv;

  } else {
    // Close process STDIN
    rv = pipeTrans->CloseStdin();
    if (NS_FAILED(rv)) return rv;
  }

  NS_IF_ADDREF(*_retval = ipcRequest);
  return NS_OK;
}


NS_IMETHODIMP
nsIPCService::GetRandomTime(PRUint32 *_retval)
{
  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  // Current local time (microsecond resolution)
  PRExplodedTime localTime;
  PR_ExplodeTime(PR_Now(), PR_LocalTimeParameters, &localTime);

  PRUint32       randomNumberA = localTime.tm_sec*1000000+localTime.tm_usec;

  // Elapsed time (1 millisecond to 10 microsecond resolution)
  PRIntervalTime randomNumberB = PR_IntervalNow();

  DEBUG_LOG(("nsIPCService::GetRandomTime: ranA=0x%p, ranB=0x%p\n",
                                           randomNumberA, randomNumberB));

  *_retval = ((randomNumberA & 0xFFFFF) << 12) | (randomNumberB & 0xFFF);

  return NS_OK;
}


NS_IMETHODIMP
nsIPCService::GetRandomHex(PRUint32 nDigits, char **_retval)
{
  DEBUG_LOG(("nsIPCService::GetRandomHex: %d\n", nDigits));

  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  if (nDigits < 1)
    return NS_ERROR_FAILURE;

  // Get random noise
  PRSize nBytes = (nDigits+1)/2;
  PRBool discardOneDigit = (nBytes*2 == nDigits+1);

  unsigned char *randomBuf = (unsigned char*) PR_Malloc(sizeof(char *)
                                                        * nBytes );
  PRSize randomBytes = PR_GetRandomNoise((void*)randomBuf, nBytes);

  if (randomBytes < nBytes) {
    PR_Free(randomBuf);
    return NS_ERROR_NOT_AVAILABLE;
  }

  // Convert random bytes to hexadecimal string
  nsCAutoString hex ("");
  for (PRUint32 j=0; j<nBytes; j++) {
     PRInt32 value = randomBuf[j];
     if (discardOneDigit && (j == nBytes-1)) {
       value = value % 16;
     } else if (value < 16) {
       hex.Append("0");
     }
     hex.AppendInt(value, 16);
  }

  PR_Free(randomBuf);

  *_retval = ToNewCString(hex);

  return NS_OK;
}


NS_IMETHODIMP
nsIPCService::GetCookie(char **_retval)
{
  nsresult rv;

  DEBUG_LOG(("nsIPCService::GetCookie:\n"));
  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  if (!mCookieStr.Length()) {
    // Initialize cookie with random time
    PRUint32 randomTime;
    rv = GetRandomTime(&randomTime);
    if (NS_FAILED(rv)) return rv;
    DEBUG_LOG(("nsIPCService::GetCookie: randomTime=%p\n", randomTime));

    // Convert to hexadecimal
    mCookieStr = "";
    for (PRUint32 j=0; j<8; j++) {
     mCookieStr.AppendInt(randomTime % 16, 16);
     randomTime = randomTime >> 4;
    }

    DEBUG_LOG(("nsIPCService::GetCookie: cookie(%d)=%s\n", mCookieStr.Length(),
               mCookieStr.get()));
  }

  *_retval = ToNewCString(mCookieStr);
  return NS_OK;
}


NS_IMETHODIMP
nsIPCService::NewStringChannel(nsIURI* aURI, const nsACString &aContentType,                                  const nsACString &aContentCharset,
                               const char *aData, nsIChannel **result)
{
  nsresult rv;

  DEBUG_LOG(("nsIPCService::NewStringChannel:\n"));
  nsCOMPtr<nsIInputStream> inputStream;
  rv = NS_NewCharInputStream(getter_AddRefs(inputStream), aData);
  if (NS_FAILED(rv)) return rv;

  nsCAutoString contentType(aContentType);
  nsCAutoString contentCharset(aContentCharset);

  if (contentCharset.IsEmpty())
    NS_ParseContentType(aContentType, contentType, contentCharset);

  nsCOMPtr<nsIChannel> channel;
  rv = NS_NewInputStreamChannel(result,
                                aURI,
                                inputStream,
                                contentType,
                                contentCharset
#ifndef MOZILLA_VERSION
  // Mods for Mozilla version prior to 1.3b
                                ,strlen(aData)
#endif
                                );

  if (NS_FAILED(rv)) return rv;

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIObserver methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsIPCService::Observe(nsISupports *aSubject, const char *aTopic,
                      const PRUnichar *someData)
{
  DEBUG_LOG(("nsIPCService::Observe: %s\n", aTopic));

  if (!nsCRT::strcmp(aTopic, NS_XPCOM_SHUTDOWN_OBSERVER_ID)) {
    // Shutdown IPC service on XPCOM shutdown
    Shutdown();
  }
  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////

// nsIPCRequest implementation

// nsISupports implementation
NS_IMPL_THREADSAFE_ISUPPORTS1 (nsIPCRequest, nsIIPCRequest)


// nsIPCRequest implementation
nsIPCRequest::nsIPCRequest()
  : mCommand(""),
    mPipeTransport(nsnull),
    mStdoutConsole(nsnull),
    mStderrConsole(nsnull)
{
    NS_INIT_ISUPPORTS();

    DEBUG_LOG(("nsIPCRequest:: <<<<<<<<< CTOR(%p)\n", this));
}


nsIPCRequest::~nsIPCRequest()
{
  DEBUG_LOG(("nsIPCRequest:: >>>>>>>>> DTOR(%p)\n", this));
  mPipeTransport = nsnull;
  mStdoutConsole = nsnull;
  mStderrConsole = nsnull;
}

///////////////////////////////////////////////////////////////////////////////
// nsIIPCRequest methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsIPCRequest::Init(const char *aCommand, nsIPipeTransport* aPipeTransport,
                   nsIPipeListener* aStdoutConsole,
                   nsIPipeListener* aStderrConsole)
{

  DEBUG_LOG(("nsIPCRequest::Init: %s\n", aCommand));

  mCommand.Assign(aCommand);

  mPipeTransport = aPipeTransport;
  mStdoutConsole = aStdoutConsole;
  mStderrConsole = aStderrConsole;

  return NS_OK;
}

NS_IMETHODIMP
nsIPCRequest::Close(PRBool closeConsoles)
{
  DEBUG_LOG(("nsIPCRequest::Close: %d\n", (int) closeConsoles));
  mCommand.Assign("");

  if (mPipeTransport)
    mPipeTransport->Terminate();
  mPipeTransport = nsnull;

  if (mStdoutConsole && closeConsoles)
    mStdoutConsole->Shutdown();
  mStdoutConsole = nsnull;

  if (mStderrConsole && closeConsoles)
    mStderrConsole->Shutdown();
  mStderrConsole = nsnull;

  return NS_OK;
}


NS_IMETHODIMP
nsIPCRequest::IsPending(PRBool *_retval)
{

  DEBUG_LOG(("nsIPCRequest::IsPending:\n"));
  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  if (!mPipeTransport) {
    *_retval = PR_FALSE;
    return NS_OK;
  }

  return mPipeTransport->IsAttached(_retval);
}

NS_IMETHODIMP
nsIPCRequest::GetCommand(char **_retval)
{

  DEBUG_LOG(("nsIPCRequest::GetCommand:\n"));
  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  *_retval = ToNewCString(mCommand);

  return *_retval ? NS_OK : NS_ERROR_OUT_OF_MEMORY;
}

NS_IMETHODIMP
nsIPCRequest::GetPipeTransport(nsIPipeTransport* *_retval)
{
  //DEBUG_LOG(("nsIPCRequest::GetPipeTransport:\n"));
  if (!_retval || !mPipeTransport)
    return NS_ERROR_FAILURE;

  NS_IF_ADDREF(*_retval = mPipeTransport);
  return NS_OK;
}

NS_IMETHODIMP
nsIPCRequest::GetStdoutConsole(nsIPipeListener* *_retval)
{
  //DEBUG_LOG(("nsIPCRequest::GetStdoutConsole:\n"));
  if (!_retval || !mStdoutConsole)
    return NS_ERROR_FAILURE;

  NS_IF_ADDREF(*_retval = mStdoutConsole);
  return NS_OK;
}

NS_IMETHODIMP
nsIPCRequest::GetStderrConsole(nsIPipeListener* *_retval)
{
  //DEBUG_LOG(("nsIPCRequest::GetStderrConsole:\n"));
  if (!_retval || !mStderrConsole)
    return NS_ERROR_FAILURE;

  NS_IF_ADDREF(*_retval = mStderrConsole);
  return NS_OK;
}
