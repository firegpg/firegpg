#!/bin/sh
name=firegpg
MOZBUILD=$HOME/src/mozilla-beta/ff-opt

cd `dirname $0`

IPC=`pwd`

rm -rf $MOZBUILD/../extensions/$name-ipc
cp -r $IPC/$name-ipc $MOZBUILD/../extensions/$name-ipc


cd $MOZBUILD
../build/autoconf/make-makefile extensions/$name-ipc
cd $MOZBUILD/extensions/$name-ipc
make

COMPONENTS=$IPC/components/
mkdir -p $COMPONENTS
cp ../../dist/bin/components/${name}_ipc.dll $COMPONENTS
cp ../../dist/bin/components/${name}_ipc.xpt $COMPONENTS
