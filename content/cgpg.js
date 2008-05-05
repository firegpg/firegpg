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

}

//Function to try array
function Sortage(a,b) {
    var infosA = new Array();
	try { infosA = a.split(":") } catch(e) {};



    var infosB = new Array();
	try { infosB = b.split(":") } catch(e) {};

    infosA = (infosA[9] + " ").toLowerCase();
    infosB = (infosB[9] + " ").toLowerCase();

    var i = 0;

    while(infosA[i] == infosB[i] && i < infosA.lenght)
        i++;

    if (infosA[i]<infosB[i]) return -1;

    if (a[i]==b[i]) return 0;

    return 1;
}

var FireGPG = {

    sign: function(silent, text, keyID, password) {

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
		var result = this.GPGAccess.sign(text, password, keyID);

        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;

        if(result.sdOut.indexOf("BAD_PASSPHRASE") != -1) {

            if (!silent)
                alert(i18n.getString("signFailedPassword"));

            eraseSavedPassword();

            returnObject.result = RESULT_ERROR_PASSWORD;
            return returnObject;
		}

		if(result.sdOut.indexOf("SIG_CREATED") == -1)
		{
			if (!silent)
                alert(i18n.getString("signFailed") + "\n" + result.sdOut);

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

    /*
	 * List all keys.
	 *
	 * An object is returned :
	 *     object["key_id"] = "Name (name) <email>"
	 */
	listKeys: function(onlyPrivate) {

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

        var result = this.GPGAccess.listkey(onlyPrivate);

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
        list.sort(Sortage);

		for (var i = 0; i < list.length; i++) {
			var infos = new Array();
			try { infos = list[i].split(":");
			//4: key id. 9 = key name. 5: creation date, 6: expire date
			if(infos[0] == "pub" || infos[0] == "sec")
			{
				var keyId = infos[4];
				var keyName = infos[9].replace(/\\e3A/g, ":");
				var keyDate = infos[5];
				var keyExpi = infos[6];

                if(check_expi)  {

                    var splited = keyExpi.split(new RegExp("-", "g"));

                    var tmp_date = new Date(splited[0],splited[1],splited[2]);

                    if (isNaN(tmp_date.getTime()) || maintenant < tmp_date.getTime())
                        returnObject.keylist[infos[4]] = new Array(keyName, keyDate,keyExpi);

                }
                else
                    returnObject.keylist[infos[4]] = new Array(keyName, keyDate,keyExpi);
			}
			} catch (e) { }
		}

        returnObject.result = RESULT_SUCCESS;

		return returnObject;
	},

    /*
	* Function to import a public key.
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

            returnObject.result = RESULT_ERROR_NO_DATA;
			return returnObject;
		}

        //Verify GPG'data presence
		var firstPosition = text.indexOf("-----BEGIN PGP PUBLIC KEY BLOCK-----");
		var lastPosition = text.indexOf("-----END PGP PUBLIC KEY BLOCK-----");

		if (firstPosition == -1 || lastPosition == -1) {
			if (!silent)
                alert(i18n.getString("noGPGData"));

            returnObject.result = RESULT_ERROR_NO_GPG_DATA;
            return returnObject;
		}

        text = text.substring(firstPosition,lastPosition + ("-----END PGP PUBLIC KEY BLOCK-----").length);

		// We get the result
		var result = this.GPGAccess.kimport(text);

        returnObject.sdOut = result.sdOut;

        if (result.sdOut.indexOf("IMPORT_OK") == -1) {
            if (!silent)
                alert(i18n.getString("importFailed"));

            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;

        } else {
            if (!silent)
                alert(i18n.getString("importOk"));

            returnObject.result = RESULT_SUCCESS;
            return returnObject;
        }

	},


	/*
	* Function to import a public key.
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


        var result = this.GPGAccess.kexport(keyID);

        returnObject.sdOut = result.sdOut;

		if (result.sdOut == "") {

            if (!silent)
                alert(i18n.getString("exportFailed"));

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
	* Function to crypt a text.
	*/
	crypt: function(silent, text, keyIdList, fromGpgAuth, binFileMode, autoSelect ) {

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

		// We get the result
		var result = this.GPGAccess.crypt(text, keyIdList,fromGpgAuth,binFileMode);



        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;


		if(result.sdOut.indexOf("END_ENCRYPTION") == -1)
		{
			if (!silent)
                alert(i18n.getString("cryptFailed") + "\n" + result.sdOut);

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

            returnObject.result = RESULT_ERROR_UNKNOW;
            return returnObject;
		}

		if(result.sdOut.indexOf("END_ENCRYPTION") == -1)
		{
			if (!silent)
                alert(i18n.getString("cryptAndSignFailed") + "\n" + result.sdOut);

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

    // Verify a signature
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

    layerverify: function(text,layer,division) {
        var returnObject = new GPGReturn();

        // We get the result
		var result = this.GPGAccess.verify(text);

        returnObject.sdOut = result.sdOut; alert(result.sdOut);

		// If check failled
		if(result.sdOut.indexOf("GOODSIG") == "-1") {

            returnObject.result = RESULT_ERROR_UNKNOW;

            if(result.sdOut.indexOf("BADSIG") != -1)
                returnObject.result = RESULT_ERROR_BAD_SIGN;

            if(result.sdOut.indexOf("NO_PUBKEY") != -1)
                returnObject.result = RESULT_ERROR_NO_KEY;

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
			infos = infos.substring(0,infos.indexOf("GNUPG") - 2);

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
	* Function to decrypt a text.
	*/
	decrypt: function(silent, text, password) {
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

            returnObject.result = RESULT_ERROR_NO_GPG_DATA;
            return returnObject;
		}

		text = text.substring(firstPosition,lastPosition + ("-----END PGP MESSAGE-----").length);

		// Needed for a decrypt
		if (password == undefined || password == null)
            password = getPrivateKeyPassword();

		if(password == null) {
			returnObject.result = RESULT_CANCEL;
            return returnObject;
        }

		// We get the result
		var result = this.GPGAccess.decrypt(text,password);

        returnObject.sdOut = result.sdOut;
        returnObject.output = result.output;


        if(result.sdOut.indexOf("BAD_PASSPHRASE") != -1) {

            if (!silent)
                alert(i18n.getString("decryptFailedPassword"));

            eraseSavedPassword();

            returnObject.result = RESULT_ERROR_PASSWORD;
            return returnObject;
		}


        if(result.sdOut.indexOf("DECRYPTION_OKAY") == -1)	{
			if (!silent)
                alert(i18n.getString("decryptFailed") + "\n" + result.sdOut);

            returnObject.result = RESULT_ERROR_UNKNOW;
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
	},



    //Init subclass.
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
	 * Test if GPG exists.
	 * Return false on error.
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
            returnObject.result = RESULT_ERROR_INIT_FAILLED;
            return returnObject;
		}

        var returnObject = new GPGReturn();
        returnObject.result = RESULT_SUCCESS;
        return returnObject;
	},

}

// We load the good class for the OS
FireGPG.GPGAccess = Witch_GPGAccess();
FireGPG.GPGAccess.parent = FireGPG;

//Test if we have to show the 'what is new ?'
//We wait 3 sec.
setTimeout("testIfSomethingsIsNew()",3000);


// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
