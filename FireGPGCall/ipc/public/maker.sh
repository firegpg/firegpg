#!/bin/bash
for i in *.idl
do
/opt/xulrunner-sdk/bin/xpidl -m typelib -I /opt/sgecko-sdk/idl -I /usr/share/idl/xulrunner-1.9/unstable/ $i


/opt/xulrunner-sdk/bin/xpidl -m header -I /opt/sgecko-sdk/idl -I /usr/share/idl/xulrunner-1.9/unstable/ $i
done
