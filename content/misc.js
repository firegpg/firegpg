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


const FIREGPG_VERSION = '0.3.3';
const NS_LOCALEFILE_CONTRACTID = "@mozilla.org/file/local;1";
const NS_DIRECTORYSERVICE_CONTRACTID = "@mozilla.org/file/directory_service;1";
const NS_NETWORKOUTPUT_CONTRACTID = "@mozilla.org/network/file-output-stream;1";
const NS_NETWORKINPUT_CONTRACTID = "@mozilla.org/network/file-input-stream;1";
const NS_NETWORKINPUTS_CONTRACTID = "@mozilla.org/scriptableinputstream;1";

const TMP_DIRECTORY = "TmpD";
const TMP_FILES = "fgpg_tmpFile";
const TMP_RFILES = "fgpg_tmpFile.bat"; //.bat for windows, but don't affect linux
const WRITE_MODE = 0x02 | 0x08 | 0x20;
const WRITE_PERMISSION = 0600;
const WRITE_PERMISSION_R = 0777;

var savedPassword = null; /* the private key password */

/*
 * Show a dialog (list.xul) to choose the public key.
 *
 * null is returned if the public key is not choosed.
 */
function choosePublicKey()
{
	var params = {title: '', description: '', list: {}, selected_item: null};
	var i18n = document.getElementById("firegpg-strings");

	params.title = i18n.getString('choosePublicKeyTitle');
	params.description = i18n.getString('choosePublicKeyDescription');
	params.list = GPG.listKeys();

	var dlg = window.openDialog('chrome://firegpg/content/list.xul',
	                            '', 'chrome, dialog, modal, resizable=yes',
	                            params);
	dlg.focus();
	return params.selected_item;
}

/*
 * Show a dialog (list.xul) to choose the private key.
 *
 * null is returned if the private key is not choosed.
 */
function choosePrivateKey()
{
	var params = {title: '', description: '', list: {}, selected_item: null};

	params.title = 'FireGPG - private key' /* TODO i18n */
	params.description = 'Choose the private key:' /* TODO i18n */
	params.list = GPG.listKeys(true);

	var dlg = window.openDialog('chrome://firegpg/content/list.xul',
	                            '', 'chrome, dialog, modal, resizable=yes',
	                            params);
	dlg.focus();
	return params.selected_item;
}
/*
 * Show 'text' in a dialog.
 */
function showText(text, description /* optional */, title /* optional */, doShowButtons /* optional */) {
	/* default description and title values */
	var i18n = document.getElementById("firegpg-strings");

	/* setting params */
	var params = {text: text, title: title, description: description, doShowButtons: doShowButtons};
	if(title == undefined)
		params.title = i18n.getString('showTextDefaultTitle');
	if(description == undefined)
		params.description = i18n.getString('showTextDefaultDescription');
	if(doShowButtons == undefined)
		params.doShowButtons = false;
	/* open the dialog */
	window.openDialog('chrome://firegpg/content/showtext.xul',
	                  '', 'chrome, dialog, resizable=yes',
	                  params).focus();
}

/*
* Open the editor (the showtext dialog)
*/

function showEditor() {
	var i18n = document.getElementById("firegpg-strings");
	title = i18n.getString('editorTitle');
	description = i18n.getString('editorDescription');
	showText('',description,title);
}

/*
 * Generic dialog to get a password.
 *
 * An object is returned :
 *  {password: "password", save_password: true/false}
 *
 * null is returned if cancel button is clicked.
 */
function getPassword(question, save_password) {


	if (save_password == undefined)
	{

		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	                           getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");
		try {
			save_password = prefs.getBoolPref("default_memory");

		} catch (e) {
			save_password = true;
		}
	}


	var params = {password: '',
	              save_password: save_password,
	              result: false, question: question};

	var dlg = window.openDialog('chrome://firegpg/content/password.xul',
	                            '', 'chrome, dialog, modal, resizable=yes', params);
	dlg.focus();

	if(params.result)
		return params;

	return null;
}

/*
 * This function uses getPassword() to return this object:
 *   {password: "the password", save_password: "save password ?"}
 *
 * If useSavedPassword = false, the password is asked each time,
 * even if it's already saved in the global variable savedPassword.
 *
 * null is returned on error.
 */
function getPrivateKeyPassword(useSavedPassword /* default = true */) {
	/* the default value of the optional variable */
	if(useSavedPassword == undefined)
		useSavedPassword = true;

	/* return password if it's saved in savePassword */
	if(useSavedPassword && savedPassword != null)
		return savedPassword;

	/* show the dialog ! */
	var question = document.getElementById('firegpg-strings').
	                        getString('passwordDialogEnterPrivateKey');

	var result = getPassword(question);
	if(result == null)
		return null;

	if(result.save_password) {
		savedPassword = result.password;

		try {
			document.getElementById('firegpg-menu-memo-pop').style.display = '';
			document.getElementById('firegpg-menu-memo-menu').style.display = '';

			document.getElementById('firegpg-menu-memo-tool').style.display = '';
		}
		catch(e) {}
	}

	return result.password;
}

/*
 * This function erase the saved password (if for exemple a sign failled)
 */
function eraseSavedPassword()
{
	savedPassword = null;

	try {
		document.getElementById('firegpg-menu-memo-pop').style.display = 'none';
		document.getElementById('firegpg-menu-memo-menu').style.display = 'none';

		document.getElementById('firegpg-menu-memo-tool').style.display = 'none';
	}
	catch (e) {}
}

/*
 * Funtion who return the default private key.
 *
 * null is returned if no key is selected.
 */
var oldKeyID = '';
function getSelfKey() {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                           getService(Components.interfaces.nsIPrefService);
	prefs = prefs.getBranch("extensions.firegpg.");
	keyID = prefs.getCharPref("default_private_key");

	/* we must ask for private key ? */
	if(keyID == '')
		keyID = choosePrivateKey()

	/* request password if key id is changed */
	if(keyID != oldKeyID)
		eraseSavedPassword()
	oldKeyID = keyID;

	return keyID;
}

/*
 * Get the path of a tmp file.
 * The path is returned.
 */
function getTmpDir() {
	return Components.classes[NS_DIRECTORYSERVICE_CONTRACTID].
	                  getService(Components.interfaces.nsIProperties).
	                  get(TMP_DIRECTORY, Components.interfaces.nsIFile);
}

/*
 * Get an unique temporary file name.
 * The path + filename is returned.
 */
function getTmpFile(permission /* optional */) {
	if(permission == undefined)
		permission = WRITE_PERMISSION;

	var fileobj = getTmpDir();

	if (permission == WRITE_PERMISSION_R)
		var fileName = TMP_RFILES;
	else
		var fileName = TMP_FILES;

	fileobj.append(fileName);
	fileobj.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, permission);
	fileobj.permissions = permission;
	return fileobj.path;
}

/*
 * Get an unique temporary file name, who can be executed
 * The path + filename is returned.
 */
function getTmpFileRunning() { /* TODO *Running -> *CanBeLaunched ? */
	return getTmpFile(WRITE_PERMISSION_R);
}

/*
 * Get an unique, temporary file name, for password (so it's random).
 * The path + filename is returned.
 */
function getTmpPassFile() {
	var fileobj = getTmpDir();
	var fileName = Math.floor(Math.random() * 9999);
	var aleatoire = Math.floor(Math.random() * 9);

	switch(aleatoire) {
		case 0: fileName = fileName + "sd2345asd1234"; break;
		case 1: fileName = fileName + "asdfsad"; break;
		case 2: fileName = fileName + "rtdfgjdgth45dfhdfgas"; break;
		case 3: fileName = fileName + "ssdfsdfwe5jfgjkgh"; break;
		case 4: fileName = fileName + "gfhjghjghjghjghjjd1234"; break;
		case 5: fileName = fileName + "sertghjghjghjghj"; break;
		case 6: fileName = fileName + "sdfgh456dgsdfg"; break;
		case 7: fileName = fileName + "kbysgfjkdfghdfgh"; break;
		case 8: fileName = fileName + "ertasmlsdfjhgf"; break;
		case 9: fileName = fileName + "fhfghsdfhhdfgh4"; break;
	}

	fileName = fileName + Math.floor(Math.random() * 9999);

	aleatoire = Math.floor(Math.random() * 9)
	switch(aleatoire) {
		case 0: fileName = fileName + "5hrfgh"; break;
		case 1: fileName = fileName + "sfgd"; break;
		case 2: fileName = fileName + "sdfsdf"; break;
		case 3: fileName = fileName + "tzugbn"; break;
		case 4: fileName = fileName + "sdfsdf"; break;
		case 5: fileName = fileName + "nvbnvbn"; break;
		case 6: fileName = fileName + "zuigdfg"; break;
		case 7: fileName = fileName + "dfjfgfh"; break;
		case 8: fileName = fileName + "ertertef"; break;
		case 9: fileName = fileName + "fdfgdfgdfgdfgdfgrxdcbvndfg"; break;
	}

	fileName = fileName + Math.floor(Math.random() * 9999);
	fileobj.append(fileName);
	fileobj.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, WRITE_PERMISSION);

	return fileobj.path;
}

/*
 * Remove a file.
 */
function removeFile(path) {
	var fileobj = Components.classes[NS_LOCALEFILE_CONTRACTID].
	                         createInstance(Components.interfaces.nsILocalFile);
	fileobj.initWithPath(path);

	try {
		fileobj.remove(path);
	}
	catch (e) {
		/* If file dosen't exist */
	}
}

/*
 * Put data into a file.
 *
 * //TODO: UNICODE !!!! http://developer.mozilla.org/en/docs/Reading_textual_data
 */
function putIntoFile(filename, data)
{
	var fileobj = Components.classes[NS_LOCALEFILE_CONTRACTID].
	                         createInstance(Components.interfaces.nsILocalFile);

	fileobj.initWithPath(filename);

	var foStream = Components.classes[NS_NETWORKOUTPUT_CONTRACTID].
	                          createInstance(Components.interfaces.nsIFileOutputStream);

	foStream.init(fileobj, WRITE_MODE, WRITE_PERMISSION, 0);
	foStream.write(data, data.length);
	foStream.close();
}

/*
 * Get the content of a file
 *
 * //TODO: UNICODE !!!! http://developer.mozilla.org/en/docs/Reading_textual_data
 */
function getFromFile(filename) {
	try {
		var fileobj = Components.classes[NS_LOCALEFILE_CONTRACTID].
		                         createInstance(Components.interfaces.nsILocalFile);

		fileobj.initWithPath(filename);

		var data = "";
		var fstream = Components.classes[NS_NETWORKINPUT_CONTRACTID].
		                         createInstance(Components.interfaces.nsIFileInputStream);
		var sstream = Components.classes[NS_NETWORKINPUTS_CONTRACTID].
		                         createInstance(Components.interfaces.nsIScriptableInputStream);

		fstream.init(fileobj, -1, 0, 0);
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
	catch (e) {}

	return '';
}

/*
 * To get a content from any where (like chrome://)
 */
function getContent(aURL){
	var ioService = Components.classes["@mozilla.org/network/io-service;1"].
	                           getService(Components.interfaces.nsIIOService);
	var scriptableStream = Components.classes["@mozilla.org/scriptableinputstream;1"].
	                                  getService(Components.interfaces.nsIScriptableInputStream);
	var channel = ioService.newChannel(aURL, null, null);

	var input = channel.open();
	scriptableStream.init(input);

	var str = scriptableStream.read(input.available());
	scriptableStream.close();
	input.close();

	return str;
}

/*
 * Run a command
 */
function runCommand(command, arg) {
	var file = Components.classes[NS_LOCALEFILE_CONTRACTID].
	                      createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(command);

	var process = Components.classes[NS_PROCESSUTIL_CONTRACTID].
	                         createInstance(Components.interfaces.nsIProcess);
	process.init(file);
	var args = arg.split(' ');
	process.run(true, args, args.length);
}

/*
* Test if we had to show the 'What is new' box
*/
function testIfSomethingsIsNew() {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                       getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");
	var version  = "";
	try {
		version = prefs.getCharPref("gpg_version");
	} catch (e) { }

	if (version != FIREGPG_VERSION)
	{
		prefs.setCharPref("gpg_version",FIREGPG_VERSION)
		var i18n = document.getElementById("firegpg-strings");
		title = i18n.getString('whatIsNewTitle');
		description = i18n.getString('whatIsNewDescription');
		showText(getContent("chrome://firegpg/content/whatisnew.txt"),description,title,true);
	}
}

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
