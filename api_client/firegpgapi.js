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
 *
 *     19/01/07  Maximilien Cuony
 *         - The first version of the API, all important 
 *           functions are implemented.
 *		   - Version 0.1 released
 */

var FireGpgData;               // Data to pass to FireGPG
var FireGpgReturnData;         // Data who FireGPG retruns
var fireGpgHelloOk = false;    // If firegpg respond
var fireGpgAllowUser = false;  // If the site seem to be allowd

// Check if FireGPG's api is working
// Return true or false
function fireGpgHello() {
	fireGpgInitCall();
	fireGpgCall('hello');

	if(FireGpgReturnData.hasAttribute('result')&& FireGpgReturnData.getAttribute('result')== 'firegpg-ok')
	{
		fireGpgHelloOk = true;
		return true;
	}
	else
		return false;

}

// Check if the auth key is valid
// Return true or false
function fireGpgAuth(auth_key) {

	if(fireGpgHelloOk == false)
	{
		if(fireGpgHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	fireGpgInitCall();

	FireGpgData.setAttribute('auth_key', auth_key);

	fireGpgCall('auth');

	if(FireGpgReturnData.hasAttribute('result')&& FireGpgReturnData.getAttribute('result')== 'auth-ok')
	{
		fireGpgAllowUser = true;
		return true;
	}
	else
		return false;

}

// Try to register the website
// Return the key or false
function fireGpgRegister() {

	if(fireGpgHelloOk == false)
	{
		if(fireGpgHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	fireGpgInitCall();

	fireGpgCall('register');

	if(FireGpgReturnData.hasAttribute('result')&& FireGpgReturnData.getAttribute('result')== 'register-ok')
		return FireGpgReturnData.getAttribute('auth_key');
	else
		return false;

}

// Return the list of key
// Return the keys or false
function fireGpgListKey(auth_key) {

	if(fireGpgHelloOk == false)
	{
		if(fireGpgHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(fireGpgAllowUser == false)
	{
		if(fireGpgAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in listkey');
			return false;
		}
	}

	fireGpgInitCall();

	FireGpgData.setAttribute('auth_key', auth_key);

	fireGpgCall('listkey');

	if(FireGpgReturnData.hasAttribute('result')&& FireGpgReturnData.getAttribute('result')== 'list-ok')
	{
		return_list = new Array();

		list = FireGpgReturnData.getAttribute('list');

		list = list.split(/,/g);

		for (var i=0; i< list.length; i++) {

			key_info = list[i];

			key_info = key_info.split(/:/g);

			if(key_info[0] != undefined && key_info[1] != undefined) {

				return_list[fireGpgAddDoublePoint(key_info[0])] = fireGpgAddDoublePoint(key_info[1]);            }
		}
		return return_list;
	}
	else
	{
		alert('FireGPG - api : Error with listkeys');
		return false;
	}


}

// Return the list of private key
// Return the keys or false
function fireGpgListPrivKey(auth_key) {

	if(fireGpgHelloOk == false)
	{
		if(fireGpgHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(fireGpgAllowUser == false)
	{
		if(fireGpgAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in listprivkey');
			return false;
		}
	}

	fireGpgInitCall();

	FireGpgData.setAttribute('auth_key', auth_key);

	fireGpgCall('listprivkey');

	if(FireGpgReturnData.hasAttribute('result')&& FireGpgReturnData.getAttribute('result')== 'list-ok')
	{
		return_list = new Array();

		list = FireGpgReturnData.getAttribute('list');

		list = list.split(/,/g);

		for (var i=0; i< list.length; i++) {

			key_info = list[i];

			key_info = key_info.split(/:/g);

			if(key_info[0] != undefined && key_info[1] != undefined) {

				return_list[fireGpgAddDoublePoint(key_info[0])] = fireGpgAddDoublePoint(key_info[1]);            }
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
function fireGpgCheck(auth_key, text) {

	if(fireGpgHelloOk == false)
	{
		if(fireGpgHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(fireGpgAllowUser == false)
	{
		if(fireGpgAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in check');
			return false;
		}
	}

	fireGpgInitCall();

	FireGpgData.setAttribute('auth_key', auth_key);
	FireGpgData.setAttribute('text', text);

	fireGpgCall('check');

	if(FireGpgReturnData.hasAttribute('result')== false)
	{
		alert('FireGPG - api : Error in check');
		return false;
	} else {

		var return_object = new Object();

		if(FireGpgReturnData.getAttribute('result')== 'check-ok') {

			return_object.sign_valid = true;
			return_object.infos = FireGpgReturnData.getAttribute('check-infos');


		} else {

			return_object.sign_valid = false;
			return_object.reason = FireGpgReturnData.getAttribute('error'); //unknow, no-gpg, bad-sign, no-key, no-data, bad-pass

		}

		return return_object;
	}

}

// Sign a text
// Return an object with diffrent informations
function fireGpgSign(auth_key, text, forceKey /* Optional */) {

	if(fireGpgHelloOk == false)
	{
		if(fireGpgHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(fireGpgAllowUser == false)
	{
		if(fireGpgAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in sign');
			return false;
		}
	}

	fireGpgInitCall();

	FireGpgData.setAttribute('auth_key', auth_key);
	FireGpgData.setAttribute('text', text);

	if(forceKey != undefined)
		FireGpgData.setAttribute('force-key', forceKey);

	fireGpgCall('sign');

	if(FireGpgReturnData.hasAttribute('result')== false)
	{
		alert('FireGPG - api : Error in sign');
		return false;
	} else {

		var return_object = new Object();

		if(FireGpgReturnData.getAttribute('result')== 'sign-ok') {

			return_object.sign_ok = true;
			return_object.text = FireGpgReturnData.getAttribute('text');


		} else {

			return_object.sign_ok = false;
			return_object.reason = FireGpgReturnData.getAttribute('error'); //unknow, bad-pass

		}

		return return_object;
	}

}

// Encrypt a text
// Return an object with diffrent informations
function fireGpgEncrypt(auth_key, text, dest_keys) {

	if(fireGpgHelloOk == false)
	{
		if(fireGpgHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(fireGpgAllowUser == false)
	{
		if(fireGpgAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in encrypt');
			return false;
		}
	}

	fireGpgInitCall();

	FireGpgData.setAttribute('auth_key', auth_key);
	FireGpgData.setAttribute('text', text);

	if(dest_keys instanceof Array) {

		dest_keysd = dest_keys[0];


		for (var ii = 1; ii < dest_keys.length; ++ii)
			dest_keysd = dest_keysd + ";" + dest_keys[ii];

		dest_keys = dest_keysd;

	}
	else
		dest_keys = dest_keys + "";


	FireGpgData.setAttribute('keys', dest_keys);

	fireGpgCall('encrypt');

	if(FireGpgReturnData.hasAttribute('result')== false)
	{
		alert('FireGPG - api : Error in encrypt');
		return false;
	} else {

		var return_object = new Object();

		if(FireGpgReturnData.getAttribute('result')== 'encrypt-ok') {

			return_object.encrypt_ok = true;
			return_object.text = FireGpgReturnData.getAttribute('text');


		} else {

			return_object.encrypt_ok = false;
			return_object.reason = FireGpgReturnData.getAttribute('error'); //unknow, bad-pass

		}

		return return_object;
	}

}

// Encrypt and sign  a text
// Return an object with diffrent informations
function fireGpgSignAndEncrypt(auth_key, text, dest_keys, forceKey /* Optional */) {

	if(fireGpgHelloOk == false)
	{
		if(fireGpgHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(fireGpgAllowUser == false)
	{
		if(fireGpgAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in signandencrypt');
			return false;
		}
	}

	fireGpgInitCall();

	FireGpgData.setAttribute('auth_key', auth_key);
	FireGpgData.setAttribute('text', text);

	if(forceKey != undefined)
		FireGpgData.setAttribute('force-key', forceKey);

	if(dest_keys instanceof Array) {

		dest_keysd = dest_keys[0];


		for (var ii = 1; ii < dest_keys.length; ++ii)
			dest_keysd = dest_keysd + ";" + dest_keys[ii];

		dest_keys = dest_keysd;

	}
	else
		dest_keys = dest_keys + "";


	FireGpgData.setAttribute('keys', dest_keys);

	fireGpgCall('signandencrypt');

	if(FireGpgReturnData.hasAttribute('result')== false)
	{
		alert('FireGPG - api : Error in signandencrypt');
		return false;
	} else {

		var return_object = new Object();

		if(FireGpgReturnData.getAttribute('result')== 'signandencrypt-ok') {

			return_object.signandencrypt_ok = true;
			return_object.text = FireGpgReturnData.getAttribute('text');


		} else {

			return_object.signandencrypt_ok = false;
			return_object.reason = FireGpgReturnData.getAttribute('error'); //unknow, bad-pass

		}

		return return_object;
	}

}

// Decrypt a text
// Return an object with diffrent informations
function fireGpgDecrypt(auth_key, text) {

	if(fireGpgHelloOk == false)
	{
		if(fireGpgHello()== false) {
			alert('FireGPG - api : Error, FireGPG dosen\'t respond.');
			return false;
		}
	}

	if(fireGpgAllowUser == false)
	{
		if(fireGpgAuth(auth_key)== false) {
			alert('FireGPG - api : Error with auth in decrypt');
			return false;
		}
	}

	fireGpgInitCall();

	FireGpgData.setAttribute('auth_key', auth_key);
	FireGpgData.setAttribute('text', text);


	fireGpgCall('decrypt');

	if(FireGpgReturnData.hasAttribute('result')== false)
	{
		alert('FireGPG - api : Error in decrypt');
		return false;
	} else {

		var return_object = new Object();

		if(FireGpgReturnData.getAttribute('result')== 'decrypt-ok') {

			return_object.decrypt_ok = true;


			return_object.text = FireGpgReturnData.getAttribute('text');

			if(FireGpgReturnData.hasAttribute('sign-info'))
				return_object.signInfos = FireGpgReturnData.getAttribute('sign-info');


		} else {

			return_object.decrypt_ok = false;
			return_object.reason = FireGpgReturnData.getAttribute('error'); //unknow, bad-pass

		}

		return return_object;
	}

}

// Change #1 to #, #2 to : and #3 to , in a string
function fireGpgAddDoublePoint (s) {

	if(s == undefined)
		return;

	s = s.toString();

	s = s.replace(/#3/g,",");
	s = s.replace(/#2/g,":");
	s = s.replace(/#1/g,"#");

	return s;

}

// InitFireGPG call
function fireGpgInitCall() {

	gpgNode = document.getElementById('gpgNode');

	if(FireGpgData == null) {
		FireGpgData = document.createElement("firegpg:data");
		gpgNode.appendChild(FireGpgData);
	}

	if(FireGpgReturnData == null) {
		FireGpgReturnData = document.createElement("firegpg:returndata");
		gpgNode.appendChild(FireGpgReturnData);
	}

	// Remove previous data
	attr2 = new Array();
	attrs = FireGpgData.attributes;
	for (i=0; i<attrs.length; i++) {
		attr2[i] = attrs[i]['name'];
	}
	for (i=0; i<attr2.length; i++) {
		FireGpgData.removeAttribute(attr2[i]);
	}

	attr2 = new Array();
	attrs = FireGpgReturnData.attributes;
	for (i=0; i<attrs.length; i++) {
		attr2[i] = attrs[i]['name'];
	}
	for (i=0; i<attr2.length; i++) {
		FireGpgReturnData.removeAttribute(attr2[i]);
	}

}

// Call FireGPG
function fireGpgCall(func ) {

	gpgNode = document.getElementById('gpgNode');

	var ev = document.createEvent("Events");
	ev.initEvent("firegpg:" + func, true, false);
	gpgNode.dispatchEvent(ev);

}
