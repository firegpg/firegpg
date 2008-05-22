#include "FireGPGCall.h"
#include <unistd.h>

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
NS_IMETHODIMP FireGPGCall::Call(const char *path, const char *parameters, const char *sdin, char **_retval)
{
    execlp(path,parameters);

	return NS_OK;
}
