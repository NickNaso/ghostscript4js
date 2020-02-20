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

#ifndef GHOSTSCRIPT4JS_H
#define GHOSTSCRIPT4JS_H

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

#include <napi.h>

#include "iapi.h"

#define gs_error_Quit -101

//using namespace Napi;
using namespace std;

#endif //GHOSTSCRIPT4JS_H
