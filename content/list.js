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
 * Called when the list dialog is shown.
 *
 * window.arguments[0] will contain this object :
 *   {description: '', title: '', list: {'ID': 'Label'}, 
 *    selected_item:'' *the default selected ID* }
 */
function onLoad(win)
{
	if(window.arguments == undefined)
		return;

	// the list
	var list = window.arguments[0].list;
	var listInDialog = document.getElementById('list');
	for(var id in list) 
		listInDialog.appendItem(list[id], id);
		/* TODO test selected_item and select the item with this id by default ? */
	
	// description
	var description = window.arguments[0].description;
	document.getElementById('description').value = description;

	// title
	win.title = window.arguments[0].title; 
}

/* 
 * If Ok button is pressed.
 */
function onAccept()
{
	if(window.arguments == undefined)
		return true;

	var listInDialog = document.getElementById('list');
	window.arguments[0].selected_item = listInDialog.selectedItem.value;

	/* TODO if no item selected, don't hide window and say it's important 
	  to select an item ! */

	return true;
}

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8
