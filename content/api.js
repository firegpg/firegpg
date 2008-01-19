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

var gpgApi = {
	onLoad: function() {
		this.initialized = true;
		this.strings = document.getElementById( "firegpg-strings" );

		this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
				getService(Components.interfaces.nsIPrefService);
		this.prefs = this.prefs.getBranch("extensions.firegpg.");

		if ( this.prefs.prefHasUserValue( "enable_gpgapi" ) ) {
			var gpgapi_enabled = this.prefs.getBoolPref( "enable_gpgapi" );
		} else {
			var gpgapi_enabled = true;
		}

		if ( gpgapi_enabled ) {
			window.addEventListener( "firegpg:hello", this.hello, false, true );
            window.addEventListener( "firegpg:auth", this.auth, false, true );
            window.addEventListener( "firegpg:register", this.register, false, true );
            window.addEventListener( "firegpg:listkey", this.listkey, false, true );
            window.addEventListener( "firegpg:listprivkey", this.listprivkey, false, true );
            window.addEventListener( "firegpg:check", this.check, false, true );
            window.addEventListener( "firegpg:sign", this.sign, false, true );
            window.addEventListener( "firegpg:decrypt", this.decrypt, false, true );
            window.addEventListener( "firegpg:encrypt", this.encrypt, false, true );
            window.addEventListener( "firegpg:signandencrypt", this.signandencrypt, false, true );
			window.addEventListener( "unload", function() { gpgApi.listenerUnload() }, false );
		}

	},

	listenerUnload: function( event ) {
		window.removeEventListener( "firegpg:hello", this.hello, false, true );
        window.removeEventListener( "firegpg:auth", this.auth, false, true );
        window.removeEventListener( "firegpg:register", this.register, false, true );
        window.removeEventListener( "firegpg:listkey", this.listkey, false, true );
        window.removeEventListener( "firegpg:listprivkey", this.listprivkey, false, true );
        window.removeEventListener( "firegpg:check", this.check, false, true );
        window.removeEventListener( "firegpg:sign", this.sign, false, true );
        window.removeEventListener( "firegpg:decrypt", this.decrypt, false, true );
        window.removeEventListener( "firegpg:encrypt", this.encrypt, false, true );
        window.removeEventListener( "firegpg:signandencrypt", this.signandencrypt, false, true );

	},


    //Return 'firegpg-ok' in 'result' (useful to test firegpg's api presence)
    hello: function ( event ) {

        returnData = gpgApi.getReturnDataNode(event.target);

        returnData.setAttribute('result', 'firegpg-ok');

        return;

    },

    //Return 'auth-ok' in 'result' (or 'auth-fail' is the website have rights to use the api
    //Paramters : 'auth_key' --> the key for the website
    auth: function ( event ) {


        data = gpgApi.getDataNode(event.target);

        key_auth = data.getAttribute('auth_key');

        returnData = gpgApi.getReturnDataNode(event.target);

        if (key_auth == '' || key_auth == undefined || gpgApi.isAuth(key_auth, event.target.ownerDocument) == false )
        {
            returnData.setAttribute('result', 'auth-fail');
            return;
        }

        returnData.setAttribute('result', 'auth-ok');

    },

    //Try to register a webpage (ask the user). Put 'register-ok' in 'result' or 'register-fail'. It's all is ok, put the auth key in 'auth_key'
    register: function ( event ) {

        domain = gpgApi.getDomain(event.target.ownerDocument.location);

        var texte = document.getElementById("firegpg-strings").getString('api-accept');

        var reg=new RegExp("\!D\!", "g");
        texte = texte.replace(reg,domain);
        var reg=new RegExp("\!N\!", "g");
        texte = texte.replace(reg,"\n");

        if (confirm(texte) == false)
        {
            returnData.setAttribute('result', 'register-fail');
            return;
        }

        access = gpgApi.getAccessList();


        auth_key = genreate_api_key();

        while (access[auth_key] != null) {
            auth_key = genreate_api_key();
        }

        access[auth_key] = domain;

        gpgApi.setAccessList(access);

        returnData = gpgApi.getReturnDataNode(event.target);

        returnData.setAttribute('auth_key', auth_key);
        returnData.setAttribute('result', 'register-ok');

        return;

    },

    // Return the node with data attributes for return
    getDataNode: function(d) {

        liste = d.getElementsByTagName( "firegpg:data" );

        return liste[0]

    },

    //Return 'list-ok' in 'result' (or 'list-err' is there is a problem), and the list of public key in list
    //Paramters : 'auth_key' --> the key for the website
    listkey: function ( event ) {


        data = gpgApi.getDataNode(event.target);

        key_auth = data.getAttribute('auth_key');

        returnData = gpgApi.getReturnDataNode(event.target);

        if (key_auth == '' || key_auth == undefined || gpgApi.isAuth(key_auth, event.target.ownerDocument) == false )
        {
            return;
        }

        keylist = GPG.listKeys();

        return_list = "";

        for (key in keylist) {

            return_list = return_list + gpgApi.removeDoublePoint(key) + ":" + gpgApi.removeDoublePoint(keylist[key]) + ",";
        }

        returnData.setAttribute('list', return_list);
        returnData.setAttribute('result', 'list-ok');

    },

    //Return 'list-ok' in 'result' (or 'list-err' is there is a problem), and the list of private key in list
    //Paramters : 'auth_key' --> the key for the website
    listprivkey: function ( event ) {


        data = gpgApi.getDataNode(event.target);

        key_auth = data.getAttribute('auth_key');

        returnData = gpgApi.getReturnDataNode(event.target);

        if (key_auth == '' || key_auth == undefined || gpgApi.isAuth(key_auth, event.target.ownerDocument) == false )
        {
            return;
        }

        keylist = GPG.listKeys(true);

        return_list = "";

        for (key in keylist) {

            return_list = return_list + gpgApi.removeDoublePoint(key) + ":" + gpgApi.removeDoublePoint(keylist[key]) + ",";
        }

        returnData.setAttribute('list', return_list);
        returnData.setAttribute('result', 'list-ok');

    },

    // Return 'check-ok' in 'result' (or 'check-err' is there is a problem) if the sign is valid.
    // Return in 'ckeck-infos' info on sign
    // Paramters : 'auth_key' --> the key for the website, 'text' -> the text to check
    check: function ( event ) {


        data = gpgApi.getDataNode(event.target);

        key_auth = data.getAttribute('auth_key');

        returnData = gpgApi.getReturnDataNode(event.target);

        if (key_auth == '' || key_auth == undefined || gpgApi.isAuth(key_auth, event.target.ownerDocument) == false )
        {
            return;
        }

        text = data.getAttribute('text');

        if (text == "") {
			returnData.setAttribute('result', 'check-err');
            returnData.setAttribute('error', 'no-data');
			return;
		}

		var result = GPG.baseVerify(text);

		// For I18N
		var i18n = document.getElementById("firegpg-strings");

		if (result == "noGpg") {
            returnData.setAttribute('result', 'check-err');
            returnData.setAttribute('error', 'no-gpg');
			return;
        }
        else if (result == "erreur")
        {
            returnData.setAttribute('result', 'check-err');
            returnData.setAttribute('error', 'unknow');
			return;
        }
		else if (result == "erreur_bad")
        {
            returnData.setAttribute('result', 'check-err');
            returnData.setAttribute('error', 'bad-sign');
			return;
        }
        else if (result == "erreur_no_key")
        {
            returnData.setAttribute('result', 'check-err');
            returnData.setAttribute('error', 'no-key');
			return;
        }
		else {

            var infos = result.split(" ");
            infos2 = "";

            for (var ii = 1; ii < infos.length; ++ii)
			{  infos2 = infos2 + infos[ii] + " ";}

			returnData.setAttribute('result', 'check-ok');
            returnData.setAttribute('check-infos', infos2);

            return;

        }

        returnData.setAttribute('result', 'check-err');
        returnData.setAttribute('error', 'unknow');

    },

    // Return 'sign-ok' in 'result' (or 'sign-err' is there is a problem) if makeing a sign was successfull
    // Return in 'text' a signed text
    // Paramters : 'auth_key' --> the key for the website, 'text' -> the text to check, 'force-key' --> optional, to force the gpg's key to use
    sign: function ( event ) {


        data = gpgApi.getDataNode(event.target);

        key_auth = data.getAttribute('auth_key');

        returnData = gpgApi.getReturnDataNode(event.target);

        if (key_auth == '' || key_auth == undefined || gpgApi.isAuth(key_auth, event.target.ownerDocument) == false )
        {
            return;
        }

        text = data.getAttribute('text');
        keyID = data.getAttribute('force-key');

        if (text == "") {
			returnData.setAttribute('result', 'sign-err');
            returnData.setAttribute('error', 'no-data');
			return;
		}

        // Needed for a sign
        if(keyID == null)
            keyID = getSelfKey();
		if(keyID == null)
			return;

		var password = getPrivateKeyPassword(false,gpgApi.getDomain(event.target.ownerDocument.location));
		if(password == null)
			return;

        var result = GPG.baseSign(text,password,keyID);
		var crypttext = result.output;
		var sdOut2 = result.sdOut2;
		result = result.sdOut;



		// For I18N
		var i18n = document.getElementById("firegpg-strings");

		if (result == "erreur")
        {
            returnData.setAttribute('result', 'sign-err');
            returnData.setAttribute('error', 'unknow');
			return;
        }
		else if (result == "erreurPass")
        {
            returnData.setAttribute('result', 'sign-err');
            returnData.setAttribute('error', 'bad-pass');
			return;
        }
		else {

			returnData.setAttribute('result', 'sign-ok');
            returnData.setAttribute('text', crypttext);

            return;

        }

        returnData.setAttribute('result', 'sign-err');
        returnData.setAttribute('error', 'unknow');

    },

    // Return 'signandencrypt-ok' in 'result' (or 'signandencrypt-err' is there is a problem) if makeing a signed and encrypted text was successfull
    // Return in 'text' the encrypted  text
    // Paramters : 'auth_key' --> the key for the website, 'text' -> the text to check, 'keys' --> the keys list, 'force-key' --> optional, to force the gpg's key to use
    signandencrypt: function ( event ) {


        data = gpgApi.getDataNode(event.target);

        key_auth = data.getAttribute('auth_key');

        returnData = gpgApi.getReturnDataNode(event.target);

        if (key_auth == '' || key_auth == undefined || gpgApi.isAuth(key_auth, event.target.ownerDocument) == false )
        {
            return;
        }

        text = data.getAttribute('text');
        keys = data.getAttribute('keys');

        if (text == "") {
			returnData.setAttribute('result', 'signandencrypt-err');
            returnData.setAttribute('error', 'no-data');
			return;
		}

        keyID = data.getAttribute('force-key');

        // Needed for a sign
        if(keyID == null)
            keyID = getSelfKey();
		if(keyID == null)
			return;

        keyIdList = keys.split(/;/g);

        var password = getPrivateKeyPassword(false,gpgApi.getDomain(event.target.ownerDocument.location));
		if(password == null)
			return

        // We get the result
		var result = GPG.baseCryptAndSign(text, keyIdList,false,password, keyID);
		var crypttext = result.output;
		var sdOut2 = result.sdOut2;
		result = result.sdOut;

		if (result == "erreur")
        {
            returnData.setAttribute('result', 'signandencrypt-err');
            returnData.setAttribute('error', 'unknow');
			return;
        }
		else if (result == "erreurPass")
        {
            returnData.setAttribute('result', 'signandencrypt-err');
            returnData.setAttribute('error', 'bad-pass');
			return;
        }
		else {

			returnData.setAttribute('result', 'signandencrypt-ok');
            returnData.setAttribute('text', crypttext);

            return;

        }

        returnData.setAttribute('result', 'signandencrypt-err');
        returnData.setAttribute('error', 'unknow');

    },


    // Return 'encrypt-ok' in 'result' (or 'encrypt-err' is there is a problem) if makeing a ecnrypted text was successfull
    // Return in 'text' the encrypted  text
    // Paramters : 'auth_key' --> the key for the website, 'text' -> the text to check, 'keys' --> the keys list
    encrypt: function ( event ) {


        data = gpgApi.getDataNode(event.target);

        key_auth = data.getAttribute('auth_key');

        returnData = gpgApi.getReturnDataNode(event.target);

        if (key_auth == '' || key_auth == undefined || gpgApi.isAuth(key_auth, event.target.ownerDocument) == false )
        {
            return;
        }

        text = data.getAttribute('text');
        keys = data.getAttribute('keys');

        if (text == "") {
			returnData.setAttribute('result', 'encrypt-err');
            returnData.setAttribute('error', 'no-data');
			return;
		}

        keyIdList = keys.split(/;/g);

        // We get the result
		var result = GPG.baseCrypt(text, keyIdList);
		var crypttext = result.output;
		var sdOut2 = result.sdOut2;
		result = result.sdOut;

		if (result == "erreur")
        {
            returnData.setAttribute('result', 'encrypt-err');
            returnData.setAttribute('error', 'unknow');
			return;
        }
		else {

			returnData.setAttribute('result', 'encrypt-ok');
            returnData.setAttribute('text', crypttext);

            return;

        }

        returnData.setAttribute('result', 'encrypt-err');
        returnData.setAttribute('error', 'unknow');

    },

    // Return 'decrypt-ok' in 'result' (or 'decrypt-err' is there is a problem) if trying to decrypt a text was successfull
    // Return in 'text' the decrypted text
    // Paramters : 'auth_key' --> the key for the website, 'text' -> the text to decrypt
    decrypt: function ( event ) {


        data = gpgApi.getDataNode(event.target);

        key_auth = data.getAttribute('auth_key');

        returnData = gpgApi.getReturnDataNode(event.target);

        if (key_auth == '' || key_auth == undefined || gpgApi.isAuth(key_auth, event.target.ownerDocument) == false )
        {
            return;
        }

        text = data.getAttribute('text');

        if (text == "") {
			returnData.setAttribute('result', 'decrypt-err');
            returnData.setAttribute('error', 'no-data');
			return;
		}

        // Needed for decrypt

		var password = getPrivateKeyPassword(false,gpgApi.getDomain(event.target.ownerDocument.location));
		if(password == null)
			return;

        // We get the result
		var result = GPG.baseDecrypt(text,password);
		var crypttext = result.output;
		var sdOut2 = result.sdOut2;
		result = result.sdOut;



		// For I18N
		var i18n = document.getElementById("firegpg-strings");

		if (result == "erreur")
        {
            returnData.setAttribute('result', 'decrypt-err');
            returnData.setAttribute('error', 'unknow');
			return;
        }
		else if (result == "erreurPass")
        {
            returnData.setAttribute('result', 'decrypt-err');
            returnData.setAttribute('error', 'bad-pass');
			return;
        }
		else {

            //If there was a sign with the crypted text
			if (result == "signValid")
			{
				var infos = sdOut2.split(" ");
				signAndCryptResult = "";
				for (var ii = 1; ii < infos.length; ++ii)
				{  signAndCryptResult = signAndCryptResult + infos[ii] + " ";}

                returnData.setAttribute('sign-info', signAndCryptResult);
			}


			returnData.setAttribute('result', 'decrypt-ok');
            returnData.setAttribute('text', crypttext);

            return;

        }

        returnData.setAttribute('result', 'decrypt-err');
        returnData.setAttribute('error', 'unknow');

    },




    // Change # to #1, : to #2 and , to #3 in a string
    removeDoublePoint: function(s) {

        s = s.toString();

        s = s.replace(/#/g,"#1");
        s = s.replace(/:/g,"#2");
        s = s.replace(/,/g,"#2");

        return s;
    },


    // Return the node with data attributes for return
    getReturnDataNode: function(d) {

        liste = d.getElementsByTagName( "firegpg:returndata" );

        return liste[0]

    },

    // Return true if the user have sign to use FireGPG's api
    isAuth: function(key, document) {

        try {

            access = this.getAccessList();

            if (access[key.toString()] == gpgApi.getDomain(document.location))
                return true;

        } catch (e) { }

        return false;

    },

    //Get the current domain for the page, or the webpage if we're in local (file://)
    getDomain: function(url) {


        var first_split = url.toString().split("//");

        if (first_split[0] == "file:")
        {
            url = url.toString().replace(",","GPG1");
            url = url.toString().replace(";","GPG2");
            return url;
        }

        var without_resource = first_split[1];

        var second_split = without_resource.split("/");

        var domain = second_split[0];

        return domain;

    },

    //Return the list of access
    getAccessList: function() {

        var array_return = new Array();

        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                       getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");
        var auths_chain  = ";,;";
        try {
            auths_chain = prefs.getCharPref("api_list_auth");
        } catch (e) { auths_chain = ";,;";  }

        if (auths_chain == ";,;" || auths_chain == "" || auths_chain ==  null)
            return array_return;

        var reg=new RegExp(";", "g");

        splitage = auths_chain.split(reg);

        for (var i=0; i< splitage.length; i++) {

            domain_and_key = splitage[i];

            var reg2 = new RegExp(",", "g");

            domain_and_key = domain_and_key.split(reg2);

            if (domain_and_key[1] != undefined && domain_and_key[1] != "" && domain_and_key[1] != 0) {

                array_return[domain_and_key[1]] = domain_and_key[0];

            }
        }

        return array_return;

    },

    //Set a new list of access
    setAccessList: function(arrayy) {

        var final_data = ';';

        for (var key in arrayy) {

            final_data = final_data + arrayy[key] + ',' + key + ';';

        }

        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                       getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");

        prefs.setCharPref("api_list_auth",final_data);


    },


};

window.addEventListener("load", function(e) { gpgApi.onLoad(e); }, false);
