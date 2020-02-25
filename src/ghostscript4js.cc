/* ******************************************************************************
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

#include "ghostscript_manager.h"
#include <napi.h>

Napi::Error CreateError(Napi::Env env, string message, string code) {
  Napi::Error e = Napi::Error::New(env, message);
  e.Set("code", Napi::String::New(env, code));
  return e;
}

Napi::Error HandleGSError(Napi::Env env, gs_status status) {
    Napi::Error e;
    switch (status)
    {
    case gs_new_instance:
        e = CreateError(env, 
                "Sorry error happened creating col cazzo Ghostscript instance.", 
                "GS_NEW_INSTANCE");
        break;
    case gs_set_arg_encoding:
        e = CreateError(env, 
                "Sorry error happened in setting the encoding for Ghostscript interpreter.", 
                "GS_SET_ARG_ENCODING");
        break;
    case gs_init_with_args:
        e = CreateError(env, 
                "Sorry error happened executing Ghostscript command.", 
                "GS_INIT_WITH_ARGS");
        break;          
    case gs_exit:
        e = CreateError(env, 
                "Sorry error happened during the exit from the Ghostscript interpreter.", 
                "GS_EXIT");
        break;
    default:
        e = CreateError(env, 
                "Sorry unknown error happened using Ghostscript interpreter.", 
                "GS_UNKNOWN");
        break;
    }
    return e;
}

class GhostscriptWorker : public Napi::AsyncWorker
{
  public:
    GhostscriptWorker(Napi::Function& callback, vector<string> command) 
        : Napi::AsyncWorker(callback, "ghostcript4js"), command(command) {};
    void Execute()
    {
        GhostscriptManager *gm = GhostscriptManager::GetInstance();
        gs_status status = gm->Execute(command);
        if (status != gs_ok) {
            SetError("GS_ERROR");
        }
    }
    void OnOk()
    {
        Napi::HandleScope scope(Env());
        Callback().Call({ Env().Null() });   
    }
    void OnError(const Napi::Error& e) {
        Napi::HandleScope scope(Env());
        Callback().Call({ HandleGSError(Env(), status).Value() });   
    }
  private:
    gs_status status;
    vector<string> command;
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
        CreateError(env, 
            "Sorry error happened retrieving Ghostscript version info.", 
            "GS_REVISION").ThrowAsJavaScriptException();
    }
    return obj;
}

vector<string> ConvertArguments(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() < 1)
    {
        
        CreateError(env, 
            "Sorry method requires 1 argument that represent the Ghostscript command", 
            "GS_VALIDATION").ThrowAsJavaScriptException();
    }
    if (!info[0].IsString() && !info[0].IsArray())
    {
         CreateError(env, 
            "Sorry method's argument should be a string or an array of strings", 
            "GS_VALIDATION").ThrowAsJavaScriptException();
    }
    vector<string> cmd;
    if (info[0].IsString())
    {
        string RAWcmd = info[0].As<Napi::String>().Utf8Value();
        istringstream iss(RAWcmd);
        for (string RAWcmd; iss >> RAWcmd;)
            cmd.push_back(RAWcmd);
    }
    if (info[0].IsArray())
    {
        Napi::Array array = info[0].As<Napi::Array>();
        for (uint32_t i = 0; i < array.Length(); i++)
        {
            Napi::Value value = array[i];
            if (!value.IsString())
            {
                 CreateError(env, 
                    "Sorry method's argument should be a string or an array of strings", 
                    "GS_VALIDATION").ThrowAsJavaScriptException();
            }
            string RAWcmd = value.As<Napi::String>().Utf8Value();
            cmd.push_back(RAWcmd);
        }
    }
    return cmd;
}

void Execute(const Napi::CallbackInfo& info) {
    Napi::Function callback = info[1].As<Napi::Function>();
    GhostscriptWorker* gs = new GhostscriptWorker(callback, ConvertArguments(info));
    gs->Queue();
}

void ExecuteSync(const Napi::CallbackInfo& info)
{
    Napi::Env env = info.Env();
    GhostscriptManager *gm = GhostscriptManager::GetInstance();
    gs_status status = gm->Execute(ConvertArguments(info));
    if (status != gs_ok) {
        HandleGSError(env, status).ThrowAsJavaScriptException();
    }
    return;
}

//////////////////////////// INIT & CONFIG MODULE //////////////////////////////

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    exports.Set(Napi::String::New(env, "version"), Napi::Function::New(env, Version));
    exports.Set(Napi::String::New(env, "execute"), Napi::Function::New(env, Execute));
    exports.Set(Napi::String::New(env, "executeSync"), Napi::Function::New(env, ExecuteSync));
    return exports;
}

NODE_API_MODULE(NODE_GYP_MODULE_NAME, Init)

////////////////////////////////////////////////////////////////////////////////
