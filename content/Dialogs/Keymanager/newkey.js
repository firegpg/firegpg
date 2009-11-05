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

function generate() {

    var i18n = document.getElementById("firegpg-strings");

    var name = document.getElementById('name-textbox').value;
    var email = document.getElementById('email-textbox').value;
    var comment = document.getElementById('comment-textbox').value;
    var password1 = document.getElementById('password1-textbox').value;
    var password2 = document.getElementById('password2-textbox').value;

    var keyneverexpire = document.getElementById('keyneverexpire').checked;
    if (document.getElementById('keyexpire-textbox').value != '')
        var keyexpirevalue = parseInt(document.getElementById('keyexpire-textbox').value) ;
    else
        var keyexpirevalue = 0;

    var keyexpiretype = document.getElementById('keyexpire-type').value;

    var keylength = document.getElementById('keylength-value').value;
    var keytype = document.getElementById('keytype').value;


    var result = FireGPG.Core.generateKey(false, name, email, comment, password1, password2, keyneverexpire, keyexpirevalue, keyexpiretype, keylength, keytype);

    if (result.result == FireGPG.Const.Results.SUCCESS)
        close();

}

function switchExpire() {

    if (document.getElementById('keyneverexpire').checked)
        document.getElementById('expireblock').style.display = '';
    else
        document.getElementById('expireblock').style.display = 'none';

}

function switchAdvanced() {

    if (!document.getElementById('advancedcheckbox').checked)
        document.getElementById('advancedbock').style.display = '';
    else
        document.getElementById('advancedbock').style.display = 'none';

}