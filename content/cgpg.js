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

const NS_IPCSERVICE_CONTRACTID  = "@mozilla.org/process/ipc-service;1";
const NS_APPINFO_CONTRACTID = "@mozilla.org/xre/app-info;1";
const NS_PROCESSUTIL_CONTRACTID = "@mozilla.org/process/util;1";

const WINDOWS = "WINNT";
const FireGPG_OS = Components.classes[NS_APPINFO_CONTRACTID].getService(Components.interfaces.nsIXULRuntime).OS;;

// Return class, for return 2 or 3 informations in an object.
var GPGReturn = {
}

// Main class for access to GPG
var GPG = {
	/*
	* Function to sign a text.
	*/
	sign: function() {

		// For i18n
		var i18n = document.getElementById("firegpg-strings");

		var text = Selection.get();

		if (text == "")
		{
			alert(i18n.getString("noData"));
			return;
		}

		// Needed for a sign
		var password = getPrivateKeyPassword();
		var keyID = getSelfKey();

		if (password == "")
		{
			alert(i18n.getString("noPass"));
			return;
		}

		// We get the result
		var result = this.GPGAccess.sign(text, password, keyID);
		var crypttext = result.output;
		result = result.sdOut;

		// If the sign failled
		if(result.indexOf("SIG_CREATED") == "-1") {
			// We alert the user
			if(result.indexOf("BAD_PASSPHRASE") != "-1") {
				alert(i18n.getString("signFailedPassword"));
				eraseSavedPassword();
			}
			else
				alert(i18n.getString("signFailed"));
		} 
		else {
			// We test if the selection is editable :
			if(Selection.isEditable()) {	
				// If yes, we edit this selection with the new text
				Selection.set(crypttext);
			}
			else //Else, we show a windows with the result
				showText(crypttext);
		}
	},

	// Verify a signature
	verify: function() {

		// For I18N
		var i18n = document.getElementById("firegpg-strings");

		var text = Selection.get();

		if (text == "")
		{
			alert(i18n.getString("noData"));
			return;
		}

		
		result = this.baseVerify(text);

		// For I18N
		var i18n = document.getElementById("firegpg-strings");

		if (result == "noGpg")
		{
			alert(i18n.getString("noGPGData"));
			return;
		}
		else if (result == "erreur")
		{
			alert(i18n.getString("verifFailed"));
		}
		else
		{
	
			infos = result.split(" ");

			// Array contain :
			// [0] -> Id of the key
			// [1] -> Name of ovners'key		
			// [2] -> Comment of key	
			// [3] -> Email of ovners'key

			alert(i18n.getString("verifSuccess") + " " + infos[1] + " " + infos[2] + " " +  infos[3]);
		}
	},

	baseVerify: function(text) {

		//Verify GPG'data presence
		var firstPosition = text.indexOf("-----BEGIN PGP SIGNED MESSAGE-----");
		var lastPosition = text.indexOf("-----END PGP SIGNATURE-----");

		if (firstPosition == -1 || lastPosition == -1)
		{
			return "noGpg";
		}

		text = text.substring(firstPosition,lastPosition + ("-----END PGP SIGNATURE-----").length);

		// We get the result
		var result = this.GPGAccess.verify(text);

		// If check failled
		if(result.indexOf("GOODSIG") == "-1") {	
			return "erreur";
		}
		else {
			// If he work, we get informations of the Key
			var infos = result;

			infos = infos.substring(0,infos.indexOf("GOODSIG") + 8);
			infos = result.replace(infos, "");
			infos = infos.substring(0,infos.indexOf("GNUPG") - 2);
			
			return infos;
		}
	},

	/*
	 * List all keys.
	 *
	 * An object is returned :
	 *     object["key_id"] = "Name (name) <email>"
	 */
	listKeys: function(onlyPrivate) {
		var retour = new Array();
		var infos;
		
		// We get informations from GPG
		var result = this.GPGAccess.listkey(onlyPrivate);
		
		// Parsing
		var reg = new RegExp("[\n]+", "g");
		var list = result.split(reg);
		
		// var reg2=new RegExp("[:]+", "g");
		
		for (var i = 0; i < list.length; i++) {
			infos = new Array();
			infos = list[i].split(":");
		
			if(infos[0] == "pub" || infos[0] == "sec")
				retour[infos[4]] = infos[9] ;
		}
		
		return retour;
	},

	/*
	* Function to crypt a text.
	*/
	crypt: function() {
		
		// For i18n
		var i18n = document.getElementById("firegpg-strings");
		
		var text = Selection.get();

		if (text == "")
		{
			alert(i18n.getString("noData"));
			return;
		}
		
		// Needed for a crypt
		var keyID = choosePublicKey();

		if (keyID == "")
		{
			alert(i18n.getString("noKey"));
			return;
		}

		// We get the result
		var result = this.GPGAccess.crypt(text, keyID);
		var crypttext = result.output;
		result = result.sdOut;

		

		// If the crypt failled
		if(result.indexOf("END_ENCRYPTION") == "-1") {
			// We alert the user
				alert(i18n.getString("cryptFailed"));
		} 
		else {
			//We test is the selection in editable :
			if(Selection.isEditable())
			{	//If yes, we edit this selection with the new text
				Selection.set(crypttext);
			}
			else
			{	//Else, we show a windows with the result
				showText(crypttext);
			}
		}
	},

	/*
	* Function to decrypt a text.
	*/
	decrypt: function() {

		// For i18n
		var i18n = document.getElementById("firegpg-strings");

		var text = Selection.get();

		if (text == "")
		{
			alert(i18n.getString("noData"));
			return;
		}
	
		//Verify GPG'data presence
		var firstPosition = text.indexOf("-----BEGIN PGP MESSAGE-----");
		var lastPosition = text.indexOf("-----END PGP MESSAGE-----");

		if (firstPosition == -1 || lastPosition == -1)
		{
			alert(i18n.getString("noGPGData"));
			return;
		}

		text = text.substring(firstPosition,lastPosition + ("-----END PGP MESSAGE-----").length);


		// Needed for a decrypt
		var password = getPrivateKeyPassword();		

		if (password == "")
		{
			alert(i18n.getString("noPass"));
			return;
		}

		// We get the result
		var result = this.GPGAccess.decrypt(text,password);
		var crypttext = result.output;
		result = result.sdOut;


		
		// If the crypt failled
		if(result.indexOf("DECRYPTION_OKAY") == "-1") {
			// We alert the user
			if(result.indexOf("BAD_PASSPHRASE") != "-1")
			{
				alert(i18n.getString("decryptFailedPassword"));
				eraseSavedPassword();
			}
			else
				alert(i18n.getString("decryptFailed"));
		} 
		else {
			//We test is the selection in editable :
			if(Selection.isEditable())
			{	//If yes, we edit this selection with the new text
				Selection.set(crypttext);
			}
			else
			{	//Else, we show a windows with the result
				showText(crypttext);
			}
		}
	},

	selfTest: function() {

		// For i18n
		var i18n = document.getElementById("firegpg-strings");

		if (this.GPGAccess.selfTest() == false)
			alert(i18n.getString("selfTestFailled"));
			
	},

	/*
	* Function to import a public key.
	*/
	kimport: function() {
		
		// For i18n
		var i18n = document.getElementById("firegpg-strings");

		var text = Selection.get();

		if (text == "")
		{
			alert(i18n.getString("noData"));
			return;
		}

		var retour = this.baseKimport(text);

		if (retour == "noGPG")
		{
			alert(i18n.getString("noGPGData"));
			return;
		}
		else if (retour == "error")
		{
			alert(i18n.getString("importFailed"));
		}
		else if (retour == "ok")
		{
			alert(i18n.getString("importOk"));
		}
	
		
	},

	baseKimport: function(text) {

		//Verify GPG'data presence
		var firstPosition = text.indexOf("-----BEGIN PGP PUBLIC KEY BLOCK-----");
		var lastPosition = text.indexOf("-----END PGP PUBLIC KEY BLOCK-----");

		if (firstPosition == -1 || lastPosition == -1)
		{
			return "noGPG";
		}

		text = text.substring(firstPosition,lastPosition + ("-----END PGP PUBLIC KEY BLOCK-----").length);

		// We get the result
		var result = this.GPGAccess.kimport(text);

		
		// If the crypt failled
		if(result.indexOf("IMPORT_OK") == "-1") {
				return "error";
		} 
		else {
				return "ok";
		}

	}
};

// We load the good class for the OS
GPG.GPGAccess = (FireGPG_OS == WINDOWS) ? GPGWin : GPGLin;
GPG.GPGAccess.parent = GPG;

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
