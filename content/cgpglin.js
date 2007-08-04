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

const nsIExtensionManager_CONRACTID = "@mozilla.org/extensions/manager;1";
const idAppli = "firegpg@firegpg.team";
const comment = "http://firegpg.tuxfamily.org";

var useGPGAgent = true;
var useGPGTrust = true;

// The comment argument is returned if it's activated in the options.
// else, "" is returned.
function getGPGCommentArgument() {
	var comment_argument = "";
	var key = "extensions.firegpg.show_website";
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	                       getService(Components.interfaces.nsIPrefBranch);

	if(prefs.getPrefType(key) == prefs.PREF_BOOL)
		if(prefs.getBoolPref(key))
			comment_argument = ' --comment ' + comment;

	return comment_argument;
}

// Add --no-use-agent if user requet for this
function getGPGAgentArgument() {

	/*var comment_argument = "";
	var key = "extensions.firegpg.no_gpg_agent";
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	                       getService(Components.interfaces.nsIPrefBranch);

	if(prefs.getPrefType(key) == prefs.PREF_BOOL)
		if(prefs.getBoolPref(key))
			comment_argument = ;*/
	if (useGPGAgent)
		return ' --no-use-agent';
	else
		return '';
}

function getGPGTrustArgument(/* Optionnal */ forceNo) {
	if (useGPGTrust && forceNo != true)
		return ' --trust-model always';
	else
		return '';
}

//Return the agurments who the user want to add. SPACE BEFORE, NO SPACE IN LAST CHARACTER
function getGPGBonusCommand(){
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
	arguement = arguement.replace(reg," ");
	arguement = arguement.replace(reg," ");
	arguement = arguement.replace(reg," ");
	arguement = arguement.replace(reg," ");
	arguement = arguement.replace(reg," ");

	//Spaces at beginig and and
	arguement =  arguement.replace(/^\s+/, '').replace(/\s+$/, '');

	if (arguement == '')
		return "";

	return " " + arguement;

}


/*
 * Class to access to GPG on GNU/Linux.
 */
var GPGLin = {
	//var: parent,

	/*
	 * Function to sign a text.
	 */
	sign: function(texte, password, keyID) {
		var tmpInput = getTmpFile();  // Data unsigned
		var tmpOutput = getTmpFile(); // Data signed
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpPASS = getTmpPassFile(); // TEMPORY PASSWORD
		var tmpRun = getTmpFileRunning();

		putIntoFile(tmpInput, texte); // Temp

		// The file already exist, but GPG don't work if he exist, so we del it.
		removeFile(tmpOutput);

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.sh")

		putIntoFile(tmpRun,running);


		putIntoFile(tmpPASS, password); // DON'T MOVE THIS LINE !
		try { runCommand(tmpRun,
		           '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch" +
		           " --default-key " + keyID +
		           " --output " + tmpOutput +
		           " --passphrase-file " + tmpPASS + "" +
				   getGPGCommentArgument() + getGPGAgentArgument() +
		           " --clearsign " + tmpInput
			   ); } catch (e) { }
		removeFile(tmpPASS);  // DON'T MOVE THIS LINE !

		// We get the result
		var result = getFromFile(tmpStdOut);

		// The signed text
		var crypttexte = getFromFile(tmpOutput);
		var result2 = GPGReturn;
		result2.output = crypttexte;
		result2.sdOut = result;

		// We delete tempory files
		removeFile(tmpInput);
		removeFile(tmpStdOut);
		removeFile(tmpOutput);
		removeFile(tmpRun);

		return result2;
	},

	// Verify a sign
	verify: function(text) {
		var tmpInput = getTmpFile();  // Signed data
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		putIntoFile(tmpInput,text); // TMP

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.sh")

		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		           '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --quiet" +  getGPGTrustArgument() + " --no-tty --no-verbose --status-fd 1 --armor" +  getGPGAgentArgument() +
		           " --verify " + tmpInput
			   );

		// We get the result
		var result = getFromFile(tmpStdOut);

		// We delete tempory files
		removeFile(tmpInput);
		removeFile(tmpStdOut);
		removeFile(tmpRun);

		// We return result
		return result;
	},

	// List differents keys
	listkey: function(onlyPrivate) {
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();
		var mode = "--list-keys";

		if (onlyPrivate == true)
			mode = "--list-secret-keys";

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.sh")

		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		           '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor --with-colons" + getGPGAgentArgument() + " " + mode
			   );

		// We get the result
		var result = getFromFile(tmpStdOut);

		// We delete tempory files
		removeFile(tmpStdOut);
		removeFile(tmpRun);

		// We return result
		return result;
	},

	/*
	 * Function to crypt a text.
	 */
	crypt: function(texte, keyIdList, fromGpgAuth /*Optional*/) {
		var tmpInput = getTmpFile();  // Data unsigned
		var tmpOutput = getTmpFile(); // Data signed
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		if (fromGpgAuth == null)
			fromGpgAuth = false;

		putIntoFile(tmpInput,texte); // Temp

		// The file already exist, but GPG don't work if he exist, so we del it.
		removeFile(tmpOutput);

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.sh")

		/* key id list in the arguments */
		var keyIdListArgument = '';
		for(var i = 0; i < keyIdList.length; i++)
			keyIdListArgument += ((i > 0) ? ' ' : '') + '-r ' + keyIdList[i];
		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		           '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --quiet" +  getGPGTrustArgument(fromGpgAuth) + " --no-tty --no-verbose --status-fd 1 --armor --batch" +
		           " " + keyIdListArgument +
				   getGPGCommentArgument() + getGPGAgentArgument() +
		           " --output " + tmpOutput +
		           " --encrypt " + tmpInput
			   );

		// We get the result
		var result = getFromFile(tmpStdOut);

		// The crypted text
		var crypttexte = getFromFile(tmpOutput);
		var result2 = GPGReturn;
		result2.output = crypttexte;
		result2.sdOut = result;

		// We delete tempory files
		removeFile(tmpInput);
		removeFile(tmpStdOut);
		removeFile(tmpOutput);
		removeFile(tmpRun);

		return result2;
	},


	/*
	 * Function to crypt and sign a text.
	 */
	cryptAndSign: function(texte, keyIdList, fromGpgAuth, password, keyID) {
		var tmpInput = getTmpFile();  // Data unsigned
		var tmpOutput = getTmpFile(); // Data signed
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpPASS = getTmpPassFile(); // TEMPORY PASSWORD
		var tmpRun = getTmpFileRunning();

		if (fromGpgAuth == null)
			fromGpgAuth = false;

		putIntoFile(tmpInput,texte); // Temp

		// The file already exist, but GPG don't work if he exist, so we del it.
		removeFile(tmpOutput);

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.sh")

		/* key id list in the arguments */
		var keyIdListArgument = '';
		for(var i = 0; i < keyIdList.length; i++)
			keyIdListArgument += ((i > 0) ? ' ' : '') + '-r ' + keyIdList[i];
		putIntoFile(tmpRun,running);


		putIntoFile(tmpPASS, password); // DON'T MOVE THIS LINE !
		runCommand(tmpRun,
		           '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --quiet" +  getGPGTrustArgument(fromGpgAuth) + " --no-tty --no-verbose --status-fd 1 --armor --batch" +
		           " " + keyIdListArgument +
				   getGPGCommentArgument() + getGPGAgentArgument() +
			   " --default-key " + keyID +
			   " --sign" +
			   " --passphrase-file " + tmpPASS +
		           " --output " + tmpOutput +
		           " --encrypt " + tmpInput
			   );
		removeFile(tmpPASS);  // DON'T MOVE THIS LINE !

		// We get the result
		var result = getFromFile(tmpStdOut);

		// The crypted text
		var crypttexte = getFromFile(tmpOutput);
		var result2 = GPGReturn;
		result2.output = crypttexte;
		result2.sdOut = result;

		// We delete tempory files
		removeFile(tmpInput);
		removeFile(tmpStdOut);
		removeFile(tmpOutput);
		removeFile(tmpRun);

		return result2;
	},

	/*
	 * Function to decrypt a text.
	 */
	decrypt: function(texte,password) {
		var tmpInput = getTmpFile();  // Data unsigned
		var tmpOutput = getTmpFile(); // Data signed
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();
		var tmpPASS = getTmpPassFile(); // TEMPORY PASSWORD

		putIntoFile(tmpInput,texte); // Temp

		// The file already exist, but GPG don't work if he exist, so we del it.
		removeFile(tmpOutput);

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.sh");

		putIntoFile(tmpRun,running);


		putIntoFile(tmpPASS, password); // DON'T MOVE THIS LINE !
		try { runCommand(tmpRun,
		           '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch" + getGPGAgentArgument() +
		           " --passphrase-file " + tmpPASS +
		           " --output " + tmpOutput +
		           " --decrypt " + tmpInput
			   ); } catch (e) { }
		removeFile(tmpPASS);  // DON'T MOVE THIS LINE !

		// We get the result
		var result = getFromFile(tmpStdOut);

		// The decrypted text
		var crypttexte = getFromFile(tmpOutput);
		var result2 = GPGReturn;
		result2.output = crypttexte;
		result2.sdOut = result;

		// We delete tempory files
		removeFile(tmpInput);
		removeFile(tmpStdOut);
		removeFile(tmpOutput);
		removeFile(tmpRun);

		return result2;
	},

	/* This if we can work with GPG */
	selfTest: function() {
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.sh")

		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		           "" + this.getGPGCommand() + "" +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor" + getGPGAgentArgument() +
		           " --version"
			   );

		// We get the result
		var result = getFromFile(tmpStdOut);

		// We delete tempory files
		removeFile(tmpStdOut);
		removeFile(tmpRun);

		// If the work Foundation is present, we can think that gpg is present ("... Copyright (C) 2006 Free Software Foundation, Inc. ...")
		if (result.indexOf("Foundation") == -1)
			return false;


		return true;
	},

	// Import a key
	kimport: function(text) {
		var tmpInput = getTmpFile();  // Key
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		putIntoFile(tmpInput,text); // TMP

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.sh")

		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		           '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor" + getGPGAgentArgument() +
		           " --import " + tmpInput
			   );

		// We get the result
		var result = getFromFile(tmpStdOut);

		// We delete tempory files
		removeFile(tmpInput);
		removeFile(tmpStdOut);
		removeFile(tmpRun);

		// We return result
		return result;
	},

	// Export a key
	kexport: function(key) {

		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.sh")

		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		           '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor" + getGPGAgentArgument() +
		           " --export " + key);

		// We get the result
		var result = getFromFile(tmpStdOut);

		// We delete tempory files
		removeFile(tmpStdOut);
		removeFile(tmpRun);

		// We return result
		return result;
	},

	//Do a test of a commande
	runATest: function(option) {

		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.sh")

		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		           '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --status-fd 1 " + option +
		           " --version" );

		// We get the result
		var result = getFromFile(tmpStdOut);

		// We delete tempory files
		removeFile(tmpStdOut);
		removeFile(tmpRun);

		if(result.indexOf("Foundation") == "-1")
			return false;

		return true;
	},

	//Return the GPG's command to use
	getGPGCommand: function () {
		return this.GpgCommand;
	},
	//Do some tests for find the right command...
	tryToFoundTheRightCommand: function () {
		//Year, on linux no test, because it's a good Os.
		//We only look if the user wants to force the path.
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
			prefs.setCharPref("gpg_path","gpg");
			this.GpgCommand = "gpg";
		}
	}
};

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
