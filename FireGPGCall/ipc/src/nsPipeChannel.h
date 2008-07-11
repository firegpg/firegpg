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

#ifndef nsPipeChannel_h__
#define nsPipeChannel_h__

#include "nspr.h"
#include "nsString.h"
#include "nsIPipeChannel.h"
#include "nsIEventQueueService.h"
#include "nsIPipeTransport.h"
#include "nsILoadGroup.h"
#include "nsCOMPtr.h"
#include "nsIStreamListener.h"
#include "nsIProgressEventSink.h"
#include "nsIInterfaceRequestor.h"
#include "nsIURI.h"
#include "nsIComponentManager.h"

class nsPipeChannel : public nsIPipeChannel,
                      public nsIStreamListener,
                      public nsIPipeTransportHeaders
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIREQUEST
    NS_DECL_NSICHANNEL
    NS_DECL_NSIPIPECHANNEL
    NS_DECL_NSIREQUESTOBSERVER
    NS_DECL_NSISTREAMLISTENER
    NS_DECL_NSIPIPETRANSPORTHEADERS

    // nsPipeChannel methods:
    nsPipeChannel();

    // Always make the destructor virtual: 
    virtual ~nsPipeChannel();

    nsresult Finalize(PRBool destructor);

    nsresult ParseHeader(const char* header, PRUint32 count);

    // Define a Create method to be used with a factory:
    static NS_METHOD
      Create(nsISupports* aOuter, const nsIID& aIID, void* *aResult);
    
    enum ChannelState {
      CHANNEL_NOT_YET_OPENED,
      CHANNEL_OPEN,
      CHANNEL_CLOSED
    };

protected:
    PRBool                              mFinalized;
    PRBool                              mRestricted;
    ChannelState                        mChannelState;
    PRBool                              mPostingData;
    nsresult                            mStatus;

    PRBool                              mNoMimeHeaders;

    PRInt32                             mBufferSegmentSize;
    PRInt32                             mBufferMaxSize;

    nsLoadFlags                         mLoadFlags;

    nsCString                           mContentType;
    nsCString                           mContentCharset;
    PRInt32                             mContentLength;

    nsCString                           mHeaderContentType;
    PRInt32                             mHeaderContentLength;
    nsCString                           mHeaderCharset;

    PRUint32                            mContentReceived;

    // Owning refs
    nsCOMPtr<nsIURI>                    mURI;
    nsCOMPtr<nsIURI>                    mOriginalURI;

    nsCOMPtr<nsIPipeTransport>          mPipeTransport;
    nsCOMPtr<nsIRequest>                mPipeRequest;

    nsCOMPtr<nsIStreamListener>         mListener;
    nsCOMPtr<nsISupports>               mContext;

    nsCOMPtr<nsISupports>               mOwner;
    nsCOMPtr<nsILoadGroup>              mLoadGroup;
    nsCOMPtr<nsIInterfaceRequestor>     mCallbacks;
    nsCOMPtr<nsIProgressEventSink>      mProgress;
};

#endif // nsPipeChannel_h__
