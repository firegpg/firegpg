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
const NS_IPCSERVICE_CONTRACTID  = "@mozilla.org/process/ipc-service;1";
const NS_APPINFO_CONTRACTID = "@mozilla.org/xre/app-info;1";
const NS_DIRECTORYSERVICE_CONTRACTID = "@mozilla.org/file/directory_service;1";
const NS_LOCALEFILE_CONTRACTID = "@mozilla.org/file/local;1";
const NS_PROCESSUTIL_CONTRACTID = "@mozilla.org/process/util;1";
const NS_NETWORKOUTPUT_CONTRACTID = "@mozilla.org/network/file-output-stream;1";
const NS_NETWORKINPUT_CONTRACTID = "@mozilla.org/network/file-input-stream;1";
const NS_NETWORKINPUTS_CONTRACTID = "@mozilla.org/scriptableinputstream;1";
const WRITE_MODE = 0x02 | 0x08 | 0x20;
const WRITE_PERMISSIONS = 0664;

const TMP_DIRECTORY = "TmpD";
const TMP_FILES = "TMPGPG";
const WINDOWS = "WINNT";

const FireGPG_OS = Components.classes[NS_APPINFO_CONTRACTID].getService(Components.interfaces.nsIXULRuntime).OS;;

//Return class
var firegpgGPGReturn = {
	
}

//Main class for access to GPG
var firegpgGPG = {


	//Get the path for tmps files
	getTmpPath: function()
	{
		var file = Components.classes[NS_DIRECTORYSERVICE_CONTRACTID]
	                     .getService(Components.interfaces.nsIProperties)
	                     .get(TMP_DIRECTORY, Components.interfaces.nsIFile)
		return file;
	},

	//Get a unique tempory file name
	getTmpFile: function()
	{

		var file = this.getTmpPath();
		file.append(TMP_FILES);
		file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
		
		return file.path;
	},

	//Put data into a file
	putIntoFile: function(file2save,data)
	{
		var file = Components.classes[NS_LOCALEFILE_CONTRACTID]
		                     .createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(file2save);

		var foStream = Components.classes[NS_NETWORKOUTPUT_CONTRACTID]
		                         .createInstance(Components.interfaces.nsIFileOutputStream);

		foStream.init(file, WRITE_MODE, WRITE_PERMISSIONS, 0);
		foStream.write(data, data.length);
		foStream.close();
	},

	//Get the content of a file
	getContentFile: function(file2open)
	{

		try {


			var file = Components.classes[NS_LOCALEFILE_CONTRACTID]
				                     .createInstance(Components.interfaces.nsILocalFile);
			file.initWithPath(file2open);

			
			var data = "";
			var fstream = Components.classes[NS_NETWORKINPUT_CONTRACTID]
			                        .createInstance(Components.interfaces.nsIFileInputStream);
			var sstream = Components.classes[NS_NETWORKINPUTS_CONTRACTID]
			                        .createInstance(Components.interfaces.nsIScriptableInputStream);
			fstream.init(file, -1, 0, 0);
			sstream.init(fstream); 

			var str = sstream.read(4096);
			while (str.length > 0) {
			  data += str;
			  str = sstream.read(4096);
			}

			sstream.close();
			fstream.close();

			return data;

		}
		catch (e) {
			   return "";
		}
	},

	//Remove a file
	cleanTmpFile: function(file1)
	{

		var file = Components.classes[NS_LOCALEFILE_CONTRACTID]
		                     .createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(file1);
		try {		
			file.remove(file1);
		}
		catch (e)
		{
		}

	},

	//Run a command
	exeCommand: function(command,arg)
	{
		var file = Components.classes[NS_LOCALEFILE_CONTRACTID]
		                     .createInstance(Components.interfaces.nsILocalFile);
		file.initWithPath(command);

		var process = Components.classes[NS_PROCESSUTIL_CONTRACTID]
		                        .createInstance(Components.interfaces.nsIProcess);
		process.init(file);

	        var args = arg.split(' ');
		
		process.run(true, args, args.length);
	},

	//Retoune la liste des clés disponibles
	listkeys2: function()
	{
		//TODO
		var table = new Array();
		table["B0520C5BB6B2F3E3"] = "testsfiregpg (testsfiregpg) <testsfiregpg@testsfiregpg.testsfiregpg>";

		return table;
	},

	/*
	* Function for sign a text
	*/
  sign: function() {

	
	var texte = "MEUHHHHHHHHHHHHHHHHHHHHHHHHHH"; //Temp


	//Needed for a sign
	var password = fireGPG_GetPassword();
	var keyID = fireGPG_GetSelfKey();

	//We get the result
	var result = this.GPGAccess.sign(texte,password,keyID);
	var crypttexte = result.output;
	result = result.sdOut;

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
		alert(crypttexte);
		
	}
	

	
  },

 // Verify a sign
  verif: function() {
	

	var texte = "-----BEGIN PGP SIGNED MESSAGE-----\n"+
				  "Hash: SHA1\n"+
				  "\n"+
				  "MEUHHHHHHHHHHHHHHHHHHHHHHHHHH\n"+
				  "-----BEGIN PGP SIGNATURE-----\n" +
				  "Version: GnuPG v1.4.3 (GNU/Linux)\n" + 
			          "\n" + 
				  "iD8DBQFF6aWKsFIMW7ay8+MRAiR8AJ42QChS492VhS4k27SMNA5MJC+ZPwCgh3+E\n" +
	  			  "o6t1LP7+7N4VcExXFUQlIVA=\n" +
				  "=qu5x\n" +
				  "-----END PGP SIGNATURE-----\n";
	
	//We get the result
	var result = this.GPGAccess.verif(texte);
	
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
	
  },


  listkey: function(onlyPrivate) {
	
	var retour = new Array();
	var infos;
	//We get informations from GPG
	var result = this.GPGAccess.listkey(onlyPrivate);

	//Parsing
	var reg=new RegExp("[\n]+", "g");
	var list = result.split(reg);

	//var reg2=new RegExp("[:]+", "g");


	for (var i = 0; i < list.length; i++)
	{
		infos = new Array();
		infos = list[i].split(":");
		
		if (infos[0] == "pub" || infos[0] == "sec")
		{
			retour[infos[4]] = infos[9] ;
			
		}
		
	}

  }
}
;

//We load the good class for the OS
if (FireGPG_OS == WINDOWS)
{
		firegpgGPG.GPGAccess = firegpgGPGwin;
		
}
else
{
		firegpgGPG.GPGAccess = firegpgGPGlin;

}

firegpgGPG.GPGAccess.parent = firegpgGPG;

