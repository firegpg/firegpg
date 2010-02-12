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

The Original Code is the gpg_auth.

The Initial Developer of the Original Code is Kyle L. Huff.

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
   Class: gpgAuth
   This is the class who implement GpgAuth function. *As it's not the code of FireGPG authors, the documentation of this file is not complete*.
*/
var gpgAuth = {

    /*
    Function: onLoad
    This function is called when a new Firefox window is created. It inititializes the strings, sets the GPG preferences and
    addes the gpg_auth:login event listener.
    */
    onLoad: function() {
        this._version = "v1.2.1";
        this.strings = document.getElementById( "firegpg-strings" );

        this.gpg_elements = new Array();
        this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
                getService(Components.interfaces.nsIPrefService);

        this.prefs = this.prefs.getBranch("extensions.firegpg.gpgauth");
    
        if ( this.prefs.prefHasUserValue( ".global.enable_gpgauth" ) ) {
            var gpgauth_enabled = this.prefs.getBoolPref( ".global.enable_gpgauth" );
        } else {
            var gpgauth_enabled = true;
        }

        if ( this.prefs.prefHasUserValue( ".global.enable_gpgauth_statusbar" ) ) {
            this.gpgauth_statusbar_enabled = this.prefs.getBoolPref( ".global.enable_gpgauth_statusbar" );
        } else {
            this.gpgauth_statusbar_enabled = false;
        }

        if ( this.prefs.prefHasUserValue( ".global.enable_gpgauth_statuswindow" ) ) {
            this.gpgauth_statuswindow_enabled = this.prefs.getBoolPref( ".global.enable_gpgauth_statuswindow" );
        } else {
            this.gpgauth_statuswindow_enabled = false;
        }


        this.prefs.setCharPref( '.global.trust_model', 'direct' );

        if ( gpgauth_enabled ) {
            window.addEventListener( "gpg_auth:login", this.login, false, true );
            window.addEventListener( "unload", function() { gpgAuth.listenerUnload() }, false );
        }

        this.status_window = gpgauth_status;
        this.status_window.onLoad();
        if ( gpgauth_enabled ) {
            if ( ! this.initialized ) {
                this.status_window.update( "gpgAuth " + this._version + " Initialized..", show=false );
            }
        }

        if ( this.gpgauth_statusbar_enabled ) {
            this.status_window.showIcon();
        }
        this.initialized = true;
    },

    /*
    Function: listenerUnload
    This function unloads then event listener when the window is closed.
    */
    listenerUnload: function( event ) {
        gpgAuth.initialized = false;
        gpgAuth.status_window.update( "gpgAuth shutting down....", show=false );
        window.removeEventListener( "gpg_auth:login", this.login, false, true );
    },


    /*
    Function: login
    This function gets called by the "gpg:login" event that is emitted from
    a gpgAuth enabled website. Events not caught by the webpage itself are
    bubbled up to extensions in Firefox.
    */
    login: function( event ) {
        var error_message = false;
        var details = false;
        // Get the current domain name
        if ( content.document.domain ) {
            gpgAuth.domain = content.document.domain;
        } else if ( content.document.location.host ) {
            gpgAuth.domain = content.document.location.host;
        } else {
            gpgAuth.domain = "Not Supported";
        }
        // Add the domain to an array for further reference and add default values.
        if ( ! gpgAuth.gpg_elements[ gpgAuth.domain ] ) {
            gpgAuth.gpg_elements[ gpgAuth.domain ] = new Array();
        }

        // Pointers to gpgAuth elements in the document
        // The Server Token Element - A place-holder for a token encrypted to the website public key
        var STK_ELM = content.document.getElementById( "gpg_auth:server_token" );
        // Server Token Response Element - A place-holder for the server to put the decrypted version of the STK_ELM contents
        var STK_RES_ELM = content.document.getElementById( "gpg_auth:server_response_token" );
        // User Token Element - A place-holder for the server to put an encrypted token,
        // encrypted to the users public key. (Also where the user puts the decrypted version)
        var UTK_ELM = content.document.getElementById( "gpg_auth:user_token" );

        gpgAuth.status_window.update( "gpgAuth:login called for domain " + gpgAuth.domain );
        // If the STK_ELM (Server Token Element) exists and we have not yet been requested our user token, lets create a token.
        if ( STK_ELM && ! UTK_ELM ) {
            var server_tests = gpgAuth.doServerTests( STK_ELM, UTK_ELM );
            if ( ! server_tests ) {
                gpgAuth.status_window.update( "... server " + gpgAuth.domain + " has failed the initial validity tests.." );
                return false;
            } else {
                gpgAuth.status_window.update( "... server " + gpgAuth.domain + " has succeeded the initial validity tests or the tests results have been overridden by the user.." );
                return true;
            }
        } else if ( UTK_ELM && ! gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] ) {
            var server_token_tests = gpgAuth.doServerTokenTests( STK_ELM, STK_RES_ELM, UTK_ELM );
            if ( ! server_token_tests ) {
                return false;
            } else {
                gpgAuth.decryptUserToken(UTK_ELM);
            }
        }
    },


    /*
    Function: doServerTests
    This function validates the server against the users keyring by encrypting a random token to the
    public key on file for the given domain.
    */
    doServerTests: function( STK_ELM, UTK_ELM, event ) {
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] = false;
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] = false;
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_VALIDATED' ] = false;
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_UNTRUSTED' ] = true;
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_KEY_FINGERPRINT' ] = 0;

        // Call FireGPG.Core.crypt specifying the domain as the GPG Key to encrypt to.
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'RANDOM_VALUE' ] = gpgAuth.generate_random_token();
        gpgAuth.status_window.update( "... generated a random token for the host." );
        // Create a timestamp to later expire the token.
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'TIME_STAMP' ] = new Date().getTime();
        var server_token = FireGPG.Core.crypt( true, gpgAuth.gpg_elements[ gpgAuth.domain ][ 'RANDOM_VALUE' ], [ gpgAuth.domain ], true );
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_PRIKEY_ID' ] = server_token.prikey_id;
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_SUBKEY_ID' ] = server_token.subkey_id;
        if ( server_token.subkey_id && ! server_token.subkey_id == server_token.prikey_id ) {
            gpgAuth.status_window.update( "... encrypted the token to SubKey ID: " + server_token.subkey_id + " of primary Key ID: " + server_token.prikey_id  );
        } else {
            gpgAuth.status_window.update( "... encrypted the token to Key ID: " + server_token.prikey_id  );
        }
        if ( server_token.result != FireGPG.Const.Results.SUCCESS ) {
            // There was a problem, note that an error has occurred.
            gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] = true;
            error = server_token.sdOut;
            if ( error.search( "INV_RECP 10" ) > -1 ) {
                var not_trusted = true; // Server key not trusted in keyring
                gpgAuth.status_window.update( "... the key is not trusted in your keyring!" );
            }
            if ( error.search( "INV_RECP 0" ) > -1 ) {
                var not_found = true; // Server key not found in keyring
                gpgAuth.status_window.update( "... the key for this host was not found in your keyring!" );
            }
            // If either error was found, consult preferences for default response
            if ( not_found || not_trusted ) {
                // Set the server as UNTRUSTED
                gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_UNTRUSTED' ] = true;
                // Set the server key as UNTRUSTED
                gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_KEY_NOT_TRUSTED' ] = not_trusted;
                // Test to see if we should ignore errors for this host.
                if ( gpgAuth.prefs.prefHasUserValue( ".domain_options." +  gpgAuth.domain + ".ignore_not_found" ) ||  gpgAuth.prefs.prefHasUserValue( ".global.ignore_not_found" ) ) {
                    if ( gpgAuth.prefs.prefHasUserValue( ".global.ignore_not_found" ) ) {
                        var ignore_not_found = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain+".ignore_not_found" ) || gpgAuth.prefs.getBoolPref( ".global.ignore_not_found" );
                    } else {
                        var ignore_not_found = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain+".ignore_not_found" )
                    }
                    gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] = ignore_not_found;
                }
                if ( gpgAuth.prefs.prefHasUserValue( ".domain_options." + gpgAuth.domain+".ignore_not_trusted" ) ||  gpgAuth.prefs.prefHasUserValue( ".global.ignore_not_trusted" ) ) {
                    if ( gpgAuth.prefs.prefHasUserValue( ".global.ignore_not_trusted" ) ) {
                        var ignore_not_trusted = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain+".ignore_not_trusted" ) || gpgAuth.prefs.getBoolPref( ".global.ignore_not_trusted" );
                    } else {
                        var ignore_not_trusted = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain+".ignore_not_trusted" );
                    }
                    gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] = ignore_not_trusted;
                }
                // If a preference was not found, prompt the user for desired action, and provide
                // an option to store as default action.
                if ( ! ignore_not_found && ! ignore_not_trusted ) {
                    // Build the prompt based on the error.
                    if ( not_found ) {
                        var error_message = "Server Key Not Found in your keyring";
                        var details = "No matching Public Key for '" + gpgAuth.domain + "' was found";
                        var check_text = "Check here to Ignore Missing Server Key Errors for this domain (" + gpgAuth.domain + ") from now on.";
                    } else if ( not_trusted ) {
                        var error_message = "Server Key Not Trusted in your keyring";
                        var details = "The matching Public Key for '" + gpgAuth.domain + "' is not trusted in your Keyring";
                        var check_text = "Check here to Ignore Untrusted Server Key Errors for this domain (" + gpgAuth.domain + ") from now on.";
                    }
                    var response = gpgAuth.gpgauthDialog( "warning", error_message, details, check_text  );
                    if ( response ) {
                        if ( response.check && not_found ) {
                            gpgAuth.prefs.setBoolPref( ".domain_options." + gpgAuth.domain + ".ignore_not_found", response.check );
                        } else if ( response.check && not_trusted ) {
                            gpgAuth.prefs.setBoolPref( ".domain_options." + gpgAuth.domain + ".ignore_not_trusted", response.check );
                        }
                        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] = false;
                        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] = true;
                        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_VALIDATED' ] = "No, but use anyway";
                        STK_ELM.value = error;
                        STK_ELM.innerHTML = error;
                        gpgAuth.status_window.update( "... continuing by request.." );
                        return true;
                    } else {
                        // Prompt cancelled; return false
                        gpgAuth.status_window.update( "... cancelling by request.." );
                        return false;
                    }
                } else { // Else we should ignore these errors for this host and continue anyway.
                    gpgAuth.status_window.update( "... host checking for this domain has been disabled by preference." );
                    // Set the gpgAuth error status to false (the security failure has been acknowledged.)
                    gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] = false;
                    // Set the USE_UNTRUSTED flag to true
                    gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] = true;
                    // Set the server VALIDATED flag to NO, But ignore.
                    gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_VALIDATED' ] = true;
                    server_token.sdOut = false;
                    server_token.sdOut2 = false;
                    STK_ELM.value = error;
                    STK_ELM.innerHTML = error;
                    return true;
                }
            } else {
                // A server key was found, but the error returned did not match any known error,
                //  alert the user and die
                gpgAuth.status_window.update( "... unable to encrypt a token for this host." );
                gpgAuth.status_window.update( "ERROR: \n" + error + ' ' + server_token.sdOut );
                error_message = "Unable to encrypt a token for this host.";
                details = error + ' ' + server_token.sdOut
                gpgAuth.gpgauthDialog( "error", error_message, details );
                return false;
            }
        } else {
            if ( ! server_token.encrypted ) {
                // We did not receive anything from GPG, die.
                gpgAuth.status_window.update( "... no data returned from GnuPG." );
                error_message = "Unable to encrypt a token for this host.";
                details = "No data returned from GPG"
                gpgAuth.gpgauthDialog( "error", error_message, details );
                return false;
            } else {
                // Populate the Server Token Eelement with the data that we have encrypted
                gpgAuth.status_window.update( "... putting encrypted token into the form field." );
                STK_ELM.value = server_token.encrypted;
                STK_ELM.innerHTML = server_token.encrypted;
                server_token.sdOut = false;
                server_token.sdOut2 = false;
                return true;
            }
        }
    },


    doServerTokenTests: function( STK_ELM, STK_RES_ELM, UTK_ELM, event ) {
        // If 'USE_UNTRUSTED' is true, then we will not be doing any server verification
        gpgAuth.status_window.update( "... beginning phase2 of server validation" );
        STK_RES_VALUE = STK_RES_ELM.value == undefined ? STK_RES_ELM.innerHTML : STK_RES_ELM.value;
        if ( ! gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] ) {
            if ( STK_RES_ELM && STK_RES_VALUE.length > 2 ) {
                // Create a regular expression to ensure the unencrypted response from the server
                // matches the format of our random token
                gpgAuth.status_window.update( "... collecting token from server" );
                var random_re = new RegExp( "^[a-z0-9]+$", "i" );
                // Proceed only if the response from the server matches both the format and content of the original token
                if ( random_re.test( STK_RES_VALUE ) && STK_RES_VALUE == gpgAuth.gpg_elements[ gpgAuth.domain ][ 'RANDOM_VALUE' ] ) {
                    if ( gpgAuth.prefs.prefHasUserValue( ".global.allow_keyring" )  && gpgAuth.prefs.getBoolPref( ".global.allow_keyring" ) ) {
                         gpgAuth.gpg_elements[ gpgAuth.domain ][ 'ALLOW_KEYRING' ] = gpgAuth.prefs.getBoolPref( ".global.allow_keyring" );
                    } else if ( gpgAuth.prefs.prefHasUserValue( ".domain_options." + gpgAuth.domain + ".allow_keyring" ) ) {
                        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'ALLOW_KEYRING' ] = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain + ".allow_keyring" )
                    }
                    gpgAuth.status_window.update( "... requesting access to keyring to decrypt the user token" );
                    if ( ! gpgAuth.gpg_elements[ gpgAuth.domain ][ 'ALLOW_KEYRING' ] ) {
                        // Create a prompt for the user to ask  permission to access keyring
                        var prompt = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
                                    .getService(Components.interfaces.nsIPromptService);
                        // Create the check box logic for chosing to save as default action this domain.
                        var check_always_domain = { value: false };
                        // Create the check box logic for chosing to save as default action all domains
                        var check_always_global = { value: false };
                        // Create the title, message and action
                        var validation_title = "Allow access to GPG Keyring";
                        var validation_error = gpgAuth.domain + " has sucessfully vadilted itself against your keyring,\nWould you like to use your keyring to authenticate your account?";
                        var validation_action_domain = "Check here to always use GPG Authentication for this domain (" + gpgAuth.domain + ").";
                        // Prompt
                        var response = prompt.confirmCheck( window, validation_title, validation_error, validation_action_domain, check_always_domain );
                        // Analyze response from prompt
                        if ( response == true ) {
                            if ( check_always_domain.value ) {
                                gpgAuth.prefs.setBoolPref( ".domain_options." + gpgAuth.domain + ".allow_keyring", check_always_domain.value );
                                gpgAuth.gpg_elements[ gpgAuth.domain ][ 'ALLOW_KEYRING' ] = true;
                            }
                            gpgAuth.status_window.update( "... access to keyring granted" );
                            return true;
                        } else {
                            // Access to the keyring has been denied by the user.
                            gpgAuth.status_window.update( "... access to keyring denied" );
                            return false;
                        }
                    } else {
                        gpgAuth.status_window.update( "... access to keyring pre-granted by preference" );
                        return true;
                    }
                } else {
                    if ( ! random_re.test( STK_RES_ELM.innerHTML ) ) {
                        gpgAuth.status_window.update( "... the token returned from the server does not match the format we generated" );
                        alert( "The token returned from the server does not match the format we generated; Aborting." );
                        return false;
                    } else {
                        gpgAuth.status_window.update( "... the token returned from the server does not match the token we generated" );
                        alert( "The token returned from the server does not match the token we generated; Aborting." );
                        return false;
                    }
                }
            } else {
                details = "The server did not return the decrypted token"
                gpgAuth.status_window.update( "... the server did not return the decrypted token" );
                gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_UNTRUSTED' ] = true;
                return false;
            }
        } else if ( gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_UNTRUSTED' ] ) {
            gpgAuth.status_window.update( "... the server has failed validation" );
            // Check to see if the user has chosen to ignore server verification failures for this domain.
            if ( gpgAuth.prefs.prefHasUserValue( ".domain_options." + gpgAuth.domain+".ignore_server_keyerror" ) ) {
                var ignore_server_keyerror = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain+".ignore_server_keyerror" );
            }
            if ( ! ignore_server_keyerror ) {
                // If not set to ignore, prompt the user to continue as cautioned.
                var details = "";
                var error_message = "The server did not successfully identify itself"
                var response = gpgAuth.gpgauthDialog( "warning", error_message, details, "Ignore Server Key Errors for this domain (" + gpgAuth.domain + ") from now on?"  );
                if ( response ) {
                    if ( response.check ) {
                        gpgAuth.prefs.setBoolPref( ".domain_options." + gpgAuth.domain + ".ignore_server_keyerror", response.check );
                    }
                    gpgAuth.status_window.update( "... ignoring server validation errors by user request" );
                    return true;
                } else {
                    gpgAuth.status_window.update( "... cancelling server validation by user request" );
                    return false;
                }
            } else {
                // We have been told to ignore keyerrors for this sever - so return true.
                gpgAuth.status_window.update( "... server validation errors ignored by user preference" );
                return true;
            }
        }
    },

    /*
    Function: decryptUserToken
    This function is called to decrypt the data sent by the server that is encrypted with the users public key
    */
    decryptUserToken: function( UTK_ELM, e ) {
        var timestamp = new Date().getTime();
        var ms = timestamp - gpgAuth.gpg_elements[ gpgAuth.domain ][ 'TIME_STAMP' ]; // Get miliseconds since login was pressed
        //user_token = content.document.getElementById( "gpg_auth:user_token" ).value;
        user_token = UTK_ELM.value == undefined ? UTK_ELM.innerHTML : UTK_ELM.value;
        // Clear and recreate the array
        // Check to see if we received a token to decrypt, and make sure it did not take more than 3 minutes to get it.
        if ( user_token && ms < 300000 ) {
            gpgAuth.status_window.update( "... decrypting the token" );
            // Attempt to decrypt the token provided by the Server.
            var result = FireGPG.Core.decrypt( true, user_token );
            if ( result.result == FireGPG.Const.Results.SUCCESS ) {
                // Check to see if the token was signed, and verify there is a keyid for the sign.
                if ( result.signresultkeyid && result.signresultkeyid.length > 8 ) {
                    // The key is long format - get the short version of the key (Last 8 Chars)
                    var signature_key = result.signresultkeyid.substring( result.signresultkeyid.length - 8 , result.signresultkeyid.length );
                } else if ( result.signresultkeyid ) {
                    // The keyid is already in short-form.
                    signature_key = result.signresultkeyid;
                } else {
                    // There was no keyid found.
                    signature_key = "none";
                }
                if ( ! gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] ) {
                    // Check to see if the signing keyid is a part of the key associated witht he domain.
                    gpgAuth.status_window.update( "... checking signature of token" );
                    if ( signature_key != gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_PRIKEY_ID' ] && signature_key != gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_SUBKEY_ID' ] ) {
                        gpgAuth.status_window.update( "... this token was not signed by a primary key or any subkey associated with this domain" );
                        alert( "The token provided by the server was not signed by any primary or subkey associated with this domain; Aborting." );
                        return false;
                    }
                    // Determine the age of the signature - if the signature is over 3minutes aged it is invalid. (possible replay)
                    var signature_age = timestamp - Date.parse(result.signresultdate);
                    gpgAuth.status_window.update( "... verifying age of signature" );
                    if ( signature_age > 300000 ) {
                        gpgAuth.status_window.update( "... this token was signed foo far in the past." );
                        alert( "The server has signed this token too far in the past; Aborting.\n " );
                        return false;
                    }
                } else {
                    gpgAuth.status_window.update( "... skipping check of token signature by user request" );
                }
                // Create a regular expression to verify that the decrypted data matches the {pre,post}-amble, so we don't send back sensitive data.
                var random_re = new RegExp( "^gpgauth(([v][0-9][.][0-9]{1,2})([.][0-9]{1,3}))[\|]([0-9]+)[\|]([a-z0-9]+)[\|]gpgauth(([v][0-9][.][0-9]{1,2})([.][0-9]{1,3}))$", "i" )
                gpgAuth.status_window.update( "... verifying format of token" );
                if ( random_re.test( result.decrypted ) ) {
                    gpgAuth.status_window.update( "... token matches the required format" );
                    gpgAuth.status_window.update( "... testing token contents" );
                    var token_exec = random_re.exec( result.decrypted );
                    if ( token_exec[4] == token_exec[5].length ){
                        gpgAuth.status_window.update( "... token contents matches the length field" );
                    } else {
                        gpgAuth.status_window.update( "... token contents do not match the length field" );
                        alert( "The server did not provide a token in the required format; Aborting." );
                        return false;
                    }
                    if ( token_exec[2] == gpgAuth._version.substring( 0, 4 ) ) {
                        gpgAuth.status_window.update( "... this server gpgAuth implementation version is compatible witht this client" );
                        gpgAuth.status_window.update( "... client version: " + gpgAuth._version + " server version: " + token_exec[1] );
                    } else {
                        gpgAuth.status_window.update( "... this server gpgAuth implementation version is not compatible with this client" );
                        gpgAuth.status_window.update( "... the server is using major/minor version " + token_exec[2] + ", version " + gpgAuth._version.substring( 0, 4 ) + " is required" );
                        gpgAuth.status_window.update( "... the full server implementation version is " + token_exec[1] );
                        alert( "The server version is not compatible with the version of the gpgAuth clientt; Aborting." );
                        return false;
                    }
                    gpgAuth.status_window.update( "... returning the decryted token to the form field" );
                    // Insert the decrypted result into the proper element and submit the login form.
                    UTK_ELM.innerHTML = result.decrypted;
                    UTK_ELM.value = result.decrypted;
                    gpgAuth.status_window.update( "... submitting the form" );
                    if ( gpgAuth.gpgauth_statuswindow_enabled ) {
                        gpgAuth.status_window._panel.hidePopup();
                        gpgAuth.status_window._panel.hidden = true;
                    }
                    content.document.getElementById( "gpg_auth:form" ).submit();
                }  else {
                    gpgAuth.status_window.update( "... the contents of the token provided does not match the defined format." );
                    alert( "The server did not provide a token compatible with this version of FireGPG; Aborting." );
                    return false;
                }
            } else {
                gpgAuth.status_window.update( "... unable to decrypt this token" );
                return false;
            }
        } else {
            gpgAuth.status_window.update( "... the server did not provide an encrypted token or a timeout has occurred" );
            alert( "The server did not provide an encrypted token for us to decrypt or a timeout has occurred; Aborting" );
            return false;
        }
    },


    /*
    Function: generate_random_token
    This is just a random string generator. It generates a random string that gets encrypted
    with the servers Public Key and sent to the server for decryption.
    */
    generate_random_token: function( e ) {
        var validchars = "";
        var startvalid = "";

        var minsize, maxsize, count, actualsize, random_value;
        minsize = parseInt( 60 );
        maxsize = parseInt( 100 );
        startvalid = "";
        validchars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        actualsize = Math.floor( Math.random() * ( maxsize - minsize + 1 ) ) + minsize;
        random_value = startvalid.charAt( Math.floor( Math.random() * startvalid.length ) );
        for (count = 1; count < actualsize; count++){
            random_value += validchars.charAt( Math.floor( Math.random() * validchars.length ) );
        }
        return random_value;
    },

    copyToClipboard: function( text ) {
        var unicodestring = Components.classes["@mozilla.org/supports-string;1"]
            .createInstance(Components.interfaces.nsISupportsString);
        var xferable = Components.classes["@mozilla.org/widget/transferable;1"]
            .createInstance(Components.interfaces.nsITransferable);
        xferable.addDataFlavor("text/unicode");
        unicodestring.data = text;
        xferable.setTransferData("text/unicode", unicodestring, text.length * 2);

        var clipboard = Components.classes["@mozilla.org/widget/clipboard;1"]
            .getService(Components.interfaces.nsIClipboard);

        clipboard.setData(xferable, null,
            Components.interfaces.nsIClipboard.kGlobalClipboard);
    },

    gpgauthDialog: function ( message_type, error_message, details, check_text ) {
        icon = ""; // Set the icon to nothing initially
        if ( message_type == "warning" ) {
            var title = "gpgAuth: Warning";
            var icon = "chrome://firegpg/skin/Warning.png";
        } else if ( message_type == "error" ) {
            var title = "gpgAuth: Error";
            var icon = "chrome://firegpg/skin/Error.png";
        } else {
            var title = "gpgAuth: Message";
            var icon = "chrome://firegpg/skin/Question.png";
        }

        var params = { pin: { icon: icon, dialog_title: title, dialog_message: error_message, dialog_details: details, checkbox_text: check_text}, pout: false };
        window.openDialog( "chrome://firegpg/content/GpgAuth/gpgauth_dialog.xul", "gpgauthDialog", "chrome, dialog, modal, centerscreen", params ).focus();
        return params.pout;
    }
};

var gpgauth_status = {
  _initialized: false,
  _statusButton: undefined,
  _panel: undefined,
  _menu: undefined,

  pref: undefined,

  onLoad: function() {
    if (this._initialized){
        return;
    }
    this._initialized = true;
    this._statusButton = document.getElementById("gpgauth-statusbar-button");
    this._panel = document.getElementById("gpgauth-Panel");
    this._menu = document.getElementById("gpgauth-menu-popup");
  },

  onUnload: function() {
  },

  togglePopup: function() {
    if (this._panel.state == "open"){
              this._panel.hidePopup();
        gpgauth_status._panel.hidden = true;
     }else {
      var f = function(){
        gpgauth_status._panel.hidden = false;
        gpgauth_status._panel.openPopup(gpgauth_status._statusButton.parentNode, "before_end", 0, 0, false, false);
      }
      f();
    }
  },

  showIcon: function() {
    this._statusButton.style.display = '';
  },

  _gel: function(id){
        return document.getElementById(id);
  },

  scrollToEnd: function( element ) {
    var tBox = element;

    // current selection postions
    var startPos = tBox.textLength;
    var endPos = tBox.textLength;

    // set start and end same (to start)
    tBox.selectionStart = startPos;
    tBox.selectionEnd = startPos;

    // insert character
    ev = document.createEvent("KeyboardEvent");
    ev.initKeyEvent('keypress', true, true, window, false, false, false, false, 0, 1);
    tBox.inputField.dispatchEvent(ev); // causes the scrolling

    // remove character
    ev = document.createEvent("KeyboardEvent");
    ev.initKeyEvent('keypress', true, true, window, false, false, false, false, 8, 1);
    tBox.inputField.dispatchEvent(ev); // "backspace" to remove

    // reset selection
    tBox.selectionStart = startPos;
    tBox.selectionEnd = endPos;
  },

  cancelInput: function( event, element ) {
    var tBox = element;
    ev = document.createEvent("KeyboardEvent");
    ev.initKeyEvent('keypress', true, true, window, false, false, false, false, 8, 1);
    tBox.inputField.dispatchEvent(ev); // "backspace" to remove

  },

  update: function(value, show) {
    if (show==null){
        show = true;
    }
    var padDigits = function( digits ) { return digits.toString().length == 2 ? digits.toString() : "0" + digits.toString(); }
    var timestamp = new Date();
    timestamp = padDigits(timestamp.getHours()) + ":" + padDigits(timestamp.getMinutes()) + ":" + padDigits(timestamp.getSeconds());
    textbox = document.getElementById( "gpgauth-Status-details" );
    textbox.value += timestamp + "  " + value + "\n";
    try {
        gpgauth_status.scrollToEnd( textbox );
    } catch(err) {
        //do nothing
    }
    if ( gpgAuth.gpgauth_statuswindow_enabled && show ) {
        if ( gpgauth_status._panel.hidden ) {
            gpgauth_status._panel.hidden = false;
            gpgauth_status._panel.openPopup(gpgauth_status._statusButton.parentNode, "before_end", 0, 0, false, false);
        }
    }
  },

};

window.addEventListener("load", function(e) { gpgAuth.onLoad(e); }, false);
