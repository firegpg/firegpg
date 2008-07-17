CXX   = c++
CPPFLAGS +=     -fno-rtti              \
		-fno-exceptions        \
		-shared

# Change this to point at your Gecko SDK directory.
GECKO_SDK_PATH = /opt/xulrunner-1.9

# GCC only define which allows us to not have to #include mozilla-config
# in every .cpp file.  If your not using GCC remove this line and add
# #include "mozilla-config.h" to each of your .cpp files.
GECKO_CONFIG_INCLUDE = -include mozilla-config.h

GECKO_DEFINES  = -DXPCOM_GLUE -D_IMPL_NS_COM_OFF
#

GECKO_INCLUDES = -I $(GECKO_SDK_PATH)/include \
-I $(GECKO_SDK_PATH)/include/xpcom \
-I $(GECKO_SDK_PATH)/include/xpcom_obsolete \
-I $(GECKO_SDK_PATH)/include/string \
-I $(GECKO_SDK_PATH)/include/js \
-I $(GECKO_SDK_PATH)/include/caps \
-I $(GECKO_SDK_PATH)/include/uconv \
-I $(GECKO_SDK_PATH)/include/necko \
-I $(GECKO_SDK_PATH)/include/mimetype \
-I $(GECKO_SDK_PATH)/include/xpconnect \
-I /usr/include/xulrunner-1.9/unstable \
-I /usr/include/nspr/
GECKO_LDFLAGS =  -L $(GECKO_SDK_PATH)/lib -lxpcomglue \
                 -lnspr4      \
                 -lplds4


FORCE_STATIC_LIB = 1
FILES = nsPipeTransport.cpp \
	        nsPipeConsole.cpp   \
	        nsPipeChannel.cpp   \
	        nsPipeFilterListener.cpp \
	        IPCProcess.cpp      \
	        nsIPCBuffer.cpp     \
	        nsIPCService.cpp    \
	        nsProcessInfo.cpp
TARGET = IPC.so

build:
	$(CXX) -Wall -Os -o $(TARGET) $(GECKO_CONFIG_INCLUDE) $(GECKO_DEFINES) $(GECKO_INCLUDES) $(FILES) $(GECKO_SDK_PATH)/lib/libxpcomglue_s.a $(GECKO_LDFLAGS)  $(CPPFLAGS) $(CXXFLAGS)
	chmod +x $(TARGET)
	strip $(TARGET)

clean:
	rm $(TARGET)
