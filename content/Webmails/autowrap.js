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

//Manage autowarp on unsupported webmails

FireGPG.AutoWrap = {

    checkAndWrap: function(text) {

        try {

            var focused = document.commandDispatcher.focusedElement;

            if (!focused) {
                focused = getBrowser().contentWindow.getSelection().focusNode;

                if ((!focused || getBrowser().contentWindow.getSelection().toString() == "") && getBrowser().contentWindow.frames != null)
                    focused = this.getFrame(getBrowser().contentWindow.frames).focusNode;
            }

            if (!focused)
                return;

            var url = focused.ownerDocument.location.href;
            var title = focused.ownerDocument.title;
            var host = focused.ownerDocument.location.host;

            var webmailfound = false;

            /// ROUNDCUBE
            if (!webmailfound && url.indexOf("&_action=compose") != -1 && focused.getAttribute('id') == 'compose-body' && focused.getAttribute('name') == '_message') {
                webmailfound = true;
                webmailname = "Roundcube@" + host;
            }

            /// YAHOO
            if (!webmailfound && host.indexOf("mail.yahoo.com") != -1) {
                webmailfound = true;
                webmailname = "Yahoo";
            }

            /// ZIMBRA
            if (!webmailfound && title == "ZWC") {
                webmailfound = true;
                webmailname = "Zimbra@" + host;
            }

            /// SQUIRELMAIL
            if (!webmailfound && url.indexOf("compose.php") != -1 && focused.getAttribute('id') == 'body' && focused.getAttribute('name') == 'body' && title.indexOf('SquirrelMail') != -1) {
                webmailfound = true;
                webmailname = "SquirrelMail@" + host;
            }

            /// HORDE
            if (!webmailfound && url.indexOf("compose.php") != -1 && focused.getAttribute('class') == 'composebody' && focused.getAttribute('name') == 'message' && focused.getAttribute('id') == 'message' && focused.parentNode.getAttribute('id') == 'messageParent' ) {
                webmailfound = true;
                webmailname = "HordeImp@" + host;
            }

             if (!webmailfound && url.indexOf("compose.php") != -1 && focused.getAttribute('class') == 'fixed' && focused.getAttribute('name') == 'message' && focused.getAttribute('id') == 'message' && focused.parentNode.getAttribute('id') == 'messageParent' ) {
                webmailfound = true;
                webmailname = "HordeDimp@" + host;
            }


            if (!webmailfound)
                return text;
            else {

                if (this.shouldWeWrap(webmailname))
                    return this.wrap(text);
                else
                    return text;

            }
        } catch (e) { FireGPG.debug(e,'Error-AutoWrap / checkdoc'); return text; }
    },

    shouldWeWrap: function(webmail) {
        var actions = this.getActionList();

        if(actions[webmail] != undefined)
            return actions[webmail]  == "W";


        var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                        .getService(Components.interfaces.nsIPromptService);
        var check = {value: false};
        var result = prompts.confirmCheck(window, "FireGPG::AutoWrap", document.getElementById('firegpg-strings').getString('autowrap-question').replace(/%w/,webmail),
                                         document.getElementById('firegpg-strings').getString('do-not-ask-again'), check);

        if (check.value) {
            if (result)
                actions[webmail]  = "W";
            else
                actions[webmail]  = "I";

            this.setActionList(actions);

        }


        return result;

    },


    wrap: function(text) {

        if (!text)
            return text;

        return text.replace(/(.{1,70})(?:\s|$)/g,"$1\n");

    },

    /* find a select in a frame */
	getFrame: function(frames) {
		var i;
		var selObj = null;
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




    //Return the list of autoactions
    getActionList: function() {

        var array_return = new Array();

        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                       getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");
        var auths_chain  = ";,;";
        try {
            auths_chain = prefs.getCharPref("autowrap_actions");
        } catch (e) { auths_chain = ";,;";  }

        if (auths_chain == ";,;" || auths_chain == "" || auths_chain ==  null)
            return array_return;

        var reg=new RegExp(";", "g");

        splitage = auths_chain.split(reg);

        for (var i=0; i< splitage.length; i++) {

            domain_and_key = splitage[i];

            var reg2 = new RegExp(",", "g");

            domain_and_key = domain_and_key.split(reg2);

            if (domain_and_key[1] != undefined && domain_and_key[1] != "" && domain_and_key[1] != 0) {

                array_return[domain_and_key[1]] = domain_and_key[0];

            }
        }

        return array_return;

    },

    //Set a new list of autoactions
    setActionList: function(arrayy) {

        var final_data = ';';

        for (var key in arrayy) {

            final_data = final_data + arrayy[key] + ',' + key + ';';

        }

        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                       getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");

        prefs.setCharPref("autowrap_actions",final_data);


    },
}