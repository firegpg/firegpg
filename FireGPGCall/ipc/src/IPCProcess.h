/* 
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "License"); you may not use this file
 * except in compliance with the License. You may obtain a copy of
 * the License at http://www.mozilla.org/MPL/
 * 
 * Software distributed under the License is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the License for the specific language governing
 * rights and limitations under the License.
 * 
 * The Original Code is the Netscape Portable Runtime (NSPR).
 * 
 * The Initial Developer of the Original Code is Netscape
 * Communications Corporation.  Portions created by Netscape are 
 * Copyright (C) 1998-2000 Netscape Communications Corporation.  All
 * Rights Reserved.
 * 
 * Contributor(s):
 *   Ramalingam Saravanan <svn@xmlterm.org>
 * 
 * Alternatively, the contents of this file may be used under the
 * terms of the GNU General Public License Version 2 or later (the
 * "GPL"), in which case the provisions of the GPL are applicable 
 * instead of those above.  If you wish to allow use of your 
 * version of this file only under the terms of the GPL and not to
 * allow others to use your version of this file under the MPL,
 * indicate your decision by deleting the provisions above and
 * replace them with the notice and other provisions required by
 * the GPL.  If you do not delete the provisions above, a recipient
 * may use your version of this file under either the MPL or the
 * GPL.
 */

#ifndef IPCProcess_h__
#define IPCProcess_h__

#include "nspr.h"

/* Define XP_WIN_IPC to enable Win32-specific IPC stuff;
 * this avoids some problems with the NSPR IPC implementation on Win32
 * which can sometimes cause processes to hang when trying to read STDIN
 */
#ifdef XP_WIN
#define XP_WIN_IPC
#endif

#ifdef XP_WIN_IPC

#define IPCProcess void
#define IPCFileDesc void
#define IPC_NULL_HANDLE NULL

#define IPC_CreateProcessRedirected IPC_CreateProcessRedirectedWin32
#define IPC_CreateInheritablePipe IPC_CreateInheritablePipeWin32

#define IPC_WaitProcess IPC_WaitProcessWin32
#define IPC_KillProcess IPC_KillProcessWin32
#define IPC_Read IPC_ReadWin32
#define IPC_Write IPC_WriteWin32
#define IPC_Close IPC_CloseWin32
#define IPC_GetError IPC_GetErrorWin32

#else

#define IPCProcess PRProcess
#define IPCFileDesc PRFileDesc
#define IPC_NULL_HANDLE nsnull

#define IPC_CreateProcessRedirected IPC_CreateProcessRedirectedNSPR
#define IPC_CreateInheritablePipe IPC_CreateInheritablePipeNSPR

#define IPC_WaitProcess PR_WaitProcess
#define IPC_KillProcess PR_KillProcess
#define IPC_Read PR_Read
#define IPC_Write PR_Write
#define IPC_Close PR_Close
#define IPC_GetError PR_GetError
#endif /* !XP_WIN_IPC */

PRProcess* IPC_CreateProcessRedirectedNSPR(const char *path,
                                           char *const *argv,
                                           char *const *envp,
                                           const char *cwd,
                                           PRFileDesc* std_in,
                                           PRFileDesc* std_out,
                                           PRFileDesc* std_err);

PRStatus IPC_CreateInheritablePipeNSPR(PRFileDesc* *readPipe,
                                       PRFileDesc* *writePipe,
                                       PRBool readInherit,
                                       PRBool writeInherit);

void IPC_Shutdown();

#ifdef XP_WIN_IPC
IPCProcess* IPC_CreateProcessRedirectedWin32(const char *path,
                                            char *const *argv,
                                            char *const *envp,
                                            const char *cwd,
                                            IPCFileDesc* std_in,
                                            IPCFileDesc* std_out,
                                            IPCFileDesc* std_err);

PRStatus IPC_CreateInheritablePipeWin32(IPCFileDesc* *readPipe,
                                        IPCFileDesc* *writePipe,
                                        PRBool readInherit,
                                        PRBool writeInherit);

PRStatus IPC_WaitProcessWin32(IPCProcess* process, PRInt32 *exitCode);

PRStatus IPC_KillProcessWin32(IPCProcess* process);

PRInt32  IPC_ReadWin32(IPCFileDesc* fd, void *buf, PRInt32 amount);

PRInt32  IPC_WriteWin32(IPCFileDesc* fd, const void *buf, PRInt32 amount);

PRStatus IPC_CloseWin32(IPCFileDesc* fd);

PRErrorCode IPC_GetErrorWin32();
#endif

#endif // IPCProcess_h__
