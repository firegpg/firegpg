/*

***** BEGIN LICENSE BLOCK *****

Version: MPL 1.1/GPL 2.0/LGPL 2.1

The contents of this source code are subject to the Mozilla Public License
Version 1.1 (the "License"); you may not use this source code except in
compliance with the License. You may obtain a copy of the License at
http://www.mozilla.org/MPL/

Software distributed under the License is distributed on an "AS IS" basis,
WITHOUT WARRANTY OF ANY KIND, either express or implied. See the License
for the specific language governing rights and limitations under the
License.

The Original Code is the FireGPG extension.

The Initial Developer of the Original Code is Maximilien Cuony.

Portions created by the Initial Developer are Copyright (C) 2007
the Initial Developer. All Rights Reserved.

Contributor(s):

Alternatively, the contents of this source code may be used under the terms of
either the GNU General Public License Version 2 or later (the "GPL"), or
the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
in which case the provisions of the GPL or the LGPL are applicable instead
of those above. If you wish to allow use of your version of this source code
only under the terms of either the GPL or the LGPL, and not to allow others to
use your version of this source code under the terms of the MPL, indicate your
decision by deleting the provisions above and replace them with the notice
and other provisions required by the GPL or the LGPL. If you do not delete
the provisions above, a recipient may use your version of this source code
under the terms of any one of the MPL, the GPL or the LGPL.

***** END LICENSE BLOCK *****

*/

/*
   Constants: Actions.

   ACTION_SIGN - Sign the current selected data
   ACTION_PSIGN - Plain sign the current selected data
   ACTION_WSIGN - Sign the wrapped current selected data
   ACTION_VERIF - Verifiy signs of the current selected data
   ACTION_CRYPT - Encrypt the current selected data
   ACTION_SYMCRYPT - Encrypt the current selected data with symetric algo
   ACTION_CRYPTSIGN -  Encrypt and sign the current selected data
   ACTION_DECRYPT - Decrypt the current selected data
   ACTION_IMPORT - Import the current selected data
   ACTION_EXPORT - Show the dialog to export a key
   ACTION_EDITEUR - Show the editor windows
   ACTION_MANAGER - Show the key manager windows
   ACTION_OPTS - Show the options windows
   ACTION_ERASE - Erase the current saved password
   ACTION_FSIGN = Sign a file
   ACTION_FVERIF = Verify sign of a file
   ACTION_FCRYPT = Encrypt a file
   ACTION_FDECRYPT = Decrypt a file
   ACTION_FSYMCRYPT - Encrypt with symetric algo a file
   ACTION_FCRYPTSIGN - Crypt and sign a file
   ACTION_FHASHES - Show the hash'windows
   ACTION_SWITCHINLINESITEON - Turn on inline system for the current site
   ACTION_SWITCHINLINESITEOFF - Turn off inline system for the current site
   ACTION_SWITCHINLINEPAGEON - Turn pn inline system for the current page
   ACTION_SWITCHINLINEPAGEOFF - Turn off inline system for the current page
*/

const FireGPGOverlayActions = {
    SIGN: 'SIGN',
    PSIGN: 'PLAINSIGN',
    WSIGN: 'WRAPSIGN',
    VERIF: 'VERIF',
    CRYPT: 'CRYPT',
    SYMCRYPT: 'SYMCRYPT',
    CRYPTSIGN: 'CRYPTSIGN',
    DECRYPT: 'DECRYPT',
    IMPORT: 'IMPORT',
    EXPORT: 'EXPORT',
    EDITEUR: 'EDITEUR',
    MANAGER: 'MANAGER',
    OPTS: 'OPTS',
    ERASE: 'ERASE',
    UPDATE: 'UPDATE',
    FSIGN: 'FSIGN',
    FVERIF: 'FVERIF',
    FCRYPT: 'FCRYPT',
    FDECRYPT: 'FDECRYPT',
    FSYMCRYPT: 'FSYMCRYPT',
    FCRYPTSIGN: 'FCRYPTSIGN',
    FHASHES: 'FHASHES',
    SWITCHINLINESITEON: 'SWITCHINLINESITEON',
    SWITCHINLINESITEOFF: 'SWITCHINLINESITEOFF',
    SWITCHINLINEPAGEON: 'SWITCHINLINEPAGEON',
    SWITCHINLINEPAGEOFF: 'SWITCHINLINEPAGEOFF',
    CHECKAGAIN: 'CHECKAGAIN'
}



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

        FireGPG_cGmail.initSystem();
        FireGPG_cGmail2.initSystem();
        FireGPGInline.initSystem();
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


   		if (action == FireGPGOverlayActions.SIGN)
			FireGPG.sign();
        else if (action == FireGPGOverlayActions.PSIGN)
			FireGPG.sign(undefined,undefined,undefined,undefined,true);
        else if (action == FireGPGOverlayActions.WSIGN)
			FireGPG.sign(undefined,undefined,undefined,undefined,undefined,undefined,true);
		else if(action == FireGPGOverlayActions.VERIF)
			FireGPG.verify();
		else if(action == FireGPGOverlayActions.CRYPT)
			FireGPG.crypt();
        else if(action == FireGPGOverlayActions.SYMCRYPT)
			FireGPG.crypt(undefined,undefined,undefined,undefined,undefined,undefined,true);
		else if(action == FireGPGOverlayActions.CRYPTSIGN)
			FireGPG.cryptAndSign();
		else if(action == FireGPGOverlayActions.DECRYPT)
			FireGPG.decrypt();
		else if(action == FireGPGOverlayActions.IMPORT)
			FireGPG.kimport();
		else if(action == FireGPGOverlayActions.EXPORT)
			FireGPG.kexport();
		else if(action == FireGPGOverlayActions.EDITEUR)
			FireGPGMisc.showEditor('');
		else if(action == FireGPGOverlayActions.MANAGER)
			window.openDialog("chrome://firegpg/content/Dialogs/Keymanager/keymanager.xul", "keyManager", "chrome, centerscreen, toolbar").focus();
		else if(action == FireGPGOverlayActions.OPTS)
			window.openDialog("chrome://firegpg/content/Dialogs/options.xul", "optionsFiregpg", "chrome, centerscreen, toolbar").focus();
		else if (action == FireGPGOverlayActions.ERASE)
			FireGPGMisc.eraseSavedPassword();
        else if(action == FireGPGOverlayActions.UPDATE)
			FireGPGMisc.showUpdateDialog();
        else if(action == FireGPGOverlayActions.FSIGN)
			FireGPG.sign(false, '', undefined, undefined, undefined, undefined, undefined, true);
        else if(action == FireGPGOverlayActions.FVERIF)
			FireGPG.verify(false, '', undefined, undefined, true);
        else if(action == FireGPGOverlayActions.FCRYPT)
			FireGPG.crypt(false,'',undefined,undefined,undefined,undefined,undefined,undefined,true);
        else if(action == FireGPGOverlayActions.FDECRYPT)
			FireGPG.decrypt(false,'', undefined,undefined,true);
        else if(action == FireGPGOverlayActions.FHASHES)
			window.openDialog("chrome://firegpg/content/Dialogs/hash.xul", "hashFireGPG", "chrome, centerscreen, toolbar").focus();
        else if(action == FireGPGOverlayActions.FSYMCRYPT)
			FireGPG.crypt(false,'',undefined,undefined,undefined,undefined,true,undefined,true);
        else if(action == FireGPGOverlayActions.FCRYPTSIGN)
			FireGPG.cryptAndSign(false, '', undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
        else if(action == FireGPGOverlayActions.SWITCHINLINESITEON) {

            FireGPGInline.siteOn(content.document.location);

            var num = gBrowser.browsers.length;
            for (var i = 0; i < num; i++) {
              var b = gBrowser.getBrowserAtIndex(i);
              try {

                if (b.contentDocument.location.host == content.document.location.host)
                    b.contentDocument.location.reload();
              } catch(e) {
                Components.utils.reportError(e);
              }
            }

        } else if(action == FireGPGOverlayActions.SWITCHINLINESITEOFF) {

            FireGPGInline.siteOff(content.document.location);

            var num = gBrowser.browsers.length;
            for (var i = 0; i < num; i++) {
              var b = gBrowser.getBrowserAtIndex(i);
              try {
                if (b.contentDocument.location.host == content.document.location.host)
                    b.contentDocument.location.reload();
                } catch(e) {
                Components.utils.reportError(e);
              }
            }

        } else if(action == FireGPGOverlayActions.SWITCHINLINEPAGEON) {
            FireGPGInline.pageOn(content.document.location);
            content.document.location.reload();
        } else if(action == FireGPGOverlayActions.SWITCHINLINEPAGEOFF) {
            FireGPGInline.pageOff(content.document.location);
            content.document.location.reload();
        } else if (action == FireGPGOverlayActions.CHECKAGAIN) {
            FireGPGInline.HandlePage(content.document);
        }


	},

    /*
    Function: onToolbarButtonCommand
    This function is called when the user click on a bouton of the toolbar. Action is just forwared to <onMenuItemCommand>.
    */
	onToolbarButtonCommand: function(e) {
		// just reuse the function above.  you can change this, obviously!
		firegpg.onMenuItemCommand(e);
	},

	/*
	Function: updatePopUp
	Update labels of inline popup
	*/
    updatePopUp: function() {

        var i18n = document.getElementById("firegpg-strings");

        if (FireGPGInline.activate) {

            if (FireGPGInline.canIBeExecutedHere(content.document.location))
                document.getElementById('firegpg-status-of-inline').label = i18n.getString('inline-is-on-general');
            else
                document.getElementById('firegpg-status-of-inline').label = i18n.getString('inline-is-off-specific');


        } else {

            if (FireGPGInline.canIBeExecutedHere(content.document.location))
                document.getElementById('firegpg-status-of-inline').label = i18n.getString('inline-is-off-general');
            else
                document.getElementById('firegpg-status-of-inline').label = i18n.getString('inline-is-on-specific');
        }

        if (FireGPGInline.canIBeExecutedHere(content.document.location)) {
            document.getElementById('firegpg-inline-temp-switcher').label = i18n.getString('inline-tmp-desactivate-for-this-page');
            document.getElementById('firegpg-inline-temp-switcher').tag = FireGPGOverlayActions.SWITCHINLINEPAGEOFF;
        } else {
            document.getElementById('firegpg-inline-temp-switcher').label = i18n.getString('inline-tmp-activate-for-this-page');
            document.getElementById('firegpg-inline-temp-switcher').tag = FireGPGOverlayActions.SWITCHINLINEPAGEON;
        }

        var site = FireGPGInline.siteStatus(content.document.location);

        if (site == 'ON')
            site = true;
        else if (site == 'OFF')
            site = false;
        else
            site = FireGPGInline.activate;

        if (site) {
            document.getElementById('firegpg-inline-switcher').label = i18n.getString('inline-desactivate-for-this-site');
            document.getElementById('firegpg-inline-switcher').tag = FireGPGOverlayActions.SWITCHINLINESITEOFF;
        } else {
            document.getElementById('firegpg-inline-switcher').label = i18n.getString('inline-activate-for-this-site');
            document.getElementById('firegpg-inline-switcher').tag = FireGPGOverlayActions.SWITCHINLINESITEON;
        }

    }
};

window.addEventListener("load", function(e) { firegpg.onLoad(e); }, false);
