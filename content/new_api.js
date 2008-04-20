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

/*
 * API that will be used by the Javascript.
 */
var ExternalAPI = {
    /*
     * Error codes.
     */
    ERROR_NOTHING: 0,             /* no error */
    ERROR_UNSELECTED_GPG_ID: 1,   /* if the GPG ID is not selected 
                                     when the window is opened */
    ERROR_BAD_GPG_ID: 2,          /* if the GPG id is bad, doesn't 
                                     exist in the wall */
    ERROR_PASS_NOT_ENTERED: 3,
    ERROR_BAD_PASS: 3,
    ERROR_UNKNOWN: 4,

    /* 
     * Initialize the API
     */
    init: function(e) {
    },

    /*
     * Sign "text" and return an object contains two
     * attributes :
     *     result: the signed text
     *     error:  contain one of FireGPG.ERROR_*
     *
     * gpg_id is facultative
     */
    sign: function(text, gpg_id) {
        ret = {result:'', error:ExternalAPI.ERROR_NOTHING};

        /* Get the GPG ID */
        if(gpg_id == undefined) {
            gpg_id = getSelfKey();

            if(gpg_id == null) { 
                ret.error = ExternalAPI.ERROR_BAD_GPG_ID;
                return ret;
            }
        }

        /* Get the password */
        password = getPrivateKeyPassword(); /* TODO it's important to 
                                               doesn't save the pw ? */
        if(password == null) {
            /* TODO est-ce nécessaire d'avoir un code d'erreur pour dire
             * ERROR_PRIVATE_PASS_NOT_ENTERED et ERROR_PUBLIC... ? */
            ret.error = ExternalAPI.ERROR_PASS_NOT_ENTERED;
            return ret;
        }

        /* Sign the text */
        var gpg_result = GPG.baseSign(text, password, gpg_id);
        var gpg_error = gpg_result.sdOut;

        if(gpg_error == 'erreur')
            ret.error = ExternalAPI.ERROR_UNKNOWN;
        else if(gpg_error == 'erreurPass')
            ret.error = ExternalAPI.ERROR_BAD_PASSWORD;
        else
            ret.result = gpg_result.output;

        return ret;
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

// vim:ai:et:sw=4:ts=4:sts=4:tw=0:fenc=utf-8:foldmethod=indent:
