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
try {
     	const cid = "@getfiregpg.org/XPCOM/FireGPGCall;1";
		obj = Components.classes[cid].createInstance();
		obj = obj.QueryInterface(Components.interfaces.IFireGPGCall);
	} catch (err) {
		alert("E" + err);
    }
	var res = obj.Call("touch"," touch /tmp/coucou","testtest\n");
    alert("R" + res);
//
*/


/* Constant: FIREGPG_VERSION
  The current version of FireGPG */
const FIREGPG_VERSION = '0.6.2';

/* Constant: FIREGPG_STATUS
  The status of the FireGPG's code. Can be _DEVEL_ or _RELASE_. Use _RELASE_ only for.. relases ;). */
const FIREGPG_STATUS = 'DEVEL';

/* Constant: FIREGPG_SVN
  The current subversion's revision number, for this file ! */
const FIREGPG_SVN = "$Rev$";

/*
   Constants: Id for components.

   NS_LOCALEFILE_CONTRACTID - Id for the component @mozilla.org/file/local;1
   NS_DIRECTORYSERVICE_CONTRACTID    - Id for the component @mozilla.org/file/directory_service;1
   NS_NETWORKOUTPUT_CONTRACTID   - Id for the component @mozilla.org/network/file-output-stream;1
   NS_NETWORKINPUT_CONTRACTID   - Id for the @mozilla.org/network/file-input-stream;1
   NS_NETWORKINPUTS_CONTRACTID   - Id for the component @mozilla.org/scriptableinputstream;1
   NS_PROCESSUTIL_CONTRACTID   - Id for the component @mozilla.org/process/util;1
*/
const NS_LOCALEFILE_CONTRACTID = "@mozilla.org/file/local;1";
const NS_DIRECTORYSERVICE_CONTRACTID = "@mozilla.org/file/directory_service;1";
const NS_NETWORKOUTPUT_CONTRACTID = "@mozilla.org/network/file-output-stream;1";
const NS_NETWORKINPUT_CONTRACTID = "@mozilla.org/network/file-input-stream;1";
const NS_NETWORKINPUTS_CONTRACTID = "@mozilla.org/scriptableinputstream;1";
const NS_PROCESSUTIL_CONTRACTID = "@mozilla.org/process/util;1";

/*
   Constants: Tempory files

   TMP_DIRECTORY - The base name for files (dosen't same to be a directory)
   TMP_FILES    - The file name for common files.
   TMP_RFILES   - The file name for executable scripts.
   TMP_EFILES   - The file name for executables..
*/
const TMP_DIRECTORY = "TmpD";
const TMP_FILES = "fgpg_tmpFile";

/*
   Constants: Write modes for files.

   WRITE_MODE - The default mode for files.
   WRITE_PERMISSION    - The default permission for files
   WRITE_PERMISSION_R   - The default permission for executable files
*/
const WRITE_MODE = 0x02 | 0x08 | 0x20;
const WRITE_PERMISSION = 0600;
const WRITE_PERMISSION_R = 0777;

/*
    Variable: savedPassword
    The password of the private key, saved for later actions.
 */
var savedPassword = null; /* the private key password */

/*
    Variable: oldKeyID
    The previous key selected.
 */
var oldKeyID = '';

/*
    Function: fireGPGDebug

    Check if debuggin is enabled and if yes show up messages in console

    Paramters:
        message - The message
        debugCode - The position in the code
        fatal - True if it's a fatal error.

*/
function fireGPGDebug(message, debugCode, fatal) {

    if (FIREGPG_STATUS == "RELASE" && !fatal)
        return;

    if (fatal)
        Components.utils.reportError("FireGPG-debug: [" + debugCode + "]"  + message);
    else {

        var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
        consoleService.logStringMessage("FireGPG-debug: [" + debugCode + "] "  + message);

    }

}

/*
    Function: choosePublicKey

    Show a dialog (list.xul) to choose a list of public keys (array).
    null is returned if the public key is not choosed

    Paramters:
        preSelect - _Optional_. And array of kkey to preselect.

*/
function choosePublicKey(preSelect)
{

	if(preSelect == undefined)
		preSelect = {};

	var params = {title: '', description: '', list: {}, selected_items: {}, preSelect: {}};
	var i18n = document.getElementById("firegpg-strings");

	params.title = i18n.getString('choosePublicKeyTitle');
	params.description = i18n.getString('choosePublicKeyDescription');

    keylistcall = FireGPG.listKeys();

    if (keylistcall.result == RESULT_SUCCESS)
        params.list = keylistcall.keylist;
    else
        return;

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
    Function: choosePrivateKey

    Show a dialog (list.xul) to choose a private key.
    null is returned if no keys are chosen.
*/
function choosePrivateKey()
{
	var params = {title: '', description: '', list: {}, selected_item: null, preSelect: {}};

    var i18n = document.getElementById("firegpg-strings");

	params.title = i18n.getString('choosePrivateKeyTitle');
	params.description = i18n.getString('choosePrivateKeyDescription');


	keylistcall = FireGPG.listKeys(true);

    if (keylistcall.result == RESULT_SUCCESS)
        params.list = keylistcall.keylist;
    else
        return;

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
    Function: showText

    Show 'text' in a dialog (the editor)

    Parameters:
        text - The text to show display
        description - _Optional_. The message to show. If not set, use the default.
        title - _Optional_. The title of the window. If not set, use the default.
        doShowButtons - _Optional_. If we have to show buttons to encrypt and so. Default to false.
        validSign - _Optional_. The message for the validSign field.
*/
function showText(text, description, title, doShowButtons, validSign) {
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
    Function: showEditor

    Open the editor (the showtext.xul dialog)
*/
function showEditor() {
	var i18n = document.getElementById("firegpg-strings");
	var title = i18n.getString('editorTitle');
	var description = i18n.getString('editorDescription');
	showText('',description,title);
}

/*
    Function: getPassword

    Show the generic dialog to get a password.

    An object is returned :
   {password: "password", save_password: true/false}$

    null is returned if cancel button is clicked.

    Parameters:
        question - The text to show for the prompt.
        save_password - _Optional_. The default value for the save password checkbox. If not set, value set in the options by the user is used.
        domain - _Optional_. Say the password is asked form this page and disable the savepassword checkbox.
        nosavecheckbox - _Optional_. Disable the save password feature
*/
function getPassword(question, save_password, domain, nosavecheckbox) {
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

     if (nosavecheckbox == undefined)
        nosavecheckbox = false;

	var params = {password: '',
	              save_password: save_password,
	              result: false, question: question, domain: domain, nosavecheckbox: nosavecheckbox};

	var dlg = window.openDialog('chrome://firegpg/content/password.xul',
	                            '', 'chrome, dialog, modal, resizable=yes', params);
	dlg.focus();

	if(params.result)
		return params;

	return null;
}

/*
    Function: savePassword
    * TODO !*
    Save a password in the password manager of Firefox

    Parameters:
        password - The password

*/
function savePassword(password) {
}

/*
    Function: getSavedPassword
    * TODO !*
    Get the password saved in the password manager of Firefox
*/
function getSavedPassword() {
}

/*
    Function: getPrivateKeyPassword

    This function uses getPassword() to get a password for a private key.

    It's the user request for it, it's save the password for later.

    If useSavedPassword = false, the password is asked each time,
    even if it's already saved in the global variable savedPassword.

    null is returned on error.

    Parameters:
        useSavedPassword - _Optional_. Set this to false to disable the use of a saved password
        domain - _Optional_. The domain to pass to <getPassword>.
        message - _Optional_. The message to ask the user.
        nosavecheckbox - _Optional_. Disable the save password feature

*/
function getPrivateKeyPassword(useSavedPassword /* default = true */, domain /* default = false*/, message /* default = false*/, nosavecheckbox) {
	/* the default value of the optional variable */
	if(useSavedPassword == undefined)
		useSavedPassword = true;
    if(domain == undefined)
		domain = false;

    if (nosavecheckbox == undefined)
        nosavecheckbox = false;


	/* return password if it's saved in savePassword */
	if(useSavedPassword && savedPassword != null)
		return savedPassword;

	/* show the dialog ! */
	if (message == undefined)
        var question = document.getElementById('firegpg-strings').
	                        getString('passwordDialogEnterPrivateKey');
    else
        var question = message;

	var result = getPassword(question,undefined,domain, nosavecheckbox);

    if(result == null)
		return null;

	if(result.save_password && domain == false && nosavecheckbox != true) {
		savedPassword = result.password;

		try {
			document.getElementById('firegpg-menu-memo-pop').style.display = '';
			document.getElementById('firegpg-menu-memo-menu').style.display = '';

			document.getElementById('firegpg-menu-memo-tool').style.display = '';
		}
		catch(e) {   fireGPGDebug(e,'misc.getPrivateKeyPassword',true);  }
	}

	return result.password;
}

/*
    Function: getsavedPassword
    Return the saved password
*/
function getsavedPassword() {

    return savedPassword;


}

/*
    Function: eraseSavedPassword
    This function erase the saved password (it's for exemple when a sign failled)
*/
function eraseSavedPassword() {

	savedPassword = null;

	try {
		document.getElementById('firegpg-menu-memo-pop').style.display = 'none';
		document.getElementById('firegpg-menu-memo-menu').style.display = 'none';
		document.getElementById('firegpg-menu-memo-tool').style.display = 'none';
	}
	catch (e) {  fireGPGDebug(e,'misc.eraseSavedPassword',true);  }
}


/*
    Function: getSelfKey

    Function who return a  private key for the user (the default or the one selected in the list)
    null is returned if no key is selected.
*/
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
	if(keyID.toString() != oldKeyID.toString()) {
        eraseSavedPassword();
    }

	oldKeyID = keyID;

	return keyID;
}

/*
    Function: getTmpDir

   Get the path of a tmp file.
    The path is returned.
*/
function getTmpDir() {
	return Components.classes[NS_DIRECTORYSERVICE_CONTRACTID].
	                  getService(Components.interfaces.nsIProperties).
	                  get(TMP_DIRECTORY, Components.interfaces.nsIFile);
}


/*
    Function: getTmpFile

    Get an unique temporary file name.
    The path + filename is returned.

    Parameters:
        permission - _Optional_. The permission of the file. See <Write modes for files>
        suffix_file - _Optional_. A suffix to add to the default file name.
*/
function getTmpFile(permission /* optional */, suffix_file)  {
	if(permission == undefined)
		permission = WRITE_PERMISSION;

	var fileobj = getTmpDir();

	if (permission == WRITE_PERMISSION_R)
		var fileName = TMP_RFILES;
	else
		var fileName = TMP_FILES;

    if(suffix_file != undefined)
        fileName += '_S_' + suffix_file; //To be sure to be unique.

	var date = new Date();

	fileobj.append( Math.floor(Math.random() * 9999) + date.getTime() + Math.floor(Math.random() * 9999) + Math.floor(Math.random() * 9999) + fileName);
	fileobj.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, permission);
	fileobj.permissions = permission;
	return fileobj.path;
}


/*
    Function: removeFile
    Delete a file.

    Parameters:
        path - The file to delete.
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
    Function: putIntoFile
    Save data to a file. File saved in UTF-8 charset.

    Parameters:
        filename - The name of the file
        data - The data to save
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
    Function: getFromFile
    Get the content of a file

    Parameters:
        filename - The location of the file.
        charset - _Optional_. The charset of the file. Default to UTF-8
*/
function getFromFile(filename,charset) {

    if (charset == undefined)
        charset = "UTF-8";

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
	catch (e) { fireGPGDebug(e,'misc.getFromFile',true) }

	return '';
}

/*
    Function: putIntoBinFile
    Save data to a file, in binary mode.

    Parameters:
        filename - The name of the file
        data - The data to save
*/
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

/*
    Function: getBinContent
    Get the content of a binary file

    Parameters:
        aURL - The location of the file.
*/
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
    Function: getContent
    Get the content of a resource form anywhere (like chrome://)

    Parameters:
        aURL - The location of the resource.
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
    Function: getContentXtttp
    Get the content of a web resource by using a xmlhttprequest.

    Parameters:
        url - The url of the resource
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
    Function: testIfSomethingsIsNew
    Test if user update FireGPG or if he have to update, and show the What is new page send a ping or propose to update FireGPG if relevant.
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

		/*var title = "FireGPG - What is new ?";
		var description = "What is new in FireGPG ? (An anonymous ping has been send to FireGPG's team for stats.)";
		try {

			title = i18n.getString('whatIsNewTitle');
			description = i18n.getString('whatIsNewDescription');
		} catch (e) { }

        //showText(getContent("chrome://firegpg/content/whatisnew.txt"),description,title,true);*/

        //Show the page
        gBrowser.selectedTab = gBrowser.addTab("http://getfiregpg.org/index.php?page=nv&v=" + versionAct);

        //Send the ping

		if (version == "")
			var mode = "New";
		else
			var mode = version;

		var misc = getContent("http://getfiregpg.org/stable/stats.php?version=" + versionAct + "&oldversion=" + mode);


    } else {

        //DESACTIVED FOR ADDON.MOZILLA.ORG /*



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
        //*/
	}
}


/*
    Function: htmlEncode
    Encode special chars (&, <, > et ") to they html values.

    Parameters:
        s - The text.
*/
function htmlEncode(s) {
        var str = new String(s);
        str = str.replace(/&/g, "&amp;");
        str = str.replace(/</g, "&lt;");
        str = str.replace(/>/g, "&gt;");
        str = str.replace(/"/g, "&quot;");
        return str;
}


/*
    Function: gmailWrapping

    This fuction approximates gmail's line-wrapping rules, so that
    a message can be wrapped before it's signed, instead of after,
    which would break the signature.

    Parameters:
        text - The text.

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
    Function: wrap

    This function wraps a single line of text into multiple lines,
    each no longer than limit, unless a single word is too long.

    Parameters:
        text - The text.
        limit - The maximum characters for one line.
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

/*
    Function: genreate_api_key

    Generate and random string between 64 and 128 charactes, probably unique.
    This is usefull for the api.
*/
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

/*
    Function: trim
    Remove extra space at the end and the begging of the string.

    Parameters:
        str - The string
*/
function trim (str){
    return str.replace(/^\s+/, "").replace(/\s+$/, "");
}

/*
    Function: TrimAndWash
    Remove extra space at the end and the begging of the string, and remove \n

    Parameters:
        str - The string
*/
function TrimAndWash(str) {
    return trim(str).replace(/\n/, "");
}

/*
    Function: EnigConvertGpgToUnicode

    Convert the gpg --with-collums text (who are strangly encoded) into a uniform Unicode string.

    This function is from Enigmail, same license as FireGPG.

    Parameters:
        text - The text to convert
*/
function EnigConvertGpgToUnicode(text) {

    try {

        if (typeof(text)=="string") {
            text = text.replace(/\\x3a/ig, "\\e3A");
            a=text.search(/\\x[0-9a-fA-F]{2}/);
            while (a>=0) {
                ch=unescape('%'+text.substr(a+2,2));
                r= new RegExp("\\"+text.substr(a,4));
                text=text.replace(r, ch);
                a=text.search(/\\x[0-9a-fA-F]{2}/);
            }
        }

        text = EnigConvertToUnicode(text, "utf-8");

   }  catch (ex) {  fireGPGDebug(ex,'misc.EnigConvertGpgToUnicode',true); }

   return text;
}

/*
    Function: EnigConvertToUnicode

    Convert the text, in the specified chaset, into an Unicode string.
    This function is from Enigmail, same license as FireGPG.

    Parameters:
        text - The text to convert
        charset - The charset of the text.
*/
function EnigConvertToUnicode(text, charset) {
  if (!text || !charset || (charset.toLowerCase() == "iso-8859-1"))
    return text;

  // Encode plaintext
  try {
    var unicodeConv = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].getService(Components.interfaces.nsIScriptableUnicodeConverter);

    unicodeConv.charset = charset;

    return unicodeConv.ConvertToUnicode(text);

  } catch (ex) {
    fireGPGDebug(ex,'misc.EnigConvertToUnicode',true);
    return text;
  }
}

/*
    Function: EnigConvertFromUnicode

    Convert the text, in unicode, into an string in the specified chaset.
    This function is from Enigmail, same license as FireGPG.

    Parameters:
        text - The text to convert
        charset - The charset of the text.
*/
function EnigConvertFromUnicode(text, charset) {
  if (!text || !charset || (charset.toLowerCase() == "iso-8859-1"))
    return text;

  // Encode plaintext
  try {
    var unicodeConv = Components.classes["@mozilla.org/intl/scriptableunicodeconverter"].getService(Components.interfaces.nsIScriptableUnicodeConverter);

    unicodeConv.charset = charset;

    return unicodeConv.ConvertFromUnicode(text);

  } catch (ex) {
    fireGPGDebug(ex,'misc.EnigConvertFromUnicode',true);
    return text;
  }
}



/*
  Function: CreateTreeItemKey

  Return a Treeitem for the key in parameter

  Parameters:
    key - The key
    document - The current document.
    forceId - If we have to force the id of the key
*/
function CreateTreeItemKey(key, document, forceId) {
    var  item  = document.createElement('treeitem');

    var row = document.createElement('treerow');

    var  child1 = document.createElement('treecell');
    child1.setAttribute('label', key.keyName);
    row.appendChild(child1);

    var  child2 = document.createElement('treecell');
    child2.setAttribute('label', key.keyId);
    row.appendChild(child2);

    var  child3 = document.createElement('treecell');
    child3.setAttribute('label', key.keyDate);
    row.appendChild(child3);

    var  child4 = document.createElement('treecell');
    child4.setAttribute('label', key.keyExpi);
    row.appendChild(child4);

    var id = key.keyId;

    if (forceId != undefined)
        id = forceId;

    row.setAttribute('gpg-id', id);

    item.appendChild(row);



    return item;


}

function getKeyServer() {

    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	                           getService(Components.interfaces.nsIPrefService);

		prefs = prefs.getBranch("extensions.firegpg.");
		try {
			keyserver = prefs.getCharPref("keyserver");
		} catch (e) {
			keyserver = "";
		}

        if (keyserver == "") {
            keyserver = "subkeys.pgp.net";
            prefs.setCharPref("keyserver", "subkeys.pgp.net");
            }

        return keyserver;


}

function showSearchBox(autoSearch) {


    window.openDialog("chrome://firegpg/content/searchkey.xul", "searchBox", "chrome,centerscreen").focus();

}
// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
