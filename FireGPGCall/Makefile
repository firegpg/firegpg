CXX   = c++
CPPFLAGS +=     -fno-rtti              \
		-fno-exceptions        \
		-shared

# Change this to point at your Gecko SDK directory.
GECKO_SDK_PATH = /opt/gecko-sdk

# GCC only define which allows us to not have to #include mozilla-config
# in every .cpp file.  If your not using GCC remove this line and add
# #include "mozilla-config.h" to each of your .cpp files.
GECKO_CONFIG_INCLUDE = -include mozilla-config.h

GECKO_DEFINES  = -DXPCOM_GLUE -D_IMPL_NS_COM_OFF

GECKO_INCLUDES = -I $(GECKO_SDK_PATH)/include

GECKO_LDFLAGS =  -L $(GECKO_SDK_PATH)/lib -lxpcomglue \
                 -lnspr4      \
                 -lplds4

FILES = FireGPGCall.cpp FireGPGCallModule.cpp

TARGET = FireGPGCall.so

build:
	$(CXX) -Wall -Os -o $(TARGET) $(GECKO_CONFIG_INCLUDE) $(GECKO_DEFINES) $(GECKO_INCLUDES) $(FILES) $(GECKO_SDK_PATH)/lib/libxpcomglue_s.a $(GECKO_LDFLAGS)  $(CPPFLAGS) $(CXXFLAGS)
	chmod +x $(TARGET)
	strip $(TARGET)

clean:
	rm $(TARGET)
