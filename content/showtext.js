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
 * Called when dialog is shown.
 */
function onLoad(win)
{
	if(window.arguments == undefined)
		return;

	document.getElementById('text').value = window.arguments[0].text;
	document.getElementById('description').value = window.arguments[0].description;
	document.title = window.arguments[0].title;
}

/*
 * Open a file a show him for editinf
 */
function openf() {

var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"]
          .createInstance(nsIFilePicker);
  fp.init(window, null, nsIFilePicker.modeOpen);
  fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);
  if (fp.show() != nsIFilePicker.returnOK) //L'utilisateur annule
    return;

  var filePath = fp.file.path;
  var data = getFromFile(filePath);
  document.getElementById('text').value = data;
}

/*
 * Save the text to a file
 */
function savef() {
var nsIFilePicker = Components.interfaces.nsIFilePicker;
  var fp = Components.classes["@mozilla.org/filepicker;1"]
          .createInstance(nsIFilePicker);
  fp.init(window, null, nsIFilePicker.modeSave);
  fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);
  var a = fp.show();
  if (a != nsIFilePicker.returnOK && a != nsIFilePicker.returnReplace) //L'utilisateur annule
    return;

  var filePath = fp.file.path;
  var data = document.getElementById('text').value;
  //Need to remove the file before save
  removeFile(filePath);
  putIntoFile(filePath,data);
}

/*
* Crypt the text
*/
function crypt() {
	// GPG verification
	if(!GPG.selfTest())
		return;

	// For i18n
	var i18n = document.getElementById("firegpg-strings");

	//TODO: tester la sélection.
	var text = document.getElementById('text').value;

	if (text == "") {
		alert(i18n.getString("noData"));
		return;
	}

	// Needed for a crypt
	var keyID = choosePublicKey();

	if(keyID == null) {
		return;
	}

	// We get the result
	var result =GPG.baseCrypt(text, keyID);
	var crypttext = result.output;
	var sdOut2 = result.sdOut2;
	result = result.sdOut;

	// If the crypt failled
	if(result == "erreur") {
		// We alert the user
		alert(i18n.getString("cryptFailed") + sdOut2);
	}
	else {
		document.getElementById('text').value = crypttext;
	}
}

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8
