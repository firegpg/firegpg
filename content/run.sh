#!/bin/sh
#
# This is a part of FireGPG.
#
# Syntax: run.sh <program_name> <output_file> [arguments]
#

prog="$1"; shift
out="$1"; shift

$prog "$@" > $out
