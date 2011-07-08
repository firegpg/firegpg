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
 * This file tests the implementation of nsIPCBuffer.cpp
 */


Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

const Cc = Components.classes;
const Ci = Components.interfaces;

function TestObserver(cbFunc, ipcBuffer) {
  this._cbFunc = cbFunc;
  this._ipcBuffer = ipcBuffer;
}

TestObserver.prototype = {
  QueryInterface: XPCOMUtils.generateQI([ Ci.nsIObserver ]),

  onStartRequest: function(aRequest, aContext) {
    if (gRequestCounter == 0)
      gRequestCounter = 1;
    else
      gRequestCounter = 3;
  },

  onStopRequest: function(aRequest, aContext, aStatusCode) {
    if (gRequestCounter == 1)
      gRequestCounter = 2;
    else
      gRequestCounter = 3;

    if (this._cbFunc) this._cbFunc(this._ipcBuffer);
    this._ipcBuffer = null;
  }
}

var gRequestCounter;

function prepareTestFile(file, data)
{
  if (file.exists()) {
    if (file.isDirectory() || !file.isWritable())
       do_throw("cannot write to file ipc-data.txt");
  }

  var fileFlags = 0x02 | 0x08 | 0x20; // create, write, truncate
  var fileStream = Cc["@mozilla.org/network/file-output-stream;1"].
      createInstance(Ci.nsIFileOutputStream);

  fileStream.init(file, fileFlags, 0600, 0);
  if (fileStream.write(data, data.length) != data.length)
     do_throw("Could not correctly write test file");

  fileStream.flush();
  fileStream.close();
}

function run_test()
{
  const NS_IPCBUFFER_CONTRACTID   = "@mozilla.org/ipc/ipc-buffer;1";
  const InputStream = new Components.Constructor(
    "@mozilla.org/scriptableinputstream;1", "nsIScriptableInputStream" );

  /////////////////////////////////////////////////////////////////
  // Test IPC buffer with maxBytes = 10
  /////////////////////////////////////////////////////////////////

  var ipcBuffer = Cc[NS_IPCBUFFER_CONTRACTID].createInstance(Ci.nsIIPCBuffer);

  var inputString="This string is testing IPCBuffer data flow\n";
  var maxBytes = 10;

  gRequestCounter = 0;
  var o = new TestObserver();
  ipcBuffer.open(maxBytes, true);
  ipcBuffer.observe(o, null);
  ipcBuffer.onStartRequest(null, null);
  ipcBuffer.write(inputString);
  ipcBuffer.onStopRequest(null, null, 0);

  var totalBytes = ipcBuffer.totalBytes;
  do_check_eq(totalBytes, inputString.length);

  var isStopped = ipcBuffer.stopped;
  do_check_eq(isStopped, true);

  var data = ipcBuffer.getData();
  do_check_eq(maxBytes, data.length);

  var rawInStream = ipcBuffer.openInputStream();
  var scriptableInStream = new InputStream();
  scriptableInStream.init(rawInStream);

  var available = scriptableInStream.available();
  do_check_eq(inputString.length, available);

  var bufData = scriptableInStream.read(available);
  rawInStream.close();

  do_check_eq(bufData, inputString);

  ipcBuffer.shutdown();
  do_check_eq(gRequestCounter, 2);

  /////////////////////////////////////////////////////////////////
  // Test IPC buffer with maxBytes = -1 (unlimited buffer size)
  /////////////////////////////////////////////////////////////////

  ipcBuffer = Cc[NS_IPCBUFFER_CONTRACTID].createInstance(Ci.nsIIPCBuffer);

  maxBytes = -1;
  gRequestCounter = 0;

  o = new TestObserver();
  ipcBuffer.open(maxBytes, true);
  ipcBuffer.observe(o, null);
  ipcBuffer.onStartRequest(null, null);
  ipcBuffer.write(inputString);
  ipcBuffer.onStopRequest(null, null, 0);

  totalBytes = ipcBuffer.totalBytes;
  do_check_eq(totalBytes, inputString.length);

  isStopped = ipcBuffer.stopped;
  do_check_eq(isStopped, true);

  data = ipcBuffer.getData();
  do_check_eq(inputString.length, data.length);

  rawInStream = ipcBuffer.openInputStream();
  scriptableInStream = new InputStream();
  scriptableInStream.init(rawInStream);

  available = scriptableInStream.available();
  do_check_eq(inputString.length, available);

  bufData = scriptableInStream.read(available);
  rawInStream.close();

  do_check_eq(bufData, inputString);

  ipcBuffer.shutdown();
  do_check_eq(gRequestCounter, 2);

  /////////////////////////////////////////////////////////////////
  // Test IPC buffer with openURI - synchronous reading
  /////////////////////////////////////////////////////////////////

  // prepare test file

  var testFile = do_get_file("ipc-data.txt");
  prepareTestFile(testFile, inputString);

  // actual test

  var ioSvc = Cc["@mozilla.org/network/io-service;1"].getService(Ci.nsIIOService);
  testURI = ioSvc.newFileURI(testFile);

  ipcBuffer = Cc[NS_IPCBUFFER_CONTRACTID].createInstance(Ci.nsIIPCBuffer);
  maxBytes = 10;
  gRequestCounter = 0;
  ipcBuffer.openURI(testURI, maxBytes, true, o, null, true);

  isStopped = ipcBuffer.stopped;
  do_check_eq(isStopped, true);

  data = ipcBuffer.getData();
  do_check_eq(inputString.substr(0,10), data);

  rawInStream = ipcBuffer.openInputStream();
  scriptableInStream = new InputStream();
  scriptableInStream.init(rawInStream);

  available = scriptableInStream.available();
  do_check_eq(inputString.length, available);

  bufData = scriptableInStream.read(available);
  rawInStream.close();

  do_check_eq(bufData, inputString);

  ipcBuffer.shutdown();
  do_check_eq(gRequestCounter, 2);

  /////////////////////////////////////////////////////////////////
  // Test IPC buffer with openURI - asynchronous reading
  /////////////////////////////////////////////////////////////////

  ipcBuffer = Cc[NS_IPCBUFFER_CONTRACTID].createInstance(Ci.nsIIPCBuffer);
  maxBytes = -1;
  gRequestCounter = 0;

  var cbFunc = function(ipcBuffer)
  {
    do_check_eq(gRequestCounter, 2);

    do_check_eq(ipcBuffer.totalBytes, inputString.length);

    do_check_eq(ipcBuffer.stopped, true);

    let data = ipcBuffer.getData();
    do_check_eq(inputString, data);
    ipcBuffer.shutdown();
    do_test_finished();
  }
  o = new TestObserver(cbFunc, ipcBuffer);

  ipcBuffer.openURI(testURI, maxBytes, false, o, null, false);
  do_test_pending();

}
