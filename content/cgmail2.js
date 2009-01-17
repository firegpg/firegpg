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

/* Constant: GMAIL_MAIN_DOC_URL
 The url of the mail document for gmail */
const GMAIL_MAIN_DOC_URL = "http://mail.google.com/mail/?ui=2&view=bsp&ver=";
/* Constant: GMAIL_MAIN_DOC_URL2
 The url of the mail document for gmail and https. */
const GMAIL_MAIN_DOC_URL2 = "https://mail.google.com/mail/?ui=2&view=bsp&ver=";


//Pictures
const IMG_SIGN_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAAN1wAADdcBQiibeAAAAAd0SU1FB9kBDxIAOdxBIbcAAAI+SURBVDjLxZO7TxRhFMV/M/PN7EPYhS02yytggo+ERAgxERsNhYnGzsQojaHT3r9F0cTaUjs6NUQLBRKDi4I8FEwkLMgO+5rdeX3XAoVYiZWnP797cu69Bv8gqZ+0QTqIdRpl1VHGvnV884CJwQgwicVtoB/ku/H4ycOnURgP/Q1g21Fw4+r0RjbbNmaq4ayO35UkXp9S2UzHxK2bE4QNl82FVwD0D49jn+hERBCRgwTiIX7pvGUGYF/BlO327d3ENfV7wuL0AyjPICIsfPvAmev3qdVqlMtlCoUCGxurDPT1kEnPomQKkRTFpXOjh4DN4kvGLuSJ/JC38y/ouXyXYrGIiBDHMVtbu1SrvXTlbfp6HcQcoVwp5hRAaWedPXFYfL+E1lAKswSRy+joKEEQICLkcjm01hiGgRcksW0b4SMKYHb+OSt6ma+VffxWRF3S5OeeMX7pHkqpwy5EBK31H90ogFODF1lbm8OtlEhloDORpbdnhDAMaTabhwbbtkkkEkRRhGVZR4BCfojJO4+o1VwQAItEIolpmliWRVtbG7s/dlDKotGo47U8CvkuAEwA3/eJoxhE0WyGuO4+nucRBAHVahXDMKg3agRhQBAGVKsVtNZHCRzHwTAMcrnc0eX9it3e3g7A6cGzhx0AKHWwQOV5jdXXb2ZOaa3BOP5ffF5ZptVqflG+3xpbWv5kh2FolEo7dnmv7Lium6zXG0nf95MiguM4QTqd9jPZTCvX2eF393QHqVRKZ7KZkP+unzPGLX8Jr7F8AAAAAElFTkSuQmCC";
const IMG_SIGN_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAA3XAAAN1wFCKJt4AAAAB3RJTUUH2QEPEgAMivLllAAAAR9JREFUKM+l0bGKE1EAheHvztxJskGNptDAIlZrI4JstZ2djyCWgg9lYS/4CmJpoaVEkGVFUmxWAppd4mySmYlzLbI2ks7T/j/nFCfYme+Fm20/L/OLfCfOwiPPs2fumYZXr5sH/wpF/XgyOOoOqlnzMrxJTy2N8VBfktBayOy5NHsX4a255NQTv8yNTIx0/MbXwww+23fbWGns1NSZY2dauXIYmdn4pLXWOFRLhlrhai7jo9LUxE8fBFEUFbIrIXLfiQv03NVYSZJC10a+FUZeWICuTO6aH6JLK3e2E5UNVs4t1RaCUqOx0G4bOoIhSJLrOJD+QnF58v6g3X2IY+tvsTr6UjRhVsw7572yV/WSTt2vbqxvVfv1Xjto/Hf+AOxbcNBvGvbRAAAAAElFTkSuQmCC";

const IMG_ENCRYPT_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEgAACxIB0t1+/AAAAAd0SU1FB9kBDxIAMKWdmRMAAAJ7SURBVDjLfZJNSFRRFMd/zvfo6Dj4ManJBEmCUggqQ5BQkLV3KUTrWrhqCIRwE7aZnW6CICjCRatcWNDKjdYiNPA7lCFNZ4Zx3jjP9+687xbTjFOSZ3XuPf//71zOuXX8E9PTbyNtbeGHra3Nj5qa6q8ByLKaymalmVyu+Hpy8oFUq3fXHqamXrWEw6FEPN7/bGioNxqLtdPV1UJ3d3tzIOC7nU7n3fH4/dXFxXlxDpBIzLjq6wNjIyM3pnp7uxt2d/eN5eW1wtZWSlVVxd3Tc9nv83mup1LpH8PDo2tLSx8dAE8FoOtGQzQaGY/FouHNzT1tYeHLG1XVngPKykrdU0kqPB4Y6AtHo83j+fzJB0AGcFUAQmgev993xe93s76+l8lkpJfJ5MTPZHLiWIhScnv74EDXBT6f54oQWrVxFaAoKoahI4Qgk8mfmKa5WqnNziaysqxomlZC13UURa3OrUq6eWkzhOj0Cmkfr5n1TA7OdU4O9leFc78kr3WaxlXKeO92f4+8AwmgDmA12TfqDdYnrMjVkVBjKHAiFUQkIK/XbuhYhPqbmsNB9VQpeQp7y4ZQXww82fjsAchK3IuP3Rpt6sgBx4AThOBQLSCGBeTBcQLFnY47X9/vfgPKgKOcjaXuQDHHheEAksDakDjKhc5mcJhzMAoq+LQLzA4US3BwgiE5HOacM0C+6GAVNfCKvw2VrpYNig7HKhgWVslFvlgDcBxANcCvgasObAdMu2w0bdAtKBlg2GBYoLur/OoaMewySf8jMmwwrbLZtM/MpgU65/+BcIJnoiqgBla5N22EcJ8D7Mx/kuUGr78R2ym/xIH/5YrukoEdgN/duVvodorv0QAAAABJRU5ErkJggg%3D%3D";
const IMG_ENCRYPT_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAQAAAC1+jfqAAAAAXNSR0IArs4c6QAAAAJiS0dEAP+Hj8y/AAAACXBIWXMAAAsSAAALEgHS3X78AAAAB3RJTUUH2QEPEgAotvEBRQAAAWNJREFUKM9dkL0vQ2EUxn/Ve/uhpQRpUiFNJCIRCyIdSBiwGy1mg1FYRExETEwm/gUDSxeLj4EwkEiFIJZSafXm9u29fd++hlsVfU5OTnKe33Ce46OmrfauhY7F1n6wXj73cgereW/v98ZGR2x5bG0k3kuCnrbQZNafuj0VdWClqXlufL0/8ly5LDyUSv6+YGDo9XHs7kxDE4Abic/3xh6co8Or4ZuBk91zuzsWn3cjUAOEEUgGuc9m97fftr/ETubdxUwKow7YVBB8fMtbgN0Py3FwsQEwALqjZbOANFKJFAAvpo1jJtvJgw/2psPLrRPRUEGE7r1MYjAWtsvWhdhcShtQmJmd7kRDmFHq0qG3qeNr0gbkKGHxXxqLJ3LeDTmKBBpsm0+sX6CITbBmgKZKmW8UDkUP0DgIfGgUCoXERSKR6N+YEo1CIlG1ligqf3+oNpgShaJcBzJpy2zRNJZrkYEf32ylTIie9OMAAAAASUVORK5CYII%3D";

const IMG_INLINE_ON = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kBDxIDEyzXu6IAAAJDSURBVDjLXZK9S1thFIef9354ufEak5qQpoFq24QSGqXg5FKodCxd/Q9CCYKDIDh26No6SiY7lOImpV3qYkGw6tA/QBAFSYg0QWL0er/ydnjVfJzl5ZwDz/md33uEnJx8STw+hWVNYppPsKwi8JRO5xFh2EXT/tLtfqJW2xXn5/8YCiGnpyWLizAyAokEWBaYJgQBHB+D68LJCdTrR+zsfBSt1pd+gMHERIN8PkO7rSqeJ/E8gWXBzAx0OjA1Be12gVTqg9zY2BG+f9oDQAPIsLUFl5fgeQLXhYUFKBZhfx9aLZiflxQKCSwrju/TDzjH88BxQNdVVdPU22xCOg2lEgghME0b04wNrgCX+D6kUnBxMQgJQ8hkVC4lwAhBYA0CoqgLKJl3PgCcnSkzR0dV7vtgGHdD+wBhGCElzM1xv9v1Nd8rFd6trSlAtwuepxQNhYZhmICaNj4OzSZvKhV+AWxuwvY2HB2pbwUIQ20QoOsP7rODA14tL/MHcIFve3v41SocHqrpUvYMvgdAHCFUlskQ71tyFNChZ2wYgqZ1BwFRNAYoibkcP1ZWKN02nwH6mGoTBMoHXY+GTXSQUjVdF0oldstl1qtVXiwtQTKp3Nc0CAKJpg0BgiCGrkMspk44imB2lvflsjoixwEpJSBw3Rs872YQUK9/ZXU1QTb7kGz2MbadxbZjpNO9AzJNgeNAo3Hz+eoqfWvPFYAA+A3mBcR0cHSI+xArQKpoGHlyuTzJZAnbfk6tFv08PX39Fk7uFPwH1YnXP5gXXzcAAAAASUVORK5CYII%3D";
const IMG_INLINE_OFF = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAAAXNSR0IArs4c6QAAAAZiS0dEAP8A/wD/oL2nkwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAd0SU1FB9kBDxICJI1xL+wAAAKASURBVDjLXZA9TyNXGEbP/RjGjD9ZgzO2LJyFjVdBK0FPRYXEH6BGQhQpKPgHKdKGhj9A4YIOiZKWmjRIKUKDqXYVQDYsHmbmvncLsLXmbR/dc5/nqOPj47UwDH+dmZnpKKU+Wmt/B5ayLGs550Rr/Y9z7u/hcHixu7v7P+9OnZyc+PX1dYIgIAxDgiDAGINzjru7O7Is4+HhgeFw+N/19fVfe3t7xz8DdBRFXxcWFgjDEIAsy3ySJAC0Wi3iOGZpaYmVlZXfVldX/zw6Our8DLBKqa/AL1dXV7y8vJDnucrznLW1NeI4pt/v8/z8zPLysp+fn68ZYypTAO/9N+cchUIBrfXrLqXw3vP4+EixWCSOY7TWyhgza4yJ3jd4dM4RRRFaa5RSr9u0xntPuVzGe4+IAMyISDgFkLdkNBoxGo0mwWAwwFpLEAQAOOfGUDslUUSciNDpdOh2u3S7XTqdDoeHhxPguMHbX1NntdaB9x5jDNZa7u/v2draotFocHl5SbPZZG5ujkrl1Z2I6KkGSqkP4939fp/NzU1ubm5I05TT01MuLi64vb1FRPDeTxxNAEBlbL1arRKGIcYYAIIgmIgdz9BaT+3Q3vuyUgoRoVwu0+v1iOMYgHq9zuzsLOPcOYdSyr2XWBqHaZrSarXo9XosLi6yvb3NxsYG7XYbpRTOOf8eYEUkehPoRUSJCO12m4ODA4rFIoVCARHxgErTNMnzPJkCDAaD3tnZWa1Wq8WlUmkxDMOmtTYqlUqT6sYYVSgUeHp6Ss7PzxeAIvAdwO7s7Pyxv78fJEkSKaVKSqmKiET1en2+2Wx+qlarn6Io+mKt/TwYDFyj0fh3/BjgB9asH6HipiinAAAAAElFTkSuQmCC";

/*
   Class: cGmail2
   This is the main class to manage gmail's function with the new interface.
*/
var cGmail2 = {

    /*
    Variable: doc
    A list of document who can be used.
    */
    doc: Array(),

    /*
    Variable: docOccuped
    A list of document who wait to be checked.
    */
    docOccuped: Array(),

    /*
    Variable: current
    The current document id used (to be unique)
    */
    current: 0,

    /*
        Function: checkDoc
        This function check a document for sign and button to add on a page.

        Parameters:
            id - The document 's id of the click.
    */
    checkDoc: function(id, retry) {

        var i18n = document.getElementById("firegpg-strings");

        var doc = cGmail2.doc[id];

        if (doc != undefined && doc.location != undefined) {

            final_location = doc.location.href;

            var regrex = new RegExp('^https?://mail.google.com/a/[a-zA-Z.0-9-]*');

            final_location = final_location.replace(regrex, "http://mail.google.com/mail");

            if (final_location.indexOf(GMAIL_MAIN_DOC_URL) == 0 || final_location .indexOf(GMAIL_MAIN_DOC_URL2) == 0) {

                //test for messages
                var listeTest = doc.getElementsByClassName('ArwC7c','div');

                for (var i = 0; i < listeTest.length; i++) {

                    if (listeTest[i].hasAttribute("gpg") == false) {

                        listeTest[i].setAttribute("gpg","ok");

                        var boutonboxs = listeTest[i].parentNode.getElementsByTagName("table");

                        boutonbox = "";

                        //On cherche la boite avec les boutons
                        for (var j = 0; j < boutonboxs.length; j++) {
                            if (boutonboxs[j].getAttribute("class") == "EWdQcf") {
                                boutonbox = boutonboxs[j].firstChild.firstChild;
                                break;
                            }
                        }

                        if (boutonbox == "")
                            break;

                       // var contenuMail = this.getMailContent(listeTest[i],doc);

                        var mimeContentOf  = this.getMimeMailContens(listeTest[i],doc);

                        if (mimeContentOf == "{ERROR,WAIT}" && retry == undefined && retry != true) {

                            listeTest[i].removeAttribute("gpg");

                            setTimeout("cGmail2.checkDoc("+id+", true)", 500);
                            cGmail2.docOccuped[id] = true;
                            return;

                        }

                        listeTest[i].setAttribute("firegpg-mail-id", FireGPGMimeDecoder.getMailId(mimeContentOf));

                        var td = doc.createElement("td");

                        var mime = FireGPGMimeDecoder.extractSignedData(mimeContentOf).replace(/\r/gi, '');



                        if (mime != '')
                            var resultTest = FireGPG.verify(true,mime);
                        else {
                            var mime2 = FireGPGMimeDecoder.extractSignature(mimeContentOf);

                            var resultTest = FireGPG.verify(true,mime2.text.replace(/\r/gi, ''), mime2.chaset);
                        }

						// For I18N
						var i18n = document.getElementById("firegpg-strings");

						if (resultTest.result == RESULT_ERROR_NO_GPG_DATA) {
							if (cGmail2.nonosign != true)
							{
								td.setAttribute("style","color: orange;");
								td.innerHTML = i18n.getString("GMailNoS");
							}
						}
                        else if (resultTest.signresult ==RESULT_ERROR_UNKNOW) {
                            td.setAttribute("style","color: red;");
                            td.innerHTML = i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";
                        }
                        else if (resultTest.signresult == RESULT_ERROR_BAD_SIGN) {
                            td.setAttribute("style","color: red;");
                            td.innerHTML = i18n.getString("GMailSErr") + " (" + i18n.getString("falseSign") + ")"; //"La première signature de ce mail est incorrect !";
                        }
                        else if (resultTest.signresult == RESULT_ERROR_NO_KEY) {
                            td.setAttribute("style","color: red;");
                            td.innerHTML = i18n.getString("GMailSErr") + " (" + i18n.getString("keyNotFound") + ")"; //"La première signature de ce mail est incorrect !";
                        }
						else if (resultTest.signresulttext != null){

							td.setAttribute("style","color: green;");
							td.innerHTML = i18n.getString("GMailSOK") + " " + htmlEncode(resultTest.signresulttext); //"La première signature de ce mail est de testtest (testtest)
						}

                        var encrypted = FireGPGMimeDecoder.extractEncryptedData(mimeContentOf).replace(/\r/gi, '');

                        var firstPosition = encrypted.indexOf("-----BEGIN PGP MESSAGE-----");
                        var lastPosition = encrypted.indexOf("-----END PGP MESSAGE-----");

                        if (encrypted != null && encrypted != '' && firstPosition != -1 && lastPosition != -1) {

                            var result = FireGPG.decrypt(false,encrypted);

                            if (result.result == RESULT_SUCCESS) {
                                data = FireGPGMimeDecoder.parseDecrypted(result.decrypted); //For reviewers, a washDecryptedForInsertion is applied too in parseDecrypted ;)

                                this.setMailContent(listeTest[i],doc,data.message);

                                td.setAttribute("style","color: blue;");
                                td.innerHTML = i18n.getString("GMailMailWasDecrypted");

                                if (result.signresulttext != null &&  result.signresulttext != "")
                                        td.innerHTML += " " + i18n.getString("GMailSOK") + " " + htmlEncode(result.signresulttext)
                                else if (data.signData ) {

                                    var resultTest = FireGPG.verify(true,data.signData.replace(/\r/gi, ''));

                                    if (resultTest.result == RESULT_ERROR_NO_GPG_DATA) {
                                        if (cGmail2.nonosign != true)
                                        {
                                            td.setAttribute("style","color: orange;");
                                            td.innerHTML += " " + i18n.getString("GMailNoS");
                                        }
                                    }
                                    else if (resultTest.signresult ==RESULT_ERROR_UNKNOW) {
                                        td.setAttribute("style","color: red;");
                                        td.innerHTML += " " + i18n.getString("GMailSErr"); //"La première signature de ce mail est incorrect !";
                                    }
                                    else if (resultTest.signresult == RESULT_ERROR_BAD_SIGN) {
                                        td.setAttribute("style","color: red;");
                                        td.innerHTML += " " + i18n.getString("GMailSErr") + " (" + i18n.getString("falseSign") + ")"; //"La première signature de ce mail est incorrect !";
                                    }
                                    else if (resultTest.signresult == RESULT_ERROR_NO_KEY) {
                                        td.setAttribute("style","color: red;");
                                        td.innerHTML += " " + i18n.getString("GMailSErr") + " (" + i18n.getString("keyNotFound") + ")"; //"La première signature de ce mail est incorrect !";
                                    }
                                    else if (resultTest.signresulttext != null){

                                        td.setAttribute("style","color: green;");
                                        td.innerHTML += " " + i18n.getString("GMailSOK") + " " + htmlEncode(resultTest.signresulttext); //"La première signature de ce mail est de testtest (testtest)
                                    }

                                }
                            } else  {

                                td.setAttribute("style","color: red;");
                                td.innerHTML = i18n.getString("GMailMailWasNotDecrypted");
                            }


                        } else {

                            var encrypted = FireGPGMimeDecoder.extractEncrypted(mimeContentOf).replace(/\r/gi, '');

                            var firstPosition = encrypted.indexOf("-----BEGIN PGP MESSAGE-----");
                            var lastPosition = encrypted.indexOf("-----END PGP MESSAGE-----");

                            if (encrypted != null && encrypted != '' && firstPosition != -1 && lastPosition != -1) {

                                var result = FireGPG.decrypt(false,encrypted);

                                if (result.result == RESULT_SUCCESS) {

                                    data = FireGPGMimeDecoder.washDecryptedForInsertion(FireGPGMimeDecoder.demime(result.decrypted).message.replace(/\r/gi, ''));

                                    this.setMailContent(listeTest[i],doc,data);

                                    td.setAttribute("style","color: blue;");
                                    td.innerHTML = i18n.getString("GMailMailWasDecrypted");


                                    if (result.signresulttext != null &&  result.signresulttext != "")
                                        td.innerHTML += " " + i18n.getString("GMailSOK") + " " + htmlEncode(result.signresulttext)


                                } else  {

                                    td.setAttribute("style","color: red;");
                                    td.innerHTML = i18n.getString("GMailMailWasNotDecrypted");
                                }

                            }



                        }


                        /*var firstPosition = contenuMail.indexOf("-----BEGIN PGP MESSAGE-----");
                        var lastPosition = contenuMail.indexOf("-----END PGP MESSAGE-----");

                        if (firstPosition != -1 && lastPosition != -1) {

                            td.innerHTML = i18n.getString("GMailD");

                            var tmpListener = new Object;
                            tmpListener = null;
                            tmpListener = new cGmail2.callBack(doc)
                            td.addEventListener('click',tmpListener,true);
                            td.setAttribute("style","");
                        }*/

                        td.innerHTML = '<div class="X5Xvu" idlink=""><span class="" style="' + td.getAttribute("style") + '">' + td.innerHTML + '</span></div>';

                        boutonbox.insertBefore(td,boutonbox.childNodes[boutonbox.childNodes.length - 1]);

                    }
                }



                //END OF THE TEST FOR MESSAGES.

                //Test for compose buttons 'CoUvaf'
                var listeTest = doc.getElementsByClassName('LlWyA','div');
                var listeTest2 = doc.getElementsByClassName('CoUvaf','div');


                listeTest = listeTest.concat(listeTest2);

                for (var i = 0; i < listeTest.length; i++) {

                    if (listeTest[i].hasAttribute("gpg") == false) {

                        listeTest[i].setAttribute("gpg","ok");

                        //Position to add the button
                        var spamLimite = listeTest[i].getElementsByTagName('span');
                        spamLimite = spamLimite[0];

                        //Nouvelle version du lundi 29 septembre 2008
                        if (listeTest[i].firstChild && listeTest[i].firstChild.getAttribute("class") == "c1I77d yCMBJb goog-container")
                            var wheretoadd = listeTest[i].firstChild;
                        else if (listeTest[i].firstChild && listeTest[i].firstChild.getAttribute("class") == "c1I77d yCMBJb") { //Version du 29 octobre 2008
                            var wheretoadd = listeTest[i].firstChild.firstChild;
                            if (wheretoadd.getAttribute("class") != "Q4uFlf goog-container")
                                wheretoadd = listeTest[i].firstChild.childNodes[1];
                        }


                        /*if (cGmail2.b_sign == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailCLS"),"sign",spamLimite);
                        if (cGmail2.b_sign_s == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailCLSS"),"sndsign",spamLimite);
                        if (cGmail2.b_psign == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailS"),"psign",spamLimite);
                        if (cGmail2.b_psign_s == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailSS"),"sndpsign",spamLimite);
                        if (cGmail2.b_crypt == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailC"),"crypt",spamLimite);
                        if (cGmail2.b_crypt_s == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailCS"),"sndcrypt",spamLimite);
                        if (cGmail2.b_signcrypt == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailSAC"),"signcrypt",spamLimite);
                        if (cGmail2.b_signcrypt_s == true)
                            this.addBouton(wheretoadd,doc,i18n.getString("GMailSACS"),"sndsigncrypt",spamLimite);*/




                        //Listeners
                        try {

                            var tmpListener = new Object;
                            tmpListener = null;
                            tmpListener = new cGmail2.callBack(doc)
                            listeTest[i].addEventListener('click',tmpListener,true);

                        } catch (e) {  fireGPGDebug(e,'cgmail2.checkDoc',true);  }

                        //Rajouter une propriété sur le button send pour le repérer
                        var children = listeTest[i].getElementsByTagName('button');
                        children[0].setAttribute("gpg_action", "send_button");


                        if (listeTest[i].getAttribute('class').indexOf('LlWyA') != -1) {

                            children[0].setAttribute("gpg_action", "send_button2");


                            //Add the button 'Attach and chiffred a file'

                            var tablebox = listeTest[i].parentNode.getElementsByTagName('table');

                            //Nouvelle version du lundi 29 septembre 2008
                            if (tablebox.length == 0)
                                tablebox = listeTest[i].parentNode.parentNode.getElementsByTagName('table');

                            tablebox = tablebox[0];

                            var boxwhereadd = tablebox.parentNode;

                            var span = doc.createElement("span");

                            span.setAttribute("style","position: relative;  bottom: 26px;  right: 5px; float: right; margin-bottom: -30px;");

                            span.innerHTML = '<img class="iyUIWc msHBT uVCMYd" src="images/cleardot.gif">&nbsp;<span gpg_action="add_crypted" style="font-size: 12px;" class="MRoIub">' + i18n.getString("GmailAddChiffred")+ '</span>&nbsp;<span gpg_action="add_crypted_and_sign" style="font-size: 12px;" class="MRoIub">' + i18n.getString("GmailAddChiffredSignToo")+ '</span>';

                            boxwhereadd.insertBefore(span,tablebox.nextSibling);

                            var tmpListener = new Object;
                            tmpListener = null;
                            tmpListener = new cGmail2.callBack(doc)
                            span.addEventListener('click',tmpListener,false);


                            //Rajout des trucs à FireGPG
                            var firegpgactions = doc.createElement("tr");


                            var title = doc.createElement("td");
                            var checkboxes = doc.createElement("td");

                            title.setAttribute('class', 'sXkcDf');
                            title.innerHTML = 'FireGPG:';

                            randId = genreate_api_key();
                            checkboxes.setAttribute('class', 'J14TS');
                            checkboxes.setAttribute('style', 'font-size: 12px;');
                            checkboxes.innerHTML =  '<img id="'+randId+'a" src="'+IMG_SIGN_OFF+'" alt="'+IMG_SIGN_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\');" title="Off" class="firegpg-sign">&nbsp;<span class="MRoIub" onclick="document.getElementById(\''+randId+'a\').onclick();">' + i18n.getString("GMailS") + '</span>&nbsp;|&nbsp;' +
                            '<img id="'+randId+'b" src="'+IMG_ENCRYPT_OFF+'" alt="'+IMG_ENCRYPT_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\');" title="Off" class="firegpg-encrypt" >&nbsp;<span class="MRoIub" onclick="document.getElementById(\''+randId+'b\').onclick();">' + i18n.getString("GMailC") + '</span>&nbsp;|&nbsp;' +
                            '<img id="'+randId+'c" src="'+IMG_INLINE_OFF+'" alt="'+IMG_INLINE_ON+'" onclick="a = this.alt; this.alt=this.src; this.src=a; this.title = (this.title==\'On\' ? \'Off\' : \'On\');" title="Off" class="firegpg-inline" >&nbsp;<span class="MRoIub" onclick="document.getElementById(\''+randId+'c\').onclick();">' + i18n.getString("GmailI") + '</span>';

                            if (cGmail2.default_sign)
                                checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'a\').onclick();</script>';

                            if (cGmail2.default_encrypt)
                                checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'b\').onclick();</script>';

                            if (cGmail2.default_inline)
                                checkboxes.innerHTML += '<script>document.getElementById(\''+randId+'c\').onclick();</script>';

                            firegpgactions.appendChild(title);
                            firegpgactions.appendChild(checkboxes);

                            fileattachimage = tablebox.getElementsByClassName('msHBT','img');

                            filesattachbox = fileattachimage[0].parentNode.parentNode;

                            try {
                                tablebox.firstChild.insertBefore(firegpgactions,filesattachbox);
                            } catch (e) {   fireGPGDebug(e,'cgmail2.checkDoc(insert checkboxes)',true); }





                        }

                        form =  listeTest[i].parentNode.getElementsByTagName('form');
                        //Nouvelle version du lundi 29 septembre 2008
                         if (form.length == 0) {

                            form = listeTest[i].parentNode.parentNode.getElementsByTagName('form');

                         }

                        form = form[0];


                        if (this.useremail == null) {
                            try {

                                var topwinjs = form.ownerDocument.defaultView.parent.wrappedJSObject;
                                if (("USER_EMAIL" in topwinjs) && typeof(topwinjs.USER_EMAIL) == "string")
                                {
                                    this.useremail = topwinjs.USER_EMAIL;
                                }
                                else if (("GLOBALS" in topwinjs) && typeof(topwinjs.GLOBALS[10]) == "string" &&
                                 (/@(g|google)mail.com$/i).test(topwinjs.GLOBALS[10]))
                                {
                                    // gmail_fe_509_p10
                                    this.useremail = topwinjs.GLOBALS[10];
                                }
                                else if (typeof(topwinjs.globals) == "object" && typeof(topwinjs.globals.USER_EMAIL) == "string")
                                {
                                    this.useremail = topwinjs.globals.USER_EMAIL;
                                } else {

                                    this.useremail = form.ownerDocument.evaluate(".//div[@class='nQ6QTe']//b[contains(text(), '@')]",
																		form.ownerDocument.body, null, XPathResult.FIRST_ORDERED_NODE_TYPE,
																		null).singleNodeValue.textContent;

                                }


                            } catch (e) { }


                        }

                        form.setAttribute("firegpg-mail-id", "");

                        findHere = form.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;
                        elements = findHere.getElementsByClassName('ArwC7c', 'div');
                        if (elements[0]) {
                            form.setAttribute("firegpg-mail-id", elements[0].getAttribute("firegpg-mail-id"));
                        }


                        var prefs = Components.classes["@mozilla.org/preferences-service;1"].
	                           getService(Components.interfaces.nsIPrefService);

                        prefs = prefs.getBranch("extensions.firegpg.");
                        try {
                            disable_autosave = prefs.getBoolPref("gmail_disable_autosave");
                        } catch (e) {
                            disable_autosave = false;
                        }

                         // Based on code of Gmail S/MIME
                        /*
                            Copyright (C) 2005-2007 Richard Jones.
                            Copyright (C) 2007-2008 Sean Leonard of SeanTek(R).

                            GPL 2 License.
                        */
                        // Disable autosave and add appropriate notification

                        if (disable_autosave && form) // && form
                        {

                            String.prototype.startsWith = function(s)
                            {
                                return (this.match('^'+s)==s);
                            };

                            String.prototype.trim = function() {
                                return this.replace(/^\s+|\s+$/g, '');
                            };


                           var subj = form.elements.namedItem("subject");

                            // STGS Method
                            function getValue()
                            {
                                // found two bad patterns: $q$_P$xVa$ -> t_a -> OP -> yUa -> BXa [->call] ...
                                // $q$_P$UWa$ -> O0a -> iQ -> WVa -> YYa [->call] -> $CNp$ [->apply] -> $e$ ...
                                // thus, search for what the stack function names start with
                                if (getValue.caller == null) return this.__proto__.__lookupGetter__("value").apply(this);
                                function stackMatch(pattern, func)
                                {
                                    for (var i = 0; i < pattern.length; i++)
                                    {
                                        if (func == null) return false;
                                        if (func.name.indexOf(pattern[i]) != 0 && func.name.indexOf(pattern[i]) != 3) return false;

                                        func = func.caller;
                                    }
                                    return true;
                                }
                                const badpattern1 = ["$mnb", "$knb", "$Zmb", "$1lb", "$Fjb", "$Ejb"];
                                const badpattern2 = ["$EUa", "$CUa", "$fUa", "$jTa", "$xRa"];
                                const badpattern3 = ["$R$_P$", "$R$_P$", "$R$_P$", "$R$_P$Lfb$", "$R$_P$xib$", "$Ouc$"];
                                const badpattern4 = ["$Y$_P$", "$Y$_P$", "$Y$_P$", "$Y$_P$Uib$", "$Y$_P$Glb$"]; // then $rga$, $e$, $a$__protected__$
                                const badpattern5 = ["$Z$_P$", "$Z$_P$", "$Z$_P$", "$Z$_P$ZBa$", "$Z$_P$nGb$"];
                                const badpattern6 = ["$Z$_P$", "$Z$_P$", "$Z$_P$", "$Z$_P$", "$T_$_P$YHa$"];
                                const badpattern7 = ["$Z$_P$", "$Z$_P$", "$Z$_P$", "$Z$_P$ptb$", "$E0$_P$BJa$"];
                                const badpattern8 = ["$Y$q$zVa$", "$Y$q$hsc$", "$Y$q$rq$", "$Y$q$RCb$", "$QZ$q$uPa$"];

                                if (stackMatch(badpattern8, getValue.caller) || stackMatch(badpattern7, getValue.caller) || stackMatch(badpattern6, getValue.caller) || stackMatch(badpattern5, getValue.caller) || stackMatch(badpattern4, getValue.caller) || stackMatch(badpattern3, getValue.caller) || stackMatch(badpattern1, getValue.caller) || stackMatch(badpattern2, getValue.caller))
                                {
                                    function AutosaveWreckingBall() {};
                                    AutosaveWreckingBall.prototype.value = "Wrecked";
                                    AutosaveWreckingBall.prototype.toString = function() { return "[object AutosaveWreckingBall]"; }
                                    throw new AutosaveWreckingBall();
                                }
                                else
                                {
                                    // debugger; // keep this around for later usage when needing to adjust badpatterns
                                }
                                // finally, if nothing matches:
                                return this.__proto__.__lookupGetter__("value").apply(this);
                            } // end getValue

                           function setValue(s)
                            {
                                this.__proto__.__lookupSetter__("value").call(this,s);
                            }

                            form.ownerDocument.defaultView.setTimeout(getValue.toString() + "\ndocument.getElementById('" + subj.id + "').__defineGetter__('value', getValue);\n" +
                            setValue.toString() + "\ndocument.getElementById('" + subj.id + "').__defineSetter__('value', setValue);\n",1);


                            // message about autosave disabled
                            var spanAS = form.ownerDocument.evaluate(".//div[contains(@class,'c1I77d')]/span[@class='x1Kcd']",
                                                                            form.parentNode.parentNode, null,
                                                                            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
                            for (var o=0;o<spanAS.snapshotLength;o++)
                            {
                                spanAS.snapshotItem(o).innerHTML = i18n.getString("autosave-disabled");
                            }


                     } // end if autosave disabled




                        //End of code of Gmail S/MIME.


                    }
                }
                //END OF THE TEST FOR COMPOSE BUTTONS

                cGmail2.docOccuped[id] = false;

            }
        }
    },



    /*
        Function: callBack
        This function create a function witch is called when the user click on a button

        Parameters:
            doc - The document of the button.
    */
    callBack: function(doc) {

        this._doc = doc;

		this.handleEvent = function(event) { // Function in the function for handle... events.
			var i18n = document.getElementById("firegpg-strings");

           /* if (event.target.nodeName == "SELECT")
                return;

            try {

                if (event.target.nodeName == "OPTION") {

                    var tmpval = event.target.value;

                    var target = event.target.parentNode;

                    target.setAttribute('gpg_action', tmpval);

                    target.value = "FireGPG";
                } else { */

                    target = event.target;





        /*        }

            } catch (e)  { fireGPGDebug(e,'cgmail2.callBack',true);  } /*


           /* //If the user want to decrypt the mail (can use normal attibutes)
			if (target.innerHTML == i18n.getString("GMailD")) {

                var tmpNode = target;

                var mailNode = null;

                tmpNode = tmpNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode.parentNode;

                var tmpNode = tmpNode.getElementsByTagName('div');


                for (var i = 0; i < tmpNode.length; i++) {

                    if (tmpNode[i].hasAttribute("gpg") == true) {
                        mailNode = tmpNode[i];
                        break;
                    }
                }

                if (mailNode == null) { alert('Mail node not found !');
                    return; }

				contenuMail = cGmail2.getMailContent(mailNode, this._doc);

				var result = FireGPG.decrypt(false,contenuMail);

                if (result.result == RESULT_SUCCESS)
					showText(result.decrypted,undefined,undefined,undefined,result.signresulttext);

			}
			else if (target.getAttribute('gpg_action') == "sndsign" || target.getAttribute('gpg_action') == "sign")
			{

				var mailContent = cGmail2.getWriteMailContent(this._doc,target.parentNode);

				if (mailContent == "")
					return;

				var result = FireGPG.sign(false,gmailWrapping(mailContent));

                if (result.result == RESULT_SUCCESS) {

					cGmail2.setWriteMailContent(this._doc,target.parentNode,result.signed);

					if (target.getAttribute('gpg_action') == "sndsign")
						cGmail2.sendEmail(target.parentNode,this._doc);
				}

			}
            else if (target.getAttribute('gpg_action') == "sndpsign" || target.getAttribute('gpg_action') == "psign")
			{

				var mailContent = cGmail2.getWriteMailContent(this._doc,target.parentNode);

				if (mailContent == "")
					return;

				var result = FireGPG.sign(false,gmailWrapping(mailContent),null,null,true);

                if (result.result == RESULT_SUCCESS) {

					cGmail2.setWriteMailContent(this._doc,target.parentNode,result.signed);

					if (target.getAttribute('gpg_action') == "sndpsign")
						cGmail2.sendEmail(target.parentNode,this._doc);
				}

			}
			else if (target.getAttribute('gpg_action') == "sndcrypt" || target.getAttribute('gpg_action') == "crypt")
			{

				//This code has to mix with the previous else/if block
				var mailContent = cGmail2.getWriteMailContent(this._doc,target.parentNode);

				var whoWillGotTheMail = cGmail2.getToCcBccMail(this._doc,target.parentNode);

				if (mailContent == "")
					return;

                var result = FireGPG.crypt(false,mailContent,null, false, false,whoWillGotTheMail);

				if(result.result == RESULT_SUCCESS) {

					cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);

					if (target.getAttribute('gpg_action') == "sndcrypt")
					{
						cGmail2.sendEmail(target.parentNode,this._doc);
					}

				}
			}
			else if (target.getAttribute('gpg_action') == "sndsigncrypt" || target.getAttribute('gpg_action') == "signcrypt")
			{

				//This code has to mix with the previous else/if block
				var mailContent = cGmail2.getWriteMailContent(this._doc,target.parentNode);

				var whoWillGotTheMail = cGmail2.getToCcBccMail(this._doc,target.parentNode);


				if (mailContent == "")
					return;

				var result = FireGPG.cryptAndSign(false, mailContent, null ,false,null, null, false, whoWillGotTheMail);

				// If the sign failled
				if(result.result == RESULT_ERROR_UNKNOW) {
					// We alert the user
					alert(i18n.getString("cryptAndSignFailed"));
				}
                else if(result.result == RESULT_ERROR_PASSWORD) {
					// We alert the user
					alert(i18n.getString("cryptAndSignFailedPass"));
				}
				else {

					cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);

					if (target.getAttribute('gpg_action') == "sndsigncrypt")
					{
						cGmail2.sendEmail(target.parentNode,this._doc);
					}

				}
			}
            else */ if (target.getAttribute('gpg_action') == "add_crypted" || target.getAttribute('gpg_action') == "add_crypted_and_sign")
			{

                //Ok, so the user want to crypt a file.

                //First, we got the file. We will crypt him, and save it the the temp folder. Next, we ask gmail to add the file.

                //Get the file
                var nsIFilePicker = Components.interfaces.nsIFilePicker;
                var fp = Components.classes["@mozilla.org/filepicker;1"]
                        .createInstance(nsIFilePicker);
                fp.init(window, null, nsIFilePicker.modeOpen);
                fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);
                if (fp.show() != nsIFilePicker.returnOK) //L'utilisateur annule
                  return;

                var filePath = fp.file.path;

                var data = EnigConvertToUnicode(getBinContent("file://" + filePath), 'UTF-8');

                var whoWillGotTheMail = cGmail2.getToCcBccMail(this._doc,target.parentNode.parentNode.parentNode);

				if (data == "")
					return;

                errors = false;

                if (target.getAttribute('gpg_action') == "add_crypted") {

                    var result = FireGPG.crypt(false,data,null, false, true,whoWillGotTheMail);

                    if(result.result != RESULT_SUCCESS)
                        errors = true;

                } else {

                    // We get the result
                    var result = FireGPG.cryptAndSign(false, data, null ,false,null, null,true, whoWillGotTheMail);

                    if(result.result != RESULT_SUCCESS)
                        errors = true;

                }

                if (errors == false){

					var newData = result.encrypted;

                    var fileobj = getTmpDir();

                    fileobj.append( fp.file.leafName + ".asc");
                    fileobj.createUnique(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0777);

                    putIntoBinFile(fileobj.path,newData);


                    //We simulate the add
                    var tablebox = target.parentNode.parentNode.getElementsByTagName('table');
                    tablebox = tablebox[0];

                    //The last span is evry time a "Attach file" button.

                    //This is the 'Attach another'
                    var FileButtonList = tablebox.getElementsByTagName('span');
                    FileButton = FileButtonList[FileButtonList.length-1];

                    //If he is hidden, there no files for the moment. We take an another button
                    if (FileButton.parentNode.parentNode.parentNode.getAttribute("style").indexOf("display: none") != -1)
                    {

                        if (FileButtonList[FileButtonList.length-2].innerHTML == FileButtonList[FileButtonList.length-1].innerHTML)
                            FileButton = FileButtonList[FileButtonList.length-2];
                        else
                            FileButton = FileButtonList[FileButtonList.length-3];

                    }


                    var evt = doc.createEvent("MouseEvents");
					evt.initEvent("click", true, true);
					FileButton.dispatchEvent(evt);

                    //Get the list of inputs
                    var InputList = tablebox.getElementsByTagName('input');


                    for (var j = 0; j < InputList.length; j++) {

                        if (InputList[j].getAttribute("type") == "file") {
                            if (InputList[j].value == "")
                            {
                                InputList[j].value = fileobj.path;
                                break;
                            }
                        }
                    }
				}
			} else  if (target.getAttribute('gpg_action') == "send_button" || target.getAttribute('gpg_action') == "send_button2") {

                stopTheEvent = false;

                buttonsboxes = target.parentNode.parentNode.parentNode.parentNode.parentNode;

                tmpimage = buttonsboxes.getElementsByClassName('firegpg-sign', 'img');
                sign = tmpimage[0].title == 'On';

                tmpimage = buttonsboxes.getElementsByClassName('firegpg-encrypt', 'img');
                encrypt = tmpimage[0].title == 'On';

                tmpimage = buttonsboxes.getElementsByClassName('firegpg-inline', 'img');
                inline = tmpimage[0].title == 'On';



                if (inline) {

                    var mailContent = cGmail2.getWriteMailContent(this._doc,target.parentNode, true);

                    var whoWillGotTheMail = cGmail2.getToCcBccMail(this._doc,target.parentNode);

                    if (mailContent == "")
                        stopTheEvent = true;
                    else {

                        if (sign && encrypt) {

                            var result = FireGPG.cryptAndSign(false, mailContent, null ,false,null, null, false, whoWillGotTheMail);

                            // If the sign failled
                            if(result.result == RESULT_ERROR_UNKNOW) {
                                // We alert the user
                                alert(i18n.getString("cryptAndSignFailed"));
                                stopTheEvent = true;
                            }
                            else if(result.result == RESULT_ERROR_PASSWORD) {
                                // We alert the user
                                alert(i18n.getString("cryptAndSignFailedPass"));
                                stopTheEvent = true;
                            }
                            else {

                                cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);

                            }


                        } else if (sign) {

                            var result = FireGPG.sign(false,gmailWrapping(mailContent));

                            if (result.result == RESULT_SUCCESS) {

                                cGmail2.setWriteMailContent(this._doc,target.parentNode,result.signed);

                            } else {

                                stopTheEvent = true;
                            }

                        } else if (encrypt) {

                            var result = FireGPG.crypt(false,mailContent,null, false, false,whoWillGotTheMail);

                            if(result.result == RESULT_SUCCESS) {
                                cGmail2.setWriteMailContent(this._doc,target.parentNode,result.encrypted);
                            }  else {
                                stopTheEvent = true;
                            }


                        }
                    }

                } else {

                    if (target.getAttribute('gpg_action') == "send_button2")
                        buttonsboxes = target.parentNode.parentNode;
                    else
                        buttonsboxes = target.parentNode;

                    //alert("S:" + sign + " E:" + encrypt + " I:" + inline);

                    form =  buttonsboxes.parentNode.parentNode.parentNode.getElementsByTagName('form');
                     f = form[0];

                     cGmail2.setProgressMessage(f, i18n.getString("GmailCreatingMail"));

                    prefs = new Object();

                    var children = buttonsboxes.getElementsByTagName('button');

                    a = new FireGPGGmailMimeSender(f, children[2], i18n);


                    var prefs = Components.classes["@mozilla.org/preferences-service;1"].
                        getService(Components.interfaces.nsIPrefService);

                    prefs = prefs.getBranch("extensions.firegpg.");
                    try {
                        var username = prefs.getCharPref("gmail_username");
                    } catch (e) {
                        username = "";
                    }


                    if (username == "")
                        a.smtpUsername = cGmail2.useremail;
                    else
                        a.smtpUsername = username;


                    try {
                        var host = prefs.getCharPref("gmail_host");
                    } catch (e) {
                        host = "smtp.gmail.com";
                    }

                    a.smtpServer = host;


                    try {
                        var port = prefs.getCharPref("gmail_port");
                    } catch (e) {
                        port = 465;
                    }


                    a.smtpPort = port;

                    try {
                        var use_ssl = prefs.getBoolPref("gmail_use_ssl",true);
                    } catch (e) {
                        use_ssl = true;
                    }

                    if (use_ssl)
                        a.smtpSocketTypes = new Array("ssl");

                    fireGPGDebug(a.smtpUsername, 'dbug-username');
                    fireGPGDebug(host, 'dbug-host');
                    fireGPGDebug(port, 'dbug-port');
                    fireGPGDebug(use_ssl, 'dbug-use_ssl');


                    from = cGmail2.getMailSender(this._doc,buttonsboxes);
                    if (from == "" || from == null)
                        from = cGmail2.useremail;

                    to = cGmail2.getToCcBccMail(this._doc,buttonsboxes, true);
                    cc= cGmail2.getToCcBccMail(this._doc,buttonsboxes, false, true);
                    bcc = cGmail2.getToCcBccMail(this._doc,buttonsboxes,  false, false, true);

                    subject = cGmail2.getMailSubject(this._doc,buttonsboxes);


                    //Attachements

                    var attachments = new Array(), attlink;
                    // iterate over all Gmail form elements
                    //	var attachNumber = 0;
                    for (var i=0;i<f.elements.length;i++)
                    {
                        var elem = f.elements[i];
                        if (elem.type == "button" || elem.name == null ||
                            elem.name.length == 0)
                            continue;

                        if (elem.type == "file")
                        {
                            // Add files to multipart encoder
                            if (elem.value != null && elem.value.length) {
                                attachments.push(elem.value);
                            }
                        }
                        else if (elem.type == "checkbox" && elem.name == "attach" && elem.checked && elem.nextSibling && (attlink = elem.nextSibling.nextSibling) && (attlink instanceof HTMLAnchorElement))
                        {
                            // this is an already-attached file, and the user wants it.
                            var ioService=Components.classes["@mozilla.org/network/io-service;1"].getService(Components.interfaces.nsIIOService);
                            var channel=ioService.newChannel(attlink.href,null,null);
                            attachments.push(channel);
                        }
                    } // end for

                    var mailContent = cGmail2.getWriteMailContentForDirectSend(this._doc,target.parentNode);

                    var inreplyTo = f.getAttribute("firegpg-mail-id");

                    resulta = false;

if (encrypt) {
                   resulta = a.ourSubmit(from, to, cc, bcc, subject,
                    inreplyTo, "", mailContent, false, attachments, prefs);
}

                    //DBUG
                    fireGPGDebug(from, 'dbug-from');
                    fireGPGDebug(to, 'dbug-to');
                    fireGPGDebug(cc, 'dbug-cc');
                    fireGPGDebug(bcc, 'dbug-bcc');
                    fireGPGDebug(subject, 'dbug-subject');

                   if (!resulta)
                    cGmail2.setProgressMessage(f, i18n.getString("GmailErrorMail"));
                   else
                    cGmail2.setProgressMessage(f, i18n.getString("GmailSendingMail"));

                    stopTheEvent = true;

                }




                if (stopTheEvent)
                    event.stopPropagation();
            }
		};
	},

    /*
        Function: addBouton
        This function create a html button at the end of a node
        OR append a opton value on the select (who is created), if the user request for this.

        (DEPECIATED)

        Parameters:
            box - The node where the button is added.
            doc - The page's document (of the node)
            label - The label of the button
            action- The action of the button (for the callback)
            spamLimite -  The node before when we create the button.
    *//*
    addBouton: function(box,doc,label,action,spamLimite) {

        if ( ! this.b_use_select_s) {

            var bouton = new Object;
            bouton = null;
            bouton = doc.createElement("button");

            bouton.setAttribute("type","button");
            bouton.setAttribute("gpg_action",action);

            bouton.setAttribute("style","width: auto;");


            bouton.innerHTML = label;

            try {
                box.insertBefore(bouton,spamLimite);


            } catch (e) { fireGPGDebug(e,'cgmail2.addBouton',true);  }

        } else { //we have to use a select list.

            //We try to found a select who already exist.

            var selectlist = box.getElementsByTagName('select');

            if (selectlist[0])
                var select = selectlist[0];
            else {

                var select = new Object;
                select = null;
                select = doc.createElement("select");

                select.setAttribute("gpg_action","SELECT");

                select.setAttribute("style","font-size: 80%; margin-left: 5px; margin-bottom: 5px;");

                var option = new Option("FireGPG","FireGPG");

                select.add(option,null);

                try {
                    box.insertBefore(select,spamLimite);

                     var tmpListener = new Object;
                    tmpListener = null;
                    tmpListener = new cGmail2.callBack(doc)
                    select.addEventListener('onchange',tmpListener,true);

               } catch (e) { fireGPGDebug(e,'cgmail2.addBouton2',true);  }

            }

            //Now we add the option.
            var option = new Option("> " + label,action);

            select.add(option,null);

        }
	},*/

    /*
        Function: sendEmail
        Simulate a click on the send button.

        Parameters:
            nodeForScan - The node with the send button
            dDocument - The document of the page
    */
	sendEmail: function(nodeForScan, dDocument)
	{

		var children = nodeForScan.getElementsByTagName('button');


			try {
				var evt = dDocument.createEvent("MouseEvents");
					evt.initEvent("click", true, true);
					children[0].dispatchEvent(evt);
			 } catch (e) { fireGPGDebug(e,'cgmail2.sendEmail',true);  }

	},

    /*
        Function: getWriteMailContent
        Return the content of a mail in composition (his selection if something is selected)

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getWriteMailContent: function(dDocument,boutonxboxnode, betterTextOnly)
	{

        if (betterTextOnly && cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe") {

            var i18n = document.getElementById("firegpg-strings");

            if (confirm(i18n.getString("betterToUsePlainText"))) {

                whereSeacrch =boutonxboxnode.parentNode.parentNode.parentNode.parentNode.parentNode;

                children = whereSeacrch.getElementsByClassName('g7q0he', 'span');

                try {
                    var evt = dDocument.createEvent("MouseEvents");
                        evt.initEvent("click", true, true);
                        children[0].dispatchEvent(evt);
               } catch (e) { fireGPGDebug(e,'cgmail2.getWriteMailContent(settoplaintext)',true);  }

            }

        }

        if (cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe")
        {

            var iframe = cGmail2.getTheIframe(dDocument,boutonxboxnode);


            //First, we look for a selection
            try { var select = iframe.contentWindow.getSelection(); }
            catch (e) { var select = ""; }

            //Autodetect
            if (select.toString() == "")
            {
                try { var select = iframe.contentWindow.document.body.innerHTML; }
                catch (e) { var select = ""; }

                if ( select != "")
                {

                    var indexOfQuote = select.indexOf('<div class="gmail_quote">');

                    contenuMail = select.substring(0,indexOfQuote);
                        if (!forMime)
                        contenuMail =     Selection.wash(contenuMail);

                    if (indexOfQuote == -1 || TrimAndWash(contenuMail) == "")
                    {
                        indexOfQuote = select.length;
                        contenuMail = select.substring(0,indexOfQuote);
                        if (!forMime)
                        contenuMail =     Selection.wash(contenuMail);

                    }

                    this.composeIndexOfQuote  = indexOfQuote;
                }
            }
            else
            {
                value = select.getRangeAt(0);


                var documentFragment = value.cloneContents();

                var s = new XMLSerializer();
                var d = documentFragment;
                var str = s.serializeToString(d);

                contenuMail = Selection.wash(str);

            }


        } else {

            var textarea = cGmail2.getTheTextarea(dDocument,boutonxboxnode);

            var select2 = "";
            //Mode plain text

            //Selection
            try {
                select2 = textarea.value;
                select2 = select2.substring(textarea.selectionStart,textarea.selectionEnd);
            } catch (e) { }


            //Autodetect
            if (select2 == "")
            {
                select2 = textarea.value;

                var indexOfQuote = select2.indexOf("\n> ");
                select2 = select2.substring(0,indexOfQuote);

                indexOfQuote = select2.lastIndexOf("\n");

                var contentu = select2.substring(0,indexOfQuote);

                if (indexOfQuote == -1 || TrimAndWash(contentu) == "")
                {
                    select2 = textarea.value;
                    indexOfQuote = select2.length;

                    var contentu = select2.substring(0,indexOfQuote);
                }

                textarea.selectionStart = 0;
                textarea.selectionEnd = indexOfQuote;

                contenuMail = Selection.wash(contentu);
            }
            else
            {

                contenuMail = Selection.wash(select2);
            }


        }

        //Remove stranges A0
        var reg=new RegExp(unescape('%A0'), "gi");
        contenuMail = contenuMail.replace(reg," ");


        return contenuMail;
	},


    /*
        Function: getWriteMailContentForDirectSend
        Return the content of a mail in composition (his selection if something is selected)

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getWriteMailContentForDirectSend: function(dDocument,boutonxboxnode)
	{



        if (cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe")
        {

            var iframe = cGmail2.getTheIframe(dDocument,boutonxboxnode);

            texte = iframe.contentWindow.document.body.innerHTML;

            var reg=new RegExp("<script[^>]*>[^<]*</script[^>]*>", "gi"); //Élimination des scripts
            texte = texte.replace(reg,"\n");

            var reg=new RegExp("<script[^>]*>[^<]*</script>", "gi"); //Élimination des scripts
            texte = texte.replace(reg,"\n");

            var reg=new RegExp("<script>[^<]*</script>", "gi"); //Élimination des scripts
            texte = texte.replace(reg,"\n");

            return texte;


        } else {

            var textarea = cGmail2.getTheTextarea(dDocument,boutonxboxnode);

            return textarea.value.replace(/</gi, "&lt;").replace(/>/gi,"&gt;").replace(/\r\n/gi, "\n").replace(/\r/gi, "\n").replace(/\n/gi, "<br />");


        }
	},

    /*
        Function: iframeOrTextarea
        Return iframe if the iframe is used to compose the mail, textarea if not.

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    iframeOrTextarea: function(dDocument,boutonxboxnode) {

        var iframe = cGmail2.getTheIframe(dDocument,boutonxboxnode);
        var textarea = cGmail2.getTheTextarea(dDocument,boutonxboxnode);

        if (iframe == null || iframe.parentNode == undefined)
            return "textarea";

        if (textarea == null || textarea.parentNode == undefined)
            return "iframe";

        var style = iframe.parentNode.getAttribute('style');

        if (style.indexOf('display: none;') != -1)
            return "textarea";

        return "iframe";


    },

    /*
        Function: getTheIframe
        Return the iframe used to compose a mail

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getTheIframe: function(dDocument,boutonxboxnode) {

        var tmp = boutonxboxnode;

        tmp = tmp.parentNode;

        tmp = tmp.childNodes[1];

        //29 septebmre 2008
        if (!tmp) {

             var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

        }

        if (!tmp) { //Version du 29 octobre 2008 - BOUTONS DU BAS

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

           tmp = tmp.childNodes[1];

        }

        tmp = tmp.firstChild;

        tmp = tmp.childNodes[2];

        if (!tmp) { //Version du 29 octobre 2008

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

            tmp = tmp.firstChild;

            tmp = tmp.childNodes[2];

        }

        tmp = tmp.childNodes[1];

        tmp = tmp.getElementsByTagName('iframe');

        tmp = tmp[0];

        return tmp;


    },

    /*
        Function: getTheTextarea
        Return the textarea used to compose a mail

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getTheTextarea: function(dDocument,boutonxboxnode) {

        var tmp = boutonxboxnode;

        tmp = tmp.parentNode;

        tmp = tmp.childNodes[1];

         //29 septebmre 2008
        if (!tmp) {

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

        }

        if (!tmp) { //Version du 29 octobre 2008 - BOUTONS DU BAS

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

           tmp = tmp.childNodes[1];

        }

        tmp = tmp.firstChild;

        tmp = tmp.childNodes[2];

        if (!tmp) { //Version du 29 octobre 2008 - BOUTONS DU HAUT

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

            tmp = tmp.firstChild;

            tmp = tmp.childNodes[2];

        }

        tmp = tmp.childNodes[1];

        tmp = tmp.getElementsByTagName('textarea');

        tmp = tmp[0];

        return tmp;

    },

    /*
        Function: getToCcBccMail
        Return the To, CC and BCC filds' value of a mail in composition.

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
	getToCcBccMail: function(dDocument,boutonxboxnode, onlyto, onlycc, onlybcc) {
		var forWho = "";
		var tmpFor = "";

        var tmp = boutonxboxnode;

        tmp = tmp.parentNode;

        tmp = tmp.childNodes[1];

         //29 septebmre 2008
        if (!tmp) {

             var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

        }

         if (!tmp) { //Version du 29 octobre 2008 - BOUTONS DU HAUT

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];


        }

        tmp = tmp.firstChild;



        var textareas = tmp .getElementsByTagName("textarea");


        //On cherche la boite avec les boutons
        for (var j = 0; j < textareas.length; j++) {
            if (textareas[j].getAttribute("name") == "to" || textareas[j].getAttribute("name") == "cc" || textareas[j].getAttribute("name") == "bcc") {

                forWho = forWho + " " + textareas[j].value;

                if (onlyto && textareas[j].getAttribute("name") == "to")
                    return  textareas[j].value;

                if (onlycc && textareas[j].getAttribute("name") == "cc")
                    return  textareas[j].value;

                if (onlybcc && textareas[j].getAttribute("name") == "bcc")
                    return  textareas[j].value;



            }
        }


    	//Pattern
		var reg = new RegExp('[a-zA-Z0-9._-]+@[a-zA-Z0-9-]+\.[a-zA-Z.]{2,5}', 'gi');

		var aMail = reg.exec(forWho);

		var i = 0;
		var returnList = new Array();

		while(aMail != null)
		{
			returnList[i] = aMail;
			i++;
			aMail = reg.exec(forWho);
		}

		return returnList;
	},

    /*
    */

    getMailSender: function(dDocument,boutonxboxnode) {

        var tmp = boutonxboxnode;

        tmp = tmp.parentNode;

        tmp = tmp.childNodes[1];

         //29 septebmre 2008
        if (!tmp) {

             var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

        }

         if (!tmp) { //Version du 29 octobre 2008 - BOUTONS DU HAUT

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];


        }

        tmp = tmp.firstChild;



        var selects = tmp .getElementsByTagName("select");


        //On cherche la boite avec les boutons
        for (var j = 0; j < selects.length; j++) {
            if (selects[j].getAttribute("name") == "from") {

                return selects[j].value;

            }
        }

        return "";





    },

        getMailSubject: function(dDocument,boutonxboxnode) {

        var tmp = boutonxboxnode;

        tmp = tmp.parentNode;

        tmp = tmp.childNodes[1];

         //29 septebmre 2008
        if (!tmp) {

             var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];

        }

         if (!tmp) { //Version du 29 octobre 2008 - BOUTONS DU HAUT

            var tmp = boutonxboxnode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.parentNode;

            tmp = tmp.childNodes[1];


        }

        tmp = tmp.firstChild;



        var inputs  = tmp .getElementsByTagName("input");


        //On cherche la boite avec les boutons
        for (var j = 0; j < inputs.length; j++) {
            if (inputs[j].getAttribute("name") == "subject") {

                return inputs[j].value;

            }
        }

        return "";





    },


    /*
        Function: setWriteMailContent
        Set the content of a mail in composition (his selection if something is selected)

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
            newText - The new text
    */
	setWriteMailContent: function(dDocument,boutonxboxnode,newText)
	{




        if (cGmail2.iframeOrTextarea(dDocument,boutonxboxnode) == "iframe")
        {

            var iframe = cGmail2.getTheIframe(dDocument,boutonxboxnode);


            //First, we look for a selection
            try { var select = iframe.contentWindow.getSelection(); }
            catch (e) { var select = ""; }

            //Autodetect
            if (select.toString() == "")
            {
                try { var select = iframe.contentWindow.document.body.innerHTML; }
                    catch (e) { var select = ""; }

                var reg=new RegExp("<", "gi");
                newText = newText.replace(reg,"&lt;");

                var reg=new RegExp("\n", "gi");
                newText = newText.replace(reg,"<br>");

                iframe.contentWindow.document.body.innerHTML = newText + select.substring(this.composeIndexOfQuote, select.length) + "<br /><br />";
            }
            else
            {
                var reg=new RegExp("<", "gi");
                newText = newText.replace(reg,"&lt;");

                var reg=new RegExp("\n", "gi");
                newText = newText.replace(reg,"<br>");

                var range = select.getRangeAt(0);
                var el = iframe.contentWindow.document.createElement("div");

                el.innerHTML = newText;

                range.deleteContents();
                range.insertNode(el);

            }


        } else {

            var textarea = cGmail2.getTheTextarea(dDocument,boutonxboxnode);

            var startPos = textarea.selectionStart;
            var endPos = textarea.selectionEnd;
            var chaine = textarea.value;

            // We create the new string and replace it into the focused element
            textarea.value = chaine.substring(0, startPos) + newText + chaine.substring(endPos, chaine.length);

            // We select the new text.
            textarea.selectionStart = startPos;
            textarea.selectionEnd = startPos + newText.length ;

        }


	},


    /*
        Function: getMailContent
        Retrun the content of a mail, need the div object with the mail

        Parameters:
            i - The mail node
            doc - The document of the page.
    */
	getMailContent: function(i,doc) {
		var contenuMail = i;
		var range = doc.createRange();
		range.selectNode(contenuMail);
		var documentFragment = range.cloneContents();
		var s = new XMLSerializer();
		var d = documentFragment;
		var str = s.serializeToString(d);
		contenuMail = Selection.wash(str);


        //Remove stranges A0
        var reg=new RegExp(unescape('%A0'), "gi");
        contenuMail = contenuMail.replace(reg," ");

		return contenuMail;

	},

        /*
        Function: setMailContent
        Set the content of a mail, need the div object with the mail

        Parameters:
            i - The mail node
            doc - The document of the page.
            data - The html of the mail
    */
	setMailContent: function(i,doc,data) {
		i.innerHTML = data;

	},

    /*//On détruit tous les documents.
    listenerUnload: function () {



    },*/

    /*
        Function: initSystem
        This function init the class : she load specific options, and attach listeners to the webpages.
    */
    initSystem: function() {

		var prefs = Components.classes["@mozilla.org/preferences-service;1"].
		                        getService(Components.interfaces.nsIPrefService);
		prefs = prefs.getBranch("extensions.firegpg.");

		try {
			var usegmail = prefs.getBoolPref("gmail_enabled");
		}
		catch (e) {
			var usegmail = false;
		}

		if (usegmail == true) {

            if (document.getElementById("appcontent"))
                document.getElementById("appcontent").addEventListener("DOMContentLoaded", cGmail2.pageLoaded, false);
            else
                document.getElementById("browser_content").addEventListener("DOMContentLoaded", cGmail2.pageLoaded, false);
			//window.addEventListener("unload", function() {cGmail2.listenerUnload()}, false);

		/*	try {	var nonosign = prefs.getBoolPref("gmail_no_sign_off");	}
			catch (e) { var nonosign = false; }
			try {	var b_sign = prefs.getBoolPref("gmail_butons_sign");	}
			catch (e) { var b_sign = true; }
			try {	var b_sign_s = prefs.getBoolPref("gmail_butons_sign_send");	}
			catch (e) { var b_sign_s = true; }
            try {	var b_psign = prefs.getBoolPref("gmail_butons_psign");	}
            catch (e) { var b_psign = true; }
			try {	var b_psign_s = prefs.getBoolPref("gmail_butons_psign_send");	}
			catch (e) { var b_psign_s = true; }
			try {	var b_crypt = prefs.getBoolPref("gmail_butons_crypt");	}
			catch (e) { var b_crypt = true; }
			try {	var b_crypt_s = prefs.getBoolPref("gmail_butons_crypt_send");	}
			catch (e) { var b_crypt_s = true; }

			try {	var b_signcrypt = prefs.getBoolPref("gmail_butons_sign_crypt");	}
			catch (e) { var b_signcrypt = true; }

            try {	var b_signcrypt_s = prefs.getBoolPref("gmail_butons_sign_crypt_send");	}
			catch (e) { var b_signcrypt_s = true; }

            try {	var b_use_select_s = prefs.getBoolPref("gmail_butons_use_select");	}
			catch (e) { var b_use_select_s = false; }

			cGmail2.nonosign = nonosign;
			cGmail2.b_sign = b_sign;
			cGmail2.b_sign_s = b_sign_s;
            cGmail2.b_psign = b_psign;
			cGmail2.b_psign_s = b_psign_s;
			cGmail2.b_crypt = b_crypt;
			cGmail2.b_crypt_s = b_crypt_s;
			cGmail2.b_signcrypt = b_signcrypt;
			cGmail2.b_signcrypt_s = b_signcrypt_s;
            cGmail2.b_use_select_s = b_use_select_s; */

            try {	var default_sign = prefs.getBoolPref("gmail_select_by_default_sign");	}
			catch (e) { var default_sign = false; }

            try {	var default_encrypt = prefs.getBoolPref("gmail_select_by_default_encrypt");	}
			catch (e) { var default_encrypt = false; }

            try {	var default_inline = prefs.getBoolPref("gmail_select_by_default_inline");	}
			catch (e) { var default_inline = false; }

            cGmail2.default_sign = default_sign;
			cGmail2.default_encrypt = default_encrypt;
			cGmail2.default_inline = default_inline;


		}
	},


    /*
        Function: pageLoaded
        This function is called when a page is loaded. If it's seem to be a gmail page, listeners are added.

        Parameters:
            aEvent - The event of the load
    */
    pageLoaded: function(aEvent) {

        var doc = aEvent.originalTarget;



        final_location = doc.location.href;

        var regrex = new RegExp('^https?://mail.google.com/a/[a-zA-Z-.0-9]*');

        final_location = final_location.replace(regrex, "http://mail.google.com/mail");



        //Find IK
        if (final_location.indexOf("http://mail.google.com/mail/?ui=2&ik=") == 0 || final_location.indexOf("https://mail.google.com/mail/?ui=2&ik=") == 0) {

            var tmp_string = final_location.substring(final_location.indexOf("&ik=") + 4, final_location.length);
            var ik = tmp_string.substring(0, tmp_string.indexOf('&'));

            cGmail2.ik = ik;

        }

        //Fing base url
        if (cGmail2.baseUrl == undefined && (final_location.indexOf("http://mail.google.com/mail/?ui=2") == 0 || final_location.indexOf("https://mail.google.com/mail/?ui=2") == 0)) {

            cGmail2.baseUrl = doc.location.href.substring(0, doc.location.href.indexOf("?ui=2"));

        }

        //Add windowopen rewriter
        if (final_location.indexOf("http://mail.google.com/mail/") == 0 || final_location.indexOf("https://mail.google.com/mail/") == 0) {

           sr = doc.createElement('script');
            sr.innerHTML = "var windowopen_ = window.open; window.open = function (a,b,c) {  if (document.getElementById('canvas_frame') && document.getElementById('canvas_frame').contentDocument && document.getElementById('canvas_frame').contentDocument.body && document.getElementById('canvas_frame').contentDocument.body.getAttribute('firegpg').indexOf('#FIREGPGCAPTURE') != -1) { document.getElementById('canvas_frame').contentDocument.body.setAttribute('firegpg',a); return new Window();  } else { return windowopen_(a,b,c); }};"
            doc.body.appendChild(sr);



        }





        //http://mail.google.com/mail/?ui=2&ik=8e7a8837c3&

        if (final_location.indexOf(GMAIL_MAIN_DOC_URL) == 0 || final_location .indexOf(GMAIL_MAIN_DOC_URL2) == 0) {

            doc.getElementsByClassName = function(className, tag) {

            if (tag == undefined)
                tag = "*"

            className = " " + className + " "

            var elts =  doc.getElementsByTagName(tag);

            var classArray = new Array();

            for (var j = 0; j < elts.length; ++j) {

                lf = "  " + elts[j].className + " "

                if (lf.indexOf(className) > 0) {

                        classArray.push(elts[j]);
                    }
                }

                return classArray;

            };




            cGmail2.current = cGmail2.current + 1;

            cGmail2.doc[cGmail2.current] = doc;

            /*var tmpListener = new Object;
            tmpListener = null;
            tmpListener = new cGmail2.clickOnDock(cGmail2.current)
            doc.addEventListener('mousedown',tmpListener,true);*/

            var tmpListener = new Object;
            tmpListener = null;
            tmpListener = new cGmail2.whenNodeIsInsered(cGmail2.current)
            doc.addEventListener('DOMNodeInserted',tmpListener,true);



            //setTimeout("cGmail2.checkDoc("+cGmail2.current+")", 5000);

        }

    },

        /*
        Function: clickOnDock
        This function is called when the user click on the page. She will call <checkDoc> 5s later.

        Parameters:
            docid - The document 's id of the click.
    */
    clickOnDock: function(docid) {

        this._docid = docid;

        //
        this.handleEvent = function(event) {

            if (cGmail2.docOccuped[this._docid] == undefined || cGmail2.docOccuped[this._docid] == false)
            {

                setTimeout("cGmail2.checkDoc("+this._docid+")", 5000);
                cGmail2.docOccuped[this._docid] = true;
            }


        }


    },

    whenNodeIsInsered: function(docid) {

        this._docid = docid;

        //
        this.handleEvent = function(event) {

          // fireGPGDebug(event.target.className);

            if ((event.target.className == "HprMsc" || event.target.className == "y4Wv6d" || event.target.className == "XoqCub") && (cGmail2.docOccuped[this._docid] == undefined || cGmail2.docOccuped[this._docid] == false)) //load old mail | compose | Mail widnow
            {

                setTimeout("cGmail2.checkDoc("+this._docid+")", 0);
                 cGmail2.docOccuped[this._docid] = true;

            }


        }


    },

     /*
        Function: getMimeMailContens
        Return the mime source of a mail

        Parameters:
            id - The mail's id
    */
	getMimeMailContens: function(id,doc) {


        var elements = id.parentNode.getElementsByTagName("img");

        actionbox = "";

        //On cherche la boite avec les boutons
        for (var j = 0; j < elements.length; j++) {
            if (elements[j].getAttribute("class") == "S1nudd") {
                actionbox = elements[j].parentNode;
                break;
            }
        }

         //There is ugly hack. It's the most ugly hack ever.
        var evt = doc.createEvent("MouseEvents");
         evt.initMouseEvent("click", true, true, window,
           0, 0, 0, 0, 0, false, false, false, false, 0, null);

        var a = actionbox.dispatchEvent(evt);

       //On choppe le bouton en question
       //CHILDREN OF zWKgkf
       // act="32"

        papa = doc.getElementsByClassName('zWKgkf');
        papa = papa[0];

        for (var j = 0; j < papa.childNodes.length; j++) {
            if (papa.childNodes[j].getAttribute("act") == "32") {
                detailsElement = papa.childNodes[j];
                break;
            }
        }

        doc.body.setAttribute('firegpg',"#FIREGPGCAPTURE");

        var evt3 = doc.createEvent("MouseEvents");
         evt3.initMouseEvent("mouseup", true, true, window,
           0, 0, 0, 0, 0, false, false, false, false, 0, null);
         detailsElement.dispatchEvent(evt3);

        url = doc.body.getAttribute('firegpg');

        if (url == "#FIREGPGCAPTURE" ) {
            //Close popup
             var evt4 = doc.createEvent("MouseEvents");
            evt4.initMouseEvent("mousedown", true, true, window,
             0, 0, 0, 0, 0, false, false, false, false, 0, null);
             actionbox.dispatchEvent(evt4);


            return "{ERROR,WAIT}";

        }

        doc.body.setAttribute('firegpg',"");


		if (this.messageCache == null || this.messageCache[url] == null)
		{
            //getContentXHttp
            data = getBinContent(cGmail2.baseUrl + url , 5000*1024);

            if (data == "{MAX}") {

                var i18n = document.getElementById("firegpg-strings");

				if (confirm(i18n.getString("GmailBigMail")))
                    data = getBinContent(cGmail2.baseUrl + url );
                else
                    return '';

            }


			var mailData = EnigConvertToUnicode(data , 'UTF-8');
            // getContentXHttp(cGmail2.baseUrl + url);

			if (this.messageCache == null)
				this.messageCache = { };

			//this.messageCache[url ] = mailData;

			return mailData;
		}
		else
		{
			return this.messageCache[url ];
		}

    },


    setProgressMessage: function(form, text)
{
	try
	{
		// already closed (this also means that local variables like jsdump are probably unavailable)
		if (!form.ownerDocument.defaultView) return;
		// all that's needed is the form...we can go from there
		var t = form.ownerDocument.defaultView.top;
		var d = t.document;
		const F = XPathResult.FIRST_ORDERED_NODE_TYPE;

		var jH = d.evaluate("div[contains(@class, 'jHZvnc')]", d.body, null, F, null).singleNodeValue;
		// used to have div[@class='jHZvnc'] but should be div[contains(@class, 'jHZvnc')], so moved around
		var IY	= d.evaluate(".//div[@class='IY0d9c']", jH, null, F, null).singleNodeValue;
		var wT	= d.evaluate("div/div[contains(@class,'wTsMFb')]", IY, null, F, null).singleNodeValue;
		if (!wT) wT = d.evaluate("div/div[contains(@class,'QShok')]", IY, null, F, null).singleNodeValue;
		if (text == null)
		{
			wT.parentNode.style.display = "none";
			return;
		}

		wT.parentNode.style.display = "";
		stUtil.removeClassName(jH, "WBnLQb");

		// <div class="IY0d9c"><div class="XoqCub EGSDee" style="width: 66px;"><div class="SsbSQb L4XNt"><span class="hdgibf">Loading...</span></div></div><div class="XoqCub EGSDee" style="width: 0px;"/></div>
		var hd	= d.evaluate(".//span[@class='hdgibf']", wT, null, F, null).singleNodeValue;
		if (!hd)
		{
			// does not exist yet; this is the first time.
			var EGSDee = d.evaluate(".//div[@class='IY0d9c']/div[contains(@class, 'EGSDee') and position()=1]", wT, null, F, null).singleNodeValue;
			hd = d.createElement("span");
			hd.className = "hdgibf";
			var SsbSQb_L4XNt = d.createElement("div");
			SsbSQb_L4XNt.className = "SsbSQb L4XNt";
			SsbSQb_L4XNt.appendChild(hd);
			EGSDee.appendChild(SsbSQb_L4XNt);
		}
		hd.innerHTML = text;
		wT.parentNode.style.display = ""; // need to enable to get the right sizes
		var ow = hd.offsetWidth; // original width
		var u;	// temporary variable
		ow += 2;
		(u = hd.parentNode.parentNode).style.width = ow + "px";
		u.parentNode.parentNode.style.width = ow + "px";

		ow += 8;
		var owp = ow + "px";
		wT.parentNode.style.width = owp;
		wT.style.width = owp;
		wT.firstChild.style.width = owp;

		// now deal with equidistant sizing
		wT.parentNode.previousSibling.style.width = wT.parentNode.nextSibling.style.width = Math.floor((IY.parentNode.offsetWidth - ow)/2).toString() + "px";
	}
	catch (e)
	{
		fireGPGDebug(e, "cGmail2.setProgressMessage", true);
	}
} // end setProgressMessage

};



// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
