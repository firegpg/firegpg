#!/bin/sh
mkdir -p docs
exec naturaldocs -i . -o HTML documentation -p .
