#include "FireGPGCall.h"
#include "nsMemory.h"
#include "nsCOMPtr.h"
#include "plstr.h"
#include <fcntl.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <unistd.h>
#include "IPCProcess.h"

NS_IMPL_ISUPPORTS1(FireGPGCall, IFireGPGCall)

FireGPGCall::FireGPGCall() {
  /* member initializers and constructor code */
}

FireGPGCall::~FireGPGCall() {
  /* destructor code */
}


char** split(char* chaine,const char* delim,int vide) {

    char** tab = NULL; //tableau de chaine, tableau resultat
    char *ptr; //pointeur sur une partie de
    int sizeStr; //taille de la chaine à recupérer
    int sizeTab = 0; //taille du tableau de chaine
    char* largestring; //chaine à traiter

    int sizeDelim=strlen(delim); //taille du delimiteur

    largestring = chaine; //comme ca on ne modifie pas le pointeur d'origine

        while( (ptr=strstr(largestring, delim))!=NULL ){
            sizeStr=ptr-largestring;

            //si la chaine trouvé n'est pas vide ou si on accepte les chaine vide
            if (vide == 1 || sizeStr != 0) {
                //on alloue une case en plus au tableau de chaines
                sizeTab++;

                tab= (char**) realloc(tab,sizeof(char*)*sizeTab);

                //on alloue la chaine du tableau
                tab[sizeTab-  1]=(char*) malloc( sizeof(char)*(sizeStr + 1) );
                strncpy(tab[sizeTab-1],largestring,sizeStr);
                tab[sizeTab-1][sizeStr] = '\0';
            }

            //on decale le pointeur largestring pour continuer la boucle apres le premier elément traiter
            ptr = ptr + sizeDelim;
            largestring = ptr;
        }

    //si la chaine n'est pas vide, on recupere le dernier "morceau"
    if (strlen(largestring) != 0) {

        sizeStr=strlen(largestring);
        sizeTab++;
        tab = (char**) realloc(tab,sizeof(char*)*sizeTab);
        tab[sizeTab-1]=(char*) malloc( sizeof(char)*(sizeStr+1) );
        strncpy(tab[sizeTab-1],largestring,sizeStr);
        tab[sizeTab-1][sizeStr] = '\0';
    }
    else if (vide == 1) { //si on fini sur un delimiteur et si on accepte les mots vides,on ajoute un mot vide
        sizeTab++;
        tab = (char**) realloc(tab,sizeof(char*)*sizeTab);
        tab[sizeTab-1] = (char*) malloc( sizeof(char)*1 );
        tab[sizeTab-1][0] = '\0';

    }

    //on ajoute une case à null pour finir le tableau
    sizeTab++;
    tab = (char**) realloc(tab,sizeof(char*)*sizeTab);
    tab[sizeTab-1] = NULL;

    return tab;
}

/* long Add (in long a, in long b); */
NS_IMETHODIMP FireGPGCall::Call(const char *path, const char *parameters, const char *sdin, char **_retval) {

    //We call the process
    char  *const *argv = split((char*)parameters," ",0);

    char *buffer = (char *)"213";

    PRFileDesc* std_in = false;
    PRFileDesc* std_out = false;
    PRFileDesc* std_err = false;

    PRProcess*  process = IPC_CreateProcessRedirectedNSPR(path, argv,false,false,std_in, std_out, std_err);

    process = false;

    //We copy the ouput to the return variable
    * _retval = (char*) nsMemory::Alloc(PL_strlen(buffer) + 1);
    if (! *_retval)
        return NS_ERROR_NULL_POINTER;

    PL_strcpy(*_retval, buffer);

	return NS_OK;
}
