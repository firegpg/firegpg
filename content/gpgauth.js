/* ***** BEGIN LICENSE BLOCK *****
* I have not decided a license yet. This is demonstration code. All rights reserved at this time.
* I need to determine which license will meet my goals and also maintain compatibility with
* the FireGPG license(s).
* This may not be reproduced or distributed without prior consent.
* Copyright (C) 2007 Kyle L. Huff
* www.curetheitch.com
* ***** END LICENSE BLOCK ***** */

var gpgAuth = {
	onLoad: function() {
		this.initialized = true;
		this.strings = document.getElementById( "firegpg-strings" );
		document.addEventListener( "gpg_auth:login", this.login, false, true );
		document.addEventListener( "unload", function() { gpgAuth.listenerUnload() }, false );
		this.gpg_elements = new Array();
		this.useGPGTrustArguemnt = true;
		gpgAuth.useGPGTrustArguemnt = true;
		this.prefs = Components.classes["@mozilla.org/preferences-service;1"].
				getService(Components.interfaces.nsIPrefService);
		this.prefs = this.prefs.getBranch("extensions.firegpg.gpgauth");
	},

	listenerUnload: function( event ) {
		document.removeEventListener( "gpg_auth:login", this.login, false, true );
	},

	// This function gets called by the "gpg:login" event that is emitted from
	// a gpgAuth enabled website. Events not caught by the webpage itself are
	// bubbled up to extensions in Firefox.
	login: function( event ) {
		var random_value = gpgAuth.generate_random_token();
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
			gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] = false;
			gpgAuth.gpg_elements[ gpgAuth.domain ][ 'USE_UNTRUSTED' ] = false;
			gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_VALIDATED' ] = false;
			gpgAuth.gpg_elements[ gpgAuth.domain ][ 'RANDOM_VALUE' ] = random_value;
			gpgAuth.gpg_elements[ gpgAuth.domain ][ 'TIME_STAMP' ] = new Date().getTime();
		}

		// Pointers to gpgAuth elements in the document
		var STK_ELM = content.document.getElementById( "gpg_auth:server_token" ); // The Server Token Element - A place-holder for a token encrypted TO the website public key
		var STK_RES_ELM = content.document.getElementById( "gpg_auth:server_response_token" ); // Server Token Response Element - A place-holder for the server to put the decrypted version of the STK_ELM contents
		var UTK_ELM = content.document.getElementById( "gpg_auth:user_token" ); // User Token Element - A place-holder for the server to put an encrypted token, encrypted to the users public key. (Also where the user puts the decrypted version)

		// If the STK_ELM (Server Token Element) exists and we have not been requested our user token,
		// encrypt the random data, insert the data into the element and submit the form.
		if ( STK_ELM && ! UTK_ELM ) {
			// Call GPG.baseCrypt specifying the domain as the GPG Key to encrypt to.
			var result = GPG.baseCrypt( gpgAuth.gpg_elements[ gpgAuth.domain ][ 'RANDOM_VALUE' ], [ gpgAuth.domain ], true );
			if ( result.sdOut && result.sdOut != "ok" ) {
				// There was a problem, note that an error has occurred.
				gpgAuth.gpg_elements[ gpgAuth.domain ][ 'STK_ERROR' ] = true;
				error = result.sdOut2;
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
							var validation_title = "Server Key Not Found";
							var validation_error = "No matching Public Key for '" + gpgAuth.domain + "' was found\nWould you like to continue anyway?";
							var validation_action = "Ignore Missing Server Key Errors for this domain (" + gpgAuth.domain + ") from now on?";
						} else if ( not_trusted ) {
							var validation_title = "Server Key Not Trusted";
							var validation_error = "The matching Public Key for '" + gpgAuth.domain + "' is not trusted in your Keyring\nWould you like to continue anyway?";
							var validation_action = "Ignore Untrusted Server Key Errors for this domain (" + gpgAuth.domain + ") from now on?";
						}
						var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
									.getService(Components.interfaces.nsIPromptService);
						// Create the check box logic for chosing to save as default action.
						var check = { value: false };
						// Prompt
						var response = prompts.confirmCheck( window, validation_title, validation_error, validation_action, check );
						// Analyze response from prompt
						if ( response == true ) {
							if ( check.value && not_found ) {
								gpgAuth.prefs.setBoolPref( ".domain_options." + gpgAuth.domain + ".ignore_not_found", check.value );
							} else if ( check.value && not_trusted ) {
								gpgAuth.prefs.setBoolPref( ".domain_options." + gpgAuth.domain + ".ignore_not_trusted", check.value );
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
					alert( "Unable to encrypt a token for this host\nError: " + error + ' ' + result.sdOut );
				}
			} else {
				if ( ! result.output ) {
					// We did not receive anything from GPG, die.
					alert( "Unable to encrypt a token for this host\nError: No data returned from GPG" );
				} else {
					// Populate the Server Token Eelement with the data that we have encrypted to the key that
					// matches the domain name.
					STK_ELM.innerHTML = result.output;
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
							var validation_error = gpgAuth.domain + " has sucessfully vadilted itself against your keyring,\nWould you like to allow access to your keyring to authenticate your account?";
							var validation_action_domain = "Always allow access to private key from this domain (" + gpgAuth.domain + ") from now on?";
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
						} else {
							alert( "The token returned from the server does not match the token we generated; Aborting." );
						}
					}
				} else {
					alert( "The server did not return the unencrypted token; Aborting." );
				}
			}
			if ( gpgAuth.gpg_elements[ gpgAuth.domain ][ 'SERVER_UNTRUSTED' ] ) {
				// Check to see if the user has chosen to ignore server verification failures for this domain.
				if ( gpgAuth.prefs.prefHasUserValue( ".domain_options." + gpgAuth.domain+".ignore_server_keyerror" ) ) {
					var ignore_server_keyerror = gpgAuth.prefs.getBoolPref( ".domain_options." + gpgAuth.domain+".ignore_server_keyerror" );
				}
				if ( ! ignore_server_keyerror ) {
					// If not set to ignore, prompt the user to continue as cautioned.
					var prompts = Components.classes["@mozilla.org/embedcomp/prompt-service;1"]
								.getService(Components.interfaces.nsIPromptService);
					var check = { value: false };
					var result = prompts.confirmCheck( window, "Server not verified", "The server did not successfully identify itself.\nWould you like to authenticate using your private key?", "Ignore Server Key Errors for this domain (" + gpgAuth.domain + ") from now on?", check );
					if ( result == true ) {
						if ( check.value ) {
							gpgAuth.prefs.setBoolPref( ".domain_options." + gpgAuth.domain + ".ignore_server_keyerror", check.value );
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
	},

	// This function is called to decrypt the data sent by the server that is encrypted with the users public key
	decrypt_user_token: function( e ) {
		var timestamp = new Date().getTime();
		var ms = timestamp - gpgAuth.gpg_elements[ gpgAuth.domain ][ 'TIME_STAMP' ]; // Get miliseconds since login was pressed
		user_token = content.document.getElementById( "gpg_auth:user_token" ).innerHTML;
		// Clear and recreate the array
		gpgAuth.gpg_elements = false;
		gpgAuth.gpg_elements = new Array();
		// Check to see if we received a token to decrypt, and make sure it did not take more than 3 minutes to get it.
		if ( user_token && ms < 300000 ) {
			var result = GPG.decrypt( user_token );
			var random_re = new RegExp( "^gpgauth[0-9]string[0-9][0-9]for[0-9]auth[0-9][0-9]dont[0-9]use[0-9]it[0-9][a-z]for[0-9]another[0-9][a-z]gpgauth[a-z0-9]+gpgauthv1$", "i" );
			if ( result && random_re.test(result)) {
				content.document.getElementById( "gpg_auth:user_token" ).innerHTML = result;
				content.document.getElementById( "gpg_auth:form" ).submit();

			} else {
			alert( "Aborting" );
			return false;
			}
		} else {
			alert( "The server did not provide an encrypted token for us to decrypt; Aborting" );
			return false;
		}
	},

	// This is just a random string generator. It generates a random string that gets encrypted
	// with the servers Public Key and sent to the server for decryption.
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
	}
};

window.addEventListener("load", function(e) { gpgAuth.onLoad(e); }, false);
