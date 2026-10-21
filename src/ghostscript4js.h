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

// _Windows is not defined, because then the iapi.h of Ghostscript 10 removes
// GSDLLAPI with MinGW, the ABI of Zig. The build defines it as __stdcall on
// Windows x86, as the Ghostscript DLLs. iapi.h is included first, before a
// header that includes windows.h, which also makes it define _Windows.
#ifdef _WIN32
#define GSDLLEXPORT __declspec(dllimport)
#endif

#include <iapi.h>

#include <sstream>
#include <string>
#include <mutex>
#include <exception>

#include <napi.h>

// gserrors.h is not bundled with the package, and the code is the same in all
// the supported versions of Ghostscript
#if __has_include(<gserrors.h>)
#include <gserrors.h>
#else
#define gs_error_Quit -101
#endif

//using namespace Napi;
using namespace std;

#endif //GHOSTSCRIPT4JS_H
