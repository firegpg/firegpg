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
Function: getIgnored_servers
This function have to be documented.
*/
function getIgnored_servers( parent ) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
			getService(Components.interfaces.nsIPrefService);
	prefs = prefs.getBranch("extensions.firegpg.gpgauth.domain_options.");
	var pref_list = prefs.getChildList("", {});
	pref_list.sort()
	// Create an object to assign friendly names to their ugly counterpart.
	var friendly_names = new Object();
	friendly_names[ 'allow_keyring' ] = "Allow access to GPG keyring";
	friendly_names[ 'ignore_not_trusted' ] = "Ignore if key not trusted in GPG Keyring";
	friendly_names[ 'ignore_server_keyerror' ] = "Ignore if key not found in GPG Keyring";
	var preferences = document.getElementById( "preferences_gpgauth" );
	for ( var pref in pref_list ) {
		var listitem = document.createElement( "listitem" );
		listitem.setAttribute( 'disabled', false );
		listitem.setAttribute( 'allowevents', true );
		listitem.setAttribute( 'type', "checkbox" );
		var listcell = document.createElement( "listcell" );
		listcell.setAttribute( 'label', pref_list[ pref ].substring( 0, pref_list[ pref ].lastIndexOf( "." ) ) );
		listitem.appendChild( listcell );
		listcell = document.createElement( "listcell" );
		var pref_name = pref_list[ pref ].substring( pref_list[ pref ].lastIndexOf( "." ) + 1, pref_list[ pref ].length );
		listcell.setAttribute( 'label', friendly_names[ pref_name ] );
		listitem.appendChild( listcell );
		listcell = document.createElement( "listcell" );
		listcell.setAttribute( 'type', "checkbox" );
		listcell.setAttribute( 'value', pref_list[ pref ] );
		listcell.setAttribute( 'name', pref_list[ pref ] );
		listcell.setAttribute( 'disabled', false );
		listcell.setAttribute( 'checked', prefs.getBoolPref( pref_list[ pref ] ) );
		listcell.setAttribute( "onclick", 'ToggleGpgAuthPref( event.target );' );
		listitem.appendChild( listcell );
		parent.appendChild( listitem );
	}
}

/*
Function: ToggleGpgAuthPref
This function have to be documented.
*/
function ToggleGpgAuthPref( item ) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
			getService(Components.interfaces.nsIPrefService);
	prefs = prefs.getBranch("extensions.firegpg.gpgauth.domain_options.");
	var pref_list = prefs.getChildList("", {});
	var setting = ! prefs.getBoolPref( item.getAttribute( "name" ) );
	prefs.setBoolPref( item.getAttribute( "value" ), setting );
	item.setAttribute( "checked", setting ? "true" : "false" );
}
