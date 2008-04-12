#include "FireGPGCall.h"

NS_IMPL_ISUPPORTS1(FireGPGCall, IFireGPGCall)

FireGPGCall::FireGPGCall()
{
  /* member initializers and constructor code */
}

FireGPGCall::~FireGPGCall()
{
  /* destructor code */
}

/* long Add (in long a, in long b); */
NS_IMETHODIMP FireGPGCall::Add(PRInt32 a, PRInt32 b, PRInt32 *_retval)
{
    *_retval = a + b;
	return NS_OK;
}

