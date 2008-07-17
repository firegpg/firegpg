#!/bin/bash
for i in *.idl
do
/opt/gecko-sdk/bin/xpidl -m typelib -I /opt/gecko-sdk/idl -I /usr/share/idl/xulrunner-1.9/unstable/ $i
done
