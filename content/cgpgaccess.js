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
const FireGPG_OS = Components.classes[NS_APPINFO_CONTRACTID].getService(Components.interfaces.nsIXULRuntime).OS;
const WINDOWS = "WINNT";

var useGPGAgent = true;
var useGPGTrust = true;

/*
 * This operating system is an UNIX-like ? (like GNU/Linux or Mac OS X)
 */
function isUnix() {
	if(FireGPG_OS != WINDOWS)
		return true;
	else
		return false;
}

/*
 * The comment argument is returned if it's activated in the options.
 * else, "" is returned.
 */
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

/*
 * Add --no-use-agent if user requet for this
 */
function getGPGAgentArgument() {
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

// Return the agurments who the user want to add. SPACE BEFORE, NO SPACE IN LAST CHARACTER
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
 * Return a the command to run programs.
 */
function getRunningCommand() {
	return getContent("chrome://firegpg/content/run" + (isUnix() ? '.sh' : '.bat'));
}

/*
 * Class to access to GPG on GNU/Linux.
 */
var GPGAccess = {
	sign: function(text, password, keyID) {
		var tmpInput = getTmpFile();  // Data unsigned
		var tmpOutput = getTmpFile(); // Data signed
		var tmpPASS = getTmpPassFile(); // TEMPORY PASSWORD
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		putIntoFile(tmpInput, text); // Temp

		// The file already exist, but GPG don't work if he exist, so we del it.
		removeFile(tmpOutput);

		// We launch gpg
		var running = getRunningCommand();
		putIntoFile(tmpRun,running);

		///////////////////////////////////////////////////
		//DON'T MOVE OR ADD ANY LINES NEXT THIS MESSAGE !//
		///////////////////////////////////////////////////

		putIntoFile(tmpPASS, password); // DON'T MOVE THIS LINE !
		try { // DON'T MOVE THIS LINE !
			/* TODO ces deux fonctions aussi les unifier ? */
			if(isUnix()) {
				runCommand(
					tmpRun, // DON'T MOVE THIS LINE !
					'' + this.getGPGCommand() + '' +  " " + tmpStdOut +
					getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch" +
					" --default-key " + keyID +
					" --output " + tmpOutput +
					" --passphrase-file " + tmpPASS + "" +
					getGPGCommentArgument() + getGPGAgentArgument() +
					" --clearsign " + tmpInput
				); 
			}
			else {
				runWinCommand(
					tmpRun, // DON'T MOVE THIS LINE !
					'"' + this.getGPGCommand() + '" "' + tmpStdOut + '"' +
					getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch" + 
					getGPGAgentArgument() + 
					" --default-key " + keyID +
					" --output " + tmpOutput +
					" --passphrase-fd 0 " +
					getGPGCommentArgument() +
					" --clearsign " + tmpInput +
					" < " + tmpPASS
				);
			}
		} catch (e) {}
		removeFile(tmpPASS);  // DON'T MOVE THIS LINE !
		// You can move next lines

		// We get the result
		var result = getFromFile(tmpStdOut);

		// The signed text
		var crypttext = getFromFile(tmpOutput);

		var result2 = GPGReturn;
		result2.output = crypttext;
		result2.sdOut = result;

		// We delete tempory files
		removeFile(tmpInput);
		removeFile(tmpStdOut);
		removeFile(tmpOutput);
		removeFile(tmpRun);

		return result2;
	},

	/*
	 * Verify a signature
	 */
	verify: function(text) {
		var tmpInput = getTmpFile();  // Signed data
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		putIntoFile(tmpInput,text); // TMP

		// We lanch gpg
		var running = getRunningCommand();
		if(!isUnix()) {
			/* à quoi ça sert sous Win ? TODO */
			var reg=new RegExp("\n", "gi");
			running = running.replace(reg,"\r\n");
		}

		putIntoFile(tmpRun,running);
		
		if(isUnix()) {
			runCommand(
				tmpRun,
				'' + this.getGPGCommand() + '' +  " " + tmpStdOut +
				getGPGBonusCommand() + " --quiet" +  getGPGTrustArgument() + " --no-tty --no-verbose --status-fd 1 --armor" +  getGPGAgentArgument() +
				" --verify " + tmpInput
			);
		}
		else {
			runWinCommand(
				tmpRun,
				'"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" +
				getGPGBonusCommand() + " --quiet --no-tty" +  getGPGTrustArgument() + " --no-verbose --status-fd 1 --armor" + getGPGAgentArgument() +
				" --verify " + tmpInput
			);
		}

		// We get the result
		var result = getFromFile(tmpStdOut);

		// We delete tempory files
		removeFile(tmpInput);
		removeFile(tmpStdOut);
		removeFile(tmpRun);

		// We return result
		return result;
	},

	/*
	 * List differents keys
	 */
	listkey: function(onlyPrivate) {
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();
		var mode = "--list-keys";

		if (onlyPrivate == true)
			mode = "--list-secret-keys";

		// We lanch gpg
		var running = getRunningCommand();

		putIntoFile(tmpRun,running);

		if(isUnix()) {
			runCommand(tmpRun,
					   '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
					   getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor --with-colons" + getGPGAgentArgument() + " " + mode
			);
		} else {
			runWinCommand(tmpRun,
				'"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" +
				getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor --with-colons" + getGPGAgentArgument() + " " + mode
			);
		}

		// We get the result
		var result = getFromFile(tmpStdOut);

		// We delete tempory files
		removeFile(tmpStdOut);
		removeFile(tmpRun);

		// We return result
		return result;
	},

	/*
	 * Function to encrypt a text.
	 */
	crypt: function(texte, keyIdList, fromGpgAuth /*Optional*/) {
		var tmpInput = getTmpFile();  // Data unsigned
		var tmpOutput = getTmpFile(); // Data signed
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		if (fromGpgAuth == null)
			fromGpgAuth = false;

		putIntoFile(tmpInput,text); // Temp

		// The file already exist, but GPG don't work if he exist, so we del it.
		removeFile(tmpOutput);

		// We lanch gpg
		var running = getRunningCommand();
		if(!isUnix()) {
			/* TODO pourquoi ? */
			var reg = new RegExp("\n", "gi");
			running = running.replace(reg,"\r\n");
		}

		/* key id list in the arguments */
		var keyIdListArgument = '';
		for(var i = 0; i < keyIdList.length; i++)
			keyIdListArgument += ((i > 0) ? ' ' : '') + '-r ' + keyIdList[i];

		putIntoFile(tmpRun,running);

		if(isUnix()) {
			runCommand(
				tmpRun,
			   '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
			   getGPGBonusCommand() + " --quiet" +  getGPGTrustArgument(fromGpgAuth) + " --no-tty --no-verbose --status-fd 1 --armor --batch" +
			   " " + keyIdListArgument +
			   getGPGCommentArgument() + getGPGAgentArgument() +
			   " --output " + tmpOutput +
			   " --encrypt " + tmpInput);
		} else {
			runWinCommand(
				tmpRun,
				'"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" +
				getGPGBonusCommand() + " --quiet" +  getGPGTrustArgument(fromGpgAuth) + 
				" --no-tty --no-verbose --status-fd 1 --armor --batch" +
				" " + keyIdListArgument +
				getGPGCommentArgument() + getGPGAgentArgument() +
				" --output " + tmpOutput +
				" --encrypt " + tmpInput);
		}

		// We get the result
		var result = getFromFile(tmpStdOut);

		// The crypted text
		var crypttext = getFromFile(tmpOutput);
		var result2 = GPGReturn;
		result2.output = crypttext;
		result2.sdOut = result;

		// We delete tempory files
		removeFile(tmpInput);
		removeFile(tmpStdOut);
		removeFile(tmpOutput);
		removeFile(tmpRun);

		return result2;
	},

	/*
	 * Function to encrypt and sign a text.
	 */
	cryptAndSign: function(texte, keyIdList, fromGpgAuth, password, keyID) {
		var tmpInput = getTmpFile();  // Data unsigned
		var tmpOutput = getTmpFile(); // Data signed
		var tmpPASS = getTmpPassFile(); // TEMPORY PASSWORD
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		if (fromGpgAuth == null)
			fromGpgAuth = false;

		putIntoFile(tmpInput,texte); // Temp

		// The file already exist, but GPG don't work if he exist, so we del it.
		removeFile(tmpOutput);

		// We lanch gpg
		var running = getRunningCommand();
		if(!isUnix()) {
			var reg=new RegExp("\n", "gi");
			running = running.replace(reg,"\r\n");
		}
		putIntoFile(tmpRun,running);

		/* key id list in the arguments */
		var keyIdListArgument = '';
		for(var i = 0; i < keyIdList.length; i++)
			keyIdListArgument += ((i > 0) ? ' ' : '') + '-r ' + keyIdList[i];


		putIntoFile(tmpPASS, password); // DON'T MOVE THIS LINE !

		if(isUnix()) {
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
		}
		else {
			runWinCommand(
				tmpRun,
				'"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" +
				getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch" + getGPGCommentArgument() + getGPGAgentArgument() +
				" " + keyIdListArgument +
				" --passphrase-fd 0 " +
				" --default-key " + keyID +
				" --sign" +
				" --output " + tmpOutput +
				" --encrypt " + tmpInput +
				" < " + tmpPASS);
		}
		removeFile(tmpPASS);  // DON'T MOVE THIS LINE !

		// We get the result
		var result = getFromFile(tmpStdOut);

		// The crypted text
		var crypttext = getFromFile(tmpOutput);
		var result2 = GPGReturn;
		result2.output = crypttext;
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
		var running = getRunningCommand();
		if(!isUnix()) {
			var reg=new RegExp("\n", "gi");
			running = running.replace(reg,"\r\n");
		}


		putIntoFile(tmpRun,running);


		putIntoFile(tmpPASS, password); // DON'T MOVE THIS LINE !
		try { 
			if(isUnix()) {
				runCommand(
					tmpRun,
					'' + this.getGPGCommand() + '' +  " " + tmpStdOut +
					getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch" + getGPGAgentArgument() +
					" --passphrase-file " + tmpPASS +
					" --output " + tmpOutput +
					" --decrypt " + tmpInput
				);
			} else {
				runWinCommand(
					tmpRun,
					'"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" +
					getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch" + getGPGAgentArgument() +
					" --passphrase-fd 0 " +
					" --output " + tmpOutput +
					" --decrypt " + tmpInput +
					" < " + tmpPASS
				);
			}
		} catch (e) { }
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
		//One test is ok, if the command dosen't change, it's should works..
		if(!isUnix()) { /* TODO this test is good ? */
			if(this.allreadysucceswiththeselftest == this.getGPGCommand())
				return true;
		}

		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		// We launch gpg
		var running = getRunningCommand();
		if(!isUnix()) {
			var reg=new RegExp("\n", "gi");
			running = running.replace(reg,"\r\n");
		}

		putIntoFile(tmpRun,running);

		if(isUnix()) {
			runCommand(
				tmpRun,
				"" + this.getGPGCommand() + "" +  " " + tmpStdOut +
				getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor" + getGPGAgentArgument() +
				" --version"
			);
		} else {
			runWinCommand(
				tmpRun, '"' + this.getGPGCommand() + '"' + " \"" + 
				tmpStdOut + "\"" +
				getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor" + 
				getGPGAgentArgument() +	" --version");
		}

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
		var running = getRunningCommand();
		if(!isUnix()) {
			var reg=new RegExp("\n", "gi");
			running = running.replace(reg,"\r\n");
		}

		putIntoFile(tmpRun,running);

		if(isUnix()) {
			runCommand(tmpRun,
				'' + this.getGPGCommand() + '' +  " " + tmpStdOut +
				getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor" + getGPGAgentArgument() +
				" --import " + tmpInput
			);
		}
		else {
			runWinCommand(
				tmpRun,
				'"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" +
				getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor" + getGPGAgentArgument() +
				" --import " + tmpInput
			);
		}

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
		var running = getRunningCommand();
		if(!isUnix()) {
			var reg=new RegExp("\n", "gi");
			running = running.replace(reg,"\r\n");
		}

		putIntoFile(tmpRun,running);

		if(isUnix()) {
		runCommand(tmpRun,
		           '' + this.getGPGCommand() + '' +  " " + tmpStdOut +
		           getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor" + getGPGAgentArgument() +
		           " --export " + key);
		} else {
			runWinCommand(tmpRun,
		           '"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" +
		           getGPGBonusCommand() + " --quiet --no-tty --no-verbose --status-fd 1 --armor" + getGPGAgentArgument() +
		           " --export " + key);
		}

		// We get the result
		var result = getFromFile(tmpStdOut);

		// We delete tempory files
		removeFile(tmpStdOut);
		removeFile(tmpRun);

		// We return result
		return result;
	},

	//Do a test of a commande TODO
	runATest: function(option) {
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		// We lanch gpg
		var running = getRunningCommand();
		if(!isUnix()) {
			var reg=new RegExp("\n", "gi");
			running = running.replace(reg,"\r\n");
		}

		putIntoFile(tmpRun,running);

		if(isUnix()) {
			runCommand(
				tmpRun,
				'' + this.getGPGCommand() + '' +  " " + tmpStdOut +
				getGPGBonusCommand() + " --status-fd 1 " + option +
				" --version" );
		} else {
			runWinCommand(
				tmpRun,
				'"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" +
				getGPGBonusCommand() + " " + option +
				" --version");
		}

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
		//Do some tests for find the right command... TODO
	tryToFoundTheRightCommand: function () {
		if(isUnix()) {
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
		else {
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
};

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
