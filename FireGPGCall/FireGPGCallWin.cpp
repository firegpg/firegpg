#include "FireGPGCall.h"
#include "nsMemory.h"
#include "nsCOMPtr.h"
#include "plstr.h"
#include <fcntl.h>
#include <Io.h>
#include <iostream>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <string>
#include <tchar.h>
#include <windows.h>


#define BUFSIZE 10240
#define SMALLBUFSIZE 2

HANDLE hChildStdinRd, hChildStdinWr,  hChildStdoutRd, hChildStdoutWr,  hProcess, hStdout;

INT CreateChildProcess(const char *);
VOID WriteToPipe(VOID);
VOID ReadFromPipe(VOID);
VOID ErrorExit(LPSTR);

NS_IMPL_ISUPPORTS1(FireGPGCall, IFireGPGCall)

FireGPGCall::FireGPGCall() {
  /* member initializers and constructor code */
}

FireGPGCall::~FireGPGCall() {
  /* destructor code */
}

/* long Add (in long a, in long b); */
NS_IMETHODIMP FireGPGCall::Call(const char *path, const char *parameters, const char *sdin, char **_retval) {

    DWORD dwRead, dwWritten;
    CHAR chBuf[BUFSIZE];
    SECURITY_ATTRIBUTES saAttr;
    BOOL fSuccess;

    // Set the bInheritHandle flag so pipe handles are inherited.
    saAttr.nLength = sizeof(SECURITY_ATTRIBUTES);
    saAttr.bInheritHandle = TRUE;
    saAttr.lpSecurityDescriptor = NULL;

    // Get the handle to the current STDOUT.
    hStdout = GetStdHandle(STD_OUTPUT_HANDLE);

    // Create a pipe for the child process's STDOUT.
    if (! CreatePipe(&hChildStdoutRd, &hChildStdoutWr, &saAttr, 0))
        ErrorExit("Stdout pipe creation failed\n");

    // Ensure that the read handle to the child process's pipe for STDOUT is not inherited.
    SetHandleInformation( hChildStdoutRd, HANDLE_FLAG_INHERIT, 0);

    // Create a pipe for the child process's STDIN.
    if (! CreatePipe(&hChildStdinRd, &hChildStdinWr, &saAttr, 0))
        ErrorExit("Stdin pipe creation failed\n");

    // Ensure that the write handle to the child process's pipe for STDIN is not inherited.
    SetHandleInformation( hChildStdinWr, HANDLE_FLAG_INHERIT, 0);

    // Now create the child process.
    fSuccess = CreateChildProcess(parameters);
    if (fSuccess == 0)
        ErrorExit("Create process failed with");

	//On attend qu'il attend.
	WaitForInputIdle(hProcess,0);

    WriteFile(hChildStdinWr, sdin, PL_strlen(sdin) , &dwWritten, NULL);

    CloseHandle(hChildStdinWr);

    int i = 0;
	int secu = 0;


    while(WaitForSingleObject(hProcess,0) == WAIT_TIMEOUT && secu <= 10) { //Fin du processus (normaolement) ou 2.5 s passées
		secu++;
		Sleep(250);
    }



	ReadFile( hChildStdoutRd, (char *)chBuf + i, BUFSIZE - i, &dwRead, NULL);
	i += dwRead;

    chBuf[i] = (char)'\0';

    * _retval = (char*) nsMemory::Alloc(PL_strlen(chBuf) + 1);
    if (! *_retval)
        return NS_ERROR_NULL_POINTER;

    PL_strcpy(*_retval,chBuf);

    return NS_OK;
}


INT CreateChildProcess(const char *parameters) {

    TCHAR chBuf[1000];
    int i = 0;

    parameters++; //Ignore first char

    while(*parameters)  {

        chBuf[i] = *parameters;
        i++;
        parameters++;
    }

    chBuf[i] = (char)'\0';

    PROCESS_INFORMATION piProcInfo;
    STARTUPINFO siStartInfo;
    INT bFuncRetn = FALSE;

    // Set up members of the PROCESS_INFORMATION structure.
    ZeroMemory( &piProcInfo, sizeof(PROCESS_INFORMATION) );

    // Set up members of the STARTUPINFO structure.
    ZeroMemory( &siStartInfo, sizeof(STARTUPINFO) );
    siStartInfo.cb = sizeof(STARTUPINFO);
    siStartInfo.hStdError = hChildStdoutWr;
    siStartInfo.hStdOutput = hChildStdoutWr;
    siStartInfo.hStdInput = hChildStdinRd;
    siStartInfo.dwFlags |= STARTF_USESTDHANDLES | STARTF_USESHOWWINDOW;
	siStartInfo.wShowWindow = SW_HIDE;

    // Create the child process.
    bFuncRetn = CreateProcess(NULL,
        chBuf,
        NULL,          // process security attributes
        NULL,          // primary thread security attributes
        TRUE,          // handles are inherited
        0,             // creation flags
        NULL,          // use parent's environment
        NULL,          // use parent's current directory
        &siStartInfo,  // STARTUPINFO pointer
        &piProcInfo);  // receives PROCESS_INFORMATION

    if (bFuncRetn == 0)
        ErrorExit("CreateProcess failed\n");
    else {
        hProcess = piProcInfo.hProcess;
        return bFuncRetn;
    }

}

VOID ErrorExit (LPSTR lpszMessage) {
    fprintf(stderr, "%s\n", lpszMessage);
    ExitProcess(0);
}