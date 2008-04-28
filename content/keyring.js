var Keyring = { };

Keyring.Tags = {
    PgpBlockStart: "-----BEGIN PGP",
	KeyStart: "-----BEGIN PGP PUBLIC KEY BLOCK-----",
	KeyEnd: "-----END PGP PUBLIC KEY BLOCK-----",
	SignedMessageStart: "-----BEGIN PGP SIGNED MESSAGE-----",
	SignatureStart: "-----BEGIN PGP SIGNATURE-----",
	SignatureEnd: "-----END PGP SIGNATURE-----",
	EncryptedMessageStart: "-----BEGIN PGP MESSAGE-----",
	EncryptedMessageEnd: "-----END PGP MESSAGE-----"
};

Keyring.KEY_BLOCK = 1;
Keyring.SIGN_BLOCK = 2;
Keyring.MESSAGE_BLOCK = 3;

Keyring.Strings = {
	Key: "PHP Public Key",
	SignedMessage: "PGP Signed Message",
	EncryptedMessage: "PGP Encrypted Message",
	Import: "Import",
	VerifySignature: "Verify Signature",
	Decrypt: "Decrypt",
	SignatureUnverified: "unverified",
	SignatureInvalid: "invalid",
	SignatureBy: "signed by %1, %2",
	Unsigned: "unsigned",
};


Keyring.HandleBlock = function(document, range, blockType) {
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
			original: frame.contentDocument.getElementById("original"),
		}

		// Universal set up
		block.original.textContent = content;
		frame.contentDocument.getElementById("toggle-original").addEventListener("click", function() {
			var style = block.original.style;
			if(style.display == "block")
				style.display = "none";
			else
				style.display = "block";
			frame.style.height = block.body.scrollHeight + "px";
		}, false);
		var actionHandler = function() {
			switch(blockType) {
				case Keyring.KEY_BLOCK:
					Keyring.ImportKey(block.original.textContent, block);
					break;
				case Keyring.SIGN_BLOCK:
					Keyring.VerifySignature(block.original.textContent, block);
					break;
				case Keyring.MESSAGE_BLOCK:
					Keyring.DecryptMessage(block.original.textContent, block);
					break;
			}
			frame.style.height = block.body.scrollHeight + "px";
		};
		block.action.addEventListener("click", actionHandler, false);

		switch(blockType) {
			case Keyring.KEY_BLOCK:
				block.body.className = "information";
				block.header.textContent = Keyring.Strings.Key;
				block.action.textContent = Keyring.Strings.Import;
				break;
			case Keyring.SIGN_BLOCK:
				block.body.className = "caution";
				block.header.textContent = Keyring.Strings.SignedMessage + ", " + Keyring.Strings.SignatureUnverified;
				block.action.textContent = Keyring.Strings.VerifySignature;

				// Extract the message without the header and signature
				block.message.innerHTML = content.substring(content.indexOf("\n\n"), content.indexOf(Keyring.Tags.SignatureStart)).replace(/</gi,"&lt;").replace(/>/gi,"&gt;").replace(/\n/gi,"<br />");
				break;
			case Keyring.MESSAGE_BLOCK:
				block.body.className = "caution";
				block.header.textContent = Keyring.Strings.EncryptedMessage;
				block.action.textContent = Keyring.Strings.Decrypt;
				break;
		}
		frame.style.height = block.body.scrollHeight + "px";
	}, false);
};

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
				idx += search.length;
			}
		}

	}

};


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

Keyring.ImportKey = function(content, block) {
	var result = {
		success: confirm("Test question: was the import successful?"),
		output: "gpg: key 4A3BFD9E: public key \"IPCop Development Group\n(http://www.ipcop.org/) <ipcop-devel at lists.sourceforge.net>\" imported"
	};

	if(!result.success)
		result.output = "gpg: error reading `public_key.asc': general error\ngpg: import from `public_key.asc' failed: general error";

	block.output.style.display = "block";
	block.output.textContent = result.output;

	if(result.success) {
		block.body.className = "information";
	}
	else {
		block.body.className = "failure";
	}
};

Keyring.VerifySignature = function(content, block) {
	var result = {
		success: confirm("Test question: was this signature valid?"),
		signer: "Ryan Patterson <cgamesplay@cgamesplay.com>",
		signed: "1:59 pm on 3/18/2008",
		output: "gpg: Signature made Sun Apr 27 16:38:11 2008 EDT using DSA key ID A61A40ED\ngpg: Good signature from \"Ryan Patterson <cgamesplay@gmail.com>\"\ngpg: WARNING: This key is not certified with a trusted signature!\ngpg:          There is no indication that the signature belongs to the owner.\nPrimary key fingerprint: 247B E558 0BD3 9397 A952  13AB D784 F4CC A61A 40ED"
	};

	// For testing:
	if(!result.success)
		result.output = "gpg: Signature made Fri Mar 28 14:09:12 2008 EDT using DSA key ID A61A40ED\ngpg: BAD signature from \"Ryan Patterson <cgamesplay@gmail.com>\"";

	block.output.style.display = "block";
	block.output.textContent = result.output;

	if(result.success) {
		block.body.className = "ok";
		block.header.textContent = Keyring.Strings.SignedMessage + ", " + Keyring.Strings.SignatureBy.replace("%1", result.signer, "g").replace("%2", result.signed, "g");
	}
	else {

		block.body.className = "failure";
		block.header.textContent = Keyring.Strings.SignedMessage + ", " + Keyring.Strings.SignatureInvalid;
	}
};

Keyring.DecryptMessage = function(content, block) {
	var result = {
		success: confirm("Test question: was the decryption possible?"),
		message: "hello!",
		signer: "Ryan Patterson <cgamesplay@cgamesplay.com>",
		signed: "1:59 pm on 3/18/2008",
		output: "gpg: encrypted with 2048-bit ELG key, ID 157091C3, created 2006-09-20\n      \"Ryan Patterson <cgamesplay@gmail.com>\"\ngpg: Signature made Sun Apr 27 16:38:11 2008 EDT using DSA key ID A61A40ED\ngpg: Good signature from \"Ryan Patterson <cgamesplay@gmail.com>\"\ngpg: WARNING: This key is not certified with a trusted signature!\ngpg:          There is no indication that the signature belongs to the owner.\nPrimary key fingerprint: 247B E558 0BD3 9397 A952  13AB D784 F4CC A61A 40ED"
	};

	// For testing:
	if(!result.success) {
		delete result.message;
		result.output = "gpg: encrypted with ELG key, ID D278A68C\ngpg: decryption failed: No secret key";
	}
	else {
		if(!confirm("Test question: was the message signed?")) {
			delete result.signer;
			delete result.signed;
			result.output = "gpg: encrypted with 2048-bit ELG key, ID 157091C3, created 2006-09-20\n      \"Ryan Patterson <cgamesplay@gmail.com>\"";
		}
		else if(!confirm("Test question: was the signature valid?")) {
			result.success = false;
			result.output = "gpg: encrypted with 2048-bit ELG key, ID 157091C3, created 2006-09-20\n      \"Ryan Patterson <cgamesplay@gmail.com>\"\ngpg: Signature made Fri Mar 28 14:09:12 2008 EDT using DSA key ID A61A40ED\ngpg: BAD signature from \"Ryan Patterson <cgamesplay@gmail.com>\"";
		}
	}

	block.output.style.display = "block";
	block.output.textContent = result.output;

	if(result.success) {
		block.body.className = "ok";
		block.header.textContent = Keyring.Strings.EncryptedMessage + ", ";
		if(result.signer)
			block.header.textContent += Keyring.Strings.SignatureBy.replace("%1", result.signer, "g").replace("%2", result.signed, "g");
		else
			block.header.textContent += Keyring.Strings.Unsigned;
		block.message.textContent = result.message;
	}
	else {
		block.body.className = "failure";
		block.header.textContent = Keyring.Strings.EncryptedMessage;
		if(result.message)
			block.message.textContent = result.message;
		else
			block.message.textContent = "";
	}
};

Keyring.onPageLoad = function(aEvent) {
    var doc = aEvent.originalTarget;
    if(doc.nodeName != "#document")
        return;

	// Don't handle chrome pages
	if(doc.location.protocol == "chrome:")
		return;

    Keyring.HandlePage(doc);
};

Keyring.initSystem = function() {
    try {
        document.getElementById("appcontent").addEventListener("DOMContentLoaded", Keyring.onPageLoad, false);
    } catch (e) { }
};
