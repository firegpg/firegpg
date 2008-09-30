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
 * Contributor(s): Ryan Patterson for the base and the idea
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

var Keyring = { };

/*
   Constants: Tags of PGP's blocks

   Keyring.Tags.PgpBlockStart - Start of a PGP block
   Keyring.Tags.KeyStart - Start of a PGP key
   Keyring.Tags.KeyEnd - End of a PGP key
   Keyring.Tags.PrivateKeyStart - Start of a PGP private key
   Keyring.Tags.PrivateKeyEnd - End of a PGP private key
   Keyring.Tags.SignedMessageStart - Start of a signed message
   Keyring.Tags.SignatureStart - Start of a sign
   Keyring.Tags.SignatureEnd - End of a sign
   Keyring.Tags.EncryptedMessageStart - Start of an encrypted message
   Keyring.Tags.EncryptedMessageEnd - End of an encrypted message


*/
Keyring.Tags = {
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

   Keyring.KEY_BLOCK - It's a key block
   Keyring.PRIVATE_KEY_BLOCK - It's a private key block
   Keyring.SIGN_BLOCK    - It's a sign block
   Keyring.MESSAGE_BLOCK   - It's a message block
*/
Keyring.KEY_BLOCK = 1;
Keyring.PRIVATE_KEY_BLOCK = 2;
Keyring.SIGN_BLOCK = 3;
Keyring.MESSAGE_BLOCK = 4;


/*
   Class: Keyring
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
Keyring.HandleBlock = function(document, range, blockType) {

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

        frame.contentDocument.getElementById("toggle-original").textContent = Keyring.i18n.getString("show-original")

		// Universal set up
		block.original.textContent = content;
		frame.contentDocument.getElementById("toggle-original").addEventListener("click", function() {
			var style = block.original.style;
			if(style.display == "block") {
				style.display = "none";
                this.textContent = Keyring.i18n.getString("show-original");
            }
			else {
				style.display = "block";
                this.textContent = Keyring.i18n.getString("hide-original");
            }
            frame.style.width = block.body.scrollWidth + "px";
			frame.style.height = block.body.scrollHeight + "px";
		}, false);
		var actionHandler = function() {
			switch(blockType) {
				case Keyring.KEY_BLOCK:
					Keyring.ImportKey(block.original.textContent, block);
					break;
				case Keyring.PRIVATE_KEY_BLOCK:
					block.body.className = "failure";
                    block.output.style.display = "block";
                    block.output.textContent = Keyring.i18n.getString("private-key-block-message").replace(/\. /g, ".\n");
					break;
				case Keyring.SIGN_BLOCK:
					Keyring.VerifySignature(block.original.textContent, block);
					break;
				case Keyring.MESSAGE_BLOCK:
					Keyring.DecryptMessage(block.original.textContent, block);
					break;
			}
            frame.style.width = block.body.scrollWidth + "px";
			frame.style.height = block.body.scrollHeight + "px";

		};
		block.action.addEventListener("click", actionHandler, false);

		switch(blockType) {
			case Keyring.KEY_BLOCK:
				block.body.className = "information";
				block.header.textContent = Keyring.i18n.getString("key-block");
				block.action.textContent = Keyring.i18n.getString("import");
				break;
			case Keyring.PRIVATE_KEY_BLOCK:
				block.body.className = "information";
				block.header.textContent = Keyring.i18n.getString("private-key-block");
				block.action.textContent = Keyring.i18n.getString("import");
				break;
			case Keyring.SIGN_BLOCK:
				block.body.className = "caution";
				block.header.textContent = Keyring.i18n.getString("signed-message")  + ", " + Keyring.i18n.getString("unverified");
				block.action.textContent = Keyring.i18n.getString("verify");
				// Extract the message without the header and signature
				block.message.innerHTML = content.substring(content.indexOf("\n\n") + 2, content.indexOf(Keyring.Tags.SignatureStart)).replace(/</gi,"&lt;").replace(/>/gi,"&gt;").replace(/\n/gi,"<br />");
				break;
			case Keyring.MESSAGE_BLOCK:
				block.body.className = "caution";
				block.header.textContent = Keyring.i18n.getString("encrypted-message") ;
				block.action.textContent = Keyring.i18n.getString("decrypt");
				break;
		}
        frame.style.width = block.body.scrollWidth + "px";
		frame.style.height = block.body.scrollHeight + "px";
	}, false);
};

/*
    Function: HandlePage
    This function parse a page to find PGP's block.

    Parameters:
        document - The current document

*/
Keyring.HandlePage = function(document) {

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

                if (node.textContent.indexOf(Keyring.Tags.PgpBlockStart, idx) == -1)
                    break;

                if (node.parentNode.nodeName == 'TEXTAREA')
                    break;

                baseIdx = idx;
				idx = node.textContent.indexOf(Keyring.Tags.KeyStart, baseIdx);
                blockType = Keyring.KEY_BLOCK;
				search = Keyring.Tags.KeyEnd;
				if(idx == -1) {
					idx = node.textContent.indexOf(Keyring.Tags.SignedMessageStart, baseIdx);
					search = Keyring.Tags.SignatureEnd;
                    blockType = Keyring.SIGN_BLOCK;
				}
				if(idx == -1) {
					idx = node.textContent.indexOf(Keyring.Tags.EncryptedMessageStart, baseIdx);
					search = Keyring.Tags.EncryptedMessageEnd;
                    blockType = Keyring.MESSAGE_BLOCK;
				}
				if(idx == -1) {
					idx = node.textContent.indexOf(Keyring.Tags.PrivateKeyStart, baseIdx);
					blockType = Keyring.PRIVATE_KEY_BLOCK;
					search = Keyring.Tags.PrivateKeyEnd;
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
				Keyring.HandleBlock(document, range, blockType);
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
Keyring.ignoreInners = function(idx, end,node) {

        if  (end == -1)
            return -1;


        baseIdx = idx;
        idx = node.indexOf(Keyring.Tags.KeyStart, baseIdx);
        search = Keyring.Tags.KeyEnd;
        if(idx == -1) {
            idx = node.indexOf(Keyring.Tags.SignedMessageStart, baseIdx);
            search = Keyring.Tags.SignatureEnd;
        }
        if(idx == -1) {
            idx = node.indexOf(Keyring.Tags.EncryptedMessageStart, baseIdx);
            search = Keyring.Tags.EncryptedMessageEnd;
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
Keyring.ImportKey = function(content, block) {

    result = FireGPG.kimport(true,content);

	block.output.style.display = "block";
    block.output.textContent = result.messagetext;

	if(result.result == RESULT_SUCCESS)
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
Keyring.VerifySignature = function(content, block) {

    var i18n = document.getElementById("firegpg-strings");

    resultTest = FireGPG.verify(true,content);



    if (resultTest.signresult == RESULT_SUCCESS) {
        block.body.className = "ok";
        block.header.textContent = i18n.getString("signed-message") + ", " + i18n.getString("verifSuccess") + " " + resultTest.signresulttext;
    }
    else if (resultTest.signresult == RESULT_ERROR_BAD_SIGN) {
        block.body.className = "failure";
        block.header.textContent = i18n.getString("signed-message") + ", " + i18n.getString("verifFailedFalse");
    }
    else if (resultTest.signresult == RESULT_ERROR_NO_KEY) {
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
Keyring.DecryptMessage = function(content, block) {

    var i18n = document.getElementById("firegpg-strings");

    var result = FireGPG.decrypt(true,content);

    if (result.result == RESULT_SUCCESS) {

        block.body.className = "ok";
        block.message.textContent = result.decrypted;

        if (result.signresulttext)
            block.header.textContent = i18n.getString("encrypted-message") + ", " + i18n.getString("validSignInCrypt") + " " + result.signresulttext;

    } else if (result.result == RESULT_ERROR_PASSWORD) {

        block.body.className = "failure";
        block.header.textContent = i18n.getString("encrypted-message") + ", " + result.messagetext;

    } else {

        block.body.className = "failure";
        block.output.style.display = "block";
        block.output.textContent = trim(result.messagetext);

    }

};

/*
    Function: onPageLoad
    This function is called when a page is loaded

    Parameters:
        aEvent - The event of the loading

*/
Keyring.onPageLoad = function(aEvent) {
    var doc = aEvent.originalTarget;
    if(doc.nodeName != "#document")
        return;

	// Don't handle chrome pages
	if(doc.location.protocol == "chrome:")
		return;

    if (doc.location.href.indexOf("mail.google.com") != -1)
        return;

    Keyring.HandlePage(doc);


};

/*
    Function: initSystem
    This function is called by FireGPG when a new Firefox's windows is created.

*/
Keyring.initSystem = function() {

    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	                           getService(Components.interfaces.nsIPrefService);

    prefs = prefs.getBranch("extensions.firegpg.");
    try {
        activate = prefs.getBoolPref("activate_inline");
    } catch (e) {
        activate = true;
    }

    if (!activate)
        return;

    try {
        document.getElementById("appcontent").addEventListener("DOMContentLoaded", Keyring.onPageLoad, false);
    } catch (e) {  fireGPGDebug(e,'keyring.initSystem',true);  }

    Keyring.i18n = document.getElementById("firegpg-strings");
};
