/*
 * FireGPG's API version 0.1
 *
 * License: Mozilla Public License (version MPL 1.1/GPL 2.0/LGPL 2.1)
 * Website: http://getfiregpg.org/
 *
 * An API to use FireGPG's functions. You can use the FireGPG's
 * functions directly too, but it's more difficult.
 *
 * ChangeLog :
 *     12/04/08  Achraf Cherti
 *		   - rewrite of test.html, with some enhancements
 *		   - functions "fireGgp<Name>" replaced by "fireGPG<Name>"
 *		   - variables "FireGpg<Name>" replaced by "FireGPGName"
 *		   - The div gpgNode is replaced by firegpg-node
 *
 *     19/01/07  Maximilien Cuony
 *         - The first version of the API, all important 
 *           functions are implemented.
 *		   - Version 0.1 released
 */

var FireGPGData;               // Data to send to FireGPG
                               // It's an element in <div id="firegpg-node"></div>

var FireGPGReturnData;         // Data returned by FireGPG
                               // It's an element in <div id="firegpg-node"></div>

var FireGPGHelloOK = false;    // If FireGPG respond
var FireGPGAllowUser = false;  // If the web site is allowed to use FireGPG
var FireGPGAKF = '';           // the AKF is here, after FireGPGAllowUser=true

/*
 * Init the call of FireGPG (it's an internal function)
 */
function fireGPGInitCall() {
	gpgNode = document.getElementById('firegpg-node');
	/* TODO tester si gpgNode est là et faire un return */

	if(FireGPGData == null) {
		FireGPGData = document.createElement("firegpg:data");
		gpgNode.appendChild(FireGPGData);
	}

	if(FireGPGReturnData == null) {
		FireGPGReturnData = document.createElement("firegpg:returndata");
		gpgNode.appendChild(FireGPGReturnData);
	}

	// remove previous data
	attr2 = new Array();
	attrs = FireGPGData.attributes;
	for (i = 0; i < attrs.length; i++)
		attr2[i] = attrs[i]['name'];

	for (i=0; i<attr2.length; i++)
		FireGPGData.removeAttribute(attr2[i]);

	attr2 = new Array();
	attrs = FireGPGReturnData.attributes;
	for (i = 0; i < attrs.length; i++)
		attr2[i] = attrs[i]['name'];

	for (i=0; i<attr2.length; i++)
		FireGPGReturnData.removeAttribute(attr2[i]);
}

/*
 * Check if the FireGPG's API is available.
 *
 * It returns true if FireGPG is available or false.
 */
function fireGPGHello() {
	fireGPGInitCall();
	fireGPGCall('hello');

	if(FireGPGReturnData.hasAttribute('result') && 
	   FireGPGReturnData.getAttribute('result') == 'firegpg-ok') {
		FireGPGHelloOK = true;
		return true;
	}
	
	return false;
}

/*
 * Authentify your website with an AKF (Authentification Key of FireGPG).
 *
 * On success, true is returned.
 * Else, it's false.
 */
function fireGPGAuth(akf) {
	if(FireGPGHelloOK == false) {
		if(fireGPGHello() == false) {
			/* TODO pas de message dans le fichier firegpgapi.js */
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	fireGPGInitCall();
	FireGPGData.setAttribute('auth_key', akf);
	fireGPGCall('auth');

	if(FireGPGReturnData.hasAttribute('result') && 
	   FireGPGReturnData.getAttribute('result')== 'auth-ok') {
		FireGPGAllowUser = true;
		fireGPGAKF = akf;
		return true;
	}
	else
		return false;
}

/*
 * If the website doesn't have an AKF, this function returns that.
 *
 * On error, false is returned.
 */
function fireGPGRegister() {
	if(FireGPGHelloOK == false) {
		if(fireGPGHello()== false) {
			/* TODO pas de message dans le fichier firegpgapi.js */
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	fireGPGInitCall();
	fireGPGCall('register');

	if(FireGPGReturnData.hasAttribute('result') &&
	   FireGPGReturnData.getAttribute('result')== 'register-ok')
		return FireGPGReturnData.getAttribute('auth_key');
	else
		return false;
}

/*
 * Returne the list of keys (associative key[id] = description).
 *
 * Or false, on error.
 */
function fireGPGListKey() {
	if(FireGPGHelloOK == false) {
		if(fireGPGHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(FireGPGAllowUser == false) {
		if(fireGPGAuth(FireGPGAKF)== false) {
			alert('FireGPG - api : Error with auth in listkey');
			return false;
		}
	}

	fireGPGInitCall();
	FireGPGData.setAttribute('auth_key', auth_key);
	fireGPGCall('listkey');

	if(FireGPGReturnData.hasAttribute('result')&& FireGPGReturnData.getAttribute('result')== 'list-ok') {
		return_list = new Array();

		list = FireGPGReturnData.getAttribute('list');
		list = list.split(/,/g);

		for (var i=0; i< list.length; i++) {
			key_info = list[i];
			key_info = key_info.split(/:/g);

			if(key_info[0] != undefined && key_info[1] != undefined)
				return_list[fireGPGAddDoublePoint(key_info[0])] = fireGPGAddDoublePoint(key_info[1]);
		}

		return return_list;
	}
	else {
		alert('FireGPG - api : Error with listkeys');
		return false;
	}
}

/* TODO : ici */

// Return the list of private key
// Return the keys or false
function fireGPGListPrivKey(auth_key) {

	if(FireGPGHelloOK == false)
	{
		if(fireGPGHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(FireGPGAllowUser == false)
	{
		if(fireGPGAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in listprivkey');
			return false;
		}
	}

	fireGPGInitCall();

	FireGPGData.setAttribute('auth_key', auth_key);

	fireGPGCall('listprivkey');

	if(FireGPGReturnData.hasAttribute('result')&& FireGPGReturnData.getAttribute('result')== 'list-ok')
	{
		return_list = new Array();

		list = FireGPGReturnData.getAttribute('list');

		list = list.split(/,/g);

		for (var i=0; i< list.length; i++) {

			key_info = list[i];

			key_info = key_info.split(/:/g);

			if(key_info[0] != undefined && key_info[1] != undefined) {

				return_list[fireGPGAddDoublePoint(key_info[0])] = fireGPGAddDoublePoint(key_info[1]);            }
		}
		return return_list;
	}
	else
	{
		alert('FireGPG - api : Error with listprivkeys');
		return false;
	}

	return;

}

// Check if a sign is valid.
// Return an object with diffrent informations
function fireGPGCheck(auth_key, text) {

	if(FireGPGHelloOK == false)
	{
		if(fireGPGHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(FireGPGAllowUser == false)
	{
		if(fireGPGAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in check');
			return false;
		}
	}

	fireGPGInitCall();

	FireGPGData.setAttribute('auth_key', auth_key);
	FireGPGData.setAttribute('text', text);

	fireGPGCall('check');

	if(FireGPGReturnData.hasAttribute('result')== false)
	{
		alert('FireGPG - api : Error in check');
		return false;
	} else {

		var return_object = new Object();

		if(FireGPGReturnData.getAttribute('result')== 'check-ok') {

			return_object.sign_valid = true;
			return_object.infos = FireGPGReturnData.getAttribute('check-infos');


		} else {

			return_object.sign_valid = false;
			return_object.reason = FireGPGReturnData.getAttribute('error'); //unknow, no-gpg, bad-sign, no-key, no-data, bad-pass

		}

		return return_object;
	}

}

// Sign a text
// Return an object with diffrent informations
function fireGPGSign(auth_key, text, forceKey /* Optional */) {

	if(FireGPGHelloOK == false)
	{
		if(fireGPGHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(FireGPGAllowUser == false)
	{
		if(fireGPGAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in sign');
			return false;
		}
	}

	fireGPGInitCall();

	FireGPGData.setAttribute('auth_key', auth_key);
	FireGPGData.setAttribute('text', text);

	if(forceKey != undefined)
		FireGPGData.setAttribute('force-key', forceKey);

	fireGPGCall('sign');

	if(FireGPGReturnData.hasAttribute('result')== false)
	{
		alert('FireGPG - api : Error in sign');
		return false;
	} else {

		var return_object = new Object();

		if(FireGPGReturnData.getAttribute('result')== 'sign-ok') {

			return_object.sign_ok = true;
			return_object.text = FireGPGReturnData.getAttribute('text');


		} else {

			return_object.sign_ok = false;
			return_object.reason = FireGPGReturnData.getAttribute('error'); //unknow, bad-pass

		}

		return return_object;
	}

}

// Encrypt a text
// Return an object with diffrent informations
function fireGPGEncrypt(auth_key, text, dest_keys) {

	if(FireGPGHelloOK == false)
	{
		if(fireGPGHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(FireGPGAllowUser == false)
	{
		if(fireGPGAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in encrypt');
			return false;
		}
	}

	fireGPGInitCall();

	FireGPGData.setAttribute('auth_key', auth_key);
	FireGPGData.setAttribute('text', text);

	if(dest_keys instanceof Array) {

		dest_keysd = dest_keys[0];


		for (var ii = 1; ii < dest_keys.length; ++ii)
			dest_keysd = dest_keysd + ";" + dest_keys[ii];

		dest_keys = dest_keysd;

	}
	else
		dest_keys = dest_keys + "";


	FireGPGData.setAttribute('keys', dest_keys);

	fireGPGCall('encrypt');

	if(FireGPGReturnData.hasAttribute('result')== false)
	{
		alert('FireGPG - api : Error in encrypt');
		return false;
	} else {

		var return_object = new Object();

		if(FireGPGReturnData.getAttribute('result')== 'encrypt-ok') {

			return_object.encrypt_ok = true;
			return_object.text = FireGPGReturnData.getAttribute('text');


		} else {

			return_object.encrypt_ok = false;
			return_object.reason = FireGPGReturnData.getAttribute('error'); //unknow, bad-pass

		}

		return return_object;
	}

}

// Encrypt and sign  a text
// Return an object with diffrent informations
function fireGPGSignAndEncrypt(auth_key, text, dest_keys, forceKey /* Optional */) {

	if(FireGPGHelloOK == false)
	{
		if(fireGPGHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(FireGPGAllowUser == false)
	{
		if(fireGPGAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in signandencrypt');
			return false;
		}
	}

	fireGPGInitCall();

	FireGPGData.setAttribute('auth_key', auth_key);
	FireGPGData.setAttribute('text', text);

	if(forceKey != undefined)
		FireGPGData.setAttribute('force-key', forceKey);

	if(dest_keys instanceof Array) {

		dest_keysd = dest_keys[0];


		for (var ii = 1; ii < dest_keys.length; ++ii)
			dest_keysd = dest_keysd + ";" + dest_keys[ii];

		dest_keys = dest_keysd;

	}
	else
		dest_keys = dest_keys + "";


	FireGPGData.setAttribute('keys', dest_keys);

	fireGPGCall('signandencrypt');

	if(FireGPGReturnData.hasAttribute('result')== false)
	{
		alert('FireGPG - api : Error in signandencrypt');
		return false;
	} else {

		var return_object = new Object();

		if(FireGPGReturnData.getAttribute('result')== 'signandencrypt-ok') {

			return_object.signandencrypt_ok = true;
			return_object.text = FireGPGReturnData.getAttribute('text');


		} else {

			return_object.signandencrypt_ok = false;
			return_object.reason = FireGPGReturnData.getAttribute('error'); //unknow, bad-pass

		}

		return return_object;
	}

}

// Decrypt a text
// Return an object with diffrent informations
function fireGPGDecrypt(auth_key, text) {

	if(FireGPGHelloOK == false)
	{
		if(fireGPGHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(FireGPGAllowUser == false)
	{
		if(fireGPGAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in decrypt');
			return false;
		}
	}

	fireGPGInitCall();

	FireGPGData.setAttribute('auth_key', auth_key);
	FireGPGData.setAttribute('text', text);


	fireGPGCall('decrypt');

	if(FireGPGReturnData.hasAttribute('result')== false)
	{
		alert('FireGPG - api : Error in decrypt');
		return false;
	} else {

		var return_object = new Object();

		if(FireGPGReturnData.getAttribute('result')== 'decrypt-ok') {

			return_object.decrypt_ok = true;


			return_object.text = FireGPGReturnData.getAttribute('text');

			if(FireGPGReturnData.hasAttribute('sign-info'))
				return_object.signInfos = FireGPGReturnData.getAttribute('sign-info');


		} else {

			return_object.decrypt_ok = false;
			return_object.reason = FireGPGReturnData.getAttribute('error'); //unknow, bad-pass

		}

		return return_object;
	}

}

// Change #1 to #, #2 to : and #3 to , in a string
function fireGPGAddDoublePoint (s) {

	if(s == undefined)
		return;

	s = s.toString();

	s = s.replace(/#3/g,",");
	s = s.replace(/#2/g,":");
	s = s.replace(/#1/g,"#");

	return s;

}

// Call FireGPG
function fireGPGCall(func ) {

	gpgNode = document.getElementById('firegpg-node');

	var ev = document.createEvent("Events");
	ev.initEvent("firegpg:" + func, true, false);
	gpgNode.dispatchEvent(ev);

}
