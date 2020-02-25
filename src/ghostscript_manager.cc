#include "ghostscript_manager.h"

GhostscriptManager *GhostscriptManager::instance = nullptr;
GhostscriptManager::~GhostscriptManager() {
    minst = nullptr;
}
GhostscriptManager::GhostscriptManager() {
    minst = nullptr;
}
// Static method that create or simple return the instance of the GhostscriptManager
// following the singleton design pattern
GhostscriptManager *GhostscriptManager::GetInstance()
{
    if (instance == nullptr)
    {
        instance = new GhostscriptManager();
    }
    return instance;
}

// Execute is an implementation of gsapi_init_with_args.
// It initialises the Ghostscript interpreter given a set of arguments.
gs_status GhostscriptManager::Execute(vector<string> command)
{
    lock_guard<mutex> lk(gs);
    int code = 0;
    int exit_code = 0;
    gs_status status = gs_ok;
    
    // It returns an instance of Ghostscript interpreter.
    // i.e. Do not call init gsapi_new_instance more than once, otherwise an 
    // error will be returned.
    code = gsapi_new_instance(&minst, NULL);
    if (code < 0) {
        return gs_new_instance;
    }
    code = gsapi_set_arg_encoding(minst, GS_ARG_ENCODING_UTF8);
    if (code == 0) {
        int gsargc = static_cast<int>(command.size());
        char **gsargv = new char *[gsargc];
        for (int i = 0; i < gsargc; i++)
        {
            gsargv[i] = (char *)command[i].c_str();
        } 
        code = gsapi_init_with_args(minst, gsargc, gsargv);
        if (!(code == 0 || code == gs_error_Quit)) {
            status = gs_init_with_args;
        } 
        delete[] gsargv;
    } else {
        status = gs_set_arg_encoding;
    }
    // It exits the Ghostscript interpreter.
    // It must be called if init_* has been called, and just before delete 
    // the intepreter's instance.
    exit_code = gsapi_exit(minst);
    if (code == 0 || code == gs_error_Quit) {
        code = exit_code;
    }
    // It destroys a global instance of Ghostscript interpreter.
    gsapi_delete_instance(minst);
    minst = nullptr;
    if (code == 0 || code == gs_error_Quit) {
        return status;
    } else {
        return gs_exit;
    }
}