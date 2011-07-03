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


#ifndef nsPipeTransport_h__
#define nsPipeTransport_h__

#include "ipc.h"
#include "nspr.h"
#include "IPCProcess.h"

#include "nsIPipeTransport.h"
#include "nsIPipeListener.h"
#include "nsIRunnable.h"
#include "nsIInterfaceRequestor.h"
#include "nsITransport.h"
#include "nsIChannel.h"
#include "nsIPipe.h"
#include "nsIFile.h"
#include "nsIThread.h"
#include "nsILoadGroup.h"
#include "nsCOMPtr.h"
#include "nsIStreamListener.h"
#include "nsIInputStream.h"
#include "nsIOutputStream.h"
#include "nsIProcess.h"
#include "nsThreadUtils.h"
#include "nsStringGlue.h"
#include "mozilla/Mutex.h"

#include "nsIAsyncInputStream.h"
#include "nsIAsyncOutputStream.h"

#define NS_PIPE_TRANSPORT_DEFAULT_SEGMENT_SIZE   (2*1024)
#define NS_PIPE_TRANSPORT_DEFAULT_BUFFER_SIZE    (8*1024)
#define NS_PIPE_TRANSPORT_DEFAULT_HEADERS_SIZE   (4*1024)

class nsStdoutPoller;
class nsStreamDispatcher;
class nsStdinWriter;

class nsPipeTransport : public nsIPipeTransport,
                        public nsIPipeTransportListener,
                        public nsIOutputStream,
                        public nsIStreamListener,
                        public nsIInputStreamCallback,
                        public nsIOutputStreamCallback,
                        public nsIRequest
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIPIPETRANSPORT
    NS_DECL_NSIPIPETRANSPORTHEADERS
    NS_DECL_NSIPIPETRANSPORTLISTENER
    NS_DECL_NSIREQUESTOBSERVER
    NS_DECL_NSIOUTPUTSTREAM
    NS_DECL_NSISTREAMLISTENER
    NS_DECL_NSIINPUTSTREAMCALLBACK
    NS_DECL_NSIOUTPUTSTREAMCALLBACK
    NS_DECL_NSIREQUEST
    NS_DECL_NSIPROCESS

    // nsPipeTransport methods:
    nsPipeTransport();
    // Always make the destructor virtual:
    virtual ~nsPipeTransport();

    nsresult Finalize(PRBool destructor);

    void KillProcess(void);

    // Define a Create method to be used with a factory:
    static NS_METHOD
    Create(nsISupports* aOuter, const nsIID& aIID, void* *aResult);

protected:
    enum PipeState {
      PIPE_NOT_YET_OPENED,
      PIPE_OPEN,
      PIPE_CLOSED
    };

    enum StreamState {
      STREAM_NOT_YET_OPENED,
      STREAM_ASYNC_OPEN,
      STREAM_SYNC_OPEN,
      STREAM_CLOSED
    };


    PRBool                              mInitialized;
    PRBool                              mFinalized;
    PRBool                              mNoProxy;
    PRBool                              mStartedRequest;
    PRMonitor*                          mMonitor;

    PipeState                           mPipeState;
    StreamState                         mStdoutStream;
    nsresult                            mCancelStatus;

    nsLoadFlags                         mLoadFlags;
    PRUint32                            mNotificationFlags;

    nsString                            mExecutable;
    nsCString                           mCommand;
    nsCString                           mKillString;
    nsCString                           mCwd;
    PRUint32                            mStartupFlags;

    IPCProcess*                         mProcess;
    PRIntervalTime                      mKillWaitInterval;
    PRInt32                             mExitCode;
    PRInt32                             mPid;

    PRUint32                            mBufferSegmentSize;
    PRUint32                            mBufferMaxSize;
    PRUint32                            mHeadersMaxSize;

    nsCString                           mExecBuf;

    IPCFileDesc*                        mStdinWrite;

    // Owning refs
    nsCOMPtr<nsIThread>                 mCreatorThread;

    nsCOMPtr<nsStdoutPoller>            mStdoutPoller;
    nsCOMPtr<nsIPipeListener>           mStderrConsole;
    nsCOMPtr<nsIPipeTransportHeaders>   mHeaderProcessor;

    nsCOMPtr<nsIInputStream>            mInputStream;
    nsCOMPtr<nsIOutputStream>           mOutputStream;

    nsCOMPtr<nsIStreamListener>         mListener;
    nsCOMPtr<nsISupports>               mContext;
    nsCOMPtr<nsILoadGroup>              mLoadGroup;
    nsCOMPtr<nsStdinWriter>             mPipeTransportWriter;

    nsresult CopyArgsAndCreateProcess(const PRUnichar **args,
                                      PRUint32 argCount,
                                      const PRUnichar **env,
                                      PRUint32 envCount,
                                      IPCFileDesc* stdinRead,
                                      IPCFileDesc* stdoutWrite,
                                      IPCFileDesc* stderrPipe);
};

/**
  * nsStdoutPoller is a helper class to handle polling of STDOUT pipe
  */
class nsStdoutPoller : public nsIRunnable
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIRUNNABLE

    nsStdoutPoller();
    virtual ~nsStdoutPoller();

    nsresult Init(IPCFileDesc*            aStdoutRead,
                  IPCFileDesc*            aStderrRead,
                  PRIntervalTime          aTimeoutInterval,
                  nsIPipeListener*        aConsole);

    /**
     * Helper method for destructor
     * @param destructor  should be set to true if called from destructor,
     *                    false otherwise
     */

    nsresult Finalize(PRBool destructor);

    /**
     * Determine if pipe is interrupted
     */

    PRBool IsInterrupted();

    /**
     * Get the polled file descriptor to a given file descriptor
     * @param aFileDesc  file descriptor for which to determine the polled
     *                   descriptor
     */
    nsresult GetPolledFD(PRFileDesc*& aFileDesc);

    /**
     * Search for a MIME header in the stream
     * @param buf           buffer to operate on
     * @param count         number of bytes in the buffer
     * @param headerOffset  offset where header starts
     */
    nsresult HeaderSearch(const char* buf, PRUint32 count,
                          PRUint32 *headerOffset);


    /**
     * Starts polling of STDOUT
     */
    NS_IMETHODIMP AsyncStart(nsIOutputStream*  aOutputStream,
                             nsIPipeTransportListener* aProxyPipeListener,
                             PRBool joinable,
                             PRUint32 aMimeHeadersMaxSize);


    /**
     * Interrupts polling thread.
     */
    NS_IMETHODIMP Interrupt(PRBool* alreadyInterrupted);

    /**
     * Returns true if polling thread has been interrupted/
     */
    NS_IMETHODIMP IsInterrupted(PRBool* interrupted);

    /**
     * Joins polling thread, if joinable (blocking until it terminates)
     */
    NS_IMETHODIMP Join();

    /**
     * LoggingEnabled controls stderrConsole logging of STDOUT from process.
     * This is the getter method to loggingEnabled.
     */

    NS_IMETHODIMP GetLoggingEnabled(PRBool *aLoggingEnabled);

    /**
     * LoggingEnabled controls stderrConsole logging of STDOUT from process.
     * This is the setter method to loggingEnabled.
     */
    NS_IMETHODIMP SetLoggingEnabled(PRBool aLoggingEnabled);


protected:
    PRBool                              mInitialized;
    PRBool                              mFinalized;

    mozilla::Mutex                      mLock;
    PRBool                              mInterrupted;
    PRBool                              mLoggingEnabled;
    PRBool                              mJoinableThread;

    PRIntervalTime                      mTimeoutInterval;

    nsCString                           mHeadersBuf;
    PRUint32                            mHeadersBufSize;
    PRUint32                            mHeadersLastNewline;
    PRBool                              mRequestStarted;
    PRInt32                             mContentLength;

    IPCFileDesc*                        mStdoutRead;
    IPCFileDesc*                        mStderrRead;

    PRInt32                             mPollCount;
    PRFileDesc*                         mPollableEvent;
    PRPollDesc*                         mPollFD;

    // Owning refs
    nsCOMPtr<nsIThread>                 mStdoutThread;
    nsCOMPtr<nsIOutputStream>           mOutputStream;
    nsCOMPtr<nsIPipeTransportListener>  mProxyPipeListener;
    nsCOMPtr<nsIPipeListener>           mConsole;
};


/**
  * nsStdinWriter is a helper class to write data from a stream
  * to the subprocess' STDIN pipe.
  */

class nsStdinWriter : public nsIRunnable
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIRUNNABLE

    nsStdinWriter();
    virtual ~nsStdinWriter();

    /**
     * Writes count bytes from input stream to STDIN pipe (asynchronously)
     *
     * @param inStr    inputStream
     * @param count    number of bytes to write
     * @param pipe     file descriptor of the STDIN pipe
     * @param closeAfterWrite  if true, close pipe at end of reading
     */
    nsresult WriteFromStream(nsIInputStream *inStr,
                             PRUint32 count,
                             IPCFileDesc* pipe,
                             PRBool closeAfterWrite);

    /**
     * Joins writer thread, if joinable (blocking until it terminates)
     */
    NS_IMETHODIMP Join();
protected:
    nsCOMPtr<nsIInputStream> mInputStream;
    PRUint32                 mCount;
    IPCFileDesc*             mPipe;
    PRBool                   mCloseAfterWrite;
    nsCOMPtr<nsIThread>      mThread;
};

/**
 * Helper class to dispatch onStartRequest, onStopRequest and onDataAvailable
 * back to the thread that opened the nsPipeTransport.
 * Each instance of nsStreamDispatcher can dispatch exactly 1 event.
 *
 * This class is required because it is not possible to access in JavaScript
 * Strings and Objects from different threads than the one which created the
 * object.
 */

class nsStreamDispatcher : public nsIRunnable
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIRUNNABLE

    nsStreamDispatcher();
    virtual ~nsStreamDispatcher();

    /**
     * Initializer method
     *
     * @param aListener      registered listener that received the event
     * @param context        user defined context variable as specified in
     *                       nsIStreamListener.onDataAvailable
     * @param pipeTransport  the sending pipeTransport object
     */

    NS_IMETHODIMP Init(nsIStreamListener*  aListener,
                       nsISupports* context,
                       nsIRequest* pipeTransport);

    /**
     * Dispatch an "onDataAvailable" event
     *
     * @param inputStream   the input stream containing the data chunk
     * @param startOffset   total number of bytes sent in all events
     * @param count         number of bytes available in the stream
     */

    NS_IMETHODIMP DispatchOnDataAvailable(nsIInputStream* inputStream,
                                          PRUint32 startOffset,
                                          PRUint32 count);

    /**
     * Dispatch an "onStartRequest" event
     */

    NS_IMETHODIMP DispatchOnStartRequest();

    /**
     * Dispatch an "onStopRequest" event
     *
     * @param aStatusCode reason for stopping (NS_OK if completed successfully)
     */
    NS_IMETHODIMP DispatchOnStopRequest(nsresult status);


protected:

    enum DispatchType {
      UNDEFINED,
      ON_START_REQUEST,
      ON_DATA_AVAILABLE,
      ON_STOP_REQUEST
    };

    PRUint32        mDispatchType;
    PRUint32        mStartOffset;
    PRUint32        mCount;
    nsresult        mStatus;

    nsIRequest*                   mPipeTransport;
    nsCOMPtr<nsISupports>         mContext;
    nsCOMPtr<nsIInputStream>      mInputStream;
    nsCOMPtr<nsIStreamListener>   mListener;

};
#endif // nsPipeTransport_h__
