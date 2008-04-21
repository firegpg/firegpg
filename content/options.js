/* ***** BEGIN LICENSE BLOCK *****
 *   Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public License Version
 * 1.1 (the "License"); you may not use this file except in compliance with
 * the License. You may obtain a copy of the License at
 * http://www.mozilla.org/MPL/
 *
 * Software distributed under the License is distributed on an "AS IS" basis,
 * WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
 * for the specific language governing rights and limitations under the
 * License.
 *
 * The Original Code is FireGPG.
 *
 * The Initial Developer of the Original Code is
 * FireGPG Team.
 * Portions created by the Initial Developer are Copyright (C) 2007
 * the Initial Developer. All Rights Reserved.
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
 *
 * ***** END LICENSE BLOCK ***** */

/*
    Function: onChangeGPGPathCheckbox
    Called when change-gpg-path-checkbox is checked/unchecked to
    enable/disable some elements in the options interface.

    Parameters:
        checkbox - _Optional_. The checkbox value. If not set, use the current value.
        focus_textbox - _Optional_. Set it to true to fucus the text field
*/
function onChangeGPGPathCheckbox(checkbox, focus_textbox) {
	/* checked ? */
	if(checkbox == undefined)
		checkbox = document.getElementById('change-gpg-path-checkbox');

    var disabled = (checkbox.checked) ? false : true;

	/* button */
	document.getElementById('change-gpg-path-button').disabled = disabled;

	/* textbox */
	var textbox = document.getElementById('gpg-path-textbox');
	textbox.disabled = disabled;
	if(focus_textbox != undefined && focus_textbox == true)
		textbox.focus();
}


/*
    Function: privateKeySelected
    This function is called when a private key is selected. It's update the hidden field.
*/

function privateKeySelected(listbox) {
	/* select the default key */
	if (listbox.selectedItem.childNodes[1] != null)
		var key_id = listbox.selectedItem.childNodes[1].getAttribute('label');
	else //User selected AskForPrivateKey
		var key_id = "";
	document.getElementById('default-private-key-pref').value = key_id;
}

/*
    Function: onLoad

    This function is called when the options.xul form is show.
    It's init the differents objets (like the translated strings, the keys lists, and the special values).

    Parameters:
        win - The form herself.

*/
function onLoad(win)
{

	var gpg_keys = GPG.listKeys(true); /* private keys are returned */
	var listbox = document.getElementById('private-keys-listbox');

	/* read the default private key */
	var default_private_key = document.getElementById('default-private-key-pref').value;


	listbox.appendItem('Always ask for private key', ''); /* TODO i18n */


	var default_item = null; /* this variable will contain the index of
	                          the default private key item */

	/* add all keys in the list box and find
	 * the default item */
	for(var key in gpg_keys) {

		var  item   = document.createElement('listitem');

		var  child1 = document.createElement('listcell');
		child1.setAttribute('label', gpg_keys[key][0]);
		item.appendChild(child1);

		var  child2 = document.createElement('listcell');
		child2.setAttribute('label', key);
		item.appendChild(child2);

		var  child3 = document.createElement('listcell');
		child3.setAttribute('label', gpg_keys[key][1]);
		item.appendChild(child3);

		var  child4 = document.createElement('listcell');
		child4.setAttribute('label', gpg_keys[key][02]);
		item.appendChild(child4);


		listbox.appendChild(item);

		//alert(key + " " + gpg_keys[key][0] + " " + gpg_keys[key][1] + " " + gpg_keys[key][2]);

		//var item = listbox.appendItem(gpg_keys[key][0], key);

		if(default_private_key == key)
			default_item = item;
	}
	listbox.flex = 1;
	/* select the default item */
	if(default_item != null)
		listbox.selectItem(default_item);
	else {
		listbox.selectedIndex = 0;
	}

	listbox.focus();

	/* call some important events */
	onChangeGPGPathCheckbox();

	/* gpgAUth */
	getIgnored_servers( document.getElementById('domain_list') );

    //Set version number
    if (FIREGPG_STATUS != 'DEVEL')
        document.getElementById('firegpg-version-version').value = FIREGPG_VERSION;
    else
        document.getElementById('firegpg-version-version').value = 'DEVEL - ' + FIREGPG_VERSION + ' - Svn version:  ' + FIREGPG_SVN;

    listbox = document.getElementById('api_domain_list');

    // Load gpgapi list :

    access = gpgApi.getAccessList();

    for (var key in access) {

        var  item   = document.createElement('listitem');

        item.setAttribute('gpgApi-key',key);

        var  child1 = document.createElement('listcell');
        child1.setAttribute('label', access[key]);
        item.appendChild(child1);

        var  child2 = document.createElement('listcell');
        child2.setAttribute('label', key.substr(0,40) + '...');
        item.appendChild(child2);

        listbox.appendChild(item);

        item.setAttribute('ondblclick','apiRemoveMySelf(this);');

    }

}

/*
    Function: apiRemoveMySelf
    Remove an auth key of the api
*/
function apiRemoveMySelf(item) {

    if (confirm(document.getElementById("firegpg-strings").getString('remove-auth-key')) == false)
        return;

    listbox = document.getElementById('api_domain_list');

    access = gpgApi.getAccessList();

    delete(access[item.getAttribute('gpgApi-key')]);

    gpgApi.setAccessList(access);

    listbox.removeChild(item);


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
    Function: chooseGPGPath
    Choose a gpg executable and set the values of the options.
*/
function chooseGPGPath() {
	var gpg_path = fileSelector();

	if(gpg_path != null) {
		document.getElementById('gpg-path-textbox').value = gpg_path;
		document.getElementById('gpg-path-pref').value = gpg_path;
	}
}

/*
    Function: showWarnings
    Show warnings if use try to disable updates because it's _bad_ ^^.
*/
function showWarnings() {
	var checkBox = document.getElementById("updates-checkbox");
	//Si c'est false, il est entrain d'activer
	if (checkBox.checked == false)
	{
		var i18n = document.getElementById("firegpg-strings");
		if (!confirm(i18n.getString('turn-off-updates-w1')) || !confirm(i18n.getString('turn-off-updates-w2')))
			checkBox.checked = true;
	}
}
// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8
