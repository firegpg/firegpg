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
  Variable: gpgWorking
  True if gpg is working
*/
var gpgWorking = false;

/*
    Function: onLoad
    This function is called when the form is show.

    Parameters:
        win - The form herself.

*/
function onLoad(win) {
    testGpg();



    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                          getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.firegpg.");

    document.getElementById('gpg-path-textbox').value = prefs.getCharPref("gpg_path");
}

/*
    Function: next
    Process to the next step of the assistant

*/
function next() {



    this.close();

    if (!gpgWorking)
        var assis = window.openDialog('chrome://firegpg/content/Dialogs/Assistant/2-gnupg.xul','', 'chrome, dialog, resizable=false');
    else
        var assis = window.openDialog('chrome://firegpg/content/Dialogs/Assistant/3-privatekey.xul','', 'chrome, dialog, resizable=false');

    assis.focus();

}

/*
    Function: testGpg
    Test if gpg works and change the interface
*/
function testGpg() {

    var result = FireGPG.Core.selfTest(true);

    if (result.result == FireGPG.Const.Results.SUCCESS) {
        gpgWorking = true;

        document.getElementById('gnuPG-working').style.display = '';
        document.getElementById('gnuPG-notworking').style.display = 'none';

    } else {
        gpgWorking = false;

        document.getElementById('gnuPG-working').style.display = 'none';
        document.getElementById('gnuPG-notworking').style.display = '';

    }

}

/*
    Function: fileSelector
    Open the file selected and return the choosen file.
    If no file is selected, null is returned.
*/
function fileSelector() {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	var i18n = document.getElementById("firegpg-strings");
	fp.init(window, i18n.getString('fileSelectorSelectFile'), nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll);
	return (fp.show() == nsIFilePicker.returnOK) ? fp.file.path : null;
}

/*
    Function: directorySelector
    Open the file selected and return the choosen file.
    If no file is selected, null is returned.
*/
function directorySelector() {
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	var i18n = document.getElementById("firegpg-strings");
	fp.init(window, i18n.getString('fileSelectorSelectFile'), nsIFilePicker.modeGetFolder);
	fp.appendFilters(nsIFilePicker.filterAll);
	return (fp.show() == nsIFilePicker.returnOK) ? fp.file.path : null;
}


/*
    Function: chooseGPGPath
    Set a new path to GPG
*/
function chooseGPGPath() {

    var gpg_path = fileSelector();

    if(gpg_path != null) {

        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                          getService(Components.interfaces.nsIPrefService);
        prefs = prefs.getBranch("extensions.firegpg.");


        document.getElementById('gpg-path-textbox').value = gpg_path;
        prefs.setCharPref("gpg_path",gpg_path);
        prefs.setBoolPref("specify_gpg_path",true);

    }
    FireGPG.Core.allreadyinit = false;
    testGpg();

}

/*
    Function: sepcialHome
    Set a new home. This function erase customs parameters already set
*/
function sepecialHome() {

    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                          getService(Components.interfaces.nsIPrefService);
        prefs = prefs.getBranch("extensions.firegpg.");

    var directory = directorySelector();

    if (directory != null) {

        var currentOption = prefs.getCharPref("gpg_user_options");

        if (currentOption != null && currentOption != "") {
            if (!confirm(document.getElementById('firegpg-strings').getString('homediralreadyset').replace(/%1/gi, currentOption + "\n")))
                return;

        }

        prefs.setCharPref("gpg_user_options", "--home " + directory.replace(/ /gi, '{$SPACE}'));
        alert(document.getElementById('firegpg-strings').getString('homedirset').replace(/%s/gi, directory));
    }
}