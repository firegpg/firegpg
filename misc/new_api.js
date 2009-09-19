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

The Initial Developer of this part of the Original Code is Achraf Cherti

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
 * API that will be used by the Javascript.
 */
var ExternalAPI = {
    /*
       Constants: FireGPG's API constants

       FireGPG.ERROR_NOTHING - no error
       FireGPG.ERROR_UNSELECTED_GPG_ID - if the Key ID was not selected when the window was opened
       FireGPG.ERROR_BAD_GPG_ID - if the Key ID is bad or it does not exist
       FireGPG.ERROR_PASS_NOT_ENTERED - if no password is entered
       FireGPG.ERROR_BAD_PASS - the password is incorrect
       FireGPG.ERROR_UNKNOWN - unknown error
    */
    ERROR_NOTHING: 0,
    ERROR_UNSELECTED_GPG_ID: 1,
    ERROR_BAD_GPG_ID: 2,
    ERROR_PASS_NOT_ENTERED: 3,
    ERROR_BAD_PASS: 3,
    ERROR_UNKNOWN: 4,

    /*
     * Initialize the API
     */
    init: function(e) {
    },

    /*
     * Function: FireGPG.sign(text, pub_key_id)
     *
     * Sign a text and return an object containing two
     * attributes :
     *     - result: the text signed
     *     - error:  a constant FireGPG.ERROR_*
     *
     * NB: pub_key_id is optional.
     */
    sign: function(text, pub_key_id) {
        ret = {result:'', error:ExternalAPI.ERROR_NOTHING};

        /* Get the GPG ID */
        if(pub_key_id == undefined) {
            pub_key_id = FireGPGMisc.getSelfKey();

            if(pub_key_id == null) {
                ret.error = ExternalAPI.ERROR_BAD_GPG_ID;
                return ret;
            }
        }

        /* Get the password */
        password = FireGPGMisc.getPrivateKeyPassword(); /* TODO it's important to
                                               doesn't save the pw ? */
        if(password == null) {
            /* TODO est-ce nécessaire d'avoir un code d'erreur pour dire
             * ERROR_PRIVATE_PASS_NOT_ENTERED et ERROR_PUBLIC... ? */
            ret.error = ExternalAPI.ERROR_PASS_NOT_ENTERED;
            return ret;
        }

        /* Sign the text */
        var gpg_result = GPG.baseSign(text, password, pub_key_id);
        var gpg_error = gpg_result.sdOut;

        if(gpg_error == 'erreur')
            ret.error = ExternalAPI.ERROR_UNKNOWN;
        else if(gpg_error == 'erreurPass')
            ret.error = ExternalAPI.ERROR_BAD_PASSWORD;
        else
            ret.result = gpg_result.output;

        return ret;
    },

    /*
     * Function: FireGPG.encrypt(text, priv_key_id)
     *
     * Encrypt a text and return the result in an object.
     *
     * Parameters:
     *     text - the text, encrypt
     *     priv_key_id - the GPG id of the private key (optional)
     *
     * Returns:
     *     An object containing two attributes:
     *
     *     result - the encrypted text
     *     error -  a constant containing a constant FireGPG.ERROR_*
     */
    encrypt: function(text, priv_key_id) {
    }
};

/*
 * Listener functions
 */
var APIProgressListener = {
    QueryInterface: function(aIID) {
        if(aIID.equals(Components.interfaces.nsIWebProgressListener) ||
           aIID.equals(Components.interfaces.nsISupportsWeakReference) ||
           aIID.equals(Components.interfaces.nsISupports))
            return this;

		return Components.results.NS_NOINTERFACE;
    },

    onStateChange: function(aProgress, aRequest, aFlag, aStatus) {},
    onLocationChange: function(aProgress, aRequest, aURI) { return 0; },
    onProgressChange: function() { return 0; },
    onStatusChange: function() { return 0; },
    onSecurityChange: function(){ return 0; },
    onLinkIconAvailable: function() { return 0; }
}

var APIListener = {
    init: function() {
        document.getElementById("appcontent").addEventListener(
            "DOMContentLoaded",
            APIListener.load,
            false);

        window.addEventListener("unload",
            function() { APIListener.unload(); },
            false);
    },

    load: function(e) {
        ExternalAPI.e = e;
        e.target.defaultView.wrappedJSObject.window.FireGPG = ExternalAPI;

        gBrowser.addProgressListener(
            APIProgressListener,
            Components.interfaces.nsIWebProgress.NOTIFY_STATE_DOCUMENT);
    },

    unload: function() {
	    gBrowser.removeProgressListener(APIProgressListener);
    }
};
