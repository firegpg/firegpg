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

/* Variable: counter
    The counter before user can validate access
*/
var counter = 5;

/*
    Variable: translation
    The translation of the 'Can access' button
*/
var translation = '';

/*
    Variable: theLocation
    The current location
*/
var theLocation;

/*
    Function: onLoad
    Function called when the window is loaded

    Parameters:
        d - The window
*/
function onLoad(d) {
    setTimeout("decraseCounter();", 1000);
    translation = document.getElementById('can-access').label;

    theLocation = window.arguments[0].theLocation;
    this.theLocation = theLocation;

    document.getElementById('domain').label += ' (' + theLocation.hostname + ')';
    document.getElementById('website').label += ' (' + theLocation.protocol + '//' +  theLocation.host + ')';
    document.getElementById('page').label += ' (' + theLocation.href + ')';

    if (theLocation.host == '' || theLocation.hostname  == '') {
        document.getElementById('domain').style.display = 'none';
        document.getElementById('website').style.display = 'none';
    }

    updateWaring();


}

/*
    Function: updateWaring
    Show the warning about https if need
*/
function updateWaring() {

    if (document.getElementById('domain').selected == true || theLocation.protocol != 'https:')
        document.getElementById('non-https').style.display = '';
    else
        document.getElementById('non-https').style.display = 'none';


}

/*
    Function: decraseCounter
    Decrase the counter who force user to read what it's written
*/
function decraseCounter() {

    if (counter > 0) {

        document.getElementById('can-access').label = translation + ' (' + counter+ ')';
        counter--;
        setTimeout("decraseCounter();", 1000);

   } else {
        document.getElementById('can-access').label = translation;
        document.getElementById('can-access').disabled = '';
   }
}

/*
    Function: ignore
    Ingore the request -> close the window
*/
function ignore() {
    this.close();
}

/*
    Function: cannot
    For the selected thing to be ignored in the futur
*/
function cannot() {
    if (document.getElementById('domain').selected)
        FireGPG.Api.denyRegister(this.theLocation, 'D');
    else if (document.getElementById('website').selected)
        FireGPG.Api.denyRegister(this.theLocation, 'S');
    else if (document.getElementById('page').selected)
        FireGPG.Api.denyRegister(this.theLocation, 'P');

    this.close();
}

/*
    Function: can
    Lets the selected thing to use the api and return the api key
*/
function can() {

    if (document.getElementById('domain').selected)
        key = FireGPG.Api.allowRegister(this.theLocation, 'D');
    else if (document.getElementById('website').selected)
        key = FireGPG.Api.allowRegister(this.theLocation, 'S');
    else if (document.getElementById('page').selected)
        key = FireGPG.Api.allowRegister(this.theLocation, 'P');

    window.arguments[0].apiKey = key;

    this.close();
}