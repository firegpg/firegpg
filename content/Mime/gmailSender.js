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

Portions created by Gmail S/MIME are Copyright (C) 2005-2007 Richard Jones, 2007-2008 Sean Leonard of SeanTek(R). All Rights Reserved.

***** END LICENSE BLOCK *****

Base of the code :

Copyright (C) 2005-2006 Richard Jones.
Copyright (C) 2007-2008 Sean Leonard of SeanTek(R).
This file was a part of Gmail S/MIME (adapted)

{DOUBLY FREE SOFTWARE PUBLIC LICENSE}

*/

if (typeof(FireGPG)=='undefined') { FireGPG = {}; }
if (typeof(FireGPG.Mime)=='undefined') { FireGPG.Mime = {}; }

// Constructor.
FireGPG.Mime.GmailMimeSender = function (form, db, i18n)
{
	this.form = form;
    this.discardButton = db;
    this.i18n = i18n;

} // end FireGPG.Mime.GmailMimeSender constructor

FireGPG.Mime.GmailMimeSender.prototype = new FireGPG.Mime.Sender();

FireGPG.Mime.GmailMimeSender.prototype.ourSending = function(msgs)
{
	// TODO: make more robust by saying how many messages are being sent and the total transfer size, etc.
	FireGPG.cGmail2.setProgressMessage( this.form , this.i18n.getString("GmailSendingMail") + " (" + Math.max(1,Math.round(msgs[0].BodyPlus.length / 1024)) + "K)");
}

// Implementation of abstract value/method from SmimeSender
FireGPG.Mime.GmailMimeSender.prototype.smtpPassword = function()
{


    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		   getService(Components.interfaces.nsIPrefService);

    prefs = prefs.getBranch("extensions.firegpg.");
    try {
        var no_google_com = prefs.getBoolPref("gmail_never_use_google_com_password",false);
    } catch (e) {
        no_google_com = false;
    }



    if (no_google_com)
        return this.smtpSeparatePassword();

	// these are outputs
	var host = { value : "" }, user = { value : "" },
	pass = { value : "" };

	// if username is gmail e-mail address, then may need to remove @gmail.com.
	var userin = (typeof(this.smtpUsername) == "function" ? this.smtpUsername() : this.smtpUsername);


	if (!userin)
		return null;

	var atloc = userin.indexOf("@");
	if (atloc != -1)
		userin = userin.substring(0,atloc);

	try
	{
		// This is always true even if the user accesses
		// http://mail.google.com, because the login is always secure.
		// note that there are intelligent ways to extract the correct
		// password in the case of multiple accounts, for example, by
		// determining how AutoComplete works to specify the right
		// user for a particular webpage (and thereby to determine
		// which username to extract from the password db). But not
		// sure if AutoComplete in Firefox distinguishes different
		// URLs (e.g., GApps login v. Gmail/Google Account regular
		// login)

		var google_domain = "https://www.google.com";

		// this returns void TODO: what happens if the user has
		// multiple google accounts?  TODO: consider creating a
		// password entry smtps://smtp.gmail.com, with matching full
		// username (including domain).  But that requires more of a
		// UI, and it may be wasteful/duplicative in most cases.

		var manager;
		if (manager = Components.classes['@mozilla.org/passwordmanager;1'])
		{
			manager.getService(
				Components.interfaces.nsIPasswordManagerInternal).findPasswordEntry(
				google_domain, userin, null, host, user, pass);
			if (pass.value) return pass.value;
		}
		else if (manager = Components.classes["@mozilla.org/login-manager;1"])
		{
			manager = manager.getService(Components.interfaces.nsILoginManager);
			var logins = manager.findLogins({}, google_domain, google_domain, null);
			for (var i = 0; i < logins.length; i++) {
	      if (logins[i].username == userin) {
	         return logins[i].password;
	      }
			}
		}

		// when no passwords are found for the login screen
		return this.smtpSeparatePassword();
	}
	catch (e)
	{
		return this.smtpSeparatePassword();
	}
}; // end smtpPassword

FireGPG.Mime.GmailMimeSender.prototype.getRealm = function()
{
	var sslmode = (this.smtpSocketTypes && this.smtpSocketTypes[0] == "ssl");
	return "smtp" + (sslmode ? "s" : "") + "://" + this.smtpServer +
	((this.smtpPort == (sslmode ? 465 : 25)) ? "" : (":"+this.smtpPort));
};

FireGPG.Mime.GmailMimeSender.prototype.smtpSeparatePassword = function()
{
	// TODO: also handle case where SMTP server rejects. Consider modifying on the repeat case
	// when the password is wrong.
	// TODO: save the password for the session, just like gmail does.
	// TODO: consider grabbing the password on the user login screen,
	// at https://www.google.com. But that might not be the best idea
	// for security reasons...  @mozilla.org/network/default-prompt;1
	// @mozilla.org/network/default-auth-prompt;1
	var realm = this.getRealm();
	var userin = (typeof(this.smtpUsername) == "function" ? this.smtpUsername() : this.smtpUsername);
	// these are outputs
	var host = { value : "" }, user = { value : "" },
	pass = { value : "" };

	var manager;
	var particularlogin = null; // used in case removing the password is necessary
	try
	{
		if (manager = Components.classes['@mozilla.org/passwordmanager;1'])
		{
			manager.getService(Components.interfaces.nsIPasswordManagerInternal)
			 .findPasswordEntry(realm, userin,null, host, user, pass);
		}
		else if (manager = Components.classes["@mozilla.org/login-manager;1"])
		{
			manager = manager.getService(Components.interfaces.nsILoginManager);
			var logins = manager.findLogins({}, realm, realm, null);
			for (var i = 0; i < logins.length; i++) {
	      if (logins[i].username == userin) {
	         pass.value = logins[i].password;
					 particularlogin = logins[i];
	         break;
	      }
			}
		}
		// else do nothing.
	}
	catch (e)
	{
		// do nothing, fallback to case below. Ask for a password. Also ask if want it saved.
	}

	if (pass.value.length)
	{
		return pass.value;
	}
	else
	{
		var p = Components.classes['@mozilla.org/network/default-prompt;1'].
		  getService(Components.interfaces.nsIPrompt);
		var sbs = Components.classes['@mozilla.org/intl/stringbundle;1'].
		  getService(Components.interfaces.nsIStringBundleService);
		var sb = sbs.createBundle("chrome://passwordmgr/locale/passwordmgr.properties");
		var checkMsg = sb.GetStringFromName("rememberPassword");
		var checkValue = { value: (pass.value.length > 0)	};

		var pr = p.promptPassword(this.i18n.getString("Authrequired") , this.i18n.getString("Enterpassword") + " " + userin +
								  " (" + realm + ")", pass, checkMsg, checkValue);
		// NOTE: the password is saved permanently by the function above if the user elects to save.
		if (pr)
		{
			if (Components.interfaces.nsIPasswordManagerInternal &&
			 manager instanceof Components.interfaces.nsIPasswordManagerInternal)
			{
				// Firefox <= 3.0 (i.e., 2.0)
			if (checkValue.value)
			{
				// save in Password Manager, irrespective of length...
					manager.addUser(realm, userin, pass.value);
			}
			else
			{
					// remove from password manager
				try
				{
						manager.removeUser(realm, userin);
				}
				catch (e)
				{
					// ignore
				}
			}
			}
			else if (Components.interfaces.nsILoginManager &&
			 manager instanceof Components.interfaces.nsILoginManager)
			{
				var nsLoginInfo = new Components.Constructor("@mozilla.org/login-manager/loginInfo;1",
         Components.interfaces.nsILoginInfo, "init");
				if (checkValue.value)
				{
					if (particularlogin) manager.removeLogin(particularlogin);
					var newlogin = new nsLoginInfo(realm, realm, null, userin, pass.value, "", "");
					manager.addLogin(newlogin);
				}
				else if (particularlogin) // checkValue.value is false here.
				{
					// try to remove from password manager
					manager.removeLogin(particularlogin);
				}
				else
				{
					var logins2remove = manager.findLogins({}, realm, realm, null);
					for (var loginsctr = 0; loginsctr < logins2remove.length; loginsctr++)
					{
						if (logins2remove[i].username == username)
						{
							manager.removeLogin(logins2remove[i]);
							break;
						}
					}
				}
			}

			return pass.value;	// this could be empty...
		}
		else
		{
			return null;
		}
	}
} // end smtpSeparatePassword

// note that there is no return code because this is a mere callback
FireGPG.Mime.GmailMimeSender.prototype.ourSent = function(msgs, err, prefs)
{

	try
	{
		if (msgs == null || typeof(msgs) != "object") return;
		var result = true;

		// delete content so we can discard
		/**
		 * shorthand for this.form
		 */
		const f = this.form;
		var composing = ((f.className.split(" "))[1] == "cn");

		for (var i = 0; i < msgs.length; i++)
		{
			if (msgs[i].sent != true)
			{
				// false case: there has been some failure
				// TODO: make pretty, localized error message.
				if (err)
				{
					if (err.substring(0, 3) == "535")
					{
						var p = Components.classes['@mozilla.org/network/default-prompt;1'].
							getService(Components.interfaces.nsIPrompt);
						var checkValue = { value: false };
						var r = p.confirmEx(this.i18n.getString("Badpassword"),
                                            this.i18n.getString("Enternewpassword")
											,
											(p.BUTTON_POS_0*p.BUTTON_TITLE_YES)+(p.BUTTON_POS_1*p.BUTTON_TITLE_NO),
											null,null,null,null,checkValue);
						if (r == 0)
						{
							// retry again. delete password. we are going to use an alternate password from here on out, so...
							var userin = typeof(this.smtpUsername) == "function" ? this.smtpUsername() : this.smtpUsername;
							var realm = this.getRealm();
							try
							{
								var manager;
								if (manager = Components.classes['@mozilla.org/passwordmanager;1'])
								{
									manager.getService(Components.interfaces.nsIPasswordManager).removeUser(realm, userin);
								}
								else if (manager = Components.classes['@mozilla.org/login-manager;1'])
								{
									manager = manager.getService(Components.interfaces.nsILoginManager);
									var logins2remove = manager.findLogins({}, realm, realm, null);
									for (var loginsctr = 0; loginsctr < logins2remove.length; loginsctr++)
									{
										if (logins2remove[i].username == userin)
										{
											manager.removeLogin(logins2remove[i]);
											break;
										}
									}
								}
							}
							catch (e)
							{
								// ignore
							}
							this.smtpPassword = this.smtpSeparatePassword;
							msgs[i].sent = null;
							// we know that i == 0 here.
							this.smtpSend(msgs);	// no one's listening, so we don't need to return a value
							return;
						}
					}
					else
					{
						alert(this.i18n.getString("SmtpError") + "\n" + err); //HARDCODED
					}
				}
				else
				{
					FireGPG.debug ("Internal error while sending mail...", "Gmail-mime-send-oursend", true);
				}


				FireGPG.cGmail2.setProgressMessage( this.form, null);
				return;
			}
		}
		// all messages sent successfully

		function el(name)
		{
			return f.elements.namedItem(name);
		}
		el("to").value = "";
		el("cc").value = "";
		el("bcc").value = "";
		el("subject").value = "";
		el("body").value = "";
		// TODO: HTML case.
		// delete files. Find all span removes, and examine them.
		var d = f.ownerDocument;	// shorthand


        if (false && !this.statusMessage && !this.hasobod) // don't close for cases where the original body is present.
        {
            // overriding onbeforeunload has no effect; they are called independently and e.stopPropagation() will not work.
            var topwin = d.defaultView.top;
            // this is not hardcoded because it should not be visible at all.
            topwin.document.documentElement.innerHTML="<head><title>FireGPG is destroying the window&hellip;" +
             "</title></head><body>Destroying&hellip;</body>";
            topwin.close(); // aka window.close()
            // 0.3.2: note that setProgressMessage may be operating on a null window.
        }
        else {



               function changeStatusMessage(e)
                {
                    var messageTd = this.ownerDocument.evaluate(".//td[@class='vh']", this, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//						printAncestors("DOMAttrModified", e.target);
//						jsdump("ChangeStatusMessage executing...");
                    if (this.style.visibility != "hidden")
                    {
//							jsdump("ChangeStatusMessage activated!");
                        this.removeEventListener("DOMAttrModified", changeStatusMessage, false);
                        // set the bottom of the message stack, as appropriate
                        var msgs = this.ownerDocument.evaluate(".//div[contains(@class, 'diLZtc')]//table/tr/td[contains(@class, 'eWTfhb')]//div[contains(@class, 'aWL81')]/div[position()=2]", this.ownerDocument.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (!msgs || true) messageTd.innerHTML = FireGPG.cGmail2.i18n.getString("MessageSend");
                        else
                        { /*
//							jsdump("Doing tha alternative");
                            messageTd.innerHTML = "Doop!!";
                            this.style.visibility = "hidden";
                            var newmsgdiv = this.ownerDocument.createElement("div");
                            newmsgdiv.className = "XoqCub";
                            newmsgdiv.setAttribute("style", "");
                            msgs.appendChild(newmsgdiv);
                            newmsgdiv.innerHTML = '<div class="b8" style=""><table cellspacing="0" cellpadding="0" class="cf ve"><tbody><tr><td class="EGPikb" style="background-position: 0px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/><td class="Ptde9b"/><td class="EGPikb" style="background-position: -4px 0px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/></tr><tr><td class="Ptde9b"/><td class="m14Grb">' +
FireGPG.cGmail2.i18n.getString("MessageSend") + '</td><td class="Ptde9b"/></tr><tr><td class="EGPikb" style="background-position: 0px -4px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/><td class="Ptde9b"/><td class="EGPikb" style="background-position: -4px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/></tr></tbody></table></div>';


//                            newmsgdiv.innerHTML = '<div class="n38jzf" style=""><table cellspacing="0" cellpadding="0" class="cyVRte"><tbody><tr><td class="EGPikb" style="background-position: 0px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/><td class="Ptde9b"/><td class="EGPikb" style="background-position: -4px 0px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/></tr><tr><td class="Ptde9b"/><td class="m14Grb">' +
//FireGPG.cGmail2.i18n.getString("MessageSend") + '</td><td class="Ptde9b"/></tr><tr><td class="EGPikb" style="background-position: 0px -4px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/><td class="Ptde9b"/><td class="EGPikb" style="background-position: -4px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/></tr></tbody></table></div>';

                            function removeNote(e)
                            {
                                this.removeEventListener("DOMNodeInserted", removeNote, false);
                                this.removeChild(newmsgdiv);
                            }
                            msgs.addEventListener("DOMNodeInserted", removeNote, false);
                        */}
                    }
//					}
            }
            // DEPRECATED: this.statusMessage.statusDiv. It is BAD when sending a reply that is non-encrypted, followed by an encrypted reply.
            // 0.3.2: removed: div[@class='fgrX7c']//div[@class='IY0d9c']/div[contains(@class, 'EGSDee')]/
            var sD = d.evaluate(".//div/div[contains(@class,'b8')]", d.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//				printAncestors("statusDiv", sD);
            FireGPG.cGmail2.i18n = this.i18n;
            sD.addEventListener("DOMAttrModified", changeStatusMessage, false);
//				sD.addEventListener("DOMNodeInserted", function (e) {printAncestors("Inserted! ", e.target); }, false);
//				sD.addEventListener("DOMNodeRemoved", function (e) {printAncestors("Removed! ", e.target); }, false);

            var discardevent=d.createEvent("MouseEvents");
            discardevent.initMouseEvent("mousedown", true, true, d.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            var discardcanceled = this.discardButton.dispatchEvent(discardevent);
            var discardevent=d.createEvent("MouseEvents");
            discardevent.initMouseEvent("mouseup", true, true, d.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            var discardcanceled = this.discardButton.dispatchEvent(discardevent);


            //FireGPG :
            //doesn't seem to work for reply insides mail : our method
            divs = d.getElementsByClassName('nH', 'div');
            for (var i=0;i<divs.length;i++) {

                if (divs[i].firstChild && divs[i].firstChild.className == "b8") {

                    tds = divs[i].getElementsByClassName('vh', 'td');
                    tds[0].innerHTML = this.i18n.getString("MessageSend");

                }

            }


        }


	}
	catch (e)
	{
		FireGPG.debug(e, "mime / ourSent", true);
		debugger;
	}
	FireGPG.cGmail2.setProgressMessage(f, null);
}; // end ourSent