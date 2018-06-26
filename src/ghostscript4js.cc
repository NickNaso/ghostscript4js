/*******************************************************************************
 * Copyright (c) 2017 Nicola Del Gobbo
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the license at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
 * IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing
 * permissions and limitations under the License.
 *
 * Contributors - initial API implementation:
 * Nicola Del Gobbo <nicoladelgobbo@gmail.com>
 * Mauro Doganieri <mauro.doganieri@gmail.com>
 ******************************************************************************/

#include "ghostscript4js.h"

// Lifeclycle management for the Ghostscript instance
class GhostscriptManager
{
  private:
    void *minst;
    int workers;
    mutex gs;
    static bool exists;
    static GhostscriptManager *instance;
    GhostscriptManager()
    {
        minst = NULL;
        workers = 0;
    }
    void Init();
    void Destroy();
    void Exit();
    void IncreaseWorkers();
    void DecreaseWorkers();

  public:
    static GhostscriptManager *GetInstance();
    ~GhostscriptManager()
    {
        exists = false;
    };
    void Execute(int gsargc, char *gsargv[]);
};

bool GhostscriptManager::exists = false;
GhostscriptManager *GhostscriptManager::instance = NULL;
// Static method that create or simple return the instance of the GhostscriptManager
// following the singleton design pattern
GhostscriptManager *GhostscriptManager::GetInstance()
{
    if (!exists)
    {
        instance = new GhostscriptManager();
        exists = true;
        return instance;
    }
    else
    {
        return instance;
    }
}

// Init is an implementation of gsapi_new_instance.
// It returns a global static instance of Ghostscript.
// i.e. Do not call init more than once, otherwise an error will be returned.
void GhostscriptManager::Init()
{
    int code = 0;
    code = gsapi_new_instance(&minst, NULL);
    if (code < 0)
    {
        throw "Sorry error happened creating Ghostscript instance. Error code: " + to_string(code);
    }
    gsapi_set_stdio(minst, gsdll_stdin, gsdll_stdout, gsdll_stderr);
    code = gsapi_set_arg_encoding(minst, GS_ARG_ENCODING_UTF8);
    if (code < 0)
    {
        throw "Sorry error happened in setting the encoding for Ghostscript interpreter. Error code: " + to_string(code);
    }
}

// Execute is an implementation of gsapi_init_with_args.
// It initialises the Ghostscript interpreter given a set of arguments.
void GhostscriptManager::Execute(int gsargc, char *gsargv[])
{
    lock_guard<mutex> lk(gs);
    if (workers == 0)
    {
        Init();
    }
    IncreaseWorkers();
    int code = 0;
    code = gsapi_init_with_args(minst, gsargc, gsargv);
    if (code < 0 && code != gs_error_Quit)
    {
        throw "Sorry error happened executing Ghostscript command. Error code: " + to_string(code);
    }
    DecreaseWorkers();
    if (workers == 0)
    {
        Exit();
        Destroy();
    }
}

// Exit is an implementation of gsapi_exit.
// It exits the Ghostscript interpreter.
// It must be called if init has been called, and just before destroy.
void GhostscriptManager::Exit()
{
    int code = 0;
    code = gsapi_exit(minst);
    if (code < 0 && code != gs_error_Quit)
    {
        throw "Sorry error happened during the exit from the Ghostscript interpreter. Error code: " + to_string(code);
    }
}

// Destroy is an implementation of gsapi_delete_instance.
// It destroys a global static instance of Ghostscript.
// It should be called only after exit has been called if init has been called.
void GhostscriptManager::Destroy()
{
    gsapi_delete_instance(minst);
}

// IncreaseWorkers add 1 worker to the total workers on the system.
void GhostscriptManager::IncreaseWorkers()
{
    workers += 1;
}

// DecreaseWorkers substract 1 worker to the total workers on the system.
void GhostscriptManager::DecreaseWorkers()
{
    workers -= 1;
}

class GhostscriptWorker : public Napi::AsyncWorker
{
  public:
    GhostscriptWorker(Napi::Function& callback, string RAWcmd)
        : Napi::AsyncWorker(callback), RAWcmd(RAWcmd) {}
    ~GhostscriptWorker() {}

    void Execute()
    {
        vector<string> explodedCmd;
        istringstream iss(RAWcmd);
        for (string RAWcmd; iss >> RAWcmd;)
            explodedCmd.push_back(RAWcmd);
        int gsargc = static_cast<int>(explodedCmd.size());
        char **gsargv = new char *[gsargc];
        for (int i = 0; i < gsargc; i++)
        {
            gsargv[i] = (char *)explodedCmd[i].c_str();
        }
        try
        {
            GhostscriptManager *gm = GhostscriptManager::GetInstance();
            gm->Execute(gsargc, gsargv);
            delete[] gsargv;
        
        }
        catch (exception &e)
        {
            delete[] gsargv;
            SetError(Napi::String::New(Env(), e.what()));
        }
    }

    void OnOk()
    {
        Napi::HandleScope scope(Env());
        Callback().Call({Env().Null()});   
    }

  private:
    string RAWcmd;
};

Napi::Value Version(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    Napi::Object obj = Napi::Object::New(env);
    gsapi_revision_t r;
    int res = gsapi_revision(&r, sizeof(r));
    if (res == 0) {
        obj["product"] = Napi::String::New(env, r.product);
        obj["copyright"] = Napi::String::New(env, r.copyright);
        obj["revision"] = Napi::Number::New(env, r.revision);
        obj["revisiondate"] = Napi::Number::New(env, r.revisiondate);
    } else {
        std::stringstream msg;
        msg << "Sorry error happened retrieving Ghostscript version info. Error code: " << res;
        throw Napi::Error::New(env, msg.str());
    } 
    return obj;
}

vector<string> ConvertArguments(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1)
    {
        throw Napi::Error::New(env, "Sorry method requires 1 argument that represent the Ghostscript command.");
    }
    if (!info[0].IsString() && !info[0].IsArray())
    {
        throw Napi::Error::New(env, "Sorry method's argument should be a string or an array of strings");
    }
    vector<string> explodedCmd;
    if (info[0].IsString())
    {
        string RAWcmd = info[0].As<Napi::String>().Utf8Value();
        istringstream iss(RAWcmd);
        for (string RAWcmd; iss >> RAWcmd;)
            explodedCmd.push_back(RAWcmd);
    }
    if (info[0].IsArray())
    {
        Napi::Array array = info[0].As<Napi::Array>();
        for (uint32_t i = 0; i < array.Length(); i++)
        {
            Napi::Value value = array[i];
            if (!value.IsString())
            {
                throw Napi::Error::New(env, "Sorry method's argument should be a string or an array of strings");
            }
            string RAWcmd = value.As<Napi::String>().Utf8Value();
            explodedCmd.push_back(RAWcmd);
        }
    }
    return explodedCmd;
}

void Execute(const Napi::CallbackInfo& info) {
    Napi::Function callback = info[1].As<Napi::Function>();
    string RAWcmd = info[0].As<Napi::String>().Utf8Value();
    GhostscriptWorker* gs = new GhostscriptWorker(callback, RAWcmd);
    gs->Queue();
}

void ExecuteSync(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    vector<string> explodedCmd = ConvertArguments(info);
    int gsargc = static_cast<int>(explodedCmd.size());
    char **gsargv = new char *[gsargc];
    for (int i = 0; i < gsargc; i++)
    {
        gsargv[i] = (char *)explodedCmd[i].c_str();
    }
    try
    {
        GhostscriptManager *gm = GhostscriptManager::GetInstance();
        gm->Execute(gsargc, gsargv);
        delete[] gsargv;
    }
    catch (exception &e)
    {
        delete[] gsargv;
        throw Napi::Error::New(env, e.what());
    }
}

//////////////////////////// INIT & CONFIG MODULE //////////////////////////////

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "version"), Napi::Function::New(env, Version));
    //exports.Set(Napi::String::New(env, "execute"), Napi::Function::New(env, Execute));
    exports.Set(Napi::String::New(env, "executeSync"), Napi::Function::New(env, ExecuteSync));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)

////////////////////////////////////////////////////////////////////////////////