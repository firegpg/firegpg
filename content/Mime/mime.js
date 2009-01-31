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


//Mime functions {DECODING}

FireGPGMimeDecoder = {

    getMailId: function(message) {

        message = convertCRLFToStandarts(message);


        headers = this.getHeaders(message);

        if (headers["Message-ID"])
            return headers["Message-ID"];

        return '';

    },

    //SIGNED IN OPENPGP/MIME FORMAT
    extractSignedData: function(message) {

        message = convertCRLFToStandarts(message);


        headers = this.getHeaders(message);


        if (!headers["Content-Type"] || headers["Content-Type"].indexOf('"application/pgp-signature"') == -1)
            return '';
        hash = this.findHash(message, headers);

        if (hash == '') {
            fireGPGDebug('hash faillure', 'FireGPGMimeDecoder.extractSignedData',true);
            return '';
        }

        blockId = this.findBlockId(message, headers);

        if (blockId == '') {
            fireGPGDebug('block faillure', 'FireGPGMimeDecoder.extractSignedData',true);
            return '';
        }

        signed = this.findSignedPart(message, blockId);

        if (signed == '') {
            fireGPGDebug('find signed block faillure', 'FireGPGMimeDecoder.extractSignedData',true);
            return '';
        }


        signature = this.findSignaturePart(message, blockId);

        if (signature == '') {
            fireGPGDebug('find signature faillure', 'FireGPGMimeDecoder.extractSignedData',true);
            return '';
        }


        return "-----BEGIN PGP SIGNED MESSAGE-----\r\nHash: "+hash+"\r\n\r\n"+signed+signature;


    },

    //SIGNED INLINE !
    extractSignature: function(message) {

        message = convertCRLFToStandarts(message);

        message = message.replace(/<br( |\/)?>\r/gi, "\r");
        message = message.replace(/<br( |\/)?>\n/gi, "\n");
        message = message.replace(/<br( |\/)?>/gi, "\r\n");

        //On choppe la possition de la première signature
        firstSignPos = message.indexOf("\r\n-----BEGIN PGP SIGNED MESSAGE-----");

        if (firstSignPos == -1)
            firstSignPos = message.indexOf("\r\n\r\n"); //Le mail peut être base64encodé et dans ce cas la signature est pas visible tout de suite...


         //On trouve l'encodage de la chose (l'avant dernier Content-Transfer-Encoding: avant notre signature)
        restrainon = message.substring(0, firstSignPos);
        restrainon = restrainon.substring(restrainon.lastIndexOf("\r\nContent-Transfer-Encoding:"), restrainon.length);
        restrainon = "\r\n" + restrainon + "\r\n";


        var reg = /\r\nContent\-Transfer\-Encoding: ([a-zA-Z0-9\-]*)\r\n/;
        result = reg.exec(restrainon);

        if (result && result[1] != "")
        {

            switch(result[1]) {
                case "quoted-printable":
                    message = message.substring(0, firstSignPos) + "\r\n\r\n" + convertCRLFToStandarts(this.convertFromQP(message.substring(firstSignPos , message.length)));
                    break;

                case "8bit":
                    break;

                case "base64":
                    message = message.substring(0, firstSignPos) + "\r\n\r\n" + convertCRLFToStandarts(this.convertFromB64(message.substring(firstSignPos, message.length)));
                    break;

            }
        }


        firstSignPos = message.indexOf("\r\n-----BEGIN PGP SIGNED MESSAGE-----");

        //On choppe la première signature :
        firstSign = message.substring(firstSignPos, message.indexOf("\r\n-----END PGP SIGNATURE-----") + ("\r\n-----END PGP SIGNATURE-----").length);



        retour = new Object();
        retour.text = firstSign;

        //On trouve le charset
        restrainon = message.substring(0, firstSignPos);
        restrainon = restrainon.substring(restrainon.lastIndexOf("\r\nContent-Type:"), restrainon.length);
        restrainon = "\r\n" + restrainon + "\r\n";

        var reg = /\r\nContent\-Type: ([a-zA-Z0-9\-;\/= ]*)\r\n/;
        result = reg.exec(restrainon);

        if (!result || result[1] == "")
            retour.chaset = "UTF-8";
        else {

            interestingHeader=result[1]+" ";

          var reg1 = /charset="([^( |;)]*)"( |;)/;
            result = reg1.exec(interestingHeader);
            if (result && result[1] != "")
                retour.chaset = result[1];
            else {

                var reg2 = /charset=([^( |;)]*)( |;)/;
                result = reg2.exec(interestingHeader);
                if (result && result[1] != "")
                    retour.chaset = result[1];
                else
                    retour.chaset = "UTF-8";
            }
        }


        return retour;


    },

    //ENCRYPTED IN OPENPGP/MIME FORMAT
    extractEncryptedData: function(message) {

        message = convertCRLFToStandarts(message);

        headers = this.getHeaders(message);


        if (!headers["Content-Type"] || headers["Content-Type"].indexOf('"application/pgp-encrypted"') == -1)
            return '';


        blockId = this.findBlockId(message, headers);

        if (blockId == '') {
            fireGPGDebug('block faillure', 'FireGPGMimeDecoder.extractSignedData',true);
            return '';
        }

        data = this.findEncryptedPart(message, blockId);

        if (data == '') {
            fireGPGDebug('find encryped part faillure', 'FireGPGMimeDecoder.extractSignedData',true);
            return '';
        }

        return data;


    },

    //ENCRYPTED INLINE
    extractEncrypted: function(message) {



        message = convertCRLFToStandarts(message);

        //If messsage is send is html...

        message = message.replace(/<br( |\/)?>\r/gi, "\r");
        message = message.replace(/<br( |\/)?>\n/gi, "\n");
        message = message.replace(/<br( |\/)?>/gi, "\r\n");

        //On choppe la possition de la première signature
        dataMessagePos = message.indexOf("\r\n-----BEGIN PGP MESSAGE-----");


        if (dataMessagePos == -1)
            dataMessagePos = message.indexOf("\r\n\r\n"); //Le mail peut être base64encodé et dans ce cas la signature est pas visible tout de suite...

         //On trouve l'encodage de la chose (l'avant dernier Content-Transfer-Encoding: avant notre signature)
        restrainon = message.substring(0, dataMessagePos);
        restrainon = restrainon.substring(restrainon.lastIndexOf("\r\nContent-Transfer-Encoding:"), restrainon.length);
        restrainon = "\r\n" + restrainon + "\r\n";


        var reg = /\r\nContent\-Transfer\-Encoding: ([a-zA-Z0-9\-]*)\r\n/;
        result = reg.exec(restrainon);

        if (result && result[1] != "")
        {

            switch(result[1]) {
                case "quoted-printable":
                    message = message.substring(0, dataMessagePos) + "\r\n\r\n" + convertCRLFToStandarts(this.convertFromQP(message.substring(dataMessagePos, message.length)));
                    break;

                case "8bit":
                    break;

                case "base64":
                    message = message.substring(0, dataMessagePos) + "\r\n\r\n" + convertCRLFToStandarts(this.convertFromB64(message.substring(dataMessagePos, message.length)));
                    break;

            }
        }

     //   fireGPGDebug(message, 1);


        dataMessagePos = message.indexOf("\r\n-----BEGIN PGP MESSAGE-----");

        if (dataMessagePos == -1)
            return '';

        //On choppe la première signature :
        dataMessage = message.substring(dataMessagePos, message.indexOf("\r\n-----END PGP MESSAGE-----") + ("\r\n-----END PGP MESSAGE-----").length);

//fireGPGDebug(dataMessage, 2);

        return dataMessage;


    },

    //Format the mail (decode dependig of the encoding, add <br />, add links)
    parseDecrypted: function(message) {

        retour = this.demime(message);

        retour.message = this.washDecryptedForInsertion(retour.message)

        return retour;

    },

    //select good mime part
    demime: function(message) {

        retour = new Object;

        message = convertCRLFToStandarts(message);

        while(message[0] == "\r" && message[1] == "\n")
            message = message.substring(2, message.length);

        headers = this.getHeaders(message);

        if (headers['Content-Type'] && headers['Content-Type'].indexOf('multipart') != -1) {

            if (headers['Content-Type'].indexOf('application/pgp-signature') != -1) { //ZOMGLOL, mail is signed too !
                retour.signData = this.extractSignedData(message);
            }

            blockid = this.findBlockId(message,headers);

            blockseparator = "--" + blockid;

            //remove header block
            message = message.substring(message.indexOf(blockseparator + "\r\n") + (blockseparator + "\r\n").length, message.lastIndexOf(blockseparator + "\r\n"));

            while(message[0] == "\r" && message[1] == "\n")
                message = message.substring(2, message.length);

            headers = this.getHeaders(message);

            message = message.substring(message.indexOf("\r\n\r\n") + 4, message.length); //EndOfHeaders

            switch(headers["Content-Transfer-Encoding"]) {
                case "quoted-printable":
                    message = this.convertFromQP(message);
                    break;

                case "8bit":
                    break;

                case "base64":
                    message = this.convertFromB64(message);
                    break;

            }

        } else {
            //remove header block

            if ((headers['Content-Type'] != undefined || headers['Content-Disposition'] != undefined || headers['Content-Transfer-Encoding'] != undefined) && message.indexOf("\r\n\r\n")  != -1)
                message = message.substring(message.indexOf("\r\n\r\n") + 4, message.length); //EndOfHeaders


             switch(headers["Content-Transfer-Encoding"]) {
                case "quoted-printable":
                    message = this.convertFromQP(message);
                    break;

                case "8bit":
                    break;

                case "base64":
                    message = this.convertFromB64(message);
                    break;

            }


        }




        if (headers['Content-Type'] && headers['Content-Type'].indexOf("text/html") != -1)
            message = this.deHtmlListe(message);

        retour.message = message;

        return retour;

    },

    deHtmlListe: function(message) {

        message = message.replace(/(\n|\r)/gi, "");
        message = message.replace(/<br( |\/)?>/gi, "\r\n");
        message = message.replace(/<\/?[^>]+(>|$)/g, "");

        return message;
    },

    washDecryptedForInsertion: function(message) {


        message = message.replace(/</gi, "&lt;"); // Security
        message = message.replace(/>/gi, "&gt;");
        message = message.replace(/\r\n/gi, "<br />");
        message = message.replace(/\r/gi, "<br />");
        message = message.replace(/\n/gi, "<br />");




        return message;

    },

    getHeaders: function(message) {

        headers = new Array();

        message = message.substring(0, message.indexOf("\r\n\r\n")); //EndOfHeaders

        message = message.split(/\r\n/gi);

        currentHeader = "";

        for (i = 0; i < message.length; i++) {

            if (message[i][0] == " " || message[i][0] == "\t") {
                headers[currentHeader] += trim(message[i]);
            } else {

                /*if (message[i].indexOf(":") == -1) //Erreur, on arrêtte
                    return headers;*/

                currentHeader = message[i].substring(0, message[i].indexOf(":"));
                headers[currentHeader] = trim(message[i].substring(message[i].indexOf(":") + 1 , message[i].length));

            }


        }

        return headers;



    },

    convertFromQP: function(message) {

        //(inspired by http://www.javascriptfr.com/codes/DECODAGE-FORMAT-QUOTED-PRINTABLE_15808.aspx)
        var result = "";
        var hexa = "0123456789ABCDEF";

        while(message != "") {
            if (message.charAt(0) == '=') {

                if (message.length < 3) //Incoherent -> return result
                    return result;

                var mid = ""
                message = message.slice(1, message.length); //remove = of =XX
                mid = message.slice(0,2); //save hex char
                message = message.slice(2, message.length); //remove XX of =XX

                if (mid == "\r\n") { //On vérifie si on a un saut de ligne

                    //result += mid; //Donc on l'ajoute pas (soft break, cf rfc)

                } else if ( hexa.indexOf(mid.charAt(0)) != -1 && hexa.indexOf(mid.charAt(1)) != -1 ) { //vérifie que le caractère est bien HexaDécimal

                    var m = parseInt(mid,16); //on le converti en base 10
                    result += String.fromCharCode(m); //on converti le code ASCII obtenu en caractère et on l'ajoute à la sortie
                } else {                          //Not HEXA !
                    return result; //erreur pendant le décodage, on renvoi ce qui à déjà été decodé...
                }


            } else { // Le caractère n'est pas un signe '=' on l'ajoute donc à la chaine
                result += message.charAt(0);
                message = message.slice(1,message.length); // zoupla
            }
        }
        return result;
    },

    convertFromB64: function(message) {

        return Base64.decode(message);

    },

    findHash: function(message, headers) {

        hash = Array();
        hash['pgp-md5'] = 'MD5';
        hash['pgp-sha1'] = 'SHA1';
        hash['pgp-ripemd160'] = 'RIPEMD160';
        hash['pgp-md2'] = 'MD2'; // ???
        hash['pgp-tiger192'] = 'TIGER192'; // ???
        hash['pgp-haval-5-160'] = 'HAVAL-5-160'; // ???

        interestingHeader = headers["Content-Type"] + ";";

        var reg1 = /micalg="([a-zA-Z0-9\-]*)"( |;)/;
        result = reg1.exec(interestingHeader);
        if (result && result[1] != "")
            return hash[result[1]];

        var reg2 = /micalg=([a-zA-Z0-9\-]*)( |;)/;
        result = reg2.exec(interestingHeader);
        if (result && result[1] != "")
            return hash[result[1]];

        return '';

    },

    findBlockId: function(message, headers) {

        interestingHeader = headers["Content-Type"] + ";";

        var reg1 = /boundary="([^( |;)]*)"( |;)/;
        result = reg1.exec(interestingHeader);
        if (result && result[1] != "")
            return result[1];

        var reg2 = /boundary=([^( |;)]*)( |;)/;
        result = reg2.exec(interestingHeader);
        if (result && result[1] != "")
            return result[1];

        return '';


    },

    findSignedPart: function(message, blockid) {

        blockseparator = "--" + blockid;

        text = message.substring(message.indexOf(blockseparator + "\r\n") + (blockseparator + "\r\n").length, message.lastIndexOf(blockseparator + "\r\n"));

        text = text.replace(/\r\n\-/gi, "\r\n- -");

        return text;


    },

    findSignaturePart: function(message, blockid) {

        blockseparator = "--" + blockid;

        //Use the good part of the message
        data = message.substring(message.lastIndexOf(blockseparator + "\r\n") + (blockseparator + "\r\n").length, message.indexOf(blockseparator + "--\r\n"));

        return data .substring(data.indexOf("-----BEGIN PGP SIGNATURE-----\r\n") , data.indexOf("-----END PGP SIGNATURE-----") + ("-----END PGP SIGNATURE-----").length);



    },

    findEncryptedPart: function(message, blockid) {

        blockseparator = "--" + blockid;

        //Use the good part of the message
        data = message.substring(message.lastIndexOf(blockseparator + "\r\n") + (blockseparator + "\r\n").length, message.indexOf(blockseparator + "--\r\n"));

        return data .substring(data.indexOf("-----BEGIN PGP MESSAGE-----\r\n") , data.indexOf("-----END PGP MESSAGE-----") + ("-----END PGP MESSAGE-----").length);



    },

}


//FireGPG mime : encoding

/*

Base of the code :

Copyright (C) 2005-2006 Richard Jones.
Copyright (C) 2007-2008 Sean Leonard of SeanTek(R).
This file was a part of Gmail S/MIME (adapted)

{DOUBLY FREE SOFTWARE PUBLIC LICENSE}

*/

const FireGPGMimeEncoder = function(multiPart,partNum)
{
	this.init(multiPart,partNum);
}

FireGPGMimeEncoder.prototype =
{
	multipartStream: null,
	// TODO: generate mostly random.
	CRLF: "\r\n",


	addStringToStream : function(str)
	{
		var strInp=
		Components.classes["@mozilla.org/io/string-input-stream;1"].
		createInstance(Components.interfaces.nsIStringInputStream);
		strInp.setData(str,str.length);
		this.multipartStream.appendStream(strInp);
	},

	addValuePair: function(name,value)
	{
		var str = "--"+this.boundaryString+this.CRLF +
		"Content-Disposition: form-data; name=\"" +
		encodeURIComponent(name)+"\"" + this.CRLF + this.CRLF +
		value + this.CRLF;
		this.addStringToStream(str);
	},

	addFilePairFromString: function(str,fileNameStr,contentType, disposition,encoding)
	{
		var strInp=Components.classes["@mozilla.org/io/string-input-stream;1"].
		createInstance(Components.interfaces.nsIStringInputStream);
		strInp.setData(str,str.length);
		this.addFilePairFromStream(strInp,fileNameStr,contentType,
		disposition,null,encoding);
	},

	addFilePairFromStream: function(fileStream,fileNameStr, contentType,disposition,contentDescription, encoding)
	{
		str = this.CRLF + "--" + this.boundaryString + this.CRLF;
		str += "Content-Transfer-Encoding: "+encoding+ this.CRLF;
		str += "Content-Disposition: "+disposition+";" + this.CRLF + "\tfilename=\"" +
			this.makeRFC2047(fileNameStr) + "\"" + this.CRLF;
		if (contentDescription != null)
			str += "Content-Discription: "+contentDescription+this.CRLF;
		str += "Content-Type: " + contentType + this.CRLF + this.CRLF;

		this.addStringToStream(str);

		if (encoding == "base64")
		{
			try
			{
				var binInpStream =
				Components.classes[
				"@mozilla.org/binaryinputstream;1"].
				createInstance(Components.interfaces.nsIBinaryInputStream);
				binInpStream.setInputStream(fileStream);
				var bytes = binInpStream.readBytes(fileStream.available());
				var base64coded = breakLines(btoa(bytes));
				this.addStringToStream(base64coded);
			}
			catch (e)
			{
				alert("Error converting file to base64:"+e);
			}
		}
		else
		{ // not base64
			this.multipartStream.appendStream(fileStream);
		}

		// this.addStringToStream(this.CRLF);
	}, // end addFilePairFromStream

	addSignature: function(s)
	{
		this.addPlainStr(s,
						 'application/pkcs7-signature; name="smime.p7s"',
						 "base64",
						 'attachment; filename="smime.p7s"',
						 "S/MIME Cryptographic Signature");
	},

	addPlainStr: function(str,contentType,encoding,disposition, description)
	{
		var part = "";
		if (this.multiPart)
			part = "\r\n--"+this.boundaryString+this.CRLF;
		if (contentType != null)
			part += "Content-Type: "+contentType+this.CRLF;
		if (encoding != null)
			part += "Content-Transfer-Encoding: "+encoding+this.CRLF;
		if (disposition != null)
			part += "Content-Disposition: "+disposition+this.CRLF;
		if (description != null)
			part += "Content-Description: "+description+this.CRLF;
		part += this.CRLF + str;
		this.addStringToStream(part);
	},

	addLiteralPart: function(str)
	{
		var part = "";
		if (this.multiPart)
			part = this.CRLF + "--" + this.boundaryString+this.CRLF;
		part+=str; // do we need another CRLF here? PROBABLY NOT.
		this.addStringToStream(part);
	},
	addLiteral: function(str)
	{
		this.addStringToStream(str);
	},

	addBase64String: function(str,contentType,disposition, prefs)
	{
		var uChars = false;
		// NOTE: the str must be canonicalized from LF to CRLF
		// but JavaScript doesn't support Lookbehind /(?<!a)\n/g
		// but we can fake it with /([^\r])(?=\n)/g

		// TODO: deal with excessively long octet strings
		// without CRLF. But most mail clients seem to
		// handle...
		if (/[^\n]{999,}/.test(str))
		{
			// this forces base64 encoding, because we don't
			// want to deal with adding line breaks
			uChars = "us-ascii";
		}
		if (str.charAt(0) == "\n")
		{
			str = this.CRLF +
			str.substring(1).replace(/([^\r])(?=\n)/g,"$1\r");
		}
		else
		{
			str = str.replace(/([^\r])(?=\n)/g,"$1\r");
		}
		// now must turn Unicode into UTF-8. Fortunately,
		// there's a shortcut (from a coding standpoint;
		// sadly, it is not efficient) compare
		// decodeURIComponent(escape(
		//		unescape(encodeURIComponent("TEXT"))))
		/*for (var i = 0; i < str.length; i++)
		{
			if (str.charCodeAt(i) > 0xFF)
			{
				str = unescape(encodeURIComponent(str));
				uChars = "UTF-8";
				break;

			}
			else if (str.charCodeAt(i) > 0x7F)
			{
				// we can still get away with this because of
				// the identity transformation 0x80-0xFF
				uChars = "ISO-8859-1";
			}
		}*/

        //FireGPG: Force utf8
        str = unescape(encodeURIComponent(str));
		uChars = "UTF-8";


		var part="";
		if (this.multiPart)
		{
			// NOTE: SHOULD include leading CRLF in most cases, but we know
			part += "--"+this.boundaryString+this.CRLF;
		}
		// that this CRLF does not count because it's at the front of the stream in Gmail S/MIME.
		// examine
		if (contentType != null)
		{
			part += "Content-Type: "+contentType;
			if (uChars)
			{
				// ARGH! signText appears to only take ASCII
				// characters! So, we have to base64 it.
				part += "; charset=" +
					uChars + "\r\nContent-Transfer-Encoding: base64";
				str = btoa(str);
				str = breakLines(str);
			}
			part += this.CRLF;
		}
		if (disposition != null)
			part += "Content-Disposition: "+ disposition +this.CRLF;
		part += this.CRLF + str;





		this.addStringToStream(part);
	},

	makeRFC2047: function(s)
	{
		for (var i = 0; i < s.length; i++)
		{
			if (s.charCodeAt(i) > 0x7F)
			{
				return "=?utf-8?B?" + btoa(unescape(encodeURIComponent(s))) + "?=";
			}
		}
		return s;
	},

	/**
	 * @function addFilePair adds an attachment, specifies an encoding to use for that attachment, and specifies the disposition of the attachment.
	 * @param disposition: Valid values are defined in RFC2183. Namely, "inline" and "attachment".
	 * @param attachment: Any abstract attachment Object that is supported by this implementation. Valid values are:
	 *   nsIFile [partial support]
	 *   nsILocalFile
	 *   XMLHttpRequest (in this version, must already be processed with status code 200 OK)
	 *     TODO: check to see if contentType (inferred from Gmail HTML etc.) differs from the headers returned by the actual mail service HTTP request
	 *   nsIHttpChannel
	 *   [TODO:] nsIChannel (infer filename from URI)
	 *   String -> treated as nsILocalFile
	 */
	addFilePair: function(disposition, attachment, encoding)
	{
		var file;
		if (typeof(attachment) == "string") {
			file = Components.classes["@mozilla.org/file/local;1"].
			createInstance(Components.interfaces.nsILocalFile);
			try
			{
				file.initWithPath(attachment);
			}
			// if the fileName is spurious, then just don't try to add the file
			catch (e)
			{
				if (e.result === 0x80520001) return; // NS_ERROR_FILE_UNRECOGNIZED_PATH
				else throw e;
			}
		}
		else if (typeof(attachment) == "object")
		{
			if (attachment instanceof XMLHttpRequest)
			{
				if (attachment.status != 200) return false;
				var cD = new String(attachment.getResponseHeader("Content-Disposition"));
				cD.semicolon = cD.indexOf(";");
				cD.type = (cD.semicolon == -1) ? cD : cD.substring(0,cD.semicolon);
				if (cD.semicolon == -1 || (cD.fnpos = cD.indexOf("filename=")) == -1) cD.filename = null;
				else
				{
					// cd.filename should already be RFC 2047-compliant
					cD.filename = cD.substring((cD.q = cD[cD.fnpos+9] == "\"") ? cD.fnpos+10 : cD.fnpos+9);
					cD.filename = cD.filename.substring(0, cD.q ? cD.filename.indexOf("\"") : cD.filename.search(/\s/));
				}
				var cT = new String(attachment.getResponseHeader("Content-Type"));
				cT.semicolon = cT.indexOf(";");
				cT.type = (cT.semicolon == -1) ? cT : cT.substring(0,cT.semicolon);
				cT.type += ";"+this.CRLF+
				 "\tname=\""+ cD.filename +"\"";
				this.addFilePairFromString(attachment.responseText,cD.filename,cT.type, cD.type, encoding)
				return true;
			}
			else if ("channel" in attachment && "data" in attachment && attachment.channel instanceof Components.interfaces.nsIHttpChannel) // this is modified with a .data attached.
			{
				var cD = new String(attachment.channel.getResponseHeader("Content-Disposition"));
				cD.semicolon = cD.indexOf(";");
				cD.type = (cD.semicolon == -1) ? cD : cD.substring(0,cD.semicolon);
				if (cD.semicolon == -1 || (cD.fnpos = cD.indexOf("filename=")) == -1) cD.filename = null;
				else
				{
					// cd.filename should already be RFC 2047-compliant
					cD.filename = cD.substring((cD.q = cD[cD.fnpos+9] == "\"") ? cD.fnpos+10 : cD.fnpos+9);
					cD.filename = cD.filename.substring(0, cD.q ? cD.filename.indexOf("\"") : cD.filename.search(/\s/));
				}
				var cT = new String(attachment.channel.getResponseHeader("Content-Type"));
				cT.semicolon = cT.indexOf(";");
				cT.type = (cT.semicolon == -1) ? cT : cT.substring(0,cT.semicolon);
				cT.type += ";"+this.CRLF+
				 "\tname=\""+ cD.filename +"\"";

				str = this.CRLF + "--" + this.boundaryString + this.CRLF;
				str += "Content-Transfer-Encoding: "+encoding+ this.CRLF;
				str += "Content-Disposition: "+cD.type+";" + this.CRLF + "\tfilename=\"" +
					this.makeRFC2047(cD.filename) + "\"" + this.CRLF;
				str += "Content-Type: " + cT.type + this.CRLF + this.CRLF;

				str += breakLines(btoa(attachment.data));
				this.addStringToStream(str);
				return true;
			}
			else if (!(attachment instanceof Components.interfaces.nsIFile)) return false;
			file = attachment;
		}
		var contentType = "";

		var mimeService =
		Components.classes["@mozilla.org/mime;1"].
		getService(Components.interfaces.nsIMIMEService);
		try
		{
			contentType = mimeService.getTypeFromFile(file);
		}
		catch (e)
		{
			// common throw: 0x80040111 NS_ERROR_NOT_AVAILABLE
			contentType = "application/octet-stream";
		}
		contentType += ";"+this.CRLF+
		"\tname=\""+ this.makeRFC2047(file.leafName) +"\"";
		var fileInputStream=
		Components.classes["@mozilla.org/network/file-input-stream;1"].
		createInstance(Components.interfaces.nsIFileInputStream);

		fileInputStream.init(file,0x01,0600,fileInputStream.CLOSE_ON_EOF);
		var buffer =
		Components.classes["@mozilla.org/network/buffered-input-stream;1"].
			createInstance(Components.interfaces.nsIBufferedInputStream);
			buffer.init(fileInputStream,8192);
			this.addFilePairFromStream(buffer,file.leafName,contentType,disposition,null,encoding);
		return true;
	},

	// Get stream without the multipart dividers or extra header,
	// used for once off
	// encoding of single parts.
	getSinglePartStream: function()
	{
		return this.multipartStream;
	},

	getMultipartStream: function(multipartType,isLengthRequired)
	{
		this.addStringToStream(this.CRLF + "--" + this.boundaryString + "--" + this.CRLF);
		var mimeStream =
		Components.classes["@mozilla.org/network/mime-input-stream;1"].
		createInstance(Components.interfaces.nsIMIMEInputStream);
		mimeStream.addContentLength = isLengthRequired;
		mimeStream.addHeader("Content-Type",
							 multipartType+"; boundary=\""+this.boundaryString + "\"");
		mimeStream.setData(this.multipartStream);
		return mimeStream;
	},

	streamFromString: function(str,file,fstream)
	{
		var foStream =
		Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance(Components.interfaces.nsIFileOutputStream);
		// write, create, truncate
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);

		var binOutStream = Components.classes[
											  "@mozilla.org/binaryoutputstream;1"].
		createInstance(Components.interfaces.nsIBinaryOutputStream);
		binOutStream.setOutputStream(foStream);
		for (var i=0;i<str.length;i++)
		{
			binOutStream.write8(str.charCodeAt(i) & 0xFF);
		}

		binOutStream.close();
		// Does previous close do this? XXX
		foStream.close();

		fstream.init(file, 1, 0, false);

		var bufStream =
		Components.classes["@mozilla.org/network/buffered-input-stream;1"]
		.createInstance(Components.interfaces.nsIBufferedInputStream);
		bufStream.init(fstream, 512);

		return bufStream;
	},

	upload: function(url,referer,targetName,tmpfile,tmpfilestream)
	{
		var ioService = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);

		var contentType = null;

		var uri		= ioService.newURI(url,null,null);
		var referrerUri		= ioService.newURI(referer,null,null);

		ioChannel = ioService.newChannelFromURI(uri);
		var httpChannel =
		ioChannel.QueryInterface(
								 Components.interfaces.nsIHttpChannel
								 );
		httpChannel.requestMethod = "POST";
		httpChannel.setRequestHeader("Referer",referer,false);
		var uploadChannel =
		httpChannel.QueryInterface(Components.interfaces.nsIUploadChannel);
		uploadChannel.
		setUploadStream(
						this.getMultipartStream("multipart/form-data",true),
						contentType,-1);

		httpChannel.requestMethod = "POST";
		httpChannel.setRequestHeader("Referer",referer,false);

		uploadChannel.
		asyncOpen(
				  {
				  onStartRequest: function(request, context)
				  {
						  //		  alert("Started upload");
				  },
				  onStopRequest: function(request, context, status, errorMsg)
				  {
						//alert("Finished upload");
					  tmpfilestream.close();
					  tmpfile.remove(false);
				  },
				  onDataAvailable: function(request, context, inStream, offset, count)
				  {
				  }
				  }
				  , null);
	},

	init: function(multiPart,partNum)
	{
		// the boundary string should be unique, especially if
		// one forwards and encapsulates previous messages generated
		// with Gmail S/MIME. A good approximation is to use a nonce-like value,
		// but one that is a little bit different from non-encrypted values,
		// like the Message-ID.
		this.boundaryString = "firegpg" + FIREGPG_VERSION_A + "eq" + (Math.round(Math.random()*99)+(new Date()).getTime()).toString(36) +
		(99+Math.round(46656*46656*46635*36*Math.random())).toString(36) +
		+partNum;
		this.multiPart = multiPart;
		this.multipartStream=
		Components.classes["@mozilla.org/io/multiplex-input-stream;1"].
		createInstance(Components.interfaces.nsIMultiplexInputStream);
	}
}; // end FireGPGMimeEncoder class



function FireGPGMimeSender()
{
}

FireGPGMimeSender.prototype =
{

	// Abstract methods to be overidden by children

	/**
	 * Abstract callbacks to be called right before a message undergoes the operations indicated by the functions. This is meant
	 * to inform the user via the UI.
	 * TODO: Note on implementation: currently signText, encryption, and breakLines take an extraordinarily long time for large data. Thus, they block the UI. Consider addressing this.
	 */
	ourSigning: function(msg) {},
	ourEncrypting: function(msg) {},
	ourSending: function(msgs) {},

	/**
	 * Abstract callback to be called after a pile of messages is sent (or not sent, as the case may be).
	 * @param prefs {Object}  The preferences that accompanied this set of messages.
	 * These prefs are saved/delivered through the routine along with the messages because
	 * this sender object, which corresponds to a form, may not have the same preferences
	 * as the pile of messages that are finally sent at the time after those messages
	 * are finally sent (conceptually, the user may have moved on to composing a new message with
	 * different prefs).
	 */
	ourSent: function(msgs, err, prefs) { }, // this is a callback AFTER a message is sent. No return parameter expected.

	// so-called internal variables (but purposefully declared public)
	smtpUsername : null, // this can be null, a string, or a function reference. If null, no smtp auth is attempted.
	smtpPassword : null, // this can be null, a string, or a function reference.
	smtpServer : null, // this can be null or a string (DNS)
	smtpPort : 25, // this must be a number.
	smtpSocketTypes : null, // this must be an array of socket type strings per
	// nsISocketTransportService::createTransport.

	/**
	 * A message object is a discrete block of data that is serialized out
	 * using SmimeSender.smtpSend.
	 * @class
	 */
	Msg: function() {	}, // base msg

	// New function used to intercept compose/reply form submissions.
	// one submission equals ONE e-mail message, although multiple msgs may be generated (see below)
	// return: false = e-mail message not sent; true = e-mail message sent successfully; null = sending (async)
	/**
	 * Process and submit data. Input:
	 *	from: string specifying precise RFC822 From: line (after "From: ")
	 *	to: RFC822 To: line
	 *	cc: RFC822 Cc: line (or null)
	 *	bcc: RFC822 Bcc: line (or null)
	 *	subject: RFC822 Subject: line
	 *	inreplyto: RFC2822 In-Reply-To: line (see RFC2822 sec. 3.6.4)
	 *	references: RFC2822 References: line (see RFC2822 sec. 3.6.4)
	 * The above are ONE-LINE PREFERRED. Line breaks will be performed as necessary by ourSubmit or smtpSend.
	 *	body: some kind of a variable indicating BODY text. Let us assume, for now, that the body text itself
	 *     is RFC822-compliant, but the variable need not specify a string (it could be an input stream, or it
	 *     could be a lazy-evaluated function).
	 *	attachments: array of abstract Objects containing attachments. These objects will be passed directly to formuploader.js's AddFilePair function. See that function for supported object types.
	 *	prefs: per-submission preference object, specifying encrypt, sign, send unencrypted copy, and so on
	 * NOT SUBMITTED: Message-ID, general headers. This is circumscribed.
	 */
	ourSubmit : function ourSubmit(from, to, cc, bcc, subject,
	 inreplyto, references, body, isPlain, attachments, prefs)
	{
            fireGPGDebug("Parameters recevied : from: " + from +  " to:" +  to +  " cc:" +  cc +  " bcc:" +  bcc +  " subject:" +  subject +  " inreplyto:" +  inreplyto +  " isPlain:" + isPlain + " Sign ?" + prefs.sign + " Encrypt ?" +  prefs.encrypt, 'ourSubmit',  false);
		// first do generic From and To. If it fails here, then give
		// up. (But see advanced options to do, below. This code may
		// need to be moved back down.)	 now we need mailFrom and
		// rcptTo.

		var msg = new FireGPGMimeSender.Msg();

		var msgs = null;	// this will be an Array

        fireGPGDebug("Calling convertAddressLineToArray - parameters : from", 'ourSubmit',  false);
		var af = convertAddressLineToArray(from);
		if (af.length != 1) return false;
		msg.mailFrom = af[0];

		// NOTE: at this time it APPEARS to be the case that if you
		// try to send a message to yourself, Gmail SMTP will actually
		// save the first copy of the message. Not the last one or
		// whatever.
        fireGPGDebug("Calling convertAddressLineToArray - parameters : to", 'ourSubmit',  false);
        a = convertAddressLineToArray(to);
        fireGPGDebug("Calling convertAddressLineToArray - parameters : cc", 'ourSubmit',  false);
        a = convertAddressLineToArray(cc);
        fireGPGDebug("Calling convertAddressLineToArray - parameters : bcc", 'ourSubmit',  false);
        a = convertAddressLineToArray(bcc);
        fireGPGDebug("Calling convertAddressLineToArray - parameters : to-cc-bcc", 'ourSubmit',  false);

        msg.rcptTo =
		convertAddressLineToArray(to).concat(
		 convertAddressLineToArray(cc),
		 convertAddressLineToArray(bcc));
		if (!msg.rcptTo.length) return false;

		// TODO: support quoted-printable for other headers, not just subject
		msg.From = from;	// no exceptions
		if (to.length)
			msg.To = to;
		if (cc.length)
			msg.Cc = cc;

		if (inreplyto && inreplyto.length)
			msg.InReplyTo = inreplyto;
		if (references && references.length)
			msg.References = references;

		// conveniently, gmail SMTP will strip the bcc from the
		// header. But the user might want it recorded for reference.
		if (bcc.length)
			msg.Bcc = bcc;
		if (subject.length)
			msg.Subject = stUtil.makeRFC2047(subject);

		// date. (Note: we can get offset from UTC, but we can't get
		// the actual time zone) Sample: Tue, 15 May 2007 18:34:56
		// -0500 (CDT) note that CDT or Central Daylight Time or
		// whatever is a parenthetical, so it is pretty free-form
		// according to the docs
		var date = new Date();
		date.toRFC2822String = function()
		{
			var dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
			var moy = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep",
					   "Oct","Nov","Dec"];
			function f2s(i)
			{
				// warning: not tolerant of i > 99
				return (i < 10) ? "0" + i : i;
			}
			// format timezone. getTimezoneOffset is minutes west; we
			// want minutes EAST. Follow RFC 2822.
			function f4t(i)
			{
				if (i > 0)
				{
					var m = i % 60;
					return "-" + f2s((i - m)/60) + f2s(m);
				}
				else
				{
					i = -i;
					var m = i % 60;
					return "+" + f2s((i - m)/60) + f2s(m);
				}
			}
			var paren = this.toTimeString().match(/\(.+\)/);
			paren = (paren == null) ? "" : " " + paren;
			// save a byte on the date for < 10
			return dow[this.getDay()] + ", " + this.getDate() + " " +
			moy[this.getMonth()] + " " + this.getFullYear() + " " +
			f2s(this.getHours()) + ":" + f2s(this.getMinutes()) + ":" +
			f2s(this.getSeconds()) +
			" " + f4t(this.getTimezoneOffset()) + paren;
		}

		msg.Date = date.toRFC2822String();
		// get the comment

		// create message ID based on current date and some random string
		msg.MessageID = "<" + date.getTime().toString(36) +
		(Math.round(46656*46656*46656*36*Math.random())).toString(36) +
		"UYAxe124vaj_firegpg@mail.gmail.com>";

		// encoder appears to store the encapsulated data for Gmail submission.


		var encoder;
		encoder = new FireGPGMimeEncoder((attachments.length>0),1);
        //encoder = new FireGPGMimeEncoder(true,1); //Toujours multipart

		encoder.addBase64String(body,isPlain ? "text/plain; format=flowed" : "text/html",null);




		// HERE, we have to asynchronously fill out all of the remote attachments
		var i=0;
		if (!attachments.length) return postAttach.call(this);
		else return (function doAttachment(me)
		{
			function advance()
			{
				encoder.addFilePair("attachment",attachments[i],"base64");
				i++;
				if (i >= attachments.length) return postAttach.call(me);
				else return doAttachment(me);
			}
			if (attachments[i] instanceof Components.interfaces.nsIChannel) // nsIChannel or nsIHttpChannel
			{
				var binarystream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);

				// Required to get correct object inside the dataListener object.
				var outer = this;
				// Datalistener used to collect data from attachment.
				var dataListener =
				{
					data : "",
					onStartRequest: function(request, context){},
					onStopRequest: function(request, context, status)
					{
						if (status == 0)
						{
							attachments[i] = { data: this.data, channel: attachments[i]};  // yes this is an overload/hack, but that's the way it is.

							// since this is a callback, it is necessary to callback the more concrete class since it last heard "true" that it should still keep
							// the "Sending" progress information onscreen.
							if (!advance())
							{
								// XXX: Abstraction barrier violation!
								// TODO: create a generic callback interface
								if (typeof(me.setProgressMessage) == "function")
								{
									me.setProgressMessage(null);
								}
							}

						}
						// if something bad happened
						else
						{

						}
					},
					onDataAvailable: function(request, context, inputStream, offset, count)
					{
						if (offset == 0)
							binarystream.setInputStream(inputStream);
						this.data += binarystream.readBytes(count);
					},
				};
				// Start the asynchronous download
				attachments[i].asyncOpen(dataListener,null);
				return true; // can't block, so just say it's ok.
			}
			else return advance();
		})(this) // end doAttachment()
		return true;

		function postAttach()
		{
			var multiStream;
			if (attachments.length>0)
				multiStream=encoder.getMultipartStream("multipart/mixed",false);
			else
				multiStream=encoder.getSinglePartStream();
			var binaryStream =
			Components.classes["@mozilla.org/binaryinputstream;1"].
			createInstance(Components.interfaces.nsIBinaryInputStream);
			binaryStream.setInputStream(multiStream);
			msg.BodyPlus = binaryStream.readBytes(multiStream.available());

            const crlf = "\r\n";

            boundeur = "-----firegpg" + FIREGPG_VERSION_A + "eq" + (Math.round(Math.random()*99)+(new Date()).getTime()).toString(36) +
                (99+Math.round(46656*46656*46635*36*Math.random())).toString(36);

           // msg.BodyPlus += crlf;

         whoWillGotTheMail = prefs.whoWillGotTheMail;

            if (prefs.sign && !prefs.encrypt) {


                var result = FireGPG.sign(false,msg.BodyPlus + crlf);

                if (result.result == RESULT_SUCCESS) {
                    signedData = result.signed.substring(result.signed.lastIndexOf("-----BEGIN PGP SIGNATURE-----"), result.signed.length)

                  newmessage = 'X-FireGPG-Version: ' + FIREGPG_VERSION + crlf +
                  'Content-Type: multipart/signed; micalg=pgp-sha1; protocol="application/pgp-signature"; boundary="'+boundeur+'"' +  crlf + crlf +
                   'This is an OpenPGP/MIME signed message (RFC 2440 and 3156)' + crlf +
                   '--' + boundeur + crlf +
                   msg.BodyPlus + crlf  +
                   '--' + boundeur + crlf +
                   'Content-Type: application/pgp-signature; name="signature.asc"' + crlf +
                   'Content-Description: OpenPGP digital signature' + crlf +
                   'Content-Disposition: attachment; filename="signature.asc"' + crlf + crlf +
                   signedData + crlf +
                   '--' + boundeur + '--';

                   msg.BodyPlus = newmessage;

                } else {
                    return false;
                }


            } else if (prefs.sign) { //Sign + encrypted


                var result = FireGPG.cryptAndSign(false,msg.BodyPlus, null ,false,null, null, false, whoWillGotTheMail);

                if (result.result == RESULT_SUCCESS) {


                  newmessage = 'X-FireGPG-Version: ' + FIREGPG_VERSION + crlf +
                  'Content-Type: multipart/encrypted;  protocol="application/pgp-encrypted"; boundary="'+boundeur+'"' +  crlf + crlf +
                   'This is an OpenPGP/MIME encrypted message (RFC 2440 and 3156)' + crlf +
                   '--' + boundeur + crlf +
                   'Content-Type: application/pgp-encrypted' + crlf +
                    'Content-Description: PGP/MIME version identification' + crlf + crlf +
                   'Version: 1' + crlf  + crlf +
                   '--' + boundeur + crlf +
                   'Content-Type: application/octet-stream; name="encrypted.asc"' + crlf +
                   'Content-Description: OpenPGP encrypted message' + crlf +
                   'Content-Disposition: inline; filename="encrypted.asc"' + crlf + crlf +
                   result.encrypted + crlf +
                   '--' + boundeur + '--';

                   msg.BodyPlus = newmessage;

                } else {
                    return false;
                }

            } else { //Encrypted


                var result = FireGPG.crypt(false,msg.BodyPlus,null, false, false,whoWillGotTheMail);

                if (result.result == RESULT_SUCCESS) {


                  newmessage = 'X-FireGPG-Version: ' + FIREGPG_VERSION + crlf +
                  'Content-Type: multipart/encrypted;  protocol="application/pgp-encrypted"; boundary="'+boundeur+'"' +  crlf + crlf +
                   'This is an OpenPGP/MIME encrypted message (RFC 2440 and 3156)' + crlf +
                   '--' + boundeur + crlf +
                   'Content-Type: application/pgp-encrypted' + crlf +
                    'Content-Description: PGP/MIME version identification' + crlf + crlf +
                   'Version: 1' + crlf  + crlf +
                   '--' + boundeur + crlf +
                   'Content-Type: application/octet-stream; name="encrypted.asc"' + crlf +
                   'Content-Description: OpenPGP encrypted message' + crlf +
                   'Content-Disposition: inline; filename="encrypted.asc"' + crlf + crlf +
                   result.encrypted + crlf +
                   '--' + boundeur + '--';

                   msg.BodyPlus = newmessage;

                } else {
                    return false;
                }

            }



           // return false;

                    /*

                              */




            // just put the message AS IS into the array.
            msgs = [msg];

			this.ourSending(msgs);
			return this.smtpSend(msgs, prefs); // TODO: handle returned error.
		}
	}, // end ourSubmit

	// smtpSend sends an array of messages along.
	// see return codes for ourSubmit
	// TODO: handle errors more gracefully. Do some variable checking.
	smtpSend : function(msgs, prefs)
	{
		try
		{
			// start counting msg array.
			var i = 0;
			var msg;	// shorthand for the PARTICULAR message msgs[i]

			// import into local scope (for the pump, this variable
			// will change), but only for this.ourSent at the end!
			var myself = this;
			if (!(msgs instanceof Array)) return false;
			if (!msgs.length) return false;

			var dns = Components.classes["@mozilla.org/network/dns-service;1"]
			.getService(Components.interfaces.nsIDNSService);
			var transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"]
			.getService(Components.interfaces.nsISocketTransportService);
			smtpTransport =
			transportService.createTransport(
											 this.smtpSocketTypes,
											 this.smtpSocketTypes ? this.smtpSocketTypes.length : 0,
											 this.smtpServer, this.smtpPort, null);
			// the output stream will block until ALL data is sent or the thread is closed.
			var outputStream = smtpTransport.openOutputStream(smtpTransport.OPEN_BLOCKING, 0, 0);
			var inStream = smtpTransport.openInputStream(0, 0, 0); // this interface is not scriptable
			var inputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(
																										Components.interfaces.nsIScriptableInputStream);
			inputStream.init(inStream);

			// constant
			var crlf = "\r\n";

			// 0 just starting; {1-4 are reserved for TLS, if ever
			// implemented}; ; 10 finished sending FROM, send TO;
			var status = 0;
			// needed to count how many rcptTo values we have issued already.
			var rcptToCount = 0;

			// we need the username and password in advance;
			// hence, don't raise a UI request when the connection
			// is hanging below.
			var smtpUsername = typeof(this.smtpUsername) == "function" ?
			this.smtpUsername() : this.smtpUsername;

			var smtpPassword = null;
			if (smtpUsername)
			{
				smtpUsername = btoa(smtpUsername) + crlf;
				// TODO: consider cases where the user provides a
				// USERNAME but has NO PASSWORD (no password
				// required, as opposed to a blank password, which
				// in theory would be btoa("") which is also "".
				smtpPassword =
					btoa(typeof(this.smtpPassword) == "function" ?
						 this.smtpPassword() : this.smtpPassword) + crlf;
			}
			// 100 done, sent mail; 101 done, mail sending failed.
			// var connected = false;

			// log SMTP transmission messages
			function log(m)
			{
				var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
//			  var scriptError = Components.classes["@mozilla.org/scripterror;1"].createInstance(Components.interfaces.nsIScriptError);
				fireGPGDebug(m, 'smtplog');
			}
			// dataListener communicates with the server and sends the data
			// NOTE: var o is output message to send along the pipe
			var dataListener =
			{
				err: false,
				onStartRequest: function(request, context)
				{
					// enable ESMTP
					var o = "EHLO [127.0.0.1]" + crlf;
					outputStream.write(o, o.length);
				},
				onStopRequest: function(request, context, status)
				{
					if (msg && typeof(msg) == "object") // NOTE: typeof(null) == "object" !!
						msg.sent = false;		// note that the current message is false (this should propagate by reference to msgs[i])
					log("SMTP Closed");
					outputStream.close(); // not convinced these are necessary...?
					inputStream.close();
					myself.ourSent(msgs, this.err, prefs);
				},
				onDataAvailable: function(request, context, inStream, offset, count)
				{ // note: overshadows inStream
					var ret = inputStream.read(count);
					var o = null;
					log("< " + ret);
					switch (status)
					{
					case 0:
						switch (ret.substring(0, 3))
						{
						case "220": // greetings
							if (smtpUsername == null || smtpPassword == null)
								status = 6; // straight to begin from sequence.
							return;
						case "250": // we do auth
							o = "AUTH LOGIN" + crlf;
							status = 5;
							break;
						} break;
						/* case 1-4 reserved in case needed for STARTTLS */
					case 5: // authentication
						if (ret.substring(0, 3) == "334")
						{
							o = smtpUsername;
							status = 6;
						}
						break;
					case 6: switch (ret.substring(0, 3))
						{
						case "334":
							o = smtpPassword;
							break;
						case "235": // accepted
							// clear memory
							smtpUsername = null;
							smtpPassword = null;
						case "250": // no auth
							// set msg.
							msg = msgs[i];
							// execute FROM
							o = "MAIL From:<" + msg.mailFrom + ">" + crlf;
							status = 10;
							break;
						case "454": // You'll probably get 4.7.0 Cannot authenticate due to temporary system problem. Try again later.
							o = "QUIT" + crlf; // we're done.
							// Note that we do not want to set msg.sent because msg is null, and none of the msgs are "bad."
							// The msgs can theoretically be resent later.
							this.err = ret;
							status = 101;
							break;
						case "535": // credentials rejected
							o = "QUIT" + crlf;
							this.err = ret;
							status = 101;
							break;
						} break;
					case 10: switch (ret.substring(0,3))
						{
						case "250": // execute receipt to:
							o = "";
							// TODO: error case of rcptTo malformed (no length?)
							// 7/16/2008: do these one at a time; wait for response.
							if (rcptToCount < msg.rcptTo.length)
							{
								o = "RCPT To:<" + msg.rcptTo[rcptToCount++] + ">" + crlf;
								if (rcptToCount == msg.rcptTo.length)
								{
									// advance in status (finite state machine).
									rcptToCount = 0;
									status = 11;
								}
							}
							else
							{
								this.err = "ERR Out of sync on counting RCPT To: values.";
								status = 101;
							}
							break;
						} break;
					case 11: switch (ret.substring(0,3))
						{
						case "250":
							o = "DATA" + crlf; // someday, support CHUNKING (BDAT),
							// but current gmail implementation does not support it so who cares
							break;
						case "354":
							//TODO: remove this debugging statement (note: it is a debugging statement, not a communication message)
							if (msg.Body != null) jsdump("msg.Body is NOT NULL!!!!! Body:\n" + msg.Body);
							// TODO: if "From"? What does rfc822 say about no From: header?
							o = "From: " + msg.From + crlf;
							if (msg.To)
								o += "To: " + msg.To + crlf;
							if (msg.Cc)
								o += "Cc: " + msg.Cc + crlf;
							// This is useful for gmail remembering
							// which e-mails are ACTUALLY bcc'd. If
							// you do not want gmail to record the
							// bccs, do not include this bcc
							// line. Gmail appears still to deliver
							// the e-mails correctly (based on the
							// RCPT To: information), but has no
							// memory of it at least in the Gmail UI!
							if (msg.Bcc)
								o += "Bcc: " + msg.Bcc + crlf;
							// TODO: consider merging Date, Message-ID, In-Reply-To, and References into one OtherHeader.
							// TODO: consider merging all of these into one Header.
							if (msg.Date)
								o += "Date: " + msg.Date + crlf;
							// NOTE: Message-ID is STRONGLY RECOMMENDED
							if (msg.MessageID && msg.MessageID[0] == "<" && msg.MessageID[msg.MessageID.length - 1] == ">")
								o += "Message-ID: " + msg.MessageID + crlf; // TODO: mx.google.com VERSUS mail.gmail.com VERSUS different domain

							if (msg.Subject)
								o += "Subject: " + msg.Subject + crlf;

							if (msg.InReplyTo && msg.InReplyTo[0] == "<" && msg.InReplyTo[msg.InReplyTo.length - 1] == ">")
								o += "In-Reply-To: " + msg.InReplyTo + crlf;

							if (msg.References && msg.References[0] == "<" && msg.References[msg.References.length - 1] == ">")
								o += "References: " + msg.References + crlf;

								// MIME
							o += "MIME-Version: 1.0" + crlf;
							if (msg.ContentTransferEncoding)
								o += "Content-Transfer-Encoding: " + msg.ContentTransferEncoding + crlf;

							if (msg.ContentDisposition)
								o += "Content-Disposition: " + msg.ContentDisposition + crlf;

							if (msg.ContentDescription)
								o += "Content-Description: " + msg.ContentDescription + crlf;

							if (msg.ContentType)
								o += "Content-Type: " + msg.ContentType + crlf;

							//							o += crlf; // end headers

							// premature write. because we have to.
							log("> (headers:)\n" + o);
							outputStream.write(o, o.length);
							// write whole body and remaining headers.
							var bout = 0; // for examination & debugging purposes only.
							/**
							 * The Length.
							 */
							//							var tl = 0x7F00;
							if (typeof(msg.BodyPlus) == "string")
							{
								/*								log("bpl: " + msg.BodyPlus.length);
									  var fullchunks = (msg.BodyPlus.length / tl)>>0; // floor.
									  log("cks: " + fullchunks);
									  log("lft: " + (msg.BodyPlus.length % tl));
									  var compile = "";
									  try {
									  for (var bpl = 0; bpl < fullchunks; bpl++) {
									  bout = outputStream.write(msg.BodyPlus.substring(bpl * tl), tl);
									  compile += msg.BodyPlus.substring(bpl * tl, (bpl+1)*tl);
									  outputStream.flush();
									  }
									  bout = outputStream.write(msg.BodyPlus.substring(bpl * tl), msg.BodyPlus.length % tl);
									  compile += msg.BodyPlus.substring(bpl * tl);
									  outputStream.flush();
									  if (compile == msg.BodyPlus) alert("Eureka it's the same!!");
									  } catch (e) {
									  jsdump(e);
									  } */

								// this may block for a _long time_.
								try
								{
									log("> (body, length " + msg.BodyPlus.length + " bytes)");
									bout = outputStream.write(msg.BodyPlus, msg.BodyPlus.length);
								} catch (e)
								{
									jsdump("outputStream.write error");
									jsdump(e);	// not sure if this would ever be called, but not sure what happens when prematurely closed
								}
							}
							else if (typeof(msg.BodyPlus) != "undefined")
							{ // TODO: make this a check for nsIStream or somesuch.
								debugger;		// need to make sure this works.
								bout = outputStream.writeFrom(msg.BodyPlus, -1);
							}
							// TODO: is the Body supposed to include a trailing CRLF per the rfc822 spec, or is CRLF.CRLF considered the end part?
							// I claim that it is not...
							// (Consider the case where Body could be BINARY for binary transfers vs. 8bit vs. 7bit)
							o = crlf + "." + crlf; // END
							status = 22;
						} break;
					case 22:
						if (ret.substring(0, 3) == "250")
						{
							// Message successfully sent!
							msg.sent = true;
							if ((++i) < msgs.length)
							{
								// perform the equivalent of case 6 (second half)
								msg = msgs[i];
								// execute FROM
								o = "MAIL From:<" + msg.mailFrom + ">" + crlf;
								status = 10;
							}
							else
							{
								msg = null; // just in case.
								o = "QUIT" + crlf; // we're done.
								status = 100;
							}
						}	break;
					case 100:
						if (ret.substring(0, 3) == "221")
							return;
						break;
					} // end status switch
					// Only an error if message is not "closing connection"
					if (o == null && ret.substring(0,3) != "221")
					{
						// TODO: make more pretty.
						alert("Mail not sent by SMTP!\nLatest ret: " + ret+" status:"+status);
						// terminate connection, but use the normal channels
						o = "QUIT" + crlf;
						log("> QUIT");
						outputStream.write(o, o.length);
						this.err = ret;
						status = 101;
						debugger;
					}
					else
					{
						log("> " + o);
						outputStream.write(o, o.length);
					}
				}
			};

			var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(
																									 Components.interfaces.nsIInputStreamPump);
			// do not close on completion; close manually
			pump.init(inStream, -1, -1, 0, 0, false);
			// no need for context because of the function closure
			pump.asyncRead(dataListener, null);

			return true;	// def: sending (async)
		}
		catch (e)
		{
			alert("exception on upload:"+e); // TODO: make pretty.
			return false;
		}
	}, // end smtpSend



}; // end FireGPGMimeSender

FireGPGMimeSender.prototype.Msg.prototype =
{
	From: null,
	To: null,
	Cc: null,
	Bcc: null,
	Subject: null,
	InReplyTo: null,
	References: null,
	/**
	 * @deprecated
	 */
	Body: null,
	/**
	 * Specifies the RFC2822 body and extra headers. Thus, a body alone, without headers,
	 * must be stored in BodyPlus with a leading \r\n.
	 */
	BodyPlus: null,
	mailFrom: null,
	rcptTo: null,
	Date: null,
	/**
	 * MessageID must be of the form <ID@DOMAIN>, with < as the first char and > as the last char.
	 */
	MessageID: null,
	/**
	 * @deprecated
	 */
	ContentTransferEncoding: null,
	/**
	 * @deprecated
	 */
	ContentDisposition: null,
	/**
	 * @deprecated
	 */
	ContentDescription: null,
	/**
	 * @deprecated
	 */
	ContentType: null,
	// TODO: In-Reply-To, References
	/**
	 * copy constructor. copy the object, but the refs remain the same.
	 */
	ShallowCopy: function()
	{
		var nmsg = new SmimeSender.prototype.Msg();

		nmsg.From= this.From;
		nmsg.To= this.To;
		nmsg.Cc= this.Cc;
		nmsg.Bcc= this.Bcc;
		nmsg.Subject= this.Subject;
		nmsg.InReplyTo= this.InReplyTo;
		nmsg.References= this.References;
		nmsg.Body= this.Body; // TODO: delete.
		nmsg.BodyPlus = this.BodyPlus;
		nmsg.mailFrom= this.mailFrom;
		nmsg.rcptTo= this.rcptTo;
		nmsg.Date= this.Date;
		nmsg.MessageID= this.MessageID;
		nmsg.ContentTransferEncoding= this.ContentTransferEncoding;
		nmsg.ContentDisposition= this.ContentDisposition;
		nmsg.ContentDescription= this.ContentDescription;
		nmsg.ContentType= this.ContentType;
		// nmsg.ShallowCopy= this.ShallowCopy unnecessary
		return nmsg;
	}
};
FireGPGMimeSender.Msg = FireGPGMimeSender.prototype.Msg; // shorthand








// Constructor.
function FireGPGGmailMimeSender(form, db, i18n)
{
	this.form = form;
    this.discardButton = db;
    this.i18n = i18n;

} // end FireGPGGmailMimeSender constructor

FireGPGGmailMimeSender.prototype = new FireGPGMimeSender();

FireGPGGmailMimeSender.prototype.ourSending = function(msgs)
{
	// TODO: make more robust by saying how many messages are being sent and the total transfer size, etc.
	cGmail2.setProgressMessage( this.form , this.i18n.getString("GmailSendingMail") + " (" + Math.max(1,Math.round(msgs[0].BodyPlus.length / 1024)) + "K)");
}

// Implementation of abstract value/method from SmimeSender
FireGPGGmailMimeSender.prototype.smtpPassword = function()
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

FireGPGGmailMimeSender.prototype.getRealm = function()
{
	var sslmode = (this.smtpSocketTypes && this.smtpSocketTypes[0] == "ssl");
	return "smtp" + (sslmode ? "s" : "") + "://" + this.smtpServer +
	((this.smtpPort == (sslmode ? 465 : 25)) ? "" : (":"+this.smtpPort));
};

FireGPGGmailMimeSender.prototype.smtpSeparatePassword = function()
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
FireGPGGmailMimeSender.prototype.ourSent = function(msgs, err, prefs)
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
					fireGPGDebug ("Internal error while sending mail...", "Gmail-mime-send-oursend", true);
				}


				cGmail2.setProgressMessage( this.form, null);
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
                    var messageTd = this.ownerDocument.evaluate(".//td[@class='m14Grb']", this, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//						printAncestors("DOMAttrModified", e.target);
//						jsdump("ChangeStatusMessage executing...");
                    if (this.style.visibility != "hidden")
                    {
//							jsdump("ChangeStatusMessage activated!");
                        this.removeEventListener("DOMAttrModified", changeStatusMessage, false);
                        // set the bottom of the message stack, as appropriate
                        var msgs = this.ownerDocument.evaluate(".//div[contains(@class, 'diLZtc')]//table/tr/td[contains(@class, 'eWTfhb')]//div[contains(@class, 'aWL81')]/div[position()=2]", this.ownerDocument.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
                        if (!msgs) messageTd.innerHTML = cGmail2.i18n.getString("MessageSend");
                        else
                        {
//							jsdump("Doing tha alternative");
                            messageTd.innerHTML = "Doop!!";
                            this.style.visibility = "hidden";
                            var newmsgdiv = this.ownerDocument.createElement("div");
                            newmsgdiv.className = "XoqCub";
                            newmsgdiv.setAttribute("style", "");
                            msgs.appendChild(newmsgdiv);
                            newmsgdiv.innerHTML = '<div class="n38jzf" style=""><table cellspacing="0" cellpadding="0" class="cyVRte"><tbody><tr><td class="EGPikb" style="background-position: 0px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/><td class="Ptde9b"/><td class="EGPikb" style="background-position: -4px 0px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/></tr><tr><td class="Ptde9b"/><td class="m14Grb">' +
cGmail2.i18n.getString("MessageSend") + '</td><td class="Ptde9b"/></tr><tr><td class="EGPikb" style="background-position: 0px -4px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/><td class="Ptde9b"/><td class="EGPikb" style="background-position: -4px; background-repeat: no-repeat; background-image: url(rc?a=af&c=fff1a8&w=4&h=4);"/></tr></tbody></table></div>';

                            function removeNote(e)
                            {
                                this.removeEventListener("DOMNodeInserted", removeNote, false);
                                this.removeChild(newmsgdiv);
                            }
                            msgs.addEventListener("DOMNodeInserted", removeNote, false);
                        }
                    }
//					}
            }
            // DEPRECATED: this.statusMessage.statusDiv. It is BAD when sending a reply that is non-encrypted, followed by an encrypted reply.
            // 0.3.2: removed: div[@class='fgrX7c']//div[@class='IY0d9c']/div[contains(@class, 'EGSDee')]/
            var sD = d.evaluate(".//div/div[@class='n38jzf' and table/@class='cyVRte']", d.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//				printAncestors("statusDiv", sD);
            cGmail2.i18n = this.i18n;
            sD.addEventListener("DOMAttrModified", changeStatusMessage, false);
//				sD.addEventListener("DOMNodeInserted", function (e) {printAncestors("Inserted! ", e.target); }, false);
//				sD.addEventListener("DOMNodeRemoved", function (e) {printAncestors("Removed! ", e.target); }, false);

            var discardevent=d.createEvent("MouseEvents");
            discardevent.initMouseEvent("click", true, true, d.defaultView, 0, 0, 0, 0, 0, false, false, false, false, 0, null);
            var discardcanceled = this.discardButton.dispatchEvent(discardevent);


            //FireGPG :
            //Dosen't seem to work for reply insides mail : our method
            divs = d.getElementsByClassName('n38jzf', 'div');
            for (var i=0;i<divs.length;i++) {

                if (divs[i].getAttribute("style") == "") {

                    tds = divs[i].getElementsByClassName('m14Grb', 'td');
                    tds[0].innerHTML = this.i18n.getString("MessageSend");

                }

            }


        }


	}
	catch (e)
	{
		fireGPGDebug(e, "mime / ourSent", true);
		debugger;
	}
	cGmail2.setProgressMessage(f, null);
}; // end ourSent


/**
 * This function converts an rfc822-style address line, such as:
 *     Joe User <joe.user@someplace.com>
 *	or
 *     "One \"Two\" Three" <cyz9+nospam@x.com> (Useless Comment), intradomain, interdomain@spartan.com
 *   to an array of e-mail addresses.
 * TODO: make this function vigorous and robust. Find complex parsing algorithms, or do it yourself
 * piecemeal (as opposed to using a regexp).
 */
function convertAddressLineToArray(line)
{
	function trim(g)
	{
		g = g.replace( /^\s+/g, "" ); // leading
		return g.replace( /\s+$/g, "" ); // trailing
	}

    if (line == undefined) {
        fireGPGDebug("Undefined line in convertAddressLineToArray, return '' anyways", 'convertAddressLineToArray',  true);
        return "";
        }

	var a = new Array();
	//var j = 0;
	var t = line.split(",");	// split by comma
	for (var i = 0; i < t.length; i++)
	{
		var at = t[i].indexOf("@");
		if (at == -1) continue;
		var lt = t[i].indexOf("<");
		var gt = t[i].indexOf(">");
		if (lt == -1 && gt == -1)
		{
			t[i] = trim(t[i]);
			at = t[i].indexOf("@");
			if (at <= 0 || at == (t[i].length - 1)) // -1 should never happen
				continue;
			else
				a.push(t[i]);
		}
		if (lt < gt)
		{
			t[i] = trim(t[i].substring(lt+1,gt));
			at = t[i].indexOf("@");
			if (at <= 0 || at == (t[i].length - 1))
				continue;
			else
				a.push(t[i]);
		}
	}
	return a;
} // end function convertAddressToArray

/**
 * This function splits lines into 76-character chunks. This is useful
 * for stuffing base64 into an rfc822 message.
 */
function breakLines(t)
{
	// this appears to be the fastest--slightly faster than array.join("\r\n") (because it takes a little bit of time to compose the array, too);
	theresult = t.replace(/[\s\S]{76}/g,"$&\r\n");
	return theresult;
}

var stUtil =
{
/**
	 * Make an RFC 2047-compliant string by escaping the extended characters
	 * with UTF-8.
	 */
	makeRFC2047: function makeRFC2047(x)
	{
		// using quoted-printable because it gives a little hint as to the contents
		// whereas base64 is pretty obfuscated
		function qp(x)
		{
			var y = "", z = 0;
			for (var i = 0; i < x.length; i++)
			{ // we assume all are < 256
				z = x.charCodeAt(i);
				if (z < 16)
				{
					y += "=0" + z.toString(16);
				}
				else if (z < 32 || z > 126)
				{
					y += "=" + z.toString(16);
				}
				else
				{
					y += x.charAt(i);
				}
			}
			return y;
		}
		// sets the subject of the Msg to be RFC-2047 compliant.
		for (var i = 0; i < x.length; i++)
		{
			if (x.charCodeAt(i) > 0x7F)
				return "=?UTF-8?Q?" + qp(unescape(encodeURIComponent(x))) + "?=";
		}
		return x;
	},

	/**
	 * Return a Unicode string from an RFC 2047-compliant string by unescaping the characters. This function
	 * assumes that there are no extraneous spaces or newlines (\r\n) in the string entity.
	 * @param x a string containing RFC 2047-encoded data. typeof(x) must be "string".
	 */
	fromRFC2047: function fromRFC2047(x)
	{
		// turns quoted-printable back into the original source (e.g., UTF-8)
		// TODO: at present, this function passes the high-order bit (8-bit) through. This may be undesirable.
		function pq(x)
		{
			var y = "";
			for (var i=0;i<x.length;i++)
			{
				if (x[i] === "=")
				{
					y += String.fromCharCode(parseInt(x.substring(i+1,i+3),16));
					i += 2; // two additional characters consumed
				}
				else y += x[i];
			}
			return y;
		}
		if (x.substring(0,2) !== "=?") return x;
		var charsete = x.indexOf("?", 2);
		if (charsete == -1) return "";
		var encodinge = x.indexOf("?", charsete+1);
		if (encodinge == -1 || (encodinge - charsete) != 2) return "";
		var encodedtexte = x.indexOf("?=", encodinge+1);
		if (encodedtexte == -1) return "";

		var charset = x.substring(2,charsete);

		var encoding = x.substring(charsete+1,encodinge);
		if (encoding !== "Q" && encoding !== "B") return "";

		var decodedtext = (encoding === "Q") ? pq(x.substring(encodinge+1,encodedtexte)) : atob(x.substring(encodinge+1,encodedtexte));

		if (charset.toLowerCase() === "iso-8859-1") return decodedtext;
		else if (charset.toLowerCase() === "utf-8") return decodeURIComponent(escape(decodedtext));
		else
		{
			jsdump("RFC2047 charset not supported!!!!!");
			debugger;
			return "";
		}
	},

    	addClassName: function addClassName(el, name)
	{
		if (!el.className) return null;
		var a = el.className.split(" ");
		for (var i = 0; i < a.length; i++)
		{
			// this is a case-sensitive implementation
			if (a[i] == name) return el.className;
		}
		a.push(name);
		el.className = a.join(" ");
		return el.className;
	},

	removeClassName: function removeClassName(el, name)
	{
		if (!el.className) return null;
		var a = el.className.split(" ");
		for (var i = 0; i < a.length; i++)
		{
			// this is a case-sensitive implementation
			if (a[i] == name)
			{
				a.splice(i,1);
				el.className = a.join(" ");
				return el.className;
			}
		}
		return el.className;
	},

}