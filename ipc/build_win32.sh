#!/bin/sh
name=firegpg
MOZBUILD=${MOZBUILD:-$HOME/src/mozilla-beta/obj-ff-release}

cd `dirname $0`
IPC=`pwd`

rm -rf $MOZBUILD/../extensions/$name-ipc
cp -r $IPC/$name-ipc $MOZBUILD/../extensions/$name-ipc


cd $MOZBUILD
../build/autoconf/make-makefile extensions/$name-ipc
cd $MOZBUILD/extensions/$name-ipc
make

#install
COMPONENTS=$IPC/components/
mkdir -p $COMPONENTS
cp ../../dist/bin/components/${name}_ipc.dll $COMPONENTS
cp ../../dist/bin/components/${name}_ipc.xpt $COMPONENTS
