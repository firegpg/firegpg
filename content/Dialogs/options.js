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

Contributor(s): Achraf Cherti, Kyle L. Huff.

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

Portions created by gpg_auth are Copyright (C) 2007 Kyle L. Huff All Rights Reserved.

***** END LICENSE BLOCK *****

*/

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
	if (listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-id') != "")
		var key_id = listbox.view.getItemAtIndex(listbox.currentIndex).firstChild.getAttribute('gpg-id');
	else //User selected AskForPrivateKey
		var key_id = "";

	document.getElementById('default-private-key-pref').value = key_id;
}

/*
    Function: onLoad

    This function is called when the options.xul form is show.
    It's init the differents objects (like the translated strings, the keys lists, and the special values).

    Parameters:
        win - The form herself.

*/
function onLoad(win) {

     //Set version number
    if (FireGPG.Const.Status != 'DEVEL')
        document.getElementById('firegpg-version-version').value = FireGPG.Const.Version + ' (' + FireGPG.Const.Svn + ')';
    else
        document.getElementById('firegpg-version-version').value = 'DEVEL - ' + FireGPG.Const.Version + ' - Svn version:  ' + FireGPG.Const.Svn;


    if (FireGPGGPGAccess.FireGPGCall != null)
        document.getElementById('firegpg-version-version').value +=  ' -  XpCom';

    // Code duplicated in assistant
    keylistcall = FireGPG.Core.listKeys(true);

    if (keylistcall.result == FireGPG.Const.Results.SUCCESS)
        gpg_keys = keylistcall.keylist;
    else
        gpg_keys = new Array();

	var listbox = document.getElementById('private-keys-listbox-child');

	/* read the default private key */
	var default_private_key = document.getElementById('default-private-key-pref').value;

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

	/* call some important events */
	onChangeGPGPathCheckbox();

	/* gpgAUth */
	getIgnored_servers( document.getElementById('domain_list') );




    // Load gpgapi list :

    listbox = document.getElementById('api_domain_list');

    access = FireGPG.Api.getAccessList();

    for(domain in access.domains_allowed) {
        var  item   = document.createElement('listitem');
        item.setAttribute('gpgApi-domain',domain);
        item.setAttribute('gpgApi-type','DA');
        var  child1 = document.createElement('listcell');
        child1.setAttribute('label', domain);
        item.appendChild(child1);
        var  child2 = document.createElement('listcell');
        child2.setAttribute('label', access.domains_allowed[domain].substr(0,40) + '...');
        item.appendChild(child2);
        listbox.appendChild(item);
        item.setAttribute('ondblclick','apiRemoveMySelf(this);');
    }

    for(domain in access.domains_denied) {
        var  item   = document.createElement('listitem');
        item.setAttribute('gpgApi-domain',domain);
        item.setAttribute('gpgApi-type','DD');
        var  child1 = document.createElement('listcell');
        child1.setAttribute('label', domain);
        item.appendChild(child1);
        var  child2 = document.createElement('listcell');
        child2.setAttribute('label',  document.getElementById('firegpg-strings').getString('api-not-allows') );
        item.appendChild(child2);
        listbox.appendChild(item);
        item.setAttribute('ondblclick','apiRemoveMySelf(this);');
    }


    for(domain in access.sites_allowed) {
        var  item   = document.createElement('listitem');
        item.setAttribute('gpgApi-domain',domain);
        item.setAttribute('gpgApi-type','SA');
        var  child1 = document.createElement('listcell');
        child1.setAttribute('label', domain);
        item.appendChild(child1);
        var  child2 = document.createElement('listcell');
        child2.setAttribute('label', access.sites_allowed[domain].substr(0,40) + '...');
        item.appendChild(child2);
        listbox.appendChild(item);
        item.setAttribute('ondblclick','apiRemoveMySelf(this);');
    }

    for(domain in access.sites_denied) {
        var  item   = document.createElement('listitem');
        item.setAttribute('gpgApi-domain',domain);
        item.setAttribute('gpgApi-type','SD');
        var  child1 = document.createElement('listcell');
        child1.setAttribute('label', domain);
        item.appendChild(child1);
        var  child2 = document.createElement('listcell');
        child2.setAttribute('label',  document.getElementById('firegpg-strings').getString('api-not-allows') );
        item.appendChild(child2);
        listbox.appendChild(item);
        item.setAttribute('ondblclick','apiRemoveMySelf(this);');
    }


    for(domain in access.pages_allowed) {
        var  item   = document.createElement('listitem');
        item.setAttribute('gpgApi-domain',domain);
        item.setAttribute('gpgApi-type','PA');
        var  child1 = document.createElement('listcell');
        child1.setAttribute('label', domain);
        item.appendChild(child1);
        var  child2 = document.createElement('listcell');
        child2.setAttribute('label', access.pages_allowed[domain].substr(0,40) + '...');
        item.appendChild(child2);
        listbox.appendChild(item);
        item.setAttribute('ondblclick','apiRemoveMySelf(this);');
    }

    for(domain in access.pages_denied) {
        var  item   = document.createElement('listitem');
        item.setAttribute('gpgApi-domain',domain);
        item.setAttribute('gpgApi-type','PD');
        var  child1 = document.createElement('listcell');
        child1.setAttribute('label', domain);
        item.appendChild(child1);
        var  child2 = document.createElement('listcell');
        child2.setAttribute('label', document.getElementById('firegpg-strings').getString('api-not-allows') );
        item.appendChild(child2);
        listbox.appendChild(item);
        item.setAttribute('ondblclick','apiRemoveMySelf(this);');
    }

    //Load autowrap actions
    actions = FireGPG.AutoWrap.getActionList();

    listbox = document.getElementById('autowrap_list');

    for (var domain in actions) {

        var  item   = document.createElement('listitem');

        item.setAttribute('autoWrap-domain',domain);

        var  child1 = document.createElement('listcell');
        child1.setAttribute('label', domain);
        item.appendChild(child1);

        var  child2 = document.createElement('listcell');
        var message;
        if(actions[domain] == "W")
            message = document.getElementById('firegpg-strings').getString('autowrap-warp');
        else
            message = document.getElementById('firegpg-strings').getString('autowrap-ignore');
        child2.setAttribute('label', message);
        item.appendChild(child2);

        listbox.appendChild(item);

        item.setAttribute('ondblclick','autoWrapRemoveMySelf(this);');

    }

}

/*
    Function: autoWrapRemoveMySelf
    Remove an auto action for autowrap
*/
function autoWrapRemoveMySelf(item) {

    listbox = document.getElementById('autowrap_list');

    actions = FireGPG.AutoWrap.getActionList();

    delete(actions[item.getAttribute('autoWrap-domain')]);

    FireGPG.AutoWrap.setActionList(actions);

    listbox.removeChild(item);


}


/*
    Function: apiRemoveMySelf
    Remove an auth key of the api
*/
function apiRemoveMySelf(item) {

    if (confirm(document.getElementById("firegpg-strings").getString('remove-auth-key')) == false)
        return;

    listbox = document.getElementById('api_domain_list');

    access = FireGPG.Api.getAccessList();

    if (item.getAttribute('gpgApi-type') == 'DA')
        delete(access.domains_allowed[item.getAttribute('gpgApi-domain')]);
    if (item.getAttribute('gpgApi-type') == 'DD')
        delete(access.domains_denied[item.getAttribute('gpgApi-domain')]);
    if (item.getAttribute('gpgApi-type') == 'SA')
        delete(access.sites_allowed[item.getAttribute('gpgApi-domain')]);
    if (item.getAttribute('gpgApi-type') == 'SA')
        delete(access.sites_denied[item.getAttribute('gpgApi-domain')]);
    if (item.getAttribute('gpgApi-type') == 'PA')
        delete(access.pages_allowed[item.getAttribute('gpgApi-domain')]);
    if (item.getAttribute('gpgApi-type') == 'PD')
        delete(access.pages_denied[item.getAttribute('gpgApi-domain')]);

    FireGPG.Api.setAccessList(access);

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

/*
  Function: showAssistant
  Show the assistant
*/
function showAssistant() {
    window.openDialog('chrome://firegpg/content/Dialogs/Assistant/1-welcome.xul','', 'chrome, dialog, resizable=false').focus()
}
