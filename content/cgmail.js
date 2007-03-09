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

const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

var cGmailListener = {
	/* TODO description ? */
	QueryInterface: function(aIID) {
		if(aIID.equals(Components.interfaces.nsIWebProgressListener) ||
		   aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
		   aIID.equals(Components.interfaces.nsISupports))
			return this;
		throw Components.results.NS_NOINTERFACE;
	},
	
	/* TODO description ? */
	onStateChange: function(aProgress, aRequest, aFlag, aStatus) {
		// If a document's loading is finished
		if(aFlag & STATE_STOP) { 
			// If it's the page with a GMail message
			if(aProgress.DOMWindow.document.getElementById('msg_0') != null) {
				cGmail.lastDomToverify = aProgress.DOMWindow;
				setTimeout("cGmail.onDelayLoad()", 1000);
			}
		}
		return 0;
	},

	// To be a good listener
	onLocationChange: function(aProgress, aRequest, aURI) { return 0; },
	onProgressChange: function() { return 0; },
	onStatusChange: function() { return 0; },
	onSecurityChange: function(){ return 0; },
	onLinkIconAvailable: function() { return 0; }
}

var cGmail = {
	/* TODO it's not too big ? Can we separe this function to some little simple functions ? */
	onDelayLoad: function() {
		for (var i = 0; i < this.LastNombreMail; i++) {
			if (this.lastDomToverify.document.getElementById('rc_' + i) != null) {
				// 13 Childs !!
				var replyBox = this.lastDomToverify.document.getElementById('rc_' + i).firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild;
				if (this.lastDomToverify.document.getElementById('rc_' + i).hasAttribute("gpg") == false) {
					var contenuMail = this.lastDomToverify.document.getElementById('mb_' + i);
					var range = this.lastDomToverify.document.createRange();
					range.selectNode(contenuMail);
					var documentFragment = range.cloneContents();
					var s = new XMLSerializer();
					var d = documentFragment;
					var str = s.serializeToString(d);
					
					contenuMail = Selection.wash(str);
					
					var td = this.lastDomToverify.document.createElement("td");
					
					td.setAttribute("class","");
					td.setAttribute("id","sm_verify");
					
					var resultTest = GPG.baseVerify(contenuMail);
					
					// For I18N
					var i18n = document.getElementById("firegpg-strings");
					
					if (resultTest == "noGpg") {
						td.setAttribute("style","color: orange;");
						td.innerHTML = i18n.getString("GMailNoS"); //"Aucun signature n'a été trouvé dans ce mail."; testtset@testtest.testtset";
					}
					else if (resultTest == "erreur") {
						td.setAttribute("style","color: red;");
						td.innerHTML = i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";
					}
					else {
						infos = resultTest.split(" ");
						td.setAttribute("style","color: green;");
						td.innerHTML = i18n.getString("GMailSOK") + " " + infos[1] + " " + infos[2] + " " +  infos[3]; //"La première signature de ce mail est de testtest (testtest)
					}
					
					/*td.setAttribute("style","color: orange;");
					td.innerHTML = i18n.getString("GMailD"); //"Ce mail à été décrypté";*/
					
					replyBox.appendChild(td);
					
					var firstPosition = contenuMail.indexOf("-----BEGIN PGP MESSAGE-----");
					var lastPosition = contenuMail.indexOf("-----END PGP MESSAGE-----");
					
					if (firstPosition != -1 && lastPosition != -1) {
						td = this.lastDomToverify.document.createElement("td");
						td.setAttribute("class","");
						td.setAttribute("id","sm_decrypt");
						td.innerHTML = i18n.getString("GMailD");
						replyBox.appendChild(td);
						var tmpListener = new Object;
						tmpListener = null;
						tmpListener = new cGmail.callBack("sm_decrypt",i)
						td.addEventListener('click',tmpListener,true);
					}
					
					this.lastDomToverify.document.getElementById('rc_' + i).setAttribute("gpg","ok");
				}
			}
			
			if (this.lastDomToverify.document.getElementById('nc_' + i) != null) {
				if (this.lastDomToverify.document.getElementById('nc_' + i).hasAttribute("gpg") == false) {
					var boutonBox = this.lastDomToverify.document.getElementById('nc_' + i).parentNode;
					this.addComposeBoutons(boutonBox,this.lastDomToverify.document,i);
					this.lastDomToverify.document.getElementById('nc_' + i).setAttribute("gpg","ok");
				}
			}
			
			if (this.lastDomToverify.document.getElementById('sb_' + i) != null) {
				if (this.lastDomToverify.document.getElementById('sb_' + i).hasAttribute("gpg") == false) {
					var boutonBox = this.lastDomToverify.document.getElementById('sb_' + i).firstChild.firstChild.firstChild.firstChild.firstChild;	
					this.addComposeBoutons(boutonBox,this.lastDomToverify.document,i);
					this.lastDomToverify.document.getElementById('sb_' + i).setAttribute("gpg","ok");
				}
			}
		}
	},

	simpleLoad: function(e) {
		var Ddocument = e.target.defaultView.wrappedJSObject.document;
		
		if(Ddocument.getElementById('msg_0') != null) {
			for (var i = 0; i < 200; i++) {
				if (Ddocument.getElementById('msg_' + i) == null) { 
					this.LastNombreMail = i + 2; //If the user send 1 or 2 mails
					break;
				}
			}
		}
		
		if(Ddocument.getElementById('sb_compose') != null) {
			var boutonBox = Ddocument.getElementById('sb_compose').firstChild;	
			this.addComposeBoutons(boutonBox,Ddocument,'compose');
		}
		
		if (Ddocument.getElementById('nc_compose') != null) {
			var boutonBox = Ddocument.getElementById('nc_compose').parentNode;	
			this.addComposeBoutons(boutonBox,Ddocument,'compose');
		}
	},

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
			document.getElementById("appcontent").addEventListener("DOMContentLoaded", cGmail.listenerLoad, false);
			window.addEventListener("unload", function() {cGmail.listenerUnload()}, false);
		}
	},
	
	addBouton: function(label,id,box,Ddocument,info1) {
		var bouton = new Object;
		bouton = null;
		bouton = Ddocument.createElement("button");
		
		bouton.setAttribute("type","button");
		//bouton.setAttribute("tabindex","8");
		bouton.setAttribute ("style","padding: 0pt 1em;");
		bouton.setAttribute("id",id);
		
		bouton.innerHTML = label;
		
		try {
			box.innerHTML = box.innerHTML + " &nbsp;";
			box.appendChild(bouton);
				
			var tmpListener = new Object;
			tmpListener = null;
			tmpListener = new cGmail.callBack(id,info1)
			box.addEventListener('click',tmpListener,true);

		} catch (e) {}
	},
	
	addComposeBoutons: function(box,Ddocument,info1) {
		// For i18N
		var i18n = document.getElementById("firegpg-strings");
		this.addBouton(i18n.getString("GMailS"),"sign",box,Ddocument,info1);
		this.addBouton(i18n.getString("GMailSS"),"sndsign",box,Ddocument,info1);
		this.addBouton(i18n.getString("GMailC"),"cypt",box,Ddocument,info1);
		this.addBouton(i18n.getString("GMailCS"),"sndcyrpt",box,Ddocument,info1);
	},
	
	listenerLoad: function(e) {
		var urlPage = e.target.defaultView.wrappedJSObject.location.host;
		
		if (urlPage.indexOf('mail.google.com') != -1) {
			cGmail.simpleLoad(e);
			gBrowser.addProgressListener(cGmailListener,
			         Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
		}
	},
	
	
	listenerUnload: function() {
		gBrowser.removeProgressListener(cGmailListener);
	},
	
	callBack: function(id,info1) {
		this._id = id; // Save infos
		this._info1 = info1;

		this.handleEvent = function(event) { // Function in the function for handle... events.
			var i18n = document.getElementById("firegpg-strings");
			
			if (event.target.id == "sm_decrypt") {
				var contenuMail = cGmail.lastDomToverify.document.getElementById('mb_' + info1);
				
				var range = cGmail.lastDomToverify.document.createRange();
				range.selectNode(contenuMail);
				var documentFragment = range.cloneContents();
				
				var s = new XMLSerializer();
				var d = documentFragment;
				var str = s.serializeToString(d);
				
				contenuMail = Selection.wash(str);
				
				var password = getPrivateKeyPassword();						
				var result = GPG.baseDecrypt(contenuMail,password);
				var crypttext = result.output;
				result = result.sdOut;
				
				// If the crypt failled
				if (result == "erreurPass") {
					alert(i18n.getString("decryptFailedPassword"));
					eraseSavedPassword();
				}
				else if (result == "erreur") {
					alert(i18n.getString("decryptFailed"));
				} 
				else 
					showText(crypttext);
			}
			else
			{ //ta pour des textbox
			

				var range = cGmail.lastDomToverify.document.getElementById('hc_' + info1).contentDocument.createRange();
				range.selectNode(cGmail.lastDomToverify.document.getElementById('hc_' + info1).contentDocument.firstChild);
				var documentFragment = range.cloneContents();
				
				var s = new XMLSerializer();
				var d = documentFragment;
				var str = s.serializeToString(d);
				
				contenuMail = Selection.wash(str);

				alert(contenuMail);
			}
		};
	}
};

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
