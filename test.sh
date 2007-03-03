#!/bin/sh
export MOZ_NO_REMOTE=1
exec firefox -P Tests -console -jsconsole -chrome chrome://firebug/content/firebug.xpi
