#!/bin/sh
mkdir -p documentation
exec naturaldocs -i . -o HTML documentation -p .
