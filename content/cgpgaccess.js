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

/* Constant: nsIExtensionManager_CONRACTID
  The component id to manage extentions */
const nsIExtensionManager_CONRACTID = "@mozilla.org/extensions/manager;1";

/* Constant: NS_APPINFO_CONTRACTID
  The component id to test the current os */
const NS_APPINFO_CONTRACTID = "@mozilla.org/xre/app-info;1";

/* Constant: FireGPG_OS
  The component to test the current os. */
const FireGPG_OS = Components.classes[NS_APPINFO_CONTRACTID].getService(Components.interfaces.nsIXULRuntime).OS;

/* Constant: OS_WINDOWS
  The value retruned by components if the os is window */
const OS_WINDOWS = "WINNT";

/* Constant: idAppli
  The id of firegpg. */
const idAppli = "firegpg@firegpg.team";

/*
   Constants: States of the xpcom support.

   XPCOM_STATE_NEVERTESTED - Never tryied to use the xpcom
   XPCOM_STATE_WORKS    - The xpcom works and we use it.
   XPCOM_STATE_DONTWORK   - The xpcom dosen't work.
   XPCOM_STATE_DISABLED   - The xpcom is disabled
   XPCOM_STATE_DONTWORK_IN_0_5   - The xpcom of version 0.5 dosen't work.
*/



const XPCOM_STATE_DONTWORK_IN_0_5 = 2;
const XPCOM_STATE_DISABLED_IN_0_5 = 3;

const XPCOM_STATE_NEVERTESTED = 0;
const XPCOM_STATE_WORKS = 1;
const XPCOM_STATE_DONTWORK = 2;
const XPCOM_STATE_DISABLED = 3;

/* Constant: comment
  The firegpg's comment to add to gnupg texts. */
const comment = "http://getfiregpg.org";


/*
    Variable: useGPGTrust
    If we have to disable trusting system of gnupg. Set in cGpg.
 */
var useGPGTrust = true;



/*
    Function: Witch_GPGAccess

    This function will determing and 'build' the class to access gpg.

    She test if the xpcom is usable, update information about the status, and select the rights function to access to gnupg as the current situtation.

    She return the GPGAccess class.

*/
function Witch_GPGAccess () {

    if (loadXpcom()) {

        if (GPGAccess.isUnix()) {


            GPGAccess.tryToFoundTheRightCommand = GPGAccessUnixXpcom.tryToFoundTheRightCommand;


        } else {

            GPGAccess.tryToFoundTheRightCommand = GPGAccessWindowsXpcom.tryToFoundTheRightCommand;


        }

        return GPGAccess;

    } else {


        var i18n = document.getElementById("firegpg-strings");

        alert(i18n.getString('noipc'));


        return GPGAccess;
    }

}

/*
    Function: loadXpcom

    This function try to load the xpcom.

    She return false if an erreor happend, or ture if all works.

*/
function loadXpcom () {


    try {
     	var ipcService = Components.classes["@mozilla.org/process/ipc-service;1"].getService();
        ipcService = ipcService.QueryInterface(Components.interfaces.nsIIPCService);
	} catch (err) {

		return false;
    }

    GPGAccess.ipcService = ipcService;

    return true;

}


/*
   Class: GPGAccess
   This is the main class to access to the gnupg executable.
*/
var GPGAccess = {


    /*
        Variable: FireGPGCall
        The FireGPGCall xpcom. Null if not available.
    */
    FireGPGCall: null,

    /*
        Function: isUnix
        Return true if we are on a unix system, false if we're on windows.
    */
    isUnix: function() {
       if(FireGPG_OS != OS_WINDOWS)
           return true;

       return false;
   },

    /*
        Function: getRunningCommand
        Return the content of a script to execute GnuPG. For no-xpcom classes.
    */
    getRunningCommand: function () {
        return getContent("chrome://firegpg/content/run" + (this.isUnix() ? '.sh' : '.bat'));
    },


    /*
        Function: getGPGBonusCommand
        Return the custom arguement the user want to add.
    */
    getGPGBonusCommand: function() {
        var arguement = "";
        try {
                var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                               getService(Components.interfaces.nsIPrefService);
                prefs = prefs.getBranch("extensions.firegpg.");
                arguement = prefs.getCharPref("gpg_user_options");
        } catch (e)  { }

        if (arguement == '')
            return "";

        //We remove double-spaces
        var reg=new RegExp("  ", "gi");
        arguement = arguement.replace(reg," "); // TODO: It's UGLY !
        arguement = arguement.replace(reg," ");
        arguement = arguement.replace(reg," ");
        arguement = arguement.replace(reg," ");
        arguement = arguement.replace(reg," ");

        //Spaces at beginig and and
        arguement =  arguement.replace(/^\s+/, '').replace(/\s+$/, '');

        if (arguement == '')
            return "";

        // SPACE BEFORE, NO SPACE IN LAST CHARACTER.
        return " " + arguement;
    },

     /*
        Function: getGPGCommentArgument
        Return a arguement to add a gnupg comment. If desactivated, return false.
    */
    getGPGCommentArgument: function() {
       var comment_argument = "";
       var key = "extensions.firegpg.show_website";
       var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                              getService(Components.interfaces.nsIPrefBranch);

       if(prefs.getPrefType(key) == prefs.PREF_BOOL)
           if(prefs.getBoolPref(key))
               comment_argument = ' --comment ' + comment;

       return comment_argument;
   },


    /*
        Function: getGPGCommentArgument
        Return a arguement to disable or not the gnupg agent, as set in the options.
    */
    getGPGAgentArgument: function() {

       useGPGAgent = false;

       var key = "extensions.firegpg.use_gpg_agent";
       var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                              getService(Components.interfaces.nsIPrefBranch);

       if(prefs.getPrefType(key) == prefs.PREF_BOOL)
           if(prefs.getBoolPref(key))
               useGPGAgent = true;


       if (!useGPGAgent)
           return ' --no-use-agent';
       else
           return '';
   },

    /*
        Function: getGPGTrustArgument

        Return a arguement to force gnupg to use not trusted keys.

        Parameters:
            fromGpgAuth - _Optionnal_  use the GpgAuth's parameter

    */
    getGPGTrustArgument: function (fromGpgAuth) {

        if (fromGpgAuth != undefined && fromGpgAuth == true)
            if ( gpgAuth.prefs.prefHasUserValue( '.global.trust_model' ) && gpgAuth.prefs.getCharPref( '.global.trust_model' ) != "" )
                return ' --trust-model ' + gpgAuth.prefs.getCharPref( '.global.trust_model' );

       if (useGPGTrust)
           return ' --trust-model always';
       else
           return '';
   },

   	/*
        Function: getGPGCommand
        Return the command to execute GnuPG
    */
	getGPGCommand: function () {
		return this.GpgCommand;
	},

    /*
       Function: getBaseArugments
       Return the commons arugments for all GnuPG's commands
    */
    getBaseArugments: function () {
        return this.getGPGBonusCommand()  + " --quiet --no-tty --no-verbose --status-fd 2 --armor --batch" + this.getGPGAgentArgument();
    },

    /*
        Function: runGnupg
        Execute gnupg.

        Parameters:
        parameters - The parameters for gnupg.
        sdtIn - The data to send to gnupg on the sdIn
        charset - _Optional_. The charset to read the sdtIn (UTF-8 by default)

        Return:
            The sdOut (.out) and the sdErr (.err) of the execution
    */
    runGnupg: function(parameters, sdtIn, charset)  {

        if (charset == undefined)
            charset = "utf-8";

        if (sdtIn == undefined)
            sdtIn = "";


        var outStrObj = new Object();
        var outLenObj = new Object();
        var errStrObj = new Object();
        var errLenObj = new Object();

        fireGPGDebug(this.getGPGCommand() + " " + parameters + "[" + sdtIn + "]",'GPGAccessCallerUnixXpcom');

        parameters = parameters.split(/ /gi);

        gpgArgs = new Array();

        for(i = 0; i < parameters.length; i++)
            if(parameters[i] != "" && parameters[i] != null)
                gpgArgs.push(parameters[i]);


        try {

            var fileobj = Components.classes[NS_LOCALEFILE_CONTRACTID].
                                 createInstance(Components.interfaces.nsILocalFile);

            fileobj.initWithPath( this.getGPGCommand());

            this.ipcService.runPipe(fileobj, gpgArgs, gpgArgs.length, "", sdtIn, sdtIn.length, [], 0, outStrObj, outLenObj, errStrObj, errLenObj);

        var retour = new Object();


        retour.out = EnigConvertToUnicode(outStrObj.value, charset);
        retour.err = EnigConvertToUnicode(errStrObj.value, charset);

        return retour;

        } catch  (e) {

        }

        return null;
    },

    /*
        Function: sign
        Sign a text.

        Parameters:
            text - The data to sign
            password - The password of the private key
            keyID - The ID of the private key to use.
            notClear - Do not make a clear sign

        Return:
            A <GPGReturn> structure.


    */
    sign: function (text, password, keyID, notClear) {

			result = this.runGnupg(this.getBaseArugments() +
					" --default-key " + keyID +
                    " --output -" +
					" --passphrase-fd 0 " +
					this.getGPGCommentArgument() +
					" --"  + (!notClear ? "clear" : "") +"sign "
				, password + "\n" + text );

		var result2 = new GPGReturn();
		result2.output = result.out;
		result2.sdOut = result.err;

		return result2;
    },

    /*
        Function: verify
        Verify a text.

        Parameters:
            text - A text with the GnuPG data to test.

        Return:
            A <GPGReturn> structure.


    */
    verify: function(text) {

		result = this.runGnupg(this.getBaseArugments() +  this.getGPGTrustArgument() + " --verify", text);

        var result2 = new GPGReturn();
		result2.sdOut = result.err;

		// We return result
		return result2;
    },

    /*
        Function: listkey
        List  keys.

        Parameters:
            onlyPrivate - Boolean, set to true if only a private key list is wanted.

        Return:
            A <GPGReturn> structure.


    */
    listkey: function(onlyPrivate) {
		var mode = "--list-keys";

		if (onlyPrivate == true)
			mode = "--list-secret-keys";

		result = this.runGnupg(this.getBaseArugments() + " --with-colons " + mode,"","ISO-8859-1");

        var result2 = new GPGReturn();
		result2.sdOut = result.out;

        // We return result
		return result2;
    },

    /*
        Function: crypt
        Encrypt a text.

        Parameters:
            text - The data to encrypt
            keyIdList - A key list of recipients
            fromGpgAuth - _Optional_. Set this to true if called form GpgAuth
            binFileMode - _Optional_. Set this to true if data is binary (no text)

        Return:
            A <GPGReturn> structure.


    */
    crypt: function(text, keyIdList, fromGpgAuth, binFileMode) {

		if (fromGpgAuth == null)
			fromGpgAuth = false;

        if (binFileMode == null)
			binFileMode = false;

		/* key id list in the arguments */
		var keyIdListArgument = '';
		for(var i = 0; i < keyIdList.length; i++)
			keyIdListArgument += ((i > 0) ? ' ' : '') + '-r ' + keyIdList[i];

		result = this.runGnupg(this.getBaseArugments() +  this.getGPGTrustArgument(fromGpgAuth) +
				" " + keyIdListArgument +
				this.getGPGCommentArgument() +
				" --output -" +
				" --encrypt", text);

		// The crypted text

		var result2 = new GPGReturn();
		result2.output = result.out;
		result2.sdOut = result.err;

		return result2;
    },

    /*
        Function: symetric
        Symetricaly encrypt a text.

        Parameters:
            text - The data to encrypt
            password - The password

        Return:
            A <GPGReturn> structure.


    */
    symetric: function(text, password) {

            result = this.runGnupg(this.getBaseArugments() +  this.getGPGTrustArgument() +
                    this.getGPGCommentArgument() +
                    " --passphrase-fd 0" +
                    " --output -" +
                    " --symmetric ",
                    password + "\n" + text);

		var result2 = new GPGReturn();
		result2.output = result.out;
		result2.sdOut = result.err;

		return result2;
    },

    /*
        Function: cryptAndSign
        Encrypt and sign a text.

        Parameters:
            text - The data to encrypt
            keyIdList - A key list of recipients
            fromGpgAuth -  Set this to true if called form GpgAuth
            password - The password of the private key
            keyID - The ID of the private key to use.
            binFileMode - _Optional_. Set this to true if data is binary (no text)


        Return:
            A <GPGReturn> structure.


    */
    cryptAndSign: function(text, keyIdList, fromGpgAuth, password, keyID, binFileMode) {


		if (fromGpgAuth == null)
			fromGpgAuth = false;

        if (binFileMode == null)
			binFileMode = false;

		/* key id list in the arguments */
		var keyIdListArgument = '';
		for(var i = 0; i < keyIdList.length; i++)
			keyIdListArgument += ((i > 0) ? ' ' : '') + '-r ' + keyIdList[i];

            result = this.runGnupg(this.getBaseArugments() +  this.getGPGTrustArgument(fromGpgAuth) +
                    " " + keyIdListArgument +
                    this.getGPGCommentArgument() +
                    " --default-key " + keyID +
                    " --passphrase-fd 0" +
                    " --sign" +
                    " --output -" +
                    " --encrypt ",
                    password + "\n" + text);

		// The crypted text
		var result2 = new GPGReturn();
		result2.output = result.out;
		result2.sdOut = result.err;

		return result2;
    },

    /*
        Function: decrypt
        Decrypt a text.

        Parameters:
            text - The data to decrypt
            password - The password of the private key

        Return:
            A <GPGReturn> structure.

    */
    decrypt: function(text,password) {

			result = this.runGnupg(this.getBaseArugments() +
					" --passphrase-fd 0 " +
					" --output -" +
					" --decrypt"
				, password + "\n" + text);

		// The decrypted text
		var result2 = new GPGReturn();
		result2.output = result.out;
		result2.sdOut = result.err;

		return result2;
    },

    /*
        Function: selfTest
        Return true if we're able to call GnuPG.

    */
    selfTest: function() {
        //One test is ok, if the command dosen't change, it's should works..

		result = this.runGnupg(this.getBaseArugments()  + " --version");

		// If the work Foundation is present, we can think that gpg is present ("... Copyright (C) 2006 Free Software Foundation, Inc. ...")
		if (!result || !result.out || result.out.indexOf("Foundation") == -1)
			return false;

		return true;
    },

    /*
        Function: kimport
        Import a key.

        Parameters:
            text - A text with the GnuPG data to import.

        Return:
            A <GPGReturn> structure.

    */
    kimport: function(text) {

		result = this.runGnupg(this.getBaseArugments()  + " --import " , text);

        var result2 = new GPGReturn();
		result2.sdOut = result.err;

		// We return result
		return result2;
    },

    /*
        Function: kexport
        Export a key.

        Parameters:
            key - The key id to export.

        Return:
            A <GPGReturn> structure.

    */
    kexport: function(key) {
		result = this.runGnupg(this.getBaseArugments()  + " --export " + key);

        var result2 = new GPGReturn();
		result2.sdOut = result;

		// We return result
		return result2;
    },

    /*
        Function: runATest
        Test if we are currently able to run the a command.


        Parameters:
            option - The option to test.

        Return:
            A <GPGReturn> structure.

    */
    runATest: function(option) {
		result = this.runGnupg(this.getGPGBonusCommand() + " --status-fd 2 " + option + " --version");

		if(!result || !result.out || result.out.indexOf("Foundation") == "-1")
			return false;

		return true;
    },

    /*
        Function: tryToFoundTheRightCommand
        Do some test to be able to find a working GnuPG executable.
        This function is overwrited by the coresponding function of  <GPGAccessWindowsXpcom> or <GPGAccessUnixXpcom>

    */
    tryToFoundTheRightCommand: function () {
        return false;
    }

}


/*
    Class: GPGAccessWindowsXpcom

    This class has function for building command lines for GnuPG actions on windows, when the xpcom is available.

    *Please refer to functions marked as overwrited by this class in <GPGAccess> for the descriptions of this class's functions.*

    See Also:
        <GPGAccessUnixXpcom>

*/
var GPGAccessWindowsXpcom = {


    tryToFoundTheRightCommand: function () {
        //Two choises : 1) The user want to set the path himself, so we use this.
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                               getService(Components.interfaces.nsIPrefService);
        prefs = prefs.getBranch("extensions.firegpg.");

        try {
            var force = prefs.getBoolPref("specify_gpg_path");
        }
        catch (e) {
            var force = false;
        }

        if (force == true)
            this.GpgCommand = prefs.getCharPref("gpg_path");
        else {

            //Or we will try to found a valid path.

            //1) If there are allready a path set, he can be valid.
            var gpg_path_in_options = prefs.getCharPref("gpg_path","");

            if (gpg_path_in_options != "") {
                this.GpgCommand = gpg_path_in_options;
                if (this.selfTest() == true)
                    return; //It's work, yourou.
            }

            //2) We have to guess some path to see if it's work...

            //TODO : Yes, it's horrible this copy/paste code...


            //GNU ?
            var testingcommand = "C:\\Program Files\\GNU\\GnuPG\\gpg.exe";
            this.GpgCommand = testingcommand;
            if (this.selfTest() == true)
            {
                //Don't forget to save the information for the nextime !
                prefs.setCharPref("gpg_path",testingcommand);
                return; //It's work, We're the best.
            }

            //Windows Privacy Tools ?
            var testingcommand = "C:\\Program Files\\Windows Privacy Tools\\GnuPG\\gpg.exe";
            this.GpgCommand = testingcommand;
            if (this.selfTest() == true)
            {
                prefs.setCharPref("gpg_path",testingcommand);
                //Don't forget to save the information for the nextime !
                return; //It's work, mwahaha.
            }

            //Maybe in the path ?
            var testingcommand = "gpg.exe";
            this.GpgCommand = testingcommand;
            if (this.selfTest() == true)
            {
                //Don't forget to save the information for the nextime !
                prefs.setCharPref("gpg_path",testingcommand);
                return; //It's work, hehehe.
            }

        }
    }

}

/*
    Class: GPGAccessUnixXpcom

    This class has function for building command lines for GnuPG actions on linux, when the xpcom is available.

    *Please refer to functions marked as overwrited by this class in <GPGAccess> for the descriptions of this class's functions.*

    See Also:
        <GPGAccessWindowsXpcom>

*/
var GPGAccessUnixXpcom = {



    tryToFoundTheRightCommand: function () {
        //Year, on linux no test, because it's a good Os.
        //We only look if the user wants to force the path.
        //Edit : now a test for macOs Users.
        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                               getService(Components.interfaces.nsIPrefService);
        prefs = prefs.getBranch("extensions.firegpg.");

        try {
            var force = prefs.getBoolPref("specify_gpg_path");
        }
        catch (e) {
            var force = false;
        }

        if (force == true)
            this.GpgCommand = prefs.getCharPref("gpg_path");
        else {

            //First, test if it's had worked
            var gpg_path_in_options = prefs.getCharPref("gpg_path","");

            if (gpg_path_in_options != "") {
                this.GpgCommand = gpg_path_in_options;
                if (this.selfTest() == true)
                    return; //It's work, yourou.
            }


            //On mac, it's here (usualy)
            var testingcommand = "/usr/local/bin/gpg";
            this.GpgCommand = testingcommand;
            if (this.selfTest() == true)
            {
                //Don't forget to save the information for the nextime !
                prefs.setCharPref("gpg_path",testingcommand);
                return; //It's work, We're the best.
            }

                //The default
            var testingcommand = "/usr/bin/gpg";
            this.GpgCommand = testingcommand;
            if (this.selfTest() == true)
            {
                //Don't forget to save the information for the nextime !
                prefs.setCharPref("gpg_path",testingcommand);
                return; //It's work, We're the best.
            }

            //Shouldn't work, but why not..
            prefs.setCharPref("gpg_path","gpg");
            this.GpgCommand = "gpg";
        }
    }

}





// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
