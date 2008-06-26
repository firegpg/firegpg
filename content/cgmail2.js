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
const GMAIL_MAIN_DOC_URL = "http://mail.google.com/mail/?ui=2&view=bsp&ver=ymdfwq781tpu";
/* Constant: GMAIL_MAIN_DOC_URL2
 The url of the mail document for gmail and https. */
const GMAIL_MAIN_DOC_URL2 = "https://mail.google.com/mail/?ui=2&view=bsp&ver=ymdfwq781tpu";

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
    checkDoc: function(id) {



        var i18n = document.getElementById("firegpg-strings");

        var doc = cGmail2.doc[id];

        if (doc != undefined && doc.location != undefined) {

            final_location = doc.location.href;

            var regrex = new RegExp('^https?://mail.google.com/a/[a-zA-Z.-0-9]*');

            final_location = final_location.replace(regrex, "http://mail.google.com/mail");

            if (final_location == GMAIL_MAIN_DOC_URL || final_location == GMAIL_MAIN_DOC_URL2)
            {

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
                        {
                            break;
                        }

                        var contenuMail = this.getMailContent(listeTest[i],doc);


                        var td = doc.createElement("td");


                        var resultTest = FireGPG.verify(true,contenuMail);

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
						else {

							td.setAttribute("style","color: green;");
							td.innerHTML = i18n.getString("GMailSOK") + " " + htmlEncode(resultTest.signresulttext); //"La première signature de ce mail est de testtest (testtest)
						}



                        var firstPosition = contenuMail.indexOf("-----BEGIN PGP MESSAGE-----");
                        var lastPosition = contenuMail.indexOf("-----END PGP MESSAGE-----");

                        if (firstPosition != -1 && lastPosition != -1) {

                            td.innerHTML = i18n.getString("GMailD");

                            var tmpListener = new Object;
                            tmpListener = null;
                            tmpListener = new cGmail2.callBack(doc)
                            td.addEventListener('click',tmpListener,true);
                        }

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

                        if (cGmail2.b_sign == true)
                            this.addBouton(listeTest[i],doc,i18n.getString("GMailS"),"sign",spamLimite);
                        if (cGmail2.b_sign_s == true)
                            this.addBouton(listeTest[i],doc,i18n.getString("GMailSS"),"sndsign",spamLimite);
                        if (cGmail2.b_crypt == true)
                            this.addBouton(listeTest[i],doc,i18n.getString("GMailC"),"crypt",spamLimite);
                        if (cGmail2.b_crypt_s == true)
                            this.addBouton(listeTest[i],doc,i18n.getString("GMailCS"),"sndcrypt",spamLimite);
                        if (cGmail2.b_signcrypt == true)
                            this.addBouton(listeTest[i],doc,i18n.getString("GMailSAC"),"signcrypt",spamLimite);
                        if (cGmail2.b_signcrypt_s == true)
                            this.addBouton(listeTest[i],doc,i18n.getString("GMailSACS"),"sndsigncrypt",spamLimite);

                        try {

                            var tmpListener = new Object;
                            tmpListener = null;
                            tmpListener = new cGmail2.callBack(doc)
                            listeTest[i].addEventListener('click',tmpListener,true);

                        } catch (e) {}

                        //Add the button 'Attach and chiffred a file'
                        if (listeTest[i].getAttribute('class').indexOf('LlWyA') != -1) {


                            var tablebox = listeTest[i].parentNode.getElementsByTagName('table');
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

                        }

                        form =  listeTest[i].parentNode.getElementsByTagName('form');
                        form = form[0];


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

                        if (disable_autosave)
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
                                        if (func.name.indexOf(pattern[i]) != 0 && func.name.indexOf(pattern[i]) != 2) return false;

                                        func = func.caller;
                                    }
                                    return true;
                                }
                                const badpattern1 = ["$q$_P$", "$q$_P$", "$q$_P$", "$q$_P$", "$q$_P$", "$CNp$"];
                                const badpattern2 = ["$q$_P$xVa", "$q$_P$t_a$", "$q$_P$OP$", "$q$_P$yUa$", "$q$_P$BXa$"];
                                const badpattern3 = ["$R$_P$", "$R$_P$", "$R$_P$", "$R$_P$Lfb$", "$R$_P$xib$", "$Ouc$"];
                                const badpattern4 = ["$Y$_P$", "$Y$_P$", "$Y$_P$", "$Y$_P$Uib$", "$Y$_P$Glb$"]; // then $rga$, $e$, $a$__protected__$
                                const badpattern5 = ["$Z$_P$", "$Z$_P$", "$Z$_P$", "$Z$_P$ZBa$", "$Z$_P$nGb$"];

                                //Our *seem* to be better [the_glu]
                                const badpattern6 = ["$Z$_P$", "$Z$_P$", "$Z$_P$", "$Z$_P$", "Y$_P$"];

                                //$Z$_P$jJa$ $Z$_P$Q3b$ $Z$_P$ft$ $Z$_P$tkb$ $ZY$_P$tDa$
                                //$Z$_P$lJa$ $Z$_P$V3b$ $Z$_P$ht$ $Z$_P$wkb$ $RY$_P$vDa$

                                //$Z$_P$jJa$ $Z$_P$oka$ $Z$_P$xna$ $Wg$_P$ui$ $Lh$

                                if (stackMatch(badpattern6, getValue.caller) || stackMatch(badpattern5, getValue.caller) || stackMatch(badpattern4, getValue.caller) || stackMatch(badpattern3, getValue.caller) || stackMatch(badpattern1, getValue.caller) || stackMatch(badpattern2, getValue.caller))
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
                                // HARDCODED: Autosave disabled.
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

            if (event.target.nodeName == "SELECT")
                return;

            try {

                if (event.target.nodeName == "OPTION") {

                    var tmpval = event.target.value;

                    var target = event.target.parentNode;

                    target.setAttribute('gpg_action', tmpval);

                    target.value = "FireGPG";
                } else {

                    target = event.target;

                }

            } catch (e)  { alert(e);}


            //If the user want to decrypt the mail (can use normal attibutes)
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

				var result = FireGPG.cryptAndSign(false, mailContent, null ,false,null, null,true, whoWillGotTheMail);

				// If the sign failled
				if(result.sdOut == "erreur") {
					// We alert the user
					alert(i18n.getString("cryptAndSignFailed"));
				}
                else if(result.sdOut == "erreurPass") {
					// We alert the user
					eraseSavedPassword();
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
            else if (target.getAttribute('gpg_action') == "add_crypted" || target.getAttribute('gpg_action') == "add_crypted_and_sign")
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

                var data = getBinContent("file://" + filePath);

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
			}
		};
	},

    /*
        Function: addBouton
        This function create a html button at the end of a node
        OR append a opton value on the select (who is created), if the user request for this.

        Parameters:
            box - The node where the button is added.
            doc - The page's document (of the node)
            label - The label of the button
            action- The action of the button (for the callback)
            spamLimite -  The node before when we create the button.
    */
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


            } catch (e) {}

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
                    select.addEventListener('onchange',tmpListener,false);

               } catch (e) {}

            }

            //Now we add the option.
            var option = new Option("> " + label,action);

            select.add(option,null);

        }
	},

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
			 } catch (e) { }

	},

    /*
        Function: getWriteMailContent
        Return the content of a mail in composition (his selection if something is selected)

        Parameters:
            dDocument- The html document
            boutonxboxnode - The note with the buttons of the mails
    */
    getWriteMailContent: function(dDocument,boutonxboxnode)
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

					if ( select != "")
					{

						var indexOfQuote = select.indexOf('<div class="gmail_quote">');

                        contenuMail = Selection.wash(select.substring(0,indexOfQuote));

                        if (indexOfQuote == -1 || TrimAndWash(contenuMail) == "")
						{
                            indexOfQuote = select.length;
                            contenuMail = Selection.wash(select.substring(0,indexOfQuote));

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

        tmp = tmp.firstChild;

        tmp = tmp.childNodes[2];

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

        tmp = tmp.firstChild;

        tmp = tmp.childNodes[2];

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
	getToCcBccMail: function(dDocument,boutonxboxnode) {
		var forWho = "";
		var tmpFor = "";

        var tmp = boutonxboxnode;

        tmp = tmp.parentNode;

        tmp = tmp.childNodes[1];

        tmp = tmp.firstChild;



        var textareas = tmp .getElementsByTagName("textarea");


        //On cherche la boite avec les boutons
        for (var j = 0; j < textareas.length; j++) {
            if (textareas[j].getAttribute("name") == "to" || textareas[j].getAttribute("name") == "cc" || textareas[j].getAttribute("name") == "bcc") {

                forWho = forWho + " " + textareas[j].value;

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
			document.getElementById("appcontent").addEventListener("DOMContentLoaded", cGmail2.pageLoaded, false);
			//window.addEventListener("unload", function() {cGmail2.listenerUnload()}, false);


			try {	var nonosign = prefs.getBoolPref("gmail_no_sign_off");	}
			catch (e) { var nonosign = false; }
			try {	var b_sign = prefs.getBoolPref("gmail_butons_sign");	}
			catch (e) { var b_sign = true; }
			try {	var b_sign_s = prefs.getBoolPref("gmail_butons_sign_send");	}
			catch (e) { var b_sign_s = true; }
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
			cGmail2.b_crypt = b_crypt;
			cGmail2.b_crypt_s = b_crypt_s;
			cGmail2.b_signcrypt = b_signcrypt;
			cGmail2.b_signcrypt_s = b_signcrypt_s;
            cGmail2.b_use_select_s = b_use_select_s;



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

        if (final_location == GMAIL_MAIN_DOC_URL || final_location == GMAIL_MAIN_DOC_URL2) {

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

            var tmpListener = new Object;
            tmpListener = null;
            tmpListener = new cGmail2.clickOnDock(cGmail2.current)
            doc.addEventListener('mousedown',tmpListener,true);

            //setTimeout("cGmail2.checkDoc("+cGmail2.current+")", 5000);

        }

    }

};

// vim:ai:noet:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
