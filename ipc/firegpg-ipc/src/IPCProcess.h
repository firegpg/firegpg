/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
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
 * The Original Code is the Netscape Portable Runtime (NSPR).
 *
 * The Initial Developer of the Original Code is Netscape
 * Communications Corporation.  Portions created by Netscape are
 * Copyright (C) 1998-2000 Netscape Communications Corporation.  All
 * Rights Reserved.
 *
 * Contributor(s):
 *   Ramalingam Saravanan <svn@xmlterm.org>
 *   Patrick Brunschwig <patrick@mozilla-enigmail.org>
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * ***** END LICENSE BLOCK ***** */


#ifndef IPCProcess_h__
#define IPCProcess_h__

#include "nspr.h"
#include "prproces.h"

/* Define XP_WIN_IPC to enable Win32-specific IPC stuff;
 * this avoids some problems with the NSPR IPC implementation on Win32
 * which can sometimes cause processes to hang when trying to read STDIN
 */
#ifdef XP_WIN
#define XP_WIN_IPC
#endif

#ifdef XP_WIN_IPC

#include <windows.h>
#include <shellapi.h>

typedef DWORD (WINAPI*GetProcessIdPtr)(HANDLE process);

#define IPCProcess void
#define IPCFileDesc void
#define IPC_NULL_HANDLE NULL

#define IPC_CreateProcessRedirected IPC_CreateProcessRedirectedWin32
#define IPC_CreateInheritablePipe IPC_CreateInheritablePipeWin32

#define IPC_WaitProcess IPC_WaitProcessWin32
#define IPC_KillProcess IPC_KillProcessWin32
#define IPC_GetProcessId IPC_GetProcessIdWin32
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
#define IPC_GetProcessId IPC_GetProcessIdNSPR
#define IPC_Read PR_Read
#define IPC_Write PR_Write
#define IPC_Close PR_Close
#define IPC_GetError PR_GetError
#endif /* !XP_WIN_IPC */

/**
  * Creates a process and assigns the stdin/stdout/stderr file descriptors
  *
  * @param path      Path to the executable file in native encoding
  * @param argv      Array of arguments to the process in native encoding
  * @param envp      Array of environment variables in native encoding
  * @param cwd       The subprocess' woring directory in native encoding
  * @param std_in    The STDIN file descriptor of the subprocess
  * @param std_out   The STDOUT file descriptor of the subprocess
  * @param std_err   The STDERR file descriptor of the subprocess
  * @param detach    True if the process should be detached from the parent
  */
PRProcess* IPC_CreateProcessRedirectedNSPR(const char *path,
                                           char *const *argv,
                                           char *const *envp,
                                           const char *cwd,
                                           PRFileDesc* std_in,
                                           PRFileDesc* std_out,
                                           PRFileDesc* std_err,
                                           PRBool detach);

/**
  * Set the file descriptors of a pipe, e.g. STDIN, to (not) inheritable
  * Usually the file descriptor of the intended direction is inheritable (e.g.
  * "write" for STDIN.
  *
  * @param readPipe      File descriptor of the reading pipe
  * @param writePipe     File descriptor of the writing pipe
  * @param readInherit   True if reader should be inheritable
  * @param writeInherit  True if writer should be inheritable
  */
PRStatus IPC_CreateInheritablePipeNSPR(PRFileDesc* *readPipe,
                                       PRFileDesc* *writePipe,
                                       PRBool readInherit,
                                       PRBool writeInherit);

/**
  * Get the process ID of a running subprocess
  */
PRStatus IPC_GetProcessIdNSPR(IPCProcess* process, PRInt32 *pid);


void IPC_Shutdown();

#ifdef XP_WIN_IPC
/**
  * @see IPC_CreateProcessRedirectedNSPR
  */

IPCProcess* IPC_CreateProcessRedirectedWin32(const char *path,
                                            char *const *argv,
                                            char *const *envp,
                                            const char *cwd,
                                            IPCFileDesc* std_in,
                                            IPCFileDesc* std_out,
                                            IPCFileDesc* std_err,
                                            PRBool detach);
/**
  * @see IPC_CreateInheritablePipeNSPR
  */

PRStatus IPC_CreateInheritablePipeWin32(IPCFileDesc* *readPipe,
                                        IPCFileDesc* *writePipe,
                                        PRBool readInherit,
                                        PRBool writeInherit);

/**
  * @see PR_WaitProcess in prprocess.h
  */
PRStatus IPC_WaitProcessWin32(IPCProcess* process, PRInt32 *exitCode);

/**
  * @see PR_KillProcess in prprocess.h
  */
PRStatus IPC_KillProcessWin32(IPCProcess* process);

/**
  * @see PR_Read in prprocess.h
  */
PRInt32  IPC_ReadWin32(IPCFileDesc* fd, void *buf, PRInt32 amount);

/**
  * @see PR_Write in prprocess.h
  */
PRInt32  IPC_WriteWin32(IPCFileDesc* fd, const void *buf, PRInt32 amount);

/**
  * @see PR_Close in prprocess.h
  */
PRStatus IPC_CloseWin32(IPCFileDesc* fd);

/**
  * @see PR_GetProcessId in prprocess.h
  */
PRStatus IPC_GetProcessIdWin32(IPCProcess* process, PRInt32 *pid);

/**
  * @see PR_GetError in prprocess.h
  */
PRErrorCode IPC_GetErrorWin32();
#endif

#endif // IPCProcess_h__
