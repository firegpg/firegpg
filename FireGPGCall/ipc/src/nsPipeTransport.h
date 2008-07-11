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

#ifndef nsPipeTransport_h__
#define nsPipeTransport_h__

#include "nspr.h"
#include "IPCProcess.h"

#include "nsIPipeTransport.h"
#include "nsIPipeListener.h"
#include "nsIRunnable.h"
#include "nsIEventQueueService.h"
#include "nsIInterfaceRequestor.h"
#include "nsITransport.h"
#include "nsIChannel.h"
#include "nsIPipe.h"
#include "nsIFile.h"
#include "nsIThread.h"
#include "nsILoadGroup.h"
#include "nsCOMPtr.h"
#include "nsString.h"
#include "nsIStreamListener.h"
#include "nsIInputStream.h"
#include "nsIOutputStream.h"

#ifdef MOZILLA_VERSION
#include "nsIAsyncInputStream.h"
#include "nsIAsyncOutputStream.h"
#else
// Mods for Mozilla version prior to 1.3b
#include "nsIObservableInputStream.h"
#include "nsIObservableOutputStream.h"
#endif

#define NS_PIPE_TRANSPORT_DEFAULT_SEGMENT_SIZE   (2*1024)
#define NS_PIPE_TRANSPORT_DEFAULT_BUFFER_SIZE    (8*1024)
#define NS_PIPE_TRANSPORT_DEFAULT_HEADERS_SIZE   (4*1024)

class nsStdoutPoller;

class nsPipeTransport : public nsIPipeTransport,
                        public nsIPipeTransportListener,
                        public nsIOutputStream,
                        public nsIStreamListener,
#ifdef MOZILLA_VERSION
                        public nsIInputStreamCallback,
                        public nsIOutputStreamCallback
#else
// Mods for Mozilla version prior to 1.3b
                        public nsIInputStreamObserver,
                        public nsIOutputStreamObserver
#endif

{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIPIPETRANSPORT
    NS_DECL_NSIPIPETRANSPORTHEADERS
    NS_DECL_NSIPIPETRANSPORTLISTENER
    NS_DECL_NSIREQUEST
    NS_DECL_NSIREQUESTOBSERVER
    NS_DECL_NSIOUTPUTSTREAM
    NS_DECL_NSISTREAMLISTENER

#ifdef MOZILLA_VERSION
    NS_DECL_NSIINPUTSTREAMCALLBACK
    NS_DECL_NSIOUTPUTSTREAMCALLBACK
#else
    // Mods for Mozilla version prior to 1.3b
    NS_DECL_NSIINPUTSTREAMOBSERVER
    NS_DECL_NSIOUTPUTSTREAMOBSERVER
#endif

    // nsPipeTransport methods:
    nsPipeTransport();
    // Always make the destructor virtual: 
    virtual ~nsPipeTransport();

    nsresult Finalize(PRBool destructor);

    void KillProcess(void);

    // Define a Create method to be used with a factory:
    static NS_METHOD
    Create(nsISupports* aOuter, const nsIID& aIID, void* *aResult);
    
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

protected:
    PRBool                              mFinalized;
    PRBool                              mNoProxy;
    PRBool                              mStartedRequest;
    PRMonitor*                          mMonitor;

    PipeState                           mPipeState;
    StreamState                         mStdoutStream;
    nsresult                            mCancelStatus;

    nsLoadFlags                         mLoadFlags;
    PRUint32                            mNotificationFlags;

    nsCString                           mExecutable;
    nsCString                           mCommand;
    nsCString                           mKillString;

    IPCProcess*                         mProcess;
    PRIntervalTime                      mKillWaitInterval;
    PRInt32                             mExitCode;

    PRUint32                            mBufferSegmentSize;
    PRUint32                            mBufferMaxSize;
    PRUint32                            mHeadersMaxSize;

    nsCString                           mExecBuf;

    IPCFileDesc*                        mStdinWrite;
    
    // Owning refs
    nsCOMPtr<nsIPipeTransportPoller>    mStdoutPoller;
    nsCOMPtr<nsIPipeListener>           mConsole;
    nsCOMPtr<nsIPipeTransportHeaders>   mHeaderProcessor;

    nsCOMPtr<nsIInputStream>            mInputStream;
    nsCOMPtr<nsIOutputStream>           mOutputStream;

    nsCOMPtr<nsIStreamListener>         mListener;
    nsCOMPtr<nsISupports>               mContext;
    nsCOMPtr<nsILoadGroup>              mLoadGroup;
};

// Helper class to handle polling of STDOUT pipe
class nsStdoutPoller : public nsIPipeTransportPoller,
                       public nsIRunnable
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIPIPETRANSPORTPOLLER
    NS_DECL_NSIRUNNABLE

    nsStdoutPoller();
    virtual ~nsStdoutPoller();

    nsresult Init(IPCFileDesc*            aStdoutRead,
                  IPCFileDesc*            aStderrRead,
                  PRIntervalTime          aTimeoutInterval,
                  nsIPipeListener*        aConsole);

    nsresult Finalize(PRBool destructor);

    PRBool IsInterrupted(void);

    nsresult GetPolledFD(PRFileDesc*& aFileDesc);

    nsresult HeaderSearch(const char* buf, PRUint32 count,
                          PRUint32 *headerOffset);
protected:
    PRBool                              mFinalized;

    PRLock*                             mLock;
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
 
// Helper class to handle write to pipe
class nsStdinWriter : public nsIPipeTransportWriter,
                      public nsIRunnable
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIPIPETRANSPORTWRITER
    NS_DECL_NSIRUNNABLE

    nsStdinWriter();
    virtual ~nsStdinWriter();

protected:
    nsCOMPtr<nsIInputStream> mInputStream;
    PRUint32                 mCount;
    IPCFileDesc*             mPipe;
    PRBool                   mCloseAfterWrite;
};
 
#endif // nsPipeTransport_h__
