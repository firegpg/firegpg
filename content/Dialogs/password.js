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
    Function: onLoad

    This function is called when the password.xul form is show.
    It's init the differents objets (like the translated strings).

    Parameters:
        win - The form herself.
        window.arguments[0].password -  The password to pre-set.
        window.arguments[0].save_password -  The default value of the savepassword checkbox.
        window.arguments[0].question -  The text to show for the prompt.
        window.arguments[0].domain - _Optional_. Say the password is asked form this page and disable the savepassword checkbox.
*/
function onLoad(win)
{
	if(window.arguments == undefined)
		return;

	document.getElementById('password-textbox').value = window.arguments[0].password;
	document.getElementById('save-password-checkbox').checked = window.arguments[0].save_password;
	document.getElementById('description').value = window.arguments[0].question;

    if (window.arguments[0].domain == undefined)
        window.arguments[0].domain = false;

    if (window.arguments[0].domain != false)
    {
        document.getElementById('save-password-checkbox').disabled = true;
        document.getElementById('save-password-checkbox').label = 'FireGPG\'s api called form ' + window.arguments[0].domain;
    }

    if (window.arguments[0].nosavecheckbox != false) {
        document.getElementById('save-password-checkbox').style.display = 'none';
    }
}

/*
    Function: onAccept

    This function is called when the _Ok_ button is pressed.
    It's prepare the differents data to return them.
*/
function onAccept()
{
	if(window.arguments == undefined)
		return true;

	/* the password */
	var password = document.getElementById('password-textbox').value;
	window.arguments[0].password = password;

	window.arguments[0].result = true;
	window.arguments[0].save_password = document.getElementById('save-password-checkbox').checked ? true : false;

	return true;
}
