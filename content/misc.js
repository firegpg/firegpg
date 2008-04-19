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

/*try {
     	const cid = "@getfiregpg.org/XPCOM/FireGPGCall;1";
		obj = Components.classes[cid].createInstance();
		obj = obj.QueryInterface(Components.interfaces.IFireGPGCall);
	} catch (err) {
		alert(err);
    }
	var res = obj.Add(3, 4);
	alert('Performing 3+4. Returned ' + res + '.');*/

const FIREGPG_VERSION = '0.4.9';

const FIREGPG_STATUS = 'DEVEL'; // DEVEL or RELASE. Use RELASE only for.. relases ;).

const FIREGPG_SVN = "Unknow";

const NS_LOCALEFILE_CONTRACTID = "@mozilla.org/file/local;1";
const NS_DIRECTORYSERVICE_CONTRACTID = "@mozilla.org/file/directory_service;1";
const NS_NETWORKOUTPUT_CONTRACTID = "@mozilla.org/network/file-output-stream;1";
const NS_NETWORKINPUT_CONTRACTID = "@mozilla.org/network/file-input-stream;1";
const NS_NETWORKINPUTS_CONTRACTID = "@mozilla.org/scriptableinputstream;1";
const NS_PROCESSUTIL_CONTRACTID = "@mozilla.org/process/util;1";

const TMP_DIRECTORY = "TmpD";
const TMP_FILES = "fgpg_tmpFile";
const TMP_RFILES = "fgpg_tmpFile.bat"; //.bat for windows, but don't affect linux
const TMP_EFILES = "fgpg_tmpFile.exe"; //.exe for windows
const WRITE_MODE = 0x02 | 0x08 | 0x20;
const WRITE_PERMISSION = 0600;
const WRITE_PERMISSION_R = 0777;

var savedPassword = null; /* the private key password */


//Check if debuggin is enabled and if yes show up messages in console
function fireGPGDebug(message, debugCode, fatal) {

    return;

    if (fatal)
        Components.utils.reportError("FireGPG-debug: [" + debugCode + "]"  + message);
    else {

        var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
        consoleService.logStringMessage("FireGPG-debug: [" + debugCode + "]"  + message);

    }

}

/*
 * Show a dialog (list.xul) to choose a list of
 * public keys (array).
 *
 * null is returned if the public key is not choosed.
 */
function choosePublicKey(preSelect /* optional */) /* TODO : remove */
{

	if(preSelect == undefined)
		preSelect = {};

	var params = {title: '', description: '', list: {}, selected_items: {}, preSelect: {}};
	var i18n = document.getElementById("firegpg-strings");

	params.title = i18n.getString('choosePublicKeyTitle');
	params.description = i18n.getString('choosePublicKeyDescription');
	params.list = GPG.listKeys();
	params.preSelect = preSelect;


	var dlg = window.openDialog('chrome://firegpg/content/list.xul',
	                            '', 'chrome, dialog, modal, resizable=yes',
	                            params);
	dlg.focus();
	if(params.selected_items.length == 0 || params.selected_items.length == undefined)
	{
		return null;
	} //If we have to, add the private key too.
	else {

		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		   getService(Components.interfaces.nsIPrefService);

		prefs = prefs.getBranch("extensions.firegpg.");
		try {
			var to_my_self = prefs.getBoolPref("allvays_to_myself",false);
		} catch (e) {
			to_my_self = false;
		}

		if (to_my_self == true)
		{
			var selfKeyId = getSelfKey();

			if (selfKeyId != null)
			{
				params.selected_items.push(selfKeyId);
			}
		}
	}

	return params.selected_items;
}

/*
 * Show a dialog (list.xul) to choose the private key.
 *
 * null is returned if the private key is not choosed.
 */
function choosePrivateKey()
{
	var params = {title: '', description: '', list: {}, selected_item: null, preSelect: {}};

	params.title = 'FireGPG - private key' /* TODO i18n */
	params.description = 'Choose the private key:' /* TODO i18n */
	params.list = GPG.listKeys(true);

	var dlg = window.openDialog('chrome://firegpg/content/list.xul',
	                            '', 'chrome, dialog, modal, resizable=yes',
	                            params);
	dlg.focus();
	if(params.selected_items.length == 0)
	{
		params.selected_items = null;
	}
	return params.selected_items;
}
/*
 * Show 'text' in a dialog.
 */
function showText(text, description /* optional */, title /* optional */, doShowButtons /* optional */, validSign /* Optional */) {
	/* default description and title values */
	var i18n = document.getElementById("firegpg-strings");

	/* setting params */
	var params = {text: text, title: title, description: description, doShowButtons: doShowButtons, validSign: validSign};
	if(title == undefined)
		params.title = i18n.getString('showTextDefaultTitle');
	if(description == undefined)
		params.description = i18n.getString('showTextDefaultDescription');
	if(doShowButtons == undefined)
		params.doShowButtons = false;

	if(validSign == undefined)
		params.validSign = null;

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
	var title = i18n.getString('editorTitle');
	var description = i18n.getString('editorDescription');
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
function getPassword(question, save_password, domain) {
	if(save_password == undefined) {
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	                           getService(Components.interfaces.nsIPrefService);

		prefs = prefs.getBranch("extensions.firegpg.");
		try {
			save_password = prefs.getBoolPref("default_memory");
		} catch (e) {
			save_password = true;
		}
	}

    if (domain == undefined)
        domain = false;

	var params = {password: '',
	              save_password: save_password,
	              result: false, question: question, domain: domain};

	var dlg = window.openDialog('chrome://firegpg/content/password.xul',
	                            '', 'chrome, dialog, modal, resizable=yes', params);
	dlg.focus();

	if(params.result)
		return params;

	return null;
}

/*
 * Sauvegarder le mot de passe dans le Password Manager
 * de Firefox.
 */
function savePassword(password) {
}

function getSavedPassword(password) {
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
function getPrivateKeyPassword(useSavedPassword /* default = true */, domain /* default = false*/) {
	/* the default value of the optional variable */
	if(useSavedPassword == undefined)
		useSavedPassword = true;
    if(domain == undefined)
		domain = false;

	/* return password if it's saved in savePassword */
	if(useSavedPassword && savedPassword != null)
		return savedPassword;

	/* show the dialog ! */
	var question = document.getElementById('firegpg-strings').
	                        getString('passwordDialogEnterPrivateKey');

	var result = getPassword(question,undefined,domain);
	if(result == null)
		return null;

	if(result.save_password && domain == false) {
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
function eraseSavedPassword() {
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
	var keyID;
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                           getService(Components.interfaces.nsIPrefService);
	prefs = prefs.getBranch("extensions.firegpg.");
	keyID = prefs.getCharPref("default_private_key");

	/* we must ask for private key ? */
	if(keyID == '')
		keyID = choosePrivateKey();

	/* request password if key id is changed */
	if(keyID != oldKeyID)
		eraseSavedPassword();
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

	var date = new Date();

	fileobj.append( Math.floor(Math.random() * 9999) + date.getTime() + Math.floor(Math.random() * 9999) + Math.floor(Math.random() * 9999) + fileName);
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
 * Get an unique temporary file nam for exes
 * The path + filename is returned.
 */
function getTmpFileExeRunning() {

	var fileobj = getTmpDir();

	permission = WRITE_PERMISSION_R;

	var fileName = TMP_EFILES;

	fileobj.append(fileName);
	fileobj.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, permission);
	fileobj.permissions = permission;
	return fileobj.path;
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
 */
function putIntoFile(filename, data)
{
	var fileobj = Components.classes[NS_LOCALEFILE_CONTRACTID].
	                         createInstance(Components.interfaces.nsILocalFile);

	fileobj.initWithPath(filename);

	var foStream = Components.classes[NS_NETWORKOUTPUT_CONTRACTID].
	                          createInstance(Components.interfaces.nsIFileOutputStream);

	foStream.init(fileobj, WRITE_MODE, WRITE_PERMISSION, 0);
	//foStream.write(data, data.length);

	var charset = "UTF-8"; // Can be any character encoding name that Mozilla supports

	var os = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                   .createInstance(Components.interfaces.nsIConverterOutputStream);

	// This assumes that fos is the nsIOutputStream you want to write to
	os.init(foStream, charset, 0, 0x0000);

	os.writeString(data);

	os.close();


	foStream.close();
}

/*
 * Get the content of a file
 *
 */
function getFromFile(filename,charset) {

    if (!charset)
        charset = "utf-8";

	try {
		var fileobj = Components.classes[NS_LOCALEFILE_CONTRACTID].
		                         createInstance(Components.interfaces.nsILocalFile);

		fileobj.initWithPath(filename);

		var data = "";
		var fstream = Components.classes[NS_NETWORKINPUT_CONTRACTID].createInstance(Components.interfaces.nsIFileInputStream);
		//var sstream2 = Components.classes[NS_NETWORKINPUTS_CONTRACTID].
		//                         createInstance(Components.interfaces.nsIScriptableInputStream);
		const replacementChar = Components.interfaces.nsIConverterInputStream.DEFAULT_REPLACEMENT_CHARACTER;
	//	var charset = /* Need to find out what the character encoding is. Using UTF-8 for this example: */ "UTF-8";
		var sstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"].createInstance(Components.interfaces.nsIConverterInputStream);


		fstream.init(fileobj, -1, 0, 0);
		//sstream2.init(fstream);

		// This assumes that fis is the nsIInputStream you want to read from
		sstream.init(fstream, charset, 1024, 0xFFFD);
		var str = {};
		var lengtth = sstream.readString(4096, str);
		while (lengtth > 0) {
			data += str.value;
			lengtth = sstream.readString(4096, str);
		}

		sstream.close();
		fstream.close();

		return data;
	}
	catch (e) { alert(e)}

	return '';
}

/* Set the content of a binary file */
function putIntoBinFile(filename, data) {
	// pngBinary already exists
	var aFile = Components.classes["@mozilla.org/file/local;1"]
			      .createInstance(Components.interfaces.nsILocalFile);

	aFile.initWithPath(filename);

	var stream = Components.classes["@mozilla.org/network/safe-file-output-stream;1"]
			       .createInstance(Components.interfaces.nsIFileOutputStream);
	stream.init(aFile, WRITE_MODE, WRITE_PERMISSION, 0); // write, create, truncate

	stream.write(data, data.length);
	if (stream instanceof Components.interfaces.nsISafeOutputStream) {
	    stream.finish();
	} else {
	    stream.close();
	}
}

/* Get the content of a binary file */
function getBinContent(aURL) {
	var ioService = Components.classes["@mozilla.org/network/io-service;1"].
	                           getService(Components.interfaces.nsIIOService);


	var istream = Components.classes["@mozilla.org/network/file-input-stream;1"]
			.createInstance(Components.interfaces.nsIFileInputStream);

	var channel = ioService.newChannel(aURL, null, null);

	var input = channel.open();

	//istream.init(input, -1, -1, false);

	var bstream = Components.classes["@mozilla.org/binaryinputstream;1"]
			.createInstance(Components.interfaces.nsIBinaryInputStream);
	bstream.setInputStream(input);

	var bytes = bstream.readBytes(bstream.available());

	return bytes;
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
 * getContent of a webpage, using a xmlhttprequest
 */

function getContentXHttp(url)
{
	p = new XMLHttpRequest();
	p.onload = null;
	p.open("GET", url, false);
	p.send(null);

	if ( p.status != "200" )
	{
	    return null;
	}
	else
	{
	    contenu = p.responseText;
	    return contenu;
	}
}

/*
* Run a command on windows (with a hidden dos box)
*/
function runWinCommand(command, arg) {

	var commandWindows = getTmpFileExeRunning();

	var runner = getBinContent("chrome://firegpg/content/hstart.exe");
	putIntoBinFile(commandWindows,runner);

	var file = Components.classes[NS_LOCALEFILE_CONTRACTID].
	                      createInstance(Components.interfaces.nsILocalFile);
	file.initWithPath(commandWindows);

	var process = Components.classes[NS_PROCESSUTIL_CONTRACTID].
	                         createInstance(Components.interfaces.nsIProcess);
	process.init(file);


	arg = command + ' ' +  arg;

	var reg = new RegExp("\"", "gi");
	var args = arg.replace(reg, "\\\"");

	args = ["/WAIT","/NOWINDOW","/WAITIDLE","/REALTIME" ,'cmd /c "' + args + '"'];

	process.run(true, args, args.length);

	removeFile(commandWindows);

}

/*
* Test if we had to show the 'What is new' box, and send a ping.
*/
function testIfSomethingsIsNew() {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                       getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");
	var version  = "";
	try {
		version = prefs.getCharPref("gpg_version");
	} catch (e) { }

	var em = Components.classes["@mozilla.org/extensions/manager;1"]
                   .getService(Components.interfaces.nsIExtensionManager);

	var addon = em.getItemForID("firegpg@firegpg.team");
	var versionAct = addon.version;

    versionAct = FIREGPG_VERSION;

	var i18n = document.getElementById("firegpg-strings");

	if (version != versionAct)
	{
		prefs.setCharPref("gpg_version",versionAct)

		var title = "FireGPG - What is new ?";
		var description = "What is new in FireGPG ? (An anonymous ping has been send to FireGPG's team for stats.)";
		try {

			title = i18n.getString('whatIsNewTitle');
			description = i18n.getString('whatIsNewDescription');
		} catch (e) { }

        //showText(getContent("chrome://firegpg/content/whatisnew.txt"),description,title,true);

        //Show the page
        gBrowser.selectedTab = gBrowser.addTab("http://getfiregpg.org/?page=nv");

        //Send the ping

		if (version == "")
			var mode = "New";
		else
			var mode = version;

		var misc = getContent("http://getfiregpg.org/stable/stats.php?version=" + versionAct + "&oldversion=" + mode);


    } else {

		//Try to find an update, if it's needed.
		var noUpdates = false;
		try {
			noUpdates = prefs.getBoolPref("no_updates");
		} catch (e) { }

		if (!noUpdates)
		{
			var Stamp = new Date();
			var nbMs = Stamp.getTime();

			var lastUpdate = 0;

			try {
				lastUpdate = parseInt(prefs.getCharPref("lastUpdateCheck"));
			} catch (e) { }

			//Not A Number
			if (isNaN(lastUpdate))
				lastUpdate = 0;
			//One day
			if (lastUpdate < (nbMs  - (24 * 60 * 60 * 1000)))
			{

				prefs.setCharPref("lastUpdateCheck",nbMs);

				//Get the last version
				var updateData = getContent("http://getfiregpg.org/stable/update.rdf");

				var toDetect = "NS1:version=\"" + versionAct + "\"";

				if (updateData.indexOf('ec8030f7-c20a-464f-9b0e-13a3a9e97384') != -1 && updateData.indexOf(toDetect) == -1  )
				{

					var newVersion = "A new version of FireGPG is available, would you like to update now?";
					try {

						newVersion = i18n.getString('newVersionAlert');
					} catch (e) { }

					if (confirm(newVersion))
					{
						openUILink("http://getfiregpg.org/stable/firegpg.xpi");
					}
				}
			}
		}
	}
}

// Encode html
function htmlEncode(s) {
        var str = new String(s);
        str = str.replace(/&/g, "&amp;");
        str = str.replace(/</g, "&lt;");
        str = str.replace(/>/g, "&gt;");
        str = str.replace(/"/g, "&quot;");
        return str;
}


/*
* This fuction approximates gmail's line-wrapping rules, so that
* a message can be wrapped before it's signed, instead of after,
* which would break the signature.
*/
function gmailWrapping(text)
{
	var lines = text.split("\n");
	var result = "";

	// Wrap each line
	for (var i = 0; i < lines.length; i++)
	{
		// gmail doesn't wrap lines with less than 81 characters
		// or lines that have been quoted from previous messages
		// in the usual way, so we don't bother either.
		if (lines[i].length <= 80 || lines[i].substring(0,2) == "> ")
			result = result + lines[i] + "\n";
		else
			// If we're wrapping a line, each of the resulting
			// lines shouldn't be longer than 70 characters
			// unless it has to be.
			result = result + wrap(lines[i], 70) + "\n";
	}

	return result;
}

/*
* This function wraps a single line of text into multiple lines,
* each no longer than limit, unless a single word is too long.
*/
function wrap(text, limit)
{
	var result = "";

	// Keep wrapping until the remainder is short enough.
	while (text.length > limit)
	{
		var index = text.lastIndexOf(" ", limit);
		// If the first word is too long, look for the first space
		if (index == -1)
			index = text.indexOf(" ");
		// If there are no more spaces at all, give up.
		if (index == -1)
        {
			break;
		}
		else
		{
			result = result + text.substring(0, index) + "\n";
    		text = text.substring(index + 1);
		}
	}

	return result + text;
}

function genreate_api_key() {
		var validchars = "";
		var startvalid = "";

		var minsize, maxsize, count, actualsize, random_value;
		minsize = parseInt( 64 );
		maxsize = parseInt( 128 );
		startvalid = "";
		validchars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
		actualsize = Math.floor( Math.random() * ( maxsize - minsize + 1 ) ) + minsize;
		random_value = startvalid.charAt( Math.floor( Math.random() * startvalid.length ) );
		for (count = 1; count < actualsize; count++){
			random_value += validchars.charAt( Math.floor( Math.random() * validchars.length ) );
		}
		return random_value;
}

//Trim function (remove spaces)
function trim (str){
    return str.replace(/^\s+/, "").replace(/\s+$/, "");
}

//TrimAndWash (clean a string, remove \n and spaces)
function TrimAndWash(str) {
    return trim(str).replace(/\n/, "");
}

//enigmail function
function EnigConvertGpgToUnicode(text) {

  if (typeof(text)=="string") {
    text = text.replace(/\\x3a/ig, "\\e3A");
    a=text.search(/\\x[0-9a-fA-F]{2}/);
    while (a>=0) {
        ch=unescape('%'+text.substr(a+2,2));
        r= new RegExp("\\"+text.substr(a,4));
        text=text.replace(r, ch);

        a=text.search(/\\x[0-9a-fA-F]{2}/);
    }

    text = EnigConvertToUnicode(text, "utf-8");
  }
  return text;
}

//enigmail function
function EnigConvertToUnicode(text, charset) {
  if (!text || !charset || (charset.toLowerCase() == "iso-8859-1"))
    return text;

  // Encode plaintext
  try {
    var unicodeConv = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].getService(Components.interfaces.nsIScriptableUnicodeConverter);

    unicodeConv.charset = charset;
    return unicodeConv.ConvertToUnicode(text);

  } catch (ex) {
    return text;
  }
}

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
