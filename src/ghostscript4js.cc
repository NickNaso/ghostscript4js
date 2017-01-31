/*******************************************************************************
 * Copyright (c) 2016 Nicola Del Gobbo
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
 ******************************************************************************/

#include "ghostscript4js.h"

void Version(const Nan::FunctionCallbackInfo<Value> &info)
{
    Nan::HandleScope();
    Local<Object> obj  = Nan::New<Object>();
    gsapi_revision_t r;
    int res = gsapi_revision(&r, sizeof(r));
    if ( res == 0) {
        obj->Set(Nan::New<String>("product").ToLocalChecked(), Nan::New<String>(r.product).ToLocalChecked());
        obj->Set(Nan::New<String>("copyright").ToLocalChecked(), Nan::New<String>(r.copyright).ToLocalChecked());
        obj->Set(Nan::New<String>("revision").ToLocalChecked(), Nan::New<Number>(r.revision));
        obj->Set(Nan::New<String>("revisiondate").ToLocalChecked(), Nan::New<Number>(r.revisiondate));
    } else {
        std::stringstream msg; 
        msg << "Sorry error happened retrieving Ghostscript version info. Error code: " << res; 
        return Nan::ThrowError(Nan::New<String>(msg.str()).ToLocalChecked());
    }
    info.GetReturnValue().Set(obj);
}

void Execute(const Nan::FunctionCallbackInfo<Value> &info)
{
    Nan::HandleScope();
    info.GetReturnValue().Set(Nan::New<String>("Execute Ghostscript command").ToLocalChecked());
}

void ExecuteSync(const Nan::FunctionCallbackInfo<Value> &info)
{
    Nan::HandleScope();
    if (info.Length() < 1) {
        return Nan::ThrowError("Sorry executeSync() method requires 1 argument that represent the Ghostscript command.");
    }
    if (!info[0]->IsString()) {
        return Nan::ThrowError("Sorry executeSync() method's argument should be a string.");
    }
    Local<String> JScmd = Local<String>::Cast(info[0]);
    std::string RAWcmd = *String::Utf8Value(JScmd);
    std::vector<std::string> explodedCmd;
    std::istringstream iss(RAWcmd);
    for(std::string RAWcmd; iss >> RAWcmd;)
        explodedCmd.push_back(RAWcmd);
    void *minst;
    int code, exit_code;
    char * gsargv[explodedCmd.size()];
    int gsargc = explodedCmd.size();
    for(unsigned int i = 0; i < explodedCmd.size(); i++) {
        
        gsargv[i] = (char*)explodedCmd[i].c_str();
    }
    code = gsapi_new_instance(&minst, NULL);
    if (code < 0) {
        std::stringstream msg; 
        msg << "Sorry error happened creating Ghostscript instance. Error code: " << code;
        return Nan::ThrowError(Nan::New<String>(msg.str()).ToLocalChecked());
    }    
    gsapi_set_stdio(minst, gsdll_stdin, gsdll_stdout, gsdll_stderr);
    code = gsapi_set_arg_encoding(minst, GS_ARG_ENCODING_UTF8);
    if (code == 0)
        code = gsapi_init_with_args(minst, gsargc, gsargv);
    exit_code = gsapi_exit(minst);
    if ((code == 0) || (code == gs_error_Quit))
	code = exit_code;
    gsapi_delete_instance(minst);
    if ((code == 0) || (code == gs_error_Quit)) {
       return;
    } else {
        std::stringstream msg; 
        msg << "Sorry error happened executing Ghostscript command. Error code: " << code;
        return Nan::ThrowError(Nan::New<String>(msg.str()).ToLocalChecked());
    }  
}

//////////////////////////// INIT & CONFIG MODULE //////////////////////////////

void Init(Local<Object> exports)
{
    exports->Set(Nan::New("version").ToLocalChecked(),
                 Nan::New<FunctionTemplate>(Version)->GetFunction());

    exports->Set(Nan::New("execute").ToLocalChecked(),
                 Nan::New<FunctionTemplate>(Execute)->GetFunction());

    exports->Set(Nan::New("executeSync").ToLocalChecked(),
                 Nan::New<FunctionTemplate>(ExecuteSync)->GetFunction());              
}

NODE_MODULE(ghostscript4js, Init)

////////////////////////////////////////////////////////////////////////////////
