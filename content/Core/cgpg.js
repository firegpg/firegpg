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

Contributor(s):

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

***** END LICENSE BLOCK *****

*/

if (typeof(FireGPG)=='undefined') { FireGPG = {}; }
if (typeof(FireGPG.Const)=='undefined') { FireGPG.Const = {}; }


/*
   Constants: FireGPG's actions results

   FireGPG.Const.Results.SUCCESS - The operation was successfull or the signature is correct
   FireGPG.Const.Results.CANCEL - The operation was canceled, for exemple the user click on cancel when his password is asked.
   FireGPG.Const.Results.ERROR_UNKNOW - An unkonw error happend
   FireGPG.Const.Results.ERROR_PASSWORD - The specified password was wrong.
   FireGPG.Const.Results.ERROR_NO_DATA - There wasen't any text to do the operation
   FireGPG.Const.Results.ERROR_ALREADY_SIGN - The text is already signed
   FireGPG.Const.Results.ERROR_BAD_SIGN - The signature was bad
   FireGPG.Const.Results.ERROR_NO_KEY - Impossible to verify the signature beacause there wasn't the public key in the keyring
   FireGPG.Const.Results.ERROR_ALREADY_CRYPT - The text is already encrypted
   FireGPG.Const.Results.ERROR_NO_GPG_DATA - The text is not a vlid PGP block
   FireGPG.Const.Results.ERROR_INIT_FAILLED - There is a problem with GPG, impossible to execute the executable.

*/

FireGPG.Const.Results = {
    SUCCESS: 0,
    CANCEL: 1,
    ERROR_UNKNOW: 2,
    ERROR_PASSWORD: 3,
    ERROR_NO_DATA: 4,
    ERROR_ALREADY_SIGN: 5,
    ERROR_BAD_SIGN: 5,
    ERROR_NO_KEY: 6,
    ERROR_ALREADY_CRYPT: 7,
    ERROR_NO_GPG_DATA: 7,
    ERROR_INIT_FAILLED: 8
}

/*
    Function: FireGPG.GPGReturn

    This function return a basic object, with variable to return informations about a FireGPG's operation

    Returns:

        An object with this variables to null :

        result - The result of the action see <FireGPG's actions results>
        ouput - The output form GnuPG
        sdOut - The sdOut form GnuPG
        encrypted - The encrypted data with GnuPG
        decrypted - The decrypted data with GnuPG
        signed - The signed data with GnuPG
        signsresults - An array with <FireGPG.GPGReturn> data for each sign's result in the data.
        signresult - The sign result for the first sign (or the current sign if we're in the signsresults array)
        signresulttext - The message for the result of the test on the first sign (or the current sign if we're in the signsresults array)
        signresultuser - The username of the key of the first sign (or the current sign if we're in the signsresults array)
        signresultdate - The date of the first sign (or the current sign if we're in the signsresults array)
        keylist - An array of <FireGPG.GPGKey> with the key of the specified keyring (private or public)
        exported - The exported key with GnuPG
        messagetext - The message who is showed in the lasted alert (usefull when the silent mode is activated)

*/

FireGPG.GPGReturn = function() {

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
    Function: FireGPG.GPGKey

    This function return a basic object, who represent a PGP key

    Returns:

        An object with this variables to null :

        keyName - The key's name
        keyExpi - The key's expire date
        keyDate - The key's creation date (ou de la signature)
        keyId - The key's id
        subKeys - An array of <FireGPG.GPGKey> with the subkey of the key.
		expired - True if the key is expired
		revoked - True if the key is revoked
		keyTrust - Trust of the key
		fingerPrint - The fingerprint of the ey

*/
FireGPG.GPGKey = function() {
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
    Function: FireGPG.Sortage

    This is a function used to sort an array of <FireGPG.GPGKey> by the key name
    Use it like this : thearray.sort(Sortage)

    Parameters:
        a - Internal
        b - Internal

*/
FireGPG.Sortage = function(a,b) {

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
FireGPG.Core = {

    /*
        Function: sign
        Function to sign a text.

        Return a <FireGPG.GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to sign
            keyID - _Optional_, if not set use the default private key or ask the user. The private keyID used to sign.
            password - _Optional_, if not set ask the user.
            notClear - _Optional_, Do not make a clear sign
            autoSelectPrivate - _Optional_. List of private key to preselect
            wrap - _Optional_. Wrap signed text
            fileMode - _Optional_. Indicate the user want to sign a file
            fileFrom - _Optional_. The file to sign
            fileTo - _Optional_. The file where to put the signature

    */
    sign: function(silent, text, keyID, password, notClear, autoSelectPrivate, wrap, fileMode, fileFrom, fileTo) {

        var returnObject = new FireGPG.GPGReturn();

        if (silent == undefined)
            silent = false;

        if (notClear == undefined)
            notClear = false;

        if (wrap == undefined)
            wrap = false;


        if (fileMode == undefined)
            fileMode = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        if (fileMode) {

            if (fileFrom == undefined) {

                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"]
                      .createInstance(nsIFilePicker);

                fp.init(window, i18n.getString('sourceFile'), nsIFilePicker.modeOpen);
                fp.appendFilters(nsIFilePicker.filterAll);

                if (fp.show() != nsIFilePicker.returnOK) { //L'utilisateur annule
                    fileFrom = null;
                } else {
                    fileFrom = fp.file.path;
                }

                if (fileFrom == null | fileFrom == '') {
                    returnObject.result = FireGPG.Const.Results.CANCEL;
                    return returnObject;
                }

            }

            if (fileTo == undefined) {

                if (!confirm(i18n.getString('signUseDefault'))) {


                    var nsIFilePicker = Components.interfaces.nsIFilePicker;
                    var fp = Components.classes["@mozilla.org/filepicker;1"]
                          .createInstance(nsIFilePicker);

                    fp.init(window, i18n.getString('destinationFile'), nsIFilePicker.modeSave);
                    fp.appendFilters(nsIFilePicker.filterAll);

                    done = false;

                    while(!done) {

                         if (fp.show() == nsIFilePicker.returnCancel ) { //L'utilisateur annule
                            fileTo = null;
                        } else {
                            fileTo = fp.file.path;
                        }

                        if (fileTo == fileFrom) {
                            alert( i18n.getString('formAndToSame'));
                        } else
                            done = true;

                    }


               } else {

                    fileTo = fileFrom + '.sig';
                    FireGPG.Misc.removeFile(fileTo); //If the already exist
               }

                if (fileTo == null | fileTo == '') {
                    returnObject.result = FireGPG.Const.Results.CANCEL;
                    return returnObject;
                }

                FireGPG.Misc.removeFile(fileTo);

            }
        }


        // GPG verification
        var gpgTest = FireGPG.Core.selfTest(silent);

		if(gpgTest.result != FireGPG.Const.Results.SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }


        if ((text == undefined || text == null) && !fileMode) {
            var autoSetMode = true;
            text = FireGPG.Selection.get();


            //Vu que c'est peut etre un webmail, on passe dans l'autowrap
            //text = FireGPG.AutoWrap.checkAndWrap(text);
            if (wrap)
                text = FireGPG.AutoWrap.wrap(text);

        }

        if (text == "" && !fileMode) {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");

            returnObject.result = FireGPG.Const.Results.ERROR_NO_DATA;
			return returnObject;
		}

        var tryPosition = text.indexOf("-----BEGIN PGP SIGNED MESSAGE-----");

        if (tryPosition != -1 && !fileMode) {
			if (!silent && !confirm(i18n.getString("alreadySign"))) {
                returnObject.result = FireGPG.Const.Results.ERROR_ALREADY_SIGN;
                return returnObject;
            }
		}

		// Needed for a sign
		if (keyID == undefined || keyID == null) {
            keyID = FireGPG.Misc.getSelfKey(autoSelectPrivate);
        }

        if(keyID == null) {
            returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

		if (!FireGPG.isGpgAgentActivated() && (password == undefined || password == null)) {
            password = FireGPG.Misc.getPrivateKeyPassword();
        }

		if(!FireGPG.isGpgAgentActivated() && password == null) {
			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

        // We get the result
		var result = this.FireGPGGPGAccess.sign(text, password, keyID, notClear, fileMode, fileFrom, fileTo);

        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;

        if(result.sdOut.indexOf("BAD_PASSPHRASE") != -1) {

            if (!silent)
                alert(i18n.getString("signFailedPassword"));

            returnObject.messagetext = i18n.getString("signFailedPassword");

            FireGPG.Misc.eraseSavedPassword();

            returnObject.result = FireGPG.Const.Results.ERROR_PASSWORD;
            return returnObject;
		}

		if(result.sdOut.indexOf("SIG_CREATED") == -1)
		{
			if (!silent)
                alert(i18n.getString("signFailed") + "\n" + result.sdOut);

            returnObject.messagetext = i18n.getString("signFailed" + "\n" + result.sdOut);
            FireGPG.Misc.eraseSavedPassword();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
		}


        if (autoSetMode) {
			// We test if the selection is editable :
			if(FireGPG.Selection.isEditable()) {
				// If yes, we edit this selection with the new text
				FireGPG.Selection.set(result.output);
			}
			else //Else, we show a windows with the result
				FireGPG.Misc.showText(result.output);
		}

        if (fileMode) {
            alert(i18n.getString("operationOnFileDone"));
        }

        returnObject.signed = result.output;

        returnObject.result = FireGPG.Const.Results.SUCCESS;
        return returnObject;

    },

    /*
        Function: listSigns
        List signatures of a key

        Parameters:
            key - The key
    */
    listSigns: function(key) {

        return this.listKeys(false,true,key);

    },

    /*
        Function: listKeys
        Who return a list of key in the keyring

        Return a <FireGPG.GPGReturn> object.

        Parameters:
            onlyPrivate - _Optional_, default to false. Set this to true to get only the private keys.
            allKeys - _Optional_. Return expired and revokey keys too
            onlySignOfThisKey - _Optional_. Return only signs of the key

    */
	listKeys: function(onlyPrivate, allKeys, onlySignOfThisKey) {

        var returnObject = new FireGPG.GPGReturn();

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.Core.selfTest();

		if(gpgTest.result != FireGPG.Const.Results.SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }

		var infos;


        if (onlySignOfThisKey == undefined)
            var result = this.FireGPGGPGAccess.listkey(onlyPrivate);
        else
            var result = this.FireGPGGPGAccess.listsigns(onlySignOfThisKey);

		// We get informations from GPG
		result = FireGPG.Misc.EnigConvertGpgToUnicode(result.sdOut);

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

                        tmpDate = new Date();

                        if (infos[5].indexOf('-') < 1) {
                            tmpDate.setTime(infos[5] * 1000);
                            var keyDate = tmpDate.getFullYear() +'-' + (tmpDate.getMonth() +1 )+ '-' +tmpDate.getDate();
                        } else {
                            var keyDate = infos[5];
                        }

                        if (infos[6] != "") {
                            tmpDate.setTime(infos[6] * 1000);
                            var keyExpi = tmpDate.getFullYear() +'-' + (tmpDate.getMonth() + 1) + '-' +tmpDate.getDate();
                        }
                        else
                            var keyExpi  = "";
						var keyTrust = infos[8];
                    }

                    if (infos[0] == "sig")
                        keyTrust = infos[10];

                    var keyName = infos[9].replace(/\\e3A/g, ":");

                    var theKey = new FireGPG.GPGKey();

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

							if (infos[0] == "uid") {
                                 if (returnObject.keylist[returnObject.keylist.length-1].keyName == "") //GPG2 !
                                    returnObject.keylist[returnObject.keylist.length-1].keyName = keyName;  //We don't push the key
								else
                                    returnObject.keylist[returnObject.keylist.length-1].subKeys.push(theKey);

                            }
							else
								returnObject.keylist.push(theKey);

                        }

                    }  else {

                        if (isNaN(tmp_date.getTime()) || maintenant < tmp_date.getTime())
							theKey.expired = false;
						else
							theKey.expired = true;

                        if (infos[0] == "uid") {
                            if (returnObject.keylist[returnObject.keylist.length-1].keyName == "") //GPG2 !
                                returnObject.keylist[returnObject.keylist.length-1].keyName = keyName; //We don't push the key
                            else
                                returnObject.keylist[returnObject.keylist.length-1].subKeys.push(theKey);

                        }
                        else if (infos[0] == "sig" && lastObjectType == "pub")
                            returnObject.keylist[returnObject.keylist.length-1].signs.push(theKey);
                        else if (infos[0] == "sig" && lastObjectType == "uid" )
                            returnObject.keylist[returnObject.keylist.length-1].subKeys[returnObject.keylist[returnObject.keylist.length-1].subKeys.length-1].signs.push(theKey); //On push la sign dans la dernier subkey de la dernière key. Et vous ça va la vie ?
                        else
                            returnObject.keylist.push(theKey);
                    }
                }
			} catch (e) { FireGPG.debug(e,'cgpg.listkeys',true);  }
		}

        // Sorts keys
        returnObject.keylist = returnObject.keylist.sort(FireGPG.Sortage);
        for (var i = 0; i < returnObject.keylist.length; i++)
            returnObject.keylist[i].subKeys = returnObject.keylist[i].subKeys.sort(FireGPG.Sortage);

        returnObject.result = FireGPG.Const.Results.SUCCESS;

		return returnObject;
	},

    /*
        Function: kimport
        Function to import a sign.

        Return a <FireGPG.GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to import
            passSecurity - _Optional_, let's user import anything (like private keys, booo)
    */
	kimport: function(silent, text, passSecurity) {

        var returnObject = new FireGPG.GPGReturn();

        if (silent == undefined)
            silent = false;

        if (passSecurity == undefined)
            passSecurity = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.Core.selfTest(silent);

		if(gpgTest.result != FireGPG.Const.Results.SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }

        if (text == undefined || text == null)
            text = FireGPG.Selection.get();

        if (text == "") {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");

            returnObject.result = FireGPG.Const.Results.ERROR_NO_DATA;
			return returnObject;
		}

        //Verify GPG'data presence
		var firstPosition = text.indexOf("-----BEGIN PGP PUBLIC KEY BLOCK-----");
		var lastPosition = text.indexOf("-----END PGP PUBLIC KEY BLOCK-----");

		if ((firstPosition == -1 || lastPosition == -1)  && !passSecurity) {
			if (!silent)
                alert(i18n.getString("noGPGData"));

            returnObject.messagetext = i18n.getString("noGPGData");
            returnObject.result = FireGPG.Const.Results.ERROR_NO_GPG_DATA;
            return returnObject;
		}

        if (!passSecurity)
            text = text.substring(firstPosition,lastPosition + ("-----END PGP PUBLIC KEY BLOCK-----").length);

		// We get the result
		var result = this.FireGPGGPGAccess.kimport(text);

        returnObject.sdOut = result.sdOut;

        if (result.sdOut.indexOf("IMPORT_OK") == -1) {
            if (!silent)
                alert(i18n.getString("importFailed") + "\n" + result.sdOut);

            returnObject.messagetext = i18n.getString("importFailed")  + "\n" + result.sdOut;
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;

        } else {
            if (!silent)
                alert(i18n.getString("importOk"));

            returnObject.messagetext = i18n.getString("importOk");
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;
        }

	},


	/*
        Function: kexport
        Function to export a key

        Return a <FireGPG.GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            keyID - _Optional_, if not set use ask the user. The public keyID to export
    */
	kexport: function(silent, keyID) {
		var returnObject = new FireGPG.GPGReturn();

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        // GPG verification
        var gpgTest = FireGPG.Core.selfTest(silent);

		if(gpgTest.result != FireGPG.Const.Results.SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }

		// Needed for a crypt
        if (keyID == undefined || keyID == null)
            keyID = FireGPG.Misc.choosePublicKey();


		if(keyID == null) {
            returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

        keyID = keyID[0];

        var result = this.FireGPGGPGAccess.kexport(keyID);

        returnObject.sdOut = result.sdOut;

		if (result.sdOut == "") {

            if (!silent)
                alert(i18n.getString("exportFailed"));

            returnObject.messagetext = i18n.getString("exportFailed");
			returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
		}	else  {
                if (!silent)
                    FireGPG.Misc.showText(result.sdOut);

                returnObject.exported = result.sdOut;
                returnObject.result = FireGPG.Const.Results.SUCCESS;
                return returnObject;
		}
	},

    /*
        Function: crypt
        Function to encrypt a text.

        Return a <FireGPG.GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to encrypt
            keyIdList - _Optional_, if not set ask the user. An array of recipients' keys' id to encrypt
            fromGpgAuth - _Optional_, Default to false. Internal
            binFileMode - _Optional_, Default to false. Set this to true if data isensn't  simple text.
            autoSelect - _Optional_, An array of recipients' keys' id to autoselect on the key's list selection.
            symetrical - _Optional_. Use symetrical encrypt
            password - _Optional_. The password for symetrical encryption.
            fileMode - _Optional_. Indicate the user want to encrypt a file
            fileFrom - _Optional_. The file to encrypt
            fileTo - _Optional_. The file where to put the encrypted content
    */
	crypt: function(silent, text, keyIdList, fromGpgAuth, binFileMode, autoSelect, symetrical, password, fileMode, fileFrom, fileTo) {

        var returnObject = new FireGPG.GPGReturn();

        if (silent == undefined)
            silent = false;

        if (fileMode == undefined)
            fileMode = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        if (fileMode) {

            if (fileFrom == undefined) {

                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"]
                      .createInstance(nsIFilePicker);

                fp.init(window, i18n.getString('sourceFile'), nsIFilePicker.modeOpen);
                fp.appendFilters(nsIFilePicker.filterAll);

                if (fp.show() != nsIFilePicker.returnOK) { //L'utilisateur annule
                    fileFrom = null;
                } else {
                    fileFrom = fp.file.path;
                }

                if (fileFrom == null | fileFrom == '') {
                    returnObject.result = FireGPG.Const.Results.CANCEL;
                    return returnObject;
                }

            }

            if (fileTo == undefined) { //Nb: il ne doit pas exister !


                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"]
                      .createInstance(nsIFilePicker);

                fp.init(window, i18n.getString('destinationFile'), nsIFilePicker.modeSave);
                fp.appendFilters(nsIFilePicker.filterAll);

                done = false;

                while(!done) {

                     if (fp.show() == nsIFilePicker.returnCancel ) { //L'utilisateur annule
                        fileTo = null;
                    } else {
                        fileTo = fp.file.path;
                    }

                    if (fileTo == fileFrom) {
                        alert( i18n.getString('formAndToSame'));
                    } else
                        done = true;

                }

                if (fileTo == null | fileTo == '') {
                    returnObject.result = FireGPG.Const.Results.CANCEL;
                    return returnObject;
                }

                FireGPG.Misc.removeFile(fileTo);

            }
        }

        // GPG verification
        var gpgTest = FireGPG.Core.selfTest(silent);

		if(gpgTest.result != FireGPG.Const.Results.SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }


        if (symetrical == null || symetrical == undefined)
            symetrical = false;

        if ((text == undefined || text == null)  && !fileMode) {
            var autoSetMode = true;
            text = FireGPG.Selection.get();
        }

        if (text == "" && !fileMode) {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");
            returnObject.result = FireGPG.Const.Results.ERROR_NO_DATA;
			return returnObject;
		}

        var tryPosition = text.indexOf("-----BEGIN PGP MESSAGE-----");

        if (tryPosition != -1 && !fileMode) {
			if (!silent && !confirm(i18n.getString("alreadyCrypt"))) {

                returnObject.result = FireGPG.Const.Results.ERROR_ALREADY_CRYPT;
                return returnObject;
            }
		}

		// Needed for a sign
		if ((keyIdList == undefined || keyIdList == null) && !symetrical) {
            keyIdList = FireGPG.Misc.choosePublicKey(autoSelect);
        }

        if(keyIdList == null && !symetrical) {
            returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }


        if (symetrical) {


            if (password == undefined || password == null) {
                password = FireGPG.Misc.getPrivateKeyPassword(false,false,i18n.getString("symetricalPass") + ":", true);

                password2 = FireGPG.Misc.getPrivateKeyPassword(false,false,i18n.getString("symetricalPass2") + ":", true);

                if (password2 != password) {

                    if (!silent)
                        alert(i18n.getString("differentPassword"));

                    returnObject.result = FireGPG.Const.Results.CANCEL;
                     return returnObject;
                }
            }

            if(password == null || password == "") {
                returnObject.result = FireGPG.Const.Results.CANCEL;
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
            var result = this.FireGPGGPGAccess.crypt(text, keyIdList,fromGpgAuth,binFileMode, fileMode, fileFrom, fileTo);
        else
            var result = this.FireGPGGPGAccess.symetric(text, password, algo, fileMode, fileFrom, fileTo);


        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;
		returnObject.keylist = result.keylist;
		returnObject.prikey_id = result.prikey_id;
		returnObject.subkey_id = result.subkey_id;


		if(result.sdOut.indexOf("END_ENCRYPTION") == -1)
		{
			if (!silent)
                alert(i18n.getString("cryptFailed") + "\n" + result.sdOut);

            FireGPG.Misc.eraseSavedPassword();
            returnObject.messagetext = i18n.getString("cryptFailed") + "\n" + result.sdOut;
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
		}


        if (autoSetMode) {
			// We test if the selection is editable :
			if(FireGPG.Selection.isEditable()) {
				// If yes, we edit this selection with the new text
				FireGPG.Selection.set(result.output);
			}
			else //Else, we show a windows with the result
				FireGPG.Misc.showText(result.output);
		}


        if (fileMode) {
            alert(i18n.getString("operationOnFileDone"));
        }

        returnObject.encrypted = result.output;

        returnObject.result = FireGPG.Const.Results.SUCCESS;
        return returnObject;


	},

    /*
        Function: cryptAndSign
        Function to encrypt and sign a text.

        Return a <FireGPG.GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to sign
            keyID - _Optional_, if not set use the default private key or ask the user. The private keyID used to sign.
            fromGpgAuth - _Optional_, Default to false. Internal
            password - _Optional_, if not set ask the user. The password of the private key.
            keyIdList - _Optional_, if not set ask the user. An array of recipients' keys' id to encrypt
            binFileMode - _Optional_, Default to false. Set this to true if data isensn't  simple text.
            autoSelect - _Optional_, An array of recipients' keys' id to autoselect on the key's list selection.
            autoSelect - _Optional_ An array of private key to autoselect on key's list selection.
            fileMode - _Optional_. Indicate the user want to encrypt&sign a file
            fileFrom - _Optional_. The file to sign
            fileTo - _Optional_. The file where to put the encrypted & signed file
    */
    cryptAndSign: function(silent, text, keyIdList, fromGpgAuth, password, keyID, binFileMode, autoSelect, autoSelectPrivate, fileMode, fileFrom, fileTo) {

        var returnObject = new FireGPG.GPGReturn();

        if (silent == undefined)
            silent = false;

        if (fileMode == undefined)
            fileMode = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        if (fileMode) {

            if (fileFrom == undefined) {

                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"]
                      .createInstance(nsIFilePicker);

                fp.init(window, i18n.getString('sourceFile'), nsIFilePicker.modeOpen);
                fp.appendFilters(nsIFilePicker.filterAll);

                if (fp.show() != nsIFilePicker.returnOK) { //L'utilisateur annule
                    fileFrom = null;
                } else {
                    fileFrom = fp.file.path;
                }

                if (fileFrom == null | fileFrom == '') {
                    returnObject.result = FireGPG.Const.Results.CANCEL;
                    return returnObject;
                }

            }

            if (fileTo == undefined) { //Nb: il ne doit pas exister !


                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"]
                      .createInstance(nsIFilePicker);

                fp.init(window, i18n.getString('destinationFile'), nsIFilePicker.modeSave);
                fp.appendFilters(nsIFilePicker.filterAll);

                done = false;

                while(!done) {

                     if (fp.show() == nsIFilePicker.returnCancel ) { //L'utilisateur annule
                        fileTo = null;
                    } else {
                        fileTo = fp.file.path;
                    }

                    if (fileTo == fileFrom) {
                        alert( i18n.getString('formAndToSame'));
                    } else
                        done = true;

                }

                if (fileTo == null | fileTo == '') {
                    returnObject.result = FireGPG.Const.Results.CANCEL;
                    return returnObject;
                }

                FireGPG.Misc.removeFile(fileTo);

            }
        }

        // GPG verification
        var gpgTest = FireGPG.Core.selfTest(silent);

		if(gpgTest.result != FireGPG.Const.Results.SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }


        if ((text == undefined || text == null) && !fileMode) {
            var autoSetMode = true;
            text = FireGPG.Selection.get();
        }

        if (text == "" && !fileMode) {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");
            returnObject.result = FireGPG.Const.Results.ERROR_NO_DATA;
			return returnObject;
		}

        var tryPosition = text.indexOf("-----BEGIN PGP MESSAGE-----");

        if (tryPosition != -1 && !fileMode) {
			if (!silent && !confirm(i18n.getString("alreadyCrypt"))) {
                returnObject.result = FireGPG.Const.Results.ERROR_ALREADY_CRYPT;
                return returnObject;
            }
		}

		// Needed for a sign
		if (keyIdList == undefined || keyIdList == null) {
            keyIdList = FireGPG.Misc.choosePublicKey(autoSelect);
        }

        if(keyIdList == null) {
            returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

        // Needed for a sign
		if (keyID == undefined || keyID == null) {
            keyID = FireGPG.Misc.getSelfKey(autoSelectPrivate);
        }

        if(keyID == null) {
            returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

		if (!FireGPG.isGpgAgentActivated() && (password == undefined || password == null)) {
            password = FireGPG.Misc.getPrivateKeyPassword();
        }

		if(!FireGPG.isGpgAgentActivated() &&password == null) {
			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

		// We get the result
		var result = this.FireGPGGPGAccess.cryptAndSign(text, keyIdList,fromGpgAuth, password, keyID, binFileMode, fileMode, fileFrom, fileTo);


        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;


        if(result.sdOut.indexOf("BAD_PASSPHRASE") != -1)
		{
			if (!silent)
                alert(i18n.getString("cryptAndSignFailedPass"));

            FireGPG.Misc.eraseSavedPassword();
            returnObject.messagetext = i18n.getString("cryptAndSignFailedPass");
            returnObject.result = FireGPG.Const.Results.ERROR_PASSWORD;
            return returnObject;
		}

		if(result.sdOut.indexOf("END_ENCRYPTION") == -1)
		{
			if (!silent)
                alert(i18n.getString("cryptAndSignFailed") + "\n" + result.sdOut);

            FireGPG.Misc.eraseSavedPassword();
            returnObject.messagetext = i18n.getString("cryptAndSignFailed") + "\n" + result.sdOut;
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
		}


        if (autoSetMode) {
			// We test if the selection is editable :
			if(FireGPG.Selection.isEditable()) {
				// If yes, we edit this selection with the new text
				FireGPG.Selection.set(result.output);
			}
			else //Else, we show a windows with the result
				FireGPG.Misc.showText(result.output);
		}


        if (fileMode) {
            alert(i18n.getString("operationOnFileDone"));
        }

        returnObject.encrypted = result.output;

        returnObject.result = FireGPG.Const.Results.SUCCESS;
        return returnObject;


	},

    /*
        Function: verify
        Function to verify signs in a text.

        Return a <FireGPG.GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to verify
            charset - _Optional_, the charset to use
            signData - Deprecated parameter.
            fileMode - _Optional_. Indicate the user want to verify the signature of a file
            fileFrom - _Optional_. The file to verify
            fileSig - _Optional_. The file with the signature
            fileDataForSign - _Optional_. The data with the signatur
            fromDTA - _Optional_. True if called form DTA
    */
	verify: function(silent, text, charset, signData, fileMode, fileFrom, fileSig, fileDataForSign, fromDTA) {

        var returnObject = new FireGPG.GPGReturn();

        if (silent == undefined)
            silent = false;

        if (fileMode == undefined)
            fileMode = false;

        if (fromDTA == undefined)
            fromDTA = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");


        if (fileMode) {

            if (fileFrom == undefined) {

                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"]
                      .createInstance(nsIFilePicker);

                fp.init(window, i18n.getString('sourceFile'), nsIFilePicker.modeOpen);
                fp.appendFilters(nsIFilePicker.filterAll);

                if (fp.show() != nsIFilePicker.returnOK) { //L'utilisateur annule
                    fileFrom = null;
                } else {
                    fileFrom = fp.file.path;
                }

                if (fileFrom == null | fileFrom == '') {
                    returnObject.result = FireGPG.Const.Results.CANCEL;
                    return returnObject;
                }

            }

            if (fileSig == undefined && fileDataForSign == undefined) {

                if (FireGPG.Misc.fileExist(fileFrom + '.sig')) {

                    if (confirm(i18n.getString('sigFoundSelectAFile'))) {

                        fileSig = fileFrom + '.sig';

                    }
                }
                if (fileSig == undefined) {

                        var nsIFilePicker = Components.interfaces.nsIFilePicker;
                        var fp = Components.classes["@mozilla.org/filepicker;1"]
                              .createInstance(nsIFilePicker);

                        fp.init(window, null, nsIFilePicker.modeOpen);
                        fp.appendFilters(nsIFilePicker.filterAll);


                        if (fp.show() != nsIFilePicker.returnOK    ) { //L'utilisateur annule
                            fileSig = null;
                        } else {
                            fileSig = fp.file.path;
                        }

                        if (fileSig == null | fileSig == '') {
                            returnObject.result = FireGPG.Const.Results.CANCEL;
                            return returnObject;
                        }


                }
            }
        }


        // GPG verification
        var gpgTest = FireGPG.Core.selfTest(silent);

		if(gpgTest.result != FireGPG.Const.Results.SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }


        if ((text == undefined || text == null) && !fileMode ) {
            var autoSetMode = true;
            text = FireGPG.Selection.get();
        }

        if (text == "" && !fileMode) {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");
            returnObject.result = FireGPG.Const.Results.ERROR_NO_DATA;
			return returnObject;
		}

        if (!fileMode)
            var results = this.layers(text,0, charset);
        else {

            results = new Array(this.layerverify(undefined,undefined,undefined, undefined,undefined, fileMode, fileFrom, fileSig, undefined, fileDataForSign, fromDTA));
        }

        returnObject.signsresults = results;

		// For I18N
		var i18n = document.getElementById("firegpg-strings");

		if (results.length == 0) {
			if (!silent)
                alert(i18n.getString("noGPGData"));

            returnObject.messagetext = i18n.getString("noGPGData");
            returnObject.result = FireGPG.Const.Results.ERROR_NO_GPG_DATA;
			return returnObject;
		}
        else {

            if (results.length != 1)
                var resulttxt = results.length + ' ' + i18n.getString("manyStrings") + "\n";
            else
                var resulttxt = "";

            for (var rid in results) {

                var result = results[rid];

                if (result.result == FireGPG.Const.Results.ERROR_UNKNOW)
                    resulttxt += i18n.getString("verifFailed") + "\n";
                else if (result.result == FireGPG.Const.Results.ERROR_BAD_SIGN)
                        resulttxt += i18n.getString("verifFailed") + " (" + i18n.getString("falseSign") + ")\n";
                else if (result.result == FireGPG.Const.Results.ERROR_NO_KEY)
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


            if (results[0].revoked)
                returnObject.revoked  = results[0].revoked;

            if (results[0].notTrusted)
                returnObject.notTrusted  = results[0].notTrusted;


            returnObject.result = FireGPG.Const.Results.SUCCESS;

            return returnObject;

        }
	},

    /*
        Function: layers
        Find each layer of a test and verify it (resurcise function)

        Return an array of resultss <FireGPG.GPGReturn> object.

        Parameters:
            text - The text to verify
            layer - The current layer
            resultss - _Optional_. The current array who should be returned.
    */
    layers: function(text,layer, charset, resultss) {
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



                        var tmpverifyresult = this.layerverify(divisiontxt,layer,division, charset);
                        resultss[resultss.length] = tmpverifyresult;

                        while(tmpverifyresult.moresign != undefined) {
                            var tmpverifyresult = this.layerverify(divisiontxt,layer,division, charset,undefined, undefined, undefined, undefined, tmpverifyresult.moresign);
                            resultss[resultss.length] = tmpverifyresult;

                        }

                        divisiontxt = divisiontxt.replace(begin,"");
                        divisiontxt = divisiontxt.replace(end,"");
                        divisiontxt = divisiontxt.replace(layerbegin,begintxt);
                        divisiontxt = divisiontxt.replace(layermid,midtxt);
                        divisiontxt = divisiontxt.replace(layerend,endtxt);

                        resultss = this.layers(divisiontxt,layer+1, charset, resultss);
                       //resultss = resultss.concat(subverif);

                        text=text.substring(lastPosition+endtxt.length);
                }
        }
        return resultss;
    },

    /*
        Function: layerverify
        Internal, verify a part of a test.

        Return a <FireGPG.GPGReturn> object.

        Parameters:
            text - The text to verify
            layer - The current layer
            division - The current layer level
            charset - The charset to use
            dontask - If set to true, don't ask to download the key
            fileMode - _Optional_. Indicate the user want to verify the signature of a file
            fileFrom - _Optional_. The file to verify
            fileSig - _Optional_. The file with the signature
            nextText - The Gpg output to use for signature verification (used for multi signs)
            fileDataForSign - _Optional_. The data with the signatur
            fromDTA - _Optional_. True if called form DTA
    */
    layerverify: function(text,layer,division, charset,dontask, fileMode, fileFrom, fileSig, nextText, fileDataForSign, fromDTA) {
        var returnObject = new FireGPG.GPGReturn();

        if (dontask == undefined)
            dontask = false;

        var result;

        // We get the result
        if (nextText == undefined) {
            var result = this.FireGPGGPGAccess.verify(text, charset, fileMode, fileFrom, fileSig, fileDataForSign, fromDTA);
            if ( charset && charset.toLowerCase() == "iso-8859-1")
                result.sdOut = FireGPG.Misc.EnigConvertToUnicode(result.sdOut, 'UTF-8');
        }         else {
            result = new FireGPG.GPGReturn();
            result.sdOut = nextText;

        }


        returnObject.sdOut = result.sdOut;

		// If check failled
		if(result.sdOut.indexOf("GOODSIG") == "-1") {

            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;

            if(result.sdOut.indexOf("REVKEYSIG") != -1) {
                returnObject.revoked = true;
            }

            if(result.sdOut.indexOf("BADSIG") != -1) {
                returnObject.result = FireGPG.Const.Results.ERROR_BAD_SIGN;

                testIfMore = result.sdOut.substring(result.sdOut.indexOf("BADSIG") + "BADSIG".length,result.sdOut.length);

                if (testIfMore.indexOf("GOODSIG") != -1 || testIfMore.indexOf("ERRSIG") != -1 || testIfMore.indexOf("BADSIG") != -1 || testIfMore.indexOf("REVKEYSIG") != -1) {
                    returnObject.moresign = testIfMore;
                }

            }

            if(result.sdOut.indexOf("NO_PUBKEY") != -1) {
                returnObject.result = FireGPG.Const.Results.ERROR_NO_KEY;

                testIfMore = result.sdOut.substring(result.sdOut.indexOf("NO_PUBKEY")  + "NO_PUBKEY".length,result.sdOut.length);

                if (testIfMore.indexOf("GOODSIG") != -1 || testIfMore.indexOf("ERRSIG") != -1 || testIfMore.indexOf("BADSIG") != -1 || testIfMore.indexOf("REVKEYSIG") != -1) {
                    returnObject.moresign = testIfMore;
                }

				idOfMissingKey = result.sdOut.substring(result.sdOut.indexOf("NO_PUBKEY") + 10);
				idOfMissingKey += "\n";

				idOfMissingKey = idOfMissingKey.substring(0,idOfMissingKey.indexOf("\n"));

                	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch("extensions.firegpg.");

                    var disabledown  = false;
                    try {
                        disabledown = prefs.getBoolPref("dont_ask_to_download_key");
                    } catch (e) { disabledown = false; }

                    var dontaskdonw  = false;
                    try {
                        dontaskdonw = prefs.getBoolPref("download_key_widhout_asking");
                    } catch (e) { dontaskdonw = false; }

				if (!dontask && !disabledown && (dontaskdonw || confirm(document.getElementById('firegpg-strings').getString('autoFeetch') + ' (' + idOfMissingKey + ')'))) {
					FireGPG.Core.retriveKeyFromServer(idOfMissingKey);
					return this.layerverify(text,layer,division,charset,true, fileMode, fileFrom, fileSig,nextText);
				}

			}

		} else {

            if(result.sdOut.indexOf("TRUST_UNDEFINED") != -1) {
                returnObject.notTrusted = true;
            }



			// If he work, we get informations of the Key
			var infos = result.sdOut;

            var infos2 = infos.substring(0,infos.indexOf("SIG_ID") + 7);

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

            returnObject.result = FireGPG.Const.Results.SUCCESS;

            var infos2 = "";
            infos = infos.split(" ");
            for (var ii = 1; ii < infos.length; ++ii)
                infos2 = infos2 + infos[ii] + " ";


            returnObject.signresulttext = infos2 + (returnObject.notTrusted ? i18n.getString('key_is_not_trusted') : "") + " (" + i18n.getString("signMadeThe") + " " + date.toLocaleString() + ")";
            returnObject.signresultuser = infos2 ;
            returnObject.signresultdate = date.toLocaleString();


            testIfMore = result.sdOut.substring(result.sdOut.indexOf("GOODSIG") + "GOODSIG".length,result.sdOut.length);

            if (testIfMore.indexOf("GOODSIG") != -1 || testIfMore.indexOf("ERRSIG") != -1 || testIfMore.indexOf("BADSIG") != -1 || testIfMore.indexOf("REVKEYSIG") != -1) {
                returnObject.moresign = testIfMore;
            }

		}

        return returnObject;

    },

    /*
        Function: decrypt
        Function to decrypt a text.

        Return a <FireGPG.GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
            text - _Optional_, if not set try to use the selection. The text to decrypt.
            password - _Optional_, if not set ask the user. The password of the key used to encrypt the data.
            binFileEncoded - _Optional_ Work on binary data
            fileMode - _Optional_. Indicate the user want to Decrypt a file
            fileFrom - _Optional_. The file to decrypt
            fileTo - _Optional_. The file where to put the decrypted file
            api - _Optional_ True if it's a call form the api
    */
	decrypt: function(silent, text, password, binFileEncoded, fileMode, fileFrom, fileTo, api) { try {
		var returnObject = new FireGPG.GPGReturn();

        if (silent == undefined)
            silent = false;

        if (binFileEncoded === undefined)
            binFileEncoded = false;

        if (fileMode == undefined)
            fileMode = false;

        if (api == undefined)
            api = false;

        this.initGPGACCESS();
        var i18n = document.getElementById("firegpg-strings");

        if (fileMode) {

            if (fileFrom == undefined) {

                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"]
                      .createInstance(nsIFilePicker);

                fp.init(window, i18n.getString('sourceFile'), nsIFilePicker.modeOpen);
                fp.appendFilters(nsIFilePicker.filterAll);

                if (fp.show() != nsIFilePicker.returnOK) { //L'utilisateur annule
                    fileFrom = null;
                } else {
                    fileFrom = fp.file.path;
                }

                if (fileFrom == null | fileFrom == '') {
                    returnObject.result = FireGPG.Const.Results.CANCEL;
                    return returnObject;
                }

            }

            if (fileTo == undefined) { //Nb: il ne doit pas exister !


                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"]
                      .createInstance(nsIFilePicker);

                fp.init(window, i18n.getString('destinationFile'), nsIFilePicker.modeSave);
                fp.appendFilters(nsIFilePicker.filterAll);

                done = false;

                while(!done) {

                     if (fp.show() == nsIFilePicker.returnCancel ) { //L'utilisateur annule
                        fileTo = null;
                    } else {
                        fileTo = fp.file.path;
                    }

                    if (fileTo == fileFrom) {
                        alert( i18n.getString('formAndToSame'));
                    } else
                        done = true;

                }

                if (fileTo == null | fileTo == '') {
                    returnObject.result = FireGPG.Const.Results.CANCEL;
                    return returnObject;
                }

                FireGPG.Misc.removeFile(fileTo);

            }
        }

        // GPG verification
        var gpgTest = FireGPG.Core.selfTest(silent);

		if(gpgTest.result != FireGPG.Const.Results.SUCCESS) {
            returnObject.result = gpgTest.result;
            return returnObject;
        }


        if ((text == undefined || text == null) && !fileMode) {
            var autoSetMode = true;
            text = FireGPG.Selection.get();
        }

        if (text == "" && !fileMode) {
            if (!silent)
                alert(i18n.getString("noData"));

            returnObject.messagetext = i18n.getString("noData");
            returnObject.result = FireGPG.Const.Results.ERROR_NO_DATA;
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

		if ((firstPosition == -1 || lastPosition == -1) && !binFileEncoded && !fileMode) {
			if (!silent)
                alert(i18n.getString("noGPGData"));

            returnObject.messagetext = i18n.getString("noGPGData");
            returnObject.result = FireGPG.Const.Results.ERROR_NO_GPG_DATA;
            return returnObject;
		}

        if (!binFileEncoded && !fileMode)
            text = text.substring(firstPosition,lastPosition + ("-----END PGP MESSAGE-----").length);

		// Needed for a decrypt
		if (!FireGPG.isGpgAgentActivated() && (password == undefined || password == null)) {
                password = FireGPG.Misc.getsavedPassword();
                if (password == null)
                    password = "wrongPass";
        }

		if(!FireGPG.isGpgAgentActivated() && password == null) {
			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

		// We get the result
		var result = this.FireGPGGPGAccess.decrypt(text,password,binFileEncoded, fileMode, fileFrom, fileTo);
        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;

        if(!api && result.sdOut.indexOf("DECRYPTION_OKAY") == -1 && (result.sdOut.indexOf("BAD_PASSPHRASE") != -1 || result.sdOut.indexOf("NEED_PASSPHRASE_SYM") != -1 || result.sdOut.indexOf("NEED_PASSPHRASE_PIN") != -1)) {

            if (result.sdOut.indexOf("NEED_PASSPHRASE_SYM") != -1)
                password = FireGPG.Misc.getPrivateKeyPassword(false, false,i18n.getString("symetricalPass") + ":", true);
            else
                password = FireGPG.Misc.getPrivateKeyPassword();

            if(password == null) {
                returnObject.result = FireGPG.Const.Results.CANCEL;
                return returnObject;
            }

            // We get the result
            var result = this.FireGPGGPGAccess.decrypt(text,password,binFileEncoded, fileMode, fileFrom, fileTo);

            returnObject.sdOut = result.sdOut;
            returnObject.output = result.output;

        }

        if(result.sdOut.indexOf("DECRYPTION_OKAY") == -1 && result.sdOut.indexOf("BAD_PASSPHRASE") != -1) {

            if (!silent)
                alert(i18n.getString("decryptFailedPassword"));

            FireGPG.Misc.eraseSavedPassword();
            returnObject.messagetext = i18n.getString("decryptFailedPassword");
            returnObject.result = FireGPG.Const.Results.ERROR_PASSWORD;
            return returnObject;
		}


        if(result.sdOut.indexOf("DECRYPTION_OKAY") == -1 && result.sdOut.indexOf("PLAINTEXT") == -1)	{
			if (!silent)
                alert(i18n.getString("decryptFailed") + "\n" + result.sdOut);

            returnObject.messagetext = i18n.getString("decryptFailed") + "\n" + result.sdOut;
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            FireGPG.Misc.eraseSavedPassword();
            return returnObject;
		}
        if (result.sdOut.indexOf("PLAINTEXT") != -1 && result.sdOut.indexOf("DECRYPTION_OKAY") == -1) { //Filemode produit un output en.. plaintext..

            if (!silent)
                alert(i18n.getString("notEncryptedButPlainText"));

            returnObject.notEncrypted = true;

        }




        //Il y avait une signature dans le truc //TODO: detect bad signs.
		if(result.sdOut.indexOf("GOODSIG") != -1) {

            var infos2 = result.sdOut.substring(0,result.sdOut.indexOf("SIG_ID") + 7);

			infos2 = result.sdOut.replace(infos2, "");

			infos2 = infos2.substring(0,infos2.indexOf("GNUPG") - 2);

            infos2 = infos2.split(" ");

            infos2 = infos2[infos2.length -1];


            var date = new Date();

            date.setTime(infos2 * 1000);

			var infos = result.sdOut;
			infos = infos.substring(0,infos.indexOf("GOODSIG") + 8);
			infos = result.sdOut.replace(infos, "");
			infos = infos.substring(0,infos.indexOf("\n"));

            infos = infos.split(" ");
            infos2 = "";
            for (var ii = 1; ii < infos.length; ++ii)
                infos2 = infos2 + infos[ii] + " ";

            returnObject.signresult = FireGPG.Const.Results.SUCCESS;
            returnObject.signresulttext = infos2 + " (" + i18n.getString("signMadeThe") + " " + date.toLocaleString() + ")";
            returnObject.signresultuser = infos2;
            returnObject.signresultdate = date.toLocaleString();
            returnObject.signresultkeyid = infos[0];

		}


        if (autoSetMode) {
            //We test is the selection in editable :
            if(FireGPG.Selection.isEditable()) {
                //If yes, we edit this selection with the new text
                FireGPG.Selection.set(result.output,returnObject.signresulttext);
            }  else {
                //Else, we show a windows with the result
                FireGPG.Misc.showText(result.output,undefined,undefined,undefined,returnObject.signresulttext);
            }
        }

        if (fileMode) {
            alert(i18n.getString("operationOnFileDone"));
        }

        returnObject.decrypted = result.output;

        returnObject.result = FireGPG.Const.Results.SUCCESS;
        return returnObject;
    } catch (e) { alert(e) }
	},



    /*
        Function: initGPGACCESS
        Init the FireGPGGPGAccess class (try to found the GnuPG's command, etc.).
    */
	initGPGACCESS: function() {
		if(this.allreadyinit != undefined && this.allreadyinit == true)
			return;

		//Find the right command for Gpg
		this.FireGPGGPGAccess.tryToFoundTheRightCommand();

		// ???
        var useGPGAgent = this.FireGPGGPGAccess.runATest('--no-use-agent');

        FireGPG.useGPGTrust = this.FireGPGGPGAccess.runATest('--trust-model always');

		this.allreadyinit = true;
	},



    /*
        Function: selfTest
        This if are able to access to a GnuPG executable

        Return a <FireGPG.GPGReturn> object.

        Parameters:
            slient - _Optional_, default to false. Set this to true to disable any alert for the user
    */
	selfTest: function(silent) {
		this.initGPGACCESS();

        if (silent == undefined)
            silent = false;

		// For i18n
		var i18n = document.getElementById("firegpg-strings");

		if (this.FireGPGGPGAccess.selfTest() == false) {
			if (!silent)
                alert(i18n.getString("selfTestFailled"));

            var returnObject = new FireGPG.GPGReturn();
            returnObject.messagetext = i18n.getString("selfTestFailled");
            returnObject.result = FireGPG.Const.Results.ERROR_INIT_FAILLED;
            return returnObject;
		}

        var returnObject = new FireGPG.GPGReturn();
        returnObject.result = FireGPG.Const.Results.SUCCESS;
        return returnObject;
	},

    /*
      Function: searchKeyInServer
      Seach for a key in keyserver

      Parameters:
        search - The text to search
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
    */
    searchKeyInServer: function(search, silent) {

		var returnObject = new FireGPG.GPGReturn();

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        //Boite d'attente
        var wait_box = window.open("chrome://firegpg/content/Dialogs/Keymanager/wait.xul", "waitBox", "chrome,centerscreen,resizable=0,minimizable=0,popup");
        wait_box.focus();
        //Boite pour attendre la boite d'attente
        var wait_box2 = window.open("chrome://firegpg/content/Dialogs/Keymanager/wait2.xul", "waitBox2", "chrome,centerscreen,resizable=0,minimizable=0,modal");


        backgroundTask = {
            run: function() {
                    this.result == null;
                     // We get the result
                    try {
                    this.result = this.FireGPGGPGAccess.searchKeyInServer(this.search,FireGPG.Misc.getKeyServer());
                    } catch (e) { } //To be sure to close the wait_box
            }
          }

        backgroundTask.FireGPGGPGAccess = this.FireGPGGPGAccess;
        backgroundTask.search = search;

        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                               .getService(Components.interfaces.nsIThreadManager)
                               .newThread(0);
        thread.dispatch(backgroundTask, thread.DISPATCH_NORMAL);

        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                               .getService(Components.interfaces.nsIThreadManager)
                               .currentThread;
        while (backgroundTask.result == null)
          thread.processNextEvent(true);

        wait_box.close();

        var result = backgroundTask.result;

		// We get informations from GPG
		result = FireGPG.Misc.EnigConvertGpgToUnicode(result.sdOut);


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

                    var theKey = new FireGPG.GPGKey();

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
			} catch (e) { FireGPG.debug(e,'cgpg.searchKeyInServer',true);  }
		}

        // Sorts keys
        returnObject.keylist = returnObject.keylist.sort(FireGPG.Sortage);

        for (var i = 0; i < returnObject.keylist.length; i++)
            returnObject.keylist[i].subKeys = returnObject.keylist[i].subKeys.sort(FireGPG.Sortage);

        returnObject.result = FireGPG.Const.Results.SUCCESS;

		return returnObject;

        /*if (result.sdOut.indexOf('IMPORT_OK') > 0) {

            if (!silent)
                alert(document.getElementById('firegpg-strings').
                getString('keyRecived'));

            var returnObject = new FireGPG.GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;

        } else {

            if (!silent)
                alert(document.getElementById('firegpg-strings').
                getString('keyFetchError'));

            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }*/

    },

    /*
      Function: retriveKeyFromServer
      Get a key from a keyserver

      Parameters:
        keyId - The ked id to get
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
    */
    retriveKeyFromServer: function(keyId, silent) {


        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        keyId = FireGPG.Misc.trim(keyId);
        keyId = keyId.replace(/\r/gi, "");
        keyId = keyId.replace(/\n/gi, "");

        //Boite d'attente
        var wait_box = window.open("chrome://firegpg/content/Dialogs/Keymanager/wait.xul", "waitBox", "chrome,centerscreen,resizable=0,minimizable=0,popup");
        wait_box.focus();
        //Boite pour attendre la boite d'attente
        var wait_box2 = window.open("chrome://firegpg/content/Dialogs/Keymanager/wait2.xul", "waitBox2", "chrome,centerscreen,resizable=0,minimizable=0,modal");

        backgroundTask = {
            run: function() {
                    this.result == null;
                     // We get the result
                    try {
                    this.result = this.FireGPGGPGAccess.retriveKeyFromServer(this.keyId,FireGPG.Misc.getKeyServer());
                    } catch (e) { } //To be sure to close the wait_box
            }
          }

        backgroundTask.FireGPGGPGAccess = this.FireGPGGPGAccess;
        backgroundTask.keyId = keyId;

        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                               .getService(Components.interfaces.nsIThreadManager)
                               .newThread(0);
        thread.dispatch(backgroundTask, thread.DISPATCH_NORMAL);

        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                               .getService(Components.interfaces.nsIThreadManager)
                               .currentThread;
        while (backgroundTask.result == null)
          thread.processNextEvent(true);

        wait_box.close();

        var result = backgroundTask.result;


        if (result.sdOut.indexOf('IMPORT_OK') > 0) {

            if (!silent) {

                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_server_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(document.getElementById('firegpg-strings').
                    getString('keyRecived'));

            }

            var returnObject = new FireGPG.GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;

        } else {

            if (!silent)
                alert(document.getElementById('firegpg-strings').
                getString('keyFetchError') + '\n' + result.sdOut + '\n' + result.sdErr);

            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }


    },

     /*
      Function: sendKeyToServer
      Send a key from a keyserver

      Parameters:
        keyId - The ked id to send
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
    */
    sendKeyToServer: function(keyId, silent) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        //Boite d'attente
        var wait_box = window.open("chrome://firegpg/content/Dialogs/Keymanager/wait.xul", "waitBox", "chrome,centerscreen,resizable=0,minimizable=0,popup");
        wait_box.focus();
        //Boite pour attendre la boite d'attente
        var wait_box2 = window.open("chrome://firegpg/content/Dialogs/Keymanager/wait2.xul", "waitBox2", "chrome,centerscreen,resizable=0,minimizable=0,modal");


        backgroundTask = {
            run: function() {
                    this.result == null;
                     // We get the result
                    try {
                    this.result = this.FireGPGGPGAccess.sendKeyToServer(this.keyId,FireGPG.Misc.getKeyServer());
                    } catch (e) { } //To be sure to close the wait_box
            }
          }

        backgroundTask.FireGPGGPGAccess = this.FireGPGGPGAccess;
        backgroundTask.keyId = keyId;

        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                               .getService(Components.interfaces.nsIThreadManager)
                               .newThread(0);
        thread.dispatch(backgroundTask, thread.DISPATCH_NORMAL);

        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                               .getService(Components.interfaces.nsIThreadManager)
                               .currentThread;
        while (backgroundTask.result == null)
          thread.processNextEvent(true);

        wait_box.close();

        var result = backgroundTask.result;

        if (result.sdOut) {

            if (!silent) {

                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_server_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(result.sdOut);
            }

            var returnObject = new FireGPG.GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('unknow-error'));


            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }


    },

    /*
      Function: refreshKeysFromServer
      Syncronize keys with the keyserver

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
    */
    refreshKeysFromServer: function(silent) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        //Boite d'attente
        var wait_box = window.open("chrome://firegpg/content/Dialogs/Keymanager/wait.xul", "waitBox", "chrome,centerscreen,resizable=0,minimizable=0,popup");
        wait_box.focus();
        //Boite pour attendre la boite d'attente
        var wait_box2 = window.open("chrome://firegpg/content/Dialogs/Keymanager/wait2.xul", "waitBox2", "chrome,centerscreen,resizable=0,minimizable=0,modal");

         backgroundTask = {
            run: function() {
                    this.result == null;
                     // We get the result
                    try {
                    this.result = this.FireGPGGPGAccess.refrechFromServer(FireGPG.Misc.getKeyServer());
                    } catch (e) { } //To be sure to close the wait_box
            }
          }

        backgroundTask.FireGPGGPGAccess = this.FireGPGGPGAccess;

        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                               .getService(Components.interfaces.nsIThreadManager)
                               .newThread(0);
        thread.dispatch(backgroundTask, thread.DISPATCH_NORMAL);

        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                               .getService(Components.interfaces.nsIThreadManager)
                               .currentThread;
        while (backgroundTask.result == null)
          thread.processNextEvent(true);

        wait_box.close();

        var result = backgroundTask.result;

        if (result.sdOut) {

            if(!silent) {

                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_server_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(document.getElementById('firegpg-strings').getString('keySync'));
            }

            var returnObject = new FireGPG.GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;

        } else {
            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }

    },

    /*
      Function: changeTrust
      Change trust of a key

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
        key - The key id
        trustLevel - The new level of trusting
    */
	changeTrust: function(silent, key, trustLevel) {



        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();


        // We get the result
		var result = this.FireGPGGPGAccess.changeTrust(key, trustLevel);


        if (result.sdOut) {

            if(!silent) {
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_operation_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(document.getElementById('firegpg-strings').getString('trustChanged'));
            }

            var returnObject = new FireGPG.GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('unknow-error'));



            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }

		//
	},


    /*
      Function: changePassword
      Change password of a key

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
        key - The key id
        oldpass - The old password
        newpass - The new password
    */
    changePassword: function(silent, key, oldpass, newpass) {

        var i18n = document.getElementById("firegpg-strings");

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        if (oldpass == undefined) {

            oldpass = FireGPG.Misc.getPrivateKeyPassword(false, false, i18n.getString("oldPassword"), true);

            if(oldpass == null) {
                var returnObject = new FireGPG.GPGReturn();
                returnObject.result = FireGPG.Const.Results.CANCEL;
                return returnObject;
            }

        }

        if (newpass == undefined) {

            newpass = FireGPG.Misc.getPrivateKeyPassword(false, false, i18n.getString("newPassword"), true);
            newpass2 = FireGPG.Misc.getPrivateKeyPassword(false, false, i18n.getString("newPassword2"), false);

            if(newpass == null) {
                var returnObject = new FireGPG.GPGReturn();
                returnObject.result = FireGPG.Const.Results.CANCEL;
                return returnObject;
            }

            if(newpass != newpass2) {

                 if (!silent)
                    alert(i18n.getString("changeFailledPasswordDiff"));

                var returnObject = new FireGPG.GPGReturn();
                returnObject.result = FireGPG.Const.Results.CANCEL;
                return returnObject;
            }
        }


        // We get the result
		var result = this.FireGPGGPGAccess.changePassword(key,  oldpass, newpass);

        if(result.sdOut.indexOf("BAD_PASSPHRASE") != -1) {

            if (!silent)
                alert(i18n.getString("changeFailledPassword"));

            returnObject.messagetext = i18n.getString("changeFailledPassword");

            FireGPG.Misc.eraseSavedPassword();

            returnObject.result = FireGPG.Const.Results.ERROR_PASSWORD;
            return returnObject;
		}

        //On assume que c'est ok

        if(!silent)  {
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_operation_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                 alert(document.getElementById('firegpg-strings').getString('passChanged'));
        }

        var returnObject = new FireGPG.GPGReturn();
        returnObject.sdOut = result.sdOut;
        returnObject.result = FireGPG.Const.Results.SUCCESS;
        return returnObject;


		//
	},

    /*
      Function: generateKey
      Generate a new key

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
        name - The name of the key
        email - The email of the key
        comment - The cpmment of the key
        password1 - The password of the key
        password2 - The password of the key
        keyneverexpire - True if the key shouldn't expire
        keyexpirevalue - The expiration value of the key
        keyexpiretype - The type of the expiration value
        keylength - The length of the key
        keytype - The type of the key
    */
    generateKey: function(silent, name, email, comment, password1, password2, keyneverexpire, keyexpirevalue, keyexpiretype, keylength, keytype) {

        var i18n = document.getElementById("firegpg-strings");

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

         if (name == "") {
            if(!silent)
                alert(i18n.getString("need-name"));

            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }

        if (email == "") {
            if(!silent)
                alert(i18n.getString("need-email"));
            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }

        if (password1 == "") {
            if(!silent)
                alert(i18n.getString("need-password"));
            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }

        if (password1 != password2) {
            if(!silent)
                alert(i18n.getString("changeFailledPasswordDiff"));
            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }

        if (!keyneverexpire) {

            if (keyexpirevalue <= 0) {
                if(!silent)
                    alert(i18n.getString("need-expire-date"));
                var returnObject = new FireGPG.GPGReturn();
                returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
                return returnObject;

            }

        }

        var result = this.FireGPGGPGAccess.genereateKey(name, email, comment, password1, keyneverexpire, keyexpirevalue, keyexpiretype, keylength, keytype);

        if (result.sdOut.indexOf("KEY_CREATED") != -1) {

            if(!silent) {
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_operation_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(document.getElementById('firegpg-strings').getString('keygenerated'));
            }

            var returnObject = new FireGPG.GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('unknow-error'));

            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }

    },

    /*
      Function: deleteKey
      Delete a key (!)

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
        key - The key to delete
    */
    deleteKey: function(silent, key) {



        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();


        // We get the result
		var result = this.FireGPGGPGAccess.deleteKey(key);

        //Assume it's worked (no error message)
        if(!silent) {
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_operation_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(document.getElementById('firegpg-strings').getString('key-deleted'));
        }

        var returnObject = new FireGPG.GPGReturn();
        returnObject.sdOut = result.sdOut;
        returnObject.result = FireGPG.Const.Results.SUCCESS;
        return returnObject;

	},

    /*
      Function: revokeKey
      Revoke a key (!)

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
        key - The key to revoke
        raison - The rasion to delete the key
        password - The password of the key
    */
    revokeKey: function (silent, key, raison, password) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        if (password == undefined || password == null) {
            password = FireGPG.Misc.getPrivateKeyPassword(false);
        }

		if(password == null) {
			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

        // We get the result
		var result = this.FireGPGGPGAccess.revokeKey(key, password, raison);

        if (result.sdOut.indexOf("GOOD_PASSPHRASE") != -1) {

            if(!silent)  {
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_operation_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(document.getElementById('firegpg-strings').getString('keyrevoked'));
            }

            var returnObject = new FireGPG.GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('keynotrevokedpassword'));

            FireGPG.Misc.eraseSavedPassword();

            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }


    },

    /*
      Function: addUid
      Add a new identity to a key

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
        key - The key to revoke
        name - The name of the new UID
        email - The email of the new UID
        comment - The comment of the new UID
        password - The password of the key
    */
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

			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

        if (email == undefined || email == null) {
            email = prompt(document.getElementById('firegpg-strings').getString('enteremail'));
        }

        var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;

        if(email == null || !filter.test(email)) {

            if (!silent)
                alert(document.getElementById('firegpg-strings').getString('wrongEmail'));

			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

        if (comment == undefined || comment == null) {
            comment = prompt(document.getElementById('firegpg-strings').getString('entercomment'));
        }


         this.initGPGACCESS();

        if (password == undefined || password == null) {
            password = FireGPG.Misc.getPrivateKeyPassword(false);
        }

		if(password == null) {
			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

        var result = this.FireGPGGPGAccess.addUid(key, name, email, comment, password);

        if (result.sdOut.indexOf("GOOD_PASSPHRASE") != -1) {

            if(!silent)  {
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_operation_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(document.getElementById('firegpg-strings').getString('uidadded'));
            }

            var returnObject = new FireGPG.GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('uidnotadded'));

            FireGPG.Misc.eraseSavedPassword();

            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }
    },

    /*
      Function: revokeUid
      Revoke an identity of a key

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
        key - The key
        uid - The uid to revoke
        password - The password of the key
    */
    revokeUid: function (silent, key, uid, password) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        if (password == undefined || password == null) {
            password = FireGPG.Misc.getPrivateKeyPassword(false);
        }

		if(password == null) {
			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

        // We get the result
		var result = this.FireGPGGPGAccess.revokeUid(key, uid, password, 4);

        if (result.sdOut.indexOf("GOOD_PASSPHRASE") != -1) {

            if(!silent) {
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_operation_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(document.getElementById('firegpg-strings').getString('uidrevoked'));
            }

            var returnObject = new FireGPG.GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('uidnotrevokedpassword'));

            FireGPG.Misc.eraseSavedPassword();

            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }


    },

    /*
      Function: delUid
      Delete an identity of a key

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
        key - The key
        uid - The uid to delete
        password - The password of the key
    */
    delUid: function (silent, key, uid) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();


        // We get the result
		var result = this.FireGPGGPGAccess.delUid(key, uid);

        //Assume it's worked
        if(!silent)  {
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_operation_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(document.getElementById('firegpg-strings').getString('uiddeleted'));
        }

        var returnObject = new FireGPG.GPGReturn();
        returnObject.sdOut = result.sdOut;
        returnObject.result = FireGPG.Const.Results.SUCCESS;
        return returnObject;




    },

    /*
      Function: signKey
      Sign a key

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
        key - The key
        keyForSign - The key used to sign
        password - The password of the key (used to sign)
    */
    signKey: function(silent, key, keyForSign, password) {


        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        // Needed for a sign
		if (keyForSign == undefined || keyForSign == null) {
            keyForSign = FireGPG.Misc.getSelfKey();
        }

        if(keyForSign == null) {
            returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

		if (password == undefined || password == null) {
            password = FireGPG.Misc.getPrivateKeyPassword();
        }

		if(password == null) {
			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }


        // We get the result
		var result = this.FireGPGGPGAccess.signKey(key, keyForSign, password);

        ///
        if (result.sdOut.indexOf("ALREADY_SIGNED") != -1) {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('erroralreadysigned'));

            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;


        }
        else if (result.sdOut.indexOf("GOOD_PASSPHRASE") != -1) {

            if(!silent)  {
                var prefs = Components.classes['@mozilla.org/preferences-service;1'].
		                       getService(Components.interfaces.nsIPrefService);
                    prefs = prefs.getBranch('extensions.firegpg.');

                var shutup  = false;
                try {
                    shutup = prefs.getBoolPref('hide_key_operation_confirmation');
                } catch (e) { shutup = false; }

                if (!shutup)
                    alert(document.getElementById('firegpg-strings').getString('okkeysigned'));
            }

            var returnObject = new FireGPG.GPGReturn();
            returnObject.sdOut = result.sdOut;
            returnObject.result = FireGPG.Const.Results.SUCCESS;
            return returnObject;

        } else {

            if(!silent)
                alert(document.getElementById('firegpg-strings').getString('errorkeynosignedpassword'));

            FireGPG.Misc.eraseSavedPassword();

            var returnObject = new FireGPG.GPGReturn();
            returnObject.result = FireGPG.Const.Results.ERROR_UNKNOW;
            return returnObject;
        }


    },

    /*
      Function: computeHash
      Compute hash of a file

      Parameters:
        silent - _Optional_, default to false. Set this to true to disable any alert for the user
        hash - The hash to use (MD5, SHA1, etc.)
        file - The file
    */
    computeHash: function(silent,hash,file) {

        if (silent == undefined)
            silent = false;

        this.initGPGACCESS();

        var returnObject = new FireGPG.GPGReturn();

        //This values must be given ...
        if(hash == null || hash == undefined) {
			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

        if(file == null || file == undefined) {
			returnObject.result = FireGPG.Const.Results.CANCEL;
            return returnObject;
        }

         backgroundTask = {
            run: function() {
                    this.result == null;
                     // We get the result
                    try {
                    this.result = result = this.FireGPGGPGAccess.computeHash(this.hash,this.file);
                    } catch (e) { } //To be sure to close the wait_box
            }
          }

        backgroundTask.FireGPGGPGAccess = this.FireGPGGPGAccess;
        backgroundTask.hash = hash;
        backgroundTask.file = file;

        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                               .getService(Components.interfaces.nsIThreadManager)
                               .newThread(0);
        thread.dispatch(backgroundTask, thread.DISPATCH_NORMAL);

        var thread = Components.classes["@mozilla.org/thread-manager;1"]
                               .getService(Components.interfaces.nsIThreadManager)
                               .currentThread;
        while (backgroundTask.result == null)
          thread.processNextEvent(true);

        var result = backgroundTask.result;

        tmpHash = result.sdOut;
        tmpHash = tmpHash.substring(tmpHash.lastIndexOf(':') + 1, tmpHash.length);
        tmpHash = tmpHash.replace(/ /gi, '');
        tmpHash = tmpHash.toLowerCase();

        if (!silent)
            alert(tmpHash);

        returnObject.result = FireGPG.Const.Results.SUCCESS;
        returnObject.sdOut = result.sdOut;
        returnObject.output = tmpHash;

        return returnObject;

    },

    /*
    Function: loadFireGPGAccess

    This function will determing and 'build' the class to access gpg.

    She test if the xpcom is usable, update information about the status, and select the rights function to access to gnupg as the current situtation.

    She set  the FireGPGGPGAccess class.

    */
    loadFireGPGAccess: function() {

        if (FireGPG.loadXpcom()) {

            if (FireGPG.GPGAccess.isUnix()) {

                FireGPG.GPGAccess.tryToFoundTheRightCommand = FireGPG.GPGAccess.UnixXpcom.tryToFoundTheRightCommand;

            } else {

                FireGPG.GPGAccess.tryToFoundTheRightCommand = FireGPG.GPGAccess.WindowsXpcom.tryToFoundTheRightCommand;

            }

            this.FireGPGGPGAccess = FireGPG.GPGAccess;

        } else {

            var i18n = document.getElementById("firegpg-strings");
            alert(i18n.getString('noipc2'));

            this.FireGPGGPGAccess = FireGPG.GPGAccess;
        }

    }

}



FireGPG.okWait = null; // ???

// We load the good class for the OS
//FireGPG.Core.FireGPGGPGAccess = Witch_FireGPGGPGAccess();
FireGPG.Core.loadFireGPGAccess()
FireGPG.Core.FireGPGGPGAccess.parent = FireGPG;

//Test if we have to show the 'what is new ?'
//We wait 3 sec.
setTimeout("FireGPG.Misc.testIfSomethingsIsNew()",3000);
