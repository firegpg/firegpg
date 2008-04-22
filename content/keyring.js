var Keyring = { };

Keyring.Tags = {
	KeyStart: "-----BEGIN PGP PUBLIC KEY BLOCK-----",
	KeyEnd: "-----END PGP PUBLIC KEY BLOCK-----",
	SignedMessageStart: "-----BEGIN PGP SIGNED MESSAGE-----",
	SignatureStart: "-----BEGIN PGP SIGNATURE-----",
	SignatureEnd: "-----END PGP SIGNATURE-----",
	EncryptedMessageStart: "-----BEGIN PGP MESSAGE-----",
	EncryptedMessageEnd: "-----END PGP MESSAGE-----"
};

Keyring.Types = {
	Key: "KEY",
	Sign: "SIGN",
	Encrypt: "ENCRYPT"
};

Keyring.Elements = {
	Original: "ORIGINAL",
	Title: "SIGN",
	Action: "ENCRYPT",
    Cleared: "CLEARED"
};

Keyring.HandleBlock = function(document, range,type) {
	var newEl = document.createElement("div");
	newEl.setAttribute("class", "firegpg-keyring-block");
    newEl.setAttribute("firegpg-type", type);

    //Create box with the original text
	var originalPre = document.createElement("pre");
    originalPre.setAttribute("style", "display:  none;");
    originalPre.setAttribute("firegpg-element", Keyring.Elements.Original);


    var s = new XMLSerializer();
	var d = range.cloneContents();
	var str = s.serializeToString(d);

    var content = Selection.wash(str);

    var fragment = range.extractContents(originalPre);

	var contentNode = document.createTextNode(content);
	originalPre.appendChild(contentNode);

    //Create the title
    var titleSpan = document.createElement("span");
    titleSpan.setAttribute("class", "firegpg-keyring-header");
    titleSpan.setAttribute("firegpg-element", Keyring.Elements.Title);

    switch(type) {
        case Keyring.Types.Key:
            titleSpan.innerHTML = "PGP Public Key //I18N";
            break;

        case Keyring.Types.Sign:
            titleSpan.innerHTML = "PGP Signed Message, unverified //I18N";
            break;

        case Keyring.Types.Encrypt:
            titleSpan.innerHTML = "PGP Encrypted Message //I18N";
            break;
    }


    //Create the actions
    var actionDiv = document.createElement("div");

    actionDiv.setAttribute("class", "firegpg-keyring-options");
    actionDiv.setAttribute("firegpg-element", Keyring.Elements.Action);
    actionDiv.innerHTML = '<span firegpg-action="showorigi">Show Original //I18N</span> | ';

    switch(type) {
        case Keyring.Types.Key:
            actionDiv.innerHTML += '<span firegpg-action="import">Import //I18N</span>'; //CONSTANTES
            break;

        case Keyring.Types.Sign:
            actionDiv.innerHTML += '<span firegpg-action="sign">Verify Signature //I18N</span>'; //CONSTANTES
            break;

        case Keyring.Types.Encrypt:
            actionDiv.innerHTML += '<span firegpg-action="encrypt">Decryp //I18N</span>'; //CONSTANTES
            break;
    }



    //Create the cleaned text (only for signs).
    if (type == Keyring.Types.Sign) {
        var cleanedPre = document.createElement("pre");
        cleanedPre.setAttribute("firegpg-element", Keyring.Elements.Cleared);

        //We  extract the content from the content found before.

        var cleanContent = content;

        cleanContent = cleanContent.substring(
            cleanContent.indexOf("\n\n",cleanContent.indexOf(Keyring.Tags.SignedMessageStart) + Keyring.Tags.SignedMessageStart.length) + 2,
            cleanContent.lastIndexOf(Keyring.Tags.SignatureStart) - 2
            );



        var contentNode2 = document.createTextNode(cleanContent);
        cleanedPre.appendChild(contentNode2);

    }



    //Append childs
    newEl.appendChild(titleSpan);
    if (cleanedPre)
        newEl.appendChild(cleanedPre);
    newEl.appendChild(actionDiv);
    newEl.appendChild(originalPre);

	range.insertNode(newEl);
}

Keyring.HandlePage = function(document) {
	var filter = function(node) {
		try
		{
			if(node.parentNode.parentNode.getAttribute("class").substr(0, 21) == "firegpg-keyring-block")
				return NodeFilter.FILTER_SKIP;
		}
		catch(e) {
		}
		return NodeFilter.FILTER_ACCEPT;
	};

	var haveBlocks = false;
	var haveStart = false;
    var finished = false;
	var tw = document.createTreeWalker(document.documentElement, NodeFilter.SHOW_TEXT, filter, false);
	var node, range, idx, search;
	while((node = tw.nextNode())) {
		idx = 0;
		while(true) {
			if(!haveStart) {
                baseIdx = idx;
				idx = node.textContent.indexOf(Keyring.Tags.KeyStart, baseIdx);
				search = Keyring.Tags.KeyEnd;
                type = Keyring.Types.Key;
				if(idx == -1) {
					idx = node.textContent.indexOf(Keyring.Tags.SignedMessageStart, baseIdx);
					search = Keyring.Tags.SignatureEnd;
                    type = Keyring.Types.Sign;
				}
				if(idx == -1) {
					idx = node.textContent.indexOf(Keyring.Tags.EncryptedMessageStart, baseIdx);
					search = Keyring.Tags.EncryptedMessageEnd;
                    type = Keyring.Types.Encrypt;
				}

				if(idx == -1)
                    break;

				haveStart = true;
				range = document.createRange();
				range.setStart(node, idx);
				idx += 6;
			}
			if(haveStart) {
                savedIdx = idx;

                tryOne = node.textContent.indexOf(search, idx);

                if(tryOne == -1)
					break;

				idx = node.textContent.indexOf(search, ignoreInners(idx,tryOne,node.textContent));

                if(idx == -1)
					break;

                haveStart = false;
				range.setEnd(node, idx + search.length);
				Keyring.HandleBlock(document, range,type);
				haveBlocks = true;
				range.detach();
				idx += search.length;
			}
		}
	}

	if(haveBlocks) {
		var h = document.getElementsByTagName("head");
		if(h.length == 0)
			return;
		var style = document.createElement("link");
		style.setAttribute("rel", "stylesheet");
		style.setAttribute("type", "text/css");
		style.setAttribute("href", "chrome://firegpg/skin/client.css");
		h[0].appendChild(style);
	}
};

function ignoreInners(idx, end,node) {

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
                ignoreInners(idx + 6,node.indexOf(search,idx + 6),node)
                ) + 6;

}


var onPageLoad = function(aEvent) {
    var doc = aEvent.originalTarget;
    if(doc.nodeName != "#document")
        return;

    Keyring.HandlePage(doc);
};

window.addEventListener("load", function() {
    var appcontent = document.getElementById("appcontent");
    if(!appcontent)
        return;
    appcontent.addEventListener("DOMContentLoaded", onPageLoad, false);
}, false);
