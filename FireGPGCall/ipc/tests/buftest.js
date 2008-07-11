// Tests nsIPipeConsole, nsIIPCBuffer, nsIPipeFilterListener

load("ipc.js");

const NS_PIPECONSOLE_CONTRACTID = "@mozilla.org/process/pipe-console;1";
const NS_IPCBUFFER_CONTRACTID   = "@mozilla.org/process/ipc-buffer;1";
const NS_PIPEFILTERLISTENER_CONTRACTID = "@mozilla.org/process/pipe-filter-listener;1";

function escape_cr(str) {
   return str.replace(/\r/g, "\\r");
}

const InputStream = new Components.Constructor( "@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream" );

dump("Testing IPC service etc.\n");

// Test getEnv
dump("\nTesting getEnv('PATH')\n");
dump("  PATH="+getEnv('PATH')+"\n");

// Test pipeConsole
dump("\nTesting PipeConsole\n");

var pipeConsole = Components.classes[NS_PIPECONSOLE_CONTRACTID].createInstance(Components.interfaces.nsIPipeConsole);
pipeConsole.open(24, 80, false);
pipeConsole.write("PipeConsole initialized\n");

if (pipeConsole.hasNewData) {
   dump("data='"+pipeConsole.getData()+"'\n");
} else {
   dump("  Error in pipeConsole\n");
}
pipeConsole.shutdown();

// Test IPC buffer
dump("\nTesting IPCBuffer\n");

var ipcBuffer = Components.classes[NS_IPCBUFFER_CONTRACTID].createInstance(Components.interfaces.nsIIPCBuffer);

ipcBuffer.open(10, true);
ipcBuffer.write("IPCBuffer initialized\n");
ipcBuffer.onStopRequest(null, null, 0);

var totalBytes = ipcBuffer.totalBytes;
dump("totalBytes="+totalBytes+"\n");

dump("data='"+ipcBuffer.getData()+"'\n");

var rawInStream = ipcBuffer.openInputStream();
var scriptableInStream = new InputStream();    
scriptableInStream.init(rawInStream);

var available = scriptableInStream.available();
dump("available="+available+"\n");

var bufData = scriptableInStream.read(available-3);
rawInStream.close();

dump("bufData='"+bufData+"'\n");

ipcBuffer.shutdown();

// Test PipeFilterListener
dump("\nTesting PipeFilterListener\n");

var listener = Components.classes[NS_IPCBUFFER_CONTRACTID].createInstance(Components.interfaces.nsIIPCBuffer);

listener.open(2000, false);

var listener2 = Components.classes[NS_IPCBUFFER_CONTRACTID].createInstance(Components.interfaces.nsIIPCBuffer);

listener2.open(2000, false);

var pipeFilter = Components.classes[NS_PIPEFILTERLISTENER_CONTRACTID].createInstance(Components.interfaces.nsIPipeFilterListener);

pipeFilter.init(listener, null, "", "", 0, true, true, listener2);

var lines = ["--Boundary",
             "\r\nPart 1\r\n",
             " --Boundary\r\n\r\n",
             "--Boundary\r",
             "\nPart 2\r\nPL2\r\nx\r\n--Boundary--\r\n"];

for (var j=0; j<lines.length; j++) {
  pipeFilter.write(lines[j], lines[j].length, null, null);
}
pipeFilter.onStopRequest(null, null, 0);

dump("listener.getData()='"+escape_cr(listener.getData())+"'\n");
dump("listener2.getData()='"+escape_cr(listener2.getData())+"'\n");

var linebreak = ["CRLF", "LF", "CR"];

for (var j=0; j<linebreak.length; j++) {
  listener = Components.classes[NS_IPCBUFFER_CONTRACTID].createInstance(Components.interfaces.nsIIPCBuffer);

  listener.open(2000, false);

  pipeFilter = Components.classes[NS_PIPEFILTERLISTENER_CONTRACTID].createInstance(Components.interfaces.nsIPipeFilterListener);

  pipeFilter.init(listener, null, "", "", 1, (j != 0), true, null);

  for (var k=0; k<lines.length; k++) {
    var line = lines[k];
    if (j == 1) line = line.replace(/\r/g, "");
    if (j == 2) line = line.replace(/\n/g, "");
    pipeFilter.write(line, line.length, null, null);
  }

  pipeFilter.onStopRequest(null, null, 0);

  dump(linebreak[j]+" listener.getData()='"+escape_cr(listener.getData())+"'\n");
}
