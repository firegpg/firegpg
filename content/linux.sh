#!/bin/sh
#
# This is a part of FireGPG.
#
# Syntax: linux.sh <program_name> <output_file> [arguments]
#

prog="$1"; shift
out="$1"; shift
arg="$@"

echo "$prog $arg > $out"

$prog $arg > $out
