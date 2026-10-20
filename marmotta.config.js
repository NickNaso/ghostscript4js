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

'use strict'

const fs = require('fs')
const path = require('path')
const findMacOSLibraryPath = require('./macOS-lib-path-finder')
const { SYSTEM_OPTIONS, option, useSystemGhostscript, findLibgs } = require('./libgs')

const OUTPUT_DIR = path.join('build', 'Release')

function targetPlatform(target, platform) {
    if (!target) {
        return platform
    }
    if (target.includes('windows')) {
        return 'win32'
    }
    if (target.includes('macos') || target.includes('darwin')) {
        return 'darwin'
    }
    if (target.includes('freebsd')) {
        return 'freebsd'
    }
    return 'linux'
}

function is64Bit(target, arch) {
    if (!target) {
        return arch === 'x64' || arch === 'arm64'
    }
    return /^(x86_64|aarch64)-/.test(target)
}

function ensureExists(file) {
    if (!fs.existsSync(file)) {
        throw new Error(`Ghostscript library not found: ${file}. ` +
            'Set GS4JS_HOME to the folder containing the Ghostscript library')
    }
    return file
}

// The addon loads the Ghostscript DLL from its own directory
function copyDll(directory, dll) {
    const outputDir = path.join(directory, OUTPUT_DIR)
    fs.mkdirSync(outputDir, { recursive: true })
    fs.copyFileSync(dll, path.join(outputDir, path.basename(dll)))
}

// Links the Ghostscript of the libgs package: a static library on Linux,
// FreeBSD and macOS, so the addon contains Ghostscript, and a DLL on Windows
function useLibgs(config, libgs, { directory, target, platform, arch }) {
    config.includeDirs.push(libgs.include)
    config.linkerFlags.push(libgs.library)
    switch (targetPlatform(target, platform)) {
        case 'win32':
            // With the MinGW ABI of Zig, iapi.h declares the functions without
            // __stdcall, which on x86 does not match the DLL
            if (!is64Bit(target, arch)) {
                throw new Error('libgs cannot be used to build the addon for Windows x86. ' +
                    `Set ${SYSTEM_OPTIONS.join(', ')} to use the Ghostscript installed on the system`)
            }
            copyDll(directory, libgs.dll)
            break
        case 'darwin':
            config.cxxFlags.push('-fvisibility=hidden')
            config.linkerFlags.push('-lm', '-ldl', '-lpthread', '-liconv')
            break
        default:
            // Exports only the functions that register the addon, so the
            // symbols of Ghostscript and of the libraries it contains, such as
            // zlib, cannot clash with the ones of Node.js and of other addons
            config.linkerFlags.push('-lm', '-ldl', '-lpthread',
                `-Wl,--version-script=${path.join(directory, 'src', 'exports.map')}`)
            // The debug information of the static library triples the size of
            // the addon. It is kept by marmotta build --debug, which runs this
            // configuration in its own process.
            if (!process.argv.includes('--debug')) {
                config.linkerFlags.push('-Wl,--strip-debug')
            }
    }
}

// The folder of the headers of the Ghostscript API: GS4JS_INCLUDE or, when it
// is not set, the include folder of the libgs package, as the API is the same
function systemIncludeDir(libgs) {
    const include = option('GS4JS_INCLUDE')
    if (include) {
        if (!fs.existsSync(path.join(include, 'iapi.h'))) {
            throw new Error(`Ghostscript headers not found: ${path.join(include, 'iapi.h')}. ` +
                'Set GS4JS_INCLUDE to the folder containing iapi.h')
        }
        return include
    }
    if (libgs.installed) {
        return libgs.include
    }
    throw new Error('The headers of the Ghostscript API were not found, because ' +
        `${libgs.name} is not installed. Set GS4JS_INCLUDE to the folder containing iapi.h`)
}

// Links the Ghostscript installed on the system, found with the GS4JS_* options
async function useSystem(config, libgs, { directory, target, platform, arch }) {
    config.includeDirs.push(systemIncludeDir(libgs))
    switch (targetPlatform(target, platform)) {
        case 'win32': {
            const bits = is64Bit(target, arch) ? '64' : '32'
            const home = option('GS4JS_HOME') || 'C:/gs/bin'
            const lib = option('GS4JS_LIB') || `gsdll${bits}.lib`
            const dll = option('GS4JS_DLL') || `gsdll${bits}.dll`
            config.linkerFlags.push(ensureExists(path.join(home, lib)))
            copyDll(directory, ensureExists(path.join(home, dll)))
            break
        }
        case 'darwin': {
            const home = option('GS4JS_HOME') || await findMacOSLibraryPath()
            const lib = option('GS4JS_LIB') || 'libgs.dylib'
            config.cxxFlags.push('-fvisibility=hidden')
            config.linkerFlags.push(ensureExists(path.join(home, lib)))
            // Leaves room for install_name_tool, to load the Ghostscript library
            // through the rpath
            config.linkerFlags.push('-Wl,-headerpad_max_install_names')
            break
        }
        default: {
            const home = option('GS4JS_HOME') || '/usr/lib/x86_64-linux-gnu'
            const lib = option('GS4JS_LIB') || 'libgs.so'
            config.linkerFlags.push(ensureExists(path.join(home, lib)))
        }
    }
}

module.exports = async (context) => {
    const config = {
        name: 'ghostscript4js',
        sources: ['src/ghostscript4js.cc'],
        includeDirs: [require('node-addon-api').include_dir],
        cxxFlags: ['-fexceptions'],
        linkerFlags: [],
        outputDir: OUTPUT_DIR
    }

    const libgs = findLibgs(context.target)
    if (useSystemGhostscript()) {
        await useSystem(config, libgs, context)
        return config
    }
    if (libgs.installed) {
        useLibgs(config, libgs, context)
        return config
    }
    // There is no libgs package for the platform, or npm did not install the optional dependencies
    console.warn(`ghostscript4js: ${libgs.name} is not installed, using the Ghostscript installed on the system`)
    await useSystem(config, libgs, context)
    return config
}
