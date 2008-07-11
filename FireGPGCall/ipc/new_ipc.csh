#!/bin/csh

if ($# != 2) then
  echo 'Usage: new_ipc.csh <old-version> <new-version>'
  exit -1
endif

set files = (build/Makefile.in build/install.js build/nsIPCModule.h)

echo "IPC: $1 --> $2? (y/n)"

set confirm=$<

if (($confirm != "y") && ($confirm != "Y")) then
  echo "Cancelled"
  exit -1
endif

echo globsub Version $1 $2 build/ipc.spec
globsub Version $1 $2 build/ipc.spec

echo globsub $1 $1 $2 $files
globsub $1 $1 $2 $files
