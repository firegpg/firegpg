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

if (typeof(FireGPG)=='undefined') { FireGPG = {}; }
if (typeof(FireGPG.Const)=='undefined') { FireGPG.Const = {}; }

FireGPG.Const.Gmail = {} ;

/*Constant: FireGPG.Const.Gmail.START
 State 'start' for ProgressListener */
FireGPG.Const.Gmail.START = Components.interfaces.nsIWebProgressListener.STATE_START;
/* Constant: FireGPG.Const.Gmail.STOP
  State 'stop' for ProgressListener */
FireGPG.Const.Gmail.STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

/*
   Class: FireGPG.cGmailListener
   This class implement a listener, to intercept page loaded.
*/
FireGPG.cGmailListener = {
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
		if(aFlag & FireGPG.Const.Gmail.STOP) {

			//If we need ton find the IK information
			if (FireGPG.cGmail.ik == null)
			{
                if (aRequest != null) {
                    if (aRequest.name.indexOf("?ik=") != -1 || aRequest.name.indexOf("&ik=") != -1)
                    {

                        var reg= new RegExp("ik\\=[a-zA-Z0-9]+");
                        FireGPG.cGmail.ik = aRequest.name.match(reg);

                        if (FireGPG.cGmail.ik != null && FireGPG.cGmail.ik != "")
                        {
                            FireGPG.cGmail.ik = FireGPG.cGmail.ik.toString().substring(3);
                        }
                    }
                }

			}

			// If it's the page with a GMail message
			if(aProgress.DOMWindow.document.getElementById('msg_0') != null || aProgress.DOMWindow.document.getElementById('msgs') != null) {
				if (aProgress.DOMWindow.document.body.hasAttribute("gpg") == false) {

					aProgress.DOMWindow.document.body.setAttribute("gpg","ok");

					FireGPG.cGmail.lastDomToverify = aProgress.DOMWindow;
					setTimeout("FireGPG.cGmail.onDelayLoad()", 1000); //Fast connexions
					setTimeout("FireGPG.cGmail.onDelayLoad()", 5000); //Slow connexions

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
   Class: FireGPG.cGmail
   This is the main class to manage gmail's function with the old interface.
*/
FireGPG.cGmail = {

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

						var resultTest = FireGPG.Core.verify(true,contenuMail);

						// For I18N
						var i18n = document.getElementById("firegpg-strings");

						if (resultTest.result == FireGPG.Const.Results.ERROR_NO_GPG_DATA) {
							if (FireGPG.cGmail.nonosign != true)
							{
								td.setAttribute("style","color: orange;");
								td.innerHTML = i18n.getString("GMailNoS");
							}
						}
                        else if (resultTest.signresult ==FireGPG.Const.Results.ERROR_UNKNOW) {
                            td.setAttribute("style","color: red;");
                            td.innerHTML = i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";
                        }
                        else if (resultTest.signresult == FireGPG.Const.Results.ERROR_BAD_SIGN) {
                            td.setAttribute("style","color: red;");
                            td.innerHTML = i18n.getString("GMailSErr") + " (" + i18n.getString("falseSign") + ")"; //"La première signature de ce mail est incorrect !";
                        }
                        else if (resultTest.signresult == FireGPG.Const.Results.ERROR_NO_KEY) {
                            td.setAttribute("style","color: red;");
                            td.innerHTML = i18n.getString("GMailSErr") + " (" + i18n.getString("keyNotFound") + ")"; //"La première signature de ce mail est incorrect !";
                        }
						else if (resultTest.signresulttext != null) {

							td.setAttribute("style","color: green;");
							td.innerHTML = i18n.getString("GMailSOK") + " " + FireGPG.Misc.htmlEncode(resultTest.signresulttext); //"La première signature de ce mail est de testtest (testtest)
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
							tmpListener = new FireGPG.cGmail.callBack("sm_decrypt",i)
							td.addEventListener('click',tmpListener,true);
						}

					} catch (e) { FireGPG.debug(e,'cgmail.onDelayLoad',true); }
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

        return false; // Gmail turned off.

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
			if (document.getElementById("appcontent"))
                document.getElementById("appcontent").addEventListener("DOMContentLoaded", FireGPG.cGmail.listenerLoad, false);
            else
                document.getElementById("browser_content").addEventListener("DOMContentLoaded", FireGPG.cGmail.listenerLoad, false);
			window.addEventListener("unload", function() {FireGPG.cGmail.listenerUnload()}, false);


			try {	var nonosign = prefs.getBoolPref("gmail_no_sign_off");	}
			catch (e) { var nonosign = false; }
			try {	var b_sign = prefs.getBoolPref("gmail_butons_sign");	}
			catch (e) { var b_sign = true; }
			try {	var b_sign_s = prefs.getBoolPref("gmail_butons_sign_send");	}
			catch (e) { var b_sign_s = true; }
            try {	var b_psign = prefs.getBoolPref("gmail_butons_psign");	}
            catch (e) { var b_psign = true; }
			try {	var b_psign_s = prefs.getBoolPref("gmail_butons_psign_send");	}
			catch (e) { var b_psign_s = true; }
			try {	var b_crypt = prefs.getBoolPref("gmail_butons_crypt");	}
			catch (e) { var b_crypt = true; }
			try {	var b_crypt_s = prefs.getBoolPref("gmail_butons_crypt_send");	}
			catch (e) { var b_crypt_s = true; }

			try {	var b_signcrypt = prefs.getBoolPref("gmail_butons_sign_crypt");	}
			catch (e) { var b_signcrypt = true; }
			try {	var b_signcrypt_s = prefs.getBoolPref("gmail_butons_sign_crypt_send");	}
			catch (e) { var b_signcrypt_s = true; }

            try {	var b_use_select_s = prefs.getBoolPref("gmail_butons_use_select");	}
			catch (e) { var b_use_select_s = false; }

			FireGPG.cGmail.nonosign = nonosign;
			FireGPG.cGmail.b_sign = b_sign;
			FireGPG.cGmail.b_sign_s = b_sign_s;
            FireGPG.cGmail.b_psign = b_psign;
			FireGPG.cGmail.b_psign_s = b_psign_s;
			FireGPG.cGmail.b_crypt = b_crypt;
			FireGPG.cGmail.b_crypt_s = b_crypt_s;
			FireGPG.cGmail.b_signcrypt = b_signcrypt;
			FireGPG.cGmail.b_signcrypt_s = b_signcrypt_s;
            FireGPG.cGmail.b_use_select_s = b_use_select_s;
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
            info1 -  doesn't seem to be used.
    */
	addBouton: function(label,id,box,Ddocument,info1) {

        if ( ! this.b_use_select_s) {

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


            } catch (e) { FireGPG.debug(e,'cgmail.addBouton',true); }

        } else { //we have to use a select list.

            //We try to found a select who already exist.

            var selectlist = box.getElementsByTagName('select');

            if (selectlist[0])
                var select = selectlist[0];
            else {

                var select = new Object;
                select = null;
                select = Ddocument.createElement("select");

                select.setAttribute("gpg_action","SELECT");

                select.setAttribute("style","margin-left: 5px;");

                var option = new Option("FireGPG","FireGPG");

                select.add(option,null);

                try {
                    box.appendChild(select);

                     var tmpListener = new Object;
                    tmpListener = null;
                    tmpListener = new FireGPG.cGmail.callBack("tralala",info1)
                    select.addEventListener('onchange',tmpListener,false);

               } catch (e) { FireGPG.debug(e,'cgmail.addBouton2',true); }

            }

            //Now we add the option.
            var option = new Option("> " + label,id);

            select.add(option,null);

        }


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

		if (FireGPG.cGmail.b_sign == true)
			this.addBouton(i18n.getString("GMailCLS"),"sign",box,Ddocument,info1);
		if (FireGPG.cGmail.b_sign_s == true)
			this.addBouton(i18n.getString("GMailCLSS"),"sndsign",box,Ddocument,info1);
        if (FireGPG.cGmail.b_psign == true)
			this.addBouton(i18n.getString("GMailS"),"psign",box,Ddocument,info1);
		if (FireGPG.cGmail.b_psign_s == true)
			this.addBouton(i18n.getString("GMailSS"),"sndpsign",box,Ddocument,info1);
		if (FireGPG.cGmail.b_crypt == true)
			this.addBouton(i18n.getString("GMailC"),"crypt",box,Ddocument,info1);
		if (FireGPG.cGmail.b_crypt_s == true)
			this.addBouton(i18n.getString("GMailCS"),"sndcrypt",box,Ddocument,info1);
		if (FireGPG.cGmail.b_signcrypt == true)
			this.addBouton(i18n.getString("GMailSAC"),"signcrypt",box,Ddocument,info1);
		if (FireGPG.cGmail.b_signcrypt_s == true)
			this.addBouton(i18n.getString("GMailSACS"),"sndsigncrypt",box,Ddocument,info1);

		try {

			var tmpListener = new Object;
			tmpListener = null;
			tmpListener = new FireGPG.cGmail.callBack("tralala",info1)
			box.addEventListener('click',tmpListener,true);

		} catch (e) { FireGPG.debug(e,'cgmail.addComposeBoutons',true); }
	},

    /*
        Function: listenerLoad
        This function is called by the listener when a page is loaded. She call anothers loadpage-relative function if it's a gmail page.
    */
	listenerLoad: function(e) {

		try {

			var urlPage = e.target.defaultView.wrappedJSObject.location.host;

			if (urlPage.indexOf('mail.google.com') != -1) {
				FireGPG.cGmail.simpleLoad(e);
				gBrowser.addProgressListener(FireGPG.cGmailListener,
				         Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
			}
		} catch (e) {}
	},


    /*
        Function: listenerUnload
        This function is called by the listener when a page is closed. Listeners are destroyed.
    */
	listenerUnload: function() {

		gBrowser.removeProgressListener(FireGPG.cGmailListener);
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


            if (event.target.nodeName == "SELECT")
                return;

            try {

                if (event.target.nodeName == "OPTION") {

                    var tmpval = event.target.value;

                    var target = event.target.parentNode;

                    target.id = tmpval;

                    target.value = "FireGPG";
                } else {

                    target = event.target;

                }

            } catch (e)  {  FireGPG.debug(e,'cgmail.callBack',true); }


			if (target.id == "sm_decrypt") {
				var contenuMail = FireGPG.cGmail.lastDomToverify.document.getElementById('mb_' + info1);

				var range = FireGPG.cGmail.lastDomToverify.document.createRange();
				range.selectNode(contenuMail);
				var documentFragment = range.cloneContents();

				var s = new XMLSerializer();
				var d = documentFragment;
				var str = s.serializeToString(d);

				contenuMail = FireGPG.Selection.wash(str);

				var result = FireGPG.Core.decrypt(false,contenuMail);

                if (result.result == FireGPG.Const.Results.SUCCESS)
					FireGPG.Misc.showText(result.decrypted,undefined,undefined,undefined,result.signresulttext);

			}
			else if (target.id == "sndsign" || target.id == "sign")
			{

				var mailContent = FireGPG.cGmail.getWriteMailContent(FireGPG.cGmail.lastDomToverify.document,info1);

				var boutonBox = FireGPG.cGmail.lastDomToverify.document.getElementById('sb_' + info1).firstChild;


				if (mailContent == "")
					return;

                var result = FireGPG.Core.sign(false,FireGPG.Misc.gmailWrapping(mailContent));

                if (result.result == FireGPG.Const.Results.SUCCESS) {

					FireGPG.cGmail.setWriteMailContent(FireGPG.cGmail.lastDomToverify.document,info1,result.signed);

					if (target.id == "sndsign") {
						FireGPG.cGmail.sendEmail(boutonBox,FireGPG.cGmail.lastDomToverify.document);
						boutonBox = FireGPG.cGmail.lastDomToverify.document.getElementById('nc_' + info1).parentNode;
						FireGPG.cGmail.sendEmail(boutonBox,FireGPG.cGmail.lastDomToverify.document);
					}
				}

			}
            else if (target.id == "sndpsign" || target.id == "psign")
			{

				var mailContent = FireGPG.cGmail.getWriteMailContent(FireGPG.cGmail.lastDomToverify.document,info1);

				var boutonBox = FireGPG.cGmail.lastDomToverify.document.getElementById('sb_' + info1).firstChild;


				if (mailContent == "")
					return;

                var result = FireGPG.Core.sign(false,FireGPG.Misc.gmailWrapping(mailContent),null,null,true);

                if (result.result == FireGPG.Const.Results.SUCCESS) {

					FireGPG.cGmail.setWriteMailContent(FireGPG.cGmail.lastDomToverify.document,info1,result.signed);

					if (target.id == "sndpsign") {
						FireGPG.cGmail.sendEmail(boutonBox,FireGPG.cGmail.lastDomToverify.document);
						boutonBox = FireGPG.cGmail.lastDomToverify.document.getElementById('nc_' + info1).parentNode;
						FireGPG.cGmail.sendEmail(boutonBox,FireGPG.cGmail.lastDomToverify.document);
					}
				}

			}
			else if (target.id == "sndcrypt" || target.id == "crypt")
			{

				//This code has to mix with the previous else/if block
				var mailContent = FireGPG.cGmail.getWriteMailContent(FireGPG.cGmail.lastDomToverify.document,info1);

				var whoWillGotTheMail = FireGPG.cGmail.getToCcBccMail(FireGPG.cGmail.lastDomToverify.document,info1);

				var boutonBox = FireGPG.cGmail.lastDomToverify.document.getElementById('sb_' + info1).firstChild;


				if (mailContent == "")
					return;

				var result = FireGPG.Core.crypt(false,mailContent,undefined, false, false,whoWillGotTheMail);

				if(result.result == FireGPG.Const.Results.SUCCESS) {

					FireGPG.cGmail.setWriteMailContent(FireGPG.cGmail.lastDomToverify.document,info1,result.encrypted);

					if (target.id == "sndcrypt")
					{
						FireGPG.cGmail.sendEmail(boutonBox,FireGPG.cGmail.lastDomToverify.document);
						boutonBox = FireGPG.cGmail.lastDomToverify.document.getElementById('nc_' + info1).parentNode;
						FireGPG.cGmail.sendEmail(boutonBox,FireGPG.cGmail.lastDomToverify.document);
					}

				}
			}

			else if (target.id == "sndsigncrypt" || target.id == "signcrypt")
			{

				//This code has to mix with the previous else/if block
				var mailContent = FireGPG.cGmail.getWriteMailContent(FireGPG.cGmail.lastDomToverify.document,info1);

				var whoWillGotTheMail = FireGPG.cGmail.getToCcBccMail(FireGPG.cGmail.lastDomToverify.document,info1);

				var boutonBox = FireGPG.cGmail.lastDomToverify.document.getElementById('sb_' + info1).firstChild;


				if (mailContent == "")
					return;


				var result = FireGPG.Core.cryptAndSign(false, mailContent, undefined ,false,undefined, undefined,true, whoWillGotTheMail);

				if(result.result == FireGPG.Const.Results.SUCCESS) {

					FireGPG.cGmail.setWriteMailContent(FireGPG.cGmail.lastDomToverify.document,info1,result.encrypted);

					if (target.id == "sndsigncrypt")
					{
						FireGPG.cGmail.sendEmail(boutonBox,FireGPG.cGmail.lastDomToverify.document);
						boutonBox = FireGPG.cGmail.lastDomToverify.document.getElementById('nc_' + info1).parentNode;
						FireGPG.cGmail.sendEmail(boutonBox,FireGPG.cGmail.lastDomToverify.document);
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
						contenuMail = FireGPG.Selection.wash(select.substring(0,indexOfQuote));

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

						contenuMail = FireGPG.Selection.wash(select2.substring(0,indexOfQuote));

					}
					//var i18n = document.getElementById("firegpg-strings");
					//alert(i18n.getString("gmailSelectError"));
					//return "";

				}
				else
				{

					contenuMail = FireGPG.Selection.wash(select2);
				}
			}
			else
			{
				value = select.getRangeAt(0);


				var documentFragment = value.cloneContents();

				var s = new XMLSerializer();
				var d = documentFragment;
				var str = s.serializeToString(d);

				contenuMail = FireGPG.Selection.wash(str);

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

			for (var i = 0; i < children.length; i++) {
                try {
                    if (children[i].attributes.getNamedItem("id").textContent == "snd")       {
                        var evt = dDocument.createEvent("MouseEvents");
                            evt.initEvent("click", true, true);
                            children[i].dispatchEvent(evt);
                    }
                } catch (e) {  FireGPG.debug(e,'cgmail.sendEmail',true);  }
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
		contenuMail = FireGPG.Selection.wash(str);

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

			var mailData = FireGPG.Misc.getContentXHttp("https://mail.google.com/mail/?ik=" + this.ik + "&view=om&th=" + idOfTheMail + "&zx=");


			//temps en temps des probs en https (déconection) alors on utilise le http
			if (mailData.indexOf("<html>") == 0)
			{
				alert("!");
				mailData = FireGPG.Misc.getContentXHttp("http://mail.google.com/mail/?ik=" + this.ik + "&view=om&th=" + idOfTheMail + "&zx=");
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