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


#include "ipc.h"
#include "IPCProcess.h"
#include "nsMemory.h"

#ifdef XP_WIN
#include <windows.h>
#include <shellapi.h>
#include <stdio.h>
#include <stdlib.h>
#include <io.h>
#include <fcntl.h>

static void IPC_HideConsoleWin32();
#endif


PRProcess* IPC_CreateProcessRedirectedNSPR(const char *path,
                                           char *const *argv,
                                           char *const *envp,
                                           const char *cwd,
                                           PRFileDesc* std_in,
                                           PRFileDesc* std_out,
                                           PRFileDesc* std_err,
                                           PRBool detach)
{
#ifdef XP_WIN
  // Workaround for Win32
  // Hide process console (after creating one, if need be)
  IPC_HideConsoleWin32();
#endif

  PRProcess* process;
  PRProcessAttr *processAttr;
  processAttr = PR_NewProcessAttr();

  /* Set current working directory */
  if (cwd)
    PR_ProcessAttrSetCurrentDirectory(processAttr, cwd);

  /* Redirect standard I/O for process */
  if (std_in)
    PR_ProcessAttrSetStdioRedirect(processAttr, (PRSpecialFD) 0, std_in);

  if (std_out)
    PR_ProcessAttrSetStdioRedirect(processAttr, (PRSpecialFD) 1, std_out);

  if (std_err)
    PR_ProcessAttrSetStdioRedirect(processAttr, (PRSpecialFD) 2, std_err);


  /* Create NSPR process */
  process = PR_CreateProcess(path, argv, envp, processAttr);

  if (detach) {
    PR_DetachProcess(process);
  }

  return process;

}

PRStatus IPC_CreateInheritablePipeNSPR(PRFileDesc* *readPipe,
                                       PRFileDesc* *writePipe,
                                       PRBool readInherit,
                                       PRBool writeInherit)
{
  PRStatus status;

  //status = PR_NewTCPSocketPair(fd);
  status = PR_CreatePipe(readPipe, writePipe);
  if (status != PR_SUCCESS)
    return status;

  // Hack to handle Win32 problem: PR_SetFDInheritable returns error
  // when we try to return off inheritability. However, inheritability is
  // supposed to be off by default, so it shouldn't really matter.
  status = PR_SUCCESS;
#ifdef XP_WIN
  if (readInherit)
#endif
    status = PR_SetFDInheritable(*readPipe, readInherit);
  if (status != PR_SUCCESS)
    return status;

#ifdef XP_WIN
  if (writeInherit)
#endif
    status = PR_SetFDInheritable(*writePipe, writeInherit);
  if (status != PR_SUCCESS)
    return status;

  return PR_SUCCESS;
}


#ifdef XP_WIN
static PRBool gIPCWinConsoleAllocated = PR_FALSE;
#endif

// Note: it's not necessary to free/close the console, there is (at most) 1
// console in a parent process

PRStatus IPC_GetProcessIdNSPR(IPCProcess* process, PRInt32 *pid)
{
  *pid = 0;

  if (! process)
    return PR_FAILURE;

  struct MYProcess {
      PRUint32 pid;
  };
  MYProcess* ptrProc = (MYProcess *) process;
  *pid = ptrProc->pid;

  return PR_SUCCESS;
}


#ifdef XP_WIN
// Workaround for Win32
// Try to create a console, if one hasn't already been created
// (Otherwise each child process creates a console!)
// and then hide the console.
// See http://support.microsoft.com/support/kb/articles/q105/3/05.asp
// and http://support.microsoft.com/support/kb/articles/Q124/1/03.asp

void IPC_HideConsoleWin32()
{

  // AllocConsole and SetConsoleTitle et al. are Windows API functions.
  // See Windows SDK/.../include/WinCon.h, WinBase.h, WinUser.h

  if (!gIPCWinConsoleAllocated && ::AllocConsole()) {
    // Set console title
    const char consoleTitle[] = "IPC error console";
    ::SetConsoleTitle(consoleTitle);

    // Redirect stderr
    int hCrt = ::_open_osfhandle( (long)::GetStdHandle( STD_ERROR_HANDLE ),
                                   _O_TEXT );
    if ( hCrt != -1 ) {
      FILE *hf = ::_fdopen(hCrt, "w");
      if ( hf ) {
        *stderr = *hf;
      }
    }

    HWND hWnd;
    int iWait;

    for (iWait = 0; iWait < 50; iWait++) {
      // Wait for window title to be updated (up to 1 second)
      ::Sleep(20);

      // Get console window handle using title
      // (::GetConsoleWindow() not available in win32 prior to Win2K)

      hWnd = ::FindWindow(NULL, consoleTitle);

      if (hWnd) {
        ::ShowWindow(hWnd, SW_HIDE); // Hide console window
        break;
      }
    }
  }

  // Console allocated
  gIPCWinConsoleAllocated = PR_TRUE;

}

#endif  /* XP_WIN */


#ifdef XP_WIN_IPC

/*
 *
 * Windows specific code adapted from mozilla/xpcom/threads/nsProcessCommon.cpp
 * Out param `wideCmdLine` must be PR_Freed by the caller.
 */

static int assembleCmdLine(char *const *argv, PRUnichar **wideCmdLine)
{
    char *const *arg;
    char *p, *q, *cmdLine;
    int cmdLineSize;
    int numBackslashes;
    int i;
    int argNeedQuotes;

    UINT codePage = CP_UTF8; // the code page to use for the parameter strings

    // Find out how large the command line buffer should be.

    cmdLineSize = 0;
    for (arg = argv; *arg; arg++) {

        // \ and " need to be escaped by a \.  In the worst case,
        // every character is a \ or ", so the string of length
        // may double.  If we quote an argument, that needs two ".
        // Finally, we need a space between arguments, and
        // a null byte at the end of command line.

        cmdLineSize += 2 * strlen(*arg) + // \ and " need to be escaped
                2+                        // we quote every argument
                1;                        // space in between, or final null
    }
    p = cmdLine = (char *) PR_MALLOC(cmdLineSize*sizeof(char));
    if (p == NULL) {
        return -1;
    }

    for (arg = argv; *arg; arg++) {
        // Add a space to separates the arguments
        if (arg != argv) {
            *p++ = ' ';
        }
        q = *arg;
        numBackslashes = 0;
        argNeedQuotes = 0;

        // If the argument contains white space, it needs to be quoted.
        if (strpbrk(*arg, " \f\n\r\t\v")) {
            argNeedQuotes = 1;
        }

        if (argNeedQuotes) {
            *p++ = '"';
        }
        while (*q) {
            if (*q == '\\') {
                numBackslashes++;
                q++;
            } else if (*q == '"') {
                if (numBackslashes) {

                    // Double the backslashes since they are followed
                    // by a quote
                    for (i = 0; i < 2 * numBackslashes; i++) {
                        *p++ = '\\';
                    }
                    numBackslashes = 0;
                }
                // To escape the quote
                *p++ = '\\';
                *p++ = *q++;
            } else {
                if (numBackslashes) {

                    // Backslashes are not followed by a quote, so
                    // don't need to double the backslashes.

                    for (i = 0; i < numBackslashes; i++) {
                        *p++ = '\\';
                    }
                    numBackslashes = 0;
                }
                *p++ = *q++;
            }
        }

        // Now we are at the end of this argument
        if (numBackslashes) {

            // Double the backslashes if we have a quote string
            // delimiter at the end.

            if (argNeedQuotes) {
                numBackslashes *= 2;
            }
            for (i = 0; i < numBackslashes; i++) {
                *p++ = '\\';
            }
        }
        if (argNeedQuotes) {
            *p++ = '"';
        }
    }

    *p = '\0';
    PRInt32 numChars = MultiByteToWideChar(codePage, 0, cmdLine, -1, NULL, 0);
    *wideCmdLine = (PRUnichar *) PR_MALLOC(numChars*sizeof(PRUnichar));
    MultiByteToWideChar(codePage, 0, cmdLine, -1, *wideCmdLine, numChars);
    PR_Free(cmdLine);
    return 0;
}

/*
 * Assemble the environment block by concatenating the envp array
 * (preserving the terminating null byte in each array element)
 * and adding a null byte at the end.
 *
 * Returns 0 on success.  The resulting environment block is returned
 * in *envBlock.  Note that if envp is NULL, a NULL pointer is returned
 * in *envBlock.  Returns -1 on failure.
 */
static int assembleEnvBlock(char *const *envp, PRUnichar **envBlock)
{
  PRUnichar *p, *q;
  char * const *env;
  PRInt32 envBlockSize = 0;

  if (envp == NULL) {
    *envBlock = NULL;
    return 0;
  }

  PRInt32 len, maxLen = 0;
  for (env = envp; *env; env++) {
    len = MultiByteToWideChar(CP_UTF8, 0, *env, -1, NULL, 0);
    envBlockSize += len;
    maxLen = (len > maxLen ? len : maxLen);
    }
    envBlockSize++;

    PRUnichar* tempStr = (PRUnichar *) PR_MALLOC(maxLen * sizeof(PRUnichar));
    p = *envBlock = (PRUnichar *) PR_MALLOC(envBlockSize * sizeof(PRUnichar));

    for (env = envp; *env; env++) {

      len = MultiByteToWideChar(CP_UTF8, 0, *env, -1, NULL, 0);
      MultiByteToWideChar(CP_UTF8, 0, *env, -1, tempStr, len);
      q = tempStr;

      while (*q) {
        // copy data (one by one)
        *p++ = *q++;
      }

      *p++ = '\0';
    }

    *p++ = '\0';
    PR_Free(tempStr);
    *p = '\0';

    return 0;
}

IPCProcess* IPC_CreateProcessRedirectedWin32(const char *path,
                                            char *const *argv,
                                            char *const *envp,
                                            const char *cwd,
                                            IPCFileDesc* std_in,
                                            IPCFileDesc* std_out,
                                            IPCFileDesc* std_err,
                                            PRBool detach)
{
  BOOL bRetVal;

  // Determine OS Version
  OSVERSIONINFO osvi;
  BOOL bIsWin2KOrLater = FALSE;

  ZeroMemory(&osvi, sizeof(OSVERSIONINFO));
  osvi.dwOSVersionInfoSize = sizeof(OSVERSIONINFO);

  if (GetVersionEx(&osvi)) {
    bIsWin2KOrLater = (osvi.dwPlatformId == VER_PLATFORM_WIN32_NT) &&
                          (osvi.dwMajorVersion >= 5);
  }

  PRUint32 count = 0;
  char *const *arg;
  for (arg = argv; *arg; arg++) {
    ++count;
  }

  // make sure that when we allocate we have 1 greater than the
  // count since we need to null terminate the list for the argv to
  // pass into PR_CreateProcess
  char **my_argv = NULL;
  my_argv = (char **)nsMemory::Alloc(sizeof(char *) * (count + 2) );
  if (!my_argv) {
    return IPC_NULL_HANDLE;
  }

  // copy the args
  PRUint32 i;
  for (i=0; i < count; i++) {
    my_argv[i+1] = const_cast<char*>(argv[i]);
  }

  // we need to set argv[0] to the program name.
  my_argv[0] = const_cast<char*>(path);
  PRInt32 numChars = MultiByteToWideChar(CP_UTF8, 0, my_argv[0], -1, NULL, 0);
  PRUnichar* wideFile = (PRUnichar *) PR_MALLOC(numChars * sizeof(PRUnichar));
  MultiByteToWideChar(CP_UTF8, 0, my_argv[0], -1, wideFile, numChars);

  // null terminate the array
  my_argv[count+1] = NULL;

  PRUnichar *cmdLine = NULL;
  if (assembleCmdLine(argv, &cmdLine) != 0)
    return IPC_NULL_HANDLE;

  PRUnichar *envBlock = NULL;
  if (assembleEnvBlock(envp, &envBlock) != 0) {
    PR_Free(cmdLine);
    return IPC_NULL_HANDLE;
  }

  PRUnichar* wideCwd = NULL;

  if (cwd != NULL) {
    numChars = MultiByteToWideChar(CP_UTF8, 0, cwd, -1, NULL, 0);
    PRUnichar* wideCwd = (PRUnichar *) PR_MALLOC(numChars * sizeof(PRUnichar));
    MultiByteToWideChar(CP_UTF8, 0, cwd, -1, wideCwd, numChars);
  }

  // Fill in the process's startup information
  STARTUPINFOW sInfo;
  memset( &sInfo, 0, sizeof(STARTUPINFOW) );
  sInfo.cb         = sizeof(STARTUPINFOW);
  sInfo.dwFlags    = STARTF_USESTDHANDLES;
  sInfo.hStdInput  = std_in  ? (HANDLE)std_in  : GetStdHandle(STD_INPUT_HANDLE);
  sInfo.hStdOutput = std_out ? (HANDLE)std_out : GetStdHandle(STD_OUTPUT_HANDLE);
  sInfo.hStdError  = std_err ? (HANDLE)std_err : GetStdHandle(STD_ERROR_HANDLE);
  DWORD dwCreationFlags = CREATE_DEFAULT_ERROR_MODE | CREATE_UNICODE_ENVIRONMENT;

  char buf[128];
  BOOL bIsConsoleAttached = (GetConsoleTitle(buf, 127) > 0);

  if (bIsWin2KOrLater && !bIsConsoleAttached) {
    // Create and hide child process console
    // Does not work from Win2K console (and not at all on Win95!)
    sInfo.dwFlags    |= STARTF_USESHOWWINDOW;
    sInfo.wShowWindow = SW_HIDE;
    dwCreationFlags |= CREATE_SHARED_WOW_VDM;
    dwCreationFlags |= CREATE_NEW_CONSOLE;
    if (detach) {
      dwCreationFlags |= DETACHED_PROCESS;
      dwCreationFlags |= CREATE_NEW_PROCESS_GROUP;
    }

  } else {
    // Hide parent process console (after creating one, if need be)
    // Works on all win32 platforms, but creates multiple VDMs on Win2K!
    IPC_HideConsoleWin32();
  }

  PROCESS_INFORMATION processInfo;

  bRetVal = CreateProcessW(wideFile,    // executable
                           cmdLine,     // command line
                           NULL,        // process security
                           NULL,        // thread security
                           TRUE,        // inherit handles
                           dwCreationFlags, // creation flags
                           envBlock,        // environment
                           wideCwd,         // cwd
                           &sInfo,         // startup info
                           &processInfo );  // process info (returned)


  if (cmdLine)
    PR_Free(cmdLine);

  if (wideCwd)
      PR_Free(wideCwd);

  if (envBlock)
    PR_DELETE(envBlock);

  nsMemory::Free(my_argv);


  // Close handle to primary thread of process (we don't need it)
  CloseHandle(processInfo.hThread);


  if (!bRetVal) {
    return IPC_NULL_HANDLE;
  }

  return processInfo.hProcess;
}


PRStatus IPC_CreateInheritablePipeWin32(IPCFileDesc* *readPipe,
                                        IPCFileDesc* *writePipe,
                                        PRBool readInherit,
                                        PRBool writeInherit)
{
  BOOL bRetVal;

  // Security attributes for inheritable handles
  SECURITY_ATTRIBUTES securityAttr;
  securityAttr.nLength = sizeof(SECURITY_ATTRIBUTES);
  securityAttr.lpSecurityDescriptor = NULL;
  securityAttr.bInheritHandle = TRUE;

  // Create pipe
  HANDLE hReadPipe, hWritePipe;
  bRetVal = CreatePipe( &hReadPipe, &hWritePipe,
                        &securityAttr, 0);
  if (!bRetVal)
    return PR_FAILURE;

  HANDLE hPipeTem;

  if (!readInherit) {
    // Make read handle uninheritable
    bRetVal = DuplicateHandle( GetCurrentProcess(),
                               hReadPipe,
                               GetCurrentProcess(),
                               &hPipeTem,
                               0,
                               FALSE,
                               DUPLICATE_SAME_ACCESS);
    CloseHandle(hReadPipe);

    if (!bRetVal) {
      CloseHandle(hWritePipe);
      return PR_FAILURE;
    }
    hReadPipe = hPipeTem;
  }

  if (!writeInherit) {
    // Make write handle uninheritable
    bRetVal = DuplicateHandle( GetCurrentProcess(),
                               hWritePipe,
                               GetCurrentProcess(),
                               &hPipeTem,
                               0,
                               FALSE,
                               DUPLICATE_SAME_ACCESS);
    CloseHandle(hWritePipe);

    if (!bRetVal) {
      CloseHandle(hReadPipe);
      return PR_FAILURE;
    }
    hWritePipe = hPipeTem;
  }

  *readPipe  = (void*) hReadPipe;
  *writePipe = (void*) hWritePipe;

  return PR_SUCCESS;
}


PRStatus IPC_WaitProcessWin32(IPCProcess* process, PRInt32 *exitCode)
{
  DWORD dwRetVal = WaitForSingleObject((HANDLE) process, INFINITE);
  if (dwRetVal == WAIT_FAILED)
    return PR_FAILURE;

  PR_ASSERT(dwRetVal == WAIT_OBJECT_0);

  unsigned long ulExitCode;
  if (exitCode) {
    if (!GetExitCodeProcess((HANDLE) process, &ulExitCode))
      return PR_FAILURE;

    *exitCode = ulExitCode;
  }

  CloseHandle(process);

  return PR_SUCCESS;
}


PRStatus IPC_KillProcessWin32(IPCProcess* process)
{
  /*
   * On Unix, if a process terminates normally, its exit code is
   * between 0 and 255.  So here on Windows, we use the exit code
   * 256 to indicate that the process is killed.
   */

  return TerminateProcess((HANDLE) process, 256) ? PR_SUCCESS : PR_FAILURE;
}

PRStatus IPC_GetProcessIdWin32(IPCProcess* process, PRInt32 *pid)
{
  *pid = -1;
  if (! process)
    return PR_FAILURE;

  HMODULE kernelDLL = ::LoadLibraryW(L"kernel32.dll");
  if (kernelDLL) {
      GetProcessIdPtr getProcessId = (GetProcessIdPtr)GetProcAddress(kernelDLL,
        "GetProcessId");
      if (getProcessId)
         *pid  = getProcessId((HANDLE) process);

      FreeLibrary(kernelDLL);
  }

  return PR_SUCCESS;
}

PRInt32 IPC_ReadWin32(IPCFileDesc* fd, void *buf, PRInt32 amount)
{
  unsigned long bytes;

  if (ReadFile((HANDLE) fd,
               (LPVOID) buf,
               amount,
               &bytes,
               NULL)) {
    return bytes;
  }

  DWORD dwLastError = GetLastError();

  if (dwLastError == ERROR_BROKEN_PIPE)
    return 0;

  return -1;
}


PRInt32 IPC_WriteWin32(IPCFileDesc* fd, const void *buf, PRInt32 amount)
{
  unsigned long bytes;

  if (WriteFile((HANDLE) fd, buf, amount, &bytes, NULL )) {
    return bytes;
  }

  DWORD dwLastError = GetLastError();

  return -1;

}


PRStatus IPC_CloseWin32(IPCFileDesc* fd)
{
  return (CloseHandle((HANDLE) fd)) ? PR_SUCCESS : PR_FAILURE;
}


PRErrorCode IPC_GetErrorWin32()
{
  return PR_UNKNOWN_ERROR;
}

#endif /* XP_WIN_IPC */
