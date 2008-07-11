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

#ifndef nsPipeConsole_h__
#define nsPipeConsole_h__

#include "nspr.h"
#include "IPCProcess.h"

#include "nsIPipeConsole.h"
#include "nsIRunnable.h"
#include "nsIThread.h"
#include "nsCOMPtr.h"
#include "nsString.h"
#include "nsIObserverService.h"
#include "nsIObserver.h"

// Implementation class for nsIPipeConsole
class nsPipeConsole : public nsIPipeConsole,
                      public nsIRunnable,
                      public nsIObserver
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIREQUESTOBSERVER
    NS_DECL_NSISTREAMLISTENER
    NS_DECL_NSIPIPELISTENER
    NS_DECL_NSIPIPECONSOLE
    NS_DECL_NSIRUNNABLE
    NS_DECL_NSIOBSERVER

    nsPipeConsole();
    virtual ~nsPipeConsole();

    // Define a Create method to be used with a factory:
    static NS_METHOD
    Create(nsISupports *aOuter, REFNSIID aIID, void **aResult);

    nsresult Finalize(PRBool destructor);

    nsresult Init();

protected:
    PRBool                              mFinalized;
    PRBool                              mJoinable;
    PRBool                              mThreadJoined;
    PRBool                              mOverflowed;

    PRLock*                             mLock;

    nsCString                           mConsoleBuf;
    PRInt32                             mConsoleMaxLines;
    PRInt32                             mConsoleMaxCols;

    PRUint32                            mByteCount;
    PRUint32                            mConsoleLines;
    PRUint32                            mConsoleLineLen;
    PRUint32                            mConsoleNewChars;

    IPCFileDesc*                        mPipeWrite;
    IPCFileDesc*                        mPipeRead;

    // Owning refs
    nsCOMPtr<nsIThread>                 mPipeThread;
    nsCOMPtr<nsIRequestObserver>        mObserver;
    nsCOMPtr<nsISupports>               mObserverContext;
};
 
#endif // nsPipeConsole_h__
