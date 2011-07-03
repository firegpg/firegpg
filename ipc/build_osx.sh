#!/bin/bash
name=firegpg
MOZBUILD=$HOME/src/mozilla-beta/obj-x86_64-apple-darwin10.6.0

cd `dirname $0`
IPC=`pwd`

rm -rf $MOZBUILD/../extensions/$name-ipc
cp -r $IPC/$name-ipc $MOZBUILD/../extensions/$name-ipc

arch=i386
cd $MOZBUILD/$arch
../../build/autoconf/make-makefile extensions/$name-ipc
cd $MOZBUILD/$arch/extensions/$name-ipc
make

arch=x86_64
cd $MOZBUILD/$arch
../../build/autoconf/make-makefile extensions/$name-ipc
cd $MOZBUILD/$arch/extensions/$name-ipc
make

COMPONENTS=$IPC/components/
mkdir -p $COMPONENTS

lipo -create \
 -arch i386 $MOZBUILD/i386/dist/bin/components/lib${name}_ipc.dylib \
 -arch x86_64 $MOZBUILD/x86_64/dist/bin/components/lib${name}_ipc.dylib \
 -output $COMPONENTS/lib${name}_ipc.dylib

cp ../../dist/bin/components/${name}_ipc.xpt $COMPONENTS
