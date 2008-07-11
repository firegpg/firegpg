/*
 * MAKEMAKE.CMD for OS/2
 *
 * REXX script to make Makefile from Makefile.in in OS/2
 *
 * Usage: 
 * MAKEMAKE.CMD [/R] [ObjDir]
 * 
 * /R:     create Makefiles recursively in all subdirectories
 * ObjDir: should correspond to the MOZ_OBJDIR parameter of 
 *         your .mozconfig, if defined
 *
 */
call RxFuncAdd 'SysLoadFuncs', 'RexxUtil', 'SysLoadFuncs'
call SysLoadFuncs

PARSE ARG ObjDir;

if ObjDir = '' then do
   Makelist.0 = 1;
   Makelist.1 = 'Makefile.in';
   ObjDir = '';
end
else do
   Switch = SUBWORD(ObjDir, 1, 1);
   ObjDir = SUBWORD(ObjDir, 2, 1);
   if (Switch = '/r') | (Switch = '/R') then do
      CALL SysFileTree 'Makefile.in', 'Makelist', 'FSO'
   end /* do */
   else do
      Makelist.0 = 1;
      Makelist.1 = 'Makefile.in';
      ObjDir = Switch;
   end /* do */
end

/*
 * Check if ObjDir is correct
 */
CurDir = DIRECTORY();
if ObjDir \= '' then do
   ObjDir = DIRECTORY(ObjDir);
   if ObjDir = '' then
      SIGNAL Usage
   SAY 'ObjDir:' ObjDir
end /* if ObjDir */

/*
 * Find TOPSRCDIR (usally x:/Mozilla)
 */
TopSrcDir = DIRECTORY(CurDir);

DO WHILE (TopSrcDir \= '') & (FILESPEC('name', TopSrcDir) \= 'mozilla')
   TopSrcDir = DIRECTORY(..);
end /* do */

TopSrcDir = TRANSLATE(TopSrcDir, '/', '\');
n = LENGTH(TopSrcDir);
CALL DIRECTORY CurDir

/*
 * Create Makefile
 */
'@ECHO OFF'
do i = 1 to Makelist.0
   SAY Makelist.i
   SrcDir = FILESPEC('path', Makelist.i);
   Drive = FILESPEC('drive', Makelist.i);
   SrcDir = STRIP(Drive||SrcDir,'T','\');
   SrcDir = DIRECTORY(SrcDir);

   ObjMake = 'Makefile';
   if ObjDir \= '' then do
      RelDir = SUBSTR(SrcDir, n+1);
      ObjMake = ObjDir||RelDir'\Makefile';
      CALL SysMkDir ObjDir||RelDir;
   end /* do */
   SAY ObjMake

   SrcDir = TRANSLATE(SrcDir, '/', '\');

   'sed.exe -e "s,@top_srcdir@,'TopSrcDir',g" -e "s,@srcdir@,'SrcDir',g" Makefile.in > 'ObjMake

   SAY 'srcdir:' SrcDir
   SAY 'topsrcdir:' TopSrcDir
   SAY
end /* do 1 to Makelist.0 ... */

CALL DIRECTORY CurDir

EXIT 0;

Usage:
SAY 'Usage: MAKEMAKE.CMD [/R] [ObjDir]'
EXIT 1;

