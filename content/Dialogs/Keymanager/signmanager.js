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

var keyId;
var myPrivateKeys = new Array();
var curentlySelected = null;

function onLoad(win) {

    keyId = window.arguments[0].keyid;

    var privateKeys = FireGPG.Core.listKeys(true);

    privateKeys = privateKeys.keylist;

    for(var key in privateKeys) {

        myPrivateKeys[privateKeys[key].keyId] = privateKeys[key].keyId;

    }

    updateKeyList();

}

function updateKeyList() {

    curentlySelected = null;

	keylistcall = FireGPG.Core.listSigns(keyId);

    gpg_keys = keylistcall.keylist;

	var listbox = document.getElementById('key-listbox-child');

	while (listbox.firstChild) {
  		listbox.removeChild(listbox.firstChild);
	}



    var current = 0;
	for(var key in gpg_keys) {

        if (gpg_keys[key].keyName) {

            current++;

            item = FireGPG.Misc.CreateTreeItemKey3(gpg_keys[key], document, true, false);

            if (gpg_keys[key].signs.length > 0) {

                item.setAttribute("container", "true");
                item.setAttribute("open", "true");
                var subChildren=document.createElement("treechildren");

                for(var skey in gpg_keys[key].signs) {

                    if (gpg_keys[key].signs[skey].keyName) {

                        var subItem = FireGPG.Misc.CreateTreeItemKey3( gpg_keys[key].signs[skey] ,document,  true, true, myPrivateKeys[gpg_keys[key].signs[skey].keyId]);
                        subChildren.appendChild(subItem);
                    }

                    item.appendChild(subChildren);

                }
            }

            listbox.appendChild(item);

            //Subkeys
            if (gpg_keys[key].subKeys.length > 0) {

                for(var skey in gpg_keys[key].subKeys) {

                    if (gpg_keys[key].subKeys[skey].keyName) {

                        var item = FireGPG.Misc.CreateTreeItemKey3( gpg_keys[key].subKeys[skey] ,document, false, false);

                        if (gpg_keys[key].subKeys[skey].signs.length > 0) {

                            item.setAttribute("container", "true");
                            item.setAttribute("open", "true");
                            var subChildren=document.createElement("treechildren");

                            for(var skey2 in gpg_keys[key].subKeys[skey].signs) {

                                if (gpg_keys[key].subKeys[skey].signs[skey2].keyName) {

                                    var subItem = FireGPG.Misc.CreateTreeItemKey3(gpg_keys[key].subKeys[skey].signs[skey2] ,document,  false, true, myPrivateKeys[gpg_keys[key].subKeys[skey].signs[skey2].keyId]);
                                    subChildren.appendChild(subItem);
                                }

                                item.appendChild(subChildren);

                            }
                        }

                    listbox.appendChild(item);


                    }
                }


            }


        }
	}

	curentlySelected = null;
	updateButtons();

}

function keySelected() {

	var listbox = document.getElementById('keys-listbox');

    curentlySelected = null;
	if (listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-id') != "")
        if ( listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-haveprivate') == 'haveprivate')
            curentlySelected = listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-id');




	updateButtons();
}


function updateButtons() {


    document.getElementById('revoke-button').disabled = true;//(curentlySelected == null);
    document.getElementById('del-button').disabled = true;//(curentlySelected == null);


}

function sign() {

    var keys = FireGPG.Core.listKeys();

    keys = keys.keylist;

    fingerPrint = null;

    for(var key in keys) {

       if (keys[key].keyId == keyId) {
            fingerPrint = keys[key].fingerPrint;
            break;
       }

    }

    if (fingerPrint != null && confirm(document.getElementById('firegpg-strings').getString('confirmsign') + " " + fingerPrint))
        FireGPG.Core.signKey(false, keyId);

    updateKeyList();

}