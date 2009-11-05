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

FireGPG.Mime.Encoder = function(multiPart,partNum)
{
	this.init(multiPart,partNum);
}

FireGPG.Mime.Encoder.prototype =
{
	multipartStream: null,
	// TODO: generate mostly random.
	CRLF: "\r\n",


	addStringToStream : function(str)
	{
		var strInp=
		Components.classes["@mozilla.org/io/string-input-stream;1"].
		createInstance(Components.interfaces.nsIStringInputStream);
		strInp.setData(str,str.length);
		this.multipartStream.appendStream(strInp);
	},

	addValuePair: function(name,value)
	{
		var str = "--"+this.boundaryString+this.CRLF +
		"Content-Disposition: form-data; name=\"" +
		encodeURIComponent(name)+"\"" + this.CRLF + this.CRLF +
		value + this.CRLF;
		this.addStringToStream(str);
	},

	addFilePairFromString: function(str,fileNameStr,contentType, disposition,encoding)
	{
		var strInp=Components.classes["@mozilla.org/io/string-input-stream;1"].
		createInstance(Components.interfaces.nsIStringInputStream);
		strInp.setData(str,str.length);
		this.addFilePairFromStream(strInp,fileNameStr,contentType,
		disposition,null,encoding);
	},

	addFilePairFromStream: function(fileStream,fileNameStr, contentType,disposition,contentDescription, encoding)
	{
		str = this.CRLF + "--" + this.boundaryString + this.CRLF;
		str += "Content-Transfer-Encoding: "+encoding+ this.CRLF;
		str += "Content-Disposition: "+disposition+";" + this.CRLF + "\tfilename=\"" +
			this.makeRFC2047(fileNameStr) + "\"" + this.CRLF;
		if (contentDescription != null)
			str += "Content-Discription: "+contentDescription+this.CRLF;
		str += "Content-Type: " + contentType + this.CRLF + this.CRLF;

		this.addStringToStream(str);

		if (encoding == "base64")
		{
			try
			{
				var binInpStream =
				Components.classes[
				"@mozilla.org/binaryinputstream;1"].
				createInstance(Components.interfaces.nsIBinaryInputStream);
				binInpStream.setInputStream(fileStream);
				var bytes = binInpStream.readBytes(fileStream.available());
				var base64coded = FireGPG.Mime.breakLines(btoa(bytes));
				this.addStringToStream(base64coded);
			}
			catch (e)
			{
				alert("Error converting file to base64:"+e);
			}
		}
		else
		{ // not base64
			this.multipartStream.appendStream(fileStream);
		}

		// this.addStringToStream(this.CRLF);
	}, // end addFilePairFromStream

	addSignature: function(s)
	{
		this.addPlainStr(s,
						 'application/pkcs7-signature; name="smime.p7s"',
						 "base64",
						 'attachment; filename="smime.p7s"',
						 "S/MIME Cryptographic Signature");
	},

	addPlainStr: function(str,contentType,encoding,disposition, description)
	{
		var part = "";
		if (this.multiPart)
			part = "\r\n--"+this.boundaryString+this.CRLF;
		if (contentType != null)
			part += "Content-Type: "+contentType+this.CRLF;
		if (encoding != null)
			part += "Content-Transfer-Encoding: "+encoding+this.CRLF;
		if (disposition != null)
			part += "Content-Disposition: "+disposition+this.CRLF;
		if (description != null)
			part += "Content-Description: "+description+this.CRLF;
		part += this.CRLF + str;
		this.addStringToStream(part);
	},

	addLiteralPart: function(str)
	{
		var part = "";
		if (this.multiPart)
			part = this.CRLF + "--" + this.boundaryString+this.CRLF;
		part+=str; // do we need another CRLF here? PROBABLY NOT.
		this.addStringToStream(part);
	},
	addLiteral: function(str)
	{
		this.addStringToStream(str);
	},

	addBase64String: function(str,contentType,disposition, prefs)
	{
		var uChars = false;
		// NOTE: the str must be canonicalized from LF to CRLF
		// but JavaScript doesn't support Lookbehind /(?<!a)\n/g
		// but we can fake it with /([^\r])(?=\n)/g

		// TODO: deal with excessively long octet strings
		// without CRLF. But most mail clients seem to
		// handle...
		if (/[^\n]{999,}/.test(str))
		{
			// this forces base64 encoding, because we don't
			// want to deal with adding line breaks
			uChars = "us-ascii";
		}
		if (str.charAt(0) == "\n")
		{
			str = this.CRLF +
			str.substring(1).replace(/([^\r])(?=\n)/g,"$1\r");
		}
		else
		{
			str = str.replace(/([^\r])(?=\n)/g,"$1\r");
		}
		// now must turn Unicode into UTF-8. Fortunately,
		// there's a shortcut (from a coding standpoint;
		// sadly, it is not efficient) compare
		// decodeURIComponent(escape(
		//		unescape(encodeURIComponent("TEXT"))))
		/*for (var i = 0; i < str.length; i++)
		{
			if (str.charCodeAt(i) > 0xFF)
			{
				str = unescape(encodeURIComponent(str));
				uChars = "UTF-8";
				break;

			}
			else if (str.charCodeAt(i) > 0x7F)
			{
				// we can still get away with this because of
				// the identity transformation 0x80-0xFF
				uChars = "ISO-8859-1";
			}
		}*/

        //FireGPG: Force utf8
        str = unescape(encodeURIComponent(str));
		uChars = "UTF-8";


		var part="";
		if (this.multiPart)
		{
			// NOTE: SHOULD include leading CRLF in most cases, but we know
			part += "--"+this.boundaryString+this.CRLF;
		}
		// that this CRLF does not count because it's at the front of the stream in Gmail S/MIME.
		// examine
		if (contentType != null)
		{
			part += "Content-Type: "+contentType;
			if (uChars)
			{
				// ARGH! signText appears to only take ASCII
				// characters! So, we have to base64 it.
				part += "; charset=" +
					uChars + "\r\nContent-Transfer-Encoding: base64";
				str = btoa(str);
				str = FireGPG.Mime.breakLines(str);
			}
			part += this.CRLF;
		}
		if (disposition != null)
			part += "Content-Disposition: "+ disposition +this.CRLF;
		part += this.CRLF + str;





		this.addStringToStream(part);
	},

	makeRFC2047: function(s)
	{
		for (var i = 0; i < s.length; i++)
		{
			if (s.charCodeAt(i) > 0x7F)
			{
				return "=?utf-8?B?" + btoa(unescape(encodeURIComponent(s))) + "?=";
			}
		}
		return s;
	},

	/**
	 * @function addFilePair adds an attachment, specifies an encoding to use for that attachment, and specifies the disposition of the attachment.
	 * @param disposition: Valid values are defined in RFC2183. Namely, "inline" and "attachment".
	 * @param attachment: Any abstract attachment Object that is supported by this implementation. Valid values are:
	 *   nsIFile [partial support]
	 *   nsILocalFile
	 *   XMLHttpRequest (in this version, must already be processed with status code 200 OK)
	 *     TODO: check to see if contentType (inferred from Gmail HTML etc.) differs from the headers returned by the actual mail service HTTP request
	 *   nsIHttpChannel
	 *   [TODO:] nsIChannel (infer filename from URI)
	 *   String -> treated as nsILocalFile
	 */
	addFilePair: function(disposition, attachment, encoding)
	{
		var file;
		if (typeof(attachment) == "string") {
			file = Components.classes["@mozilla.org/file/local;1"].
			createInstance(Components.interfaces.nsILocalFile);
			try
			{
				file.initWithPath(attachment);
			}
			// if the fileName is spurious, then just don't try to add the file
			catch (e)
			{
				if (e.result === 0x80520001) return; // NS_ERROR_FILE_UNRECOGNIZED_PATH
				else throw e;
			}
		}
		else if (typeof(attachment) == "object")
		{
			if (attachment instanceof XMLHttpRequest)
			{
				if (attachment.status != 200) return false;
				var cD = new String(attachment.getResponseHeader("Content-Disposition"));
				cD.semicolon = cD.indexOf(";");
				cD.type = (cD.semicolon == -1) ? cD : cD.substring(0,cD.semicolon);
				if (cD.semicolon == -1 || (cD.fnpos = cD.indexOf("filename=")) == -1) cD.filename = null;
				else
				{
					// cd.filename should already be RFC 2047-compliant
					cD.filename = cD.substring((cD.q = cD[cD.fnpos+9] == "\"") ? cD.fnpos+10 : cD.fnpos+9);
					cD.filename = cD.filename.substring(0, cD.q ? cD.filename.indexOf("\"") : cD.filename.search(/\s/));
				}
				var cT = new String(attachment.getResponseHeader("Content-Type"));
				cT.semicolon = cT.indexOf(";");
				cT.type = (cT.semicolon == -1) ? cT : cT.substring(0,cT.semicolon);
				cT.type += ";"+this.CRLF+
				 "\tname=\""+ cD.filename +"\"";
				this.addFilePairFromString(attachment.responseText,cD.filename,cT.type, cD.type, encoding)
				return true;
			}
			else if ("channel" in attachment && "data" in attachment && attachment.channel instanceof Components.interfaces.nsIHttpChannel) // this is modified with a .data attached.
			{
				var cD = new String(attachment.channel.getResponseHeader("Content-Disposition"));
				cD.semicolon = cD.indexOf(";");
				cD.type = (cD.semicolon == -1) ? cD : cD.substring(0,cD.semicolon);
				if (cD.semicolon == -1 || (cD.fnpos = cD.indexOf("filename=")) == -1) cD.filename = null;
				else
				{
					// cd.filename should already be RFC 2047-compliant
					cD.filename = cD.substring((cD.q = cD[cD.fnpos+9] == "\"") ? cD.fnpos+10 : cD.fnpos+9);
					cD.filename = cD.filename.substring(0, cD.q ? cD.filename.indexOf("\"") : cD.filename.search(/\s/));
				}
				var cT = new String(attachment.channel.getResponseHeader("Content-Type"));
				cT.semicolon = cT.indexOf(";");
				cT.type = (cT.semicolon == -1) ? cT : cT.substring(0,cT.semicolon);
				cT.type += ";"+this.CRLF+
				 "\tname=\""+ cD.filename +"\"";

				str = this.CRLF + "--" + this.boundaryString + this.CRLF;
				str += "Content-Transfer-Encoding: "+encoding+ this.CRLF;
				str += "Content-Disposition: "+cD.type+";" + this.CRLF + "\tfilename=\"" +
					this.makeRFC2047(cD.filename) + "\"" + this.CRLF;
				str += "Content-Type: " + cT.type + this.CRLF + this.CRLF;

				str += FireGPG.Mime.breakLines(btoa(attachment.data));
				this.addStringToStream(str);
				return true;
			}
			else if (!(attachment instanceof Components.interfaces.nsIFile)) return false;
			file = attachment;
		}
		var contentType = "";

		var mimeService =
		Components.classes["@mozilla.org/mime;1"].
		getService(Components.interfaces.nsIMIMEService);
		try
		{
			contentType = mimeService.getTypeFromFile(file);
		}
		catch (e)
		{
			// common throw: 0x80040111 NS_ERROR_NOT_AVAILABLE
			contentType = "application/octet-stream";
		}
		contentType += ";"+this.CRLF+
		"\tname=\""+ this.makeRFC2047(file.leafName) +"\"";
		var fileInputStream=
		Components.classes["@mozilla.org/network/file-input-stream;1"].
		createInstance(Components.interfaces.nsIFileInputStream);

		fileInputStream.init(file,0x01,0600,fileInputStream.CLOSE_ON_EOF);
		var buffer =
		Components.classes["@mozilla.org/network/buffered-input-stream;1"].
			createInstance(Components.interfaces.nsIBufferedInputStream);
			buffer.init(fileInputStream,8192);
			this.addFilePairFromStream(buffer,file.leafName,contentType,disposition,null,encoding);
		return true;
	},

	// Get stream without the multipart dividers or extra header,
	// used for once off
	// encoding of single parts.
	getSinglePartStream: function()
	{
		return this.multipartStream;
	},

	getMultipartStream: function(multipartType,isLengthRequired)
	{
		this.addStringToStream(this.CRLF + "--" + this.boundaryString + "--" + this.CRLF);
		var mimeStream =
		Components.classes["@mozilla.org/network/mime-input-stream;1"].
		createInstance(Components.interfaces.nsIMIMEInputStream);
		mimeStream.addContentLength = isLengthRequired;
		mimeStream.addHeader("Content-Type",
							 multipartType+"; boundary=\""+this.boundaryString + "\"");
		mimeStream.setData(this.multipartStream);
		return mimeStream;
	},

	streamFromString: function(str,file,fstream)
	{
		var foStream =
		Components.classes["@mozilla.org/network/file-output-stream;1"]
		.createInstance(Components.interfaces.nsIFileOutputStream);
		// write, create, truncate
		foStream.init(file, 0x02 | 0x08 | 0x20, 0664, 0);

		var binOutStream = Components.classes[
											  "@mozilla.org/binaryoutputstream;1"].
		createInstance(Components.interfaces.nsIBinaryOutputStream);
		binOutStream.setOutputStream(foStream);
		for (var i=0;i<str.length;i++)
		{
			binOutStream.write8(str.charCodeAt(i) & 0xFF);
		}

		binOutStream.close();
		// Does previous close do this? XXX
		foStream.close();

		fstream.init(file, 1, 0, false);

		var bufStream =
		Components.classes["@mozilla.org/network/buffered-input-stream;1"]
		.createInstance(Components.interfaces.nsIBufferedInputStream);
		bufStream.init(fstream, 512);

		return bufStream;
	},

	upload: function(url,referer,targetName,tmpfile,tmpfilestream)
	{
		var ioService = Components.classes["@mozilla.org/network/io-service;1"]
		.getService(Components.interfaces.nsIIOService);

		var contentType = null;

		var uri		= ioService.newURI(url,null,null);
		var referrerUri		= ioService.newURI(referer,null,null);

		ioChannel = ioService.newChannelFromURI(uri);
		var httpChannel =
		ioChannel.QueryInterface(
								 Components.interfaces.nsIHttpChannel
								 );
		httpChannel.requestMethod = "POST";
		httpChannel.setRequestHeader("Referer",referer,false);
		var uploadChannel =
		httpChannel.QueryInterface(Components.interfaces.nsIUploadChannel);
		uploadChannel.
		setUploadStream(
						this.getMultipartStream("multipart/form-data",true),
						contentType,-1);

		httpChannel.requestMethod = "POST";
		httpChannel.setRequestHeader("Referer",referer,false);

		uploadChannel.
		asyncOpen(
				  {
				  onStartRequest: function(request, context)
				  {
						  //		  alert("Started upload");
				  },
				  onStopRequest: function(request, context, status, errorMsg)
				  {
						//alert("Finished upload");
					  tmpfilestream.close();
					  tmpfile.remove(false);
				  },
				  onDataAvailable: function(request, context, inStream, offset, count)
				  {
				  }
				  }
				  , null);
	},

	init: function(multiPart,partNum)
	{
		// the boundary string should be unique, especially if
		// one forwards and encapsulates previous messages generated
		// with Gmail S/MIME. A good approximation is to use a nonce-like value,
		// but one that is a little bit different from non-encrypted values,
		// like the Message-ID.
		this.boundaryString = "firegpg" + FireGPG.Const.VersionA + "eq" + (Math.round(Math.random()*99)+(new Date()).getTime()).toString(36) +
		(99+Math.round(46656*46656*46635*36*Math.random())).toString(36) +
		+partNum;
		this.multiPart = multiPart;
		this.multipartStream=
		Components.classes["@mozilla.org/io/multiplex-input-stream;1"].
		createInstance(Components.interfaces.nsIMultiplexInputStream);
	}
}; // end FireGPG.Mime.Encoder class