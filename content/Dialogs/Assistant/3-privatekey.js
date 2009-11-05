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
    Function: onLoad

    This function is called when the form is show.

    Parameters:
        win - The form herself.

*/
function onLoad(win) {
    textPrivateKey();
}

/*
    Function: next
    Process to the next step of the assistant

*/
function next() {

    this.close();

    var assis = window.openDialog('chrome://firegpg/content/Dialogs/Assistant/4-gmail.xul','', 'chrome, dialog, resizable=false');
    assis.focus();

}

/*
    Function: textPrivateKey
    Test if there is a private key and set the interface
*/
function textPrivateKey() {


    keylistcall = FireGPG.Core.listKeys(true);

    if (keylistcall.result == FireGPG.Const.Results.SUCCESS)
        gpg_keys = keylistcall.keylist;
    else
        gpg_keys = new Array();


    if (gpg_keys.length > 0) {


        document.getElementById('private-key-exist').style.display = '';
        document.getElementById('private-key-dosent-exist').style.display = 'none';


        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                              getService(Components.interfaces.nsIPrefService);
        prefs = prefs.getBranch("extensions.firegpg.");

        //Code duplicated in options

        var listbox = document.getElementById('private-keys-listbox-child');

        /* read the default private key */
        var default_private_key = prefs.getCharPref('default_private_key');

        var AskKey = new FireGPG.GPGKey();

        AskKey.keyName = document.getElementById('firegpg-ask-for-private-label').value;

        var Ditem = FireGPG.Misc.CreateTreeItemKey(AskKey, document);

        listbox.appendChild(Ditem);

        var default_item = 0; /* this variable will contain the index of
                                  the default private key item */

        /* add all keys in the list box and find
         * the default item */
        var current = 0;
        for(var key in gpg_keys) {

            if (gpg_keys[key].keyName) {

                current++;

                item = FireGPG.Misc.CreateTreeItemKey(gpg_keys[key], document);

                if(default_private_key == gpg_keys[key].keyId)
                    default_item = current;

                if (gpg_keys[key].subKeys.length > 0) {

                    item.setAttribute("container", "true");
                    var subChildren=document.createElement("treechildren");

                    for(var skey in gpg_keys[key].subKeys) {

                        if (gpg_keys[key].subKeys[skey].keyName) {

                            var subItem = FireGPG.Misc.CreateTreeItemKey( gpg_keys[key].subKeys[skey] ,document, gpg_keys[key].keyId);

                            subChildren.appendChild(subItem);
                        }

                        item.appendChild(subChildren);

                    }
                }

                listbox.appendChild(item);


            }
        }

        document.getElementById('private-keys-listbox').view.selection.select(default_item);


    } else {

        document.getElementById('private-key-exist').style.display = 'none';
        document.getElementById('private-key-dosent-exist').style.display = '';
    }

}

/*
    Function: privateKeySelected
    This function is called when a private key is selected. It's update the hidden field.
*/

function privateKeySelected(listbox) {

	/* select the default key */
	if (listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-id') != "")
		var key_id = listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-id');
	else //User selected AskForPrivateKey
		var key_id = "";

	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                          getService(Components.interfaces.nsIPrefService);
    prefs = prefs.getBranch("extensions.firegpg.");

    prefs.setCharPref("default_private_key",key_id);
}

/*
    Function: genKey
    Load the window to create a new ey
*/
function genKey() {

    window.openDialog("chrome://firegpg/content/Dialogs/Keymanager/newkey.xul", "newkey", "chrome, centerscreen, toolbar, modal").focus();
    textPrivateKey();
}

/*
    Function: import
    Let's user import a key
*/
function import() {

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

     textPrivateKey();

}