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

/*
 * Class to access to GPG on linux
 */
var firegpgGPGlin = {
	var: parent,

	/*
	 * Function to sign a text.
	 */
	sign: function(texte,password,keyID) {
		var tmpInput = this.parent.getTmpFile();  // Data unsigned
		var tmpOutput = this.parent.getTmpFile(); // Data signed
		var tmpStdOut = this.parent.getTmpFile(); // Output from gpg

		this.parent.putIntoFile(tmpInput,texte); // Temp

		// Get plugin's localisation
		var ext = Components.classes[nsIExtensionManager_CONRACTID].
		                     getService(Components.interfaces.nsIExtensionManager).
		                     getInstallLocation(idAppli).
		                     getItemLocation(idAppli); 

		// The file already exist, but GPG don't work if he exist, so we del it.
		this.parent.cleanTmpFile(tmpOutput);

		// We lanch gpg
		this.parent.exeCommand(ext.path + "/content/linux.sh",
		                       "gpg " + tmpStdOut +
		                       " --quiet --no-tty --no-verbose --status-fd 1 --armor --batch " + 
		                       " --default-key " + keyID + 
		                       " --output " + tmpOutput + 
		                       " --passphrase " + password +
		                       " --clearsign " + tmpInput);

		// We get the result
		var result = this.parent.getContentFile(tmpStdOut);

		// The signed text
		var crypttexte = this.parent.getContentFile(tmpOutput);
		var result2 = firegpgGPGReturn;
		result2.output = crypttexte;	
		result2.sdOut = result;	

		// We delete tempory files
		this.parent.cleanTmpFile(tmpInput);
		this.parent.cleanTmpFile(tmpStdOut);
		this.parent.cleanTmpFile(tmpOutput);

		return result2;
	},

	// Verify a sign
	verif: function(text) {
		var tmpInput = this.parent.getTmpFile();  // Signed data
		var tmpStdOut = this.parent.getTmpFile(); // Output from gpg

		this.parent.putIntoFile(tmpInput,text); // TMP

		// Get plugin's localisation
		var ext = Components.classes[nsIExtensionManager_CONRACTID].
		                     getService(Components.interfaces.nsIExtensionManager).
		                     getInstallLocation(idAppli).
		                     getItemLocation(idAppli); 

		// We lauch GPG
		this.parent.exeCommand(ext.path + "/content/linux.sh",
		                       "gpg " + tmpStdOut +
		                       " --quiet --no-tty --no-verbose --status-fd 1 --armor" + 
		                       " --verify " + tmpInput);

		// We get the result
		var result = this.parent.getContentFile(tmpStdOut);

		// We delete tempory files
		this.parent.cleanTmpFile(tmpInput);
		this.parent.cleanTmpFile(tmpStdOut);

		// We return result
		return result;
	},

	// List differents keys
	listkey: function(onlyPrivate) {
		var tmpStdOut = this.parent.getTmpFile(); // Output from gpg

		// Get plugin's localisation
		var ext = Components.classes[nsIExtensionManager_CONRACTID].
		                     getService(Components.interfaces.nsIExtensionManager).
		                     getInstallLocation(idAppli).
		                     getItemLocation(idAppli); 

		var mode = "--list-keys";

		if (onlyPrivate == true)
			mode = "--list-secret-keys";

		// we lauch GPG
		this.parent.exeCommand(ext.path + "/content/linux.sh",
		                       "gpg " + tmpStdOut +
		                       " --quiet --no-tty --no-verbose --status-fd 1 --armor --with-colons " + mode);

		// We get the result
		var result = this.parent.getContentFile(tmpStdOut);

		// We delete tempory files
		this.parent.cleanTmpFile(tmpStdOut);

		// We return result
		return result;
	}
};

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8
