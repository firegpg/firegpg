var err;

err = initInstall("IPC v1.1.3",  // name for install UI
                  "/ipc",           // registered name
                  "1.1.3.0");      // package version

logComment("initInstall: " + err);

var fComponents = getFolder("Components");

var delComps = [ "libpipella.so", "pipella.dll", "pipella.xpt"]; // Old names

for (var j=0; j<delComps.length; j++) {
   var delFile = getFolder(fComponents, delComps[j]);
   if (File.exists(delFile))
      File.remove(delFile);
}

// addDirectory: blank, archive_dir, install_dir, install_subdir
err = addDirectory("", "components", fComponents, "");
if (err != SUCCESS)
   cancelInstall(err);

if (getLastError() == SUCCESS)
    performInstall();
else {
   alert("Error detected during installation setup: "+getLastError());
   cancelInstall();
}
