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




var curentlySelected = null;
var curentlySelectedR = null;
var privateKey = false;
var curentlySelectedFingerPrint = null;
var revoked = false;
var subkey = false;
function onLoad(win)
{
	updateKeyList();

}
function updateKeyList() {

	curentlySelected = null;

	keylistcall = FireGPG.Core.listKeys(false,true);

	keylistcallpriv = FireGPG.Core.listKeys(true,true);

    if (keylistcall.result == FireGPG.Const.Results.SUCCESS)
        gpg_keys = keylistcall.keylist;
    else
        gpg_keys = new Array();

	if (keylistcallpriv.result == FireGPG.Const.Results.SUCCESS)
        gpg_keys_priv = keylistcallpriv.keylist;
    else
        gpg_keys_priv = new Array();

	var listbox = document.getElementById('key-listbox-child');

	while (listbox.firstChild) {
  		listbox.removeChild(listbox.firstChild);
	}



    var current = 0;
	for(var key in gpg_keys) {

        if (gpg_keys[key].keyName) {

            haveAPrivateKey = false;
            for(var key2 in gpg_keys_priv) {

                if (gpg_keys_priv[key2].keyId == gpg_keys[key].keyId) {
                    haveAPrivateKey = true;
                    break;
                }


            }

            current++;

            item = FireGPG.Misc.CreateTreeItemKey2(gpg_keys[key], document, undefined, haveAPrivateKey);

            if (gpg_keys[key].subKeys.length > 0) {

                item.setAttribute("container", "true");
                var subChildren=document.createElement("treechildren");

                for(var skey in gpg_keys[key].subKeys) {

                    if (gpg_keys[key].subKeys[skey].keyName) {

                        var subItem = FireGPG.Misc.CreateTreeItemKey2( gpg_keys[key].subKeys[skey] ,document, gpg_keys[key].keyId,  haveAPrivateKey, true);
                        subChildren.appendChild(subItem);
                    }

                    item.appendChild(subChildren);

                }
            }

            listbox.appendChild(item);


        }
	}

	curentlySelected = null;
	updateButtons();
}

function keySelected() {

	var listbox = document.getElementById('keys-listbox');

	if (listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-id') != "") {
		curentlySelected = listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-id');
        curentlySelectedR = listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-rid');
        privateKey = listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-privatekey') == 'privatekey';
        subkey = listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-subkey') == 'subkey';
        revoked = listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-revokedkey') == 'revokedkey';
        curentlySelectedFingerPrint = listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-fingerprint');
    }
	else {
		curentlySelected = null;
        curentlySelectedFingerPrint = null;
        privateKey = null;
        revoked = null;
    }
	updateButtons();
}


function updateButtons() {

    document.getElementById('exportfile-button').disabled = (curentlySelected == null);
    document.getElementById('exportserver-button').disabled = (curentlySelected == null);
    document.getElementById('changetrust-button').disabled = (curentlySelected == null) || (revoked) || subkey;
    document.getElementById('fingerprint-button').disabled = (curentlySelected == null) || curentlySelectedFingerPrint == '';
    document.getElementById('sign-button').disabled = (curentlySelected == null);
    document.getElementById('revoke-button').disabled = (curentlySelected == null) || (revoked) || (!privateKey) || subkey;
    document.getElementById('del-button').disabled = (curentlySelected == null) || (curentlySelectedFingerPrint == '' ) || subkey; //&& privateKey == false);
    document.getElementById('password-button').disabled = (curentlySelected == null) || (privateKey == false);
    document.getElementById('userid-button').disabled = (curentlySelected == null) || (privateKey == false);
    document.getElementById('userid-add-button').disabled = subkey;
    document.getElementById('userid-del-button').disabled = !subkey;
    document.getElementById('userid-revoque-button').disabled = !subkey || revoked;


}

function refrech() {

	FireGPG.Core.refreshKeysFromServer();
	updateKeyList();
}

function importserver() {
    FireGPG.Misc.showSearchBox((curentlySelected!= null ? "0x" + curentlySelected.substring(8) : "")	, true);
	updateKeyList();

}

function exportserver() {
	FireGPG.Core.sendKeyToServer(curentlySelected);
	updateKeyList();
}

function exportfile() {

	var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"]
        .createInstance(nsIFilePicker);

    fp.init(window, null, nsIFilePicker.modeSave);
    fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);

    var a = fp.show();

    if (a != nsIFilePicker.returnOK && a != nsIFilePicker.returnReplace) //L'utilisateur annule
        return;

    var filePath = fp.file.path;
    var data = "";

	var result = FireGPG.Core.kexport(true, [curentlySelected]);


	if (result.result == FireGPG.Const.Results.SUCCESS) {

		var data = result.exported;

		//Need to remove the file before save
		FireGPG.Misc.removeFile(filePath);
		FireGPG.Misc.putIntoFile(filePath,data);

		alert(document.getElementById('firegpg-strings').
                getString('keyExported'));
	} else {

		alert(document.getElementById('firegpg-strings').
                getString('keyNotExported') + "\n\n" + result.sdOut);
	}
}

function importfile() {

	var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"]
          .createInstance(nsIFilePicker);

    fp.init(window, null, nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);

    if (fp.show() != nsIFilePicker.returnOK) //L'utilisateur annule
        return;

    var filePath = fp.file.path;
    var data = FireGPG.Misc.getFromFile(filePath);

	FireGPG.Core.kimport(false,data, true);

    updateKeyList();

}

function changeTrust(value) {


   FireGPG.Core.changeTrust(false,curentlySelected,value);
    updateKeyList();

}

function password() {


    FireGPG.Core.changePassword(false,curentlySelected);

}

function newKey() {
    window.openDialog("chrome://firegpg/content/Dialogs/Keymanager/newkey.xul", "newkey", "chrome, centerscreen, toolbar, modal").focus();
    updateKeyList();

}

function deleteKey() {

    if (curentlySelectedFingerPrint != '') {

        if (confirm(document.getElementById('firegpg-strings').getString('sure-delete-key'))) {

            FireGPG.Core.deleteKey(false,curentlySelectedFingerPrint);

            updateKeyList();
        }

    } else {

       /* if (confirm(document.getElementById('firegpg-strings').getString('sure-delete-key'))) {

            FireGPG.Core.deleteKey(false,curentlySelectedFingerPrint);

            updateKeyList();
        } */

    }

}


function revoke(raison) {

    if (confirm(document.getElementById('firegpg-strings').getString('sure-revoke-key'))) {

        FireGPG.Core.revokeKey(false,curentlySelected, raison);

        updateKeyList();
    }
}

function addUid() {
    FireGPG.Core.addUid(false, curentlySelected);
    updateKeyList();
}

function delUid() {

    if (confirm(document.getElementById('firegpg-strings').getString('sure-delete-uid'))) {

        FireGPG.Core.delUid(false,curentlySelected, curentlySelectedR);

        updateKeyList();
    }

}

function revokeUid() {


     if (confirm(document.getElementById('firegpg-strings').getString('sure-revoke-uid'))) {

        FireGPG.Core.revokeUid(false,curentlySelected, curentlySelectedR);

        updateKeyList();
    }


}

function sign() {
    window.openDialog("chrome://firegpg/content/Dialogs/Keymanager/signmanager.xul", "newkey", "chrome, centerscreen, toolbar, modal", {keyid :  curentlySelected }).focus();
}

function fingerPrint() {
 alert(curentlySelectedFingerPrint);

}