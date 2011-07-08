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
 * The Original Code is ipc-pipe.
 *
 * The Initial Developer of the Original Code is Patrick Brunschwig.
 * Portions created by Patrick Brunschwig <patrick@mozilla-enigmail.org> are
 * Copyright (C) 2010 Patrick Brunschwig. All Rights Reserved.
 *
 * Contributor(s):
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


/**
 * This file tests the implementation of nsPipeTransport.cpp
 */

const Cc = Components.classes;
const Ci = Components.interfaces;

var gResultData = "";
var gStartStopCounter = 0;
var gTestStr = "";

function TestStreamListener(pipeTrans,issueFinished)
{
  this.pipeTrans = pipeTrans;
  this.issueFinished = issueFinished;
}

TestStreamListener.prototype =
{
  QueryInterface: function(aIID) {
    if (aIID.equals(Ci.nsISupports)
    || aIID.equals(Ci.nsIStreamListener))
      return this;
    throw Ci.NS_NOINTERFACE;
  },

  onStartRequest: function(aRequest, aContext) {
    this.inputStream=null;
    if (gStartStopCounter == 0)
      gStartStopCounter = 1;
    else
      gStartStopCounter = 3;
  },

  onStopRequest: function(aRequest, aContext, aStatusCode) {
    if (gStartStopCounter == 1)
      gStartStopCounter = 2;
    else
      gStartStopCounter = 3;

    if (this.inputStream)
      this.inputStream.close();
    this.inputStream = null;

    if (this.issueFinished) {
      // we can't check equality of strings because sequence of stderr/stdout
      // is not guaranteed
      do_check_eq(gTestStr.replace(/[\r\n]+/g, "").length,
    gResultData.replace(/[\r\n]+/g, "").length);
      do_test_finished();
    }
  },

  onDataAvailable: function(aRequest, aContext, aInputStream, offset, count) {
    if (! this.inputStream) {
      this.inputStream = Cc["@mozilla.org/scriptableinputstream;1"].createInstance(
        Ci.nsIScriptableInputStream);
      this.inputStream.init(aInputStream);
    }
    var av = aInputStream.available();
    var data = this.inputStream.readBytes(av);
    gResultData += data;
  }
}


function escape_nul(str)
{
   return str.replace(/\0/g, "\\0");
}

function run_test()
{

  const NS_PIPETRANSPORT_CONTRACTID = "@mozilla.org/ipc/pipe-transport;1";
  const NS_IPCBUFFER_CONTRACTID   = "@mozilla.org/ipc/ipc-buffer;1";

  var isWindows = ("@mozilla.org/windows-registry-key;1" in Cc);
  var isOSX = ("nsILocalFileMac" in Ci);
  var isLinux = ("@mozilla.org/gnome-gconf-service;1" in Cc);

  var outStrObj = new Object();
  var outLenObj = new Object();
  var errStrObj = new Object();
  var errLenObj = new Object();

  var processDir = do_get_cwd();
  var command = processDir.clone();
  command.append("IpcCat" + (isWindows ? ".exe" : ""));

  if (!command.exists())
    do_throw("Could not locate the IpcCat helper executable\n");


  var dirSvc = Cc["@mozilla.org/file/directory_service;1"].
                      getService(Ci.nsIProperties).
                      QueryInterface(Ci.nsIDirectoryService);
  var greDir = dirSvc.get("GreD", Ci.nsIFile);


  var envList = [
    "DYLD_LIBRARY_PATH="+greDir.path, // for Mac
    "LD_LIBRARY_PATH="+greDir.path    // for Linux
  ];

  gTestStr = "This is a test with\ndata on two lines\n";

  //////////////////////////////////////////////////////////////
  /////// Test AsyncRead
  //////////////////////////////////////////////////////////////

  gStartStopCounter = 0;
  gResultData = "";
  var errorListener = Cc[NS_IPCBUFFER_CONTRACTID].
    createInstance(Ci.nsIIPCBuffer);
  errorListener.open(-1, true);

  var pipeTrans = Cc[NS_PIPETRANSPORT_CONTRACTID].
    createInstance(Ci.nsIPipeTransport);
  pipeTrans.init(command);
  pipeTrans.openPipe ([ "dump" ], 1, envList, envList.length,
                        0, "", true, false,
                        errorListener);

  var myListener = new TestStreamListener(pipeTrans, false);

  pipeTrans.asyncRead(myListener, null, 0, -1, 0);
  pipeTrans.writeSync(gTestStr, gTestStr.length);
  pipeTrans.join();

  do_check_eq(pipeTrans.exitValue, 0);
  do_check_eq(gStartStopCounter, 2);
  do_check_eq(gResultData.replace(/\r\n/g, "\n"), gTestStr);

  var errData = errorListener.getData().split(/\r?\n/);
  do_check_eq(errData[0], "Starting dump");
  do_check_eq(errData[1], "Dumped 38 bytes");

  //////////////////////////////////////////////////////////////
  /////// Test ReadLine
  //////////////////////////////////////////////////////////////

  // Part 1 -- write to a file

  var dataFile = do_get_file("ipc-data.txt" , true);

  gStartStopCounter = 0;
  gResultData = "";
  gTestStr = "This is a test with\r\ndata on several lines\r"+
     "delimited\n\nby a number of\nvarious characters\nnot ending with newline";

  var pipeTrans = Cc[NS_PIPETRANSPORT_CONTRACTID].
    createInstance(Ci.nsIPipeTransport);
  pipeTrans.init(command);
  pipeTrans.openPipe ([ "write", dataFile.path ], 2, envList, envList.length,
                        0, "", true, true,
                        null);

  myListener = new TestStreamListener(pipeTrans, false);
  pipeTrans.asyncRead(myListener, null, 0, -1, 0);
  pipeTrans.writeSync(gTestStr, gTestStr.length);
  pipeTrans.join();
  do_check_eq(pipeTrans.exitValue, 0);
  do_check_eq(gStartStopCounter, 2)

  if (isWindows)
    do_check_eq(gResultData, "Starting write\r\nWrote 110 bytes\r\n");
  else
    do_check_eq(gResultData, "Starting write\nWrote 111 bytes\n");

  // Part 2 -- read from the file

  gStartStopCounter = 0;
  gResultData = "";

  errorListener = Cc[NS_IPCBUFFER_CONTRACTID].
    createInstance(Ci.nsIIPCBuffer);
  errorListener.open(-1, true);

  pipeTrans = Cc[NS_PIPETRANSPORT_CONTRACTID].
    createInstance(Ci.nsIPipeTransport);
  pipeTrans.init(command);
  pipeTrans.openPipe ([ "read", dataFile.path ], 2, envList, envList.length,
                        0, "", true, false,
                        errorListener );

  var testLines = gTestStr.split(/\r\n|\r|\n/);

  var i=0;
  var line = pipeTrans.readLine(5);
  do_check_eq(line.length, 5);
  line += pipeTrans.readLine(-1);
  do_check_eq(testLines[i], line);

  ++i;
  line = pipeTrans.readLine(5);
  do_check_eq(line.length, 5);
  line += pipeTrans.readLine(2);
  do_check_eq(line.length, 7);
  line += pipeTrans.readLine(255);
  do_check_eq(testLines[i], line);

  while (i < testLines.length - 2) {
    ++i;
    try {
      line = pipeTrans.readLine(255);
    }
    catch (ex) {
      line = "ERROR";
    }
    do_check_eq(testLines[i], line);
  }

  ++i;
  try {
    line = pipeTrans.readLine(4);
  }
  catch (ex) {
    line = "ERROR";
  }
  do_check_eq(line.length, 4);
  line += pipeTrans.readLine(2);
  do_check_eq(line.length, 6);
  line += pipeTrans.readLine(-1);
  do_check_eq(testLines[i], line);

  try {
    pipeTrans.join() // should not be necessary, but let's do it to be sure
  }
  catch (ex) {}

  var errData = errorListener.getData().split(/\r?\n/);
  do_check_eq(errData[0], "Starting read");
  if (isWindows)
    do_check_eq(errData[1], "Read 110 bytes");
  else
    do_check_eq(errData[1], "Read 111 bytes");
  do_check_eq(pipeTrans.exitValue, 0);


  //////////////////////////////////////////////////////////////
  /////// Test writeAsync
  //////////////////////////////////////////////////////////////

  gStartStopCounter = 0;
  gResultData = "";
  var errorListener = Cc[NS_IPCBUFFER_CONTRACTID].
    createInstance(Ci.nsIIPCBuffer);
  errorListener.open(-1, true);

  var pipeTrans = Cc[NS_PIPETRANSPORT_CONTRACTID].
    createInstance(Ci.nsIPipeTransport);
  pipeTrans.init(command);

  pipeTrans.openPipe ([ "dump" ], 1, envList, envList.length,
                        0, "", true, false,
                        errorListener);
  var myListener = new TestStreamListener(pipeTrans, false);

  var fileInStream = Cc["@mozilla.org/network/file-input-stream;1"].
    createInstance(Ci.nsIFileInputStream);

  fileInStream.init(dataFile, -1, -1, 0);
  pipeTrans.asyncRead(myListener, null, 0, -1, 0);
  pipeTrans.writeAsync(fileInStream, -1, true);

  var pid = 1;
  if (isWindows || isLinux || isOSX)
    pid = pipeTrans.pid;  // platforms known to support Process IDs

  pipeTrans.join();
  fileInStream.close();

  do_check_true(pid > 0);
  do_check_eq(pipeTrans.exitValue, 0);
  do_check_eq(gStartStopCounter, 2);
  //do_check_eq(gResultData, gTestStr);
  do_check_eq(gResultData.replace(/[\r\n]+/g, "_"), gTestStr.replace(/[\r\n]+/g, "_"));

  var errData = errorListener.getData().split(/\r?\n/);
  do_check_eq(errData[0], "Starting dump");
  if (isWindows)
  do_check_eq(errData[1], "Dumped 110 bytes");
  else
  do_check_eq(errData[1], "Dumped 111 bytes");

  //////////////////////////////////////////////////////////////
  /////// Test Merge stderr and use Proxy
  //////////////////////////////////////////////////////////////

  gStartStopCounter = 0;
  gResultData = "";

  pipeTrans = Cc[NS_PIPETRANSPORT_CONTRACTID].
    createInstance(Ci.nsIPipeTransport);
  pipeTrans.init(command);
  pipeTrans.openPipe ([ "read", dataFile.path ], 2, envList, envList.length,
                        0, "", false, true,
                        null );
  var myListener = new TestStreamListener(pipeTrans, true);

  gTestStr = "Starting read\n"+gTestStr+"Read 111 bytes\n";

  pipeTrans.asyncRead(myListener, null, 0, -1, 0);

  do_test_pending();
}
