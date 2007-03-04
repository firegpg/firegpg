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

const NS_LOCALEFILE_CONTRACTID = "@mozilla.org/file/local;1";
const NS_DIRECTORYSERVICE_CONTRACTID = "@mozilla.org/file/directory_service;1";

const TMP_DIRECTORY = "TmpD";
const TMP_FILES = "fgpg_tmpFile";

var savedPassword = "testtest"; /* password */
var selfKey = "B6B2F3E3";       /* the default private key ID */

function FireGPG_GetPassword()
{
	// TODO
	return savedPassword;
}

function FireGPG_GetSelfKey()
{
	// TODO
	return selfKey;
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
function getTmpFile() {
	var fileobj = getTmpDir();
	fileobj.append(TMP_FILES);
	fileobj.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0600 /* TODO use const in permission ? */);
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
		/* TODO try is useful ? */
	}
}

