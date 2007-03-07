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

var cGmail = {
  needAction: function(evt) {
    alert("Reçu depuis la page Web :");
  }
}

var LastNombreMail;

function cGmailNeedAction(e)
{

	if (e.target.id == "sndcrypt")	
	{

		alert('Tu veut me faire du mal hein ? Méchant !');
		
	}	

}

//document.addEventListener("cGmailNeedAction", cGmailNeedAction, false, true);

function cGmailTest(e)
{

	var Ddocument = e.target.defaultView.wrappedJSObject.document;
	var urlPage = e.target.defaultView.wrappedJSObject.location.host;
	
	if (urlPage.indexOf('mail.google.com') != -1)
	{
		
		if (Ddocument.getElementById('msg_0') != null)
		{
			
			for (var i = 0; i < 200; i++) {
				if (Ddocument.getElementById('msg_' + i) == null)
				{
					LastNombreMail = i;
					
					break;
				}
			}
			
		}


		for (var i2 = 0; i2 < LastNombreMail; i2++) {
				

				if (Ddocument.getElementById('rc_' + i2) != null)
				{
								
					//13 Childs !!					
					var replyBox = Ddocument.getElementById('rc_' + i2).firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild.firstChild;	
					
					var td = Ddocument.createElement("td");
			
					td.setAttribute("class","");
					td.setAttribute("id","sm_verify");
						
					td.innerHTML = "Me touche pas !";

					replyBox.appendChild(td);	

					td.addEventListener('click',cGmailNeedAction,false);
					
				}
			}
		

		if (Ddocument.getElementById('sb_compose') != null)
		{

			alert('ADDING');
			var boutonBox = Ddocument.getElementById('sb_compose').firstChild;	

			
			var bouton = Ddocument.createElement("button");
			
			bouton.setAttribute("type","button");
			bouton.setAttribute("tabindex","8");
			bouton.setAttribute ("style","padding: 0pt 1em;");
			bouton.setAttribute("id","sndcrypt");
			//bouton.setAttribute("onclick","cGmailNeedAction()");
			
			bouton.setAttribute("label","sndcrypt");
			
			bouton.innerHTML = "Me touche pas !";

			boutonBox.innerHTML = boutonBox.innerHTML + " &nbsp;";

			boutonBox.appendChild(bouton);	

			bouton.addEventListener('click',cGmailNeedAction,false);

		}

	}

}

function cGmailInit()
{

	document.getElementById("appcontent").addEventListener("DOMContentLoaded", cGmailTest, false);


}
