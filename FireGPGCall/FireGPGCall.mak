GECKO_SDK_PATH= C:\gecko-sdk
!IF "$(CFG)" == ""
CFG=FireGPGCall - Win32 Debug
!MESSAGE No configuration specified. Defaulting to FireGPGCall - Win32 Debug.
!ENDIF

!IF "$(CFG)" != "FireGPGCall - Win32 Release" && "$(CFG)" != "FireGPGCall - Win32 Debug"
!MESSAGE Invalid configuration "$(CFG)" specified.
!MESSAGE You can specify a configuration when running NMAKE
!MESSAGE by defining the macro CFG on the command line. For example:
!MESSAGE
!MESSAGE NMAKE /f "FireGPGCall.mak" CFG="FireGPGCall - Win32 Debug"
!MESSAGE
!MESSAGE Possible choices for configuration are:
!MESSAGE
!MESSAGE "FireGPGCall - Win32 Release" (based on "Win32 (x86) Dynamic-Link Library")
!MESSAGE "FireGPGCall - Win32 Debug" (based on "Win32 (x86) Dynamic-Link Library")
!MESSAGE
!ERROR An invalid configuration is specified.
!ENDIF

!IF "$(OS)" == "Windows_NT"
NULL=
!ELSE
NULL=nul
!ENDIF

!IF  "$(CFG)" == "FireGPGCall - Win32 Release"

OUTDIR=.\Release
INTDIR=.\Release
# Begin Custom Macros
OutDir=.\Release
# End Custom Macros

ALL : "$(OUTDIR)\FireGPGCall.dll" "$(OUTDIR)\FireGPGCall.bsc"


CLEAN :
	-@erase "$(INTDIR)\FireGPGCall.obj"
	-@erase "$(INTDIR)\FireGPGCall.sbr"
	-@erase "$(INTDIR)\FireGPGCallModule.obj"
	-@erase "$(INTDIR)\FireGPGCallModule.sbr"
	-@erase "$(INTDIR)\vc60.idb"
	-@erase "$(OUTDIR)\FireGPGCall.bsc"
	-@erase "$(OUTDIR)\FireGPGCall.dll"
	-@erase "$(OUTDIR)\FireGPGCall.exp"
	-@erase "$(OUTDIR)\FireGPGCall.lib"

"$(OUTDIR)" :
    if not exist "$(OUTDIR)/$(NULL)" mkdir "$(OUTDIR)"

CPP=cl.exe
CPP_PROJ=/nologo /MD /W3 /O1 /I "$(GECKO_SDK_PATH)\include" /FI"$(GECKO_SDK_PATH)\include\mozilla-config.h" /D "NDEBUG" /D "WIN32" /D "_WINDOWS" /D "_MBCS" /D "_USRDLL" /D "XPCOM_GLUE" /FR"$(INTDIR)\\" /Fp"$(INTDIR)\FireGPGCall.pch" /YX /Fo"$(INTDIR)\\" /Fd"$(INTDIR)\\" /FD /c

.c{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

.cpp{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

.cxx{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

.c{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

.cpp{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

.cxx{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

MTL=midl.exe
MTL_PROJ=/nologo /D "NDEBUG" /mktyplib203 /win32
RSC=rc.exe
BSC32=bscmake.exe
BSC32_FLAGS=/nologo /o"$(OUTDIR)\FireGPGCall.bsc"
BSC32_SBRS= \
	"$(INTDIR)\FireGPGCall.sbr" \
	"$(INTDIR)\FireGPGCallModule.sbr"

"$(OUTDIR)\FireGPGCall.bsc" : "$(OUTDIR)" $(BSC32_SBRS)
    $(BSC32) @<<
  $(BSC32_FLAGS) $(BSC32_SBRS)
<<

LINK32=link.exe
LINK32_FLAGS=kernel32.lib user32.lib gdi32.lib winspool.lib comdlg32.lib advapi32.lib shell32.lib ole32.lib oleaut32.lib uuid.lib odbc32.lib odbccp32.lib nspr4.lib plds4.lib plc4.lib xpcomglue.lib shlwapi.lib /nologo /dll /incremental:no /pdb:"$(OUTDIR)\FireGPGCall.pdb" /machine:I386 /out:"$(OUTDIR)\FireGPGCall.dll" /implib:"$(OUTDIR)\FireGPGCall.lib" /libpath:"$(GECKO_SDK_PATH)\lib"
LINK32_OBJS= \
	"$(INTDIR)\FireGPGCall.obj" \
	"$(INTDIR)\FireGPGCallModule.obj"

"$(OUTDIR)\FireGPGCall.dll" : "$(OUTDIR)" $(DEF_FILE) $(LINK32_OBJS)
    $(LINK32) @<<
  $(LINK32_FLAGS) $(LINK32_OBJS)
<<

TargetPath=.\Release\FireGPGCall.dll
SOURCE="$(InputPath)"

# Begin Custom Macros
OutDir=.\Release
# End Custom Macros

!ELSEIF  "$(CFG)" == "FireGPGCall - Win32 Debug"

OUTDIR=.\Debug
INTDIR=.\Debug
# Begin Custom Macros
OutDir=.\Debug
# End Custom Macros

ALL : "$(OUTDIR)\FireGPGCall.dll" "$(OUTDIR)\FireGPGCall.bsc"


CLEAN :
	-@erase "$(INTDIR)\FireGPGCall.obj"
	-@erase "$(INTDIR)\FireGPGCall.sbr"
	-@erase "$(INTDIR)\FireGPGCallModule.obj"
	-@erase "$(INTDIR)\FireGPGCallModule.sbr"
	-@erase "$(INTDIR)\vc60.idb"
	-@erase "$(INTDIR)\vc60.pdb"
	-@erase "$(OUTDIR)\FireGPGCall.bsc"
	-@erase "$(OUTDIR)\FireGPGCall.dll"
	-@erase "$(OUTDIR)\FireGPGCall.exp"
	-@erase "$(OUTDIR)\FireGPGCall.ilk"
	-@erase "$(OUTDIR)\FireGPGCall.lib"
	-@erase "$(OUTDIR)\FireGPGCall.pdb"

"$(OUTDIR)" :
    if not exist "$(OUTDIR)/$(NULL)" mkdir "$(OUTDIR)"

CPP=cl.exe
CPP_PROJ=/nologo /MDd /W3 /Gm /ZI /Od /I "$(GECKO_SDK_PATH)\include"  /FI"$(GECKO_SDK_PATH)\include\mozilla-config.h" /D "_DEBUG" /D "WIN32" /D "_WINDOWS" /D "_MBCS" /D "_USRDLL" /D "XPCOM_GLUE" /FR"$(INTDIR)\\" /Fp"$(INTDIR)\FireGPGCall.pch" /YX /Fo"$(INTDIR)\\" /Fd"$(INTDIR)\\" /FD /GZ /c

.c{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

.cpp{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

.cxx{$(INTDIR)}.obj::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

.c{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

.cpp{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

.cxx{$(INTDIR)}.sbr::
   $(CPP) @<<
   $(CPP_PROJ) $<
<<

MTL=midl.exe
MTL_PROJ=/nologo /D "_DEBUG" /mktyplib203 /win32
RSC=rc.exe
BSC32=bscmake.exe
BSC32_FLAGS=/nologo /o"$(OUTDIR)\FireGPGCall.bsc"
BSC32_SBRS= \
	"$(INTDIR)\FireGPGCall.sbr" \
	"$(INTDIR)\FireGPGCallModule.sbr"

"$(OUTDIR)\FireGPGCall.bsc" : "$(OUTDIR)" $(BSC32_SBRS)
    $(BSC32) @<<
  $(BSC32_FLAGS) $(BSC32_SBRS)
<<

LINK32=link.exe
LINK32_FLAGS=kernel32.lib user32.lib gdi32.lib winspool.lib comdlg32.lib advapi32.lib shell32.lib ole32.lib oleaut32.lib uuid.lib odbc32.lib odbccp32.lib nspr4.lib plds4.lib plc4.lib xpcomglue.lib shlwapi.lib /nologo /dll /incremental:yes /pdb:"$(OUTDIR)\FireGPGCall.pdb" /debug /machine:I386 /out:"$(OUTDIR)\FireGPGCall.dll" /implib:"$(OUTDIR)\FireGPGCall.lib" /pdbtype:sept /libpath:"$(GECKO_SDK_PATH)\lib"
LINK32_OBJS= \
	"$(INTDIR)\FireGPGCall.obj" \
	"$(INTDIR)\FireGPGCallModule.obj"

"$(OUTDIR)\FireGPGCall.dll" : "$(OUTDIR)" $(DEF_FILE) $(LINK32_OBJS)
    $(LINK32) @<<sz
  $(LINK32_FLAGS) $(LINK32_OBJS)
<<

TargetPath=.\Debug\FireGPGCall.dll
SOURCE="$(InputPath)"

# Begin Custom Macros
OutDir=.\Debug
# End Custom Macros

!ENDIF

NO_EXTERNAL_DEPS=1
f
!IF "$(NO_EXTERNAL_DEPS)" != "1"
!IF EXISTS("FireGPGCall.dep")
!INCLUDE "FireGPGCall.dep"
!ELSE
!MESSAGE Warning: cannot find "FireGPGCall.dep"
!ENDIF
!ENDIF


!IF "$(CFG)" == "FireGPGCall - Win32 Release" || "$(CFG)" == "FireGPGCall - Win32 Debug"
SOURCE=.\FireGPGCall.cpp

"$(INTDIR)\FireGPGCall.obj"	"$(INTDIR)\FireGPGCall.sbr" : $(SOURCE) "$(INTDIR)"
	$(CPP) $(CPP_PROJ) $(SOURCE)

SOURCE=.\FireGPGCallModule.cpp

"$(INTDIR)\FireGPGCallModule.obj"	"$(INTDIR)\FireGPGCallModule.sbr" : $(SOURCE) "$(INTDIR)"

!ENDIF
