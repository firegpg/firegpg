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

        if (window.arguments[0].doShowButtons == true)
        {
                document.getElementById('buttons-box').style.display = 'none';
        }
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

	var text = getSelectedText();

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
	var result = GPG.baseCrypt(text, keyID);
	var crypttext = result.output;
	var sdOut2 = result.sdOut2;
	result = result.sdOut;

	// If the crypt failled
	if(result == "erreur") {
		// We alert the user
		alert(i18n.getString("cryptFailed") + sdOut2);
	}
	else {
		setSeletedText(crypttext);
	}
}

//Decrypt the text
function dcrypt() {
        // GPG verification
        if(!GPG.selfTest())
                return;

        // For i18n
        var i18n = document.getElementById("firegpg-strings");

        var text = getSelectedText();

        if (text == "") {
                alert(i18n.getString("noData"));
                return;
        }

        //Verify GPG'data presence
        reg=new RegExp("\\- \\-\\-\\-\\-\\-BEGIN PGP MESSAGE\\-\\-\\-\\-\\-", "gi"); // We don't have to detect disabled balises
        text = text.replace(reg, "FIREGPGTRALALABEGINHIHAN");

        reg=new RegExp("\\- \\-\\-\\-\\-\\-END PGP MESSAGE\\-\\-\\-\\-\\-", "gi"); // We don't have to detect disabled balises
        text = text.replace(reg, "FIREGPGTRALALAENDHIHAN");

        var firstPosition = text.indexOf("-----BEGIN PGP MESSAGE-----");
        var lastPosition = text.indexOf("-----END PGP MESSAGE-----");

        reg=new RegExp("FIREGPGTRALALABEGINHIHAN", "gi"); // We don't have to detect disabled balises
        text = text.replace(reg, "-----BEGIN PGP MESSAGE-----");

        reg=new RegExp("FIREGPGTRALALAENDHIHAN", "gi"); // We don't have to detect disabled balises
        text = text.replace(reg, "-----END PGP MESSAGE-----");

        if (firstPosition == -1 || lastPosition == -1) {
                alert(i18n.getString("noGPGData"));
                return;
        }

        text = text.substring(firstPosition,lastPosition + ("-----END PGP MESSAGE-----").length);

        // Needed for a decrypt
        var password = getPrivateKeyPassword();

        if(password == null) {
                return;
        }

        // We get the result
        var result = GPG.baseDecrypt(text,password);
        var crypttext = result.output;
        var sdOut2 = result.sdOut2;
        result = result.sdOut;

        // If the crypt failled
        if (result == "erreurPass") {
                alert(i18n.getString("decryptFailedPassword"));
                eraseSavedPassword();
        }
        else if (result == "erreur") {
                alert(i18n.getString("decryptFailed") + sdOut2);
        }
        else {
                setSeletedText(crypttext);
        }
}

//Sign the text
function sign() {
        // GPG verification
        if(!GPG.selfTest())
                return;

        // For i18n
        var i18n = document.getElementById("firegpg-strings");
        var text = getSelectedText();

        if (text == "") {
                alert(i18n.getString("noData"));
                return;
        }

        // Needed for a sign
        var keyID = getSelfKey();
        if(keyID == null)
                return;

        var password = getPrivateKeyPassword();
        if(password == null)
                return;

        var result = GPG.baseSign(text,password,keyID);
        var crypttext = result.output;
        var sdOut2 = result.sdOut2;
        result = result.sdOut;

        // If the sign failled
        if(result == "erreur") {
                // We alert the user
                alert(i18n.getString("signFailed") + sdOut2);
        }
        else if(result == "erreurPass") {
                        alert(i18n.getString("signFailedPassword"));
                        eraseSavedPassword();
        }
        else {
                setSeletedText(crypttext);
        }
}

//verfify the sin of a text
function verify() {
        // GPG verification
        if(!GPG.selfTest())
                return;

        // For I18N
        var i18n = document.getElementById("firegpg-strings");

        var text = getSelectedText();

        if (text == "") {
                alert(i18n.getString("noData"));
                return;
        }

        var result = GPG.baseVerify(text);

        // For I18N
        var i18n = document.getElementById("firegpg-strings");

        if (result == "noGpg") {
                alert(i18n.getString("noGPGData"));
                return;
        }
        else if (result == "erreur")
                alert(i18n.getString("verifFailed"));
        else {
                infos = result.split(" ");

                var infos2 = "";
                for (var ii = 1; ii < infos.length; ++ii)
                {  infos2 = infos2 + infos[ii] + " ";}

                alert(i18n.getString("verifSuccess") + " " + infos2);
        }
}

// Retrun the selected text (if nothing is selected, return all)
function getSelectedText()
{
        var value = document.getElementById('text').value;
	value = value.substring(document.getElementById('text').selectionStart,document.getElementById('text').selectionEnd)
        if (value == "")
                value = document.getElementById('text').value
        return value;
}

//Set a new text for the textbox, but only the selection if something is selected.
function setSeletedText(text)
{
        var txtbox = document.getElementById('text');
        var value = txtbox.value;
        var startPos = txtbox.selectionStart;
        var endPos = txtbox.selectionEnd;
        var chaine = txtbox.value;
        if (startPos != endPos)
        {
                // We create the new string and replace it into the focused element
                txtbox.value = chaine.substring(0, startPos) + text + chaine.substring(endPos, chaine.length);
        }
        else //Nothing is seleted, we remplace all
                txtbox.value = text;
}

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8
