Compiling ipccode
*****************

To compile ipccode, follow these steps:
1. Compile a complete Firefox build
2. Copy the ipcode directory into src/mozilla/extensions
3. cd to src/mozilla/extensions/ipccode
4. execute: ./makemake -r
5. cd to @MOZ_OBDIR@/mozilla/extensions/ipccode and execute "make"

Notes
*****
makemake cannot handle symbolic links, you need to cd to the real directory
of your source code.
makemake tries to read your .mozconfig file to determine @MOZ_OBJDIR@. You can
alternatively provide your own MOZ_OBJDIR using makemake -o
