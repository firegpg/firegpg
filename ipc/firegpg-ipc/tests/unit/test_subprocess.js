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
 * This file tests the implementation of subprocess.jsm
 */

Components.utils.import("resource://gre/modules/subprocess.jsm");

const Cc = Components.classes;
const Ci = Components.interfaces;

var gTestLines;
var gResultData;

function run_test()
{
  var isWindows = ("@mozilla.org/windows-registry-key;1" in Components.classes);
  var dataFile = do_get_file("ipc-data.txt" , true);

  var processDir = do_get_cwd();
  var cmd = processDir.clone();
  cmd.append("IpcCat" + (isWindows ? ".exe" : ""));

  if (!cmd.exists())
    do_throw("Could not locate the IpcCat helper executable\n");

  var dirSvc = Cc["@mozilla.org/file/directory_service;1"].
                      getService(Ci.nsIProperties).
                      QueryInterface(Ci.nsIDirectoryService);
  var greDir = dirSvc.get("GreD", Ci.nsIFile);


  var envList = [
    "DYLD_LIBRARY_PATH="+greDir.path, // for Mac
    "LD_LIBRARY_PATH="+greDir.path    // for Linux
  ];

  var eol = isWindows ? "\r\n" : "\n";
  gTestLines = [ "Writing example data"+eol,
                  "Writing something more"+eol,
                  "And yet some more text"+eol ];

  /////////////////////////////////////////////////////////////////
  // Test standard scenario
  /////////////////////////////////////////////////////////////////

  gResultData = "";
  var p = subprocess.call({
    command:     cmd,
    arguments:   [ 'dump' ],
    environment: envList,
    stdin: subprocess.WritablePipe(function() {
        for (var i=0; i < gTestLines.length; i++) {
          this.write(gTestLines[i]);
        }
        this.close();
    }),
    stdout: subprocess.ReadablePipe(function (data) {
      gResultData += data;
    }),
    stderr: subprocess.ReadablePipe(function(data) {
    let len = gTestLines.join("").length;
    if (isWindows) len -= gTestLines.length;
      do_check_eq("Starting dump\nDumped "+len+" bytes\n",
    data.replace(/\r\n/g, "\n"));
    }),
    onFinished: subprocess.Terminate(function() {
      do_check_eq(0, this.exitCode);
    }),
    mergeStderr: false
  });

  p.wait();
  do_check_eq(gTestLines.join(""), gResultData);


  /////////////////////////////////////////////////////////////////
  // Test mergeStderr=true & stdin as string
  /////////////////////////////////////////////////////////////////

  gResultData = "";
  p = subprocess.call({
    command:     cmd,
    arguments:   [ 'dump' ],
    environment: envList,
    stdin: gTestLines.join(""),
    stdout: subprocess.ReadablePipe(function (data) {
      gResultData += data;
    }),
    stderr: subprocess.ReadablePipe(function(data) {
      do_throw("Got unexpected data '"+data+"' on stderr\n");
    }),
    onFinished: subprocess.Terminate(function() {
      do_check_eq(0, this.exitCode);
    }),
    mergeStderr: true
  });

  p.wait();
  do_check_eq(gTestLines.join("").length + (isWindows ? 32 : 30), gResultData.length);


  /////////////////////////////////////////////////////////////////
  // Test with cwd & no stderr
  /////////////////////////////////////////////////////////////////

  gResultData = "";
  var p = subprocess.call({
    command:     cmd,
    arguments:   [ 'dump' ],
    environment: envList,
    cwd: do_get_file(".", true),
    stdin: subprocess.WritablePipe(function() {
        for (var i=0; i < gTestLines.length; i++) {
          this.write(gTestLines[i]);
        }
    }),
    onFinished: subprocess.Terminate(function() {
      gResultData = this.stdoutData;
      do_check_eq(0, this.exitCode);
    }),
    mergeStderr: false
  });

  p.wait();
  do_check_eq(gTestLines.join(""), gResultData);

  /////////////////////////////////////////////////////////////////
  // Test exit code != 0
  /////////////////////////////////////////////////////////////////

  gResultData = "";
  var p = subprocess.call({
    command:     cmd,
    arguments:   [ 'wrong', 'arguments' ],
    environment: envList,
    stdin: "Dummy text",
    stdout: subprocess.ReadablePipe(function (data) {
      gResultData += data;
    }),
    stderr: subprocess.ReadablePipe(function(data) {
      do_check_eq(0, data.length);
    }),
    onFinished: subprocess.Terminate(function() {
      do_check_eq(4, this.exitCode);
    }),
    mergeStderr: false
  });

  p.wait();
  do_check_eq("", gResultData);


  /////////////////////////////////////////////////////////////////
  // Test minimal scenario with stdout only
  /////////////////////////////////////////////////////////////////

  gResultData = "";
  var p = subprocess.call({
    command:     cmd,
    arguments:   [ 'write', dataFile.path ],
    stdin: gTestLines.join("")
  });

  p.wait();

  var p = subprocess.call({
    command:     cmd,
    arguments:   [ 'read', dataFile.path ],
    environment: envList,
    stdout: subprocess.ReadablePipe(function (data) {
      gResultData += data;
    })
  });

  p.wait();
  do_check_eq(gTestLines.join(""), gResultData);

  /////////////////////////////////////////////////////////////////
  // Test minimal scenario with onFinished only
  /////////////////////////////////////////////////////////////////

  var p = subprocess.call({
    command:     cmd,
    arguments:   [ 'read', dataFile.path ],
    environment: envList,
    onFinished: subprocess.Terminate(function() {
      gResultData = this.stdoutData;
      do_check_eq(0, this.exitCode);
    })
  });

  p.wait();
  do_check_eq(gTestLines.join(""), gResultData);


  /////////////////////////////////////////////////////////////////
  // Test environment variables
  /////////////////////////////////////////////////////////////////

  gTestLines= [ "This is test variable" ];
  envList.push("TESTVAR="+gTestLines[0]);

  gResultData = "";
  var p = subprocess.call({
    command:     cmd.path,
    arguments:   [ 'getenv', 'TESTVAR' ],
    cwd: do_get_file(".", true),
    environment: envList,
    onFinished: subprocess.Terminate(function() {
      gResultData = this.stdoutData;
      do_check_eq(0, this.exitCode);
    }),
    mergeStderr: false
  });

  p.wait();
  do_check_eq(gTestLines.join(""), gResultData);
}
