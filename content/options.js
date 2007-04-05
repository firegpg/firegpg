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
 * Called when change-gpg-path-checkbox is checked/unchecked to 
 * enable/disable some elements in the options interface.
 *
 * The arguments are optional.
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
 * This function is called when a private key is selected.
 */
function privateKeySelected(listbox)
{
	/* select the default key */
	var key_id = listbox.selectedItem.value;
	document.getElementById('default-private-key-pref').value = key_id;
}

/* 
 * onLoad is called when options dialog is loaded.
 */
function onLoad(win) 
{
	var gpg_keys = GPG.listKeys(true); /* private keys are returned */
	var listbox = document.getElementById('private-keys-listbox');
	
	/* read the default private key */
	var default_private_key = document.getElementById('default-private-key-pref').value;
	
	var default_item = null; /* this variable will contain the index of
	                          the default private key item */
	
	

	/* add all keys in the list box and find
	 * the default item */
	for(var key in gpg_keys) {
		var item = listbox.appendItem(gpg_keys[key], key);

		if(default_private_key == key)
			default_item = item;
	}
	listbox.appendItem('Ask for private key', ''); /* TODO i18n */
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
}

/*
 * Open the file selected and return the choosen file.
 * If no file is selected, null is returned.
 */
function fileSelector()
{
	var nsIFilePicker = Components.interfaces.nsIFilePicker;
	var fp = Components.classes["@mozilla.org/filepicker;1"].createInstance(nsIFilePicker);
	var i18n = document.getElementById("firegpg-strings");
	fp.init(window, i18n.getString('fileSelectorSelectFile'), nsIFilePicker.modeOpen);
	fp.appendFilters(nsIFilePicker.filterAll);
	return (fp.show() == nsIFilePicker.returnOK) ? fp.file.path : null;
}

/*
 * It choose the GPG path.
 */
function chooseGPGPath()
{
	var gpg_path = fileSelector();

	if(gpg_path != null) {
		document.getElementById('gpg-path-textbox').value = gpg_path;
		document.getElementById('gpg-path-pref').value = gpg_path;
	}
}

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8
