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


FireGPGMimeDecoder = function(data)
{

	this.init(data);
};

FireGPGMimeDecoder.prototype = {
	data: null,
    mainPart: null,
    attachements: null,

    init: function(data) {

		this.data = convertCRLFToStandarts(data);
        this.parse();

	},

    /* PARSING */

    parse: function() {

        this.mainPart = this.mimeParsing(this.data);

    },

    mimeParsing: function(texte) {
        var part = new Object();
        part.texte = texte;
        part.headers = this.parseHeaders(texte);
        part.body = this.removeHeaders(texte, part.headers);
        part.clearBody = this.clearBody(part.body, part.headers);
        part.openpgpmimesigned = (part.headers["CONTENT-TYPE"] != undefined && part.headers["CONTENT-TYPE"].indexOf('"application/pgp-signature"') != -1 );
        part.openpgpmimeencrypted = (part.headers["CONTENT-TYPE"] != undefined && part.headers["CONTENT-TYPE"].indexOf('"application/pgp-encrypted"') != -1 );
        part.multipart = (part.headers["CONTENT-TYPE"] != undefined && part.headers["CONTENT-TYPE"].indexOf('multipart') != -1 );
        part.attachement = (part.headers["CONTENT-DISPOSITION"] != undefined && (part.headers["CONTENT-DISPOSITION"].indexOf('inline') != -1 || part.headers["CONTENT-DISPOSITION"].indexOf('attachment') != -1 ));
        part.charset = this.extractCharset(part.headers["CONTENT-TYPE"]);

        if (part.multipart) {

            part.boundary = this.extractBoundary(part.headers["CONTENT-TYPE"]);
            part.subparts = new Array();

            var done = false;

            var basePosition = part.body.indexOf('--' + part.boundary);

            while(done == false && basePosition != -1) {
                var nbasePosition = part.body.indexOf('--' + part.boundary, basePosition + 1);

                var subpartText = part.body.substring(basePosition + ('--' + part.boundary).length + 2 /*crlfcrlf*/, nbasePosition);

                part.subparts.push( this.mimeParsing(subpartText));


                if (nbasePosition == part.body.indexOf('--' + part.boundary + '--', basePosition +1))
                    done = true;
                else
                    basePosition = nbasePosition;
            }

            part.numberofsubparts = part.subparts.length;
        }

        return part;

    },

    mimeToText: function(mimePart) {

        dataPart = this.findContentPart(mimePart);

        if (dataPart == null)
            return "";


        message = dataPart.clearBody;


        return this.washForInsertion(message, mimePart.headers["CONTENT-TYPE"] && mimePart.headers["CONTENT-TYPE"].indexOf('text/html') != -1);
    },

    findContentPart: function(mimePart) {

        if (mimePart.multipart == false) {
            if (!mimePart.attachement)
                return mimePart;
            else {
                return null;
            }
        }


        for(i = 0; i < mimePart.numberofsubparts; i ++) {

            subP = this.findContentPart(mimePart.subparts[i]);

            if (subP != null) {
                return subP;
            }

        }


        return null;

    },

    clearBody: function(body, headers) {

        if (headers['CONTENT-TRANSFER-ENCODING']) {

            switch(headers['CONTENT-TRANSFER-ENCODING']) {
                case "quoted-printable":
                    return  convertCRLFToStandarts(this.convertFromQP(body));
                    break;

                case "8bit":
                    break;

                case "base64":
                    return convertCRLFToStandarts(this.convertFromB64(body));
                    break;

            }
        }

        return body;
    },

    getAttachements: function() {
        return attachements;
    },

    parseHeaders: function(message) {

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

                currentHeader = message[i].substring(0, message[i].indexOf(":")).toUpperCase();
                headers[currentHeader] = trim(message[i].substring(message[i].indexOf(":") + 1 , message[i].length));

            }


        }

        return headers;


    },

    removeHeaders: function(message,headers) {

        if (message.indexOf("\r\n\r\n") == -1)
            return message;

        if (headers == undefined)
            headers = this.parseHeaders(message);

        if (headers['CONTENT-TYPE'] != undefined || headers['CONTENT-DISPOSITION'] != undefined || headers['CONTENT-TRANSFET-ENCODING'] != undefined)
            message = message.substring(message.indexOf("\r\n\r\n") + 4, message.length); //EndOfHeaders

        return message;

    },

    /* WASHING */
    washForInsertion: function (texte, html) {

        if (html)
            texte = this.washFromHtml(texte);


        return this.washFromPlain(texte);

    },

    washFromPlain: function(texte) {

        texte = texte.replace(/</gi, "&lt;"); // Security
        texte = texte.replace(/>/gi, "&gt;");
        texte = texte.replace(/\r\n/gi, "<br />");
        texte = texte.replace(/\r/gi, "<br />");
        texte = texte.replace(/\n/gi, "<br />");

        return texte;
    },

    washFromHtml: function(texte) {

        texte = texte.replace(/(\n|\r)/gi, "");
        texte = texte.replace(/<br( |\/)?>/gi, "\r\n");
        texte = texte.replace(/<\/?[^>]+(>|$)/g, "");

        return texte;
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

    convertFromB64: function(texte) {

        return Base64.decode(texte);

    },

    /* EXTRACTOR */

    //OPENPGPMIME
    extractSignedPart: function(mimePart) {

        //Hash
        hash = this.convertHash(mimePart.headers["CONTENT-TYPE"]);

        if (hash == '') {
            fireGPGDebug('Unknow hash ' + mimePart.headers["CONTENT-TYPE"], 'MimeDecoder-extractSignedPart', true);
            return '';
        }

        //Signed part
         if (mimePart.subparts[0])
            text = mimePart.subparts[0].texte;
        else {
            fireGPGDebug ('Signed mail, but no subpart#0 ???', 'MimeDecoder-extractSignedPart', true);
            return '';
        }

        signed = text.replace(/\r\n\-/gi, "\r\n- -");

        //Signature
        if (mimePart.subparts[1])
            data = mimePart.subparts[1].body;
        else {
            fireGPGDebug ('Signed mail, but no subpart#1 ???', 'MimeDecoder-extractSignedPart', true);
            return '';
        }

        signature = data .substring(data.indexOf("-----BEGIN PGP SIGNATURE-----\r\n") , data.indexOf("-----END PGP SIGNATURE-----") + ("-----END PGP SIGNATURE-----").length)

        //Final data
        return ("-----BEGIN PGP SIGNED MESSAGE-----\r\nHash: "+hash+"\r\n\r\n"+signed+signature).replace(/\r/gi, '');


    },
    //OPENPGPMIME
    extractEncryptedPart: function(mimePart) {

        //Signature
        if (mimePart.subparts[1])
            data = mimePart.subparts[1].body;
        else {
            fireGPGDebug ('Encrypted mail, but no subpart#1 ???', 'MimeDecoder-extractSignedPart', true);
            return '';
        }

        data = data.substring(data.indexOf("-----BEGIN PGP MESSAGE-----\r\n") , data.indexOf("-----END PGP MESSAGE-----") + ("-----END PGP MESSAGE-----").length);

        //Final data
        return data.replace(/\r/gi, '');


    },

    //INLINE
    extractSignature: function(mimePart) {


    },

    ///INLINE
    extractEncrypted: function(mimePart) {


    },

    convertHash: function(hashHeader) {

        hash = Array();
        hash['pgp-md5'] = 'MD5';
        hash['pgp-sha1'] = 'SHA1';
        hash['pgp-ripemd160'] = 'RIPEMD160';
        hash['pgp-md2'] = 'MD2'; // ???
        hash['pgp-tiger192'] = 'TIGER192'; // ???
        hash['pgp-haval-5-160'] = 'HAVAL-5-160'; // ???

        hashHeader = hashHeader + ";";


        var reg1 = /micalg="([a-zA-Z0-9\-]*)"( |;)/;
        result = reg1.exec(hashHeader);
        if (result && result[1] != "")
            return hash[result[1].toLowerCase()];

        var reg2 = /micalg=([a-zA-Z0-9\-]*)( |;)/;
        result = reg2.exec(hashHeader);
        if (result && result[1] != "")
            return hash[result[1].toLowerCase()];

        return '';


    },

    extractBoundary: function(header) {

        header += ";";

        var reg1 = /boundary="([^( |;)]*)"( |;)/;
        result = reg1.exec(header);
        if (result && result[1] != "")
            return result[1];

        var reg2 = /boundary=([^( |;)]*)( |;)/;
        result = reg2.exec(header);
        if (result && result[1] != "")
            return result[1];

        return '';


    },

    extractCharset: function(header) {


        if (!header || header == "")
            return "UTF-8";

            header+=" ";

          var reg1 = /charset="([^( |;)]*)"( |;)/;
            result = reg1.exec(header);
            if (result && result[1] != "")
                return  result[1];
            else {

                var reg2 = /charset=([^( |;)]*)( |;)/;
                result = reg2.exec(header);
                if (result && result[1] != "")
                    return  result[1];
                else
                    return "UTF-8";
            }


    },

    extractMimeId: function() {

        if (this.saveid)
            return saveid;

        if (this.mainPart && this.mainPart.headers && this.mainPart.headers["MESSAGE-ID"])
            return this.mainPart.headers["MESSAGE-ID"];

        return '';

    },

    /* DETECTORS */
    detectGpGContent: function(stopOnDecrypt) {

        var retour = new Object();
        retour.completeSignOrDecrypt = false;
        retour.signResult = null;
        retour.decryptresult = null;
        retour.decryptDataToInsert = null;

        minedecrypt = this.MimeDecrypt(stopOnDecrypt);

        if (minedecrypt.decryptData) {

           if (minedecrypt.completeSignOrDecrypt)
                retour.completeSignOrDecrypt = true;

            retour.decryptresult = minedecrypt.decryptresult;
            retour.decryptDataToInsert = minedecrypt.decryptDataToInsert;
        }

        mimesign = this.MimeSign();

        if (mimesign.signedData) {

            if (mimesign.completeSignOrDecrypt)
                retour.completeSignOrDecrypt = true;

            retour.signResult = mimesign.signResult;


        }

        //Pas d'openpgpmime, on cherche en inline
        if (!minedecrypt.decryptData) {

            inlinedecrypt = this.Decrypt();

            if (inlinedecrypt.decryptData) {
                //On considère l'inline comme complet
                retour.completeSignOrDecrypt = true;

                retour.decryptresult = inlinedecrypt.decryptresult;
                retour.decryptDataToInsert = inlinedecrypt.decryptDataToInsert;

            }



        }

        //Pas d'openpgpmime, on cherche en inline


        if (!mimesign.signedData) {

            inlinesign = this.Sign();

            if (inlinesign.signedData) {
                //On considère l'inline comme complet
                retour.completeSignOrDecrypt = true;

                retour.signResult = inlinesign.signResult;

            }
        }

        retour.attachements = new Array();
        /*//Si pas completeSignOrDecrypt
        retour.attachements[0].signResult = "";
        //Si pas completeSignOrDecrypt OU fichier chiffré
        retour.attachements[0].decryptresult = "";
        retour.attachements[0].decryptDataToInsert = "";

        //Si pas completeSignOrDecrypt
        retour.subparts = new Array();
        retour.subparts[0].signResult = "";
        retour.subparts[0].decryptresult = "";
        retour.subparts[0].decryptDataToInsert = "";*/


        return retour;


    },

    MimeDecrypt: function(stopOnDecrypt) {

        var retour = new Object();
        retour.completeSignOrDecrypt = false;
        retour.decryptresult = null;
        retour.decryptDataToInsert = "";

        retour.decryptData = false;

        if (this.mainPart.openpgpmimeencrypted) {

            retour.decryptData = true;
            retour.completeSignOrDecrypt = true;

            if (stopOnDecrypt) {
                retour.decryptDataToInsert = data;
                return retour;
            }

            data = this.extractEncryptedPart(this.mainPart);

            fireGPGDebug("Find mail whole encrypted, data todecrypt : " + data, "MimeDecoder-MimeDecrypt");

            retour.decryptresult = FireGPG.decrypt(false,data);

            if (retour.decryptresult.result == RESULT_SUCCESS) {
                this.saveid = this.extractMimeId();

                this.mainPart = this.mimeParsing(convertCRLFToStandarts(retour.decryptresult.decrypted));
                this.mainPart.thisisanencryptedpart = true;

                retour.decryptDataToInsert = this.mimeToText(this.mainPart);
            }


        }


        return retour;


    },

    MimeSign: function() {

        var retour = new Object();
        retour.completeSignOrDecrypt = false;
        retour.signResult = null;


        retour.signedData = false;

        if (this.mainPart.openpgpmimesigned) {

            retour.signedData = true;
            retour.completeSignOrDecrypt = true;

            data = this.extractSignedPart(this.mainPart);

            fireGPGDebug("Find mail whole signed, data tested : " + data, "MimeDecoder-MimeSign");

            retour.signResult = FireGPG.verify(true,data)

        }

        return retour;


    },

    Sign: function() {

        var retour = new Object();
        retour.completeSignOrDecrypt = false;
        retour.signResult = null;


        retour.signedData = false;


        data = "\r\n" + this.mimeToText(this.mainPart);

        data = data.replace(/<br( |\/)?>\r\n/gi, "\r");
        data = data.replace(/<br( |\/)?>\r/gi, "\r");
        data = data.replace(/<br( |\/)?>\n/gi, "\n");
        data = data.replace(/<br( |\/)?>/gi, "\r\n");
        data = data.replace(/<br>/gi, "\r\n");
        data = data.replace(/<br \/>/gi, "\r\n");

        firstSignPos = data.indexOf("\r\n-----BEGIN PGP SIGNED MESSAGE-----");

        if (firstSignPos == -1)
            return retour;



        firstSign = data.substring(firstSignPos, data.indexOf("\r\n-----END PGP SIGNATURE-----") + ("\r\n-----END PGP SIGNATURE-----").length);

         fireGPGDebug("Inline sign detected : " + data + "\n--\n" + firstSign, "MimeDecoder-Sign");

        charset = this.extractCharset(this.mainPart.headers['CONTENT-TYPE']);

        var resultTest = FireGPG.verify(true,firstSign.replace(/\r/gi, ''), charset);

        if (resultTest.signresult == RESULT_ERROR_BAD_SIGN) {
            fireGPGDebug("Try again widhout charset", "Nonmime sign verif");
            var resultTest = FireGPG.verify(true,firstSign.replace(/\r/gi, ''));

        }

        if (resultTest.signresult == RESULT_ERROR_BAD_SIGN) {
            fireGPGDebug("Try again utf8 decoded", "Nonmime sign verif");
            var resultTest = FireGPG.verify(true,UTF8.decode(firstSign.replace(/\r/gi, '')), charset);

        }

        retour.signedData = true;
        retour.signResult = resultTest;

        return retour;

    },

    Decrypt: function() {


        var retour = new Object();
        retour.completeSignOrDecrypt = false;
        retour.decryptresult = null;
        retour.decryptDataToInsert = "";

        retour.decryptData = false;


        data = "\r\n" + this.mimeToText(this.mainPart);

        data = data.replace(/<br( |\/)?>\r\n/gi, "\r");
        data = data.replace(/<br( |\/)?>\r/gi, "\r");
        data = data.replace(/<br( |\/)?>\n/gi, "\n");
        data = data.replace(/<br( |\/)?>/gi, "\r\n");
        data = data.replace(/<br>/gi, "\r\n");
        data = data.replace(/<br \/>/gi, "\r\n");

        firstEncryptPos = data.indexOf("\r\n-----BEGIN PGP MESSAGE-----");

        if (firstEncryptPos == -1)
            return retour;



        firstEcnrypt = data.substring(firstEncryptPos, data.indexOf("\r\n-----END PGP MESSAGE-----") + ("\r\n-----END PGP MESSAGE-----").length);

        fireGPGDebug("Inline decrypt detected : " + data + "\n--\n" + firstEcnrypt, "MimeDecoder-Decrypt");

        charset = this.extractCharset(this.mainPart.headers['CONTENT-TYPE']);

        var resultTest = FireGPG.decrypt(true,firstEcnrypt.replace(/\r/gi, ''));

        retour.decryptData = true;
        retour.decryptDataToInsert = this.washForInsertion(resultTest.decrypted, false);
        retour.decryptresult = resultTest;

        return retour;


    },


};