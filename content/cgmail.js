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

/* Constant: STATE_START
 State 'start' for ProgressListener */
const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
/* Constant: STATE_STOP
  State 'stop' for ProgressListener */
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

/*
   Class: cGmailListener
   This class implement a listener, to intercept page loaded.
*/
var cGmailListener = {
	/*
        Function: QueryInterface
        This function return the Interface of the listen. Here to be a good listener.

        Parameters:
            aIID - ?
    */
	QueryInterface: function(aIID) {
		if(aIID.equals(Components.interfaces.nsIWebProgressListener) ||
		   aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
		   aIID.equals(Components.interfaces.nsISupports))
			return this;
		throw Components.results.NS_NOINTERFACE;
	},

	/*
        Function: onStateChange
        This function is called when the state of a page change (loaded, ..)

        Parameters:
            aProgress - An object with the progression ?
            aRequest - An object with the request
            aFlag - Flags about the request.
            aStatus - The status of the request.
    */
    onStateChange: function(aProgress, aRequest, aFlag, aStatus) {
		// If a document's loading is finished
		if(aFlag & STATE_STOP) {

			//If we need ton find the IK information
			if (cGmail.ik == null)
			{

				if (aRequest.name.indexOf("?ik=") != -1 || aRequest.name.indexOf("&ik=") != -1)
				{

					var reg= new RegExp("ik\\=[a-zA-Z0-9]+");
					cGmail.ik = aRequest.name.match(reg);

					if (cGmail.ik != null && cGmail.ik != "")
					{
						cGmail.ik = cGmail.ik.toString().substring(3);
					}
				}

			}

			// If it's the page with a GMail message
			if(aProgress.DOMWindow.document.getElementById('msg_0') != null || aProgress.DOMWindow.document.getElementById('msgs') != null) {
				if (aProgress.DOMWindow.document.body.hasAttribute("gpg") == false) {

					aProgress.DOMWindow.document.body.setAttribute("gpg","ok");

					cGmail.lastDomToverify = aProgress.DOMWindow;
					setTimeout("cGmail.onDelayLoad()", 1000); //Fast connexions
					setTimeout("cGmail.onDelayLoad()", 5000); //Slow connexions

				}

			}
		}
		return 0;
	},

    /*
        Function: onLocationChange
        This function is called when the location change Here to be a good listener.

        Parameters:
            aProgress - The progress
            aRequest - The request
            aURI -  The new url.

    */
	onLocationChange: function(aProgress, aRequest, aURI) { return 0; },
    /*
        Function: onProgressChange
        This function is called when the progress change Here to be a good listener.
    */
	onProgressChange: function() { return 0; },
	/*
        Function: onStatusChange
        This function is called when the stage change Here to be a good listener.
    */
    onStatusChange: function() { return 0; },
	/*
        Function: onSecurityChange
        This function is called when the security change Here to be a good listener.
    */
    onSecurityChange: function(){ return 0; },
	/*
        Function: onLinkIconAvailable
        This function is called when the location change Here to be a good listener.
    */
    onLinkIconAvailable: function() { return 0; }
}


/*
   Class: cGmail
   This is the main class to manage gmail's function with the old interface.
*/
var cGmail = {

	/*
        Function: onDelayLoad
        This function is called when a gmail page is loaded, after fiew seconds. She test signs, create buttons, etc...
    */
	onDelayLoad: function() {
		//Say that we can have now events now...
		this.lastDomToverify.document.body.removeAttribute('gpg');

		for (var i = 0; i < this.LastNombreMail; i++) {
			if (this.lastDomToverify.document.getElementById('rc_' + i) != null) {

				if (this.lastDomToverify.document.getElementById('rc_' + i).hasAttribute("gpg") == false) {
					try {
						this.lastDomToverify.document.getElementById('rc_' + i).setAttribute("gpg","ok");

						// 13 Childs !!
						var replyBox = this.lastDomToverify.document.getElementById('rc_' + i).firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild;

						var contenuMail = this.getMailContent(i);

						var td = this.lastDomToverify.document.createElement("td");

						td.setAttribute("class","");
						td.setAttribute("id","sm_verify");

						var resultTest = GPG.baseVerify(contenuMail);

						// For I18N
						var i18n = document.getElementById("firegpg-strings");

						if (resultTest.length == 0) {
							if (cGmail.nonosign != true)
							{
								td.setAttribute("style","color: orange;");
								td.innerHTML = i18n.getString("GMailNoS");
							}
						}
                        else if (resultTest[0] == "erreur") {
                            td.setAttribute("style","color: red;");
                            td.innerHTML = i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";
                        }
                        else if (resultTest[0] == "erreur_bad") {
                            td.setAttribute("style","color: red;");
                            td.innerHTML = i18n.getString("GMailSErr") + " (" + i18n.getString("falseSign") + ")"; //"La première signature de ce mail est incorrect !";
                        }
                        else if (resultTest[0] == "erreur_no_key") {
                            td.setAttribute("style","color: red;");
                            td.innerHTML = i18n.getString("GMailSErr") + " (" + i18n.getString("keyNotFound") + ")"; //"La première signature de ce mail est incorrect !";
                        }
						else {
							infos = resultTest[0].split(" ");
							var infos2 = "";
							for (var ii = 1; ii < infos.length; ++ii)
							{  infos2 = infos2 + infos[ii] + " ";}

							td.setAttribute("style","color: green;");
							td.innerHTML = i18n.getString("GMailSOK") + " " + htmlEncode(infos2); //"La première signature de ce mail est de testtest (testtest)
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

					} catch (e) { }
				}
			}

			if (this.lastDomToverify.document.getElementById('nc_' + i) != null) {
				if (this.lastDomToverify.document.getElementById('nc_' + i).hasAttribute("gpg") == false) {
					this.lastDomToverify.document.getElementById('nc_' + i).setAttribute("gpg","ok");
					var boutonBox = this.lastDomToverify.document.getElementById('nc_' + i).parentNode;
					this.addComposeBoutons(boutonBox,this.lastDomToverify.document,i);

				}
			}

			if (this.lastDomToverify.document.getElementById('sb_' + i) != null) {
				if (this.lastDomToverify.document.getElementById('sb_' + i).hasAttribute("gpg") == false) {
					this.lastDomToverify.document.getElementById('sb_' + i).setAttribute("gpg","ok");

					var boutonBox = null;
					boutonBox = this.lastDomToverify.document.getElementById('sb_' + i).firstChild.firstChild.firstChild.firstChild.firstChild;

					if (boutonBox == null) //For the drafs
					{
						boutonBox = this.lastDomToverify.document.getElementById('sb_' + i).firstChild;

						if (boutonBox.tagName != "DIV")
							boutonBox = null;

					}

					this.addComposeBoutons(boutonBox,this.lastDomToverify.document,i);

				}
			}
		}

	},

    /*
        Function: simpleLoad
        This function is called when a gmail page is loaded. She prepare some variables like the number of mails and add some buttons.
    */
	simpleLoad: function(e) {
		var Ddocument = e.target.defaultView.wrappedJSObject.document;

		if (Ddocument.getElementById('compose_form') != null)	{
			this.LastNombreMail = 2;
		}

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
			this.lastDomToverify = e.target.defaultView.wrappedJSObject;
		}

		if (Ddocument.getElementById('nc_compose') != null) {
			var boutonBox = Ddocument.getElementById('nc_compose').parentNode;
			this.addComposeBoutons(boutonBox,Ddocument,'compose');
			this.lastDomToverify = e.target.defaultView.wrappedJSObject;
		} else 	if (Ddocument.getElementById('st_compose') != null) {
			var boutonBox = Ddocument.getElementById('st_compose').firstChild;
			this.addComposeBoutons(boutonBox,Ddocument,'compose');
			this.lastDomToverify = e.target.defaultView.wrappedJSObject;
		}

		if(Ddocument.getElementById('compose_form') != null) {
			this.lastDomToverify = e.target.defaultView.wrappedJSObject;
		}
	},

    /*
        Function: initSystem
        This function init the class : she load specific options, and attach listeners to the webpages.
    */
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

			cGmail.nonosign = nonosign;
			cGmail.b_sign = b_sign;
			cGmail.b_sign_s = b_sign_s;
			cGmail.b_crypt = b_crypt;
			cGmail.b_crypt_s = b_crypt_s;
			cGmail.b_signcrypt = b_signcrypt;
			cGmail.b_signcrypt_s = b_signcrypt_s;
		}
	},

    /*
        Function: addBouton
        This function create a html button at the end of a node.

        Parameters:
            label - The label of the button
            id - The id of the button
            box - The node where the button is added.
            Ddocument - The page's document (of the node)
            info1 -  Dosen't seem to be used.
    */
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


		} catch (e) {}
	},

    /*
        Function: addComposeBoutons
        This function add compose boutons (sign, sign and send, ...) to a node.

        Parameters:
            box - The node where buttons are added.
            Ddocument - The page's document (of the node)
            info1 - Information who will be return when a buton is pressed.
    */
	addComposeBoutons: function(box,Ddocument,info1) {
		//If we add compose boutons, it's can due to a reply, and we sould retest the signs.

		// For i18N
		var i18n = document.getElementById("firegpg-strings");

		if (cGmail.b_sign == true)
			this.addBouton(i18n.getString("GMailS"),"sign",box,Ddocument,info1);
		if (cGmail.b_sign_s == true)
			this.addBouton(i18n.getString("GMailSS"),"sndsign",box,Ddocument,info1);
		if (cGmail.b_crypt == true)
			this.addBouton(i18n.getString("GMailC"),"crypt",box,Ddocument,info1);
		if (cGmail.b_crypt_s == true)
			this.addBouton(i18n.getString("GMailCS"),"sndcrypt",box,Ddocument,info1);
		if (cGmail.b_signcrypt == true)
			this.addBouton(i18n.getString("GMailSAC"),"signcrypt",box,Ddocument,info1);
		if (cGmail.b_signcrypt_s == true)
			this.addBouton(i18n.getString("GMailSACS"),"sndsigncrypt",box,Ddocument,info1);

		try {

			var tmpListener = new Object;
			tmpListener = null;
			tmpListener = new cGmail.callBack("tralala",info1)
			box.addEventListener('click',tmpListener,true);

		} catch (e) {}
	},

    /*
        Function: listenerLoad
        This function is called by the listener when a page is loaded. She call anothers loadpage-relative function if it's a gmail page.
    */
	listenerLoad: function(e) {

		try {

			var urlPage = e.target.defaultView.wrappedJSObject.location.host;

			if (urlPage.indexOf('mail.google.com') != -1) {
				cGmail.simpleLoad(e);
				gBrowser.addProgressListener(cGmailListener,
				         Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
			}
		} catch (e) { }
	},


    /*
        Function: listenerUnload
        This function is called by the listener when a page is closed. Listeners are destroyed.
    */
	listenerUnload: function() {

		gBrowser.removeProgressListener(cGmailListener);
	},

    /*
        Function: callBack
        This create a function who is called when a button (or a link) is pressed. She execute the corespondig action (like sign..)

        Parameters:
            id - The id to save
            info1 - The additionnal information to save.
    */
	callBack: function(id,info1) {
		this._id = id; // Save infos
		this._info1 = info1;

		this.handleEvent = function(event) { // Function in the function for handle... events.
			//If we click to discrad, we should redo the tests.


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

				reg=new RegExp("\\- \\-\\-\\-\\-\\-BEGIN PGP MESSAGE\\-\\-\\-\\-\\-", "gi"); // We don't have to detect disabled balises
				contenuMail = contenuMail.replace(reg, "FIREGPGTRALALABEGINHIHAN");

				reg=new RegExp("\\- \\-\\-\\-\\-\\-END PGP MESSAGE\\-\\-\\-\\-\\-", "gi"); // We don't have to detect disabled balises
				contenuMail = contenuMail.replace(reg, "FIREGPGTRALALAENDHIHAN");

				var firstPosition = contenuMail.indexOf("-----BEGIN PGP MESSAGE-----");
				var lastPosition = contenuMail.indexOf("-----END PGP MESSAGE-----");

				reg=new RegExp("FIREGPGTRALALABEGINHIHAN", "gi"); // We don't have to detect disabled balises
				contenuMail = contenuMail.replace(reg, "-----BEGIN PGP MESSAGE-----");

				reg=new RegExp("FIREGPGTRALALAENDHIHAN", "gi"); // We don't have to detect disabled balises
				contenuMail = contenuMail.replace(reg, "-----END PGP MESSAGE-----");

				contenuMail = contenuMail.substring(firstPosition,lastPosition + ("-----END PGP MESSAGE-----").length);


				var password = getPrivateKeyPassword();
				var result = GPG.baseDecrypt(contenuMail,password);
				var crypttext = result.output;
				var sdOut2 = result.sdOut2;
				result = result.sdOut;

				if (password == null)
					return;

				// If the crypt failled
				if (result == "erreurPass") {
					alert(i18n.getString("decryptFailedPassword"));
					eraseSavedPassword();
				}
				else if (result == "erreur") {
					alert(i18n.getString("decryptFailed"));
				}
				else
				{
					var signAndCryptResult = undefined;

					//If there was a sign with the crypted text
					if (result == "signValid")
					{
						infos = sdOut2.split(" ");
						signAndCryptResult = "";
						for (var ii = 1; ii < infos.length; ++ii)
						{  signAndCryptResult = signAndCryptResult + infos[ii] + " ";}
					}

					showText(crypttext,undefined,undefined,undefined,signAndCryptResult);
				}
			}
			else if (event.target.id == "sndsign" || event.target.id == "sign")
			{

				var mailContent = cGmail.getWriteMailContent(cGmail.lastDomToverify.document,info1);

				var boutonBox = cGmail.lastDomToverify.document.getElementById('sb_' + info1).firstChild;


				if (mailContent == "")
					return;

				var keyID = getSelfKey();
				var password = getPrivateKeyPassword();


				if (password == null || keyID == null)
					return;

				var result = GPG.baseSign(gmailWrapping(mailContent),password,keyID);

						// If the sign failled
				if(result.sdOut == "erreur") {
					// We alert the user
					alert(i18n.getString("signFailed"));
				}
				else if(result.sdOut == "erreurPass") {
						alert(i18n.getString("signFailedPassword"));
						eraseSavedPassword();
				}
				else {

					cGmail.setWriteMailContent(cGmail.lastDomToverify.document,info1,result.output);

					if (event.target.id == "sndsign")
					{
						cGmail.sendEmail(boutonBox,cGmail.lastDomToverify.document);
						boutonBox = cGmail.lastDomToverify.document.getElementById('nc_' + info1).parentNode;
						cGmail.sendEmail(boutonBox,cGmail.lastDomToverify.document);
					}
				}

			}
			else if (event.target.id == "sndcrypt" || event.target.id == "crypt")
			{

				//This code has to mix with the previous else/if block
				var mailContent = cGmail.getWriteMailContent(cGmail.lastDomToverify.document,info1);

				var whoWillGotTheMail = cGmail.getToCcBccMail(cGmail.lastDomToverify.document,info1);

				var boutonBox = cGmail.lastDomToverify.document.getElementById('sb_' + info1).firstChild;


				if (mailContent == "")
					return;


				var keyID = choosePublicKey(whoWillGotTheMail);

				if (keyID == null || keyID == "")
					return;

				var result = GPG.baseCrypt(mailContent,keyID);

						// If the sign failled
				if(result.sdOut == "erreur") {
					// We alert the user
					alert(i18n.getString("cryptFailed"));
				}
				else {

					cGmail.setWriteMailContent(cGmail.lastDomToverify.document,info1,result.output);

					if (event.target.id == "sndcrypt")
					{
						cGmail.sendEmail(boutonBox,cGmail.lastDomToverify.document);
						boutonBox = cGmail.lastDomToverify.document.getElementById('nc_' + info1).parentNode;
						cGmail.sendEmail(boutonBox,cGmail.lastDomToverify.document);
					}

				}
			}
			else if (event.target.id == "sndsigncrypt" || event.target.id == "signcrypt")
			{

				//This code has to mix with the previous else/if block
				var mailContent = cGmail.getWriteMailContent(cGmail.lastDomToverify.document,info1);

				var whoWillGotTheMail = cGmail.getToCcBccMail(cGmail.lastDomToverify.document,info1);

				var boutonBox = cGmail.lastDomToverify.document.getElementById('sb_' + info1).firstChild;


				if (mailContent == "")
					return;


				var keyID = choosePublicKey(whoWillGotTheMail);

				if (keyID == null || keyID == "")
					return;

				// Needed for a sign
				var keySignID = getSelfKey();
				if(keySignID == null)
					return;

				var password = getPrivateKeyPassword();
				if(password == null)
					return;

				var result = GPG.baseCryptAndSign(mailContent, keyID,false,password, keySignID);

						// If the sign failled
				if(result.sdOut == "erreur") {
					// We alert the user
					alert(i18n.getString("cryptAndSignFailed"));
				} else
				if(result.sdOut == "erreurPass") {
					// We alert the user
					eraseSavedPassword();
					alert(i18n.getString("cryptAndSignFailedPass"));
				}
				else {

					cGmail.setWriteMailContent(cGmail.lastDomToverify.document,info1,result.output);

					if (event.target.id == "sndsigncrypt")
					{
						cGmail.sendEmail(boutonBox,cGmail.lastDomToverify.document);
						boutonBox = cGmail.lastDomToverify.document.getElementById('nc_' + info1).parentNode;
						cGmail.sendEmail(boutonBox,cGmail.lastDomToverify.document);
					}

				}
			}
		};
	},

    /*
        Function: getWriteMailContent
        Return the content of a mail in composition (his selection if something is selected)

        Parameters:
            dDocument- The html document
            idMail - The id of the mail (gmail)
    */
	getWriteMailContent: function(dDocument,idMail)
	{

			//Mode RichEditing

			//First, we look for a selection
			try { var select = dDocument.getElementById('hc_' + idMail).contentWindow.getSelection(); }
			catch (e) { var select = ""; }

			if (select.toString() == "")
			{
				var select2 = "";
				//Mode plain text
				try {
					var textarera =	dDocument.getElementById('ta_' + idMail);
					select2 = textarera.value;
					select2 = select2.substring(textarera.selectionStart,textarera.selectionEnd);


				} catch (e) { }

				if (select2 == "")
				{

					//Ok, we try now to get all content
					try { var select = dDocument.getElementById('hc_' + idMail).contentWindow.document.body.innerHTML; }
					catch (e) { var select = ""; }

					if ( select != "")
					{

						var indexOfQuote = select.indexOf('<span class="gmail_quote">');
						if (indexOfQuote == -1)
							indexOfQuote = select.length;
						contenuMail = Selection.wash(select.substring(0,indexOfQuote));

						this.composeIndexOfQuote  = indexOfQuote;
					}
					else
					{
						var textarera =	dDocument.getElementById('ta_' + idMail);
						select2 = textarera.value;

						var indexOfQuote = select2.indexOf("\n> ");
						select2 = select2.substring(0,indexOfQuote);

						indexOfQuote = select2.lastIndexOf("\n");

						if (indexOfQuote == -1)
						{
							select2 = textarera.value;
							indexOfQuote = select2.length;
						}

						textarera.selectionStart = 0;
						textarera.selectionEnd = indexOfQuote;

						contenuMail = Selection.wash(select2.substring(0,indexOfQuote));

					}
					//var i18n = document.getElementById("firegpg-strings");
					//alert(i18n.getString("gmailSelectError"));
					//return "";

				}
				else
				{

					contenuMail = Selection.wash(select2);
				}
			}
			else
			{
				value = select.getRangeAt(0);


				var documentFragment = value.cloneContents();

				var s = new XMLSerializer();
				var d = documentFragment;
				var str = s.serializeToString(d);

				contenuMail = Selection.wash(str);

			}
			return contenuMail;
	},

    /*
        Function: getToCcBccMail
        Return the To, CC and BCC filds' value of a mail in composition.

        Parameters:
            dDocument- The html document
            idMail - The id of the mail (gmail)
    */
	getToCcBccMail: function(dDocument,idMail) {
		var forWho = "";
		var tmpFor = "";

		// The TO textareara
		try { tmpFor = dDocument.getElementById('to_' + idMail).value; }
		catch (e) { tmpFor = ""; }

		forWho = tmpFor;

		// The CC textareara
		try { tmpFor = dDocument.getElementById('cc_' + idMail).value; }
		catch (e) { tmpFor = ""; }

		forWho = forWho + " " + tmpFor;


		// The DCC textareara
		try { tmpFor = dDocument.getElementById('bcc_' + idMail).value; }
		catch (e) { tmpFor = ""; }

		forWho = forWho + " " + tmpFor;

		//Pattern
		var reg = new RegExp('[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}', 'gi');

		var aMail = reg.exec(forWho);

		var i = 0;
		var returnList = new Array();

		while(aMail != null)
		{
			returnList[i] = aMail;
			i++;
			aMail = reg.exec(forWho);
		}

		return returnList;
	},

    /*
        Function: setWriteMailContent
        Set the content of a mail in composition (his selection if something is selected)

        Parameters:
            dDocument- The html document.
            idMail - The id of the mail (gmail).
            newText - The text to set.
    */
	setWriteMailContent: function(dDocument,idMail,newText)
	{

			//Mode RichEditing


			try { //First, we look for a selection
				var iFrame = dDocument.getElementById('hc_' + idMail).contentWindow;
				var select = iFrame.getSelection();
			} catch (e) { var select = ""; }

			if (select.toString() == "")
			{


				//Mode plain text
				try {
					var textarera =	dDocument.getElementById('ta_' + idMail);
					var value = textarera.value;

				} catch (e) { }

				try {
					if (value == "" || value == null) //Ho, in fact, nothing is selected in plain text too, so it's a richtextmode
					{

						try { var select = iFrame.document.body.innerHTML; }
						catch (e) { var select = ""; }

						var reg=new RegExp("\n", "gi");
						newText = newText.replace(reg,"<br>");

						iFrame.document.body.innerHTML = newText + select.substring(this.composeIndexOfQuote, select.length) + "<br /><br />";

					}
					else { //Plaintext (there are a selection evrytime dues to getWriteMailContent
						var startPos = textarera.selectionStart;
						var endPos = textarera.selectionEnd;
						var chaine = textarera.value;

						// We create the new string and replace it into the focused element
						textarera.value = chaine.substring(0, startPos) + newText + chaine.substring(endPos, chaine.length);

						// We select the new text.
						textarera.selectionStart = startPos;
						textarera.selectionEnd = startPos + text.length ;
					}


				} catch (e) { }

			} else { //RichEditing, have a selection

                var reg=new RegExp("<", "gi");
				newText = newText.replace(reg,"&lt;");

				var reg=new RegExp("\n", "gi");
				newText = newText.replace(reg,"<br>");

				var range = select.getRangeAt(0);
				var el = dDocument.createElement("div");

				el.innerHTML = newText;

				range.deleteContents();
				range.insertNode(el);

			}


	},

	/*
        Function: sendEmail
        Simulate a click on the send button.

        Parameters:
            nodeForScan - The node with the send button
            dDocument - The document of the page
    */
	sendEmail: function(nodeForScan, dDocument)
	{

		var children = nodeForScan.childNodes;

			for (var i = 0; i < children.length; i++)
			 {
			try {
			if (children[i].attributes.getNamedItem("id").textContent == "snd")
			{
				var evt = dDocument.createEvent("MouseEvents");
					evt.initEvent("click", true, true);
					children[i].dispatchEvent(evt);
			} } catch (e) { }
			}
	},

	/*
        Function: getMailContent
        Retrun the content of a mail

        Parameters:
            i - The mail's id (0 to n) (gmail)
    */
	getMailContent: function(i) {
		var contenuMail = this.lastDomToverify.document.getElementById('mb_' + i);
		var range = this.lastDomToverify.document.createRange();
		range.selectNode(contenuMail);
		var documentFragment = range.cloneContents();
		var s = new XMLSerializer();
		var d = documentFragment;
		var str = s.serializeToString(d);
		contenuMail = Selection.wash(str);

		return contenuMail;

	},

    /*
        Function: foundTheGoodId
        Get the interal id of a mail based on this mail id of the page (Used by <getMimeMailContens>).

        Parameters:
            id - The mail's id (0 to n) (gmail)
    */
	foundTheGoodId: function(id) {
		var tmpListNode = this.lastDomToverify.document.getElementById('mh_' + id).firstChild.firstChild.childNodes;
		//Class = FHR.
		for(var i = 0; i < tmpListNode.length; i++)
		{
			for (var iATT = 0; iATT < tmpListNode[i].attributes.length; iATT++)
			{
				if (tmpListNode[i].attributes[iATT].name == "class" && tmpListNode[i].attributes[iATT].value == "fhr")
				{
					var tmpListNode2 = tmpListNode[i].childNodes;
					//Class = LL.
					for(var j = 0; j < tmpListNode2.length; j++)
					{
						if (tmpListNode2[j].firstChild && tmpListNode2[j].firstChild.attributes)
						{
							for (var jATT = 0; jATT < tmpListNode2[j].firstChild.attributes.length; jATT++)
							{
								if (tmpListNode2[j].firstChild.attributes[jATT].name == "class" && tmpListNode2[j].firstChild.attributes[jATT].value == "ll")
								{
									return tmpListNode2[j].firstChild.id.toString().substring(3);
								}
							}
						}
						if (tmpListNode2[j].lastChild && tmpListNode2[j].lastChild.attributes)
						{
							for (var jATT = 0; jATT < tmpListNode2[j].lastChild.attributes.length; jATT++)
							{
								if (tmpListNode2[j].lastChild.attributes[jATT].name == "class" && tmpListNode2[j].lastChild.attributes[jATT].value == "ll")
								{
									return tmpListNode2[j].lastChild.id.toString().substring(3);
								}
							}
						}
					}
				}
			}
		}
		return null;
	},

    /*
        Function: getMimeMailContens
        Return the mime source of a mail

        Parameters:
            id - The mail's id (0 to n) (gmail)
    */
	getMimeMailContens: function(id) {


			var idOfTheMail = this.foundTheGoodId(id);

		if (this.messageCache == null || this.messageCache[idOfTheMail] == null)
		{

			var mailData = getContentXHttp("https://mail.google.com/mail/?ik=" + this.ik + "&view=om&th=" + idOfTheMail + "&zx=");


			//temps en temps des probs en https (déconection) alors on utilise le http
			if (mailData.indexOf("<html>") == 0)
			{
				alert("!");
				mailData = getContentXHttp("http://mail.google.com/mail/?ik=" + this.ik + "&view=om&th=" + idOfTheMail + "&zx=");
			}

			if (this.messageCache == null)
				this.messageCache = { };

			this.messageCache[idOfTheMail] = mailData;

			return mailData;
		}
		else
		{
			return this.messageCache[idOfTheMail];
		}


	}


};

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
