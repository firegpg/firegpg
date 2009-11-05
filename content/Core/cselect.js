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
   Class: FireGPG.Selection
   Class to handle selection
*/
FireGPG.Selection = {
	/*
	Function: getFrame
	find a select in a frame

	Parameters:
		frames - The frame
	*/
	getFrame: function(frames) {
		var i;
		var selObj;
		var value = "";

		for(i = 0; i < frames.length; ++i) {
			try {
				var tmpVal = frames[i].getSelection().toString();

				if (tmpVal == "") { // != don't work...
				}
				else {
					value = tmpVal;
					selObj = frames[i].getSelection();
				}
			}
			catch (e) {}
		}

		if (value == "") {
			for(i = 0; i < frames.length; ++i) {
				try {
					var tmpSelselObj = this.getFrame(frames[i].frames);

					if (tmpSelselObj.toString() == "") {
					}
					else {
						selObj = tmpSelselObj;
					}
				}
				catch (e) {}
			}
		}

		return selObj;
	},

    /*
    Function: get
    Return current selection.
    */
	get: function() {
		var i;

		// Select a text from the actual document
		var selObj = getBrowser().contentWindow.getSelection();

		// value is returned
		var value = selObj.toString();

		// If no text is selected, we try to get it from frames
		if(value == "") {
			try {
				selObj = this.getFrame(getBrowser().contentWindow.frames);
				value = selObj.toString();
			}
			catch (e) {
			}
		}

		// If the text is not selected, we try to get it
		// from inputs and textareas
		if(value == "") {
			try {
				var focused = document.commandDispatcher.focusedElement;
				var value = focused.value;
				value = value.substring(focused.selectionStart,focused.selectionEnd);
			}
			catch (e) {
			}
		}
		// the text is selected !
		else {
			value = selObj.getRangeAt(0);
			var documentFragment = value.cloneContents();
			var s = new XMLSerializer();
			var d = documentFragment;
			var str = s.serializeToString(d);
			value = this.wash(str);
		}

		return value;
	},

	/*
    Function: wash
    Transform HTML to usable text to encrypt

    Parameters:
        text - The text to wash
    */
	wash: function(text) {
		//Si il semblerais que l'on soit dans un texte html, on va éliminer les \n qui n'on rien à faire la !
		if (text.indexOf("<br>") != -1 || text.indexOf("<BR>") != -1 || text.indexOf("<BR/>") != -1  || text.indexOf("<br/>") != -1  || text.indexOf("<BR />") != -1  || text.indexOf("<br />") != -1) {
			var reg=new RegExp("\n", "gi");
			text = text.replace(reg,"");
		}

		str = text;
		/*var reg=new RegExp("<br[^>]*>\n<br[^>]*>", "gi"); //Pour ne pas enlever un bouble <br>\n<br> logique (bug des boubles <br>)
		str = text.replace(reg,"\n\n");

		var reg=new RegExp("<br>\n<br>", "gi");
		str = str.replace(reg,"\n\n");

		var reg = new RegExp("<br[^>]*>\n", "gi"); // Pour pas faire des doubles retours (surviens sur certains sites)
		str = str.replace(reg,"\n");

		var reg=new RegExp("<br>\n", "gi");
		str = str.replace(reg,"\n");

		var reg=new RegExp("\n<br[^>]*>", "gi"); //Pour pas faire des doubles retours (surviens sur certains sites)
		str = str.replace(reg,"\n");

		var reg=new RegExp("\n<br>", "gi");
		str = str.replace(reg,"\n");*/

		//TODO-GMAIL-ATTACH
		var reg=new RegExp("<div class=\"ma\" style=\"border-top: 2px solid rgb*</table></div>", "gi"); //Spécialité gmail (ne devrait pas faire de confilts)
		str = str.replace(reg,"");

		var reg=new RegExp("<br[^>]*>", "gi");
		str = str.replace(reg,"\n");
		var reg=new RegExp("<br>", "gi");
		str = str.replace(reg,"\n");

		var reg=new RegExp("<script[^>]*>[^<]*</script[^>]*>", "gi"); //Élimination des scripts
		str = str.replace(reg,"\n");

		var reg=new RegExp("<script[^>]*>[^<]*</script>", "gi"); //Élimination des scripts
		str = str.replace(reg,"\n");

		var reg=new RegExp("<script>[^<]*</script>", "gi"); //Élimination des scripts
		str = str.replace(reg,"\n");

		var reg=new RegExp("<style[^>]*>[^<]*</style[^>]*>", "gi"); //Élimination des styles
		str = str.replace(reg,"\n");

		var reg=new RegExp("<style[^>]*>[^<]*</style>", "gi"); //Élimination des styles
		str = str.replace(reg,"\n");

		var reg=new RegExp("<style>[^<]*</style>", "gi"); //Élimination des styles
		str = str.replace(reg,"\n");

        reg=new RegExp("</div>", "gi"); // Force end of <div>s to a newline
        str = str.replace(reg, "\n");

		reg=new RegExp("<[^>]+>", "g"); // Élimination des balises HTML
		str = str.replace(reg, "");

		reg=new RegExp("&lt;", "g"); // Petites problèmes de < de temps en temps
		str = str.replace(reg, "<");

		reg=new RegExp("&gt;", "g"); // Petites problèmes de > de temps en temps
		str = str.replace(reg, ">");

		return str;
	},

    /*
    Function: isEditable
    Return true if the selection is editable.
    */
	isEditable: function() {
		// We try to get a text from a textaera or input :
		try {
			var focused = document.commandDispatcher.focusedElement;
			var value = focused.value;
			value = value.substring(focused.selectionStart,focused.selectionEnd);
		}
		catch (e) {
			// If we got an error, there are not
			// textaera or input focused
			return false;
		}

		// If text is empty, this is strange, so we consider that
		// there are not textaera or input focused
		if(value == "")
			return false;

		return true; //If it's ok !
	},

    /*
    Function: set
    Modify the selection, or show a dialog with the text if it's not possible.

    Parameters:
        text - The text to set.
        infoSignAndCrypt - _Optional_. Informations about a signature into a decrypted text.
    */
	set: function(text, infoSignAndCrypt) {
		/* if the option "always show in a new window" is checked */
		var key = "extensions.firegpg.result_always_in_new_window";
		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
							   getService(Components.interfaces.nsIPrefBranch);
		if(prefs.getPrefType(key) == prefs.PREF_BOOL) {
			if(prefs.getBoolPref(key)) {
				/* text the text */
				FireGPG.Misc.showText(text,undefined,undefined,undefined,infoSignAndCrypt);
				return;
			}
		}

		// We verify if selection is editable
		if(this.isEditable()) {
			// Get the focused element
			var focused = document.commandDispatcher.focusedElement;
			var value = focused.value;
			var startPos = focused.selectionStart;
			var endPos = focused.selectionEnd;
			var chaine = focused.value;

			// We create the new string and replace it into the focused element
			focused.value = chaine.substring(0, startPos) + text + chaine.substring(endPos, chaine.length);

			// We select the new text.
			focused.selectionStart = startPos;
			focused.selectionEnd = startPos + text.length ;

			//We need to alert the user if a valid sign was found !
			if (infoSignAndCrypt != undefined)
			{
				alert(document.getElementById("firegpg-strings").getString("validSignInCrypt") + " " + infoSignAndCrypt);
			}
		}
	}
}
