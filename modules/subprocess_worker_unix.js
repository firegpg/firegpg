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
 * The Original Code is subprocess.jsm.
 *
 * The Initial Developer of this code is Patrick Brunschwig.
 * Portions created by Patrick Brunschwig <patrick@enigmail.net>
 * are Copyright (C) 2011 Patrick Brunschwig.
 * All Rights Reserved.
 *
 * Contributor(s):
 * Jan Gerber <j@mailb.org>
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

/*
 * ChromeWorker Object subprocess.jsm on Unix-like systems (Linux, Mac OS X, ...)
 * to process stdin/stdout/stderr on separate threads.
 *
 */

// Being a ChromeWorker object, implicitly uses the following:
// Components.utils.import("resource://gre/modules/ctypes.jsm");

'use strict';

const bufferSize = 1024;


var libc = null;
var libcFunc = {};

/*
    struct pollfd {
         int    fd;       // file descriptor
         short  events;   // events to look for
         short  revents;  // events returned
     };
*/

var pollfd = new ctypes.StructType("pollfd",
                        [   {'fd': ctypes.int},
                            {'events': ctypes.short},
                            {'revents': ctypes.short}
                        ]);

const POLLIN     = 0x0001;
const POLLOUT    = 0x0004;
const POLLWRBAND = 0x0100;

const POLLERR    = 0x0008;         // some poll error occurred
const POLLHUP    = 0x0010;         // file descriptor was "hung up"
const POLLNVAL   = 0x0020;         // requested events "invalid"


function initLibc(libName) {

    libc = ctypes.open(libName);

    libcFunc.pollFds = pollfd.array(1);

    // int poll(struct pollfd fds[], nfds_t nfds, int timeout);
    libcFunc.poll = libc.declare("poll",
                                  ctypes.default_abi,
                                  ctypes.int,
                                  libcFunc.pollFds,
                                  ctypes.unsigned_int,
                                  ctypes.int);

    //ssize_t write(int fd, const void *buf, size_t count);
    libcFunc.write = libc.declare("write",
                                  ctypes.default_abi,
                                  ctypes.int,
                                  ctypes.int,
                                  ctypes.char.ptr,
                                  ctypes.int);

    //int read(int fd, void *buf, size_t count);
    libcFunc.buffer = ctypes.char.array(bufferSize);
    libcFunc.read = libc.declare("read",
                                  ctypes.default_abi,
                                  ctypes.int,
                                  ctypes.int,
                                  libcFunc.buffer,
                                  ctypes.int);

    //int pipe(int pipefd[2]);
    libcFunc.pipefd = ctypes.int.array(2);

    //int close(int fd);
    libcFunc.close = libc.declare("close",
                                  ctypes.default_abi,
                                  ctypes.int,
                                  ctypes.int);

}

function writePipe(pipe, data) {

    postMessage("trying to write to "+pipe);
    var bytesWritten = libcFunc.write(pipe, data, data.length);
    if (bytesWritten != data.length)
        throw("error: wrote "+bytesWritten+" instead of "+data.length+" bytes");

    postMessage("wrote "+data.length+" bytes of data");
}


function readString(data, length, charset) {
    var string = '', bytes = [];
    for(var i = 0;i < length; i++) {
        if(data[i] == 0 && charset != "null") // stop on NULL character for non-binary data
           break;

        bytes.push(data[i]);
    }

    return bytes;
}

function readPipe(pipe, charset) {
    var p = new libcFunc.pollFds;
    p[0].fd = pipe;
    p[0].events = POLLIN;
    p[0].revents = 0;

    const i=0;
    while (true) {
        var r = libcFunc.poll(p, 1, -1);
        if (r > 0) {
            if (p[i].revents & POLLIN) {
                postMessage({msg: "info", data: "reading next chunk"});
                if (readPolledFd(p[i].fd, charset) == 0) break;
            }
            else if (p[i].revents & POLLHUP) {
                postMessage({msg: "info", data: "poll returned HUP"});
                break;
            }
            else if (p[i].revents & POLLERR) {
                postMessage({msg: "error", data: "poll returned error"});
                break;
            }
            else if (p[i].revents & POLLNVAL) {
                postMessage({msg: "error", data: "poll returned NVAL"});
                break;
            }
            else {
                postMessage({msg: "error", data: "poll returned "+p[i].revents});
                break;
            }
        }
        else
            break;
    }

    libcFunc.close(pipe);
    postMessage({msg: "done"});
    libc.close();
    close();
}

function readPolledFd(pipe, charset) {
    var line = new libcFunc.buffer();
    var r = libcFunc.read(pipe, line, bufferSize);

    if (r > 0) {
        var c = readString(line, r, charset);
        postMessage({msg: "data", data: c, count: c.length});
    }
    return r;
}

onmessage = function (event) {
    switch (event.data.msg) {
    case "init":
        initLibc(event.data.libc);
        break;
    case "read":
        initLibc(event.data.libc);
        readPipe(event.data.pipe, event.data.charset);
        break;
    case "write":
        // data contents:
        //   msg: 'write'
        //   data: the data (string) to write
        //   pipe: ptr to pipe
        postMessage("pipe: fd="+event.data.pipe);
        writePipe(event.data.pipe, event.data.data);
        postMessage("WriteOK");
        break;
    case "close":
        postMessage("closing stdin\n");

        if (!libcFunc.close(event.data.pipe)) {
            postMessage("ClosedOK");
        }
        else
            postMessage("Could not close stdin handle");
        break;
    case "stop":
        libc.close(); // do not use libc after this point
        close();
        break;
    default:
        throw("error: Unknown command"+event.data.msg+"\n");
    }
    return;
};