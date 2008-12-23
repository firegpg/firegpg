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

/* DELETE THIS ? TODO
const NS_IPCSERVICE_CONTRACTID  = "@mozilla.org/process/ipc-service;1";
*/

/*
   Constants: FireGPG's actions results

   RESULT_SUCCESS - The operation was successfull or the signature is correct
   RESULT_CANCEL - The operation was canceled, for exemple the user click on cancel when his password is asked.
   RESULT_ERROR_UNKNOW - An unkonw error happend
   RESULT_ERROR_PASSWORD - The specified password was wrong.
   RESULT_ERROR_NO_DATA - There wasen't any text to do the operation
   RESULT_ERROR_ALREADY_SIGN - The text is already signed
   RESULT_ERROR_BAD_SIGN - The signature was bad
   RESULT_ERROR_NO_KEY - Impossible to verify the signature beacause there wasn't the public key in the keyring
   RESULT_ERROR_ALREADY_CRYPT - The text is already encrypted
   RESULT_ERROR_NO_GPG_DATA - The text is not a vlid PGP block
   RESULT_ERROR_INIT_FAILLED - There is a problem with GPG, impossible to execute the executable.

*/
const RESULT_SUCCESS = 0;
const RESULT_CANCEL = 1;
const RESULT_ERROR_UNKNOW = 2;
const RESULT_ERROR_PASSWORD = 3;
const RESULT_ERROR_NO_DATA = 4;
const RESULT_ERROR_ALREADY_SIGN = 5;
const RESULT_ERROR_BAD_SIGN = 5;
const RESULT_ERROR_NO_KEY = 6;
const RESULT_ERROR_ALREADY_CRYPT = 7;
const RESULT_ERROR_NO_GPG_DATA = 7;
const RESULT_ERROR_INIT_FAILLED = 8;


/*
    Function: GPGReturn

    This function return a basic object, with variable to return informations about a FireGPG's operation

    Returns:

        An object with this variables to null :

        result - The result of the action see <FireGPG's actions results>
        ouput - The output form GnuPG
        sdOut - The sdOut form GnuPG
        encrypted - The encrypted data with GnuPG
        decrypted - The decrypted data with GnuPG
        signed - The signed data with GnuPG
        signsresults - An array with <GPGReturn> data for each sign's result in the data.
        signresult - The sign result for the first sign (or the current sign if we're in the signsresults array)
        signresulttext - The message for the result of the test on the first sign (or the current sign if we're in the signsresults array)
        signresultuser - The username of the key of the first sign (or the current sign if we're in the signsresults array)
        signresultdate - The date of the first sign (or the current sign if we're in the signsresults array)
        keylist - An array of <GPGKey> with the key of the specified keyring (private or public)
        exported - The exported key with GnuPG
        messagetext - The message who is showed in the lasted alert (usefull when the silent mode is activated)

*/

function GPGReturn() {

    this.result = null;
    this.ouput = null;
    this.sdOut = null;
    this.encrypted = null;
    this.decrypted = null;
    this.signed = null;
    this.signsresults = null;
    this.signresult = null;
    this.signresulttext = null;
    this.signresultuser = null;
    this.signresultdate = null;
    this.keylist = null;
    this.exported  = null;
    this.messagetext = null;

}

/*
    Function: GPGKey

    This function return a basic object, who represent a PGP key

    Returns:

        An object with this variables to null :

        keyName - The key's name
        keyExpi - The key's expire date
        keyDate - The key's creation date (ou de la signature)
        keyId - The key's id
        subKeys - An array of <GPGKey> with the subkey of the key.
		expired - True if the key is expired
		revoked - True if the key is revoked
		keyTrust - Trust of the key

*/
function GPGKey() {
    this.keyName = null;
    this.keyExpi = null;
    this.keyDate = null;
    this.keyId = null;
    this.subKeys = new Array();
    this.signs = new Array();
	this.expired = false;
	this.revoked = false;
	this.keyTrust = null;
    this.fingerPrint = null;

}

/*
    Function: Sortage

    This is a function used to sort an array of <GPGKey> by the key name
    Use it like this : thearray.sort(Sortage)

    Parameters:
        a - Internal
        b - Internal

*/
function Sortage(a,b) {

    var x = a.keyName.toLowerCase();
    var y = b.keyName.toLowerCase();
    return ((x < y) ? -1 : ((x > y) ? 1 : 0));


    infosA = (a.keyName + " ").toLowerCase();
    infosB = (b.keyName + " ").toLowerCase();

    var i = 0;

    while(infosA[i] == infosB[i] && i < infosA.lenght)
        i++;

    if (infosA[i]<infosB[i]) return -1;

    if (a[i]==b[i]) return 0;

    return 1;
}

/*
   Class: FireGPG
   This is the main kernel for FireGPG, who give access to all GPG functions (sign, encrypt, ...)
*/
var FireGPG = {

    /*
        Function: sign
        Function to sign a text.

        Return a <GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to sign
            keyID - _Optional_, if not set use the default private key or ask the user. The private keyID used to sign.
            password - _Optional_, if not set ask the user.
            notClear - _Optional_, Do not make a clear sign
    */
    sign: function(silent, text, keyID, password, notClear) {

        var returnObject = new GPGReturn();

        if (silent == undefined)
            silent = false;

        if (notClear == undefined)
            notClear = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.selfTest(silent);

		if(gpgTest.result != RESULT_SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }


        if (text == undefined || text == null) {
            var autoSetMode = true;
            text = Selection.get();
        }

        if (text == "") {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");

            returnObject.result = RESULT_ERROR_NO_DATA;
			return returnObject;
		}

        var tryPosition = text.indexOf("-----BEGIN PGP SIGNED MESSAGE-----");

        if (tryPosition != -1) {
			if (!silent && !confirm(i18n.getString("alreadySign"))) {
                returnObject.result = RESULT_ERROR_ALREADY_SIGN;
                return returnObject;
            }
		}

		// Needed for a sign
		if (keyID == undefined || keyID == null) {
            keyID = getSelfKey();
        }

        if(keyID == null) {
            returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

		if (password == undefined || password == null) {
            password = getPrivateKeyPassword();
        }

		if(password == null) {
			returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

        // We get the result
		var result = this.GPGAccess.sign(text, password, keyID, notClear);

        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;

        if(result.sdOut.indexOf("BAD_PASSPHRASE") != -1) {

            if (!silent)
                alert(i18n.getString("signFailedPassword"));

            returnObject.messagetext = i18n.getString("signFailedPassword");

            eraseSavedPassword();

            returnObject.result = RESULT_ERROR_PASSWORD;
            return returnObject;
		}

		if(result.sdOut.indexOf("SIG_CREATED") == -1)
		{
			if (!silent)
                alert(i18n.getString("signFailed") + "\n" + result.sdOut);

            returnObject.messagetext = i18n.getString("signFailed" + "\n" + result.sdOut);
            eraseSavedPassword();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
		}


        if (autoSetMode) {
			// We test if the selection is editable :
			if(Selection.isEditable()) {
				// If yes, we edit this selection with the new text
				Selection.set(result.output);
			}
			else //Else, we show a windows with the result
				showText(result.output);
		}

        returnObject.signed = result.output;

        returnObject.result = RESULT_SUCCESS;
        return returnObject;

    },

    listSigns: function(key) {

        return this.listKeys(false,true,key);

    },

    /*
        Function: listKeys
        Who return a list of key in the keyring

        Return a <GPGReturn> object.

        Parameters:
            onlyPrivate - _Optional_, default to false. Set this to true to get only the private keys.

    */
	listKeys: function(onlyPrivate, allKeys, onlySignOfThisKey) {

        var returnObject = new GPGReturn();

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.selfTest();

		if(gpgTest.result != RESULT_SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }

		var infos;


        if (onlySignOfThisKey == undefined)
            var result = this.GPGAccess.listkey(onlyPrivate);
        else
            var result = this.GPGAccess.listsigns(onlySignOfThisKey);

		// We get informations from GPG
		result = EnigConvertGpgToUnicode(result.sdOut);

        returnObject.sdOut = result;

        returnObject.keylist = new Array();

        //If we have to check the olds keys

        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                       getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");
        var check_expi = false;
        try {
            check_expi = prefs.getBoolPref("hide_expired");
        } catch (e) { }

        var maintenant = new Date();
        maintenant = maintenant.getTime();

		// Parsing
		var reg = new RegExp("\r", "g");
		var result = result.replace(reg,"\n");
		var reg = new RegExp("\n\n", "g");
		var result = result.replace(reg,"\n");

		var reg = new RegExp("[\n]+", "g");
		var list = result.split(reg);

		// var reg2=new RegExp("[:]+", "g");


		for (var i = 0; i < list.length; i++) {
			var infos = new Array();

			try {
                infos = list[i].split(":");

				if (infos[1] == 'r' && allKeys != true) //Revoquée
					continue;

                if (infos[0] == "fpr") { //Fingerprint
                    returnObject.keylist[returnObject.keylist.length-1].fingerPrint = infos[9];
                }

                if (infos[0] != "sig")
                    lastObjectIsSignable = false;

                if (infos[0] == "pub" || infos[0] == "uid") {
                    lastObjectIsSignable = true;
                    lastObjectType = infos[0];
                }

                //4: key id. 9 = key name. 5: creation date, 6: expire date
                if(infos[0] == "pub" || infos[0] == "sec" || infos[0] == "uid" || (infos[0] == "sig" && lastObjectIsSignable && infos[4] != returnObject.keylist[returnObject.keylist.length-1].keyId) ) {

                    if (infos[0] == "uid") {

                        var keyId = infos[7];
                        var keyDate = "";
                        var keyExpi = "";
						var keyTrust = "-";

                    } else {
                        var keyId = infos[4];
                        var keyDate = infos[5];
                        var keyExpi = infos[6];
						var keyTrust = infos[8];
                    }

                    if (infos[0] == "sig")
                        keyTrust = infos[10];

                    var keyName = infos[9].replace(/\\e3A/g, ":");

                    var theKey = new GPGKey();

                    theKey.keyDate = keyDate;
                    theKey.keyExpi  = keyExpi;
                    theKey.keyId = keyId;
                    theKey.keyName = keyName;
					theKey.keyTrust = keyTrust;

					if (infos[1] == 'r')
						theKey.revoked = true;
					else
						theKey.revoked = false;


					var splited = keyExpi.split(new RegExp("-", "g"));

                    var tmp_date = new Date(splited[0],splited[1],splited[2]);

                    if(check_expi && allKeys != true && infos[0] != "sig")  {

                        if (isNaN(tmp_date.getTime()) || maintenant < tmp_date.getTime()) {

							theKey.expired = true;

							if (infos[0] == "uid")
								returnObject.keylist[returnObject.keylist.length-1].subKeys.push(theKey);
							else
								returnObject.keylist.push(theKey);

                        }

                    }  else {

                        if (isNaN(tmp_date.getTime()) || maintenant < tmp_date.getTime())
							theKey.expired = false;
						else
							theKey.expired = true;


                        if (infos[0] == "uid")
                            returnObject.keylist[returnObject.keylist.length-1].subKeys.push(theKey);
                        else if (infos[0] == "sig" && lastObjectType == "pub")
                            returnObject.keylist[returnObject.keylist.length-1].signs.push(theKey);
                        else if (infos[0] == "sig" && lastObjectType == "uid" )
                            returnObject.keylist[returnObject.keylist.length-1].subKeys[returnObject.keylist[returnObject.keylist.length-1].subKeys.length-1].signs.push(theKey); //On push la sign dans la dernier subkey de la dernière key. Et vous ça va la vie ?
                        else
                            returnObject.keylist.push(theKey);
                    }
                }
			} catch (e) { fireGPGDebug(e,'cgpg.listkeys',true);  }
		}

        // Sorts keys
        returnObject.keylist = returnObject.keylist.sort(Sortage);

        for (var i = 0; i < returnObject.keylist.length; i++)
            returnObject.keylist[i].subKeys = returnObject.keylist[i].subKeys.sort(Sortage);

        returnObject.result = RESULT_SUCCESS;

		return returnObject;
	},

    /*
        Function: kimport
        Function to import a sign.

        Return a <GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to import
    */
	kimport: function(silent, text) {

        var returnObject = new GPGReturn();

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.selfTest(silent);

		if(gpgTest.result != RESULT_SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }

        if (text == undefined || text == null)
            text = Selection.get();

        if (text == "") {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");

            returnObject.result = RESULT_ERROR_NO_DATA;
			return returnObject;
		}

        //Verify GPG'data presence
		var firstPosition = text.indexOf("-----BEGIN PGP PUBLIC KEY BLOCK-----");
		var lastPosition = text.indexOf("-----END PGP PUBLIC KEY BLOCK-----");

		if (firstPosition == -1 || lastPosition == -1) {
			if (!silent)
                alert(i18n.getString("noGPGData"));

            returnObject.messagetext = i18n.getString("noGPGData");
            returnObject.result = RESULT_ERROR_NO_GPG_DATA;
            return returnObject;
		}

        text = text.substring(firstPosition,lastPosition + ("-----END PGP PUBLIC KEY BLOCK-----").length);

		// We get the result
		var result = this.GPGAccess.kimport(text);

        returnObject.sdOut = result.sdOut;

        if (result.sdOut.indexOf("IMPORT_OK") == -1) {
            if (!silent)
                alert(i18n.getString("importFailed") + "\n" + result.sdOut);

            returnObject.messagetext = i18n.getString("importFailed")  + "\n" + result.sdOut;
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;

        } else {
            if (!silent)
                alert(i18n.getString("importOk"));

            returnObject.messagetext = i18n.getString("importOk");
            returnObject.result = RESULT_SUCCESS;
            return returnObject;
        }

	},


	/*
        Function: kexport
        Function to export a key

        Return a <GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            keyID - _Optional_, if not set use ask the user. The public keyID to export
    */
	kexport: function(silent, keyID) {
		var returnObject = new GPGReturn();

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.selfTest(silent);

		if(gpgTest.result != RESULT_SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }

		// Needed for a crypt
        if (keyID == undefined || keyID == null)
            keyID = choosePublicKey();


		if(keyID == null) {
            returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

        keyID = keyID[0];

        var result = this.GPGAccess.kexport(keyID);

        returnObject.sdOut = result.sdOut;

		if (result.sdOut == "") {

            if (!silent)
                alert(i18n.getString("exportFailed"));

            returnObject.messagetext = i18n.getString("exportFailed");
			returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
		}	else  {
                if (!silent)
                    showText(result.sdOut);

                returnObject.exported = result.sdOut;
                returnObject.result = RESULT_SUCCESS;
                return returnObject;
		}
	},

    /*
        Function: crypt
        Function to encrypt a text.

        Return a <GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to encrypt
            keyIdList - _Optional_, if not set ask the user. An array of recipients' keys' id to encrypt
            fromGpgAuth - _Optional_, Default to false. Internal
            binFileMode - _Optional_, Default to false. Set this to true if data isensn't  simple text.
            autoSelect - _Optional_, An array of recipients' keys' id to autoselect on the key's list selection.
            symetrical - _Optional_. Use symetrical encrypt
            password - _Optional_. The password for symetrical encryption.
    */
	crypt: function(silent, text, keyIdList, fromGpgAuth, binFileMode, autoSelect, symetrical, password) {

        var returnObject = new GPGReturn();

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.selfTest(silent);

		if(gpgTest.result != RESULT_SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }


        if (symetrical == null || symetrical == undefined)
            symetrical = false;

        if (text == undefined || text == null) {
            var autoSetMode = true;
            text = Selection.get();
        }

        if (text == "") {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");
            returnObject.result = RESULT_ERROR_NO_DATA;
			return returnObject;
		}

        var tryPosition = text.indexOf("-----BEGIN PGP MESSAGE-----");

        if (tryPosition != -1) {
			if (!silent && !confirm(i18n.getString("alreadyCrypt"))) {

                returnObject.result = RESULT_ERROR_ALREADY_CRYPT;
                return returnObject;
            }
		}

		// Needed for a sign
		if ((keyIdList == undefined || keyIdList == null) && !symetrical) {
            keyIdList = choosePublicKey(autoSelect);
        }

        if(keyIdList == null && !symetrical) {
            returnObject.result = RESULT_CANCEL;
            return returnObject;
        }


        if (symetrical) {


            if (password == undefined || password == null) {
                password = getPrivateKeyPassword(false,false,i18n.getString("symetricalPass") + ":", true);
            }

            if(password == null || password == "") {
                returnObject.result = RESULT_CANCEL;
                return returnObject;
            }

            var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	                           getService(Components.interfaces.nsIPrefService);

            prefs = prefs.getBranch("extensions.firegpg.");
            try {
                algo = prefs.getCharPref("symmetric_algo");
            } catch (e) {
                algo = "";
            }

        }

		// We get the result
        if (!symetrical)
            var result = this.GPGAccess.crypt(text, keyIdList,fromGpgAuth,binFileMode);
        else
            var result = this.GPGAccess.symetric(text, password, algo);


        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;


		if(result.sdOut.indexOf("END_ENCRYPTION") == -1)
		{
			if (!silent)
                alert(i18n.getString("cryptFailed") + "\n" + result.sdOut);

            eraseSavedPassword();
            returnObject.messagetext = i18n.getString("cryptFailed") + "\n" + result.sdOut;
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
		}


        if (autoSetMode) {
			// We test if the selection is editable :
			if(Selection.isEditable()) {
				// If yes, we edit this selection with the new text
				Selection.set(result.output);
			}
			else //Else, we show a windows with the result
				showText(result.output);
		}

        returnObject.encrypted = result.output;

        returnObject.result = RESULT_SUCCESS;
        return returnObject;


	},

    /*
        Function: cryptAndSign
        Function to encrypt and sign a text.

        Return a <GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to sign
            keyID - _Optional_, if not set use the default private key or ask the user. The private keyID used to sign.
            fromGpgAuth - _Optional_, Default to false. Internal
            password - _Optional_, if not set ask the user. The password of the private key.
            keyIdList - _Optional_, if not set ask the user. An array of recipients' keys' id to encrypt
            binFileMode - _Optional_, Default to false. Set this to true if data isensn't  simple text.
            autoSelect - _Optional_, An array of recipients' keys' id to autoselect on the key's list selection.
    */
    cryptAndSign: function(silent, text, keyIdList, fromGpgAuth, password, keyID, binFileMode, autoSelect ) {

        var returnObject = new GPGReturn();

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.selfTest(silent);

		if(gpgTest.result != RESULT_SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }


        if (text == undefined || text == null) {
            var autoSetMode = true;
            text = Selection.get();
        }

        if (text == "") {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");
            returnObject.result = RESULT_ERROR_NO_DATA;
			return returnObject;
		}

        var tryPosition = text.indexOf("-----BEGIN PGP MESSAGE-----");

        if (tryPosition != -1) {
			if (!silent && !confirm(i18n.getString("alreadyCrypt"))) {
                returnObject.result = RESULT_ERROR_ALREADY_CRYPT;
                return returnObject;
            }
		}

		// Needed for a sign
		if (keyIdList == undefined || keyIdList == null) {
            keyIdList = choosePublicKey(autoSelect);
        }

        if(keyIdList == null) {
            returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

        // Needed for a sign
		if (keyID == undefined || keyID == null) {
            keyID = getSelfKey();
        }

        if(keyID == null) {
            returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

		if (password == undefined || password == null) {
            password = getPrivateKeyPassword();
        }

		if(password == null) {
			returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

		// We get the result
		var result = this.GPGAccess.cryptAndSign(text, keyIdList,fromGpgAuth, password, keyID, binFileMode);


        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;


        if(result.sdOut.indexOf("BAD_PASSPHRASE") != -1)
		{
			if (!silent)
                alert(i18n.getString("cryptAndSignFailedPass"));

            eraseSavedPassword();
            returnObject.messagetext = i18n.getString("cryptAndSignFailedPass");
            returnObject.result = RESULT_ERROR_PASSWORD;
            return returnObject;
		}

		if(result.sdOut.indexOf("END_ENCRYPTION") == -1)
		{
			if (!silent)
                alert(i18n.getString("cryptAndSignFailed") + "\n" + result.sdOut);

            eraseSavedPassword();
            returnObject.messagetext = i18n.getString("cryptAndSignFailed") + "\n" + result.sdOut;
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
		}


        if (autoSetMode) {
			// We test if the selection is editable :
			if(Selection.isEditable()) {
				// If yes, we edit this selection with the new text
				Selection.set(result.output);
			}
			else //Else, we show a windows with the result
				showText(result.output);
		}

        returnObject.encrypted = result.output;

        returnObject.result = RESULT_SUCCESS;
        return returnObject;


	},

    /*
        Function: verify
        Function to verify signs in a text.

        Return a <GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to verify
    */
	verify: function(silent, text) {

        var returnObject = new GPGReturn();

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.selfTest(silent);

		if(gpgTest.result != RESULT_SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }


        if (text == undefined || text == null) {
            var autoSetMode = true;
            text = Selection.get();
        }

        if (text == "") {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");
            returnObject.result = RESULT_ERROR_NO_DATA;
			return returnObject;
		}

		var results = this.layers(text,0);

        returnObject.signsresults = results;

		// For I18N
		var i18n = document.getElementById("firegpg-strings");

		if (results.length == 0) {
			if (!silent)
                alert(i18n.getString("noGPGData"));

            returnObject.messagetext = i18n.getString("noGPGData");
            returnObject.result = RESULT_ERROR_NO_GPG_DATA;
			return returnObject;
		}
        else {

            if (results.length != 1)
                var resulttxt = results.length + ' ' + i18n.getString("manyStrings") + "\n";
            else
                var resulttxt = "";

            for (var rid in results) {

                result = results[rid];

                if (result.result == RESULT_ERROR_UNKNOW)
                    resulttxt += i18n.getString("verifFailed") + "\n";
                else if (result.result == RESULT_ERROR_BAD_SIGN)
                        resulttxt += i18n.getString("verifFailed") + " (" + i18n.getString("falseSign") + ")\n";
                else if (result.result == RESULT_ERROR_NO_KEY)
                        resulttxt +=  i18n.getString("verifFailed") + " (" + i18n.getString("keyNotFound") + ")\n";
                else {
                    resulttxt +=  i18n.getString("verifSuccess") + " " + result.signresulttext + "\n";
                }
            }

            if (!silent)
                alert(resulttxt);

            returnObject.signsresulttext = resulttxt;

            returnObject.signresult = results[0].result;
            returnObject.signresulttext = results[0].signresulttext;
            returnObject.signresultuser = results[0].signresultuser;
            returnObject.signresultdate = results[0].signresultdate;

            returnObject.result = RESULT_SUCCESS;

            return returnObject;

        }
	},

    /*
        Function: layers
        Find each layer of a test and verify it (resurcise function)

        Return an array of resultss <GPGReturn> object.

        Parameters:
            text - The text to verify
            layer - The current layer
            resultss - _Optional_. The current array who should be returned.
    */
    layers: function(text,layer, resultss) {
        var newline = new RegExp("\r","gi");
        text = text.replace(newline,"\n");
        text="\n" + text;

        var begintxt = "-----BEGIN PGP SIGNED MESSAGE-----";
        var midtxt = "-----BEGIN PGP SIGNATURE-----";
        var endtxt = "-----END PGP SIGNATURE-----";

        var division=0;



        if (resultss == undefined)
            resultss = new Array();


        var layerbegin = new RegExp("- " + begintxt,"gi");
        var layermid = new RegExp("- " + midtxt,"gi");
        var layerend = new RegExp("- " + endtxt,"gi");
        var begin = new RegExp("\n" + begintxt,"gi");
        var begin2 = new RegExp("\n" + midtxt,"gi");
        var end = new RegExp("\n" + endtxt,"gi");

        var firstPosition = 0;
        var lastPosition = 0;
        var divisiontxt = "";

        while(firstPosition!=-1 && lastPosition!=-1)
        {
                firstPosition = text.search(begin);
                firstPosition2 = text.search(begin2);
                lastPosition = text.search(end);

                if (firstPosition == -1 && firstPosition2 != -1)
                    firstPosition = 0;

                if( firstPosition!=-1 && lastPosition!=-1) {
                        division++;
                        var divisiontxt=text.substring(firstPosition,lastPosition+endtxt.length+1);
                        var tmpverifyresult = this.layerverify(divisiontxt,layer,division);
                        divisiontxt = divisiontxt.replace(begin,"");
                        divisiontxt = divisiontxt.replace(end,"");
                        divisiontxt = divisiontxt.replace(layerbegin,begintxt);
                        divisiontxt = divisiontxt.replace(layermid,midtxt);
                        divisiontxt = divisiontxt.replace(layerend,endtxt);

                        resultss[resultss.length] = tmpverifyresult;

                        resultss = this.layers(divisiontxt,layer+1, resultss);
                       //resultss = resultss.concat(subverif);

                        text=text.substring(lastPosition+endtxt.length);
                }
        }
        return resultss;
    },

    /*
        Function: layerverify
        Internal, verify a part of a test.

        Return a <GPGReturn> object.

        Parameters:
            text - The text to verify
            layer - The current layer
            division - The current layer level
    */
    layerverify: function(text,layer,division) {
        var returnObject = new GPGReturn();

        // We get the result
		var result = this.GPGAccess.verify(text);

        returnObject.sdOut = result.sdOut;

		// If check failled
		if(result.sdOut.indexOf("GOODSIG") == "-1") {

            returnObject.result = RESULT_ERROR_UNKNOW;

            if(result.sdOut.indexOf("BADSIG") != -1)
                returnObject.result = RESULT_ERROR_BAD_SIGN;

            if(result.sdOut.indexOf("NO_PUBKEY") != -1) {
                returnObject.result = RESULT_ERROR_NO_KEY;

				idOfMissingKey = result.sdOut.substring(result.sdOut.indexOf("NO_PUBKEY") + 10);
				idOfMissingKey += "\n";

				idOfMissingKey = idOfMissingKey.substring(0,idOfMissingKey.indexOf("\n"));

				if (confirm(document.getElementById('firegpg-strings').
                getString('autoFeetch') + ' (' + idOfMissingKey + ')')) {

					FireGPG.retriveKeyFromServer(idOfMissingKey);

					return this.layerverify(text,layer,division);

				}

			}

		} else {
			// If he work, we get informations of the Key
			var infos = result.sdOut;

            infos2 = infos.substring(0,infos.indexOf("SIG_ID") + 7);

			infos2 = result.sdOut.replace(infos2, "");

			infos2 = infos2.substring(0,infos2.indexOf("GNUPG") - 2);

            infos2 = infos2.split(" ");

            infos2 = infos2[infos2.length -1];

            var date = new Date();

            date.setTime(infos2 * 1000);

			infos = infos.substring(0,infos.indexOf("GOODSIG") + 8);
			infos = result.sdOut.replace(infos, "");
			infos = infos.replace("\r", "\n");
			infos = infos.substring(0,infos.indexOf("\n"));

            var i18n = document.getElementById("firegpg-strings");

            returnObject.result = RESULT_SUCCESS;

            var infos2 = "";
            infos = infos.split(" ");
            for (var ii = 1; ii < infos.length; ++ii)
                infos2 = infos2 + infos[ii] + " ";


            returnObject.signresulttext = infos2 + " (" + i18n.getString("signMadeThe") + " " + date.toLocaleString() + ")";
            returnObject.signresultuser = infos2 ;
            returnObject.signresultdate = date.toLocaleString();

		}

        return returnObject;

    },

    /*
        Function: decrypt
        Function to decrypt a text.

        Return a <GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to decrypt.
            password - _Optional_, if not set ask the user. The password of the key used to encrypt the data.
    */
	decrypt: function(silent, text, password) { try {
		var returnObject = new GPGReturn();

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.selfTest(silent);

		if(gpgTest.result != RESULT_SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }


        if (text == undefined || text == null) {
            var autoSetMode = true;
            text = Selection.get();
        }

        if (text == "") {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");
            returnObject.result = RESULT_ERROR_NO_DATA;
			return returnObject;
		}

		//Verify GPG'data presence
		var reg=new RegExp("\\- \\-\\-\\-\\-\\-BEGIN PGP MESSAGE\\-\\-\\-\\-\\-", "gi"); // We don't have to detect disabled balises
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
			if (!silent)
                alert(i18n.getString("noGPGData"));

            returnObject.messagetext = i18n.getString("noGPGData");
            returnObject.result = RESULT_ERROR_NO_GPG_DATA;
            return returnObject;
		}

		text = text.substring(firstPosition,lastPosition + ("-----END PGP MESSAGE-----").length);

		// Needed for a decrypt
		if (password == undefined || password == null) {
                password = getsavedPassword();
                if (password == null)
                    password = "wrongPass";
        }

		if(password == null) {
			returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

		// We get the result
		var result = this.GPGAccess.decrypt(text,password);

        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;

        if(result.sdOut.indexOf("BAD_PASSPHRASE") != -1 || result.sdOut.indexOf("NEED_PASSPHRASE_SYM") != -1) {

            if (result.sdOut.indexOf("NEED_PASSPHRASE_SYM") != -1)
                password = getPrivateKeyPassword(false, false,i18n.getString("symetricalPass") + ":", true);
            else
                password = getPrivateKeyPassword();

            if(password == null) {
                returnObject.result = RESULT_CANCEL;
                return returnObject;
            }

            // We get the result
            var result = this.GPGAccess.decrypt(text,password);

            returnObject.sdOut = result.sdOut;
            returnObject.output = result.output;

        }

        if(result.sdOut.indexOf("BAD_PASSPHRASE") != -1) {

            if (!silent)
                alert(i18n.getString("decryptFailedPassword"));

            eraseSavedPassword();
            returnObject.messagetext = i18n.getString("decryptFailedPassword");
            returnObject.result = RESULT_ERROR_PASSWORD;
            return returnObject;
		}


        if(result.sdOut.indexOf("DECRYPTION_OKAY") == -1 && result.sdOut.indexOf("PLAINTEXT") == -1)	{
			if (!silent)
                alert(i18n.getString("decryptFailed") + "\n" + result.sdOut);

            returnObject.messagetext = i18n.getString("decryptFailed") + "\n" + result.sdOut;
            returnObject.result = RESULT_ERROR_UNKNOW;
            eraseSavedPassword();
            return returnObject;
		}


        //Il y avait une signature dans le truc //TODO: detect bad signs.
		if(result.sdOut.indexOf("GOODSIG") != -1) {

            infos2 = result.sdOut.substring(0,result.sdOut.indexOf("SIG_ID") + 7);

			infos2 = result.sdOut.replace(infos2, "");

			infos2 = infos2.substring(0,infos2.indexOf("GNUPG") - 2);

            infos2 = infos2.split(" ");

            infos2 = infos2[infos2.length -1];


            var date = new Date();

            date.setTime(infos2 * 1000);

			var infos = result.sdOut;
			infos = infos.substring(0,infos.indexOf("GOODSIG") + 8);
			infos = result.sdOut.replace(infos, "");
			infos = infos.substring(0,infos.indexOf("GNUPG") - 2);

            infos = infos.split(" ");
            infos2 = "";
            for (var ii = 1; ii < infos.length; ++ii)
                infos2 = infos2 + infos[ii] + " ";

            returnObject.signresult = RESULT_SUCCESS;
            returnObject.signresulttext = infos2 + " (" + i18n.getString("signMadeThe") + " " + date.toLocaleString() + ")";
            returnObject.signresultuser = infos2;
            returnObject.signresultdate = date.toLocaleString();

		}


        if (autoSetMode) {
            //We test is the selection in editable :
            if(Selection.isEditable()) {
                //If yes, we edit this selection with the new text
                Selection.set(result.output,returnObject.signresulttext);
            }  else {
                //Else, we show a windows with the result
                showText(result.output,undefined,undefined,undefined,returnObject.signresulttext);
            }
        }

        returnObject.decrypted = result.output;

        returnObject.result = RESULT_SUCCESS;
        return returnObject;
    } catch (e) { alert(e) }
	},



    /*
        Function: initGPGACCESS
        Init the GPGAccess class (try to found the GnuPG's command, etc.).
    */
	initGPGACCESS: function() {
		if(this.allreadyinit != undefined && this.allreadyinit == true)
			return;

		//Find the right command for Gpg
		this.GPGAccess.tryToFoundTheRightCommand();

		useGPGAgent = this.GPGAccess.runATest('--no-use-agent');
		useGPGTrust = this.GPGAccess.runATest('--trust-model always');

		this.allreadyinit = true;
	},



    /*
        Function: selfTest
        This if are able to access to a GnuPG executable

        Return a <GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
    */
	selfTest: function(silent) {
		this.initGPGACCESS();

        if (silent == undefined)
            silent = false;

		// For i18n
		var i18n = document.getElementById("firegpg-strings");

		if (this.GPGAccess.selfTest() == false) {
			if (!silent)
                alert(i18n.getString("selfTestFailled"));

            var returnObject = new GPGReturn();
            returnObject.messagetext = i18n.getString("selfTestFailled");
            returnObject.result = RESULT_ERROR_INIT_FAILLED;
            return returnObject;
		}

        var returnObject = new GPGReturn();
        returnObject.result = RESULT_SUCCESS;
        return returnObject;
	},

    searchKeyInServer: function(search, silent) {

		var returnObject = new GPGReturn();

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        //Boite d'attente
        var wait_box = window.open("chrome://firegpg/content/wait.xul", "waitBox", "chrome,centerscreen,resizable=0,minimizable=0,popup");
        wait_box.focus();
        //Boite pour attendre la boite d'attente
        var wait_box2 = window.open("chrome://firegpg/content/wait2.xul", "waitBox2", "chrome,centerscreen,resizable=0,minimizable=0,modal");

        // We get the result
        try {
		var result = this.GPGAccess.searchKeyInServer(search,getKeyServer());
        } catch (e) { } //To be sure to close the wait_box

        wait_box.close();

		// We get informations from GPG
		result = EnigConvertGpgToUnicode(result.sdOut);

        returnObject.sdOut = result;

        returnObject.keylist = new Array();

  		// Parsing
		var reg = new RegExp("\r", "g");
		var result = result.replace(reg,"\n");
		var reg = new RegExp("\n\n", "g");
		var result = result.replace(reg,"\n");

		var reg = new RegExp("[\n]+", "g");
		var list = result.split(reg);

		// var reg2=new RegExp("[:]+", "g");


		for (var i = 0; i < list.length; i++) {
			var infos = new Array();

			try {
                infos = list[i].split(":");

                //4: key id. 9 = key name. 5: creation date, 6: expire date
                if(infos[0] == "pub" || infos[0] == "sec" || infos[0] == "uid" ) {

                    if (infos[0] == "pub") {

                        var keyId = infos[1];
                        var keyDate = "";
                        var keyExpi = "";
						var keyName = "";

                    } else {
                        var keyId = returnObject.keylist[returnObject.keylist.length-1].keyId; //Id du papa
                        var keyDate = infos[2];
                        var keyExpi = infos[9];
						var keyName = infos[1].replace(/\\e3A/g, ":");

                    	var tmp_date = new Date();
						tmp_date.setTime(keyDate*1000);

						keyDate = tmp_date.getFullYear() + "-" + (tmp_date.getMonth()+1) + "-" + tmp_date.getDate();

                    }

                    var theKey = new GPGKey();

                    theKey.keyDate = keyDate;
                    theKey.keyExpi  = keyExpi;
                    theKey.keyId = keyId;
                    theKey.keyName = keyName;


					if (infos[0] == "uid") {
						returnObject.keylist[returnObject.keylist.length-1].subKeys.push(theKey);
						if (returnObject.keylist[returnObject.keylist.length-1].keyName == "") {
							returnObject.keylist[returnObject.keylist.length-1].keyName = theKey.keyName;
							returnObject.keylist[returnObject.keylist.length-1].keyDate = theKey.keyDate;

						}

					}
					else
						returnObject.keylist.push(theKey);


                }
			} catch (e) { fireGPGDebug(e,'cgpg.searchKeyInServer',true);  }
		}

        // Sorts keys
        returnObject.keylist.sort(Sortage);

        for (var i = 0; i < returnObject.keylist.length; i++)
            returnObject.keylist[i].subKeys.sort(Sortage);

        returnObject.result = RESULT_SUCCESS;

		return returnObject;

        /*if (result.sdOut.indexOf('IMPORT_OK') > 0) {

            if (!silent)
                alert(document.getElementById('firegpg-strings').
                getString('keyRecived'));

            var returnObject = new GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = RESULT_SUCCESS;
            return returnObject;

        } else {

            if (!silent)
                alert(document.getElementById('firegpg-strings').
                getString('keyFetchError'));

            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }*/

    },

    retriveKeyFromServer: function(keyId, silent) {


        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        //Boite d'attente
        var wait_box = window.open("chrome://firegpg/content/wait.xul", "waitBox", "chrome,centerscreen,resizable=0,minimizable=0,popup");
        wait_box.focus();
        //Boite pour attendre la boite d'attente
        var wait_box2 = window.open("chrome://firegpg/content/wait2.xul", "waitBox2", "chrome,centerscreen,resizable=0,minimizable=0,modal");

        // We get the result
        try {
		var result = this.GPGAccess.retriveKeyFromServer(keyId,getKeyServer());
        } catch (e) { } //To be sure to close the wait_box

        wait_box.close();


        if (result.sdOut.indexOf('IMPORT_OK') > 0) {

            if (!silent)
                alert(document.getElementById('firegpg-strings').
                getString('keyRecived'));

            var returnObject = new GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = RESULT_SUCCESS;
            return returnObject;

        } else {

            if (!silent)
                alert(document.getElementById('firegpg-strings').
                getString('keyFetchError'));

            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }


    },

    sendKeyToServer: function(keyId, silent) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        //Boite d'attente
        var wait_box = window.open("chrome://firegpg/content/wait.xul", "waitBox", "chrome,centerscreen,resizable=0,minimizable=0,popup");
        wait_box.focus();
        //Boite pour attendre la boite d'attente
        var wait_box2 = window.open("chrome://firegpg/content/wait2.xul", "waitBox2", "chrome,centerscreen,resizable=0,minimizable=0,modal");

        // We get the result
        try {
		var result = this.GPGAccess.sendKeyToServer(keyId,getKeyServer());
        } catch (e) { } //To be sure to close the wait_box

        wait_box.close();


        if (result.sdOut) {

            if (!silent)
                alert(result.sdOut);

            var returnObject = new GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = RESULT_SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('unknow-error'));


            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }


    },

    refreshKeysFromServer: function(silent) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        //Boite d'attente
        var wait_box = window.open("chrome://firegpg/content/wait.xul", "waitBox", "chrome,centerscreen,resizable=0,minimizable=0,popup");
        wait_box.focus();
        //Boite pour attendre la boite d'attente
        var wait_box2 = window.open("chrome://firegpg/content/wait2.xul", "waitBox2", "chrome,centerscreen,resizable=0,minimizable=0,modal");



        // We get the result
        try {
		var result = this.GPGAccess.refrechFromServer(getKeyServer());
        } catch (e) { } //To be sure to close the wait_box

        wait_box.close();


        if (result.sdOut) {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('keySync'));

            var returnObject = new GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = RESULT_SUCCESS;
            return returnObject;

        } else {
            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }

    },

	changeTrust: function(silent, key, trustLevel) {



        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();


        // We get the result
		var result = this.GPGAccess.changeTrust(key, trustLevel);


        if (result.sdOut) {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('trustChanged'));

            var returnObject = new GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = RESULT_SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('unknow-error'));



            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }

		//
	},


    changePassword: function(silent, key, oldpass, newpass) {

        var i18n = document.getElementById("firegpg-strings");

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        if (oldpass == undefined) {

            oldpass = getPrivateKeyPassword(false, false, i18n.getString("oldPassword"), true);

            if(oldpass == null) {
                var returnObject = new GPGReturn();
                returnObject.result = RESULT_CANCEL;
                return returnObject;
            }

        }

        if (newpass == undefined) {

            newpass = getPrivateKeyPassword(false, false, i18n.getString("newPassword"), true);
            newpass2 = getPrivateKeyPassword(false, false, i18n.getString("newPassword2"), false);

            if(newpass == null) {
                var returnObject = new GPGReturn();
                returnObject.result = RESULT_CANCEL;
                return returnObject;
            }

            if(newpass != newpass2) {

                 if (!silent)
                    alert(i18n.getString("changeFailledPasswordDiff"));

                var returnObject = new GPGReturn();
                returnObject.result = RESULT_CANCEL;
                return returnObject;
            }
        }


        // We get the result
		var result = this.GPGAccess.changePassword(key,  oldpass, newpass);

        if(result.sdOut.indexOf("BAD_PASSPHRASE") != -1) {

            if (!silent)
                alert(i18n.getString("changeFailledPassword"));

            returnObject.messagetext = i18n.getString("changeFailledPassword");

            eraseSavedPassword();

            returnObject.result = RESULT_ERROR_PASSWORD;
            return returnObject;
		}

        //On assume que c'est ok

        if(!silent)
            alert(document.getElementById('firegpg-strings').getString('passChanged'));

        var returnObject = new GPGReturn();
        returnObject.sdOut = result.sdOut;
        returnObject.result = RESULT_SUCCESS;
        return returnObject;


		//
	},

    generateKey: function(silent, name, email, comment, password1, password2, keyneverexpire, keyexpirevalue, keyexpiretype, keylength, keytype) {

        var i18n = document.getElementById("firegpg-strings");

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

         if (name == "") {
            if(!silent)
                alert(i18n.getString("need-name"));

            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }

        if (email == "") {
            if(!silent)
                alert(i18n.getString("need-email"));
            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }

        if (password1 == "") {
            if(!silent)
                alert(i18n.getString("need-password"));
            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }

        if (password1 != password2) {
            if(!silent)
                alert(i18n.getString("changeFailledPasswordDiff"));
            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }

        if (!keyneverexpire) {

            if (keyexpirevalue <= 0) {
                if(!silent)
                    alert(i18n.getString("need-expire-date"));
                var returnObject = new GPGReturn();
                returnObject.result = RESULT_ERROR_UNKNOW;
                return returnObject;

            }

        }

        var result = this.GPGAccess.genereateKey(name, email, comment, password1, keyneverexpire, keyexpirevalue, keyexpiretype, keylength, keytype);

        if (result.sdOut.indexOf("KEY_CREATED") != -1) {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('keygenerated'));

            var returnObject = new GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = RESULT_SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('unknow-error'));

            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }

    },

    deleteKey: function(silent, key) {



        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();


        // We get the result
		var result = this.GPGAccess.deleteKey(key);

        //Assume it's worked (no error message)
        if(!silent)
            alert(document.getElementById('firegpg-strings').getString('key-deleted'));

        var returnObject = new GPGReturn();
        returnObject.sdOut = result.sdOut;
        returnObject.result = RESULT_SUCCESS;
        return returnObject;

	},

    revokeKey: function (silent, key, raison, password) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        if (password == undefined || password == null) {
            password = getPrivateKeyPassword(false);
        }

		if(password == null) {
			returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

        // We get the result
		var result = this.GPGAccess.revokeKey(key, password, raison);

        if (result.sdOut.indexOf("GOOD_PASSPHRASE") != -1) {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('keyrevoked'));

            var returnObject = new GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = RESULT_SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('keynotrevokedpassword'));

            eraseSavedPassword();

            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }


    },

    addUid: function (silent, key, name, email, comment, password) {

        if (silent == undefined)
            silent = false;


        if (name == undefined || name == null) {
//
            name = prompt(document.getElementById('firegpg-strings').getString('entername'));
        }

        if(name == null || name.length < 5) {

            if (!silent)
                alert(document.getElementById('firegpg-strings').getString('nameTooShort'));

			returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

        if (email == undefined || email == null) {
            email = prompt(document.getElementById('firegpg-strings').getString('enteremail'));
        }

        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        if(email == null || !filter.test(email)) {

            if (!silent)
                alert(document.getElementById('firegpg-strings').getString('wrongEmail'));

			returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

        if (comment == undefined || comment == null) {
            comment = prompt(document.getElementById('firegpg-strings').getString('entercomment'));
        }


         this.initGPGACCESS();

        if (password == undefined || password == null) {
            password = getPrivateKeyPassword(false);
        }

		if(password == null) {
			returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

        var result = this.GPGAccess.addUid(key, name, email, comment, password);

        if (result.sdOut.indexOf("GOOD_PASSPHRASE") != -1) {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('uidadded'));

            var returnObject = new GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = RESULT_SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('uidnotadded'));

            eraseSavedPassword();

            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }
    },

    revokeUid: function (silent, key, uid, password) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        if (password == undefined || password == null) {
            password = getPrivateKeyPassword(false);
        }

		if(password == null) {
			returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

        // We get the result
		var result = this.GPGAccess.revokeUid(key, uid, password, 4);

        if (result.sdOut.indexOf("GOOD_PASSPHRASE") != -1) {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('uidrevoked'));

            var returnObject = new GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = RESULT_SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('uidnotrevokedpassword'));

            eraseSavedPassword();

            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }


    },


    delUid: function (silent, key, uid) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();


        // We get the result
		var result = this.GPGAccess.delUid(key, uid);

        //Assume it's worked
        if(!silent)
            alert(document.getElementById('firegpg-strings').getString('uiddeleted'));

        var returnObject = new GPGReturn();
        returnObject.sdOut = result.sdOut;
        returnObject.result = RESULT_SUCCESS;
        return returnObject;




    },

    signKey: function(silent, key, keyForSign, password) {


        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        // Needed for a sign
		if (keyForSign == undefined || keyForSign == null) {
            keyForSign = getSelfKey();
        }

        if(keyForSign == null) {
            returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

		if (password == undefined || password == null) {
            password = getPrivateKeyPassword();
        }

		if(password == null) {
			returnObject.result = RESULT_CANCEL;
            return returnObject;
        }


        // We get the result
		var result = this.GPGAccess.signKey(key, keyForSign, password);

        ///
        if (result.sdOut.indexOf("ALREADY_SIGNED") != -1) {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('erroralreadysigned'));

            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;


        }
        else if (result.sdOut.indexOf("GOOD_PASSPHRASE") != -1) {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('okkeysigned'));

            var returnObject = new GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = RESULT_SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('errorkeynosignedpassword'));

            eraseSavedPassword();

            var returnObject = new GPGReturn();
            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
        }


    }

}
var okWait;

// We load the good class for the OS
FireGPG.GPGAccess = Witch_GPGAccess();
FireGPG.GPGAccess.parent = FireGPG;

//Test if we have to show the 'what is new ?'
//We wait 3 sec.
setTimeout("testIfSomethingsIsNew()",3000);


// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
