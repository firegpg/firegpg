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
            return hash[result[1].toLowerCase()];

        var reg2 = /micalg=([a-zA-Z0-9\-]*)( |;)/;
        result = reg2.exec(interestingHeader);
        if (result && result[1] != "")
            return hash[result[1].toLowerCase()];
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