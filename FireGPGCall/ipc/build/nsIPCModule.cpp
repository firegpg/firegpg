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

#include "nsIGenericFactory.h"
#include "nsIPCModule.h"

#include "nsProcessInfo.h"

NS_GENERIC_FACTORY_CONSTRUCTOR(nsProcessInfo)

#include "nsPipeTransport.h"
#include "nsPipeConsole.h"
#include "nsPipeChannel.h"
#include "nsPipeFilterListener.h"
#include "nsIPCBuffer.h"

NS_GENERIC_FACTORY_CONSTRUCTOR(nsPipeTransport)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsPipeConsole)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsPipeChannel)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsPipeFilterListener)
NS_GENERIC_FACTORY_CONSTRUCTOR(nsIPCBuffer)

#include "nsIPCService.h"
NS_GENERIC_FACTORY_CONSTRUCTOR_INIT(nsIPCService, Init);

// CIDs implemented by module
static const nsModuleComponentInfo components[] =
{

    { NS_PROCESSINFO_CLASSNAME,
      NS_PROCESSINFO_CID,
      NS_PROCESSINFO_CONTRACTID,
      nsProcessInfoConstructor,
    },

    { NS_PIPETRANSPORT_CLASSNAME,
      NS_PIPETRANSPORT_CID,
      NS_PIPETRANSPORT_CONTRACTID,
      nsPipeTransportConstructor,
    },

    { NS_PIPECONSOLE_CLASSNAME,
      NS_PIPECONSOLE_CID,
      NS_PIPECONSOLE_CONTRACTID,
      nsPipeConsoleConstructor,
    },

    { NS_PIPECHANNEL_CLASSNAME,
      NS_PIPECHANNEL_CID,
      NS_PIPECHANNEL_CONTRACTID,
      nsPipeChannelConstructor,
    },

    { NS_PIPEFILTERLISTENER_CLASSNAME,
      NS_PIPEFILTERLISTENER_CID,
      NS_PIPEFILTERLISTENER_CONTRACTID,
      nsPipeFilterListenerConstructor,
    },

    { NS_IPCBUFFER_CLASSNAME,
      NS_IPCBUFFER_CID,
      NS_IPCBUFFER_CONTRACTID,
      nsIPCBufferConstructor,
    },

    { NS_IPCSERVICE_CLASSNAME,
      NS_IPCSERVICE_CID,
      NS_IPCSERVICE_CONTRACTID,
      nsIPCServiceConstructor,
    },

};

// Module entry point
NS_IMPL_NSGETMODULE("nsIPCModule", components)
