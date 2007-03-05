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

/* TODO we need add some comments to describe the code ! */

var firegpg = {
	onLoad: function() {
		// initialization code
		this.initialized = true;
		this.strings = document.getElementById("firegpg-strings");
		document.getElementById("contentAreaContextMenu").
		         addEventListener("popupshowing", 
		                          function(e) { firegpg.showContextMenu(e); }, 
		                          false);
	},

	showContextMenu: function(event) {
		// show or hide the menuitem based on what the context menu is on
		// see http://kb.mozillazine.org/Adding_items_to_menus
		document.getElementById("context-firegpg").hidden = gContextMenu.onImage;
	},

	onMenuItemCommand: function(e,action) {
		var promptService = Components.classes["@mozilla.org/embedcomp/prompt-service;1"].
		                               getService(Components.interfaces.nsIPromptService);

		if (action == "SIGN")
		   FireGPG_GPG.sign();

		if (action == "VERIF")
		   FireGPG_GPG.verify();

		if (action == "CRYPT")
		   FireGPG_GPG.crypt();

		if (action == "DCRYPT")
		   FireGPG_GPG.dcrypt();

		if (action == "OPTS")
			var win = window.open("chrome://firegpg/content/options.xul", 
                      "optionsFiregpg", "chrome,centerscreen"); 

		if (action == "ERASE")
		   eraseSavedPassword();

	},

	onToolbarButtonCommand: function(e) {
		// just reuse the function above.  you can change this, obviously!
		firegpg.onMenuItemCommand(e);
	}
};

window.addEventListener("load", function(e) { firegpg.onLoad(e); }, false);

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8
