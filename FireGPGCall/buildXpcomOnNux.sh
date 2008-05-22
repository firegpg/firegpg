#!/bin/bash

#Clean
make clean

#Create the descriptor
/opt/gecko-sdk/bin/xpidl -m typelib -I /opt/gecko-sdk/idl  IFireGPGCall.idl
# Create the header
/opt/gecko-sdk/bin/xpidl -m header -I /opt/gecko-sdk/idl  IFireGPGCall.idl

#Complie the .so
make

#Place files
cp FireGPGCall.so ../components/
cp IFireGPGCall.xpt ../components/
