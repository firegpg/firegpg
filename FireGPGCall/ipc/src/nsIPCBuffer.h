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

#ifndef nsIPCBuffer_h__
#define nsIPCBuffer_h__

#include "nspr.h"

#include "nsIIPCBuffer.h"
#include "nsIInputStream.h"
#include "nsIRunnable.h"
#include "nsIThread.h"
#include "nsCOMPtr.h"
#include "nsString.h"
#include "nsFileSpec.h"
#include "nsFileStream.h"

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

    nsresult Finalize(PRBool destructor);

    nsresult Init();

protected:
    NS_IMETHOD CreateTempFile();
    NS_IMETHOD CloseTempOutStream();
    NS_IMETHOD WriteTempOutStream(const char* buf, PRUint32 count);
    NS_IMETHOD OpenTempInStream();
    NS_IMETHOD CloseTempInStream();
    NS_IMETHOD RemoveTempFile();

    PRBool                              mFinalized;
    PRBool                              mThreadJoined;
    PRBool                              mOverflowed;
    PRBool                              mOverflowFile;

    PRBool                              mRequestStarted;
    PRBool                              mRequestStopped;

    PRLock*                             mLock;

    PRUint32                            mMaxBytes;
    PRUint32                            mByteCount;
    PRUint32                            mStreamOffset;

    nsCString                           mByteBuf;

    IPCFileDesc*                        mPipeWrite;
    IPCFileDesc*                        mPipeRead;

    nsFileSpec*                         mTempFileSpec;
    nsOutputFileStream*                 mTempOutStream;
    nsInputFileStream*                  mTempInStream;

    // Owning refs
    nsCOMPtr<nsIThread>                 mPipeThread;
    nsCOMPtr<nsIRequestObserver>        mObserver;
    nsCOMPtr<nsISupports>               mObserverContext;
};
 
#endif // nsIPCBuffer_h__
