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
    Variable: listOfAutoSelect
    This is a tempory variable, witch contains key to select automaticaly.
 */
var listOfAutoSelect = new Array();

/*
    Variable: savedList
    The full list of key (when we filter, we haven't all key in the list)
 */
var savedList = new Array();

/*
    Function: onLoad

    This function is called when the list.xul form is show.
    It's make the diffrents list of key and pre-select the key who have to be selected.

    Parameters:
        win - The form herself.
        window.arguments[0].list - The keys list. It's an array.
        window.arguments[0].preSelect - The keys list to select. It's an array.
        window.arguments[0].description - The text to show for the prompt.
        window.arguments[0].title- The title of the window.
*/
function onLoad(win)
{
	if(window.arguments == undefined)
		return;

	var preSelect = window.arguments[0].preSelect;

	//PreSelect
	/*
	 * TODO preSelect.length warning (see below)
	 */
	if (preSelect.length == 0)
		var autoSelectMode = false;
	else	{
		var autoSelectMode = true;
		var testList = "";
		/* TODO here a warning :
		 * "reference to undefined property preSelect.length */
		for (var i = 0; i < preSelect.length; i++) {
			testList = testList + preSelect[i] + " ";
		}
	}

	// the list
	var list = window.arguments[0].list;

    //sorting list
	var listInDialog = document.getElementById('list');

	var selected;
	var j = 0;
    var k = 0;

	for(var id in list){

        if (list[id].keyName == "")
            continue;

		selected = false;

		if (autoSelectMode == true) {

			var reg = new RegExp('[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}', 'gi');

			var theMail = reg.exec(list[id].keyName);

			if (theMail != null) {
				if (testList.indexOf(theMail) != -1)
					selected = true;
			}

		}

		var  item   = document.createElement('listitem');

		var  child1 = document.createElement('listcell');
		child1.setAttribute('label', list[id].keyName);
		item.appendChild(child1);

		var  child2 = document.createElement('listcell');
		child2.setAttribute('label', list[id].keyId);
		item.appendChild(child2);

		var  child3 = document.createElement('listcell');
		child3.setAttribute('label', list[id].keyDate);
		item.appendChild(child3);

		var  child4 = document.createElement('listcell');
		child4.setAttribute('label', list[id].keyExpi);
		item.appendChild(child4);

		listInDialog.appendChild(item);

        savedList[k] = new Array(list[id].keyName, list[id].keyId, list[id].keyDate, list[id].keyExpi, (list[id].keyName + list[id].keyId+ list[id].keyDate + list[id].keyExpi) .toLowerCase()  );
        k++;

		if (selected == true) {
			listOfAutoSelect[j] = item;
			j++;
		}

        //TODO : Find a better way
        if (list[id].subKeys.length > 0) {

            for(var kid in list[id].subKeys){

                if (list[id].subKeys[kid].keyName == "")
                    continue;

                selected = false;

                if (autoSelectMode == true) {

                    var reg = new RegExp('[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}', 'gi');

                    var theMail = reg.exec(list[id].subKeys[kid].keyName);

                    if (theMail != null) {
                        if (testList.indexOf(theMail) != -1)
                            selected = true;
                    }

                }

                var  item   = document.createElement('listitem');

                var  child1 = document.createElement('listcell');
                child1.setAttribute('label', "> " +list[id].subKeys[kid].keyName);
                item.appendChild(child1);

                var  child2 = document.createElement('listcell');
                child2.setAttribute('label', list[id].keyId);
                item.appendChild(child2);

                var  child3 = document.createElement('listcell');
                child3.setAttribute('label', list[id].subKeys[kid].keyDate);
                item.appendChild(child3);

                var  child4 = document.createElement('listcell');
                child4.setAttribute('label', list[id].subKeys[kid].keyExpi);
                item.appendChild(child4);

                listInDialog.appendChild(item);

                savedList[k] = new Array("> " + list[id].subKeys[kid].keyName, list[id].keyId, list[id].subKeys[kid].keyDate, list[id].subKeys[kid].keyExpi, (list[id].subKeys[kid].keyName + list[id].subKeys[kid].keyId+ list[id].subKeys[kid].keyDate + list[id].subKeys[kid].keyExpi) .toLowerCase()  );
                k++;

                if (selected == true) {
                    listOfAutoSelect[j] = item;
                    j++;
                }
            }
        }

	}

	// description
	var description = window.arguments[0].description;
	document.getElementById('description').value = description;

	// title
	win.title = window.arguments[0].title;

	setTimeout("checkTheAutoSelect()",100);

}

/*
    Function: checkTheAutoSelect
    This function select the key present in <listOfAutoSelect>
*/
function checkTheAutoSelect() {

	for (var i = 0; i < listOfAutoSelect.length; i++) {
		document.getElementById('list').addItemToSelection(listOfAutoSelect[i]);
	}
	document.getElementById('list').focus();
}

/*
    Function: onAccept

    This function is called when the _Ok_ button is pressed.
    It's prepare the differents data to return them.
*/
function onAccept() {
	if(window.arguments == undefined)
		return true;

	var listInDialog = document.getElementById('list');

	/* dictionary contain result['id'] = 'label' */
	var result = new Array();

	for(var i = 0; i < listInDialog.selectedItems.length; i++) {
		var item = listInDialog.selectedItems[i];
		result.push(item.childNodes[1].getAttribute('label'));
	}

	window.arguments[0].selected_items = result;

	/* TODO if no item selected, don't hide window and say it's important
	  to select an item ! */

	return true;
}

/*
    Function: filter
    This function filter the key list, based on the current value of _search-textbox_. She clear all and rebuild the list, based on <savedList>
*/
function filter() {
    to_filtre = document.getElementById('search-textbox').value.toLowerCase();
    var listInDialog = document.getElementById('list');

    var n_items = listInDialog.childNodes.length;

    for(var i = 0; i < (n_items - 1); i++) {
		listInDialog.removeItemAt(0);
    }

    for(var i = 0; i < savedList.length; i++) {

        if (to_filtre == '' || savedList[i][4].indexOf(to_filtre) != -1) {

            var  item   = document.createElement('listitem');

            var  child1 = document.createElement('listcell');
            child1.setAttribute('label', savedList[i][0]);
            item.appendChild(child1);

            var  child2 = document.createElement('listcell');
            child2.setAttribute('label', savedList[i][1]);
            item.appendChild(child2);

            var  child3 = document.createElement('listcell');
            child3.setAttribute('label', savedList[i][2]);
            item.appendChild(child3);

            var  child4 = document.createElement('listcell');
            child4.setAttribute('label', savedList[i][3]);
            item.appendChild(child4);

            listInDialog.appendChild(item);
        }
    }

}

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8
