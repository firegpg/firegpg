#!gmake
#
# The contents of this file are subject to the Mozilla Public
# License Version 1.1 (the "MPL"); you may not use this file
# except in compliance with the MPL. You may obtain a copy of
# the MPL at http://www.mozilla.org/MPL/
# 
# Software distributed under the MPL is distributed on an "AS
# IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
# implied. See the MPL for the specific language governing
# rights and limitations under the MPL.
# 
# The Original Code is protoZilla.
# 
# The Initial Developer of the Original Code is Ramalingam Saravanan.
# Portions created by Ramalingam Saravanan <svn@xmlterm.org> are
# Copyright (C) 2001 Ramalingam Saravanan. All Rights Reserved.
# 
# Contributor(s):
# 
# Alternatively, the contents of this file may be used under the
# terms of the GNU General Public License (the "GPL"), in which case
# the provisions of the GPL are applicable instead of
# those above. If you wish to allow use of your version of this
# file only under the terms of the GPL and not to allow
# others to use your version of this file under the MPL, indicate
# your decision by deleting the provisions above and replace them
# with the notice and other provisions required by the GPL.
# If you do not delete the provisions above, a recipient
# may use your version of this file under either the MPL or the
# GPL.
#

DEPTH		= ../../..
topsrcdir	= ../../..
srcdir		= .
VPATH		= .

#include $(DEPTH)/config/autoconf.mk

XPI_MODULE	= ipc
XPI_MODULE_VERS = 1.1.3

MODULE		= ipc
LIBRARY_NAME	= ipc
EXPORT_LIBRARY  = 1
SHORT_LIBNAME	= ipc
IS_COMPONENT	= 1

ifdef USE_XPCOM_GLUE
# Ensure that the xpcom classes that we build
# do not export themselves
DEFINES		+= -D_IMPL_NS_COM_OFF -DXPCOM_GLUE
endif

REQUIRES	= xpcom \
		  string \
		  js \
		  caps \
		  uconv \
		  necko \
		  mimetype \
		  xpconnect \
		  $(NULL)

MODULE_NAME	= IPCModule

CPPSRCS		= nsIPCModule.cpp

SHARED_LIBRARY_LIBS = \
		$(DIST)/lib/$(LIB_PREFIX)ipc_s.$(LIB_SUFFIX) \
		$(NULL)

LOCAL_INCLUDES	= \
		-I$(srcdir)/../src \
		$(NULL)

ifdef USE_XPCOM_GLUE
EXTRA_DSO_LDOPTS = \
		$(DIST)/lib/$(LIB_PREFIX)xpcomglue.$(LIB_SUFFIX) \
		$(DIST)/lib/$(LIB_PREFIX)string_s.$(LIB_SUFFIX) \
		$(DIST)/lib/$(LIB_PREFIX)string_obsolete_s.$(LIB_SUFFIX) \
		$(XPCOM_LIBS) \
		$(NSPR_LIBS) \
		$(NULL)
else
EXTRA_DSO_LDOPTS = \
		$(DIST)/lib/$(LIB_PREFIX)string_s.$(LIB_SUFFIX) \
		$(DIST)/lib/$(LIB_PREFIX)string_obsolete_s.$(LIB_SUFFIX) \
		$(XPCOM_LIBS) \
		$(NSPR_LIBS) \
		$(NULL)
endif

#include $(topsrcdir)/config/rules.mk

PLATFORM_STR = unknown

# Edit the lines below as needed, depending upon your platform(s)
ifeq ($(OS_ARCH),Linux)
PLATFORM_STR = linux
endif

ifeq ($(OS_ARCH),WIN95)
PLATFORM_STR = win32
endif

ifeq ($(OS_ARCH),WINNT)
PLATFORM_STR = win32
endif

ifeq ($(OS_CONFIG),SunOS5)
PLATFORM_STR = sunos5
endif

ifeq ($(OS_ARCH),FreeBSD)
PLATFORM_STR = freebsd
endif

XPIFILE = $(XPI_MODULE)-$(XPI_MODULE_VERS)-$(PLATFORM_STR).xpi

xpi::
	zip -r $(DIST)/bin/$(XPIFILE) install.js ipc.spec
	cd $(DIST)/bin; zip -g $(XPIFILE) \
               components/$(XPI_MODULE).xpt \
               components/$(LIB_PREFIX)$(XPI_MODULE)$(DLL_SUFFIX)
	echo Created $(DIST)/bin/$(XPIFILE)
