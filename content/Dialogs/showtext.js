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

/*
    Function: onLoad

    This function is called when the showtext.xul form is show.
    It's init the differents objets (like the translated strings).

    Parameters:
        win - The form herself.
        windows.arguments[0].title - The title of the window.
        windows.arguments[0].text - The text to put in the editor.
        windows.arguments[0].description - The description to show.
        windows.arguments[0].doShowButtons -  _Optional_. Set this to true to disable buttons (encrypt, ...)
        windows.arguments[0].validSign -  _Optional_. The text to display in the validSign label.
*/
function onLoad(win) {

	if(window.arguments == undefined)
		return;

	document.getElementById('text').value = window.arguments[0].text;
	document.getElementById('description').value = window.arguments[0].description;
	document.title = window.arguments[0].title;

        if (window.arguments[0].doShowButtons == true) {
               document.getElementById('buttons-box').style.display = 'none';
        }


        if (window.arguments[0].validSign != null) {

            document.getElementById('dcryptsignresult').style.display = '';
            document.getElementById('dcryptsignresult').value = document.getElementById("firegpg-strings").getString("validSignInCrypt") + " " + window.arguments[0].validSign;
        }

}

/*
    Function: openf
    Open a file a display it into the editor.
*/
function openf() {

    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"]
          .createInstance(nsIFilePicker);

    fp.init(window, null, nsIFilePicker.modeOpen);
    fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);

    if (fp.show() != nsIFilePicker.returnOK) //L'utilisateur annule
        return;

    var filePath = fp.file.path;
    var data = FireGPG.Misc.getFromFile(filePath);
    document.getElementById('text').value = data;
}

/*
    Function: savef
    Save the current data in the editor to a file
*/
function savef() {

    var nsIFilePicker = Components.interfaces.nsIFilePicker;
    var fp = Components.classes["@mozilla.org/filepicker;1"]
        .createInstance(nsIFilePicker);

    fp.init(window, null, nsIFilePicker.modeSave);
    fp.appendFilters(nsIFilePicker.filterText | nsIFilePicker.filterAll);

    var a = fp.show();

    if (a != nsIFilePicker.returnOK && a != nsIFilePicker.returnReplace) //L'utilisateur annule
        return;

    var filePath = fp.file.path;
    var data = document.getElementById('text').value;
    //Need to remove the file before save
    FireGPG.Misc.removeFile(filePath);
    FireGPG.Misc.putIntoFile(filePath,data);
}

/*
    Function: crypt
    Encrypt the current data of the editor.
*/
function crypt() {

    var result = FireGPG.Core.crypt(false,getSelectedText());

    if (result.result == FireGPG.Const.Results.SUCCESS)
        setSeletedText(result.encrypted);

}

/*
    Function: symcrypt
    Symetricaly encrypt the current data of the editor.
*/
function symcrypt() {

    var result = FireGPG.Core.crypt(false,getSelectedText(), undefined,  undefined, undefined,  undefined, true);

    if (result.result == FireGPG.Const.Results.SUCCESS)
        setSeletedText(result.encrypted);

}



/*
    Function: cryptandsign
    Encrypt and sign the current data of the editor.
*/
function cryptandsign(){
    var result = FireGPG.Core.cryptAndSign(false,getSelectedText());

    if (result.result == FireGPG.Const.Results.SUCCESS)
        setSeletedText(result.encrypted);

}

/*
    Function: dcrypt
    Decrypt the current data of the editor.
*/
function dcrypt() {

    var result = FireGPG.Core.decrypt(false,getSelectedText());

    if (result.result == FireGPG.Const.Results.SUCCESS)
        setSeletedText(result.decrypted);


    if (result.signresult == FireGPG.Const.Results.SUCCESS) {
        var i18n = document.getElementById("firegpg-strings");
        document.getElementById('dcryptsignresult').style.display = '';
        document.getElementById('dcryptsignresult').value = i18n.getString("validSignInCrypt") + " " + result.signresulttext;
    } else
        document.getElementById('dcryptsignresult').style.display = 'none';

}

/*
    Function: sign
    Sign the current data of the editor.
*/
function sign() {

    var result = FireGPG.Core.sign(false,getSelectedText());

    if (result.result == FireGPG.Const.Results.SUCCESS)
        setSeletedText(result.signed);

}

/*
    Function: signUnClear
    Sign the current data of the editor (unclear)
*/
function signUnClear() {

    var result = FireGPG.Core.sign(false,getSelectedText(),null,null,true);

    if (result.result == FireGPG.Const.Results.SUCCESS)
        setSeletedText(result.signed);

}

/*
    Function: verify
    Verfiy signs of the current data of the editor.
*/
function verify() {
    FireGPG.Core.verify(false, getSelectedText());
}

/*
    Function: getSelectedText
    Return the current selected text of the editor. If nothing is selected, all text is returned.
*/
function getSelectedText()
{
        var value = document.getElementById('text').value;
	value = value.substring(document.getElementById('text').selectionStart,document.getElementById('text').selectionEnd)
        if (value == "")
                value = document.getElementById('text').value
        return value;
}

/*
    Function: setSeletedText
    Remplace the current selected text of the editor with the text in parameter. If nothing is selected, all text is remplaced.

    Parameters:
        text - The new text.
*/
function setSeletedText(text)
{
        var txtbox = document.getElementById('text');
        var value = txtbox.value;
        var startPos = txtbox.selectionStart;
        var endPos = txtbox.selectionEnd;
        var chaine = txtbox.value;
        if (startPos != endPos)
        {
                // We create the new string and replace it into the focused element
                txtbox.value = chaine.substring(0, startPos) + text + chaine.substring(endPos, chaine.length);
        }
        else //Nothing is seleted, we remplace all
                txtbox.value = text;
}

function closeandcopy() {


    const gClipboardHelper = Components.classes["@mozilla.org/widget/clipboardhelper;1"] .getService(Components.interfaces.nsIClipboardHelper);

    gClipboardHelper.copyString(document.getElementById('text').value);

    close();

}
