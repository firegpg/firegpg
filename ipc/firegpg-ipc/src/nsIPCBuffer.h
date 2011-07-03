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


#ifndef nsIPCBuffer_h__
#define nsIPCBuffer_h__

#include "nspr.h"

#include "nsIIPCBuffer.h"
#include "nsIInputStream.h"
#include "nsIFileStreams.h"
#include "nsIRunnable.h"
#include "nsIThread.h"
#include "nsCOMPtr.h"
#include "nsStringGlue.h"
#include "mozilla/Mutex.h"

// Implementation class for nsIIPCBuffer
class nsIPCBuffer : public nsIIPCBuffer,
                    public nsIInputStream,
                    public nsIRunnable
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIREQUESTOBSERVER
    NS_DECL_NSISTREAMLISTENER
    NS_DECL_NSIPIPELISTENER
    NS_DECL_NSIIPCBUFFER
    NS_DECL_NSIINPUTSTREAM
    NS_DECL_NSIRUNNABLE

    nsIPCBuffer();
    virtual ~nsIPCBuffer();

    // Define a Create method to be used with a factory:
    static NS_METHOD
    Create(nsISupports *aOuter, REFNSIID aIID, void **aResult);

protected:
    nsresult Finalize(PRBool destructor);
    nsresult Init();

    nsresult CreateTempFile();
    nsresult CloseTempOutStream();
    nsresult WriteTempOutStream(const char* buf, PRUint32 count);
    nsresult OpenTempInStream();
    nsresult CloseTempInStream();
    nsresult RemoveTempFile();

    PRBool                              mFinalized;
    PRBool                              mInitialized;
    PRBool                              mThreadJoined;
    PRBool                              mOverflowed;
    PRBool                              mOverflowFile;

    PRBool                              mRequestStarted;
    PRBool                              mRequestStopped;

    mozilla::Mutex                      mLock;

    PRInt32                             mMaxBytes;
    PRUint32                            mByteCount;
    PRUint32                            mStreamOffset;

    nsCString                           mByteBuf;

    IPCFileDesc*                        mPipeWrite;
    IPCFileDesc*                        mPipeRead;

    nsCOMPtr<nsILocalFile>              mTempFile;
    nsCOMPtr<nsIFileOutputStream>       mTempOutStream;
    nsCOMPtr<nsIFileInputStream>        mTempInStream;

    // Owning refs
    nsCOMPtr<nsIThread>                 mPipeThread;
    nsCOMPtr<nsIRequestObserver>        mObserver;
    nsCOMPtr<nsISupports>               mObserverContext;
};

#endif // nsIPCBuffer_h__
