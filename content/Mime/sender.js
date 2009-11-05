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

Portions created by Gmail S/MIME are Copyright (C) 2005-2007 Richard Jones, 2007-2008 Sean Leonard of SeanTek(R). All Rights Reserved.

***** END LICENSE BLOCK *****

Base of the code :

Copyright (C) 2005-2006 Richard Jones.
Copyright (C) 2007-2008 Sean Leonard of SeanTek(R).
This file was a part of Gmail S/MIME (adapted)

{DOUBLY FREE SOFTWARE PUBLIC LICENSE}

*/

if (typeof(FireGPG)=='undefined') { FireGPG = {}; }
if (typeof(FireGPG.Mime)=='undefined') { FireGPG.Mime = {}; }

FireGPG.Mime.Sender = function()
{
}

FireGPG.Mime.Sender.prototype =
{

	// Abstract methods to be overidden by children

	/**
	 * Abstract callbacks to be called right before a message undergoes the operations indicated by the functions. This is meant
	 * to inform the user via the UI.
	 * TODO: Note on implementation: currently signText, encryption, and FireGPG.Mime.breakLines take an extraordinarily long time for large data. Thus, they block the UI. Consider addressing this.
	 */
	ourSigning: function(msg) {},
	ourEncrypting: function(msg) {},
	ourSending: function(msgs) {},

	/**
	 * Abstract callback to be called after a pile of messages is sent (or not sent, as the case may be).
	 * @param prefs {Object}  The preferences that accompanied this set of messages.
	 * These prefs are saved/delivered through the routine along with the messages because
	 * this sender object, which corresponds to a form, may not have the same preferences
	 * as the pile of messages that are finally sent at the time after those messages
	 * are finally sent (conceptually, the user may have moved on to composing a new message with
	 * different prefs).
	 */
	ourSent: function(msgs, err, prefs) { }, // this is a callback AFTER a message is sent. No return parameter expected.

	// so-called internal variables (but purposefully declared public)
	smtpUsername : null, // this can be null, a string, or a function reference. If null, no smtp auth is attempted.
	smtpPassword : null, // this can be null, a string, or a function reference.
	smtpServer : null, // this can be null or a string (DNS)
	smtpPort : 25, // this must be a number.
	smtpSocketTypes : null, // this must be an array of socket type strings per
	// nsISocketTransportService::createTransport.

	/**
	 * A message object is a discrete block of data that is serialized out
	 * using SmimeSender.smtpSend.
	 * @class
	 */
	Msg: function() {	}, // base msg

	// New function used to intercept compose/reply form submissions.
	// one submission equals ONE e-mail message, although multiple msgs may be generated (see below)
	// return: false = e-mail message not sent; true = e-mail message sent successfully; null = sending (async)
	/**
	 * Process and submit data. Input:
	 *	from: string specifying precise RFC822 From: line (after "From: ")
	 *	to: RFC822 To: line
	 *	cc: RFC822 Cc: line (or null)
	 *	bcc: RFC822 Bcc: line (or null)
	 *	subject: RFC822 Subject: line
	 *	inreplyto: RFC2822 In-Reply-To: line (see RFC2822 sec. 3.6.4)
	 *	references: RFC2822 References: line (see RFC2822 sec. 3.6.4)
	 * The above are ONE-LINE PREFERRED. Line breaks will be performed as necessary by ourSubmit or smtpSend.
	 *	body: some kind of a variable indicating BODY text. Let us assume, for now, that the body text itself
	 *     is RFC822-compliant, but the variable need not specify a string (it could be an input stream, or it
	 *     could be a lazy-evaluated function).
	 *	attachments: array of abstract Objects containing attachments. These objects will be passed directly to formuploader.js's AddFilePair function. See that function for supported object types.
	 *	prefs: per-submission preference object, specifying encrypt, sign, send unencrypted copy, and so on
	 * NOT SUBMITTED: Message-ID, general headers. This is circumscribed.
	 */
	ourSubmit : function ourSubmit(from, to, cc, bcc, subject,
	 inreplyto, references, body, isPlain, attachments, prefs)
	{
            FireGPG.debug("Parameters recevied : from: " + from +  " to:" +  to +  " cc:" +  cc +  " bcc:" +  bcc +  " subject:" +  subject +  " inreplyto:" +  inreplyto +  " isPlain:" + isPlain + " Sign ?" + prefs.sign + " Encrypt ?" +  prefs.encrypt, 'ourSubmit',  false);
		// first do generic From and To. If it fails here, then give
		// up. (But see advanced options to do, below. This code may
		// need to be moved back down.)	 now we need mailFrom and
		// rcptTo.

		var msg = new FireGPG.Mime.Sender.Msg();

		var msgs = null;	// this will be an Array

        FireGPG.debug("Calling FireGPG.Mime.convertAddressLineToArray - parameters : from", 'ourSubmit',  false);
		var af = FireGPG.Mime.convertAddressLineToArray(from);
		if (af.length != 1) return false;
		msg.mailFrom = af[0];

		// NOTE: at this time it APPEARS to be the case that if you
		// try to send a message to yourself, Gmail SMTP will actually
		// save the first copy of the message. Not the last one or
		// whatever.
        FireGPG.debug("Calling FireGPG.Mime.convertAddressLineToArray - parameters : to", 'ourSubmit',  false);
        a = FireGPG.Mime.convertAddressLineToArray(to);
        FireGPG.debug("Calling FireGPG.Mime.convertAddressLineToArray - parameters : cc", 'ourSubmit',  false);
        a = FireGPG.Mime.convertAddressLineToArray(cc);
        FireGPG.debug("Calling FireGPG.Mime.convertAddressLineToArray - parameters : bcc", 'ourSubmit',  false);
        a = FireGPG.Mime.convertAddressLineToArray(bcc);
        FireGPG.debug("Calling FireGPG.Mime.convertAddressLineToArray - parameters : to-cc-bcc", 'ourSubmit',  false);

        msg.rcptTo =
		FireGPG.Mime.convertAddressLineToArray(to).concat(
		 FireGPG.Mime.convertAddressLineToArray(cc),
		 FireGPG.Mime.convertAddressLineToArray(bcc));
		if (!msg.rcptTo.length) return false;

		// TODO: support quoted-printable for other headers, not just subject
		msg.From = from;	// no exceptions
		if (to.length)
			msg.To = to;
		if (cc.length)
			msg.Cc = cc;

		if (inreplyto && inreplyto.length)
			msg.InReplyTo = inreplyto;
		if (references && references.length)
			msg.References = references;

		// conveniently, gmail SMTP will strip the bcc from the
		// header. But the user might want it recorded for reference.
		if (bcc.length)
			msg.Bcc = bcc;
		if (subject.length)
			msg.Subject = FireGPG.Mime.stUtil.makeRFC2047(subject);

		// date. (Note: we can get offset from UTC, but we can't get
		// the actual time zone) Sample: Tue, 15 May 2007 18:34:56
		// -0500 (CDT) note that CDT or Central Daylight Time or
		// whatever is a parenthetical, so it is pretty free-form
		// according to the docs
		var date = new Date();
		date.toRFC2822String = function()
		{
			var dow = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
			var moy = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep",
					   "Oct","Nov","Dec"];
			function f2s(i)
			{
				// warning: not tolerant of i > 99
				return (i < 10) ? "0" + i : i;
			}
			// format timezone. getTimezoneOffset is minutes west; we
			// want minutes EAST. Follow RFC 2822.
			function f4t(i)
			{
				if (i > 0)
				{
					var m = i % 60;
					return "-" + f2s((i - m)/60) + f2s(m);
				}
				else
				{
					i = -i;
					var m = i % 60;
					return "+" + f2s((i - m)/60) + f2s(m);
				}
			}
			var paren = this.toTimeString().match(/\(.+\)/);
			paren = (paren == null) ? "" : " " + paren;
			// save a byte on the date for < 10
			return dow[this.getDay()] + ", " + this.getDate() + " " +
			moy[this.getMonth()] + " " + this.getFullYear() + " " +
			f2s(this.getHours()) + ":" + f2s(this.getMinutes()) + ":" +
			f2s(this.getSeconds()) +
			" " + f4t(this.getTimezoneOffset()) + paren;
		}

		msg.Date = date.toRFC2822String();
		// get the comment

		// create message ID based on current date and some random string
		msg.MessageID = "<" + date.getTime().toString(36) +
		(Math.round(46656*46656*46656*36*Math.random())).toString(36) +
		"UYAxe124vaj_firegpg@mail.gmail.com>";

		// encoder appears to store the encapsulated data for Gmail submission.


		var encoder;
		encoder = new FireGPG.Mime.Encoder((attachments.length>0 || !isPlain),1);
        //encoder = new FireGPG.Mime.Encoder(true,1); //Toujours multipart

        if (!isPlain) {

            encoder.addBase64String(FireGPG.Mime.Decoder.prototype.washFromHtml(body), "text/plain; format=flowed",null);
            encoder.addStringToStream(encoder.CRLF);
        }

        encoder.addBase64String(body,isPlain ? "text/plain; format=flowed" : "text/html",null);



		// HERE, we have to asynchronously fill out all of the remote attachments
		var i=0;
		if (!attachments.length) return postAttach.call(this);
		else return (function doAttachment(me)
		{
			function advance()
			{
				encoder.addFilePair("attachment",attachments[i],"base64");
				i++;
				if (i >= attachments.length) return postAttach.call(me);
				else return doAttachment(me);
			}
			if (attachments[i] instanceof Components.interfaces.nsIChannel) // nsIChannel or nsIHttpChannel
			{
				var binarystream = Components.classes["@mozilla.org/binaryinputstream;1"].createInstance(Components.interfaces.nsIBinaryInputStream);

				// Required to get correct object inside the dataListener object.
				var outer = this;
				// Datalistener used to collect data from attachment.
				var dataListener =
				{
					data : "",
					onStartRequest: function(request, context){},
					onStopRequest: function(request, context, status)
					{
						if (status == 0)
						{
							attachments[i] = { data: this.data, channel: attachments[i]};  // yes this is an overload/hack, but that's the way it is.

							// since this is a callback, it is necessary to callback the more concrete class since it last heard "true" that it should still keep
							// the "Sending" progress information onscreen.
							if (!advance())
							{
								// XXX: Abstraction barrier violation!
								// TODO: create a generic callback interface
								if (typeof(me.setProgressMessage) == "function")
								{
									me.setProgressMessage(null);
								}
							}

						}
						// if something bad happened
						else
						{

						}
					},
					onDataAvailable: function(request, context, inputStream, offset, count)
					{
						if (offset == 0)
							binarystream.setInputStream(inputStream);
						this.data += binarystream.readBytes(count);
					},
				};
				// Start the asynchronous download
				attachments[i].asyncOpen(dataListener,null);
				return true; // can't block, so just say it's ok.
			}
			else return advance();
		})(this) // end doAttachment()
		return true;

		function postAttach()
		{
			var multiStream;
            var bonus;
            var prebonus;
			if (attachments.length>0||!isPlain)  {
				multiStream=encoder.getMultipartStream("multipart/alternative",false);
            }
			else
				multiStream=encoder.getSinglePartStream();
			var binaryStream =
			Components.classes["@mozilla.org/binaryinputstream;1"].
			createInstance(Components.interfaces.nsIBinaryInputStream);
			binaryStream.setInputStream(multiStream);
			msg.BodyPlus = binaryStream.readBytes(multiStream.available());

            const crlf = "\r\n";

            boundeur = "-----firegpg" + FireGPG.Const.VersionA + "eq" + (Math.round(Math.random()*99)+(new Date()).getTime()).toString(36) +
                (99+Math.round(46656*46656*46635*36*Math.random())).toString(36);

            // msg.BodyPlus += crlf;

            whoWillGotTheMail = prefs.whoWillGotTheMail;

            if (prefs.attachements || attachments.length <= 0) {
                stringToWork = msg.BodyPlus;
                bonus = "";
                prebonus = "";

            } else {

                dataDeBase = msg.BodyPlus;
                bondeurDuContenu = encoder.boundaryString;
                bondeurString = '--' + bondeurDuContenu + crlf;



                startOfContent = dataDeBase.indexOf(bondeurString) + bondeurString.length;
                endOfContent = dataDeBase.indexOf(bondeurString, dataDeBase.indexOf(bondeurString) + 1) ;

                stringToWork = dataDeBase.substring(startOfContent, endOfContent);
                bonus = dataDeBase.substring(endOfContent, dataDeBase.length);
                prebonus = dataDeBase.substring(0, startOfContent);



            }

            if (prefs.sign && !prefs.encrypt) {

                var result = FireGPG.Core.sign(false,stringToWork+ crlf, null, null, null, prefs.whoSendTheMail );

                if (result.result == FireGPG.Const.Results.SUCCESS) {

                    var digest = "SHA1"; //Unfortunaly by default..
                    try {
                            var prefss = Components.classes["@mozilla.org/preferences-service;1"].
                                           getService(Components.interfaces.nsIPrefService);
                            prefss = prefss.getBranch("extensions.firegpg.");
                            digest = prefss.getCharPref("digest");
                    } catch (e)  { }

                    if (digest == "" || digest == null)
                        digest = "SHA1";

                    //IN DECODER, INVERTED ARRAY
                    var digestformime = 'pgp-sha1';

                    if  (digest == 'MD5') //Wooooooooo
                        digestformime = 'pgp-md5';

                    if  (digest == 'SHA1')
                        digestformime = 'pgp-sha1';

                    if  (digest == 'SHA256')
                        digestformime = 'pgp-sha256';

                    if  (digest == 'SHA384')
                        digestformime = 'pgp-sha384';

                    if  (digest == 'SHA512')
                        digestformime = 'pgp-sha512';

                    if  (digest == 'SHA224')
                        digestformime = 'pgp-sha224';

                    if  (digest == 'RIPEMD160')
                        digestformime = 'pgp-ripemd160';

                    if  (digest == 'TIGER192')
                        digestformime = 'pgp-tiger192';

                    if  (digest == 'HAVAL-5-160')
                        digestformime = 'pgp-haval-5-160';

                    if  (digest == 'MD2')
                        digestformime = 'pgp-md2';

                    if  (digest == 'MD5')
                        digestformime = 'pgp-md5';

                    if  (digest == 'MD5')
                        digestformime = 'pgp-md5';


                    signedData = result.signed.substring(result.signed.lastIndexOf("-----BEGIN PGP SIGNATURE-----"), result.signed.length)

                  newmessage = 'X-FireGPG-Version: ' + FireGPG.Const.Version + crlf +
                  'Content-Type: multipart/signed; micalg=' + digestformime +'; protocol="application/pgp-signature"; boundary="'+boundeur+'"' +  crlf + crlf +
                   'This is an OpenPGP/MIME signed message (RFC 2440 and 3156)' + crlf +
                   '--' + boundeur + crlf +
                   stringToWork + crlf  +
                   '--' + boundeur + crlf +
                   'Content-Type: application/pgp-signature; name="signature.asc"' + crlf +
                   'Content-Description: OpenPGP digital signature' + crlf +
                   'Content-Disposition: attachment; filename="signature.asc"' + crlf + crlf +
                   signedData + crlf +
                   '--' + boundeur + '--';

                   msg.BodyPlus = prebonus  + newmessage + crlf + bonus;

                } else {
                    return false;
                }


            } else if (prefs.sign) { //Sign + encrypted

                var result = FireGPG.Core.cryptAndSign(false,stringToWork, null ,false,null, null, false, whoWillGotTheMail, prefs.whoSendTheMail);

                if (result.result == FireGPG.Const.Results.SUCCESS) {


                  newmessage = 'X-FireGPG-Version: ' + FireGPG.Const.Version + crlf +
                  'Content-Type: multipart/encrypted;  protocol="application/pgp-encrypted"; boundary="'+boundeur+'"' +  crlf + crlf +
                   'This is an OpenPGP/MIME encrypted message (RFC 2440 and 3156)' + crlf +
                   '--' + boundeur + crlf +
                   'Content-Type: application/pgp-encrypted' + crlf +
                    'Content-Description: PGP/MIME version identification' + crlf + crlf +
                   'Version: 1' + crlf  + crlf +
                   '--' + boundeur + crlf +
                   'Content-Type: application/octet-stream; name="encrypted.asc"' + crlf +
                   'Content-Description: OpenPGP encrypted message' + crlf +
                   'Content-Disposition: inline; filename="encrypted.asc"' + crlf + crlf +
                   result.encrypted + crlf +
                   '--' + boundeur + '--';

                   msg.BodyPlus = prebonus  + newmessage + crlf + bonus;

                } else {
                    return false;
                }

            } else { //Encrypted


                var result = FireGPG.Core.crypt(false,stringToWork,null, false, false,whoWillGotTheMail);

                if (result.result == FireGPG.Const.Results.SUCCESS) {


                  newmessage = 'X-FireGPG-Version: ' + FireGPG.Const.Version + crlf +
                  'Content-Type: multipart/encrypted;  protocol="application/pgp-encrypted"; boundary="'+boundeur+'"' +  crlf + crlf +
                   'This is an OpenPGP/MIME encrypted message (RFC 2440 and 3156)' + crlf +
                   '--' + boundeur + crlf +
                   'Content-Type: application/pgp-encrypted' + crlf +
                    'Content-Description: PGP/MIME version identification' + crlf + crlf +
                   'Version: 1' + crlf  + crlf +
                   '--' + boundeur + crlf +
                   'Content-Type: application/octet-stream; name="encrypted.asc"' + crlf +
                   'Content-Description: OpenPGP encrypted message' + crlf +
                   'Content-Disposition: inline; filename="encrypted.asc"' + crlf + crlf +
                   result.encrypted + crlf +
                   '--' + boundeur + '--';

                   msg.BodyPlus = prebonus + newmessage + crlf + bonus;

                } else {
                    return false;
                }

            }



           // return false;

                    /*

                              */




            // just put the message AS IS into the array.
            msgs = [msg];

			this.ourSending(msgs);
			return this.smtpSend(msgs, prefs); // TODO: handle returned error.
		}
	}, // end ourSubmit

	// smtpSend sends an array of messages along.
	// see return codes for ourSubmit
	// TODO: handle errors more gracefully. Do some variable checking.
	smtpSend : function(msgs, prefs)
	{
		try
		{
			// start counting msg array.
			var i = 0;
			var msg;	// shorthand for the PARTICULAR message msgs[i]

			// import into local scope (for the pump, this variable
			// will change), but only for this.ourSent at the end!
			var myself = this;
			if (!(msgs instanceof Array)) return false;
			if (!msgs.length) return false;

			var dns = Components.classes["@mozilla.org/network/dns-service;1"]
			.getService(Components.interfaces.nsIDNSService);
			var transportService = Components.classes["@mozilla.org/network/socket-transport-service;1"]
			.getService(Components.interfaces.nsISocketTransportService);
			smtpTransport =
			transportService.createTransport(
											 this.smtpSocketTypes,
											 this.smtpSocketTypes ? this.smtpSocketTypes.length : 0,
											 this.smtpServer, this.smtpPort, null);
			// the output stream will block until ALL data is sent or the thread is closed.
			var outputStream = smtpTransport.openOutputStream(smtpTransport.OPEN_BLOCKING, 0, 0);
			var inStream = smtpTransport.openInputStream(0, 0, 0); // this interface is not scriptable
			var inputStream = Components.classes["@mozilla.org/scriptableinputstream;1"].createInstance(
																										Components.interfaces.nsIScriptableInputStream);
			inputStream.init(inStream);

			// constant
			var crlf = "\r\n";

			// 0 just starting; {1-4 are reserved for TLS, if ever
			// implemented}; ; 10 finished sending FROM, send TO;
			var status = 0;
			// needed to count how many rcptTo values we have issued already.
			var rcptToCount = 0;

			// we need the username and password in advance;
			// hence, don't raise a UI request when the connection
			// is hanging below.
			var smtpUsername = typeof(this.smtpUsername) == "function" ?
			this.smtpUsername() : this.smtpUsername;

			var smtpPassword = null;
			if (smtpUsername)
			{
				smtpUsername = btoa(smtpUsername) + crlf;
				// TODO: consider cases where the user provides a
				// USERNAME but has NO PASSWORD (no password
				// required, as opposed to a blank password, which
				// in theory would be btoa("") which is also "".
				smtpPassword =
					btoa(typeof(this.smtpPassword) == "function" ?
						 this.smtpPassword() : this.smtpPassword) + crlf;
			}
			// 100 done, sent mail; 101 done, mail sending failed.
			// var connected = false;

			// log SMTP transmission messages
			function log(m)
			{
				var consoleService = Components.classes["@mozilla.org/consoleservice;1"].getService(Components.interfaces.nsIConsoleService);
//			  var scriptError = Components.classes["@mozilla.org/scripterror;1"].createInstance(Components.interfaces.nsIScriptError);
				FireGPG.debug(m, 'smtplog');
			}
			// dataListener communicates with the server and sends the data
			// NOTE: var o is output message to send along the pipe
			var dataListener =
			{
				err: false,
				onStartRequest: function(request, context)
				{
					// enable ESMTP
					var o = "EHLO [127.0.0.1]" + crlf;
					outputStream.write(o, o.length);
				},
				onStopRequest: function(request, context, status)
				{
					if (msg && typeof(msg) == "object") // NOTE: typeof(null) == "object" !!
						msg.sent = false;		// note that the current message is false (this should propagate by reference to msgs[i])
					log("SMTP Closed");
					outputStream.close(); // not convinced these are necessary...?
					inputStream.close();
					myself.ourSent(msgs, this.err, prefs);
				},
				onDataAvailable: function(request, context, inStream, offset, count)
				{ // note: overshadows inStream
					var ret = inputStream.read(count);
					var o = null;
					log("< " + ret);
					switch (status)
					{
					case 0:
						switch (ret.substring(0, 3))
						{
						case "220": // greetings
							if (smtpUsername == null || smtpPassword == null || this.no_auth != null)
								status = 6; // straight to begin from sequence.
							return;
						case "250": // we do auth
							o = "AUTH LOGIN" + crlf;
							status = 5;
							break;
						} break;
						/* case 1-4 reserved in case needed for STARTTLS */
					case 5: // authentication
						if (ret.substring(0, 3) == "334")
						{
							o = smtpUsername;
							status = 6;
						}
						break;
					case 6: switch (ret.substring(0, 3))
						{
						case "334":
							o = smtpPassword;
							break;
						case "235": // accepted
							// clear memory
							smtpUsername = null;
							smtpPassword = null;
						case "250": // no auth
							// set msg.
							msg = msgs[i];
							// execute FROM
							o = "MAIL From:<" + msg.mailFrom + ">" + crlf;
							status = 10;
							break;
						case "454": // You'll probably get 4.7.0 Cannot authenticate due to temporary system problem. Try again later.
							o = "QUIT" + crlf; // we're done.
							// Note that we do not want to set msg.sent because msg is null, and none of the msgs are "bad."
							// The msgs can theoretically be resent later.
							this.err = ret;
							status = 101;
							break;
						case "535": // credentials rejected
							o = "QUIT" + crlf;
							this.err = ret;
							status = 101;
							break;
						} break;
					case 10: switch (ret.substring(0,3))
						{
						case "250": // execute receipt to:
							o = "";
							// TODO: error case of rcptTo malformed (no length?)
							// 7/16/2008: do these one at a time; wait for response.
							if (rcptToCount < msg.rcptTo.length)
							{
								o = "RCPT To:<" + msg.rcptTo[rcptToCount++] + ">" + crlf;
								if (rcptToCount == msg.rcptTo.length)
								{
									// advance in status (finite state machine).
									rcptToCount = 0;
									status = 11;
								}
							}
							else
							{
								this.err = "ERR Out of sync on counting RCPT To: values.";
								status = 101;
							}
							break;
						} break;
					case 11: switch (ret.substring(0,3))
						{
						case "250":
							o = "DATA" + crlf; // someday, support CHUNKING (BDAT),
							// but current gmail implementation does not support it so who cares
							break;
						case "354":
							//TODO: remove this debugging statement (note: it is a debugging statement, not a communication message)
							if (msg.Body != null) jsdump("msg.Body is NOT NULL!!!!! Body:\n" + msg.Body);
							// TODO: if "From"? What does rfc822 say about no From: header?
							o = "From: " + msg.From + crlf;
							if (msg.To)
								o += "To: " + msg.To + crlf;
							if (msg.Cc)
								o += "Cc: " + msg.Cc + crlf;
							// This is useful for gmail remembering
							// which e-mails are ACTUALLY bcc'd. If
							// you do not want gmail to record the
							// bccs, do not include this bcc
							// line. Gmail appears still to deliver
							// the e-mails correctly (based on the
							// RCPT To: information), but has no
							// memory of it at least in the Gmail UI!
							if (msg.Bcc)
								o += "Bcc: " + msg.Bcc + crlf;
							// TODO: consider merging Date, Message-ID, In-Reply-To, and References into one OtherHeader.
							// TODO: consider merging all of these into one Header.
							if (msg.Date)
								o += "Date: " + msg.Date + crlf;
							// NOTE: Message-ID is STRONGLY RECOMMENDED
							if (msg.MessageID && msg.MessageID[0] == "<" && msg.MessageID[msg.MessageID.length - 1] == ">")
								o += "Message-ID: " + msg.MessageID + crlf; // TODO: mx.google.com VERSUS mail.gmail.com VERSUS different domain

							if (msg.Subject)
								o += "Subject: " + msg.Subject + crlf;

							if (msg.InReplyTo && msg.InReplyTo[0] == "<" && msg.InReplyTo[msg.InReplyTo.length - 1] == ">")
								o += "In-Reply-To: " + msg.InReplyTo + crlf;

							if (msg.References && msg.References[0] == "<" && msg.References[msg.References.length - 1] == ">")
								o += "References: " + msg.References + crlf;

								// MIME
							o += "MIME-Version: 1.0" + crlf;
							if (msg.ContentTransferEncoding)
								o += "Content-Transfer-Encoding: " + msg.ContentTransferEncoding + crlf;

							if (msg.ContentDisposition)
								o += "Content-Disposition: " + msg.ContentDisposition + crlf;

							if (msg.ContentDescription)
								o += "Content-Description: " + msg.ContentDescription + crlf;

							if (msg.ContentType)
								o += "Content-Type: " + msg.ContentType + crlf;

							//							o += crlf; // end headers

							// premature write. because we have to.
							log("> (headers:)\n" + o);
							outputStream.write(o, o.length);
							// write whole body and remaining headers.
							var bout = 0; // for examination & debugging purposes only.
							/**
							 * The Length.
							 */
							//							var tl = 0x7F00;
							if (typeof(msg.BodyPlus) == "string")
							{
								/*								log("bpl: " + msg.BodyPlus.length);
									  var fullchunks = (msg.BodyPlus.length / tl)>>0; // floor.
									  log("cks: " + fullchunks);
									  log("lft: " + (msg.BodyPlus.length % tl));
									  var compile = "";
									  try {
									  for (var bpl = 0; bpl < fullchunks; bpl++) {
									  bout = outputStream.write(msg.BodyPlus.substring(bpl * tl), tl);
									  compile += msg.BodyPlus.substring(bpl * tl, (bpl+1)*tl);
									  outputStream.flush();
									  }
									  bout = outputStream.write(msg.BodyPlus.substring(bpl * tl), msg.BodyPlus.length % tl);
									  compile += msg.BodyPlus.substring(bpl * tl);
									  outputStream.flush();
									  if (compile == msg.BodyPlus) alert("Eureka it's the same!!");
									  } catch (e) {
									  jsdump(e);
									  } */

								// this may block for a _long time_.
								try
								{
									log("> (body, length " + msg.BodyPlus.length + " bytes)");
									bout = outputStream.write(msg.BodyPlus, msg.BodyPlus.length);
								} catch (e)
								{
									jsdump("outputStream.write error");
									jsdump(e);	// not sure if this would ever be called, but not sure what happens when prematurely closed
								}
							}
							else if (typeof(msg.BodyPlus) != "undefined")
							{ // TODO: make this a check for nsIStream or somesuch.
								debugger;		// need to make sure this works.
								bout = outputStream.writeFrom(msg.BodyPlus, -1);
							}
							// TODO: is the Body supposed to include a trailing CRLF per the rfc822 spec, or is CRLF.CRLF considered the end part?
							// I claim that it is not...
							// (Consider the case where Body could be BINARY for binary transfers vs. 8bit vs. 7bit)
							o = crlf + "." + crlf; // END
							status = 22;
						} break;
					case 22:
						if (ret.substring(0, 3) == "250")
						{
							// Message successfully sent!
							msg.sent = true;
							if ((++i) < msgs.length)
							{
								// perform the equivalent of case 6 (second half)
								msg = msgs[i];
								// execute FROM
								o = "MAIL From:<" + msg.mailFrom + ">" + crlf;
								status = 10;
							}
							else
							{
								msg = null; // just in case.
								o = "QUIT" + crlf; // we're done.
								status = 100;
							}
						}	break;
					case 100:
						if (ret.substring(0, 3) == "221")
							return;
						break;
					} // end status switch
					// Only an error if message is not "closing connection"
					if (o == null && ret.substring(0,3) != "221")
					{
						// TODO: make more pretty.
						alert("Mail not sent by SMTP!\nLatest ret: " + ret+" status:"+status);
						// terminate connection, but use the normal channels
						o = "QUIT" + crlf;
						log("> QUIT");
						outputStream.write(o, o.length);
						this.err = ret;
						status = 101;
						debugger;
					}
					else
					{
						log("> " + o);
						outputStream.write(o, o.length);
					}
				}
			};

			var pump = Components.classes["@mozilla.org/network/input-stream-pump;1"].createInstance(
																									 Components.interfaces.nsIInputStreamPump);
			// do not close on completion; close manually
			pump.init(inStream, -1, -1, 0, 0, false);
			// no need for context because of the function closure
			pump.asyncRead(dataListener, null);

			return true;	// def: sending (async)
		}
		catch (e)
		{
			alert("exception on upload:"+e); // TODO: make pretty.
			return false;
		}
	}, // end smtpSend



}; // end FireGPG.Mime.Sender

FireGPG.Mime.Sender.prototype.Msg.prototype =
{
	From: null,
	To: null,
	Cc: null,
	Bcc: null,
	Subject: null,
	InReplyTo: null,
	References: null,
	/**
	 * @deprecated
	 */
	Body: null,
	/**
	 * Specifies the RFC2822 body and extra headers. Thus, a body alone, without headers,
	 * must be stored in BodyPlus with a leading \r\n.
	 */
	BodyPlus: null,
	mailFrom: null,
	rcptTo: null,
	Date: null,
	/**
	 * MessageID must be of the form <ID@DOMAIN>, with < as the first char and > as the last char.
	 */
	MessageID: null,
	/**
	 * @deprecated
	 */
	ContentTransferEncoding: null,
	/**
	 * @deprecated
	 */
	ContentDisposition: null,
	/**
	 * @deprecated
	 */
	ContentDescription: null,
	/**
	 * @deprecated
	 */
	ContentType: null,
	// TODO: In-Reply-To, References
	/**
	 * copy constructor. copy the object, but the refs remain the same.
	 */
	ShallowCopy: function()
	{
		var nmsg = new SmimeSender.prototype.Msg();

		nmsg.From= this.From;
		nmsg.To= this.To;
		nmsg.Cc= this.Cc;
		nmsg.Bcc= this.Bcc;
		nmsg.Subject= this.Subject;
		nmsg.InReplyTo= this.InReplyTo;
		nmsg.References= this.References;
		nmsg.Body= this.Body; // TODO: delete.
		nmsg.BodyPlus = this.BodyPlus;
		nmsg.mailFrom= this.mailFrom;
		nmsg.rcptTo= this.rcptTo;
		nmsg.Date= this.Date;
		nmsg.MessageID= this.MessageID;
		nmsg.ContentTransferEncoding= this.ContentTransferEncoding;
		nmsg.ContentDisposition= this.ContentDisposition;
		nmsg.ContentDescription= this.ContentDescription;
		nmsg.ContentType= this.ContentType;
		// nmsg.ShallowCopy= this.ShallowCopy unnecessary
		return nmsg;
	}
};
FireGPG.Mime.Sender.Msg = FireGPG.Mime.Sender.prototype.Msg; // shorthand