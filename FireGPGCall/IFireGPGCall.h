/*
 * DO NOT EDIT.  THIS FILE IS GENERATED FROM IFireGPGCall.idl
 */

#ifndef __gen_IFireGPGCall_h__
#define __gen_IFireGPGCall_h__


#ifndef __gen_nsISupports_h__
#include "nsISupports.h"
#endif

/* For IDL files that don't want to include root IDL files. */
#ifndef NS_NO_VTABLE
#define NS_NO_VTABLE
#endif

/* starting interface:    IFireGPGCall */
#define IFIREGPGCALL_IID_STR "fa6b4f61-5828-4e15-aebb-02d8dbfa689f"

#define IFIREGPGCALL_IID \
  {0xfa6b4f61, 0x5828, 0x4e15, \
    { 0xae, 0xbb, 0x02, 0xd8, 0xdb, 0xfa, 0x68, 0x9f }}

class NS_NO_VTABLE IFireGPGCall : public nsISupports {
 public:

  NS_DEFINE_STATIC_IID_ACCESSOR(IFIREGPGCALL_IID)

  /* long Add (in long a, in long b); */
  NS_IMETHOD Add(PRInt32 a, PRInt32 b, PRInt32 *_retval) = 0;

};

/* Use this macro when declaring classes that implement this interface. */
#define NS_DECL_IFIREGPGCALL \
  NS_IMETHOD Add(PRInt32 a, PRInt32 b, PRInt32 *_retval);

/* Use this macro to declare functions that forward the behavior of this interface to another object. */
#define NS_FORWARD_IFIREGPGCALL(_to) \
  NS_IMETHOD Add(PRInt32 a, PRInt32 b, PRInt32 *_retval) { return _to Add(a, b, _retval); }

/* Use this macro to declare functions that forward the behavior of this interface to another object in a safe way. */
#define NS_FORWARD_SAFE_IFIREGPGCALL(_to) \
  NS_IMETHOD Add(PRInt32 a, PRInt32 b, PRInt32 *_retval) { return !_to ? NS_ERROR_NULL_POINTER : _to->Add(a, b, _retval); }

#if 0
/* Use the code below as a template for the implementation class for this interface. */

/* Header file */
class _MYCLASS_ : public IFireGPGCall
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IFIREGPGCALL

  _MYCLASS_();

private:
  ~_MYCLASS_();

protected:
  /* additional members */
};

/* Implementation file */
NS_IMPL_ISUPPORTS1(_MYCLASS_, IFireGPGCall)

_MYCLASS_::_MYCLASS_()
{
  /* member initializers and constructor code */
}

_MYCLASS_::~_MYCLASS_()
{
  /* destructor code */
}

/* long Add (in long a, in long b); */
NS_IMETHODIMP _MYCLASS_::Add(PRInt32 a, PRInt32 b, PRInt32 *_retval)
{
    return NS_ERROR_NOT_IMPLEMENTED;
}

/* End of implementation class template. */
#endif


#endif /* __gen_IFireGPGCall_h__ */
