// -*- coding: utf-8 -*-
// vim: et:ts=4:sw=4:sts=4:ft=javascript
/*
 * Import into a JS component using
 * 'Components.utils.import("resource://firefogg/subprocess.jsm");'
 *
 * This object allows to start a process, and read/write data to/from it
 * using stdin/stdout/stderr streams.
 * Usage example:
 *
 *  var p = subprocess.call({
 *    command:     '/bin/foo',
 *    arguments:   ['-v', 'foo'],
 *    environment: [ "XYZ=abc", "MYVAR=def" ],
 *    charset: 'UTF-8',
 *    workdir: '/home/foo',
 *    //stdin: "some value to write to stdin\nfoobar",
 *    stdin: function(stdin) {
 *      stdin.write("some value to write to stdin\nfoobar");
 *      stdin.close();
 *    },
 *    stdout: function(data) {
 *      dump("got data on stdout:" + data + "\n");
 *    },
 *    stderr: function(data) {
 *      dump("got data on stderr:" + data + "\n");
 *    },
 *    done: function(result) {
 *      dump("process terminated with " + result.exitCode + "\n");
 *    },
 *    mergeStderr: false
 *  });
 *  p.wait(); // wait for the subprocess to terminate
 *
 *
 * Description of parameters:
 * --------------------------
 * Apart from <command>, all arguments are optional.
 *
 * command:     either a |nsIFile| object pointing to an executable file or a
 *              String containing the platform-dependent path to an executable
 *              file.
 *
 * arguments:   optional string array containing the arguments to the command.
 *
 * environment: optional string array containing environment variables to pass
 *              to the command. The array elements must have the form
 *              "VAR=data". Please note that if environment is defined, it
 *              replaces any existing environment variables for the subprocess.
 *
 * charset:     Output is decoded with given charset and a string is returned.
 *              If charset is undefined, "UTF-8" is used as default.
 *              To get binary data, set this to null and an array of bytes
 *              is returned.
 *
 * workdir:     optional; String containing the platform-dependent path to a
 *              directory to become the current working directory of the subprocess.
 *
 * stdin:       optional input data for the process to be passed on standard
 *              input. stdin can either be a string or a function.
 *              a string gets written to stdin and stdin gets closed,
 *              a function gets passed an object with write and close function.
 *
 * stdout:      an optional function that can receive output data from the
 *              process. The stdout-function is called asynchronously; it can be
 *              called mutliple times during the execution of a process.
 *              At a minimum at each occurance of \n or \r.
 *              Please note that null-characters might need to be escaped
 *              with something like 'data.replace(/\0/g, "\\0");'.
 *
 * stderr:      an optional function that can receive stderr data from the
 *              process. The stderr-function is called asynchronously; it can be
 *              called mutliple times during the execution of a process. Please
 *              note that null-characters might need to be escaped with
 *              something like 'data.replace(/\0/g, "\\0");'.
 *              (on windows it only gets called once right now)
 *
 * done:        optional function that is called when the process has terminated.
 *              The exit code from the process available via result.exitCode. If
 *              stdout is not defined, then the output from stdout is available
 *              via result.stdout. stderr data is in result.stderr
 *
 * mergeStderr: optional boolean value. If true, stderr is merged with stdout;
 *              no data will be provided to stderr.
 *
 *
 * Description of object returned by subprocess.call(...)
 * ------------------------------------------------------
 * The object returned by subprocess.call offers a few methods that can be
 * executed:
 *
 * wait():      waits for the subprocess to terminate. It is not required to use
 *              wait; done will be called in any case when the subprocess terminated.
 *
 * kill():      kill the subprocess. Any open pipes will be closed and
 *              done will be called.
 *
 *
 */
'use strict';

Components.utils.import("resource://gre/modules/ctypes.jsm");

let EXPORTED_SYMBOLS = [ "subprocess" ];

const Cc = Components.classes;
const Ci = Components.interfaces;

//Windows API definitions
if (ctypes.size_t.size == 8) {
  var WinABI = ctypes.default_abi;
} else {
  var WinABI = ctypes.winapi_abi;
}
const WORD = ctypes.uint16_t;
const DWORD = ctypes.uint32_t;
const LPDWORD = DWORD.ptr;

const UINT = ctypes.unsigned_int;
const BOOL = ctypes.bool;
const HANDLE = ctypes.size_t;
const HWND = HANDLE;
const HMODULE = HANDLE;
const WPARAM = ctypes.size_t;
const LPARAM = ctypes.size_t;
const LRESULT = ctypes.size_t;
const ULONG_PTR = ctypes.uintptr_t;
const PVOID = ctypes.voidptr_t;
const LPVOID = PVOID;
const LPCTSTR = ctypes.jschar.ptr;
const LPCWSTR = ctypes.jschar.ptr;
const LPTSTR = ctypes.jschar.ptr;
const LPSTR = ctypes.char.ptr;
const LPCSTR = ctypes.char.ptr;
const LPBYTE = ctypes.char.ptr;

const CREATE_NEW_CONSOLE = 0x00000010;
const CREATE_NO_WINDOW = 0x08000000;
const CREATE_UNICODE_ENVIRONMENT = 0x00000400;
const STARTF_USESHOWWINDOW = 0x00000001;
const STARTF_USESTDHANDLES = 0x00000100;
const SW_HIDE = 0;
const DUPLICATE_SAME_ACCESS = 0x00000002;
const STILL_ACTIVE = 259;
const INFINITE = DWORD(0xFFFFFFFF);

/*
typedef struct _SECURITY_ATTRIBUTES {
 DWORD  nLength;
 LPVOID lpSecurityDescriptor;
 BOOL   bInheritHandle;
} SECURITY_ATTRIBUTES, *PSECURITY_ATTRIBUTES, *LPSECURITY_ATTRIBUTES;
*/
const SECURITY_ATTRIBUTES = new ctypes.StructType("SECURITY_ATTRIBUTES", [
    {"nLength": DWORD},
    {"lpSecurityDescriptor": LPVOID},
    {"bInheritHandle": BOOL},
]);

/*
typedef struct _STARTUPINFO {
  DWORD  cb;
  LPTSTR lpReserved;
  LPTSTR lpDesktop;
  LPTSTR lpTitle;
  DWORD  dwX;
  DWORD  dwY;
  DWORD  dwXSize;
  DWORD  dwYSize;
  DWORD  dwXCountChars;
  DWORD  dwYCountChars;
  DWORD  dwFillAttribute;
  DWORD  dwFlags;
  WORD   wShowWindow;
  WORD   cbReserved2;
  LPBYTE lpReserved2;
  HANDLE hStdInput;
  HANDLE hStdOutput;
  HANDLE hStdError;
} STARTUPINFO, *LPSTARTUPINFO;
*/
const STARTUPINFO = new ctypes.StructType("STARTUPINFO", [
    {"cb": DWORD},
    {"lpReserved": LPTSTR},
    {"lpDesktop": LPTSTR},
    {"lpTitle": LPTSTR},
    {"dwX": DWORD},
    {"dwY": DWORD},
    {"dwXSize": DWORD},
    {"dwYSize": DWORD},
    {"dwXCountChars": DWORD},
    {"dwYCountChars": DWORD},
    {"dwFillAttribute": DWORD},
    {"dwFlags": DWORD},
    {"wShowWindow": WORD},
    {"cbReserved2": WORD},
    {"lpReserved2": LPBYTE},
    {"hStdInput": HANDLE},
    {"hStdOutput": HANDLE},
    {"hStdError": HANDLE},
]);

/*
typedef struct _PROCESS_INFORMATION {
  HANDLE hProcess;
  HANDLE hThread;
  DWORD  dwProcessId;
  DWORD  dwThreadId;
} PROCESS_INFORMATION, *LPPROCESS_INFORMATION;
*/
const PROCESS_INFORMATION = new ctypes.StructType("PROCESS_INFORMATION", [
    {"hProcess": HANDLE},
    {"hThread": HANDLE},
    {"dwProcessId": DWORD},
    {"dwThreadId": DWORD},
]);

/*
typedef struct _OVERLAPPED {
  ULONG_PTR Internal;
  ULONG_PTR InternalHigh;
  union {
    struct {
      DWORD Offset;
      DWORD OffsetHigh;
    };
    PVOID  Pointer;
  };
  HANDLE    hEvent;
} OVERLAPPED, *LPOVERLAPPED;
*/
const OVERLAPPED = new ctypes.StructType("OVERLAPPED");

//UNIX definitions
const pid_t = ctypes.uint32_t;
const WNOHANG = 1;
const F_SETFL = 4;
const O_NONBLOCK = 2048; // 04000; 


function LogError(msg) {
    //Components.utils.import("resource://firefogg/utils.jsm");
    //utils.debug(msg);
    dump('\n' + msg + '\n');
}

function setTimeout(callback, timeout) {
    var timer = Cc["@mozilla.org/timer;1"].createInstance(Ci.nsITimer);
    timer.initWithCallback(callback, timeout, Ci.nsITimer.TYPE_ONE_SHOT);
};

function readString(data, length, charset) {
    var string = '', bytes = [];
    for(var i = 0;i < length; i++) {
        if(data[i] == 0)
            break
        bytes.push(data[i]);
    }
    if (!bytes || bytes.length == 0)
        return string;
    if(charset === null) {
        return bytes;
    }
    charset = charset || 'UTF-8';
    var unicodeConv = Cc["@mozilla.org/intl/scriptableunicodeconverter"]
                        .getService(Ci.nsIScriptableUnicodeConverter);
    try {
        unicodeConv.charset = charset;
        string = unicodeConv.convertFromByteArray(bytes, bytes.length);
    } catch (ex) {
        string = '';
    }
    string += unicodeConv.Finish();
    return string;
}

var subprocess = {
    call: function(options) {
        options.mergeStderr = options.mergeStderr || false;
        options.workdir = options.workdir ||  null;
        options.environment = options.environment ||  [];
        if (options.arguments) {
            var args = options.arguments;
            options.arguments = [];
            args.forEach(function(argument) {
                options.arguments.push(argument);
            });
        } else {
            options.arguments = [];
        }
        var xulRuntime = Cc["@mozilla.org/xre/app-info;1"].getService(Ci.nsIXULRuntime);
        if (xulRuntime.OS.substring(0, 3) == "WIN") {
            return subprocess_win32(options);
        } else {
            options.libc = xulRuntime.OS == 'Darwin' ? 'libc.dylib' : 'libc.so.6';
            return subprocess_unix(options);
        }
    }
};

function subprocess_win32(options) {
    var kernel32dll = ctypes.open("kernel32.dll"),
        hChildProcess,
        active = true,
        child = {},
        error = options.charset === null ? [] : '',
        output = options.charset === null ? [] : '';

    //api declarations
    /*
    BOOL WINAPI CloseHandle(
      __in  HANDLE hObject
    );
    */
    var CloseHandle = kernel32dll.declare("CloseHandle",
                                            WinABI,
                                            BOOL,
                                            HANDLE
    );

    /*
    BOOL WINAPI CreateProcess(
      __in_opt     LPCTSTR lpApplicationName,
      __inout_opt  LPTSTR lpCommandLine,
      __in_opt     LPSECURITY_ATTRIBUTES lpProcessAttributes,
      __in_opt     LPSECURITY_ATTRIBUTES lpThreadAttributes,
      __in         BOOL bInheritHandles,
      __in         DWORD dwCreationFlags,
      __in_opt     LPVOID lpEnvironment,
      __in_opt     LPCTSTR lpCurrentDirectory,
      __in         LPSTARTUPINFO lpStartupInfo,
      __out        LPPROCESS_INFORMATION lpProcessInformation
    );
     */
    var CreateProcessW = kernel32dll.declare("CreateProcessW",
                                            WinABI,
                                            BOOL,
                                            LPCTSTR,
                                            LPTSTR,
                                            SECURITY_ATTRIBUTES.ptr,
                                            SECURITY_ATTRIBUTES.ptr,
                                            BOOL,
                                            DWORD,
                                            LPVOID,
                                            LPCTSTR,
                                            STARTUPINFO.ptr,
                                            PROCESS_INFORMATION.ptr
                                         );

    /*
    BOOL WINAPI ReadFile(
      __in         HANDLE hFile,
      __out        LPVOID ReadFileBuffer,
      __in         DWORD nNumberOfBytesToRead,
      __out_opt    LPDWORD lpNumberOfBytesRead,
      __inout_opt  LPOVERLAPPED lpOverlapped
    );
    */
    var ReadFileBufferSize = 256,
        ReadFileBuffer = ctypes.char.array(ReadFileBufferSize),
        ReadFile = kernel32dll.declare("ReadFile",
                                        WinABI,
                                        BOOL,
                                        HANDLE,
                                        ReadFileBuffer,
                                        DWORD,
                                        LPDWORD,
                                        OVERLAPPED.ptr
    );
    /*
    BOOL WINAPI PeekNamedPipe(
      __in       HANDLE hNamedPipe,
      __out_opt  LPVOID lpBuffer,
      __in       DWORD nBufferSize,
      __out_opt  LPDWORD lpBytesRead,
      __out_opt  LPDWORD lpTotalBytesAvail,
      __out_opt  LPDWORD lpBytesLeftThisMessage
    );
     */
    var PeekNamedPipe = kernel32dll.declare("PeekNamedPipe",
                                        WinABI,
                                        BOOL,
                                        HANDLE,
                                        ReadFileBuffer,
                                        DWORD,
                                        LPDWORD,
                                        LPDWORD,
                                        LPDWORD
    );

    /*
    BOOL WINAPI WriteFile(
      __in         HANDLE hFile,
      __in         LPCVOID lpBuffer,
      __in         DWORD nNumberOfBytesToWrite,
      __out_opt    LPDWORD lpNumberOfBytesWritten,
      __inout_opt  LPOVERLAPPED lpOverlapped
    );
    */
    var WriteFile = kernel32dll.declare("WriteFile",
                                        WinABI,
                                        BOOL,
                                        HANDLE,
                                        ctypes.char.ptr,
                                        DWORD,
                                        LPDWORD,
                                        OVERLAPPED.ptr
    );

    /*
    BOOL WINAPI CreatePipe(
      __out     PHANDLE hReadPipe,
      __out     PHANDLE hWritePipe,
      __in_opt  LPSECURITY_ATTRIBUTES lpPipeAttributes,
      __in      DWORD nSize
    );
    */
    var CreatePipe = kernel32dll.declare("CreatePipe",
                                        WinABI,
                                        BOOL,
                                        HANDLE.ptr,
                                        HANDLE.ptr,
                                        SECURITY_ATTRIBUTES.ptr,
                                        DWORD
    );

   /* 
    HANDLE WINAPI GetCurrentProcess(void);
    */
    var GetCurrentProcess = kernel32dll.declare("GetCurrentProcess",
                                        WinABI,
                                        HANDLE
    );

    /*
    DWORD WINAPI GetLastError(void);
    */
    var GetLastError = kernel32dll.declare("GetLastError",
                                        WinABI,
                                        DWORD 
    );

    /*
    BOOL WINAPI DuplicateHandle(
      __in   HANDLE hSourceProcessHandle,
      __in   HANDLE hSourceHandle,
      __in   HANDLE hTargetProcessHandle,
      __out  LPHANDLE lpTargetHandle,
      __in   DWORD dwDesiredAccess,
      __in   BOOL bInheritHandle,
      __in   DWORD dwOptions
    );
    */
    var DuplicateHandle = kernel32dll.declare("DuplicateHandle",
                                        WinABI,
                                        BOOL,
                                        HANDLE,
                                        HANDLE,
                                        HANDLE,
                                        HANDLE.ptr,
                                        DWORD,
                                        BOOL,
                                        DWORD
    );


    /*
    BOOL WINAPI GetExitCodeProcess(
      __in   HANDLE hProcess,
      __out  LPDWORD lpExitCode
    );
    */
    var GetExitCodeProcess = kernel32dll.declare("GetExitCodeProcess",
                                        WinABI,
                                        BOOL,
                                        HANDLE,
                                        LPDWORD
    );

    /*
    DWORD WINAPI WaitForSingleObject(
      __in  HANDLE hHandle,
      __in  DWORD dwMilliseconds
    );
    */
    var WaitForSingleObject = kernel32dll.declare("WaitForSingleObject",
                                        WinABI,
                                        DWORD,
                                        HANDLE,
                                        DWORD
    );

    /*
    BOOL WINAPI TerminateProcess(
      __in  HANDLE hProcess,
      __in  UINT uExitCode
    );
    */
    var TerminateProcess = kernel32dll.declare("TerminateProcess",
                                        WinABI,
                                        BOOL,
                                        HANDLE,
                                        UINT
    );

    //functions
    function popen(command, args, environment, child) {
        //escape arguments
        args.unshift(command);
        for (var i = 0; i < args.length; i++) {
          if (typeof args[i] != "string") { args[i] = args[i].toString(); }
          /* quote arguments with spaces */
          if (args[i].match(/\s/)) {
            args[i] = "\"" + args[i] + "\"";
          }
          /* If backslash is followed by a quote, double it */
          args[i] = args[i].replace(/\\\"/g, "\\\\\"");
        }
        command = args.join(' ');
        
        var environment = environment || [];
        if(environment.length) {
            //An environment block consists of
            //a null-terminated block of null-terminated strings.
            //Using CREATE_UNICODE_ENVIRONMENT so needs to be jschar
            environment = ctypes.jschar.array()(environment.join('\0') + '\0');
        } else {
            environment = null;
        }

        var hOutputReadTmp = new HANDLE(),
            hOutputRead = new HANDLE(),
            hOutputWrite = new HANDLE();

        var hErrorRead = new HANDLE(),
            hErrorReadTmp = new HANDLE(),
            hErrorWrite = new HANDLE();

        var hInputRead = new HANDLE(),
            hInputWriteTmp = new HANDLE(),
            hInputWrite = new HANDLE();

        // Set up the security attributes struct.
        var sa = new SECURITY_ATTRIBUTES();
        sa.nLength = SECURITY_ATTRIBUTES.size;
        sa.lpSecurityDescriptor = null;
        sa.bInheritHandle = true;

        // Create output pipe.
        if(!CreatePipe(hOutputReadTmp.address(), hOutputWrite.address(), sa.address(), 0))
            LogError('CreatePipe hOutputReadTmp');

        if(options.mergeStderr) {
          // Create a duplicate of the output write handle for the std error
          // write handle. This is necessary in case the child application
          // closes one of its std output handles.
          if (!DuplicateHandle(GetCurrentProcess(), hOutputWrite,
                               GetCurrentProcess(), hErrorWrite.address(), 0,
                               true, DUPLICATE_SAME_ACCESS))
             LogError("DuplicateHandle hOutputWrite");
        } else {
            // Create error pipe.
            if(!CreatePipe(hErrorReadTmp.address(), hErrorWrite.address(), sa.address(), 0))
                LogError('CreatePipe hErrorReadTmp');
        }
        // Create input pipe.
        if (!CreatePipe(hInputRead.address(),hInputWriteTmp.address(),sa.address(),0))
            LogError("CreatePipe");

        // Create new output/error read handle and the input write handles. Set
        // the Properties to FALSE. Otherwise, the child inherits the
        // properties and, as a result, non-closeable handles to the pipes
        // are created.
        if (!DuplicateHandle(GetCurrentProcess(), hOutputReadTmp,
                             GetCurrentProcess(),
                             hOutputRead.address(), // Address of new handle.
                             0, false, // Make it uninheritable.
                             DUPLICATE_SAME_ACCESS))
             LogError("DupliateHandle hOutputReadTmp");

        if(!options.mergeStderr) {
            if (!DuplicateHandle(GetCurrentProcess(), hErrorReadTmp,
                             GetCurrentProcess(),
                             hErrorRead.address(), // Address of new handle.
                             0, false, // Make it uninheritable.
                             DUPLICATE_SAME_ACCESS))
             LogError("DupliateHandle hErrorReadTmp");
        }
        if (!DuplicateHandle(GetCurrentProcess(), hInputWriteTmp,
                             GetCurrentProcess(),
                             hInputWrite.address(), // Address of new handle.
                             0, false, // Make it uninheritable.
                             DUPLICATE_SAME_ACCESS))
          LogError("DupliateHandle hInputWriteTmp");

        // Close inheritable copies of the handles.
        if (!CloseHandle(hOutputReadTmp)) LogError("CloseHandle hOutputReadTmp");
        if(!options.mergeStderr)
            if (!CloseHandle(hErrorReadTmp)) LogError("CloseHandle hErrorReadTmp");
        if (!CloseHandle(hInputWriteTmp)) LogError("CloseHandle");

        var pi = new PROCESS_INFORMATION();
        var si = new STARTUPINFO();
      
        si.cb = STARTUPINFO.size;
        si.dwFlags = STARTF_USESTDHANDLES;
        si.hStdInput  = hInputRead;
        si.hStdOutput = hOutputWrite;
        si.hStdError  = hErrorWrite;

        // Launch the process
        if(!CreateProcessW(null,            // executable name
                           command,         // command buffer
                           null,            // process security attribute
                           null,            // thread security attribute
                           true,            // inherits system handles
                           CREATE_UNICODE_ENVIRONMENT|CREATE_NO_WINDOW, // process flags
                           environment,     // envrionment block
                           options.workdir, // set as current directory
                           si.address(),    // (in) startup information
                           pi.address()     // (out) process information
        ))
            LogError("CreateProcessW failed");

        // Close any unnecessary handles.
        if (!CloseHandle(pi.hThread))
            LogError("CloseHandle pi.hThread");
        // Close pipe handles (do not continue to modify the parent).
        // You need to make sure that no handles to the write end of the
        // output pipe are maintained in this process or else the pipe will
        // not close when the child process exits and the ReadFile will hang.
        if (!CloseHandle(hInputRead)) LogError("CloseHandle");
        if (!CloseHandle(hOutputWrite)) LogError("CloseHandle hOutputWrite");
        if (!CloseHandle(hErrorWrite)) LogError("CloseHandle hErrorWrite");

        //return values
        child.stdin = hInputWrite;
        child.stdout = hOutputRead;
        child.stderr = options.mergeStderr ? undefined : hErrorRead;
        child.process = pi.hProcess;
        return pi.hProcess;
    }

    function writeStdin(data) {
        var bytesWritten = DWORD(0);
        var r = WriteFile(child.stdin, data, data.length,
                          bytesWritten.address(), null);
        return bytesWritten;
    }

    function ReadPipe(pipe, last) {
        var bytesWritten = DWORD(0);
        var data = options.charset === null ? [] : '';
        while(true) {
            var line = new ReadFileBuffer();
            var r = ReadFile(child.stdout, line, ReadFileBufferSize, bytesWritten.address(), null);
            var c = readString(line, bytesWritten.value, options.charset);
            if(options.charset === null) {
                c.forEach(function(x) { data.push(x) })
            } else {
                data += c;
            }
            if(!last || !r)
                break
            if (!last && (c[c.length-1] == '\n' || c[c.length-1] == '\r'))
                break;
        }
        return data;
    }

    function readPipes(last) {
        if(!active)
            return;
        var data = ReadPipe(child.stdout, last);
        if(data.length) {
            if(options.stdout) {
                last ? options.stdout(data)
                     : setTimeout(function() {
                        options.stdout(data);
                     }, 0);
            } else {
                if(options.charset === null) {
                    data.forEach(function(x) { output.push(x) })
                } else {
                    output += data;
                }
            }
        }
        //FIXME: find a way to read stderr non blocking or move it to another thread
        if(last && !options.mergeStderr) {
            var errorData = ReadPipe(child.stderr, last);
            if(errorData.length) {
                if(options.stderr) {
                    last ? options.stderr(errorData)
                         : setTimeout(function() {
                            options.stderr(errorData);
                         }, 0);
                } else {
                    if(options.charset === null) {
                        errorData.forEach(function(x) { error.push(x) })
                    } else {
                        error += errorData;
                    }
                }
            }
        }
        if(!last) {
            var exit = new DWORD();
            GetExitCodeProcess(child.process, exit.address());
            if(exit.value != STILL_ACTIVE) {
                return cleanup(exit.value);
            }
        }
        setTimeout(function() { readPipes() }, 0);
    }
    function cleanup(exitCode) {
        exitCode = exitCode || 0;
        if(active) {
            readPipes(true);
            if (!CloseHandle(child.stdin)) LogError("CloseHandle hInputWrite");
            if (!CloseHandle(child.stdout)) LogError("CloseHandle hOutputRead");
            if(!options.mergeStderr) {
                if (!CloseHandle(child.stderr)) LogError("CloseHandle hErrorRead");
            }
            active = false;
            kernel32dll.close();
            //LogError('exitCode ' + exitCode);
            options.done && options.done({
                exitCode: exitCode,
                stdout: output,
                stderr: error,
            });
        }
    } 

    //main
    hChildProcess = popen(options.command, options.arguments, options.environment, child);
    if (options.stdin) {
        if(typeof(options.stdin) == 'function') {
            options.stdin({
                write: function(data) {
                    writeStdin(data);
                },
                close: function() {
                    CloseHandle(child.stdin);
                }
            });
        } else {
            writeStdin(options.stdin);
            if (!CloseHandle(child.stdin)) LogError("CloseHandle hInputWrite");
        }
    }
    setTimeout(function() {
        readPipes();
    }, 0);

    return {
        kill: function() {
            var r = !!TerminateProcess(child.process, 255);
            cleanup(-1);
            return r;
        },
        wait: function() {
            if(active) {
                var exit = new DWORD();
                GetExitCodeProcess(child.process, exit.address());
                if(exit.value == STILL_ACTIVE) {
                    WaitForSingleObject(child.process, INFINITE);
                }
                GetExitCodeProcess(child.process, exit.address());
                cleanup(exit.value);
                return exit.value;
            }
        }
    }
}

function subprocess_unix(options) {
    var active = true,
        child = {},
        error = options.charset === null ? [] : '',
        libc = ctypes.open(options.libc),
        output = options.charset === null ? [] : '';


    //api declarations

    //pid_t fork(void);
    var fork = libc.declare("fork",
                         ctypes.default_abi,
                         pid_t
    );

    //int pipe(int pipefd[2]);
    var pipefd = ctypes.int.array(2);
    var pipe = libc.declare("pipe",
                         ctypes.default_abi,
                         ctypes.int,
                         pipefd
    );

    //int dup(int oldfd);
    var dup= libc.declare("dup",
                          ctypes.default_abi,
                          ctypes.int,
                          ctypes.int
    );

    //int close(int fd);
    var close = libc.declare("close",
                          ctypes.default_abi,
                          ctypes.int,
                          ctypes.int
    );

    //NULL terminated array of strings, argv[0] will be command >> + 2
    var argv = ctypes.char.ptr.array(options.arguments.length + 2);
    var envp = ctypes.char.ptr.array(options.environment.length + 1);
    var execve = libc.declare("execve",
                          ctypes.default_abi,
                          ctypes.int,
                          ctypes.char.ptr,
                          argv,
                          envp 
    );

    //void exit(int status);
    var exit = libc.declare("exit",
                          ctypes.default_abi,
                          ctypes.void_t,
                          ctypes.int
    );

    //pid_t waitpid(pid_t pid, int *status, int options);
    var waitpid = libc.declare("waitpid",
                          ctypes.default_abi,
                          pid_t,
                          pid_t,
                          ctypes.int.ptr,
                          ctypes.int
    );

    //int kill(pid_t pid, int sig);
    var kill = libc.declare("kill",
                          ctypes.default_abi,
                          ctypes.int,
                          pid_t,
                          ctypes.int
    );

    //int read(int fd, void *buf, size_t count);
    var bufferSize = 1024;
    var buffer = ctypes.char.array(bufferSize);
    var read = libc.declare("read",
                          ctypes.default_abi,
                          ctypes.int,
                          ctypes.int,
                          buffer,
                          ctypes.int
    );

    //ssize_t write(int fd, const void *buf, size_t count);
    var write = libc.declare("write",
                          ctypes.default_abi,
                          ctypes.int,
                          ctypes.int,
                          ctypes.char.ptr,
                          ctypes.int
    );

    //int chdir(const char *path);
    var chdir = libc.declare("chdir",
                          ctypes.default_abi,
                          ctypes.int,
                          ctypes.char.ptr
    );

    //int fcntl(int fd, int cmd, ... /* arg */ );
    var fcntl = libc.declare("fcntl",
                          ctypes.default_abi,
                          ctypes.int,
                          ctypes.int,
                          ctypes.int,
                          ctypes.int
    );

    function popen(command, args, environment, child) {
        var _in,
            _out,
            _err,
            pid,
            rc;
        _in = new pipefd();
        _out = new pipefd();
        if(!options.mergeStderr)
            _err = new pipefd();

        var _args = argv();
        args.unshift(command);
        for(var i=0;i<args.length;i++) {
            _args[i] = ctypes.char.array()(args[i]);
        }
        var _envp = envp();
        for(var i=0;i<environment.length;i++) {
            _envp[i] = ctypes.char.array()(environment[i]);
            LogError(_envp);
        }
        rc = pipe(_in);
        if (rc < 0) {
            return -1;
        }
        rc = pipe(_out);
        fcntl(_out[0], F_SETFL, O_NONBLOCK);
        if (rc < 0) {
            close(_in[0]);
            close(_in[1]);
            return -1
        }
        if(!options.mergeStderr) {
            rc = pipe(_err);
            fcntl(_err[0], F_SETFL, O_NONBLOCK);
            if (rc < 0) {
                close(_in[0]);
                close(_in[1]);
                close(_out[0]);
                close(_out[1]);
                return -1
            }
        }

        pid = fork();
        if (pid > 0) { // parent
            close(_in[0]);
            close(_out[1]);
            if(!options.mergeStderr)
                close(_err[1]);
            child.stdin  = _in[1];
            child.stdout = _out[0];
            child.stderr = options.mergeStderr ? undefined : _err[0];
            child.pid = pid;
            return pid;
        } else if (pid == 0) { // child
	        if (options.workdir) {
                if (chdir(options.workdir) < 0) {
                    exit(126);
                }
            }
            close(_in[1]);
            close(_out[0]);
            if(!options.mergeStderr)
                close(_err[0]);
            close(0);
            dup(_in[0]);
            close(1);
            dup(_out[1]);
            close(2);
            dup(options.mergeStderr ? _out[1] : _err[1]);
            execve(command, _args, _envp);
            exit(1);
        } else {
            if(!options.mergeStderr) {
                close(_err[0]);
                close(_err[1]);
            }
            close(_out[0]);
            close(_out[1]);
            close(_in[0]);
            close(_in[1]);
            return -1;
        }
        return pid;
    }

    function writeStdin(data) {
        return write(child.stdin, data, data.length);
    }

    function readPipes(last) {
        if(!active && !last)
            return;
        var data = options.charset === null ? [] : '';
        while(true) {
            let line = new buffer();
            let r = read(child.stdout, line, bufferSize);
            if(r <= 0)
                break
            let c = readString(line, r, options.charset);
            if (options.charset === null)
                c.forEach(function(x) { data.push(x) });
            else
                data += c;
            //\r is used to work with statu output like from ffmpeg
            if (!last && (c[c.length-1] == '\n' || c[c.length-1] == '\r'))
                break;
        }
        //dump('\nstdout ' + data.length + '\n');
        if(data.length) {
            if(options.stdout) {
                last ? options.stdout(data)
                     : setTimeout(function() {
                        options.stdout(data);
                     }, 0);
            } else {
                if (options.charset === null)
                    data.forEach(function(x) { output.push(x) });
                else
                    output += data;
            }
        }
        if(!options.mergeStderr) {
            var errorData = options.charset === null ? [] : '';
            while(true) {
                let line = new buffer();
                let r = read(child.stderr, line, bufferSize);
                if(r <= 0)
                    break
                let c = readString(line, r, options.charset);
                if (options.charset === null)
                    c.forEach(function(x) { errorData.push(x) });
                else
                    errorData += c;
                //\r is used to work with statu output like from ffmpeg
                if (!last && (c[c.length-1] == '\n' || c[c.length-1] == '\r'))
                    break;
            }
            if(errorData.length) {
                if(options.stderr) {
                    last ? options.stderr(errorData)
                         : setTimeout(function() {
                            options.stderr(errorData);
                         }, 0);
                } else {
                    if (options.charset === null)
                        errorData.forEach(function(x) { errror.push(x) });
                    else
                        error += errorData;
                }
            }
        }
        if (!last) {
            var status = ctypes.int();
            var result = waitpid(child.pid, status.address(), WNOHANG);
            if (result == 0) {
                setTimeout(function() { readPipes(); }, 1);
            } else if (result == -1) {
                LogError('Error' + result + ' ' + status);
            } else {
                cleanup();
            }
        }
    }

    function cleanup() {
        if(!active)
            return;
        var result, status = ctypes.int();
        readPipes(true);
        result = waitpid(child.pid, status.address(), 0);
        if(active) {
            active = false;
            readPipes(true);
            close(child.stdin);
            close(child.stdout);
            if(!options.mergeStderr)
                close(child.stderr);
            options.done && options.done({
                exitCode: status.value,
                stdout: output,
                stderr: error 
            });
            libc.close();
        }
        return status.value;
    }

    //main
    var child = {};
    var pid = popen(options.command, options.arguments, options.environment, child);
    if (options.stdin) {
        if(typeof(options.stdin) == 'function') {
            options.stdin({
                write: function(data) {
                    writeStdin(data);
                },
                close: function() {
                    close(child.stdin);
                }
            });
        } else {
            writeStdin(options.stdin);
            close(child.stdin);
        }
    }
    setTimeout(function() {
        readPipes();
    }, 0);

    return {
        wait: function() {
            return cleanup();
        },
        kill: function() {
            var rv = kill(pid, 9);
            cleanup();
            return rv;
        }
    }
}
