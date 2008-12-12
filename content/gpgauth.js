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
* The Original Code is gpg_auth.
*
* The Initial Developer of the Original Code is Kyle L. Huff.
*
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
   Class: gpgAuth
   This is the class who implement GpgAuth function. *As it's not the code of FireGPG authors, the documentation of this file is not complete*.
*/
var gpgAuth = {

    /*
    Function: onLoad
    This function have to be documented.
    */
	onLoad: function() {
		this.initialized = true;
		this.strings = document.getElementById( "firegpg-strings" );

		this.gpg_elements = new Array();
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
				getService(Components.interfaces.nsIPrefService);

        this.prefs = this.prefs.getBranch("extensions.firegpg.gpgauth");

		if ( this.prefs.prefHasUserValue( ".global.enable_gpgauth" ) ) {
			var gpgauth_enabled = this.prefs.getBoolPref( ".global.enable_gpgauth" );
		} else {
			var gpgauth_enabled = false;
		}

        this.prefs.setCharPref( '.global.trust_model', 'direct' );

		if ( gpgauth_enabled ) {
			window.addEventListener( "gpg_auth:login", this.login, false, true );
			window.addEventListener( "unload", function() { gpgAuth.listenerUnload() }, false );
		}

	},

   /*
    Function: listenerUnload
    This function have to be documented.
    */
	listenerUnload: function( event ) {
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

        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] = false;
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] = false;
        gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_VALIDATED' ] = false;

		// Pointers to gpgAuth elements in the document
		var STK_ELM = content.document.getElementById( "gpg_auth:server_token" ); // The Server Token Element - A place-holder for a token encrypted TO the website public key
		var STK_RES_ELM = content.document.getElementById( "gpg_auth:server_response_token" ); // Server Token Response Element - A place-holder for the server to put the decrypted version of the STK_ELM contents
		var UTK_ELM = content.document.getElementById( "gpg_auth:user_token" ); // User Token Element - A place-holder for the server to put an encrypted token, encrypted to the users public key. (Also where the user puts the decrypted version)

		// If the STK_ELM (Server Token Element) exists and we have not been requested our user token,
		// encrypt the random data, insert the data into the element and submit the form.
		if ( STK_ELM && ! UTK_ELM ) {

            // Call FireGPG.crypt specifying the domain as the GPG Key to encrypt to.

			gpgAuth.gpg_elements[ gpgAuth.domain ][ 'RANDOM_VALUE' ] = gpgAuth.generate_random_token();
			gpgAuth.gpg_elements[ gpgAuth.domain ][ 'TIME_STAMP' ] = new Date().getTime();

			var result = FireGPG.crypt( true, gpgAuth.gpg_elements[ gpgAuth.domain ][ 'RANDOM_VALUE' ], [ gpgAuth.domain ], true );
			if ( result.result != RESULT_SUCCESS ) {
				// There was a problem, note that an error has occurred.
				gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] = true;
				error = result.sdOut;
				if ( error.search( "INV_RECP 10" ) > -1 ) {
					var not_trusted = true; // Server key not trusted in keyring
				}
				if ( error.search( "INV_RECP 0" ) > -1 ) {
					var not_found = true; // Server key not found in keyring
				}
				// If either error was found, consult preferences for default response
				if ( not_found || not_trusted ) {
					gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_UNTRUSTED' ] = true;
					gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_KEY_NOT_TRUSTED' ] = not_trusted;
					if ( gpgAuth.prefs.prefHasUserValue( ".domain_options." +  gpgAuth.domain + ".ignore_not_found" ) ||  gpgAuth.prefs.prefHasUserValue( ".global.ignore_not_found" ) ) {
						if ( gpgAuth.prefs.prefHasUserValue( ".global.ignore_not_found" ) ) {
							var ignore_not_found = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain+".ignore_not_found" ) || gpgAuth.prefs.getBoolPref( ".global.ignore_not_found" );
						} else {
							var ignore_not_found = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain+".ignore_not_found" )
						}
						alert( ignore_not_found );
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
							STK_ELM.innerHTML = error;
							if (  content.document.getElementById( "login_form" ) ) {
								content.document.getElementById( "login_form" ).submit();
							}
						} // If prompt cancelled, do nothing
					} else {
						gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] = false;
						gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] = true;
						gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_VALIDATED' ] = true;
						result.sdOut = false;
						result.sdOut2 = false;
						STK_ELM.innerHTML = error;
						if (  content.document.getElementById( "login_form" ) ) {
							content.document.getElementById( "login_form" ).submit();
						}
					}
				} else {
					// A server key was found, but the error returned did not match any known error,
					//  alert the user and die
					error_message = "Unable to encrypt a token for this host.";
					details = error + ' ' + result.sdOut
					gpgAuth.gpgauthDialog( "error", error_message, details );
				}
			} else {
				if ( ! result.encrypted ) {
					// We did not receive anything from GPG, die.
					error_message = "Unable to encrypt a token for this host.";
					details = "No data returned from GPG"
					gpgAuth.gpgauthDialog( "error", error_message, details );
				} else {
					// Populate the Server Token Eelement with the data that we have encrypted to the key that
					// matches the domain name.
					STK_ELM.innerHTML = result.encrypted;
					result.sdOut = false;
					result.sdOut2 = false;
					// Submit the form.
					if (  content.document.getElementById( "login_form" ) ) {
						content.document.getElementById( "login_form" ).submit();
					}
				}
			}
		} else if ( UTK_ELM && ! gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] ) {
			// If 'USE_UNTRUSTED' is true, then we will not be doing any server verification
			if ( ! gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] ) {
				if ( STK_RES_ELM && STK_RES_ELM.innerHTML.length > 2 ) {
					// Create a regular expression to ensure the unencrypted response from the server
					// matches the format of our random token
					var random_re = new RegExp( "^[a-z0-9]+$", "i" );
					// Proceed only if the response from the server matches both the format and content of the original token
					if ( random_re.test( STK_RES_ELM.innerHTML ) && STK_RES_ELM.innerHTML == gpgAuth.gpg_elements[ gpgAuth.domain ][ 'RANDOM_VALUE' ] ) {
						if ( gpgAuth.prefs.prefHasUserValue( ".global.allow_keyring" )  && gpgAuth.prefs.getBoolPref( ".global.allow_keyring" ) ) {
							 gpgAuth.gpg_elements[ gpgAuth.domain ][ 'ALLOW_KEYRING' ] = gpgAuth.prefs.getBoolPref( ".global.allow_keyring" );
						} else if ( gpgAuth.prefs.prefHasUserValue( ".domain_options." + gpgAuth.domain + ".allow_keyring" ) ) {
							gpgAuth.gpg_elements[ gpgAuth.domain ][ 'ALLOW_KEYRING' ] = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain + ".allow_keyring" )
						}
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
								gpgAuth.decrypt_user_token();
								return true;
							} else {
								return false;
							}
						} else {
							gpgAuth.decrypt_user_token();
							return true;
						}
					} else {
						if ( ! random_re.test( STK_RES_ELM.innerHTML ) ) {
							alert( "The token returned from the server does not match the format we generated; Aborting." );
                            return false;
						} else {
							alert( "The token returned from the server does not match the token we generated; Aborting." );
                            return false;
						}
					}
				} else {
					details = "The server did not return the decrypted token"
					gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_UNTRUSTED' ] = true;
				}
			}
			if ( gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_UNTRUSTED' ] ) {
				// Check to see if the user has chosen to ignore server verification failures for this domain.
				if ( gpgAuth.prefs.prefHasUserValue( ".domain_options." + gpgAuth.domain+".ignore_server_keyerror" ) ) {
					var ignore_server_keyerror = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain+".ignore_server_keyerror" );
				}
				if ( ! ignore_server_keyerror ) {
					// If not set to ignore, prompt the user to continue as cautioned.
					error_message = "The server did not successfully identify itself"
					var response = gpgAuth.gpgauthDialog( "warning", error_message, details, "Ignore Server Key Errors for this domain (" + gpgAuth.domain + ") from now on?"  );
					if ( response ) {
						if ( response.check ) {
							gpgAuth.prefs.setBoolPref( ".domain_options." + gpgAuth.domain + ".ignore_server_keyerror", response.check );
                        }
						gpgAuth.decrypt_user_token();
					}
				} else {
					gpgAuth.decrypt_user_token();
				}
			} else if ( ! ignore_server_keyerror ) {
				gpgAuth.decrypt_user_token();
			}
		}
        return true;
	},

    /*
    Function: decrypt_user_token
    This function is called to decrypt the data sent by the server that is encrypted with the users public key
    */
	decrypt_user_token: function( e ) {
		var timestamp = new Date().getTime();
		var ms = timestamp - gpgAuth.gpg_elements[ gpgAuth.domain ][ 'TIME_STAMP' ]; // Get miliseconds since login was pressed
		user_token = content.document.getElementById( "gpg_auth:user_token" ).innerHTML;
		// Clear and recreate the array
		gpgAuth.gpg_elements = false;
		gpgAuth.gpg_elements = new Array();
		// Check to see if we received a token to decrypt, and make sure it did not take more than 3 minutes to get it.
		if ( user_token && ms < 300000 ) {
			var result = FireGPG.decrypt( true, user_token );
			var random_re = new RegExp( "^gpgauth[0-9]string[0-9][0-9]for[0-9]auth[0-9][0-9]dont[0-9]use[0-9]it[0-9][a-z]for[0-9]another[0-9][a-z]gpgauth[a-z0-9]+gpgauthv1$", "i" );
			if ( result.result == RESULT_SUCCESS ) {
				if ( random_re.test( result.decrypted ) ) {
					content.document.getElementById( "gpg_auth:user_token" ).innerHTML = result.decrypted;
					content.document.getElementById( "gpg_auth:form" ).submit();
				}  else {
					alert( "The server did not provide a token compatible with this version of FireGPG; Aborting." );
					return false;
				}
			}
		} else {
			alert( "The server did not provide an encrypted token for us to decrypt; Aborting" );
			return false;
		}
	},
    test

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

	gpgauthDialog: function ( message_type, error_message, details, check_text ) {
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

        icon = ""; //? no png

		var params = { pin: { icon: icon, dialog_title: title, dialog_message: error_message, dialog_details: details, checkbox_text: check_text}, pout: false };
		window.openDialog( "chrome://firegpg/content/gpgauth_dialog.xul", "gpgauthDialog", "chrome, dialog, modal, centerscreen", params ).focus();
		return params.pout;
	}


};

window.addEventListener("load", function(e) { gpgAuth.onLoad(e); }, false);
