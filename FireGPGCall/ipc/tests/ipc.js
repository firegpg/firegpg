// ipc.js: Run environment for Javascript CGI

// Global functions available to Javascript CGI:
//   write(arg1, arg2, ...)   : writes to "stdout"
//   writeln(arg1, arg2, ...) : writes to "stdout" with newline
//   getEnv(name)  : return value of environment variable or null string
//   execSh(command) : executes command and returns its stdout (requires ipcserv)

const NS_IPCSERVICE_CONTRACTID =
      "@mozilla.org/process/ipc-service;1";

const NS_PROCESSINFO_CONTRACTID =
      "@mozilla.org/xpcom/process-info;1";

var ipcService = Components.classes[NS_IPCSERVICE_CONTRACTID].getService(Components.interfaces.nsIIPCService);

var processInfo = Components.classes[NS_PROCESSINFO_CONTRACTID].getService(Components.interfaces.nsIProcessInfo);

function write(args) {
  for (var j=0; j<arguments.length; j++) {
    dump(arguments[j].toString());
  }
}

function writeln(args) {
  for (var j=0; j<arguments.length; j++) {
    dump(arguments[j].toString());
  }
  dump("\n");
}

function getEnv(name) {
  if (!processInfo) {
    ERROR_LOG("ipc.js:getEnv: ProcessInfo not available\n");
    throw Components.results.NS_ERROR_FAILURE;
  }

  var value = processInfo.getEnv(name);
  return value ? value : "";
}

function execSh(command) {
  if (!ipcService) {
    ERROR_LOG("ipc.js:exec: IPCService not available\n");
    throw Components.results.NS_ERROR_FAILURE;
  }

  DEBUG_LOG("ipc.js:execSh: command="+command+"\n");

  return ipcService.execSh(command);
}

var gLogLevel = 3;     // Output only errors/warnings by default

var nspr_log_modules = getEnv("NSPR_LOG_MODULES");

var matches = nspr_log_modules.match(/ipcservice:(\d+)/);

if (matches && (matches.length > 1)) {
    gLogLevel = matches[1];
    WARNING_LOG("ipc.js: gLogLevel="+gLogLevel+"\n");
}

function WRITE_LOG(str) {
  dump(str);
}

function DEBUG_LOG(str) {
  if (gLogLevel >= 4)
    WRITE_LOG(str);
}

function WARNING_LOG(str) {
  if (gLogLevel >= 3)
    WRITE_LOG(str);
}

function ERROR_LOG(str) {
  if (gLogLevel >= 2)
    WRITE_LOG(str);
}

function CONSOLE_LOG(str) {
  if (gLogLevel >= 3)
    WRITE_LOG(str);

  if (ipcService)
    ipcService.console.write(str);
}

DEBUG_LOG("ipc.js loaded.\n");
