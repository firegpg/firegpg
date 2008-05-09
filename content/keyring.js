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
				block.header.textContent = Keyring.i18n.getString("key-block");
				block.action.textContent = Keyring.i18n.getString("import");
				break;
			case Keyring.SIGN_BLOCK:
				block.body.className = "caution";
				block.header.textContent = Keyring.i18n.getString("signed-message")  + ", " + Keyring.i18n.getString("unverified");
				block.action.textContent = Keyring.i18n.getString("verify");

				// Extract the message without the header and signature
				block.message.innerHTML = content.substring(content.indexOf("\n\n"), content.indexOf(Keyring.Tags.SignatureStart)).replace(/</gi,"&lt;").replace(/>/gi,"&gt;").replace(/\n/gi,"<br />");
				break;
			case Keyring.MESSAGE_BLOCK:
				block.body.className = "caution";
				block.header.textContent = Keyring.i18n.getString("encrypted-message") ;
				block.action.textContent = Keyring.i18n.getString("decrypt");
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

    result = FireGPG.kimport(true,content);

	block.output.style.display = "block";
    block.output.textContent = result.messagetext;

	if(result.result == RESULT_SUCCESS)
		block.body.className = "ok";
	else
		block.body.className = "failure";

};

Keyring.VerifySignature = function(content, block) {

    var i18n = document.getElementById("firegpg-strings");

    resultTest = FireGPG.verify(true,content);



    if (resultTest.signresult ==RESULT_ERROR_UNKNOW) {
        block.body.className = "failure";
        block.header.textContent = i18n.getString("signed-message") + ", " +i18n.getString("verifFailed");
    }
    else if (resultTest.signresult == RESULT_ERROR_BAD_SIGN) {
        block.body.className = "failure";
        block.header.textContent = i18n.getString("signed-message") + ", " + i18n.getString("verifFailed") + " (" + i18n.getString("falseSign") + ")";
    }
    else if (resultTest.signresult == RESULT_ERROR_NO_KEY) {
        block.body.className = "failure";
        block.header.textContent = i18n.getString("signed-message") + ", " + i18n.getString("verifFailed") + " (" + i18n.getString("keyNotFound") + ")";
    }
    else {
        block.body.className = "ok";
        block.header.textContent = i18n.getString("signed-message") + ", " + i18n.getString("verifSuccess") + " " + resultTest.signresulttext;
    }

};

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
        block.output.textContent = result.messagetext;

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

    Keyring.i18n = document.getElementById("firegpg-strings");
};
