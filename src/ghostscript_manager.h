
#ifndef SRC_GHOSTSCRIPT_MANAGER_H
#define SRC_GHOSTSCRIPT_MANAGER_H

#if defined(_WIN32) && !defined(_Windows)
#define _Windows
#endif
#ifdef _Windows
//#define _WINSOCKAPI_ 
//#include <windows.h>
#define GSDLLEXPORT __declspec(dllimport)
#endif

#include <sstream>
#include <string>
#include <mutex>
#include <exception>
#include <vector>

#include "iapi.h"

#ifndef gs_error_Quit
#define gs_error_Quit -101
#endif

using namespace std;

typedef enum {
  gs_ok,
  gs_new_instance,
  gs_set_arg_encoding,
  gs_init_with_args,
  gs_exit
} gs_status;

// Lifeclycle management for the Ghostscript instance
class GhostscriptManager
{
  private:
    void *minst;
    mutex gs;
    static GhostscriptManager *instance;
    GhostscriptManager();

  public:
    static GhostscriptManager *GetInstance();
    ~GhostscriptManager();
    gs_status Execute(vector<string> command);
};

#endif // SRC_GHOSTSCRIPT_MANAGER_H