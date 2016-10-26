#include <iostream>
#include <string>

#include <ghostscript/gdevdsp.h>
#include <ghostscript/gserrors.h>
#include <ghostscript/iapi.h>
#include <ghostscript/ierrors.h>

using namespace std;

int main () { 

   gsapi_revision_t r;
   int res = gsapi_revision(&r, sizeof(r));

   cout << r.product << endl;
   cout << r.copyright << endl;
   cout << r.revision << endl;
   cout << r.revisiondate;

  return 0;
}