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

#ifndef nsPipeFilterListener_h__
#define nsPipeFilterListener_h__

#include "nspr.h"

#include "nsIPipeFilterListener.h"
#include "nsCOMPtr.h"
#include "nsString.h"

typedef struct LineMatchStatus LineMatchStatus;
struct LineMatchStatus {
  PRUint32 skipCount;
  PRBool matchedLine;
  PRBool matchedCR;
  PRUint32 matchOffset;
  PRUint32 matchCount;
};

// Implementation class for nsIPipeFilterListener
class nsPipeFilterListener : public nsIPipeFilterListener,
                             public nsIInputStream
{
public:
    NS_DECL_ISUPPORTS
    NS_DECL_NSIREQUESTOBSERVER
    NS_DECL_NSISTREAMLISTENER
    NS_DECL_NSIPIPEFILTERLISTENER
    NS_DECL_NSIINPUTSTREAM

    nsPipeFilterListener();
    virtual ~nsPipeFilterListener();

    // Define a Create method to be used with a factory:
    static NS_METHOD
    Create(nsISupports *aOuter, REFNSIID aIID, void **aResult);

protected:
    NS_METHOD TransmitData(const char* buf, PRUint32 count,
                           nsIStreamListener* listener,
                           nsIRequest* aRequest, nsISupports* aContext);

    NS_METHOD EndRequest(nsIRequest* aRequest, nsISupports* aContext);

    PRInt32  MatchDelimiter(const char* buf, PRUint32 bufLen,
                            LineMatchStatus& delim,
                            nsCString& delimStr,
                            nsCString& delimLine);

    PRUint32 MatchString(const char* buf, PRUint32 count,
                         const char* str, PRUint32 length,
                         PRUint32& strOffset);

    nsresult HeaderSearch(const char* buf, PRUint32 count,
                          PRUint32 *headerOffset);

    nsresult ParseMimeHeaders(const char* mimeHeaders, PRUint32 count,
                              PRInt32 *retval);

    nsresult ParseHeader(const char* header, PRUint32 count);

    static const char* const LineBreaks[3];

    PRBool                              mInitialized;
    PRBool                              mRequestStarted;
    PRBool                              mRequestEnded;
    PRBool                              mTailRequestStarted;

    nsCString                           mStartDelimiter;
    nsCString                           mEndDelimiter;

    nsCString                           mStartLine;
    nsCString                           mEndLine;

    LineMatchStatus                     mStart;
    LineMatchStatus                     mEnd;

    PRBool                              mKeepDelimiters;
    PRBool                              mMimeMultipart;

    PRBool                              mAutoMimeBoundary;
    PRBool                              mFirstMatch;
    PRBool                              mLastMatch;
    PRBool                              mSavePartMatch;

    nsCString                           mOldPartMatch;
    nsCString                           mPartMatch;
    PRUint32                            mLinebreak;

    const char*                         mStreamBuf;
    PRUint32                            mStreamOffset;
    PRUint32                            mStreamLength;

    // Owning refs
    nsCOMPtr<nsIStreamListener>         mListener;
    nsCOMPtr<nsIStreamListener>         mTailListener;
    nsCOMPtr<nsISupports>               mContext;
};
 
#endif // nsPipeFilterListener_h__
