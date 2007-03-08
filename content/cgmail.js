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

/*function cGmailNeedAction(e)
{

	if (e.target.id == "sndcrypt")	
	{

		alert('Tu veut me faire du mal hein ? Méchant !');
		
	}	

} */



const STATE_START = Components.interfaces.nsIWebProgressListener.STATE_START;
const STATE_STOP = Components.interfaces.nsIWebProgressListener.STATE_STOP;

var cGmailListener = {
  QueryInterface: function(aIID)
  {
   if (aIID.equals(Components.interfaces.nsIWebProgressListener) ||
       aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
       aIID.equals(Components.interfaces.nsISupports))
     return this;
   throw Components.results.NS_NOINTERFACE;
  },

  onStateChange: function(aProgress, aRequest, aFlag, aStatus)
  {
   
    if(aFlag & STATE_STOP) //If a document's loading end
	   {
	    		if (aProgress.DOMWindow.document.getElementById('msg_0') != null) //If it's a page with a gmail's message
			{
				cGmail.lastDomToverify = aProgress.DOMWindow;
				setTimeout("cGmail.onDelayLoad()",1000);
			}
	   }
   return 0;
  },

  //For be a good listener
  onLocationChange: function(aProgress, aRequest, aURI) {return 0;},
  onProgressChange: function() {return 0;},
  onStatusChange: function() {return 0;},
  onSecurityChange: function() {return 0;},
  onLinkIconAvailable: function() {return 0;}
}

var cGmail =
{
  

  onDelayLoad: function() {

	
	
	for (var i = 0; i < this.LastNombreMail; i++) {
		if (this.lastDomToverify.document.getElementById('rc_' + i) != null)
		{
			//13 Childs !!					
			var replyBox = this.lastDomToverify.document.getElementById('rc_' + i).firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild;	
			if (this.lastDomToverify.document.getElementById('rc_' + i).hasAttribute("gpg") == false)
			{
				
				var contenuMail = this.lastDomToverify.document.getElementById('mb_' + i).innerHTML;

				var td = this.lastDomToverify.document.createElement("td");
				
				td.setAttribute("class","");
				td.setAttribute("id","sm_verify");
				
				//For I18N
				var i18n = document.getElementById("firegpg-strings");

				td.setAttribute("style","color: green;");
				td.innerHTML = i18n.getString("GMailSOK"); //"La première signature de ce mail est de testtest (testtest) testtset@testtest.testtset";

				td.setAttribute("style","color: orange;");
				td.innerHTML = i18n.getString("GMailNoS"); //"Aucun signature n'a été trouvé dans ce mail.";

				td.setAttribute("style","color: red;");
				td.innerHTML = i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";

				td.setAttribute("style","color: orange;");
				td.innerHTML = i18n.getString("GMailD"); //"Aucun signature n'a été trouvé dans ce mail.";


				replyBox.appendChild(td);	
		
				this.lastDomToverify.document.getElementById('rc_' + i).setAttribute("gpg","ok");
			}
		}

		if (this.lastDomToverify.document.getElementById('nc_' + i) != null)
		{
			if (this.lastDomToverify.document.getElementById('nc_' + i).hasAttribute("gpg") == false)
			{
				var boutonBox = this.lastDomToverify.document.getElementById('nc_' + i).parentNode;	
				this.addComposeBoutons(boutonBox,this.lastDomToverify.document);
				this.lastDomToverify.document.getElementById('nc_' + i).setAttribute("gpg","ok");
			}
		}

		if (this.lastDomToverify.document.getElementById('sb_' + i) != null)
		{
			if (this.lastDomToverify.document.getElementById('sb_' + i).hasAttribute("gpg") == false)
			{
				var boutonBox = this.lastDomToverify.document.getElementById('sb_' + i).firstChild.firstChild.firstChild.firstChild.firstChild;	
				this.addComposeBoutons(boutonBox,this.lastDomToverify.document);
				this.lastDomToverify.document.getElementById('sb_' + i).setAttribute("gpg","ok");
			}
		}
	}
  },
  

  simpleLoad: function(e) {

	var Ddocument = e.target.defaultView.wrappedJSObject.document;

	if (Ddocument.getElementById('msg_0') != null)
	{
		for (var i = 0; i < 200; i++) {
			if (Ddocument.getElementById('msg_' + i) == null)
			{ 
				this.LastNombreMail = i;
				break;
			}
		}
	}
	if (Ddocument.getElementById('sb_compose') != null)
	{

		var boutonBox = Ddocument.getElementById('sb_compose').firstChild;	
		this.addComposeBoutons(boutonBox,Ddocument);
	}
	if (Ddocument.getElementById('nc_compose') != null)
	{
		var boutonBox = Ddocument.getElementById('nc_compose').parentNode;	
		this.addComposeBoutons(boutonBox,Ddocument);
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

	if (usegmail == true)
	{
		document.getElementById("appcontent").addEventListener("DOMContentLoaded", cGmail.listenerLoad, false);
		window.addEventListener("unload", function() {cGmail.listenerUnload()}, false);
	}
  },

  addBouton: function(label,id,box,Ddocument)
  {

	var bouton = Ddocument.createElement("button");
	
	bouton.setAttribute("type","button");
	bouton.setAttribute("tabindex","8");
	bouton.setAttribute ("style","padding: 0pt 1em;");
	bouton.setAttribute("id",id);
				
	bouton.innerHTML = label;

	try {

		box.innerHTML = box.innerHTML + " &nbsp;";

		box.appendChild(bouton);

	} catch (e) { }

	

//	bouton.addEventListener('command',cgmail.bla,false);
  },

 addComposeBoutons: function(box,Ddocument)
 {
	//For I18N
	var i18n = document.getElementById("firegpg-strings");

	this.addBouton(i18n.getString("GMailS"),"sign",box,Ddocument);	
	this.addBouton(i18n.getString("GMailSS"),"sndsign",box,Ddocument);
	this.addBouton(i18n.getString("GMailC"),"cypt",box,Ddocument);	
	this.addBouton(i18n.getString("GMailCS"),"sndcyrpt",box,Ddocument);	
 },

  listenerLoad: function(e) {

	var urlPage = e.target.defaultView.wrappedJSObject.location.host;
	
	if (urlPage.indexOf('mail.google.com') != -1)
	{
		cGmail.simpleLoad(e);

		gBrowser.addProgressListener(cGmailListener,
			  Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
		
        }
  },

  listenerUnload: function() {

	gBrowser.removeProgressListener(cGmailListener);

  }
}
