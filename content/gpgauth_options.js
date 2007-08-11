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

function ToggleGpgAuthPref( item ) {
	var prefs = Components.classes["@mozilla.org/preferences-service;1"].
			getService(Components.interfaces.nsIPrefService);
	prefs = prefs.getBranch("extensions.firegpg.gpgauth.domain_options.");
	var pref_list = prefs.getChildList("", {});
	var setting = ! prefs.getBoolPref( item.getAttribute( "name" ) );
	prefs.setBoolPref( item.getAttribute( "value" ), setting );
	item.setAttribute( "checked", setting ? "true" : "false" );
}
