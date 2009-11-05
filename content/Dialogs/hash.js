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

function onLoad(d) {

        document.getElementById('path-textbox').value = ' ';
        document.getElementById('result').value = document.getElementById('firegpg-strings').getString('notComputed');
        document.getElementById('copy').disabled = 'disabled';
        document.getElementById('hash').disabled = 'disabled';

        if (window.arguments[0].file)
            selectFile(window.arguments[0].file);

}

function changeFile() {

    var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	var i18n = document.getElementById("firegpg-strings");
	fp.init(window, i18n.getString('fileSelectorSelectFile'), nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll);

    if(fp.show() == nsIFilePicker.returnOK) {

        selectFile(fp.file.path);
    }

}

function computeHash() {




        document.getElementById('copy').disabled = 'disabled';
        document.getElementById('result').value = document.getElementById('firegpg-strings').getString('waitForHash');

        if (document.getElementById('hash').label != '' && document.getElementById('hash').label != ' ' && document.getElementById('hash').label !='&nbsp;') {


                result = FireGPG.Core.computeHash(true,document.getElementById('hash').label, document.getElementById('path-textbox').value);

                document.getElementById('result').value = result.output;
                document.getElementById('copy').disabled = '';

        }


}

function selectFile(file) {

    document.getElementById('path-textbox').value =file;
        document.getElementById('hash').value = '&nbsp;';
        document.getElementById('result').value = document.getElementById('firegpg-strings').getString('notComputed');

        document.getElementById('copy').disabled = 'disabled';

        document.getElementById('hash').disabled = '';

}
/*
function saveToFile() {

    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"]
        .createInstance(nsIFilePicker);

    fp.init(window, null, nsIFilePicker.modeSave);
    fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);

    var a = fp.show();

    if (a != nsIFilePicker.returnOK && a != nsIFilePicker.returnReplace) //L'utilisateur annule
        return;

    var filePath = fp.file.path;
    //Need to remove the file before save
    FireGPG.Misc.removeFile(filePath);
    FireGPG.Misc.putIntoFile(filePath,document.getElementById('result').value.replace(/\n/gi,'').replace(/\r/gi,''));

}*/
function copy() {

    const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"] .getService(Components.interfaces.nsIClipboardHelper);
    gClipboardHelper.copyString(document.getElementById('result').value.replace(/\n/gi,'').replace(/\r/gi,''));

}