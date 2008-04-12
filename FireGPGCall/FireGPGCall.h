#ifndef _FireGPGCall_h
#define _FireGPGCall_h

#include "IFireGPGCall.h" 

#define FIREGPG_CALL_CONTRACTID "@getfiregpg.org/XPCOM/FireGPGCall;1"
#define FIREGPG_CALL_CLASSNAME "XpCOM to access to gpg (and pgp) for FireGPG"
#define FIREGPG_CALL_CID {0xfa6b4f61, 0x5828, 0x4e15, \
    { 0xae, 0xbb, 0x02, 0xd8, 0xdb, 0xfa, 0x68, 0x9f }}

/* Header file */
class FireGPGCall : public IFireGPGCall
{
public:
  NS_DECL_ISUPPORTS
  NS_DECL_IFIREGPGCALL

  FireGPGCall();

private:
  ~FireGPGCall();

protected:
  /* additional members */
};

#endif //_FireGPGCall_h
