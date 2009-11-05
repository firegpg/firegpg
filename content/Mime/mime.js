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

//Generic mime usefull function

/**
 * This function converts an rfc822-style address line, such as:
 *     Joe User <joe.user@someplace.com>
 *	or
 *     "One \"Two\" Three" <cyz9+nospam@x.com> (Useless Comment), intradomain, interdomain@spartan.com
 *   to an array of e-mail addresses.
 * TODO: make this function vigorous and robust. Find complex parsing algorithms, or do it yourself
 * piecemeal (as opposed to using a regexp).
 */
FireGPG.Mime.convertAddressLineToArray = function(line)
{
	function trim(g)
	{
		g = g.replace( /^\s+/g, "" ); // leading
		return g.replace( /\s+$/g, "" ); // trailing
	}

    if (line == undefined) {
        FireGPG.debug("Undefined line in FireGPG.Mime.convertAddressLineToArray, return '' anyways", 'FireGPG.Mime.convertAddressLineToArray',  true);
        return "";
        }

	var a = new Array();
	//var j = 0;
	var t = line.split(",");	// split by comma
	for (var i = 0; i < t.length; i++)
	{
		var at = t[i].indexOf("@");
		if (at == -1) continue;
		var lt = t[i].indexOf("<");
		var gt = t[i].indexOf(">");
		if (lt == -1 && gt == -1)
		{
			t[i] = trim(t[i]);
			at = t[i].indexOf("@");
			if (at <= 0 || at == (t[i].length - 1)) // -1 should never happen
				continue;
			else
				a.push(t[i]);
		}
		if (lt < gt)
		{
			t[i] = trim(t[i].substring(lt+1,gt));
			at = t[i].indexOf("@");
			if (at <= 0 || at == (t[i].length - 1))
				continue;
			else
				a.push(t[i]);
		}
	}
	return a;
} // end function convertAddressToArray

/**
 * This function splits lines into 76-character chunks. This is useful
 * for stuffing base64 into an rfc822 message.
 */
FireGPG.Mime.breakLines = function(t)
{
	// this appears to be the fastest--slightly faster than array.join("\r\n") (because it takes a little bit of time to compose the array, too);
	theresult = t.replace(/[\s\S]{76}/g,"$&\r\n");
	return theresult;
}

FireGPG.Mime.stUtil =
{
/**
	 * Make an RFC 2047-compliant string by escaping the extended characters
	 * with UTF-8.
	 */
	makeRFC2047: function makeRFC2047(x)
	{
		// using quoted-printable because it gives a little hint as to the contents
		// whereas base64 is pretty obfuscated
		function qp(x)
		{
			var y = "", z = 0;
			for (var i = 0; i < x.length; i++)
			{ // we assume all are < 256
				z = x.charCodeAt(i);
				if (z < 16)
				{
					y += "=0" + z.toString(16);
				}
				else if (z < 32 || z > 126)
				{
					y += "=" + z.toString(16);
				}
				else
				{
					y += x.charAt(i);
				}
			}
			return y;
		}
		// sets the subject of the Msg to be RFC-2047 compliant.
		for (var i = 0; i < x.length; i++)
		{
			if (x.charCodeAt(i) > 0x7F)
				return "=?UTF-8?Q?" + qp(unescape(encodeURIComponent(x))) + "?=";
		}
		return x;
	},

	/**
	 * Return a Unicode string from an RFC 2047-compliant string by unescaping the characters. This function
	 * assumes that there are no extraneous spaces or newlines (\r\n) in the string entity.
	 * @param x a string containing RFC 2047-encoded data. typeof(x) must be "string".
	 */
	fromRFC2047: function fromRFC2047(x)
	{
		// turns quoted-printable back into the original source (e.g., UTF-8)
		// TODO: at present, this function passes the high-order bit (8-bit) through. This may be undesirable.
		function pq(x)
		{
			var y = "";
			for (var i=0;i<x.length;i++)
			{
				if (x[i] === "=")
				{
					y += String.fromCharCode(parseInt(x.substring(i+1,i+3),16));
					i += 2; // two additional characters consumed
				}
				else y += x[i];
			}
			return y;
		}
		if (x.substring(0,2) !== "=?") return x;
		var charsete = x.indexOf("?", 2);
		if (charsete == -1) return "";
		var encodinge = x.indexOf("?", charsete+1);
		if (encodinge == -1 || (encodinge - charsete) != 2) return "";
		var encodedtexte = x.indexOf("?=", encodinge+1);
		if (encodedtexte == -1) return "";

		var charset = x.substring(2,charsete);

		var encoding = x.substring(charsete+1,encodinge);
		if (encoding !== "Q" && encoding !== "B") return "";

		var decodedtext = (encoding === "Q") ? pq(x.substring(encodinge+1,encodedtexte)) : atob(x.substring(encodinge+1,encodedtexte));

		if (charset.toLowerCase() === "iso-8859-1") return decodedtext;
		else if (charset.toLowerCase() === "utf-8") return decodeURIComponent(escape(decodedtext));
		else
		{
			jsdump("RFC2047 charset not supported!!!!!");
			debugger;
			return "";
		}
	},

    	addClassName: function addClassName(el, name)
	{
		if (!el.className) return null;
		var a = el.className.split(" ");
		for (var i = 0; i < a.length; i++)
		{
			// this is a case-sensitive implementation
			if (a[i] == name) return el.className;
		}
		a.push(name);
		el.className = a.join(" ");
		return el.className;
	},

	removeClassName: function removeClassName(el, name)
	{
		if (!el.className) return null;
		var a = el.className.split(" ");
		for (var i = 0; i < a.length; i++)
		{
			// this is a case-sensitive implementation
			if (a[i] == name)
			{
				a.splice(i,1);
				el.className = a.join(" ");
				return el.className;
			}
		}
		return el.className;
	},

}