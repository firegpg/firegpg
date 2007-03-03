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

var FireGPG_OS = Components.classes["@mozilla.org/xre/app-info;1"].getService(Components.interfaces.nsIXULRuntime).OS;;

var firegpgGPG;

if (FireGPG_OS == "WINNT")
	firegpgGPG = firegpgGPGwin;
else
	firegpgGPG = firegpgGPGlin;


function FGPG_getTmpPath()
{

var file = Components.classes["@mozilla.org/file/directory_service;1"]
                     .getService(Components.interfaces.nsIProperties)
                     .get("TmpD", Components.interfaces.nsIFile)

return file;
}

function FGPG_getTmpInputFile()
{

	var file = FGPG_getTmpPath();
	file.append("TMPGPGINPUT");
	file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
	
	return file.path;
}

function FGPG_getTmpInputOutput()
{
	var file = FGPG_getTmpPath();
	file.append("TMPGPGOUTPUT");
	file.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0664);
	
	return file.path;
}

function FGPG_putIntoFile(file2save,data)
{
	var file = Components.classes["@mozilla.org/file/local;1"]
	                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(file2save);

	// file est un nsIFile, data est une chaîne de caractères
	var foStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
	                         .createInstance(Components.interfaces.nsIFileOutputStream);

	// utiliser 0x02 | 0x10 pour ouvrir le fichier en ajout.
	foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0); // écrire, créer, tronquer
	foStream.write(data, data.length);
	foStream.close();
}

function FGPG_getContentFile(file2open)
{

	var file = Components.classes["@mozilla.org/file/local;1"]
	                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(file2open);

	
	var data = "";
	var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
	                        .createInstance(Components.interfaces.nsIFileInputStream);
	var sstream = Components.classes["@mozilla.org/scriptableinputstream;1"]
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

function FGPG_cleanTmpFile(file1,file2)
{

	var file = Components.classes["@mozilla.org/file/local;1"]
	                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(file1);
	file.remove(file1);

	var file = Components.classes["@mozilla.org/file/local;1"]
	                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(file2);
	file.remove(file2);

}

function FGPG_exeCommand(command,arg)
{
	// Créer un nsILocalFile pour l'exécutable
	var file = Components.classes["@mozilla.org/file/local;1"]
	                     .createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(command);

	// Créer un nsIProcess
	var process = Components.classes["@mozilla.org/process/util;1"]
	                        .createInstance(Components.interfaces.nsIProcess);
	process.init(file);

	// Lancer le processus.
	// Si le premier paramètre est true, l'appel du processus sera bloqué
	// jusqu'à ce qu'il soit terminé.
	// Les deuxième et troisième paramètres servent à passer des arguments
	// en ligne de commande au processus.
	 var args = arg.split(' ');
	
	process.run(false, args, args.length);

}

var tmpInput = FGPG_getTmpInputFile();
var tmpOutput = FGPG_getTmpInputFile();

FGPG_putIntoFile(tmpInput,"MEUHHHHHHHHHHHHHHHHHHHHHHHHHH");

FGPG_exeCommand("/usr/bin/gpg"," > " +tmpOutput);

alert(FGPG_getContentFile(tmpInput));
alert(FGPG_getContentFile(tmpOutput));
FGPG_cleanTmpFile(tmpInput,tmpOutput);
