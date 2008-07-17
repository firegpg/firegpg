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

// Logging of debug output
// The following define statement should occur before any include statements
#define FORCE_PR_LOG       /* Allow logging even in release build */

#include "ipc.h"
#include "nsCRT.h"

#include "IPCProcess.h"

#ifdef PR_LOGGING
extern PRLogModuleInfo* gIPCServiceLog;
#endif

#define ERROR_LOG(args)    PR_LOG(gIPCServiceLog,PR_LOG_ERROR,args)
#define WARNING_LOG(args)  PR_LOG(gIPCServiceLog,PR_LOG_WARNING,args)
#define DEBUG_LOG(args)    PR_LOG(gIPCServiceLog,PR_LOG_DEBUG,args)

///////////////////////////////////////////////////////////////////////////////

#ifdef XP_WIN
#include <windows.h>
#include <stdio.h>
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
                                           PRFileDesc* std_err)
{
#ifdef XP_WIN
  // Workaround for Win32
  // Hide process console (after creating one, if need be)
  IPC_HideConsoleWin32();
#endif

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
  return PR_CreateProcess(path, argv, envp, processAttr);
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

void IPC_Shutdown()
{

#ifdef XP_WIN
  if (gIPCWinConsoleAllocated) {
    ::FreeConsole();
    gIPCWinConsoleAllocated = PR_FALSE;
  }
#endif

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
        //::fprintf( stderr, "stderr console\n" );
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

/* Windows specific code adapted from nsprpub/pr/src/md/windows/ntmisc.c
 */

/*
 * Assemble the command line by concatenating the argv array.
 * On success, this function returns 0 and the resulting command
 * line is returned in *cmdLine.  On failure, it returns -1.
 */
static int assembleCmdLine(char *const *argv, char **cmdLine)
{
    char *const *arg;
    char *p, *q;
    int cmdLineSize;
    int numBackslashes;
    int i;
    int argNeedQuotes;

    /*
     * Find out how large the command line buffer should be.
     */
    cmdLineSize = 0;
    for (arg = argv; *arg; arg++) {
        /*
         * \ and " need to be escaped by a \.  In the worst case,
         * every character is a \ or ", so the string of length
         * may double.  If we quote an argument, that needs two ".
         * Finally, we need a space between arguments, and
         * a null byte at the end of command line.
         */
        cmdLineSize += 2 * strlen(*arg)  /* \ and " need to be escaped */
                + 2                      /* we quote every argument */
                + 1;                     /* space in between, or final null */
    }
    p = *cmdLine = (char*) PR_MALLOC(cmdLineSize);
    if (p == NULL) {
        return -1;
    }

    for (arg = argv; *arg; arg++) {
        /* Add a space to separates the arguments */
        if (arg != argv) {
            *p++ = ' ';
        }
        q = *arg;
        numBackslashes = 0;
        argNeedQuotes = 0;

        /* If the argument contains white space, it needs to be quoted. */
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
                    /*
                     * Double the backslashes since they are followed
                     * by a quote
                     */
                    for (i = 0; i < 2 * numBackslashes; i++) {
                        *p++ = '\\';
                    }
                    numBackslashes = 0;
                }
                /* To escape the quote */
                *p++ = '\\';
                *p++ = *q++;
            } else {
                if (numBackslashes) {
                    /*
                     * Backslashes are not followed by a quote, so
                     * don't need to double the backslashes.
                     */
                    for (i = 0; i < numBackslashes; i++) {
                        *p++ = '\\';
                    }
                    numBackslashes = 0;
                }
                *p++ = *q++;
            }
        }

        /* Now we are at the end of this argument */
        if (numBackslashes) {
            /*
             * Double the backslashes if we have a quote string
             * delimiter at the end.
             */
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
static int assembleEnvBlock(char *const *envp, char **envBlock)
{
    char *p;
    char *q;
    char * const *env;
    char *curEnv;
    char *cwdStart, *cwdEnd;
    int envBlockSize;

    if (envp == NULL) {
        *envBlock = NULL;
        return 0;
    }

    curEnv = GetEnvironmentStrings();

    cwdStart = curEnv;
    while (*cwdStart) {
        if (cwdStart[0] == '=' && cwdStart[1] != '\0'
                && cwdStart[2] == ':' && cwdStart[3] == '=') {
            break;
        }
        cwdStart += strlen(cwdStart) + 1;
    }
    cwdEnd = cwdStart;
    if (*cwdEnd) {
        cwdEnd += strlen(cwdEnd) + 1;
        while (*cwdEnd) {
            if (cwdEnd[0] != '=' || cwdEnd[1] == '\0'
                    || cwdEnd[2] != ':' || cwdEnd[3] != '=') {
                break;
            }
            cwdEnd += strlen(cwdEnd) + 1;
        }
    }
    envBlockSize = cwdEnd - cwdStart;

    for (env = envp; *env; env++) {
        envBlockSize += strlen(*env) + 1;
    }
    envBlockSize++;

    p = *envBlock = (char*) PR_MALLOC(envBlockSize);
    if (p == NULL) {
        FreeEnvironmentStrings(curEnv);
        return -1;
    }

    q = cwdStart;
    while (q < cwdEnd) {
        *p++ = *q++;
    }
    FreeEnvironmentStrings(curEnv);

    for (env = envp; *env; env++) {
        q = *env;
        while (*q) {
            *p++ = *q++;
        }
        *p++ = '\0';
    }
    *p = '\0';
    return 0;
}

IPCProcess* IPC_CreateProcessRedirectedWin32(const char *path,
                                            char *const *argv,
                                            char *const *envp,
                                            const char *cwd,
                                            IPCFileDesc* std_in,
                                            IPCFileDesc* std_out,
                                            IPCFileDesc* std_err)
{
  BOOL bRetVal;

  DEBUG_LOG(("IPCProcess: createProcess %p, %p, %p\n", std_in,
                                                       std_out,
                                                       std_err));

  // Determine OS Version
  OSVERSIONINFO osvi;
  BOOL bIsWindows2KOrLater = FALSE;

  ZeroMemory(&osvi, sizeof(OSVERSIONINFO));
  osvi.dwOSVersionInfoSize = sizeof(OSVERSIONINFO);

  if (GetVersionEx(&osvi)) {
    bIsWindows2KOrLater = (osvi.dwPlatformId == VER_PLATFORM_WIN32_NT) &&
                          (osvi.dwMajorVersion >= 5);
  }

  char *cmdLine = NULL;
  if (assembleCmdLine(argv, &cmdLine) == -1)
    return IPC_NULL_HANDLE;

  char *envBlock = NULL;
  if (assembleEnvBlock(envp, &envBlock) == -1)
    return IPC_NULL_HANDLE;

  // Fill in the process's startup information
  STARTUPINFO startupInfo;
  memset( &startupInfo, 0, sizeof(STARTUPINFO) );
  startupInfo.cb	  = sizeof(STARTUPINFO);
  startupInfo.dwFlags	  = STARTF_USESTDHANDLES;
  startupInfo.hStdInput	  = std_in  ? (HANDLE) std_in  : GetStdHandle(STD_INPUT_HANDLE);
  startupInfo.hStdOutput  = std_out ? (HANDLE) std_out : GetStdHandle(STD_OUTPUT_HANDLE);
  startupInfo.hStdError	  = std_err ? (HANDLE) std_err : GetStdHandle(STD_ERROR_HANDLE);

  DWORD dwCreationFlags = CREATE_DEFAULT_ERROR_MODE;

  char buf[128];
  BOOL bIsConsoleAttached = (GetConsoleTitle(buf, 127) > 0);

  if (bIsWindows2KOrLater && !bIsConsoleAttached) {
    // Create and hide child process console
    // Does not work from Win2K console (and not at all on Win95!)
    startupInfo.dwFlags    |= STARTF_USESHOWWINDOW;
    startupInfo.wShowWindow = SW_HIDE;
    dwCreationFlags |= CREATE_SHARED_WOW_VDM;
    dwCreationFlags |= CREATE_NEW_CONSOLE;

  } else {
    // Hide parent process console (after creating one, if need be)
    // Works on all win32 platforms, but creates multiple VDMs on Win2K!
    IPC_HideConsoleWin32();
  }

  PROCESS_INFORMATION processInfo;
  bRetVal = CreateProcess( NULL,		// executable
                           cmdLine,		// command line
                           NULL,		// process security
                           NULL,		// thread security
                           TRUE,		// inherit handles
                           dwCreationFlags,     // creation flags
                           envBlock, 	        // environment
                           cwd,	                // cwd
                           &startupInfo,	// startup info
                           &processInfo );	// process info (returned)

  DEBUG_LOG(("IPCProcess: created process %s (%d) %p: %s\n", cmdLine,
               (int) bRetVal, processInfo.hProcess, envBlock));

  if (cmdLine) {
    PR_DELETE(cmdLine);
  }

  if (envBlock) {
    PR_DELETE(envBlock);
  }

  // Close handle to primary thread of process (we don't need it)
  CloseHandle(processInfo.hThread);

  if (!bRetVal)
    return IPC_NULL_HANDLE;

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

  DEBUG_LOG(("IPCProcess: created pipe %p, %p\n", hReadPipe,
                                                  hWritePipe));

  return PR_SUCCESS;
}


PRStatus IPC_WaitProcessWin32(IPCProcess* process, PRInt32 *exitCode)
{
  DEBUG_LOG(("IPCProcess: wait for %p\n", process));

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
  DEBUG_LOG(("IPCProcess: killing %p\n", process));

  if (TerminateProcess((HANDLE) process, 256))
    return PR_SUCCESS;

  return PR_FAILURE;
}


PRInt32 IPC_ReadWin32(IPCFileDesc* fd, void *buf, PRInt32 amount)
{
  unsigned long bytes;

  if (ReadFile((HANDLE) fd,
               (LPVOID) buf,
               amount,
               &bytes,
               NULL)) {
    DEBUG_LOG(("IPCProcess: read %d bytes from %p\n", bytes, fd));
    return bytes;
  }

  DWORD dwLastError = GetLastError();

  DEBUG_LOG(("IPCProcess: error in reading from %p (code=%d)\n",
             fd, (int) dwLastError));

  if (dwLastError == ERROR_BROKEN_PIPE)
    return 0;

  return -1;
}


PRInt32 IPC_WriteWin32(IPCFileDesc* fd, const void *buf, PRInt32 amount)
{
  unsigned long bytes;

  if (WriteFile((HANDLE) fd, buf, amount, &bytes, NULL )) {
    DEBUG_LOG(("IPCProcess: wrote %d bytes to %p\n", bytes, fd));
    return bytes;
  }

  DWORD dwLastError = GetLastError();

  DEBUG_LOG(("IPCProcess: error in writing to %p (code=%d)\n",
             fd, (int) dwLastError));

  return -1;

}


PRStatus IPC_CloseWin32(IPCFileDesc* fd)
{
  if (CloseHandle((HANDLE) fd))
    return PR_SUCCESS;

  return PR_FAILURE;
}


PRErrorCode IPC_GetErrorWin32()
{
  return PR_UNKNOWN_ERROR;
}

#endif /* XP_WIN_IPC */
