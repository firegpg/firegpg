/*

***** BEGIN LICENSE BLOCK *****

Version: MPL 1.1/GPL 2.0/LGPL 2.1

The contents of this source code are subject to the Mozilla Public License
Version 1.1 (the "License"); you may not use this source code except in
compliance with the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the
License.

The Original Code is the FireGPG extension.

The Initial Developer of the Original Code is Maximilien Cuony.

Portions created by the Initial Developer are Copyright (C) 2007
the Initial Developer. All Rights Reserved.

Contributor(s):

Alternatively, the contents of this source code may be used under the terms of
either the GNU General Public License Version 2 or later (the "GPL"), or
the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
in which case the provisions of the GPL or the LGPL are applicable instead
of those above. If you wish to allow use of your version of this source code
only under the terms of either the GPL or the LGPL, and not to allow others to
use your version of this source code under the terms of the MPL, indicate your
decision by deleting the provisions above and replace them with the notice
and other provisions required by the GPL or the LGPL. If you do not delete
the provisions above, a recipient may use your version of this source code
under the terms of any one of the MPL, the GPL or the LGPL.

***** END LICENSE BLOCK *****

*/


/*
 Variable: gmailOk
 True if gmail is working
*/

 var gmailOk = false;


/*
    Function: onLoad

    This function is called when the form is show.

    Parameters:
        win - The form herself.

*/


function onLoad(win) {
    testGmailOn();
}

/*
    Function: next
    Process to the next step of the assistant

*/
function next() {

    this.close();

    if (!gmailOk)
        var assis = window.openDialog('chrome://firegpg/content/Dialogs/Assistant/4-gmail.xul','', 'chrome, dialog, resizable=false');
    else
        var assis = window.openDialog('chrome://firegpg/content/Dialogs/Assistant/5-options.xul','', 'chrome, dialog, resizable=false');

    assis.focus();

}

/*
    Function: switchedEnabled
    Switch on or off gmail
*/
function switchedEnabled() {


     var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                          getService(Components.interfaces.nsIPrefService);

    prefs = prefs.getBranch("extensions.firegpg.");

    prefs.setBoolPref("gmail_enabled",document.getElementById('gmail-enabled').checked);

    testGmailOn();
}

/*
    Function: testGmailOn
    Test if gmail is activated and working, and change the interface
*/
function testGmailOn() {

    document.getElementById('gmail-turned-on').style.display = 'none';
    document.getElementById('smtp-working').style.display = 'none';
    document.getElementById('smtp-not-working').style.display = 'none';


    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                          getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.firegpg.");

    if (prefs.getBoolPref("gmail_enabled",true)) {

        document.getElementById('gmail-enabled').checked = true;
        document.getElementById('gmail-turned-on').style.display = '';

        testSmtp();

    } else {
        gmailOk = true;
        document.getElementById('gmail-enabled').checked = false;
    }
}

/*
    Function: testSmtp
    Test is the current smtp server set in options is working. Change the interface
*/
function testSmtp() {

     var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                          getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.firegpg.");

    if (prefs.getBoolPref("gmail_use_ssl",true))
        smtpSocketTypes = new Array("ssl")
    else
        smtpSocketTypes = null;


    transportService = Components
        .classes["@mozilla.org/network/socket-transport-service;1"]
        .getService(Components.interfaces.nsISocketTransportService);

    transport = transportService
        .createTransport(smtpSocketTypes,  smtpSocketTypes ? smtpSocketTypes.length : 0,  prefs.getCharPref("gmail_host"), parseInt( prefs.getCharPref("gmail_port")), null);

    outstream = transport.openOutputStream(transport.OPEN_BLOCKING,0,0);
    instream = transport.openInputStream(0,0,0);

    sriptInstream = Components
        .classes["@mozilla.org/scriptableinputstream;1"]
        .createInstance(Components.interfaces.nsIScriptableInputStream);

    sriptInstream.init(instream);

    dataListener = {
        onStartRequest: function(request, context) {
             if (outstream)
                outstream.write("HELO 127.0.0.1","HELO 127.0.0.1".length);

        },
        onStopRequest: function(request, context, status) {
           if (outstream)
                outstream.close();
            if (sriptInstream)
                sriptInstream.close();
        },
        onDataAvailable: function(request, context, inputStream, offset, count) {

            retour = sriptInstream.read(count);
            retour = retour.split(/ /gi);

            if (retour[0] == "220") {

                gmailOk = true;
                document.getElementById('smtp-working').style.display = '';
                document.getElementById('smtp-not-working').style.display = 'none';

            }

             if (outstream)
                outstream.close()
             if (sriptInstream)
                sriptInstream.close()

        }
    };

    pump = Components
        .classes["@mozilla.org/network/input-stream-pump;1"]
        .createInstance(Components.interfaces.nsIInputStreamPump);
    pump.init(instream, -1, -1, 0, 0, false);
    pump.asyncRead(dataListener, null);

    gmailOk = false;
    document.getElementById('smtp-not-working').style.display = '';

}
