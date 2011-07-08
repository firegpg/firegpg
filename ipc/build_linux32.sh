#!/bin/bash
name=firegpg
MOZBUILD=$HOME/src/mozilla-beta/obj-ff-release

cd `dirname $0`
IPC=`pwd`

ln -sf $IPC/$name-ipc $MOZBUILD/../extensions/$name-ipc

cd $MOZBUILD
../build/autoconf/make-makefile extensions/$name-ipc
cd $MOZBUILD/extensions/$name-ipc
make

#install
COMPONENTS=$IPC/components/
mkdir -p $COMPONENTS
cp ../../dist/bin/components/lib${name}_ipc.so $COMPONENTS/lib${name}_ipc.32.so
strip $COMPONENTS/lib${name}_ipc.32.so
cp ../../dist/bin/components/${name}_ipc.xpt $COMPONENTS
