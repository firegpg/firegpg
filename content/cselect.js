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

//Classe for selection
var firegpgSelect = {
	/* 
	 * Return actual selection.
	 */
	getSelection: function() {
		// Select text from Docuement
		var myBrowser = getBrowser();
		var selObj = myBrowser.contentWindow.getSelection();
		
		value = selObj.toString();
		
		// If not text is selected, we try to get text 
		// from inputs and textareas
		if (value == "") {
			try {
				var focused = document.commandDispatcher.focusedElement;
				var value = focused.value;
				value = value.substring(focused.selectionStart,focused.selectionEnd);
			}
			catch (e) {
			}
		}
		else
		{
			value = selObj.getRangeAt(0); 
			documentFragment = value.cloneContents();
     		var s = new XMLSerializer();
			var d = documentFragment;
			var str = s.serializeToString(d);
			
			var reg=new RegExp("<br />", "gi");
			str = str.replace(reg,"\n");
			 reg=new RegExp("<br/>", "gi");
			str = str.replace(reg,"\n");
			var reg=new RegExp("<br>", "gi");
			str = str.replace(reg,"\n");
			reg=new RegExp("<[^>]+>", "g");
			str = str.replace(reg, "");

			value = str;
		}

		
		return value;
	},
	
	/* 
	 * Return true if selection can be edit
	 */
	isSelectionEdit: function() {
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
		
		// If texte is empty, this is strange, so we consider that 
		// there are not textaera or input focused
		if (value == "") 
			return false;
		
		return true; //If it's ok !
	},

	/*
	 * Edit selection
	 */
	setSelection: function(texte) {
		// We verify that the selection can be edited 
		if (this.isSelectionEdit()) {
			// Get the focused element
			var focused = document.commandDispatcher.focusedElement;
			var value = focused.value;
			var startPos = focused.selectionStart;
	        var endPos = focused.selectionEnd;
	        var chaine = focused.value;
			
			// We create the new string and replace it into focused element
	        focused.value = chaine.substring(0, startPos) + texte + chaine.substring(endPos, chaine.length);
			
			// We select the new text.
	        focused.selectionStart = startPos;
	        focused.selectionEnd = startPos + texte.length ;
		}
	}
}

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
