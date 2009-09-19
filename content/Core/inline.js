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

The Initial Developer of this part of the Original Code is Ryan Patterson.

Portions created by the Initial Developer are Copyright (C) 2007
the Initial Developer. All Rights Reserved.

Contributor(s): Maximilien Cuony

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

var FireGPGInline = { };

/*
   Constants: Tags of PGP's blocks

   FireGPGInline.Tags.PgpBlockStart - Start of a PGP block
   FireGPGInline.Tags.KeyStart - Start of a PGP key
   FireGPGInline.Tags.KeyEnd - End of a PGP key
   FireGPGInline.Tags.PrivateKeyStart - Start of a PGP private key
   FireGPGInline.Tags.PrivateKeyEnd - End of a PGP private key
   FireGPGInline.Tags.SignedMessageStart - Start of a signed message
   FireGPGInline.Tags.SignatureStart - Start of a sign
   FireGPGInline.Tags.SignatureEnd - End of a sign
   FireGPGInline.Tags.EncryptedMessageStart - Start of an encrypted message
   FireGPGInline.Tags.EncryptedMessageEnd - End of an encrypted message


*/
FireGPGInline.Tags = {
    PgpBlockStart: "-----BEGIN PGP",
	KeyStart: "-----BEGIN PGP PUBLIC KEY BLOCK-----",
	KeyEnd: "-----END PGP PUBLIC KEY BLOCK-----",
	PrivateKeyStart: "-----BEGIN PGP PRIVATE KEY BLOCK-----",
	PrivateKeyEnd: "-----END PGP PRIVATE KEY BLOCK-----",
	SignedMessageStart: "-----BEGIN PGP SIGNED MESSAGE-----",
	SignatureStart: "-----BEGIN PGP SIGNATURE-----",
	SignatureEnd: "-----END PGP SIGNATURE-----",
	EncryptedMessageStart: "-----BEGIN PGP MESSAGE-----",
	EncryptedMessageEnd: "-----END PGP MESSAGE-----",
};

/*
   Constants: Types of blocks

   FireGPGInline.KEY_BLOCK - It's a key block
   FireGPGInline.PRIVATE_KEY_BLOCK - It's a private key block
   FireGPGInline.SIGN_BLOCK    - It's a sign block
   FireGPGInline.MESSAGE_BLOCK   - It's a message block
*/
FireGPGInline.KEY_BLOCK = 1;
FireGPGInline.PRIVATE_KEY_BLOCK = 2;
FireGPGInline.SIGN_BLOCK = 3;
FireGPGInline.MESSAGE_BLOCK = 4;


/*
   Class: FireGPGInline
   This class a system to detect and manage PGP block found in pages
*/

/*
    Function: HandleBlock
    This function build a secure iframe for a PGP's block, and add listeners for actions on this block

    Parameters:
        document - The current document
        range - A range with the PGP  block selected
        blockType - The type of block, see <Types of blocs>
*/
FireGPGInline.HandleBlock = function(document, range, blockType) {

    var i18n = document.getElementById("firegpg-strings");

	// Get content, remove whitespace from beginning of the lines.

    var s = new XMLSerializer();
	var d = range.cloneContents();
	var str = s.serializeToString(d);

    var content = Selection.wash(str);

    var fragment = range.extractContents();

	// We use an iframe to prevent the owning page from accessing potentially
	// private information (contents of encrypted message).
	var frame = document.createElement("iframe");
	range.insertNode(frame);
	frame.contentWindow.location.href = "chrome://firegpg/skin/block.xml";
	frame.style.border = "0px";
	frame.style.width = "100%";

	frame.addEventListener("load", function() {

		var block = {
			body: frame.contentDocument.getElementsByTagName("body")[0],
			header: frame.contentDocument.getElementById("header"),
			output: frame.contentDocument.getElementById("output"),
			message: frame.contentDocument.getElementById("message"),
			action: frame.contentDocument.getElementById("action"),
			original: frame.contentDocument.getElementById("original")
		}

        frame.contentDocument.getElementById("toggle-original").textContent = FireGPGInline.i18n.getString("show-original")

		// Universal set up
		block.original.textContent = content;

        frame.contentDocument.getElementById("toggle-original").addEventListener("click", function() {
			var style = block.original.style;
			if(style.display == "block") {
				style.display = "none";
                this.textContent = FireGPGInline.i18n.getString("show-original");
            }
			else {
				style.display = "block";
                this.textContent = FireGPGInline.i18n.getString("hide-original");
            }
            frame.style.width = block.body.scrollWidth + "px";
			frame.style.height = block.body.scrollHeight + "px";
		}, false);


        frame.contentDocument.getElementById("switch-direction").textContent = FireGPGInline.i18n.getString("switchdirection")
        frame.contentDocument.getElementById("switch-direction").addEventListener("click", function() {
			var style = block.original.style;
			if(style.direction == "rtl") {
				style.direction = "ltr";
                block.message.style.direction = "ltr";
            }
			else {
				style.direction = "rtl";
                block.message.style.direction = "rtl";
            }

		}, false);


		var actionHandler = function() {
			switch(blockType) {
				case FireGPGInline.KEY_BLOCK:
					FireGPGInline.ImportKey(block.original.textContent, block);
					break;
				case FireGPGInline.PRIVATE_KEY_BLOCK:
					block.body.className = "failure";
                    block.output.style.display = "block";
                    block.output.textContent = FireGPGInline.i18n.getString("private-key-block-message").replace(/\. /g, ".\n");
					break;
				case FireGPGInline.SIGN_BLOCK:
					FireGPGInline.VerifySignature(block.original.textContent, block);
					break;
				case FireGPGInline.MESSAGE_BLOCK:
					FireGPGInline.DecryptMessage(block.original.textContent, block);
					break;
			}
            frame.style.width = block.body.scrollWidth + "px";
			frame.style.height = block.body.scrollHeight + "px";

		};
		block.action.addEventListener("click", actionHandler, false);

		switch(blockType) {
			case FireGPGInline.KEY_BLOCK:
				block.body.className = "information";
				block.header.textContent = FireGPGInline.i18n.getString("key-block");
				block.action.textContent = FireGPGInline.i18n.getString("import");
				break;
			case FireGPGInline.PRIVATE_KEY_BLOCK:
				block.body.className = "information";
				block.header.textContent = FireGPGInline.i18n.getString("private-key-block");
				block.action.textContent = FireGPGInline.i18n.getString("import");
				break;
			case FireGPGInline.SIGN_BLOCK:
				block.body.className = "caution";
				block.header.textContent = FireGPGInline.i18n.getString("signed-message")  + ", " + FireGPGInline.i18n.getString("unverified");
				block.action.textContent = FireGPGInline.i18n.getString("verify");
				// Extract the message without the header and signature
				block.message.innerHTML = content.substring(content.indexOf("\n\n") + 2, content.indexOf(FireGPGInline.Tags.SignatureStart)).replace(/</gi,"&lt;").replace(/>/gi,"&gt;").replace(/\n/gi,"<br />");
				break;
			case FireGPGInline.MESSAGE_BLOCK:
				block.body.className = "caution";
				block.header.textContent = FireGPGInline.i18n.getString("encrypted-message") ;
				block.action.textContent = FireGPGInline.i18n.getString("decrypt");
				break;
		}

		// Make sure that the block has nonzero size before resizing the frame:
		frame.resize = function(self, content) {
		    if(content.body.scrollWidth != 0 && content.body.scrollHeight != 0) {

                if (content.body.scrollWidth > 50)
                    width = content.body.scrollWidth;
                else
                    width = 50;

                 if (content.body.scrollHeight > 50)
                    height = content.body.scrollHeight;
                else
                    height = 50;

                self.style.width = width + "px";
                self.style.height = height + "px";
		    } else {
			// Wait 100ms and try again:
                self.try += 1;
                if (self.try < 20)
                    setTimeout(self.resize, 100, self, content);
		    }
		}

        frame.try = 0;
		frame.resize(frame, block);

        frame.contentDocument.addEventListener("mouseover", FireGPGInline.mouseOverTrusted, false);
        frame.contentDocument.addEventListener("mouseout", FireGPGInline.mouseOutTrusted, false);
        frame.contentDocument.getElementById('trusted-confirm').title = FireGPGInline.i18n.getString("trusted-block") ;

	}, false);
};

/*
    Function: HandlePage
    This function parse a page to find PGP's block.

    Parameters:
        document - The current document

*/
FireGPGInline.HandlePage = function(document) {

	var filter = function(node) {
		return NodeFilter.FILTER_ACCEPT;
	};

	var haveStart = false;
	var blockType;
	var tw = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, filter, false);
	var node, range, idx, search, baseIdx;
	while((node = tw.nextNode())) {
		idx = 0;
		while(true) {
			if(!haveStart) {

                if (node.textContent.indexOf(FireGPGInline.Tags.PgpBlockStart, idx) == -1)
                    break;

                if (node.parentNode && node.parentNode.nodeName == 'TEXTAREA')
                    break;
                if (node.parentNode && node.parentNode.nodeName == 'PRE')

                if (node.parentNode && node.parentNode.nodeName == 'PRE' && node.parentNode.parentNode && node.parentNode.parentNode.parentNode  && typeof node.parentNode.parentNode.parentNode.getAttribute == 'function' && node.parentNode.parentNode.parentNode.getAttribute('id') == 'storeArea') {
                    //Hum, it's seem we're on a TidyWiki...

                    var topwinjs = node.ownerDocument.defaultView.parent.wrappedJSObject;
                    if ("version" in topwinjs && topwinjs.version.title == "TiddlyWiki")
                        break; //We are, so we stop
                }

                baseIdx = idx;
				idx = node.textContent.indexOf(FireGPGInline.Tags.KeyStart, baseIdx);
                blockType = FireGPGInline.KEY_BLOCK;
				search = FireGPGInline.Tags.KeyEnd;
				if(idx == -1) {
					idx = node.textContent.indexOf(FireGPGInline.Tags.SignedMessageStart, baseIdx);
					search = FireGPGInline.Tags.SignatureEnd;
                    blockType = FireGPGInline.SIGN_BLOCK;
				}
				if(idx == -1) {
					idx = node.textContent.indexOf(FireGPGInline.Tags.EncryptedMessageStart, baseIdx);
					search = FireGPGInline.Tags.EncryptedMessageEnd;
                    blockType = FireGPGInline.MESSAGE_BLOCK;
				}
				if(idx == -1) {
					idx = node.textContent.indexOf(FireGPGInline.Tags.PrivateKeyStart, baseIdx);
					blockType = FireGPGInline.PRIVATE_KEY_BLOCK;
					search = FireGPGInline.Tags.PrivateKeyEnd;
				}

				if(idx == -1)
                    break;

				haveStart = true;
				range = document.createRange();
				range.setStart(node, idx);
				idx += 6;
			}
			if(haveStart) {

                tryOne = node.textContent.indexOf(search, idx);

                if(tryOne == -1)
					break;

				idx = node.textContent.indexOf(search, this.ignoreInners(idx,tryOne,node.textContent));

                if(idx == -1) {
					break;
				}

                haveStart = false;
				range.setEnd(node, idx + search.length);
				FireGPGInline.HandleBlock(document, range, blockType);
				range.detach();
				idx =0; //+= search.length;
			}
		}

	}

};

/*
    Function: ignoreInners
    This is a function for .<HandlePage>, who try to avoid detection of PGP block into PGP blocks

    Parameters:
        idx - The current position of the block detection
        end - The last position of the block detected
        node - The node where we works

*/
FireGPGInline.ignoreInners = function(idx, end,node) {

        if  (end == -1)
            return -1;


        baseIdx = idx;
        idx = node.indexOf(FireGPGInline.Tags.KeyStart, baseIdx);
        search = FireGPGInline.Tags.KeyEnd;
        if(idx == -1) {
            idx = node.indexOf(FireGPGInline.Tags.SignedMessageStart, baseIdx);
            search = FireGPGInline.Tags.SignatureEnd;
        }
        if(idx == -1) {
            idx = node.indexOf(FireGPGInline.Tags.EncryptedMessageStart, baseIdx);
            search = FireGPGInline.Tags.EncryptedMessageEnd;
        }

        if(idx == -1 || idx > end)
            return end;

        return node.indexOf(search,
                this.ignoreInners(idx + 6,node.indexOf(search,idx + 6),node)
                ) + 6;


}

/*
    Function: ImportKey
    This is the function called when the user click on "Import" for a PGP's key block

    Parameters:
        content - The PGP data.
        block - The block who contain the iframe

*/
FireGPGInline.ImportKey = function(content, block) {

    result = FireGPG.kimport(true,content);

	block.output.style.display = "block";
    block.output.textContent = result.messagetext;

	if(result.result == FireGPGResults.SUCCESS)
		block.body.className = "ok";
	else
		block.body.className = "failure";

};

/*
    Function: VerifySignature
    This is the function called when the user click on "Verify" for a PGP's signed message block

    Parameters:
        content - The PGP data.
        block - The block who contain the iframe

*/
FireGPGInline.VerifySignature = function(content, block) {

    var i18n = document.getElementById("firegpg-strings");

    resultTest = FireGPG.verify(true,content);



    if (resultTest.signresult == FireGPGResults.SUCCESS) {
        block.body.className = "ok";
        block.header.textContent = i18n.getString("signed-message") + ", " + resultTest.signsresulttext;
    }
    else if (resultTest.signresult == FireGPGResults.ERROR_BAD_SIGN) {
        block.body.className = "failure";
        block.header.textContent = i18n.getString("signed-message") + ", " + i18n.getString("verifFailedFalse");
    }
    else if (resultTest.signresult == FireGPGResults.ERROR_NO_KEY) {
        block.body.className = "failure";
        block.header.textContent = i18n.getString("signed-message") + ", " + i18n.getString("verifFailedUnknownKey") ;
    }
    else {
        block.body.className = "failure";
        block.header.textContent = i18n.getString("signed-message") + ", " +i18n.getString("verifFailedGeneral");
    }

};

/*
    Function: DecryptMessage
    This is the function called when the user click on "Decrypt" for a PGP's encrypted message block

    Parameters:
        content - The PGP data.
        block - The block who contain the iframe

*/
FireGPGInline.DecryptMessage = function(content, block) {

    var i18n = document.getElementById("firegpg-strings");

    var result = FireGPG.decrypt(true,content);

    if (result.result == FireGPGResults.SUCCESS) {

        block.body.className = "ok";
        block.message.textContent = result.decrypted;


        if (result.notEncrypted) {

              if (result.signresulttext)
                block.header.textContent = i18n.getString("notencrypted-message") + ", " + i18n.getString("validSignInCrypt") + " " + result.signresulttext;
            else
                block.header.textContent = i18n.getString("notencrypted-message")



        } else {

            if (result.signresulttext)
                block.header.textContent = i18n.getString("encrypted-message") + ", " + i18n.getString("validSignInCrypt") + " " + result.signresulttext;

        }



    } else if (result.result == FireGPGResults.ERROR_PASSWORD) {

        block.body.className = "failure";
        block.header.textContent = i18n.getString("encrypted-message") + ", " + result.messagetext;

    } else {

        block.body.className = "failure";
        block.output.style.display = "block";
        block.output.textContent = FireGPGMisc.trim(result.messagetext);

    }

};

/*
    Function: onPageLoad
    This function is called when a page is loaded

    Parameters:
        aEvent - The event of the loading

*/
FireGPGInline.onPageLoad = function(aEvent) {

    var doc = aEvent.originalTarget;

    if(doc.nodeName != "#document")
        return;

    if (document.getElementById('firegpg-statusbar-trusted-content')) {
        document.getElementById('firegpg-statusbar-trusted-content').style.display = 'none';
    }

	// Don't handle chrome pages
	if(doc.location.protocol == "chrome:")
		return;

    if (!FireGPGInline.canIBeExecutedHere(doc.location))
        return;

    FireGPGInline.HandlePage(doc);
};

/*
    Function: initSystem
    This function is called by FireGPG when a new Firefox's windows is created.

*/
FireGPGInline.initSystem = function() {

        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	                           getService(Components.interfaces.nsIPrefService);

    prefs = prefs.getBranch("extensions.firegpg.");
    try {
        activate = prefs.getBoolPref("activate_inline");
    } catch (e) {
        activate = true;
    }

    FireGPGInline.activate = activate;


    try {
        if (document.getElementById("appcontent"))
            document.getElementById("appcontent").addEventListener("DOMContentLoaded", FireGPGInline.onPageLoad, false);
        else
            document.getElementById("browser_content").addEventListener("DOMContentLoaded", FireGPGInline.onPageLoad, false);

    } catch (e) {  fireGPGDebug(e,'keyring.initSystem',true);  }

    FireGPGInline.i18n = document.getElementById("firegpg-strings");
};

/*
	Function: mouseOverTrusted
	Function called when the mouse is over a trusted block

	Parameters:
		aEvent - The mouse over event
*/
FireGPGInline.mouseOverTrusted = function(aEvent) {

    if (!document.getElementById('firegpg-statusbar-trusted-content'))
        return;

    var randId = '';

    validchars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

    for (var i = 0; i < 4; i++)
        randId += validchars.charAt( Math.floor( Math.random() * validchars.length ) );

    aEvent.target.ownerDocument.getElementById('trusted-confirm').innerHTML = randId;

    document.getElementById('firegpg-statusbar-trusted-content').value = randId;
    document.getElementById('firegpg-statusbar-trusted-content').style.display = '';

}

/*
	Function: mouseOutTrusted
	Function called when a mouse is outside a trusted block

	Parameters:
		aEvent - The mouseout event
*/
FireGPGInline.mouseOutTrusted = function(aEvent) {


    if (!document.getElementById('firegpg-statusbar-trusted-content'))
        return;

    aEvent.target.ownerDocument.getElementById('trusted-confirm').innerHTML = '';

    document.getElementById('firegpg-statusbar-trusted-content').style.display = 'none';

}

/*
	Function: canIBeExecutedHere
	Return true if we should handle pgp blocks on a page
	First, we use preferences for page, then domains, then global.

	Parameters:
		aUrl - The url of the page
*/
FireGPGInline.canIBeExecutedHere = function(aUrl) {

    page = FireGPGInline.pageStatus(aUrl);

    if (page == 'ON')
        return true;

    if (page == 'OFF')
        return false;

    site = FireGPGInline.siteStatus(aUrl);

    if (site == 'ON')
        return true;

    if (site == 'OFF')
        return false;

    return FireGPGInline.activate;

}

/*
	Function: siteStatus
	Return 'OFF' if we shouln't handle block on the domain, 'ON' if we should, '' if user don't case

	Parameters:
		aUrl - The url of the page
*/
FireGPGInline.siteStatus = function(aUrl) {

    try {

        if (aUrl.host.indexOf("mail.google.com") != -1) //Forcé parqu'on handle de toutes façons
            return 'OFF';

        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                                   getService(Components.interfaces.nsIPrefService);

        prefs = prefs.getBranch("extensions.firegpg.");
        try {
            sites = prefs.getCharPref("inline_sites");
        } catch (e) {
            sites = '';
        }

        host = aUrl.href.replace(/,/gi, '~~~&'); //Just in case

        data = sites.split(',');

        for(var i = 0; i < data.length; i+=2) {

            if (data[i] == host) {
                return data[i+1];
            }

        }

        return '';
    } catch (e) {
		return '';
	}

}

/*
	Function: siteOn
	Activate the handiling of pgp block for a domain

	Parameters:
		aUrl - The url of the page
*/
FireGPGInline.siteOn = function(aUrl) {

    FireGPGInline.setSiteTo(aUrl, 'ON');

}

/*
	Function: siteOff
	Desactivate the handiling of pgp block for a domain

	Parameters:
		aUrl - The url of the page
*/
FireGPGInline.siteOff = function(aUrl) {

    FireGPGInline.setSiteTo(aUrl, 'OFF');

}

/*
	Function: setSiteTo
	Activate or desactivate the handiling of pgp block for a domain

	Parameters:
		aUrl - The url of the page
		value - ON to activate, OFF to desactive
*/
FireGPGInline.setSiteTo = function(aUrl, value) {

    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	                           getService(Components.interfaces.nsIPrefService);

    prefs = prefs.getBranch("extensions.firegpg.");
    try {
        sites = prefs.getCharPref("inline_sites");
    } catch (e) {
        sites = '';
    }

    host = aUrl.href.replace(/,/gi, '~~~&'); //Just in case

    data = sites.split(',');

    datas = new Array();

    for(var i = 0; i < data.length; i+=2) {
       datas[data[i]] = data[i+1];
    }

    if ( (value == 'ON' && !FireGPGInline.activate) || (value == 'OFF' && FireGPGInline.activate)) //Veut-on autre chose que le default ?
        datas[host] = value;
    else
        delete datas[host];

    option = '';

    for (host in datas) {
        if (host != undefined && datas[host] != undefined)
            option += host + "," + datas[host] + ",";
    }

    prefs.setCharPref("inline_sites",option);
}

/*
	Function: pageStatus
	Return 'OFF' if we shouln't handle block on the page, 'ON' if we should, '' if user don't case

	Parameters:
		aUrl - The url of the page
*/
FireGPGInline.pageStatus = function(aUrl) {


   if (FireGPGInline.siteTmpStats == undefined || FireGPGInline.siteTmpStats[aUrl.href] == undefined || FireGPGInline.siteTmpStats[aUrl.href] == '')
        return ''

    return FireGPGInline.siteTmpStats[aUrl.href] ;

}

/*
	Function: pageOn
	Activate the handiling of pgp block for a page

	Parameters:
		aUrl - The url of the page
*/
FireGPGInline.pageOn = function(aUrl) {

    if (FireGPGInline.siteTmpStats == undefined)
        FireGPGInline.siteTmpStats = new Array();

    if (!FireGPGInline.canIBeExecutedHere(aUrl))
        FireGPGInline.siteTmpStats[aUrl.href] = 'ON';
    else
        delete FireGPGInline.siteTmpStats[aUrl.href];

}

/*
	Function: pageOff
	Desactivate the handiling of pgp block for a page

	Parameters:
		aUrl - The url of the page
*/
FireGPGInline.pageOff = function(aUrl) {

    if (FireGPGInline.siteTmpStats == undefined)
        FireGPGInline.siteTmpStats = new Array();

    if (FireGPGInline.canIBeExecutedHere(aUrl))
        FireGPGInline.siteTmpStats[aUrl.href] = 'OFF';
    else
        delete FireGPGInline.siteTmpStats[aUrl.href];
}
