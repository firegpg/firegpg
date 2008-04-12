#include "nsIGenericFactory.h"
#include "FireGPGCall.h"

NS_GENERIC_FACTORY_CONSTRUCTOR(FireGPGCall)

static nsModuleComponentInfo components[] =
{
    {
       FIREGPG_CALL_CLASSNAME, 
       FIREGPG_CALL_CID,
       FIREGPG_CALL_CONTRACTID,
       FireGPGCallConstructor,
    }
};

NS_IMPL_NSGETMODULE("FireGPGCallModule", components)
