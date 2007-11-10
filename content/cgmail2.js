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
function cGmailNeedAction(e) { // TODO ?!
	if (e.target.id == "sndcrypt")	{
		alert('Tu veut me faire du mal hein ? Méchant !');
	}
}
*/

const GMAIL_MAIN_DOC_URL = "http://mail.google.com/mail/?ui=2&view=bsp&ver=ymdfwq781tpu";

var cGmail2 = {

    doc: Array(),

    current: 0,

    //Check the document for messages
    checkDoc: function(id) {

        var i18n = document.getElementById("firegpg-strings");

        var doc = cGmail2.doc[id];

        if (doc != undefined && doc.location != undefined && doc.location.href == GMAIL_MAIN_DOC_URL)
        {

            //test for messages
            var listeTest = doc.getElementsByClassName('ArwC7c');

            for (var i = 0; i < listeTest.length; i++) {

                if (listeTest[i].hasAttribute("gpg") == false) {

                    listeTest[i].setAttribute("gpg","ok");

                    var boutonboxs = listeTest[i].parentNode.getElementsByTagName("table");

                    boutonbox = "";

                    //On cherche la boite avec les boutons
                    for (var j = 0; j < boutonboxs.length; j++) {
                        if (boutonboxs[j].getAttribute("class") == "EWdQcf") {
                            boutonbox = boutonboxs[j].firstChild.firstChild;
                            break;
                        }
                    }

                    if (boutonbox == "")
                    {
                        break;
                    }

                    var contenuMail = this.getMailContent(listeTest[i],doc);

                    var td = doc.createElement("td");


                    var resultTest = GPG.baseVerify(contenuMail);

                    // For I18N
                    var i18n = document.getElementById("firegpg-strings");

                    if (resultTest == "noGpg") {
                        if (cGmail2.nonosign != true)
                        {
                            td.setAttribute("style","color: orange;");
                            td.innerHTML = i18n.getString("GMailNoS");
                        }
                    }
                    else if (resultTest == "erreur") {
                        td.setAttribute("style","color: red;");
                        td.innerHTML = i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";
                    }
                    else {
                        infos = resultTest.split(" ");
                        var infos2 = "";
                        for (var ii = 1; ii < infos.length; ++ii)
                        {  infos2 = infos2 + infos[ii] + " ";}

                        td.setAttribute("style","color: green;");
                        td.innerHTML = i18n.getString("GMailSOK") + " " + infos2; //"La première signature de ce mail est de testtest (testtest)
                    }
//qZkfSe
                    td.innerHTML = '<div class="X5Xvu" idlink=""><span class="" style="' + td.getAttribute("style") + '">' + td.innerHTML + '</span></div>';

                    /*td.setAttribute("style","color: orange;");
                    td.innerHTML = i18n.getString("GMailD"); //"Ce mail à été décrypté";*/

                    boutonbox.insertBefore(td,boutonbox.childNodes[boutonbox.childNodes.length - 1]);

                }
            }

            setTimeout("cGmail2.checkDoc("+id+")", 5000);


        }
    },

    //Retrun the content of a mail, need the div object with the mail
	getMailContent: function(i,doc) {
		var contenuMail = i;
		var range = doc.createRange();
		range.selectNode(contenuMail);
		var documentFragment = range.cloneContents();
		var s = new XMLSerializer();
		var d = documentFragment;
		var str = s.serializeToString(d);
		contenuMail = Selection.wash(str);

		return contenuMail;

	},

    /*//On détruit tous les documents.
    listenerUnload: function () {



    },*/

    //Initialise le tout
    initSystem: function() {

		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                        getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");

		try {
			var usegmail = prefs.getBoolPref("gmail_enabled");
		}
		catch (e) {
			var usegmail = false;
		}

		if (usegmail == true) {
			document.getElementById("appcontent").addEventListener("DOMContentLoaded", cGmail2.pageLoaded, false);
			//window.addEventListener("unload", function() {cGmail2.listenerUnload()}, false);


			try {	var nonosign = prefs.getBoolPref("gmail_no_sign_off");	}
			catch (e) { var nonosign = false; }
			try {	var b_sign = prefs.getBoolPref("gmail_butons_sign");	}
			catch (e) { var b_sign = true; }
			try {	var b_sign_s = prefs.getBoolPref("gmail_butons_sign_send");	}
			catch (e) { var b_sign_s = true; }
			try {	var b_crypt = prefs.getBoolPref("gmail_butons_crypt");	}
			catch (e) { var b_crypt = true; }
			try {	var b_crypt_s = prefs.getBoolPref("gmail_butons_crypt_send");	}
			catch (e) { var b_crypt_s = true; }

			try {	var b_signcrypt = prefs.getBoolPref("gmail_butons_sign_crypt");	}
			catch (e) { var b_signcrypt = true; }
			try {	var b_signcrypt_s = prefs.getBoolPref("gmail_butons_sign_crypt_send");	}
			catch (e) { var b_signcrypt_s = true; }

			cGmail2.nonosign = nonosign;
			cGmail2.b_sign = b_sign;
			cGmail2.b_sign_s = b_sign_s;
			cGmail2.b_crypt = b_crypt;
			cGmail2.b_crypt_s = b_crypt_s;
			cGmail2.b_signcrypt = b_signcrypt;
			cGmail2.b_signcrypt_s = b_signcrypt_s;

            Array.prototype.inArray = function(val) {

            for(var a2 = 0; a2 < this.length; ++a2) {

                if(this[ a2] == val){

                return true;

                }

            }

            return false;

        };


		}
	},


    pageLoaded: function(aEvent) {

        var doc = aEvent.originalTarget;

        if (doc.location.href == GMAIL_MAIN_DOC_URL) {

            doc.getElementsByClassName = function(className) {

            var elts =  doc.getElementsByTagName('*');

            var classArray = new Array();

            for (var j = 0; j < elts.length; ++j) {

                if (elts[j].getAttribute('class') && elts[j].getAttribute('class').split(' ').inArray(className)) {

                        classArray.push(elts[j]);

                    }

                }

                return classArray;

            };

            cGmail2.current = cGmail2.current + 1;

            cGmail2.doc[cGmail2.current] = doc;

            setTimeout("cGmail2.checkDoc("+cGmail2.current+")", 5000);

        }

    }

};

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
