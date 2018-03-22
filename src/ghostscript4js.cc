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

/*class GhostscriptWorker : public AsyncWorker
{
  public:
    GhostscriptWorker(Callback *callback, string RAWcmd)
        : AsyncWorker(callback), RAWcmd(RAWcmd), res(0) {}
    ~GhostscriptWorker() {}

    void Execute()
    {
        res = 0;
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
            res = 0;
        }
        catch (exception &e)
        {
            delete[] gsargv;
            msg << e.what();
            res = 1;
        }
    }

    void HandleOKCallback()
    {
        Nan::HandleScope();
        Local<Value> argv[1];
        if (res == 0)
        {
            argv[0] = Null();
        }
        else
        {
            argv[0] = Error(Nan::New<String>(msg.str()).ToLocalChecked());
        }
        callback->Call(1, argv);
    }

  private:
    string RAWcmd;
    int res;
    stringstream msg;
};*/

/*NAN_METHOD(Version)
{
    Nan::HandleScope();
    Local<Object> obj = Nan::New<Object>();
    gsapi_revision_t r;
    int res = gsapi_revision(&r, sizeof(r));
    if (res == 0)
    {
        obj->Set(Nan::New<String>("product").ToLocalChecked(), Nan::New<String>(r.product).ToLocalChecked());
        obj->Set(Nan::New<String>("copyright").ToLocalChecked(), Nan::New<String>(r.copyright).ToLocalChecked());
        obj->Set(Nan::New<String>("revision").ToLocalChecked(), Nan::New<Number>(r.revision));
        obj->Set(Nan::New<String>("revisiondate").ToLocalChecked(), Nan::New<Number>(r.revisiondate));
    }
    else
    {
        std::stringstream msg;
        msg << "Sorry error happened retrieving Ghostscript version info. Error code: " << res;
        return Nan::ThrowError(Nan::New<String>(msg.str()).ToLocalChecked());
    }
    info.GetReturnValue().Set(obj);
}*/

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

/*NAN_METHOD(Execute)
{
    Callback *callback = new Callback(info[1].As<Function>());
    Local<String> JScmd = Local<String>::Cast(info[0]);
    AsyncQueueWorker(new GhostscriptWorker(callback, *String::Utf8Value(JScmd)));
    info.GetReturnValue().SetUndefined();
}*/

void ExecuteSync(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();

    if (info.Length() < 1)
    {
        throw Napi::Error::New(env, "Sorry executeSync() method requires 1 argument that represent the Ghostscript command.");
    }
    if (!info[0].IsString())
    {
        throw Napi::Error::New(env, "Sorry executeSync() method's argument should be a string.");
    }
    string RAWcmd = info[0].As<Napi::String>().Utf8Value(); 
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