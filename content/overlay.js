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
   Constants: Actions.

   ACTION_SIGN - Sign the current selected data
   ACTION_VERIF - Verifiy signs of the current selected data
   ACTION_CRYPT - Encrypt the current selected data
   ACTION_CRYPTSIGN -  Encrypt and sign the current selected data
   ACTION_DECRYPT - Decrypt the current selected data
   ACTION_IMPORT - Import the current selected data
   ACTION_EXPORT - Show the dialog to export a key
   ACTION_EDITEUR - Show the editor windows
   ACTION_MANAGER - Show the key manager windows
   ACTION_OPTS - Show the options windows
   ACTION_ERASE - Erase the current saved password.
*/

const ACTION_SIGN = 'SIGN';
const ACTION_PSIGN = 'PLAINSIGN';
const ACTION_VERIF = 'VERIF';
const ACTION_CRYPT = 'CRYPT';
const ACTION_SYMCRYPT = 'SYMCRYPT';
const ACTION_CRYPTSIGN = 'CRYPTSIGN';
const ACTION_DECRYPT = 'DECRYPT';
const ACTION_IMPORT = 'IMPORT';
const ACTION_EXPORT = 'EXPORT';
const ACTION_EDITEUR = 'EDITEUR';
const ACTION_MANAGER = 'MANAGER';
const ACTION_OPTS = 'OPTS';
const ACTION_ERASE = 'ERASE';

 /*
  * Class: firegpg
  * This is the class to comunicate with the menus added in firefox. She watch the loading of new windows too.
  */
var firegpg = {

    /*
    Function: onLoad
    This function is called when a new Firefox's windows is created. She init another listers, and the translator system.
    */
    onLoad: function() {

		cGmail.initSystem();
        cGmail2.initSystem();
        Keyring.initSystem();
		//APIListener.init();

		// initialization code
		this.initialized = true;
		this.strings = document.getElementById("firegpg-strings");
	},

    /*
    Function: onMenuItemCommand
    This function is called when a menu item is selected. It's call <onDelayMenuAction> 100 milliseconds laters (we have to wait dues to a bug).
    */
	onMenuItemCommand: function(e,action) {
		setTimeout("firegpg.onDelayMenuAction('"+action+"')", 100);
	},

    /*
    Function: onDelayMenuAction
    This function is called to exectue an action. It's forward the the call to the correct function in <GPG> class, or load the right dialog.

    Parameters:
        action - The action to exectute. See <Actions>.

    */
	onDelayMenuAction: function(action) {
		if (action == ACTION_SIGN)
			FireGPG.sign();
        else if (action == ACTION_PSIGN)
			FireGPG.sign(undefined,undefined,undefined,undefined,true);
		else if(action == ACTION_VERIF)
			FireGPG.verify();
		else if(action == ACTION_CRYPT)
			FireGPG.crypt();
        else if(action == ACTION_SYMCRYPT)
			FireGPG.crypt(undefined,undefined,undefined,undefined,undefined,undefined,true);
		else if(action == ACTION_CRYPTSIGN)
			FireGPG.cryptAndSign();
		else if(action == ACTION_DECRYPT)
			FireGPG.decrypt();
		else if(action == ACTION_IMPORT)
			FireGPG.kimport();
		else if(action == ACTION_EXPORT)
			FireGPG.kexport();
		else if(action == ACTION_EDITEUR)
			showEditor('');
		else if(action == ACTION_MANAGER)
			window.openDialog("chrome://firegpg/content/keymanager.xul", "keyManager", "chrome, centerscreen, toolbar").focus();
		else if(action == ACTION_OPTS)
			window.openDialog("chrome://firegpg/content/options.xul", "optionsFiregpg", "chrome, centerscreen, toolbar").focus();
		else if (action == ACTION_ERASE)
			eraseSavedPassword();
	},

    /*
    Function: onToolbarButtonCommand
    This function is called when the user click on a bouton of the toolbar. Action is just forwared to <onMenuItemCommand>.
    */
	onToolbarButtonCommand: function(e) {
		// just reuse the function above.  you can change this, obviously!
		firegpg.onMenuItemCommand(e);
	}
};

window.addEventListener("load", function(e) { firegpg.onLoad(e); }, false);
// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8
