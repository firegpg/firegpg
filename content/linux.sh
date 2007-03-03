#!/bin/sh


prog=$1

shift

out=$1

shift

arg=$*

$prog $arg > $out
