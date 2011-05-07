name=firegpg
var=${name}_ipc
domain=getfiregpg.org
uuid=babce0
hg clone http://hg.mozilla.org/ipccode $name-ipc

sed -i s/8431e1/$uuid/g $name-ipc/public/*.idl
sed -i "s/= ipc/= $var/g" $name-ipc/build/Makefile.in
sed -i "s/= ipc/= $var/g" $name-ipc/public/Makefile.in
sed -i "s/$var-pipe/$var/g" $name-ipc/build/Makefile.in
sed -i "s/$var-pipe/$var/g" $name-ipc/public/Makefile.in
sed -i  "s/mozilla.org\/ipc/$domain\/ipc/g" $name-ipc/*/*

cat << EOF > chrome.manifest
resource   $name     modules/

interfaces components/$var.xpt
binary-component components/lib$var.dylib ABI=Darwin_x86-gcc3
binary-component components/lib$var.dylib ABI=Darwin_x86_64-gcc3
binary-component components/lib$var.64.so ABI=Linux_x86_64-gcc3
binary-component components/lib$var.32.so ABI=Linux_x86-gcc3
binary-component components/$var.dll ABI=WINNT_x86-msvc
contract @$domain/ipc/ipc-buffer;1 {${uuid}c1-7ab1-11d4-8f02-a06008948af5}
contract @$domain/ipc/pipe-transport;1 {${uuid}01-7ab1-11d4-8f02-a06008948af5}
EOF
