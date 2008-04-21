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
    Function: onLoad

    This function is called when the showtext.xul form is show.
    It's init the differents objets (like the translated strings).

    Parameters:
        win - The form herself.
        windows.arguments[0].title - The title of the window.
        windows.arguments[0].text - The text to put in the editor.
        windows.arguments[0].description - The description to show.
        windows.arguments[0].doShowButtons - Set this to true to disable buttons (encrypt, ...)
        windows.arguments[0].validSign - The text to display in the validSign label.
*/
function onLoad(win) {

	if(window.arguments == undefined)
		return;

	document.getElementById('text').value = window.arguments[0].text;
	document.getElementById('description').value = window.arguments[0].description;
	document.title = window.arguments[0].title;

        if (window.arguments[0].doShowButtons == true) {
               document.getElementById('buttons-box').style.display = 'none';
        }


        if (window.arguments[0].validSign != null) {

            document.getElementById('dcryptsignresult').style.display = '';
            document.getElementById('dcryptsignresult').value = document.getElementById("firegpg-strings").getString("validSignInCrypt") + " " + window.arguments[0].validSign;
        }

}

/*
    Function: openf
    Open a file a display it into the editor.
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
    Function: savef
    Save the current data in the editor to a file
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
    Function: crypt
    Encrypt the current data of the editor.
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

    var tryPosition = text.indexOf("-----BEGIN PGP MESSAGE-----");

    if (tryPosition != -1) {
        if (!confirm(i18n.getString("alreadyCrypt")))
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


/*
    Function: cryptandsign
    Encrypt and sign the current data of the editor.
*/
function cryptandsign(){
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
    var keyIdList = choosePublicKey();

    if(keyIdList == null)
        return;

    // Needed for a sign
    var keyID = getSelfKey();
    if(keyID == null)
        return;

    var password = getPrivateKeyPassword();
    if(password == null)
        return;

    // We get the result
    var result = GPG.baseCryptAndSign(text, keyIdList,false,password, keyID);
    var crypttext = result.output;
    var sdOut2 = result.sdOut2;
    result = result.sdOut;

    // If the crypt failled
    if(result == "erreur") {
        // We alert the user
        alert(i18n.getString("cryptAndSignFailed") + sdOut2);
    }
    else if(result == "erreurPass") {
        // We alert the user
        eraseSavedPassword();
        alert(i18n.getString("cryptAndSignFailedPass"));
    }
    else {
        setSeletedText(crypttext);
    }

}

/*
    Function: dcrypt
    Decrypt the current data of the editor.
*/
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
        alert(i18n.getString("decryptFailed") + "\n\n" + sdOut2);
    }
    else {
        setSeletedText(crypttext);

        //If a vliad sign was found, infos about are in sdOut2
        if (result == "signValid")
        {
            infos = sdOut2.split(" ");

            var infos2 = "";
            for (var ii = 1; ii < infos.length; ++ii)
            {  infos2 = infos2 + infos[ii] + " ";}


            document.getElementById('dcryptsignresult').style.display = '';
            document.getElementById('dcryptsignresult').value = i18n.getString("validSignInCrypt") + " " + infos2;
        }
        else
        {
            document.getElementById('dcryptsignresult').style.display = 'none';
        }

    }
}

/*
    Function: sign
    Sign the current data of the editor.
*/
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

    var tryPosition = text.indexOf("-----BEGIN PGP SIGNED MESSAGE-----");

    if (tryPosition != -1) {
        if (!confirm(i18n.getString("alreadySign")))
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

/*
    Function: verify
    Verfiy signs of the current data of the editor.
*/
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

    var results = GPG.baseVerify(text);

    // For I18N
    var i18n = document.getElementById("firegpg-strings");

    if (results.length == 0) {
        alert(i18n.getString("noGPGData"));
        return;
    }
    else {

        if (results.length != 1)
            var resulttxt = results.length + i18n.getString("manyStrings") + "\n";
        else
            var resulttxt = "";

        for (var rid in results) {

            result = results[rid];

            if (result == "erreur")
                resulttxt += i18n.getString("verifFailed") + "\n";
            else if (result == "erreur_bad")
                    resulttxt += i18n.getString("verifFailed") + " (" + i18n.getString("falseSign") + ")\n";
            else if (result == "erreur_no_key")
                    resulttxt +=  i18n.getString("verifFailed") + " (" + i18n.getString("keyNotFound") + ")\n";
            else {
                var infos = result.split(" ");

                var infos2 = "";
                for (var ii = 1; ii < infos.length; ++ii)
                {  infos2 = infos2 + infos[ii] + " ";}

                resulttxt +=  i18n.getString("verifSuccess") + " " + infos2 + "\n";
            }

        }

        alert(resulttxt);
    }
}

/*
    Function: getSelectedText
    Return the current selected text of the editor. If nothing is selected, all text is returned.
*/
function getSelectedText()
{
        var value = document.getElementById('text').value;
	value = value.substring(document.getElementById('text').selectionStart,document.getElementById('text').selectionEnd)
        if (value == "")
                value = document.getElementById('text').value
        return value;
}

/*
    Function: setSeletedText
    Remplace the current selected text of the editor with the text in parameter. If nothing is selected, all text is remplaced.

    Parameters:
        text - The new text.
*/
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
