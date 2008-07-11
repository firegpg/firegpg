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
#include "nsCOMPtr.h"
#include "nsEscape.h"
#include "nsCRT.h"
#include "nsAutoLock.h"
#include "nsFileStream.h"
#include "nsIInputStream.h"
#include "nsIThread.h"
#include "nsIHttpChannel.h"
#include "nsString.h"
#include "nsNetUtil.h"
#include "nsMimeTypes.h"

#include "nsPipeFilterListener.h"

#ifdef PR_LOGGING
PRLogModuleInfo* gPipeFilterListenerLog = NULL;
#endif

#define ERROR_LOG(args)    PR_LOG(gPipeFilterListenerLog,PR_LOG_ERROR,args)
#define WARNING_LOG(args)  PR_LOG(gPipeFilterListenerLog,PR_LOG_WARNING,args)
#define DEBUG_LOG(args)    PR_LOG(gPipeFilterListenerLog,PR_LOG_DEBUG,args)

#define NS_PIPE_CONSOLE_BUFFER_SIZE   (1024)

static const PRUint32 kCharMax = NS_PIPE_CONSOLE_BUFFER_SIZE;

#define MK_MIME_ERROR_WRITING_FILE -1

///////////////////////////////////////////////////////////////////////////////

// nsPipeFilterListener implementation

// nsISupports implementation
NS_IMPL_THREADSAFE_ISUPPORTS4(nsPipeFilterListener,
                              nsIPipeFilterListener,
                              nsIRequestObserver,
                              nsIStreamListener,
                              nsIInputStream)


// nsPipeFilterListener implementation
nsPipeFilterListener::nsPipeFilterListener()
  : mInitialized(PR_FALSE),
    mRequestStarted(PR_FALSE),
    mRequestEnded(PR_FALSE),
    mTailRequestStarted(PR_FALSE),

    mStartDelimiter(""),
    mEndDelimiter(""),

    mStartLine(""),
    mEndLine(""),

    mKeepDelimiters(PR_FALSE),
    mMimeMultipart(PR_FALSE),

    mAutoMimeBoundary(PR_FALSE),
    mFirstMatch(PR_TRUE),
    mLastMatch(PR_FALSE),
    mSavePartMatch(PR_FALSE),

    mOldPartMatch(""),
    mPartMatch(""),
    mLinebreak(0),

    mStreamBuf(nsnull),
    mStreamOffset(0),
    mStreamLength(0),

    mListener(nsnull),
    mTailListener(nsnull),
    mContext(nsnull)
{
    NS_INIT_ISUPPORTS();

#ifdef PR_LOGGING
  if (gPipeFilterListenerLog == nsnull) {
    gPipeFilterListenerLog = PR_NewLogModule("nsPipeFilterListener");
  }
#endif

#ifdef FORCE_PR_LOG
  nsresult rv;
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeFilterListener:: <<<<<<<<< CTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif
}


nsPipeFilterListener::~nsPipeFilterListener()
{
  nsresult rv;
#ifdef FORCE_PR_LOG
  nsCOMPtr<nsIThread> myThread;
  rv = nsIThread::GetCurrent(getter_AddRefs(myThread));
  DEBUG_LOG(("nsPipeFilterListener:: >>>>>>>>> DTOR(%p): myThread=%p\n",
         this, myThread.get()));
#endif

  // Release owning refs
  mListener = nsnull;
  mTailListener = nsnull;
  mContext = nsnull;
}


///////////////////////////////////////////////////////////////////////////////
// nsIPipeFilterListener methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeFilterListener::Init(nsIStreamListener* listener, nsISupports* ctxt,
                           const char *startDelimiter,
                           const char *endDelimiter,
                           PRUint32 skipCount,
                           PRBool keepDelimiters,
                           PRBool mimeMultipart,
                           nsIStreamListener* tailListener)
{
  DEBUG_LOG(("nsPipeFilterListener::Init: (%p)\n", this));

  mListener = listener;
  mTailListener = tailListener;
  mContext = ctxt;

  mStartDelimiter = startDelimiter;
  mEndDelimiter = endDelimiter;

  mMimeMultipart = mimeMultipart;

  if (mMimeMultipart && mStartDelimiter.IsEmpty()) {
    mAutoMimeBoundary = PR_TRUE;
    mStartDelimiter = "--";
    mEndDelimiter   = "--";
  }

  mStart.skipCount   = mStartDelimiter.IsEmpty() ? 0 : skipCount;
  mStart.matchedLine = PR_FALSE;
  mStart.matchedCR   = PR_FALSE;
  mStart.matchOffset = 0;
  mStart.matchCount  = mStartDelimiter.IsEmpty() ? 1 : 0;

  mEnd.skipCount     = 0;
  mEnd.matchedLine   = PR_FALSE;
  mEnd.matchedCR     = PR_FALSE;
  mEnd.matchOffset   = 0;
  mEnd.matchCount    = 0;

  mKeepDelimiters = keepDelimiters;

  mInitialized = PR_TRUE;

  return NS_OK;
}


NS_IMETHODIMP
nsPipeFilterListener::TransmitData(const char* buf, PRUint32 count,
                                   nsIStreamListener* listener,
                                   nsIRequest* aRequest, nsISupports* aContext)
{
  nsresult rv;

  DEBUG_LOG(("nsPipeFilterListener::TransmitData: (%p) %d\n", this, count));

  if (!listener)
    return NS_OK;

  mStreamBuf = buf;
  mStreamOffset = 0;
  mStreamLength = count;

  rv = listener->OnDataAvailable(aRequest,
                                 mContext ? mContext.get() : aContext,
                                 NS_STATIC_CAST(nsIInputStream*, this),
                                 0, count);
  if (NS_FAILED(rv)) {
    DEBUG_LOG(("nsPipeFilterListener::TransmitData: (%p) rv=%p\n", this, rv));
    return rv;
  }

  Close();

  return NS_OK;
}


NS_IMETHODIMP
nsPipeFilterListener::GetStartDelimiter(nsACString &aStartDelimiter)
{
  aStartDelimiter = mStartDelimiter;
  DEBUG_LOG(("nsPipeFilterListener::GetStartDelimiter: %s\n", mStartDelimiter.get()));
  return NS_OK;
}


NS_IMETHODIMP
nsPipeFilterListener::GetEndDelimiter(nsACString &aEndDelimiter)
{
  aEndDelimiter = mEndDelimiter;
  DEBUG_LOG(("nsPipeFilterListener::GetEndDelimiter: %s\n", mEndDelimiter.get()));
  return NS_OK;
}

NS_IMETHODIMP
nsPipeFilterListener::GetStartLine(nsACString &aStartLine)
{
  aStartLine = mStartLine;
  DEBUG_LOG(("nsPipeFilterListener::GetStartLine: %s\n", mStartLine.get()));
  return NS_OK;
}


NS_IMETHODIMP
nsPipeFilterListener::GetEndLine(nsACString &aEndLine)
{
  aEndLine = mEndLine;
  DEBUG_LOG(("nsPipeFilterListener::GetEndLine: %s\n", mEndLine.get()));
  return NS_OK;
}

const char* const nsPipeFilterListener::LineBreaks[] = {
  "\r",
  "\r\n",
  "\n"
};

NS_IMETHODIMP
nsPipeFilterListener::Write(const char* buf, PRUint32 count,
                            nsIRequest* aRequest, nsISupports* aContext)
{
  nsresult rv;

  DEBUG_LOG(("nsPipeFilterListener::Write: (%p) %d\n", this, count));

  if (count <= 0)
    return NS_OK;

  PRInt32 consumed;
  if (mStart.matchCount <= mStart.skipCount) {
    consumed = MatchDelimiter(buf, count, mStart, mStartDelimiter, mStartLine);
    if (consumed < 0)
      return NS_ERROR_FAILURE;
    buf += consumed;
    count -= consumed;
  }

  if (!mRequestStarted && (mStart.matchCount > mStart.skipCount)) {
    mRequestStarted = PR_TRUE;
    DEBUG_LOG(("nsPipeFilterListener::Write: RequestStarted\n", count));

    if (mListener) {
      rv = mListener->OnStartRequest(aRequest,
                                     mContext ? mContext.get() : aContext);

      if (NS_FAILED(rv))
        return rv;

      if (mKeepDelimiters && !mStartLine.IsEmpty()) {
        rv = TransmitData(mStartLine.get(), mStartLine.Length(),
                          mListener, aRequest, aContext);
        if (NS_FAILED(rv))
          return rv;
      }
    }
  }

  DEBUG_LOG(("nsPipeFilterListener::Write: after start, count %d\n", count));

  if (count <= 0)
    return NS_OK;

  if (mEndDelimiter.IsEmpty()) {
    return TransmitData(buf, count, mListener, aRequest, aContext);
  }

  if (mEnd.matchCount > mEnd.skipCount) {
    // End delimiter match complete

    if (mTailListener) {
      DEBUG_LOG(("nsPipeFilterListener::Write: TAIL count %d\n", count));
      rv = TransmitData(buf, count, mTailListener, aRequest, aContext);
      if (NS_FAILED(rv)) return rv;
    }

    return NS_OK;
  }

  mLastMatch = PR_TRUE;
  mSavePartMatch = PR_TRUE;
  PRUint32 savedPartMatchLen = mPartMatch.Length();

  consumed = MatchDelimiter(buf, count, mEnd, mEndDelimiter, mEndLine);
  if (consumed < 0)
    return NS_ERROR_FAILURE;

  if (!mSavePartMatch && savedPartMatchLen &&
      (mOldPartMatch.Length() >= savedPartMatchLen)) {

    rv = TransmitData(mOldPartMatch.get(), savedPartMatchLen,
                      mListener, aRequest, aContext);
    if (NS_FAILED(rv)) return rv;

    mOldPartMatch = "";
  }

  PRInt32 transCount = consumed - mPartMatch.Length() - mEndLine.Length();

  if (transCount > 0) {
    rv = TransmitData(buf, transCount, mListener, aRequest, aContext);
    if (NS_FAILED(rv)) return rv;
  }

  if (mTailListener && (mEnd.matchCount > mEnd.skipCount)) {
    // End delimiter match complete
    mTailRequestStarted = PR_TRUE;
    rv = mTailListener->OnStartRequest(aRequest,
                                       mContext ? mContext.get() : aContext);
    if (NS_FAILED(rv)) return rv;

    buf   += consumed;
    count -= consumed;
    if (count > 0) {
      DEBUG_LOG(("nsPipeFilterListener::Write: TAIL START count %d\n", count));
      rv = TransmitData(buf, count, mTailListener, aRequest, aContext);
      if (NS_FAILED(rv)) return rv;
    }
  }

  return NS_OK;
}


// Return number of bytes consumed (>= 0) or -1 on error
PRInt32
nsPipeFilterListener::MatchDelimiter(const char* buf, PRUint32 bufLen,
                                     LineMatchStatus& delim,
                                     nsCString& delimStr,
                                     nsCString& delimLine)
{
  //DEBUG_LOG(("nsPipeFilterListener::MatchDelimiter: bufLen=%d\n", bufLen));

  PRUint32 count = bufLen;

  while ((count > 0) && (delim.matchCount <= delim.skipCount)) {

    if (delim.matchOffset < delimStr.Length()) {
      PRUint32 consumed = MatchString(buf, count, delimStr.get(),
                                      delimStr.Length(),
                                      delim.matchOffset);
      //DEBUG_LOG(("nsPipeFilterListener::MatchDelimiter: consumed=%d\n", consumed));
      if (!consumed) {
          ERROR_LOG(("nsPipeFilterListener::MatchDelimiter: consumed=%d\n", consumed));
        return -1;
      }

      buf   += consumed;
      count -= consumed;

      if (delim.matchOffset >= delimStr.Length()) {
        DEBUG_LOG(("nsPipeFilterListener::MatchDelimiter: delimStr='%s'\n", delimStr.get()));
        if (mLastMatch) {
          delimLine = mPartMatch;
          mPartMatch = "";
        } else {
          delimLine = delimStr;
        }
        mLinebreak = 0;
      }

      if (!count)
        return bufLen;

      if (delim.matchOffset < delimStr.Length()) {
        ERROR_LOG(("nsPipeFilterListener::MatchDelimiter: count=%d, delim.matchOffset=%d, delimStr='%s'\n", count, delim.matchOffset, delimStr.get() ));
        return -1;
      }
    }

    // Match to end of line
    while (count > 0) {
      char ch = buf[0];

      if (delim.matchedCR) {
        // Already matched a CR

        if (ch == '\n') {
          // Consume LF following CR
          delimLine.Append(ch);
          buf++;
          count--;
        }

        delim.matchedLine = PR_TRUE;
        break;
      }

      delimLine.Append(ch);
      buf++;
      count--;

      if (ch == '\n') {
        delim.matchedLine = PR_TRUE;
        break;
      }

      if (ch == '\r') {
        delim.matchedCR = PR_TRUE;
      }
    }

    if (delim.matchedLine) {
      delim.matchCount++;
      delim.matchOffset = 0;
      delim.matchedCR = PR_FALSE;
      delim.matchedLine = PR_FALSE;

      DEBUG_LOG(("nsPipeFilterListener::MatchDelimiter: delimLine(%d)='%s'\n", delimLine.Length(), delimLine.get()));
      DEBUG_LOG(("nsPipeFilterListener::MatchDelimiter: matchCount=%d\n", delim.matchCount));

      if (mAutoMimeBoundary) {
        // Eliminate all trailing whitespace (including linebreaks) for delimiter
        mAutoMimeBoundary = PR_FALSE;
        mStartDelimiter = mStartLine;
        mStartDelimiter.Trim(" \t\r\n", PR_FALSE, PR_TRUE);
        mEndDelimiter = mStartDelimiter;
        DEBUG_LOG(("nsPipeFilterListener::MatchDelimiter: Mime Boundary='%s'\n", mStartDelimiter.get()));
      }

    }
  }

  return bufLen - count;
}


// Matches a string against characters in a buffer, taking into account
// a previous substring match up to strOffset. strOffset is updated to reflect
// the new match state, and the count of consumed bytes in buf is returned.
// mLinebreak = 1, if CR encountered previously
//            = 2, if CRLF encountered previously
//            = 3, if LF encountered previously,
//            = 0, otherwise
// (New matches only start at the beginning of a line)
PRUint32
nsPipeFilterListener::MatchString(const char* buf, PRUint32 count,
                                  const char* str, PRUint32 length,
                                  PRUint32& strOffset)
{
  //DEBUG_LOG(("nsPipeFilterListener::MatchString: strOffset=%d, length=%d\n", strOffset, length));

  if (strOffset >= length) {
    // Complete match
    return 0;
  }

  PRUint32 consumed = count;

  PRUint32 j;
  char ch;
  for (j=0; j < count; j++) {

    ch = buf[j];
    if ( (ch == str[strOffset]) &&
         ((strOffset > 0) || (mLinebreak > 0) || (mFirstMatch && (j == 0)) )) {
      // Extend match
      strOffset++;
      if (mLastMatch)
        mPartMatch += ch;

      if (strOffset >= length) {
        // Complete match
        consumed = j+1;
        break;
      }

    } else {
      // Match again from beginning of string
      strOffset = 0;

      if ((mLinebreak == 1) && (ch == '\n')) {
        mLinebreak = 2;
        if (mLastMatch)
          mPartMatch += '\n';

      } else {
        if (mLastMatch && mSavePartMatch) {
          mOldPartMatch = mPartMatch;
          mSavePartMatch = PR_FALSE;
        }

        if (ch == '\r') {
          mLinebreak = 1;
          if (mLastMatch)
            mPartMatch = '\r';

        } else if (ch == '\n') {
          mLinebreak = 3;
          if (mLastMatch)
            mPartMatch = '\n';

        } else if (mLinebreak > 0) {
          mLinebreak = 0;
          if (mLastMatch)
            mPartMatch = "";
        }
      }
    }
  }

  mFirstMatch = PR_FALSE;

  return consumed;
}


///////////////////////////////////////////////////////////////////////////////
// nsIRequestObserver methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeFilterListener::OnStartRequest(nsIRequest *aRequest,
                                     nsISupports *aContext)
{
  DEBUG_LOG(("nsPipeFilterListener::OnStartRequest: (%p)\n", this));

  if (!mInitialized)
    return NS_ERROR_NOT_INITIALIZED;

  return NS_OK;
}

NS_IMETHODIMP
nsPipeFilterListener::EndRequest(nsIRequest* aRequest, nsISupports* aContext)
{
  nsresult rv;
  DEBUG_LOG(("nsPipeFilterListener::EndRequest:(%p)\n", this));

  mRequestEnded = PR_TRUE;

  if (mListener) {
    if (!mRequestStarted) {
      mRequestStarted = PR_TRUE;

      rv = mListener->OnStartRequest(aRequest,
                                     mContext ? mContext.get() : aContext);
      if (NS_FAILED(rv))
        return rv;

      if (mKeepDelimiters && !mStartLine.IsEmpty()) {
        rv = TransmitData(mStartLine.get(), mStartLine.Length(),
                          mListener, aRequest, aContext);
        if (NS_FAILED(rv))
          return rv;
      }
    }

    if (!mPartMatch.IsEmpty()) {
      // Transmit any partially matched line
      DEBUG_LOG(("nsPipeFilterListener::EndRequest: PARTIALLY MATCHED LINE '%s'\n", mPartMatch.get()));
      rv = TransmitData(mPartMatch.get(), mPartMatch.Length(),
                        mListener, aRequest, aContext);
      if (NS_FAILED(rv))
        return rv;

      mPartMatch = "";
    }

    if (mKeepDelimiters && !mEndLine.IsEmpty()) {
      rv = TransmitData(mEndLine.get(), mEndLine.Length(),
                        mListener, aRequest, aContext);
      if (NS_FAILED(rv))
        return rv;
    }
  }

  return NS_OK;
}


NS_IMETHODIMP
nsPipeFilterListener::OnStopRequest(nsIRequest* aRequest,
                                    nsISupports* aContext,
                                    nsresult aStatus)
{
  nsresult rv = NS_OK;

  DEBUG_LOG(("nsPipeFilterListener::OnStopRequest: (%p)\n", this));

  // Ensure that OnStopRequest call chain does not break by failing softly

  if (!mEndDelimiter.IsEmpty() && mEndLine.IsEmpty()) {
    // Failed to match end delimiter
    aStatus = NS_BINDING_ABORTED;
  }

  if (!mRequestEnded) {
    rv = EndRequest(aRequest, aContext);
    if (NS_FAILED(rv))
      aStatus = NS_BINDING_ABORTED;
  }

  if (mTailListener) {

    if (!mTailRequestStarted) {
      mTailRequestStarted = PR_TRUE;
      rv = mTailListener->OnStartRequest(aRequest,
                                         mContext ? mContext.get() : aContext);
      if (NS_FAILED(rv))
        aStatus = NS_BINDING_ABORTED;
    }

    rv = mTailListener->OnStopRequest(aRequest,
                                      mContext ? mContext.get() : aContext,
                                      aStatus);
    if (NS_FAILED(rv))
      aStatus = NS_BINDING_ABORTED;
  }

  if (mListener) {
    rv = mListener->OnStopRequest(aRequest,
                                  mContext ? mContext.get() : aContext,
                                  aStatus);
    if (NS_FAILED(rv))
      aStatus = NS_BINDING_ABORTED;
  }

  // Release owning refs
  mListener = nsnull;
  mTailListener = nsnull;
  mContext = nsnull;

  return (aStatus == NS_BINDING_ABORTED) ? NS_ERROR_FAILURE : NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIStreamListener method
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeFilterListener::OnDataAvailable(nsIRequest* aRequest,
                                      nsISupports* aContext,
                                      nsIInputStream *aInputStream,
                                      PRUint32 aSourceOffset,
                                      PRUint32 aLength)
{
  nsresult rv = NS_OK;

  DEBUG_LOG(("nsPipeFilterListener::OnDataAvailable: (%p) %d\n", this, aLength));

  char buf[kCharMax];
  PRUint32 readCount, readMax;

  while (aLength > 0) {
    readMax = (aLength < kCharMax) ? aLength : kCharMax;
    rv = aInputStream->Read((char *) buf, readMax, &readCount);
    if (NS_FAILED(rv)){
      ERROR_LOG(("nsPipeFilterListener::OnDataAvailable: Error in reading from input stream, %x\n", rv));
      return rv;
    }

    if (readCount == 0) {
      DEBUG_LOG(("nsPipeFilterListener::OnDataAvailable: (%p) readCount=%d\n", this, readCount));
    }

    if (readCount <= 0)
      break;

    aLength -= readCount;
    aSourceOffset += readCount;

    rv = Write(buf, readCount, aRequest, aContext);

    if (NS_FAILED(rv)) {
      DEBUG_LOG(("nsPipeFilterListener::OnDataAvailable: (%p) rv=%p\n", this, rv));
      return rv;
    }
  }

  return NS_OK;
}

///////////////////////////////////////////////////////////////////////////////
// nsIInputStream methods
///////////////////////////////////////////////////////////////////////////////

NS_IMETHODIMP
nsPipeFilterListener::Available(PRUint32* _retval)
{
  if (!_retval)
    return NS_ERROR_NULL_POINTER;

  *_retval = (mStreamLength > mStreamOffset) ?
              mStreamLength - mStreamOffset : 0;

  DEBUG_LOG(("nsPipeFilterListener::Available: (%p) %d\n", this, *_retval));

  return NS_OK;
}

NS_IMETHODIMP
nsPipeFilterListener::Read(char* buf, PRUint32 count,
                         PRUint32 *readCount)
{
  DEBUG_LOG(("nsPipeFilterListener::Read: (%p) %d\n", this, count));

  if (!buf || !readCount)
    return NS_ERROR_NULL_POINTER;

  PRInt32 avail = (mStreamLength > mStreamOffset) ?
                   mStreamLength - mStreamOffset : 0;

  *readCount = ((PRUint32) avail > count) ? count : avail;

  if (*readCount) {
    memcpy(buf, mStreamBuf+mStreamOffset, *readCount);
    mStreamOffset += *readCount;
  }

  if (mStreamOffset >= mStreamLength) {
    Close();
  }

  return NS_OK;
}

NS_IMETHODIMP 
nsPipeFilterListener::ReadSegments(nsWriteSegmentFun writer,
                                 void * aClosure, PRUint32 count,
                                 PRUint32 *readCount)
{
  nsresult rv;

  DEBUG_LOG(("nsPipeFilterListener::ReadSegments: %d\n", count));

  if (!readCount)
    return NS_ERROR_NULL_POINTER;

  PRUint32 avail, readyCount, writeCount;

  *readCount = 0;

  while ((count > 0) && (mStreamOffset < mStreamLength)) {
    avail = mStreamLength - mStreamOffset;
    readyCount = ((PRUint32) avail > count) ? count : avail;

    rv = writer(NS_STATIC_CAST(nsIInputStream*, this),
                aClosure, mStreamBuf+mStreamOffset, 
                mStreamOffset, readyCount, &writeCount);
    if (NS_FAILED(rv) || !writeCount)
      return rv;

    DEBUG_LOG(("nsPipeFilterListener::ReadSegments: writer %d\n", writeCount));

    *readCount    += writeCount;
    mStreamOffset += writeCount;
    count         -= writeCount;
  }

  if (mStreamOffset >= mStreamLength) {
    Close();
  }

  return NS_OK;
}

NS_IMETHODIMP 
nsPipeFilterListener::IsNonBlocking(PRBool *aNonBlocking)
{
  DEBUG_LOG(("nsPipeFilterListener::IsNonBlocking: \n"));

  *aNonBlocking = PR_TRUE;
  return NS_OK;
}

NS_IMETHODIMP 
nsPipeFilterListener::Close()
{
  DEBUG_LOG(("nsPipeFilterListener::Close: (%p)\n", this));
  mStreamBuf = nsnull;
  mStreamOffset = 0;
  mStreamLength = 0;
  return NS_OK;
}
