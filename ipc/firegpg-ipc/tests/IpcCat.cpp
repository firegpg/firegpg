/* ***** BEGIN LICENSE BLOCK *****
 * Version: MPL 1.1/GPL 2.0/LGPL 2.1
 *
 * The contents of this file are subject to the Mozilla Public
 * License Version 1.1 (the "MPL"); you may not use this file
 * except in compliance with the MPL. You may obtain a copy of
 * the MPL at http://www.mozilla.org/MPL/
 *
 * Software distributed under the MPL is distributed on an "AS
 * IS" basis, WITHOUT WARRANTY OF ANY KIND, either express or
 * implied. See the MPL for the specific language governing
 * rights and limitations under the MPL.
 *
 * The Original Code is ipc-pipe.
 *
 * The Initial Developer of the Original Code is Patrick Brunschwig.
 * Portions created by Patrick Brunschwig <patrick@mozilla-enigmail.org> are
 * Copyright (C) 2010 Patrick Brunschwig. All Rights Reserved.
 *
 * Contributor(s):
 *
 * Alternatively, the contents of this file may be used under the terms of
 * either the GNU General Public License Version 2 or later (the "GPL"), or
 * the GNU Lesser General Public License Version 2.1 or later (the "LGPL"),
 * in which case the provisions of the GPL or the LGPL are applicable instead
 * of those above. If you wish to allow use of your version of this file only
 * under the terms of either the GPL or the LGPL, and not to allow others to
 * use your version of this file under the terms of the MPL, indicate your
 * decision by deleting the provisions above and replace them with the notice
 * and other provisions required by the GPL or the LGPL. If you do not delete
 * the provisions above, a recipient may use your version of this file under
 * the terms of any one of the MPL, the GPL or the LGPL.
 * ***** END LICENSE BLOCK ***** */


/*
 * Helper tool to read or write data to/from stdin/stdout
 *
 * Usage:
 * IpcCat {write|read|dump|getenv} arg
 *
 * Parameters:
 *   write:  read from stdin and write to file <arg>
 *   read:   read from file <arg> and write to stdout
 *   dump:   read from stdin; write to stdout
 *   getenv: print value of environment variable <arg>
 *
 * Exit codes:
 *   0:    success
 *   > 0:  failure
 */

#include <stdio.h>
#include <string.h>
#include <stdlib.h>

int main(int argc, char* argv[])
{

  if (argc < 2)
    return 1;

  const char* fileName;
  const int maxLen = 255;
  char buffer[maxLen + 1];
  long totalBytes = 0;

  // "dump" function
  if (strcmp(argv[1], "dump") == 0) {
    fputs("Starting dump\n", stderr);
    while(fgets(buffer, maxLen, stdin)) {
      fputs(buffer, stdout);
      totalBytes += strlen(buffer);
      if (! stdin)
        fputs("\n", stdout);
    }
    sprintf(buffer, "Dumped %ld bytes\n", totalBytes);
    fputs(buffer, stderr);
  }

  // "write" function
  else if (strcmp(argv[1], "write") == 0) {
    if (argc < 3)
      return 1;

    fileName = argv[2];
    if (!fileName)
      return 2;

    FILE* outfile = fopen(fileName, "w");
    if (!outfile)
      return 3;

    fputs("Starting write\n", stderr);
    while(fgets(buffer, maxLen, stdin)) {
      fputs(buffer, outfile);
      totalBytes += strlen(buffer);
      if (! stdin) {
        fputs("\n", outfile);
      }
    }
    fclose(outfile);
    sprintf(buffer, "Wrote %ld bytes\n", totalBytes);
    fputs(buffer, stderr);
  }

  // "read" function
  else if (strcmp(argv[1], "read") == 0) {
    if (argc < 3)
      return 1;

    fileName = argv[2];

    FILE* infile = fopen(fileName, "r");
    if (!infile)
      return 5;

    size_t bytesRead;
    bytesRead = maxLen;

    fputs("Starting read\n", stderr);
    while (bytesRead == (size_t) maxLen) {
      bytesRead = fread (buffer, 1, maxLen, infile);
      totalBytes += bytesRead;
      buffer[bytesRead] = 0;
      fputs(buffer, stdout);
    }
    fclose (infile);

    sprintf(buffer, "Read %ld bytes\n", totalBytes);
    fputs(buffer, stderr);
  }

  // "getenv" function
  else if (strcmp(argv[1], "getenv") == 0) {
    if (argc < 3)
      return 1;

    sprintf(buffer, "Reading environment variable %s\n", argv[2]);
    fputs(buffer, stderr);
    char* envVar = getenv(argv[2]);

    if (! envVar)
      fputs("not defined\n", stdout);
    else
      fputs(envVar, stdout);
  }
  else {
    return 4;
  }

  fflush(stderr);
  fflush(stdout);

  return 0;
}
