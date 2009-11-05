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

if (typeof(FireGPG)=='undefined') { FireGPG = {}; }
if (typeof(FireGPG.Const)=='undefined') { FireGPG.Const = {}; }


FireGPG.Const.OverlayActions = {
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
  * Class: FireGPG.Core.Overlay
  * This is the class to comunicate with the menus added in firefox. She watch the loading of new windows too.
  */
FireGPG.Overlay = {

    /*
    Function: onLoad
    This function is called when a new Firefox's windows is created. She init another listers, and the translator system.
    */
    onLoad: function() {

        FireGPG.cGmail.initSystem();
        FireGPG.cGmail2.initSystem();
        FireGPG.Inline.initSystem();
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
		setTimeout("FireGPG.Overlay.onDelayMenuAction('"+action+"')", 100);
	},

    /*
    Function: onDelayMenuAction
    This function is called to exectue an action. It's forward the the call to the correct function in <GPG> class, or load the right dialog.

    Parameters:
        action - The action to exectute. See <Actions>.

    */
	onDelayMenuAction: function(action) {


   		if (action == FireGPG.Const.OverlayActions.SIGN)
			FireGPG.Core.sign();
        else if (action == FireGPG.Const.OverlayActions.PSIGN)
			FireGPG.Core.sign(undefined,undefined,undefined,undefined,true);
        else if (action == FireGPG.Const.OverlayActions.WSIGN)
			FireGPG.Core.sign(undefined,undefined,undefined,undefined,undefined,undefined,true);
		else if(action == FireGPG.Const.OverlayActions.VERIF)
			FireGPG.Core.verify();
		else if(action == FireGPG.Const.OverlayActions.CRYPT)
			FireGPG.Core.crypt();
        else if(action == FireGPG.Const.OverlayActions.SYMCRYPT)
			FireGPG.Core.crypt(undefined,undefined,undefined,undefined,undefined,undefined,true);
		else if(action == FireGPG.Const.OverlayActions.CRYPTSIGN)
			FireGPG.Core.cryptAndSign();
		else if(action == FireGPG.Const.OverlayActions.DECRYPT)
			FireGPG.Core.decrypt();
		else if(action == FireGPG.Const.OverlayActions.IMPORT)
			FireGPG.Core.kimport();
		else if(action == FireGPG.Const.OverlayActions.EXPORT)
			FireGPG.Core.kexport();
		else if(action == FireGPG.Const.OverlayActions.EDITEUR)
			FireGPG.Misc.showEditor('');
		else if(action == FireGPG.Const.OverlayActions.MANAGER)
			window.openDialog("chrome://firegpg/content/Dialogs/Keymanager/keymanager.xul", "keyManager", "chrome, centerscreen, toolbar").focus();
		else if(action == FireGPG.Const.OverlayActions.OPTS)
			window.openDialog("chrome://firegpg/content/Dialogs/options.xul", "optionsFiregpg", "chrome, centerscreen, toolbar").focus();
		else if (action == FireGPG.Const.OverlayActions.ERASE)
			FireGPG.Misc.eraseSavedPassword();
        else if(action == FireGPG.Const.OverlayActions.UPDATE)
			FireGPG.Misc.showUpdateDialog();
        else if(action == FireGPG.Const.OverlayActions.FSIGN)
			FireGPG.Core.sign(false, '', undefined, undefined, undefined, undefined, undefined, true);
        else if(action == FireGPG.Const.OverlayActions.FVERIF)
			FireGPG.Core.verify(false, '', undefined, undefined, true);
        else if(action == FireGPG.Const.OverlayActions.FCRYPT)
			FireGPG.Core.crypt(false,'',undefined,undefined,undefined,undefined,undefined,undefined,true);
        else if(action == FireGPG.Const.OverlayActions.FDECRYPT)
			FireGPG.Core.decrypt(false,'', undefined,undefined,true);
        else if(action == FireGPG.Const.OverlayActions.FHASHES)
			window.openDialog("chrome://firegpg/content/Dialogs/hash.xul", "hashFireGPG", "chrome, centerscreen, toolbar").focus();
        else if(action == FireGPG.Const.OverlayActions.FSYMCRYPT)
			FireGPG.Core.crypt(false,'',undefined,undefined,undefined,undefined,true,undefined,true);
        else if(action == FireGPG.Const.OverlayActions.FCRYPTSIGN)
			FireGPG.Core.cryptAndSign(false, '', undefined, undefined, undefined, undefined, undefined, undefined, undefined, true);
        else if(action == FireGPG.Const.OverlayActions.SWITCHINLINESITEON) {

            FireGPG.Inline.siteOn(content.document.location);

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

        } else if(action == FireGPG.Const.OverlayActions.SWITCHINLINESITEOFF) {

            FireGPG.Inline.siteOff(content.document.location);

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

        } else if(action == FireGPG.Const.OverlayActions.SWITCHINLINEPAGEON) {
            FireGPG.Inline.pageOn(content.document.location);
            content.document.location.reload();
        } else if(action == FireGPG.Const.OverlayActions.SWITCHINLINEPAGEOFF) {
            FireGPG.Inline.pageOff(content.document.location);
            content.document.location.reload();
        } else if (action == FireGPG.Const.OverlayActions.CHECKAGAIN) {
            FireGPG.Inline.HandlePage(content.document);
        }


	},

    /*
    Function: onToolbarButtonCommand
    This function is called when the user click on a bouton of the toolbar. Action is just forwared to <onMenuItemCommand>.
    */
	onToolbarButtonCommand: function(e) {
		// just reuse the function above.  you can change this, obviously!
		FireGPG.Core.Overlay.onMenuItemCommand(e);
	},

	/*
	Function: updatePopUp
	Update labels of inline popup
	*/
    updatePopUp: function() {

        var i18n = document.getElementById("firegpg-strings");

        if (FireGPG.Inline.activate) {

            if (FireGPG.Inline.canIBeExecutedHere(content.document.location))
                document.getElementById('firegpg-status-of-inline').label = i18n.getString('inline-is-on-general');
            else
                document.getElementById('firegpg-status-of-inline').label = i18n.getString('inline-is-off-specific');


        } else {

            if (FireGPG.Inline.canIBeExecutedHere(content.document.location))
                document.getElementById('firegpg-status-of-inline').label = i18n.getString('inline-is-off-general');
            else
                document.getElementById('firegpg-status-of-inline').label = i18n.getString('inline-is-on-specific');
        }

        if (FireGPG.Inline.canIBeExecutedHere(content.document.location)) {
            document.getElementById('firegpg-inline-temp-switcher').label = i18n.getString('inline-tmp-desactivate-for-this-page');
            document.getElementById('firegpg-inline-temp-switcher').tag = FireGPG.Const.OverlayActions.SWITCHINLINEPAGEOFF;
        } else {
            document.getElementById('firegpg-inline-temp-switcher').label = i18n.getString('inline-tmp-activate-for-this-page');
            document.getElementById('firegpg-inline-temp-switcher').tag = FireGPG.Const.OverlayActions.SWITCHINLINEPAGEON;
        }

        var site = FireGPG.Inline.siteStatus(content.document.location);

        if (site == 'ON')
            site = true;
        else if (site == 'OFF')
            site = false;
        else
            site = FireGPG.Inline.activate;

        if (site) {
            document.getElementById('firegpg-inline-switcher').label = i18n.getString('inline-desactivate-for-this-site');
            document.getElementById('firegpg-inline-switcher').tag = FireGPG.Const.OverlayActions.SWITCHINLINESITEOFF;
        } else {
            document.getElementById('firegpg-inline-switcher').label = i18n.getString('inline-activate-for-this-site');
            document.getElementById('firegpg-inline-switcher').tag = FireGPG.Const.OverlayActions.SWITCHINLINESITEON;
        }

    }
};

window.addEventListener("load", function(e) { FireGPG.Overlay.onLoad(e); }, false);

//setTimeout("b = ''; for (a in FireGPG) { b += a + \"\\n\" } alert(b);", 4000);
