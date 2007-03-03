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


/*
* Class to access to GPG on linux
*/

const nsIExtensionManager_CONRACTID = "@mozilla.org/extensions/manager;1";
const idAppli = "firegpg@firegpg.team";


var firegpgGPGlin = {

	/*
	* Function for sign a text
	*/
  sign: function() {

	
	var tmpInput = this.getTmpFile(); //Data unsigned
	var tmpOutput = this.getTmpFile(); //Data signed
	var tmpStdOut = this.getTmpFile(); //Output from gpg

	this.putIntoFile(tmpInput,"MEUHHHHHHHHHHHHHHHHHHHHHHHHHH"); //Temp

	//Get plugin's localisation
	var ext = Components.classes[nsIExtensionManager_CONRACTID]
	                    .getService(Components.interfaces.nsIExtensionManager)
	                    .getInstallLocation(idAppli)
	                    .getItemLocation(idAppli); 

	//Needed for a sign
	var password = fireGPG_GetPassword();
	var keyID = fireGPG_GetSelfKey();

	//The file already exist, but GPG don't work if he exist, so we del it.
	this.cleanTmpFile(tmpOutput);

	//We lanch gpg
	this.exeCommand(
		ext.path + "/content/linux.sh",
		"gpg " + tmpStdOut +
		" --quiet --no-tty --no-verbose --status-fd 1 --armor --batch " + 
		" --default-key " + keyID + 
		" --output " + tmpOutput + 
		" --passphrase " + password +
		" --clearsign " + tmpInput);

	//We get the result
	var result = this.getContentFile(tmpStdOut);
	
	//For i18n
	this.i18n = document.getElementById("firegpg-strings");

	//If the sign failled
	if (result.indexOf("SIG_CREATED") == "-1")
	{
		//We alert the user
		if (result.indexOf("BAD_PASSPHRASE") != "-1")
			alert(this.i18n.getString("signFailledPassword"));
		else
			alert(this.i18n.getString("signFailled"));
	}
	else
	{
		//If he works too,
		alert(this.i18n.getString("signSuccess"));
		//The signed text
		var crypttexte = this.getContentFile(tmpOutput);
		alert(crypttexte);
		//We del the signed text
		this.cleanTmpFile(tmpOutput);
	}
	
	//We delete tempory files
	this.cleanTmpFile(tmpInput);
	this.cleanTmpFile(tmpStdOut);
	
  },
  // For verify a sign
  verif: function() {
	var tmpInput = this.getTmpFile(); //Signed data
	var tmpStdOut = this.getTmpFile(); //Output from gpg

	this.putIntoFile(tmpInput,"-----BEGIN PGP SIGNED MESSAGE-----\n"+
				  "Hash: SHA1\n"+
				  "\n"+
				  "MEUHHHHHHHHHHHHHHHHHHHHHHHHHH\n"+
				  "-----BEGIN PGP SIGNATURE-----\n" +
				  "Version: GnuPG v1.4.3 (GNU/Linux)\n" + 
			          "\n" + 
				  "iD8DBQFF6aWKsFIMW7ay8+MRAiR8AJ42QChS492VhS4k27SMNA5MJC+ZPwCgh3+E\n" +
	  			  "o6t1LP7+7N4VcExXFUQlIVA=\n" +
				  "=qu5x\n" +
				  "-----END PGP SIGNATURE-----\n"); //TMP

	
	//Get plugin's localisation
	var ext = Components.classes[nsIExtensionManager_CONRACTID]
	                    .getService(Components.interfaces.nsIExtensionManager)
	                    .getInstallLocation(idAppli)
	                    .getItemLocation(idAppli); 

	//we lauch GPG
	this.exeCommand(
		ext.path + "/content/linux.sh",
		"gpg " + tmpStdOut +
		" --quiet --no-tty --no-verbose --status-fd 1 --armor" + 
		" --verify " + tmpInput);

	//We get the result
	var result = this.getContentFile(tmpStdOut);
	
	//For I18N
	this.i18n = document.getElementById("firegpg-strings");

	//If check failled
	if (result.indexOf("GOODSIG") == "-1")
	{	//Tempory, we sould use return
		alert(this.i18n.getString("verifFailled"));
	}
	else
	{
		//If he work, we get informations of the Key
		var infos = result;

		infos = infos.substring(0,infos.indexOf("GOODSIG") + 8);
		infos = result.replace(infos, "");
		infos = infos.substring(0,infos.indexOf("GNUPG") - 2);
		infos = infos.split(" ");

		//Array contain :
		//[0] -> Id of the key
		//[1] -> Name of ovners'key		
		//[2] -> Comment of key	
		//[3] -> Email of ovners'key

		//TODO
		//Tempory, we sould use return
		alert(this.i18n.getString("verifSuccess")+ " " + infos[0] + " " + infos[2] + " " + infos[3]);
	}
	
	//We delete tempory files
	this.cleanTmpFile(tmpInput);
	this.cleanTmpFile(tmpStdOut);
	
  },

  listkeys: function()
  {
	//TODO
	var table = new Array();
	table["B0520C5BB6B2F3E3"] = "testsfiregpg (testsfiregpg) <testsfiregpg@testsfiregpg.testsfiregpg>";

	return table;
  }
  
};
