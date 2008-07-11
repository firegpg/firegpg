Name:      mozilla-ipc
Version:   1.1.0
Release:   1
Requires:  mozilla = 1.0
Summary:   Inter-process communication in Mozilla
Copyright: Mozilla Public License 1.1/GPL
Group:     Applications/Internet
Source:    http://protozilla.mozdev.org/source.html
URL:       http://protozilla.mozdev.org/
Vendor:    xmlterm.org
Packager:  R. Saravanan <svn@xmlterm.org>

%description

 mozilla-ipc: Inter-process communication in Mozilla

%prep
cd $RPM_BUILD_DIR
rm -rf ${RPM_PACKAGE_NAME}-${RPM_PACKAGE_VERSION}
mkdir ${RPM_PACKAGE_NAME}-${RPM_PACKAGE_VERSION}
cd ${RPM_PACKAGE_NAME}-${RPM_PACKAGE_VERSION}

unzip ${RPM_SOURCE_DIR}/ipc-${RPM_PACKAGE_VERSION}-linux.xpi
if [ $? -ne 0 ]; then
  exit $?
fi

chown -R root.root .
chmod -R a+rX,g-w,o-w .

%build

%install
cd ${RPM_PACKAGE_NAME}-${RPM_PACKAGE_VERSION}
install -m 755 components/ipc.xpt   /usr/lib/mozilla/components
install -m 755 components/libipc.so /usr/lib/mozilla/components

%pre

%post

# run ldconfig before regxpcom
/sbin/ldconfig >/dev/null 2>/dev/null

if [ -f /usr/lib/mozilla/mozilla-rebuild-databases.pl ]; then
    /usr/lib/mozilla/mozilla-rebuild-databases.pl
fi

%postun

# run ldconfig before regxpcom
/sbin/ldconfig >/dev/null 2>/dev/null

if [ -f /usr/lib/mozilla/mozilla-rebuild-databases.pl ]; then
    /usr/lib/mozilla/mozilla-rebuild-databases.pl
fi

%files

/usr/lib/mozilla/components/libipc.so
/usr/lib/mozilla/components/ipc.xpt

%changelog
