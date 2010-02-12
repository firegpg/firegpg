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


/* Constant: nsIExtensionManager_CONRACTID
  The component id to manage extentions */
FireGPG.Const.nsIExtensionManager_CONRACTID =  "@mozilla.org/extensions/manager;1";

/* Constant: NS_APPINFO_CONTRACTID
  The component id to test the current os */
FireGPG.Const.NS_APPINFO_CONTRACTID = "@mozilla.org/xre/app-info;1";

/* Constant: FireGPG.Const.OS
  The component to test the current os. */
FireGPG.Const.OS = Components.classes[FireGPG.Const.NS_APPINFO_CONTRACTID].getService(Components.interfaces.nsIXULRuntime).OS;

/* Constant: OS_WINDOWS
  The value retruned by components if the os is window */
FireGPG.Const.OS_WINDOWS = "WINNT";

/* Constant: idAppli
  The id of firegpg. */
FireGPG.idAppli = "firegpg@firegpg.team";

/*
   Constants: States of the xpcom support. Deprecated

   XPCOM_STATE_NEVERTESTED - Never tryied to use the xpcom
   XPCOM_STATE_WORKS    - The xpcom works and we use it.
   XPCOM_STATE_DONTWORK   - The xpcom doesn't work.
   XPCOM_STATE_DISABLED   - The xpcom is disabled
   XPCOM_STATE_DONTWORK_IN_0_5   - The xpcom of version 0.5 doesn't work.


const XPCOM_STATE_DONTWORK_IN_0_5 = 2;
const XPCOM_STATE_DISABLED_IN_0_5 = 3;

const XPCOM_STATE_NEVERTESTED = 0;
const XPCOM_STATE_WORKS = 1;
const XPCOM_STATE_DONTWORK = 2;
const XPCOM_STATE_DISABLED = 3;
*/

/* Constant: comment
  The firegpg's comment to add to gnupg texts. */
FireGPG.Const.comment = "Use{$SPACE}GnuPG{$SPACE}with{$SPACE}Firefox{$SPACE}:{$SPACE}http://getfiregpg.org{$SPACE}(Version:{$SPACE}" + FireGPG.Const.Version + ")";


/*
    Variable: useGPGTrust
    If we have to disable trusting system of gnupg. Set in cGpg.
 */
FireGPG.useGPGTrust = true;


/* Variable: FireGPG.Const.CurrentFolder
  The folder of Firefox
*/
FireGPG.Const.CurrentFolder = Components.classes["@mozilla.org/file/directory_service;1"].
              getService(Components.interfaces.nsIProperties).
              get("CurProcD", Components.interfaces.nsIFile).path;





/*
    Function: loadXpcom

    This function try to load the xpcom.

    She return false if an erreor happend, or ture if all works.

*/
 FireGPG.loadXpcom = function () {

    try {
     	var ipcService = Components.classes["@mozilla.org/process/ipc-service;1"].getService();
        ipcService = ipcService.QueryInterface(Components.interfaces.nsIIPCService);
	} catch (err) {

		return false;
    }

    FireGPG.GPGAccess.ipcService = ipcService;

    return true;

}

/*
    Function: FireGPG.isGpgAgentActivated
    Return true if we should use the agent (option and environement variable set
*/
FireGPG.isGpgAgentActivated = function() {
    var useGPGAgent = false;

       var key = "extensions.firegpg.use_gpg_agent";
       var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                              getService(Components.interfaces.nsIPrefBranch);

       if(prefs.getPrefType(key) == prefs.PREF_BOOL)
           if(prefs.getBoolPref(key))
               useGPGAgent = true;

    var info = "";
        try {
            info = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment).get('GPG_AGENT_INFO');
        } catch (e) {
        }

    if (info == "")
        useGPGAgent = false;


    return useGPGAgent;
}

/*
   Class: FireGPGGPGAccess
   This is the main class to access to the gnupg executable.
*/
FireGPG.GPGAccess = {


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
       if(FireGPG.Const.OS != FireGPG.Const.OS_WINDOWS)
           return true;

       return false;
   },

    /*
        DEPRECIATED Function: getRunningCommand
        Return the content of a script to execute GnuPG. For no-xpcom classes.
    *//*
    getRunningCommand: function () {
        return FireGPG.Misc.getContent("chrome://firegpg/content/run" + (this.isUnix() ? '.sh' : '.bat'));
    },*/


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

        //Escape spaces in {$FXFolder}
        var currentFolder = FireGPG.Const.CurrentFolder.replace(/\s/g, '{$SPACE}');

        arguement = arguement.replace(/\{\$FXFolder\}/gi, currentFolder);

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
               comment_argument = ' --comment ' + FireGPG.Const.comment;

       return comment_argument;
   },


    /*
        Function: getGPGCommentArgument
        Return a arguement to disable or not the gnupg agent, as set in the options.
    */
    getGPGAgentArgument: function() {

       if (!FireGPG.isGpgAgentActivated())
           return ' --no-use-agent';
       else {
            info = Components.classes["@mozilla.org/process/environment;1"].getService(Components.interfaces.nsIEnvironment).get('GPG_AGENT_INFO');

           return ''; // (NB, handeld with environement !!) --use-agent --gpg-agent-info ' + info ;
       }
   },

    /*
        Function: getGPGTrustArgument

        Return a arguement to force gnupg to use not trusted keys.

        Parameters:
            fromGpgAuth - _Optionnal_  use the GpgAuth's parameter

    */
    getGPGTrustArgument: function (fromGpgAuth,fromDTA) {

        if (fromGpgAuth != undefined && fromGpgAuth == true)
            if ( gpgAuth.prefs.prefHasUserValue( '.global.trust_model' ) && gpgAuth.prefs.getCharPref( '.global.trust_model' ) != "" )
                return ' --trust-model ' + gpgAuth.prefs.getCharPref( '.global.trust_model' );

       if (FireGPG.useGPGTrust && !fromDTA)
           return ' --trust-model always';
       else
           return '';
   },

   	/*
        Function: getGPGCommand
        Return the command to execute GnuPG
    */
	getGPGCommand: function () {

		return this.GpgCommand.replace(/\{\$FXFolder\}/gi, FireGPG.Const.CurrentFolder);
	},

    /*
       Function: getBaseArugments

        Parameters:
            fromGpgAuth - _Optional_  use the GpgAuth's parameter to add verbosity to aquire the key and subkey ID when encrypting.

       Return the commons arguments for all GnuPG's commands
    */
    getBaseArugments: function (fromGpgAuth) {
        if (fromGpgAuth != undefined && fromGpgAuth == true) {
    		return this.getGPGBonusCommand()  + " --quiet --no-tty --verbose --status-fd 2 --armor --batch" + this.getGPGAgentArgument();
		}
        return this.getGPGBonusCommand()  + " --quiet --no-tty --no-verbose --status-fd 2 --armor --batch" + this.getGPGAgentArgument();

    },

    /*
        Function: getProxyInformation
        Return the option to set the proxy for keyservers
    */
    getProxyInformation: function () {

        var proxy = "";
        try {
                var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                               getService(Components.interfaces.nsIPrefService);
                prefs = prefs.getBranch("extensions.firegpg.");
                proxy = prefs.getCharPref("keyserver_proxy");
        } catch (e)  { }

        if (proxy == "" || proxy == null)
            return '';

        return ' --keyserver-options http-proxy=' + proxy;

    },

    /*
        Function: getDiegestAlgo
        Return the option to set diegest algo to use for signs hashs
    */
    getDiegestAlgo: function () {

        var digest = "";
        try {
                var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                               getService(Components.interfaces.nsIPrefService);
                prefs = prefs.getBranch("extensions.firegpg.");
                digest = prefs.getCharPref("digest");
        } catch (e)  { }

        if (digest == "" || digest == null)
            return '';

       return ' --digest-algo ' + digest;

    },

    /*
       Function: getEnv
       Return environement parameters
    */
    getEnv: function() {

        return [];

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


		sdtIn = FireGPG.Misc.EnigConvertFromUnicode(sdtIn, charset);

        var outStrObj = new Object();
        var outLenObj = new Object();
        var errStrObj = new Object();
        var errLenObj = new Object();

        FireGPG.debug(this.getGPGCommand() + " " + parameters + "[" + sdtIn + "]",'FireGPGGPGAccessCallerUnixXpcom');

        var parametersS = parameters.split(/ /gi);

        var gpgArgs = new Array();

        for(i = 0; i < parametersS.length; i++)
            if(parametersS[i] != "" && parametersS[i] != null)
                gpgArgs.push(parametersS[i].replace(/\{\$SPACE\}/gi, ' '));

        env = this.getEnv();


        try {
            var fileobj = Components.classes[FireGPG.Misc.NS_LOCALEFILE_CONTRACTID].
                                 createInstance(Components.interfaces.nsILocalFile);

            fileobj.initWithPath( this.getGPGCommand());

	    if (!fileobj.exists()) {
               // command does not exist :p
               return null;
            }

        } catch  (e) {
            FireGPG.debug(e, 'rungpg/3', true);
	    // We don't have a working path for GnuPG
            return null;
        }

        try {
            this.ipcService.runPipe(fileobj, gpgArgs, gpgArgs.length, "", sdtIn, sdtIn.length, env, env.length, outStrObj, outLenObj, errStrObj, errLenObj);
        }
        catch (e) {

            if (!this.ipcService) //Pas de lib IPC
                return null;

            //Lib IPC mais ancienne version.

            var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefService);

            prefs = prefs.getBranch("extensions.firegpg.");

            var i18n = document.getElementById("firegpg-strings");

            try {
                var warning_user = prefs.getBoolPref("fireftp_already_warning",false);
            } catch (e) {
                warning_user = false;
            }

             try {
                var try_to_use_old_system = prefs.getBoolPref("fireftp_try_to_use_old_system",false);
            } catch (e) {
                try_to_use_old_system = false;
            }

            if (!warning_user) {

                try_to_use_old_system = confirm(i18n.getString('fireftp_warning'));


            }


            if (try_to_use_old_system) {

                try {
                   /// FireFTP version but it's crash some times firefox
                   this.ipcService.execPipe(this.getGPGCommand() + " " + parameters, false,  "", sdtIn, sdtIn.length,  env, env.length, outStrObj, outLenObj, errStrObj, errLenObj);
                } catch (e) {
                    FireGPG.debug(e, 'rungpg/1', true);
                }

                //If we're here, it's didn't crash
                if (!warning_user)
                    alert(i18n.getString('fireftp_pass'));

                prefs.setBoolPref("fireftp_already_warning",true);
                prefs.setBoolPref("fireftp_try_to_use_old_system",true);

            } else {

                prefs.setBoolPref("fireftp_already_warning",true);


            }



        }

        try {

            var retour = new Object();

            retour.out = FireGPG.Misc.EnigConvertToUnicode(outStrObj.value, charset);
            retour.err = FireGPG.Misc.EnigConvertToUnicode(errStrObj.value, charset);

            return retour;

        } catch  (e) {
            FireGPG.debug(e, 'rungpg/2', true);
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
            fileMode - _Optional_. Indicate the user want to sign a file
            fileFrom - _Optional_. The file to sign
            fileTo - _Optional_. The file where to put the signature

        Return:
            A <FireGPG.GPGReturn> structure.


    */
    sign: function (text, password, keyID, notClear, fileMode, fileFrom, fileTo) {

        var result;

        if (!fileMode) {

            if (FireGPG.isGpgAgentActivated()) {

                result = this.runGnupg(this.getBaseArugments() +
                        " --default-key " + keyID +
                        " --output -" +
                        this.getGPGCommentArgument() +
                        this.getDiegestAlgo() +
                        " --"  + (!notClear ? "clear" : "") +"sign "
                    ,  text );

            } else {

                result = this.runGnupg(this.getBaseArugments() +
                        " --default-key " + keyID +
                        " --output -" +
                        " --passphrase-fd 0 " +
                        this.getGPGCommentArgument() +
                        this.getDiegestAlgo() +
                        " --"  + (!notClear ? "clear" : "") +"sign "
                    , password + "\n" + text );

            }

        } else {
                if (FireGPG.isGpgAgentActivated()) {

                result = this.runGnupg(this.getBaseArugments() +
                        " --default-key " + keyID +
                        " --output " + fileTo.replace(/\s/g, '{$SPACE}') +
                        this.getGPGCommentArgument() +
                        this.getDiegestAlgo() +
                        " --detach-sign " + fileFrom.replace(/\s/g, '{$SPACE}')
                    ,  '' );

            } else {

                result = this.runGnupg(this.getBaseArugments() +
                        " --default-key " + keyID +
                        " --output " + fileTo.replace(/\s/g, '{$SPACE}') +
                        " --passphrase-fd 0 " +
                        this.getGPGCommentArgument() +
                        this.getDiegestAlgo() +
                        " --detach-sign " + fileFrom.replace(/\s/g, '{$SPACE}')
                    , password + "\n"  );

            }

        }

		var result2 = new FireGPG.GPGReturn();
		result2.output = result.out;
		result2.sdOut = result.err;

		return result2;
    },

    /*
        Function: verify
        Verify a text.

        Parameters:
            text - A text with the GnuPG data to test.
            charset - _Optional_, the charset to use
            fileMode - _Optional_. Indicate the user want to verify the signature of a file
            fileFrom - _Optional_. The file to verify
            fileSig - _Optional_. The file with the signature

        Return:
            A <FireGPG.GPGReturn> structure.

    */
    verify: function(text, charset, fileMode, fileFrom, fileSig, fileDataForSign, fromDTA) {

        if (fileDataForSign != undefined && fileDataForSign != '') {
            fileSig = '-';
            text = fileDataForSign;
        }
// always check validity  this.getGPGTrustArgument(undefined, fromDTA) 
		var result = this.runGnupg(this.getBaseArugments() + " --verify" + (fileMode ? ' ' + fileSig.replace(/\s/g, '{$SPACE}') + ' ' + fileFrom.replace(/\s/g, '{$SPACE}') : ''), text, charset);
        var result2 = new FireGPG.GPGReturn();
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
            A <FireGPG.GPGReturn> structure.

    */
    listkey: function(onlyPrivate) {
		var mode = "--list-keys";

		if (onlyPrivate == true)
			mode = "--list-secret-keys";

		var result = this.runGnupg(this.getBaseArugments() + " --fixed-list-mode --fingerprint --with-colons " + mode,"","ISO-8859-1");

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.out;

        // We return result
		return result2;
    },

    /*
        Function: listSigns
        List  signs.

        Return:
            A <FireGPG.GPGReturn> structure.

    */
    listsigns: function(key) {

		var result = this.runGnupg(this.getBaseArugments() + " --with-colons --list-sigs " + key,"","ISO-8859-1");

        var result2 = new FireGPG.GPGReturn();
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
            fileMode - _Optional_. Indicate the user want to encrypt a file
            fileFrom - _Optional_. The file to encrypt
            fileTo - _Optional_. The file where to put the encrypted content

        Return:
            A <FireGPG.GPGReturn> structure.


    */
    crypt: function(text, keyIdList, fromGpgAuth, binFileMode, fileMode, fileFrom, fileTo) {

		if (fromGpgAuth == null)
			fromGpgAuth = false;

        if (binFileMode == null)
			binFileMode = false;

        var outputFd;
        var inputFd;

        if (fileMode) {
            outputFd = fileTo.replace(/\s/g, '{$SPACE}');
            inputFd = fileFrom.replace(/\s/g, '{$SPACE}');

        } else {
            outputFd = '-';
            inputFd = '';
        }

		/* key id list in the arguments */
		var keyIdListArgument = '';
		for(var i = 0; i < keyIdList.length; i++)
			keyIdListArgument += ((i > 0) ? ' ' : '') + '-r ' + keyIdList[i];

		var result = this.runGnupg(this.getBaseArugments(fromGpgAuth) +  this.getGPGTrustArgument(fromGpgAuth) +
				" " + keyIdListArgument +
				this.getGPGCommentArgument() +
				" --output " + outputFd +
				" --encrypt " + inputFd,  (!fileMode ? text : ''), (binFileMode ? 'iso-8859-1' : undefined));

		if ( result.err.indexOf( "subkey" ) > 0 )
			subkey_id = result.err.substring( result.err.indexOf( "subkey" ) + 7, result.err.indexOf( "instead" ) - 1 );
		else
			subkey_id = null;

		if ( result.err.indexOf( "primary" ) > 0 )
			prikey_id = result.err.substring( result.err.indexOf( "primary key" ) + 12, result.err.indexOf( "\n" ) );
		else
			prikey_id = null;

		// The crypted text
		var result2 = new FireGPG.GPGReturn();
		result2.output = result.out;
		result2.sdOut = result.err;
		result2.keylist = keyIdList;
		result2.subkey_id = subkey_id;
		result2.prikey_id = prikey_id;


		return result2;
    },

    /*
        Function: symetric
        Symetricaly encrypt a text.

        Parameters:
            text - The data to encrypt
            password - The password
            algo - The cipher used to encrypt
            fileMode - Indicate the user want to encrypt a file
            fileFrom - The file to sign
            fileTo -  The file where to put the encrypted file

        Return:
            A <FireGPG.GPGReturn> structure.


    */
    symetric: function(text, password, algo, fileMode, fileFrom, fileTo) {

        var outputFd;
        var inputFd;

        if (fileMode) {
            outputFd = fileTo.replace(/\s/g, '{$SPACE}');
            inputFd = fileFrom.replace(/\s/g, '{$SPACE}');

        } else {
            outputFd = '-';
            inputFd = '';
        }


        var result = this.runGnupg(this.getBaseArugments() +  this.getGPGTrustArgument() +
        this.getGPGCommentArgument() +
        " --passphrase-fd 0" +
        " --output " + outputFd +
        (algo != "" ? " --cipher-algo " + FireGPG.Misc.trim(algo) : "") +
        " --symmetric " + inputFd,
        password + "\n" + (!fileMode ? text : ''));


		var result2 = new FireGPG.GPGReturn();
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
            binFileMode - Set this to true if data is binary (no text)
            fileMode - Indicate the user want to encrypt&sign a file
            fileFrom - The file to sign
            fileTo - The file where to put the encrypted & signed file

        Return:
            A <FireGPG.GPGReturn> structure.

    */
    cryptAndSign: function(text, keyIdList, fromGpgAuth, password, keyID, binFileMode, fileMode, fileFrom, fileTo) {


		if (fromGpgAuth == null)
			fromGpgAuth = false;

        if (binFileMode == null)
			binFileMode = false;

		/* key id list in the arguments */
		var keyIdListArgument = '';
		for(var i = 0; i < keyIdList.length; i++)
			keyIdListArgument += ((i > 0) ? ' ' : '') + '-r ' + keyIdList[i];

        var outputFd;
        var inputFd;

        if (fileMode) {
            outputFd = fileTo.replace(/\s/g, '{$SPACE}');
            inputFd = fileFrom.replace(/\s/g, '{$SPACE}');

        } else {
            outputFd = '-';
            inputFd = '';
        }

        var result;

        if (FireGPG.isGpgAgentActivated()) {

            result = this.runGnupg(this.getBaseArugments() +  this.getGPGTrustArgument(fromGpgAuth) +
                    " " + keyIdListArgument +
                    this.getGPGCommentArgument() +
                    " --default-key " + keyID +
                    " --sign" +
                    this.getDiegestAlgo() +
                    " --output " + outputFd +
                    " --encrypt " + inputFd,
                     (!fileMode ? text : ''), (binFileMode ? 'iso-8859-1' : undefined));

        } else {

            result = this.runGnupg(this.getBaseArugments() +  this.getGPGTrustArgument(fromGpgAuth) +
                    " " + keyIdListArgument +
                    this.getGPGCommentArgument() +
                    " --default-key " + keyID +
                    " --passphrase-fd 0" +
                    " --sign" +
                    this.getDiegestAlgo() +
                    " --output " + outputFd +
                    " --encrypt " + inputFd,
                    password + "\n" + (!fileMode ? text : ''), (binFileMode ? 'iso-8859-1' : undefined));

        }

		// The crypted text
		var result2 = new FireGPG.GPGReturn();
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
            binFileEncoded - Work on binary data
            fileMode - Indicate the user want to Decrypt a file
            fileFrom - The file to decrypt
            fileTo - The file where to put the decrypted file

        Return:
            A <FireGPG.GPGReturn> structure.

    */
    decrypt: function(text,password,binFileMode, fileMode, fileFrom, fileTo) {

        var outputFd;
        var inputFd;

        if (fileMode) {
            outputFd = fileTo.replace(/\s/g, '{$SPACE}');
            inputFd = fileFrom.replace(/\s/g, '{$SPACE}');

        } else {
            outputFd = '-';
            inputFd = '';
        }

        var result;

        if (FireGPG.isGpgAgentActivated()) {

            result = this.runGnupg(this.getBaseArugments() +
                    " --output " + outputFd +
                    " --decrypt " + inputFd
                ,  (!fileMode ? text : ''),(binFileMode ? 'iso-8859-1' : undefined));

        } else {

            result = this.runGnupg(this.getBaseArugments() +
                    " --passphrase-fd 0 " +
                    " --output " + outputFd +
                    " --decrypt " + inputFd
                , password + "\n" + (!fileMode ? text : ''),(binFileMode ? 'iso-8859-1' : undefined));

        }


		// The decrypted text (maybe)
		var result2 = new FireGPG.GPGReturn();
		result2.output = result.out;
		result2.sdOut = result.err;

		return result2;
    },

    /*
        Function: selfTest
        Return true if we're able to call GnuPG.

    */
    selfTest: function() {
        //One test is ok, if the command doesn't change, it's should works..

		var result = this.runGnupg(this.getBaseArugments()  + " --version");

        try {
          //  alert(result.out);
        } catch (e) { }
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
            A <FireGPG.GPGReturn> structure.

    */
    kimport: function(text) {

		var result = this.runGnupg(this.getBaseArugments()  + " --import " , text);

        var result2 = new FireGPG.GPGReturn();
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
            A <FireGPG.GPGReturn> structure.

    */
    kexport: function(key) {
		var result = this.runGnupg(this.getBaseArugments()  + " --export " + key);

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.out;

		// We return result
		return result2;
    },

    /*
      Function: refreshKeysFromServer
      Syncronize keys with the keyserver

      Parameters:
        server - The key server to use

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    refrechFromServer: function(server) {

        var result = this.runGnupg(this.getBaseArugments()  + " --keyserver " + server + this.getProxyInformation() + " --refresh-keys");

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;

		// We return result
		return result2;

    },

     /*
      Function: sendKeyToServer
      Send a key from a keyserver

      Parameters:
        keyId - The ked id to send
        server - The key server to use

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    sendKeyToServer: function(key, server) {

        var result = this.runGnupg(this.getBaseArugments()  + " --keyserver " + server +  this.getProxyInformation() + " --send-keys "+ key);

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;

		// We return result
		return result2;

    },

    /*
      Function: retriveKeyFromServer
      Get a key from a keyserver

      Parameters:
        keyId - The ked id to get
        server - The key server to use

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    retriveKeyFromServer: function(key, server) {

        var result = this.runGnupg(this.getBaseArugments()  + " --keyserver " + server +  this.getProxyInformation() + " --recv-keys "+ key);

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;
        result2.sdErr = result.out;

		// We return result
		return result2;

    },

    /*
      Function: searchKeyInServer
      Seach for a key in keyserver

      Parameters:
        search - The text to search
        server - The key server to use

      Return:
        A <FireGPG.GPGReturn> structure.
    */
	searchKeyInServer: function(search, server) {

        var result = this.runGnupg(this.getBaseArugments()  + " --keyserver " + server +  this.getProxyInformation() + " --with-colons --search-keys "+ search);

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.out;

		// We return result
		return result2;

    },

    /*
      Function: changeTrust
      Change trust of a key

      Parameters:
        key - The key id
        trustLevel - The new level of trusting

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    changeTrust: function(key, trustLevel){

        var result = this.runGnupg(this.getBaseArugments()  + " --command-fd 0 --edit-key " + key + " trust", trustLevel + "\n");

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;


		// We return result
		return result2;

    },

    /*
      Function: changePassword
      Change password of a key

      Parameters:
        key - The key id
        oldpass - The old password
        newpass - The new password

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    changePassword: function(key, oldpass, newpass){

        var result = this.runGnupg(this.getBaseArugments()  + " --no-batch --command-fd 0  --edit-key " + key + " passwd" ,  oldpass + "\n");

        //Sécurité
        if (result.err.indexOf("BAD_PASSPHRASE") <= 0) {
            result = this.runGnupg(this.getBaseArugments()  + " --no-batch --command-fd 0  --edit-key " + key + " passwd" ,   oldpass + "\n" + newpass + "\nsave\ny\n");
        }

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;


		// We return result
		return result2;

    },

    /*
      Function: generateKey
      Generate a new key

      Parameters:
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

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    genereateKey: function(name, email, comment, password, keyneverexpire, keyexpirevalue, keyexpiretype, keylength, keytype){
        var data;

        if (keyneverexpire)
            expire = 0;
        else {

            expire = keyexpirevalue + "" + keyexpiretype;

        }

        if (keytype == "DSA") {

        data = "Key-Type: DSA\n"+
                "Key-Length: " + keylength + "\n"+
                "Subkey-Type: ELG-E\n"+
                "Subkey-Length: " + keylength + "\n";

        } else {

            data = "Key-Type: RSA\n"+
                "Key-Length: " + keylength + "\n"+
                "Subkey-Type: RSA\n"+
                "Subkey-Length: " + keylength + "\n";


        }

        if (comment != "")
            data += "Name-Comment: " + comment + "\n";

        data +=  "Name-Real: " + name + "\n"+

                "Name-Email: " + email + "\n"+
                "Expire-Date: " + expire + "\n"+
                "Passphrase: " + password + "\n" +

                "%commit";


        var result = this.runGnupg(this.getBaseArugments()  + " --gen-key", data + "\n");

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;


		// We return result
		return result2;

    },

    /*
      Function: deleteKey
      Delete a key (!)

      Parameters:
        key - The key to delete

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    deleteKey: function(key){

        var result = this.runGnupg(this.getBaseArugments()  + " --delete-secret-and-public-key " + key);

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;


		// We return result
		return result2;

    },

    /*
      Function: delUid
      Delete an identity of a key

      Parameters:
        key - The key
        uid - The uid to delete
        password - The password of the key

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    delUid: function(key, uid) {

        //uid         sélectionner le nom d'utilisateur N
        // deluid

        var result = this.runGnupg(this.getBaseArugments()  + " --command-fd 0 --edit-key " + key + "", "uid " + uid + "\ndeluid\ny\nsave\ny");

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;


		// We return result
		return result2;


    },

    /*
      Function: revokeUid
      Revoke an identity of a key

      Parameters:
        key - The key
        uid - The uid to revoke
        password - The password of the key
        raison - The raison of the revocation

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    revokeUid: function(key, uid, password, raison ) {

        //uid         sélectionner le nom d'utilisateur N
        // revuid


        var result = this.runGnupg(this.getBaseArugments()  + " --no-batch --command-fd 0 --edit-key " + key + "", "uid " + uid + "\nrevuid\ny\n" + raison + "\n\ny\n" + password + "\nsave\ny");

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;


		// We return result
		return result2;


    },

    /*
      Function: addUid
      Add a new identity to a key

      Parameters:
        key - The key to revoke
        name - The name of the new UID
        email - The email of the new UID
        comment - The comment of the new UID
        password - The password of the key

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    addUid: function(key, name, email, comment, password) {


        var result = this.runGnupg(this.getBaseArugments()  + " --no-batch --command-fd 0 --edit-key " + key + " adduid", name + "\n" + email + "\n" +  comment + "\n" + password + "\nsave\ny");

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;


		// We return result
		return result2;

    },

    /*
      Function: signKey
      Sign a key

      Parameters:
        key - The key
        keyForSign - The key used to sign
        password - The password of the key (used to sign)

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    signKey: function(key, keyForSign, password) {

        var result = this.runGnupg(this.getBaseArugments()  + " --no-batch --default-key " + keyForSign + " --command-fd 0 --sign-key " + key , "y\n" + password + "\n");

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;


		// We return result
		return result2;

    },

    /*
        Function: revoqueSign
        Deprecated function
    */
    revoqueSign: function (key, uid, password) {


    },

    /*
      Function: revokeKey
      Revoke a key (!)

      Parameters:
        key - The key to revoke
        raison - The rasion to delete the key
        password - The password of the key

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    revokeKey: function (key, password, raison) {

        var result = this.runGnupg(this.getBaseArugments()  + " --no-batch --command-fd 0 --edit-key " + key + " revkey", "y\n" + raison + "\n\ny\n" + password + "\nsave\ny");

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.err;


		// We return result
		return result2;


    },

    /*
      Function: computeHash
      Compute hash of a file

      Parameters:
        hash - The hash to use (MD5, SHA1, etc.)
        file - The file

      Return:
        A <FireGPG.GPGReturn> structure.
    */
    computeHash: function(hash,file) {

        var result = this.runGnupg(this.getBaseArugments()  + " --print-md " + hash + " " + file.replace(/\s/g, '{$SPACE}'), '');

        var result2 = new FireGPG.GPGReturn();
		result2.sdOut = result.out;


		// We return result
		return result2;


    },

    /*
        Function: runATest
        Test if we are currently able to run the a command.

        Parameters:
            option - The option to test.

        Return:
            A <FireGPG.GPGReturn> structure.

    */
    runATest: function(option) {
		var result = this.runGnupg(this.getGPGBonusCommand() + " --status-fd 2 " + option + " --version");


		if(!result || !result.out || result.out.indexOf("Foundation") == "-1")
			return false;

		return true;
    },



    /*
        Function: tryToFoundTheRightCommand
        Do some test to be able to find a working GnuPG executable.
        This function is overwrited by the coresponding function of  <FireGPGGPGAccessWindowsXpcom> or <FireGPGGPGAccessUnixXpcom>

    */
    tryToFoundTheRightCommand: function () {
        return false;
    }

}


/*
    Class: FireGPGGPGAccessWindowsXpcom

    This class has function for building command lines for GnuPG actions on windows, when the xpcom is available.

    *Please refer to functions marked as overwrited by this class in <FireGPGGPGAccess> for the descriptions of this class's functions.*

    See Also:
        <FireGPGGPGAccessUnixXpcom>

*/
FireGPG.GPGAccess.WindowsXpcom = {


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

            var testingcommand = "C:\\Program Files (x64)\\GNU\\GnuPG\\gpg.exe";
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

            var testingcommand = "C:\\Program Files (x64)\\Windows Privacy Tools\\GnuPG\\gpg.exe";
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
    Class: FireGPGGPGAccessUnixXpcom

    This class has function for building command lines for GnuPG actions on linux, when the xpcom is available.

    *Please refer to functions marked as overwrited by this class in <FireGPGGPGAccess> for the descriptions of this class's functions.*

    See Also:
        <FireGPGGPGAccessWindowsXpcom>

*/
FireGPG.GPGAccess.UnixXpcom = {



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
