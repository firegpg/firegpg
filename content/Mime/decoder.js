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

***** END LICENSE BLOCK *****

*/


//Mime functions {DECODING}

if (typeof(FireGPG)=='undefined') { FireGPG = {}; }
if (typeof(FireGPG.Mime)=='undefined') { FireGPG.Mime = {}; }

FireGPG.Mime.Decoder = function(data) {
	this.init(data);
};

FireGPG.Mime.Decoder.prototype = {
	data: null,
    mainPart: null,
    attachements: null,

    init: function(data) {

		this.data = FireGPG.Misc.convertCRLFToStandarts(data);
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

        part.openpgpmimesigned = (part.headers["CONTENT-TYPE"] != undefined && part.headers["CONTENT-TYPE"].indexOf('"application/pgp-signature"') != -1 );
        part.openpgpmimeencrypted = (part.headers["CONTENT-TYPE"] != undefined && part.headers["CONTENT-TYPE"].indexOf('"application/pgp-encrypted"') != -1 );
        part.multipart = (part.headers["CONTENT-TYPE"] != undefined && part.headers["CONTENT-TYPE"].indexOf('multipart') != -1 );
        part.attachement = (part.headers["CONTENT-DISPOSITION"] != undefined && (part.headers["CONTENT-DISPOSITION"].indexOf('inline') != -1 || part.headers["CONTENT-DISPOSITION"].indexOf('attachment') != -1 ));
        if (part.attachement) {
            part.filename = this.extractFilename(part.headers['CONTENT-DISPOSITION']);
            part.clearBinBody = this.clearBinBody(part.body, part.headers);
        } else
            part.clearBody = this.clearBody(part.body, part.headers);
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

        var dataPart = this.findContentPart(mimePart);

        if (dataPart == null)
            return "";


        var message = dataPart.clearBody;


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

            var subP = this.findContentPart(mimePart.subparts[i]);

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
                    return  FireGPG.Misc.convertCRLFToStandarts(this.convertFromQP(body));
                    break;

                case "8bit":
                    break;

                case "base64":
                    return FireGPG.Misc.convertCRLFToStandarts(this.convertFromB64(body));
                    break;

            }
        }

        return body;
    },

    clearBinBody: function(body, headers) {

        if (headers['CONTENT-TRANSFER-ENCODING']) {

            switch(headers['CONTENT-TRANSFER-ENCODING']) {
                case "quoted-printable":
                    return  this.convertFromQP(body,true);
                    break;

                case "8bit":
                    break;

                case "base64":
                    return this.convertFromB64(body,true);
                    break;

            }
        }

        return body;
    },

    getAttachements: function() {
        return attachements;
    },

    parseHeaders: function(message) {

        var headers = new Array();

        message = message.substring(0, message.indexOf("\r\n\r\n")); //EndOfHeaders

        message = message.split(/\r\n/gi);

        var currentHeader = "";

        for (i = 0; i < message.length; i++) {

            if (message[i][0] == " " || message[i][0] == "\t") {
                headers[currentHeader] += FireGPG.Misc.trim(message[i]);
            } else {

                /*if (message[i].indexOf(":") == -1) //Erreur, on arrêtte
                    return headers;*/

                currentHeader = message[i].substring(0, message[i].indexOf(":")).toUpperCase();
                headers[currentHeader] = FireGPG.Misc.trim(message[i].substring(message[i].indexOf(":") + 1 , message[i].length));

            }


        }

        return headers;


    },

    removeHeaders: function(message,headers) {

        if (message.indexOf("\r\n\r\n") == -1)
            return message;

        if (headers == undefined)
            headers = this.parseHeaders(message);

        if (headers['CONTENT-TYPE'] != undefined || headers['CONTENT-DISPOSITION'] != undefined || headers['CONTENT-TRANSFER-ENCODING'] != undefined)
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

        if (!texte)
            return '';

        texte = texte.replace(/</gi, "&lt;"); // Security
        texte = texte.replace(/>/gi, "&gt;");
        texte = texte.replace(/\r\n/gi, "<br />");
        texte = texte.replace(/\r/gi, "<br />");
        texte = texte.replace(/\n/gi, "<br />");

        return texte;
    },

    washFromHtml: function(texte) {

        if (!texte)
            return '';

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

    convertFromB64: function(texte,bMode) {

        return FireGPG.Misc.Base64.decode(texte,bMode);

    },

    /* EXTRACTOR */

    //OPENPGPMIME
    extractSignedPart: function(mimePart) {

        var text;
        var signed;
        var data;

        //Hash
        var hash = this.convertHash(mimePart.headers["CONTENT-TYPE"]);

        if (hash == '') {
            FireGPG.debug('Unknow hash ' + mimePart.headers["CONTENT-TYPE"], 'MimeDecoder-extractSignedPart', true);
            return '';
        }

        //Signed part
         if (mimePart.subparts[0])
            text = mimePart.subparts[0].texte;
        else {
            FireGPG.debug ('Signed mail, but no subpart#0 ???', 'MimeDecoder-extractSignedPart', true);
            return '';
        }

        signed = text.replace(/\r\n\-/gi, "\r\n- -");

        //Signature
        if (mimePart.subparts[1])
            data = mimePart.subparts[1].body;
        else {
            FireGPG.debug ('Signed mail, but no subpart#1 ???', 'MimeDecoder-extractSignedPart', true);
            return '';
        }

        var signature = data .substring(data.indexOf("-----BEGIN PGP SIGNATURE-----\r\n") , data.indexOf("-----END PGP SIGNATURE-----") + ("-----END PGP SIGNATURE-----").length)

        //Final data
        return ("-----BEGIN PGP SIGNED MESSAGE-----\r\nHash: "+hash+"\r\n\r\n"+signed+signature).replace(/\r/gi, '');


    },
    //OPENPGPMIME
    extractEncryptedPart: function(mimePart) {

        var data;

        //Signature
        if (mimePart.subparts[1])
            data = mimePart.subparts[1].body;
        else {
            FireGPG.debug ('Encrypted mail, but no subpart#1 ???', 'MimeDecoder-extractSignedPart', true);
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

        //IN SENEDER, INVERTED ARRAY
        var result;

        hash = Array();
        hash['pgp-md5'] = 'MD5';
        hash['pgp-sha1'] = 'SHA1';
        hash['pgp-sha256'] = 'SHA256';
        hash['pgp-sha384'] = 'SHA384';
        hash['pgp-sha512'] = 'SHA512';
        hash['pgp-sha224'] = 'SHA224';
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

        var result;

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

    extractFilename: function(header) {

        var result;

        header += ";";

        var reg1 = /filename="([^( |;)]*)"( |;)/;
        result = reg1.exec(header);
        if (result && result[1] != "")
            return result[1];

        var reg2 = /filename=([^( |;)]*)( |;)/;
        result = reg2.exec(header);
        if (result && result[1] != "")
            return result[1];

        return '';


    },

    extractCharset: function(header) {

        var result;


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

        var minedecrypt = this.MimeDecrypt(stopOnDecrypt);

        if (minedecrypt.decryptData) {
           if (minedecrypt.completeSignOrDecrypt)
                retour.completeSignOrDecrypt = true;
            else
                retour.specialmimepart = minedecrypt.specialmimepart;

            retour.decryptresult = minedecrypt.decryptresult;
            retour.decryptDataToInsert = minedecrypt.decryptDataToInsert;
        }

        var mimesign = this.MimeSign();

        if (mimesign.signedData && !(minedecrypt.decryptData && retour.completeSignOrDecrypt == false)) { //Subpart chiffrée = stop

            if (mimesign.completeSignOrDecrypt)
                retour.completeSignOrDecrypt = true;
            else
                retour.specialmimepart = mimesign.specialmimepart;

            retour.signResult = mimesign.signResult;


        } else {

            if (minedecrypt.decryptData && minedecrypt.decryptresult.signresult == FireGPG.Const.Results.SUCCESS) {
                retour.signResult = new Object();
                retour.signResult.signresult = minedecrypt.decryptresult.signresult;
                retour.signResult.signresulttext = minedecrypt.decryptresult.signresulttext;
                retour.signResult.signresultuser = minedecrypt.decryptresult.signresultuser;
                retour.signResult.signresultdate = minedecrypt.decryptresult.signresultdate;
            }
        }

        var inlinedecrypt = null;

        //Pas d'openpgpmime, on cherche en inline (sauf si y'a une subpart qui à été signée/chiffrée, par sécurisé on s'arrête)
        if (!minedecrypt.decryptData && !((mimesign.signedData || minedecrypt.decryptData) && retour.completeSignOrDecrypt == false)) {

            inlinedecrypt = this.Decrypt(stopOnDecrypt);

            if (inlinedecrypt.decryptData) {

                //On considère l'inline comme complet
                retour.completeSignOrDecrypt = true;

                retour.decryptresult = inlinedecrypt.decryptresult;
                retour.decryptDataToInsert = inlinedecrypt.decryptDataToInsert;
                retour.moreDecryptData = inlinedecrypt.moreDecryptData;

            }



        }

        var inlinesign = null;

        //Pas d'openpgpmime, on cherche en inline (sauf si y'a une subpart qui à été signée/chiffrée, par sécurisé on s'arrête)
        if (!mimesign.signedData && !((mimesign.signedData || minedecrypt.decryptData) && retour.completeSignOrDecrypt == false)) {

            inlinesign = this.Sign();

            if (inlinesign.signedData) {
                //On considère l'inline comme complet
                retour.completeSignOrDecrypt = true;

                retour.signResult = inlinesign.signResult;

            } else {

                if (inlinedecrypt  != null) {
                    if (inlinedecrypt.decryptData && inlinedecrypt.decryptresult.signresult == FireGPG.Const.Results.SUCCESS) {
                        retour.signResult = new Object();
                        retour.signResult.signresult = inlinedecrypt.decryptresult.signresult;
                        retour.signResult.signresulttext = inlinedecrypt.decryptresult.signresulttext;
                        retour.signResult.signresultuser = inlinedecrypt.decryptresult.signresultuser;
                        retour.signResult.signresultdate = inlinedecrypt.decryptresult.signresultdate;
                    }
                }
            }
        }

        retour.attachements = this.parseSpecialAttachements();


        return retour;


    },

    MimeDecrypt: function(stopOnDecrypt) {

        var data;

        var retour = new Object();
        retour.completeSignOrDecrypt = false;
        retour.decryptresult = null;
        retour.decryptDataToInsert = "";

        retour.decryptData = false;

        if (this.mainPart.openpgpmimeencrypted) {

            retour.decryptData = true;
            retour.completeSignOrDecrypt = true;

            data = this.extractEncryptedPart(this.mainPart);

            if (stopOnDecrypt) {
                retour.decryptDataToInsert = data;
                retour.decryptresult = true;
                FireGPG.debug("{OldDecrypt} Find mail whole encrypted, data todecrypt : " + data, "MimeDecoder-MimeDecrypt");
                return retour;
            }

            FireGPG.debug("Find mail whole encrypted, data todecrypt : " + data, "MimeDecoder-MimeDecrypt");

            retour.decryptresult = FireGPG.Core.decrypt(false,data);

            if (retour.decryptresult.result == FireGPG.Const.Results.SUCCESS) {
                this.saveid = this.extractMimeId();

                this.mainPart = this.mimeParsing(FireGPG.Misc.convertCRLFToStandarts(retour.decryptresult.decrypted));
                this.mainPart.thisisanencryptedpart = true;

                retour.decryptDataToInsert = this.mimeToText(this.mainPart);
            }


        } else {

            //On essaie de trouver une subpart
            var subparttotest = null;

            var i;
            if (this.mainPart.multipart) {
                for(i = 0; i < this.mainPart.numberofsubparts; i++) {

                    if (this.mainPart.subparts[i].openpgpmimeencrypted) {
                        subparttotest = this.mainPart.subparts[i];
                        break;
                    }


                }
            }

            if (subparttotest != null) {

                retour.decryptData = true;
                retour.completeSignOrDecrypt = false;

                data = this.extractEncryptedPart(subparttotest);

                retour.specialmimepart = subparttotest.texte;

                if (stopOnDecrypt) {
                    retour.decryptDataToInsert = data;
                    retour.decryptresult = true;
                    FireGPG.debug("{OldDecrypt} Find mail part encrypted, data todecrypt : " + data, "MimeDecoder-MimeDecrypt");
                    return retour;
                }


                FireGPG.debug("Find mail part encrypted, data todecrypt : " + data, "MimeDecoder-MimeDecrypt");

                retour.decryptresult = FireGPG.Core.decrypt(false,data);

                if (retour.decryptresult.result == FireGPG.Const.Results.SUCCESS) {

                    subparttotest = this.mimeParsing(FireGPG.Misc.convertCRLFToStandarts(retour.decryptresult.decrypted));
                    subparttotest.thisisanencryptedpart = true;

                    retour.decryptDataToInsert = this.mimeToText(subparttotest);
                    this.mainPart.subparts[i] = subparttotest;
                }

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

            FireGPG.debug("Find mail whole signed, data tested : " + data, "MimeDecoder-MimeSign");

            retour.signResult = FireGPG.Core.verify(true,data)

        } else {

            //On essaie de trouver une subpart
            subparttotest = null;

            var i;
            if (this.mainPart.multipart) {
                for(i = 0; i < this.mainPart.numberofsubparts; i++) {

                    if (this.mainPart.subparts[i].openpgpmimesigned) {
                        subparttotest = this.mainPart.subparts[i];
                        break;
                    }


                }
            }

            if (subparttotest != null) {

                retour.signedData = true;
                retour.completeSignOrDecrypt = false;

                data = this.extractSignedPart(subparttotest);

                FireGPG.debug("Find mail part signed, data tested : " + data, "MimeDecoder-MimeSign");

                retour.specialmimepart = subparttotest.texte;

                retour.signResult = FireGPG.Core.verify(true,data)

            }
        }

        return retour;


    },

    Sign: function() {

        var retour = new Object();
        retour.completeSignOrDecrypt = false;
        retour.signResult = null;


        retour.signedData = false;


        var data = "\r\n" + this.mimeToText(this.mainPart);

        data = data.replace(/<br( |\/)?>\r\n/gi, "\r");
        data = data.replace(/<br( |\/)?>\r/gi, "\r");
        data = data.replace(/<br( |\/)?>\n/gi, "\n");
        data = data.replace(/<br( |\/)?>/gi, "\r\n");
        data = data.replace(/<br>/gi, "\r\n");
        data = data.replace(/<br \/>/gi, "\r\n");

        var firstSignPos = data.indexOf("\r\n-----BEGIN PGP SIGNED MESSAGE-----");

        if (firstSignPos == -1)
            return retour;



        var firstSign = data.substring(firstSignPos, data.indexOf("\r\n-----END PGP SIGNATURE-----") + ("\r\n-----END PGP SIGNATURE-----").length);

         FireGPG.debug("Inline sign detected : " + data + "\n--\n" + firstSign, "MimeDecoder-Sign");

        charset = this.extractCharset(this.mainPart.headers['CONTENT-TYPE']);

        var resultTest = FireGPG.Core.verify(true,firstSign.replace(/\r/gi, ''), charset);

        if (resultTest.signresult == FireGPG.Const.Results.ERROR_BAD_SIGN) {
            FireGPG.debug("Try again widhout charset", "Nonmime sign verif");
            var resultTest = FireGPG.Core.verify(true,firstSign.replace(/\r/gi, ''));

        }

        if (resultTest.signresult == FireGPG.Const.Results.ERROR_BAD_SIGN) {
            FireGPG.debug("Try again utf8 decoded", "Nonmime sign verif");
            var resultTest = FireGPG.Core.verify(true,FireGPG.Misc.UTF8.decode(firstSign.replace(/\r/gi, '')), charset);

        }

        retour.signedData = true;
        retour.signResult = resultTest;

        return retour;

    },

    Decrypt: function(stopOnDecrypt) {

        var i18n = document.getElementById("firegpg-strings");


        var retour = new Object();
        retour.completeSignOrDecrypt = false;
        retour.decryptresult = null;
        retour.decryptDataToInsert = "";

        retour.decryptData = false;


        var data = "\r\n" + this.mimeToText(this.mainPart);

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

        FireGPG.debug("Inline decrypt detected : " + data + "\n--\n" + firstEcnrypt, "MimeDecoder-Decrypt");

        charset = this.extractCharset(this.mainPart.headers['CONTENT-TYPE']);

        if (stopOnDecrypt) {
            retour.decryptData = true;
            retour.decryptresult = true;
            retour.decryptDataToInsert = firstEcnrypt.replace(/\r/gi, '');
            return retour;
        }

        var resultTest = FireGPG.Core.decrypt(true,firstEcnrypt.replace(/\r/gi, ''));

        retour.decryptData = true;
        retour.decryptDataToInsert = this.washForInsertion(resultTest.decrypted, false);
        retour.decryptresult = resultTest;

        if (resultTest.notEncrypted)
            alert(i18n.getString("notEncryptedButPlainText"));

        retour.moreDecryptData = new Array();


        /* If there is more than one part encryped */
        data = data.substring(data.indexOf("\r\n-----END PGP MESSAGE-----") + ("\r\n-----END PGP MESSAGE-----").length, data.length );
        var i = 0;

        while (  data.indexOf("\r\n-----BEGIN PGP MESSAGE-----") != -1    ) {

            firstEcnrypt = data.substring(data.indexOf("\r\n-----BEGIN PGP MESSAGE-----"), data.indexOf("\r\n-----END PGP MESSAGE-----") + ("\r\n-----END PGP MESSAGE-----").length);
            FireGPG.debug("Inline decrypt detected new encrypted content: " + data + "\n--\n" + firstEcnrypt, "MimeDecoder-Decrypt");
            tmpResultTest = FireGPG.Core.decrypt(true,firstEcnrypt.replace(/\r/gi, ''));

            retour.moreDecryptData[i] = this.washForInsertion(tmpResultTest.decrypted, false);

            if (tmpResultTest.notEncrypted)
                alert(i18n.getString("notEncryptedButPlainText"));


            i++;
            data = data.substring(data.indexOf("\r\n-----END PGP MESSAGE-----") + ("\r\n-----END PGP MESSAGE-----").length, data.length );
        }


        return retour;


    },

    parseSpecialAttachements: function() {
       var retour = new Array();

        if (!this.mainPart.multipart)
            return retour;

       //Attachements qui semblent chiffrés
       //.ASC, .PGP
       for (var i = 0; i < this.mainPart.numberofsubparts; i++) {
            if (this.mainPart.subparts[i].attachement) {
                var ext = FireGPG.Misc.getFileExtention(this.mainPart.subparts[i].filename)

                if ((ext == "asc" || ext == "pgp") && this.mainPart.subparts[i].headers['CONTENT-TYPE'].indexOf('application/pgp-signature') == -1) {

                    var tmpFile = new Object();
                    tmpFile.filename = this.mainPart.subparts[i].filename;
                    tmpFile.type = "encrypted";
                    tmpFile.data = this.mainPart.subparts[i].clearBinBody;

                    retour.push(tmpFile);

                }
            }

       }


       //Attachements fournis avec une signature
       //.sig
      /* for (var i = 0; i < this.mainPart.numberofsubparts; i++) {
            if (this.mainPart.subparts[i].attachement) {
                var ext = FireGPG.Misc.getFileExtention(this.mainPart.subparts[i].filename)

                if (ext == "sig") {

                    originalName = this.mainPart.subparts[i].filename.substring(0,this.mainPart.subparts[i].filename.length - 4 );

                    for (var i2 = 0; i2 < this.mainPart.numberofsubparts; i2++) {
                        if (this.mainPart.subparts[i2].attachement) {
                                if (this.mainPart.subparts[i2].filename == originalName) {

                                    data = "-----BEGIN PGP SIGNED MESSAGE-----\nHash: SHA1\n\n" + this.mainPart.subparts[i2].clearBinBody.replace(/\n\-/gi, "\n- -").replace(/\r\-/gi, "\r- -")  + "\n-----BEGIN PGP SIGNATURE-----\n\n"+ FireGPG.Misc.Base64.encode(this.mainPart.subparts[i].clearBinBody,true) + "\n-----END PGP SIGNATURE-----";

                                    var tmpFile = new Object();
                                    tmpFile.filename = this.mainPart.subparts[i2].filename;
                                    tmpFile.type = "signedfile";
                                    tmpFile.signresult = FireGPG.Core.verify(true,data,'UTF-8');

                                    alert(FireGPG.Misc.dumper(tmpFile.signresult));

                                    FireGPG.Misc.removeFile("/tmp/a");
                                    FireGPG.Misc.putIntoBinFile("/tmp/a",data);

                                    retour.push(tmpFile);

                                    break;
                                }

                        }
                    }

                }
            }

       }*/


       //Attachements venant d'être déchifrés
       if (this.mainPart.thisisanencryptedpart) {
            for (var i = 0; i < this.mainPart.numberofsubparts; i++) {
                if (this.mainPart.subparts[i].attachement && this.mainPart.subparts[i].headers['CONTENT-TYPE'].indexOf('application/pgp-signature') == -1) {

                    var tmpFile = new Object();
                    tmpFile.filename = this.mainPart.subparts[i].filename;
                    tmpFile.type = "decrypted";
                    tmpFile.data = this.mainPart.subparts[i].clearBinBody;

                    retour.push(tmpFile);

                }

           }
       }

       return retour;

    },


};