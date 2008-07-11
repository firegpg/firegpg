@echo off
rem ############################################################
rem # This is a part of FireGPG.
rem #
rem # Syntax: run.bat <program_name> <output_file> [arguments]
rem ############################################################

set boucle=1

set arg=

:continue

if ""%1""=="""" goto fin

if "%boucle%"=="1" goto prog
if "%boucle%"=="2" goto output
set arg=%arg% %1
goto sht
:prog
set prog=%1
set boucle=2
goto sht
:output
set output=%1
set boucle=3
goto sht
:sht
shift
goto continue
:fin

set prog=%prog:~2,-2%
set output=%output:~2,-2%


call "%prog%" %arg% > "%output%"
