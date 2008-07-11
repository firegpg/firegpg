// Tests nsIProcessInfo, nsIIPCService

load("ipc.js");

dump("Testing IPC service etc.\n");

// Test getEnv
dump("\nTesting getEnv('PATH')\n");
dump("  PATH="+getEnv('PATH')+"\n");

// Test execSh
dump("\nTesting execSh('echo ECHO-OUTPUT')\n");
dump("  "+execSh('echo ECHO-OUTPUT'));

// Test execPipe
function escape_nul(str) {
   return str.replace(/\0/g, "\\0");
}

var tempFile = "ipctemp.dat"
var inputData = "TEST \0DATA WITH \0NULS";
var command = "cat";
var outStrObj = new Object();
var outLenObj = new Object();
var errStrObj = new Object();
var errLenObj = new Object();

// Test cat
dump("\nTesting execPipe('"+command+"', true, '', inputData, ...)\n");
dump("  inputData='"+escape_nul(inputData)+"'\n");
dump("  inputData.length="+inputData.length+"\n");
dump("  exitCode="+ipcService.execPipe(command, true, '', inputData, inputData.length, [], 0, outStrObj, outLenObj, errStrObj, errLenObj)+"\n");

dump("  STDOUT = '"+escape_nul(outStrObj.value)+"'\n");
dump("  STDERR = '"+escape_nul(errStrObj.value)+"'\n");


// Create temporary file
command = "cat > "+tempFile;
dump("\nTesting execPipe('"+command+"', true, '', inputData, ...)\n");
dump("  inputData='"+escape_nul(inputData)+"'\n");
dump("  inputData.length="+inputData.length+"\n");
dump("  exitCode="+ipcService.execPipe(command, true, '', inputData, inputData.length, [], 0, outStrObj, outLenObj, errStrObj, errLenObj)+"\n");

dump("  STDOUT = '"+escape_nul(outStrObj.value)+"'\n");
dump("  STDERR = '"+escape_nul(errStrObj.value)+"'\n");

// Testing exec (read from temporary file)
dump("\nTesting execSh('cat "+tempFile+"')\n");
dump("  STDOUT = '"+escape_nul(execSh('cat '+tempFile))+"'\n");

// Read from temporary file to STDOUT
inputData = "";
command = "cat "+tempFile;

dump("\nTesting execPipe('"+command+"', ...)\n");
dump("  exitCode="+ipcService.execPipe(command, true, '', inputData, inputData.length, [], 0, outStrObj, outLenObj, errStrObj, errLenObj)+"\n");

dump("  outputData.length="+outStrObj.value.length+"\n");
dump("  STDOUT = '"+escape_nul(outStrObj.value)+"'\n");
dump("  STDERR = '"+escape_nul(errStrObj.value)+"'\n");

// Read from temporary file to STDERR
command = "cat 1>&2 "+tempFile;

dump("\nTesting execPipe('"+command+"', ...)\n");
dump("  exitCode="+ipcService.execPipe(command, true, '', inputData, inputData.length, [], 0, outStrObj, outLenObj, errStrObj, errLenObj)+"\n");

dump("  errorData.length="+errStrObj.value.length+"\n");
dump("  STDOUT = '"+escape_nul(outStrObj.value)+"'\n");
dump("  STDERR = '"+escape_nul(errStrObj.value)+"'\n");
