#include "FireGPGCall.h"
#include <unistd.h>
#include <stdio.h>
#include <string.h>
#include "nsMemory.h"
#include "nsCOMPtr.h"
#include "plstr.h"
#include <stdio.h>
#include <sys/socket.h>
#include <unistd.h>
#include <stdlib.h>
#include <fcntl.h>
#include <sys/wait.h>
#include <stdio.h>
#include <stdlib.h>
#include <string.h>

char** split(char* chaine,const char* delim,int vide){

 char** tab=NULL; //tableau de chaine, tableau resultat
 char *ptr; //pointeur sur une partie de
 int sizeStr; //taille de la chaine à recupérer
 int sizeTab=0; //taille du tableau de chaine
 char* largestring; //chaine à traiter

 int sizeDelim=strlen(delim); //taille du delimiteur


 largestring = chaine; //comme ca on ne modifie pas le pointeur d'origine
 //(faut ke je verifie si c bien nécessaire)


 while( (ptr=strstr(largestring, delim))!=NULL ){
 sizeStr=ptr-largestring;

 //si la chaine trouvé n'est pas vide ou si on accepte les chaine vide
 if(vide==1 || sizeStr!=0){
 //on alloue une case en plus au tableau de chaines
 sizeTab++;
 tab= (char**) realloc(tab,sizeof(char*)*sizeTab);

 //on alloue la chaine du tableau
 tab[sizeTab-1]=(char*) malloc( sizeof(char)*(sizeStr+1) );
 strncpy(tab[sizeTab-1],largestring,sizeStr);
 tab[sizeTab-1][sizeStr]='\0';
 }

 //on decale le pointeur largestring pour continuer la boucle apres le premier elément traiter
 ptr=ptr+sizeDelim;
 largestring=ptr;
 }

 //si la chaine n'est pas vide, on recupere le dernier "morceau"
 if(strlen(largestring)!=0){
 sizeStr=strlen(largestring);
 sizeTab++;
 tab= (char**) realloc(tab,sizeof(char*)*sizeTab);
 tab[sizeTab-1]=(char*) malloc( sizeof(char)*(sizeStr+1) );
 strncpy(tab[sizeTab-1],largestring,sizeStr);
 tab[sizeTab-1][sizeStr]='\0';
 }
 else if(vide==1){ //si on fini sur un delimiteur et si on accepte les mots vides,on ajoute un mot vide
 sizeTab++;
 tab= (char**) realloc(tab,sizeof(char*)*sizeTab);
 tab[sizeTab-1]=(char*) malloc( sizeof(char)*1 );
 tab[sizeTab-1][0]='\0';

 }

 //on ajoute une case à null pour finir le tableau
 sizeTab++;
 tab= (char**) realloc(tab,sizeof(char*)*sizeTab);
 tab[sizeTab-1]=NULL;

 return tab;
 }

NS_IMPL_ISUPPORTS1(FireGPGCall, IFireGPGCall)

FireGPGCall::FireGPGCall()
{
  /* member initializers and constructor code */
}

FireGPGCall::~FireGPGCall()
{
  /* destructor code */
}

/* long Add (in long a, in long b); */
NS_IMETHODIMP FireGPGCall::Call(const char *path, const char *parameters, const char *sdin, char **_retval)
{


    char c[1];  /* declare a char array */
    int n = 0;

    char buffer[10240];

    //char *tmpCommand = strcat((char*)path," ");
    //char *command = strcat(tmpCommand,(char*)parameters);

    pid_t child;
    int fd[2];
    int rc;

    rc = socketpair( AF_UNIX, SOCK_STREAM, 0, fd );
    if ( rc < 0 ) {
      perror("Cannot open socketpair");
      exit(0);
    }
    child = fork();
    if (child < 0) {
      perror("Cannot fork");
      exit(0);
    }
    if (child == 0) { /* child - it uses fd[1] */
      close (fd[0]);
      if (fd[1] != STDIN_FILENO) { /*Redirect standard input to socketpair*/
        if (dup2(fd[1], STDIN_FILENO) != STDIN_FILENO) {
      perror("Cannot dup2 stdin");
      exit(0);
        }
      }
      if (fd[1] != STDOUT_FILENO) { /*Redirect standard output to socketpair*/
        if (dup2(fd[1], STDOUT_FILENO) != STDOUT_FILENO) {
      perror("Cannot dup2 stdout");
      exit(0);
        }
      }

    char *const *argv=split((char*)parameters," ",0);

      if (execvp(path, argv) < 0) {
        perror("Cannot exec");
        exit(0);
      }
      exit(0);
    }

    write(fd[0], sdin, strlen(sdin));

    int status = 0;
    waitpid( child, &status, 0 );

    fcntl(fd[0], F_SETFL, O_NONBLOCK | fcntl(fd[0], F_GETFL));

    while(1) {
     read(fd[0],c,1);
      if(c[0]!=-74 && n < 10240) {
        buffer[n] = c[0];
        n++;
      }
      else {
        break;
      }
    }

    buffer[n] = (char)'\0';

    * _retval = (char*) nsMemory::Alloc(PL_strlen(buffer) + 1);
    if (! *_retval)
        return NS_ERROR_NULL_POINTER;
    PL_strcpy(*_retval, buffer);

    close(fd[0]);
    close(fd[1]);

	return NS_OK;
}
