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
alert(getTmpPassFile());
/*
 * Class to access to GPG on GNU/Linux.
 */
var GPGWin = {
	//var: parent,

	/*
	 * Function to sign a text.
	 */
	sign: function(texte,password,keyID) {
		var tmpInput = getTmpFile();  // Data unsigned
		var tmpOutput = getTmpFile(); // Data signed
		var tmpPASS = getTmpPassFile(); // TEMPORY PASSWORD
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();
	
		putIntoFile(tmpInput,texte); // Temp

		// The file already exist, but GPG don't work if he exist, so we del it.
		removeFile(tmpOutput);

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.bat")
		var reg=new RegExp("\n", "gi");
		running = running.replace(reg,"\r\n");

		putIntoFile(tmpRun,running);

		///////////////////////////////////////////////////
		//DON'T MOVE OR ADD ANY LINES NEXT THIS MESSAGE !//
		///////////////////////////////////////////////////

		putIntoFile(tmpPASS,password);   // DON'T MOVE THIS LINE !
		try {  // DON'T MOVE THIS LINE !
			runCommand(tmpRun,  // DON'T MOVE THIS LINE !
			          '"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" + 
			           " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch" + 
			           " --default-key " + keyID + 
			           " --output " + tmpOutput + 
			           " --passphrase " + tmpPASS +
					   " --comment " +  comment +
			           " --clearsign " + tmpInput + 
					   " < " + tmpPASS);
		}
		catch (e) { } //If execution fail, script is stopped and don't erase the password, so we add a catch
		removeFile(tmpPASS);  // DON'T MOVE THIS LINE !
		
		//You can move next lines

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
		var running = getContent("chrome://firegpg/content/run.bat")
		var reg=new RegExp("\n", "gi");
		running = running.replace(reg,"\r\n");

		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		          '"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" + 
		           " --quiet --no-tty --no-verbose --status-fd 1 --armor" + 
		           " --verify " + tmpInput);

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
		var running = getContent("chrome://firegpg/content/run.bat")
		var reg=new RegExp("\n", "gi");
		running = running.replace(reg,"\r\n");

		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		           '"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" + 
		           " --quiet --no-tty --no-verbose --status-fd 1 --armor --with-colons " + mode);

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
	crypt: function(texte,keyID) {
		var tmpInput = getTmpFile();  // Data unsigned
		var tmpOutput = getTmpFile(); // Data signed
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		putIntoFile(tmpInput,texte); // Temp

		
		// The file already exist, but GPG don't work if he exist, so we del it.
		removeFile(tmpOutput);

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.bat")
		var reg=new RegExp("\n", "gi");
		running = running.replace(reg,"\r\n");

		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		           '"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" + 
		           " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch" + 
		           " -r " + keyID + 
				   " --comment " +  comment +
		           " --output " + tmpOutput + 
		           " --encrypt " + tmpInput);
	
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
		var tmpPASS = getTmpPassFile(); // tmpPASSWORD
		var tmpStdOut = getTmpFile(); // Output from gpg
		var tmpRun = getTmpFileRunning();

		putIntoFile(tmpInput,texte); // Temp

		
		// The file already exist, but GPG don't work if he exist, so we del it.
		removeFile(tmpOutput);

		// We lanch gpg
		var running = getContent("chrome://firegpg/content/run.bat");
		var reg=new RegExp("\n", "gi");
		running = running.replace(reg,"\r\n");

		putIntoFile(tmpRun,running);

		///////////////////////////////////////////////////
		//DON'T MOVE OR ADD ANY LINES NEXT THIS MESSAGE !//
		///////////////////////////////////////////////////

		putIntoFile(tmpPASS,password);   // DON'T MOVE THIS LINE !
		try {  // DON'T MOVE THIS LINE !
			runCommand(tmpRun,
			           '"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" + 
			           " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch" + 
			           " --passphrase " + tmpPASS +
			           " --output " + tmpOutput + 
			           " --decrypt " + tmpInput +
					   " < " + tmpPASS);
			}
		catch (e) { } //If execution fail, script is stopped and don't erase the password, so we add a catch
		removeFile(tmpPASS);  // DON'T MOVE THIS LINE !	

		//You can move next lines

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
		var running = getContent("chrome://firegpg/content/run.bat")
		var reg=new RegExp("\n", "gi");
		running = running.replace(reg,"\r\n");

		putIntoFile(tmpRun,running);


		runCommand(tmpRun,
		           '"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" + 
		           " --quiet --no-tty --no-verbose --status-fd 1 --armor" + 
		           " --version");

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
		var running = getContent("chrome://firegpg/content/run.bat")

		var reg=new RegExp("\n", "gi");
		running = running.replace(reg,"\r\n");

		putIntoFile(tmpRun,running);

		runCommand(tmpRun,
		           '"' + this.getGPGCommand() + '"' + " \"" + tmpStdOut + "\"" + 
		           " --quiet --no-tty --no-verbose --status-fd 1 --armor" + 
		           " --import " + tmpInput);

		// We get the result
		var result = getFromFile(tmpStdOut);

		// We delete tempory files
		removeFile(tmpInput);
		removeFile(tmpStdOut);
		removeFile(tmpRun);

		// We return result
		return result;
	},

	//Return the GPG's command to use
	getGPGCommand: function () {
		
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
			return prefs.getCharPref("gpg_path");
		else
		{
			prefs.setCharPref("gpg_path","C:\\Program Files\\Windows Privacy Tools\\GnuPG\\gpg.exe");
			return "C:\\Program Files\\Windows Privacy Tools\\GnuPG\\gpg.exe";
		}
	
		
	}
};

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
