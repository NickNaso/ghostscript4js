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

const OUTPUT_DIR = path.join('build', 'Release')

// Installation options can be set as environment variables or passed to npm,
// for example: npm install ghostscript4js --GS4JS_HOME="C:/gs/bin"
function option(name) {
    return process.env[name] || process.env[`npm_config_${name.toLowerCase()}`] || ''
}

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

module.exports = async ({ directory, target, platform, arch }) => {
    const config = {
        name: 'ghostscript4js',
        sources: ['src/ghostscript4js.cc'],
        includeDirs: [require('node-addon-api').include_dir],
        cxxFlags: ['-fexceptions'],
        linkerFlags: [],
        outputDir: OUTPUT_DIR
    }

    switch (targetPlatform(target, platform)) {
        case 'win32': {
            const bits = is64Bit(target, arch) ? '64' : '32'
            const home = option('GS4JS_HOME') || 'C:/gs/bin'
            const lib = option('GS4JS_LIB') || `gsdll${bits}.lib`
            const dll = option('GS4JS_DLL') || `gsdll${bits}.dll`
            config.linkerFlags.push(ensureExists(path.join(home, lib)))
            // The addon loads the Ghostscript DLL from its own directory
            const outputDir = path.join(directory, OUTPUT_DIR)
            fs.mkdirSync(outputDir, { recursive: true })
            fs.copyFileSync(ensureExists(path.join(home, dll)), path.join(outputDir, dll))
            break
        }
        case 'darwin': {
            const home = option('GS4JS_HOME') || await findMacOSLibraryPath()
            const lib = option('GS4JS_LIB') || 'libgs.dylib'
            config.cxxFlags.push('-fvisibility=hidden')
            config.linkerFlags.push(ensureExists(path.join(home, lib)))
            // Leaves room for install_name_tool, which makes the prebuilt binaries load
            // the Ghostscript library through the rpath (see .github/workflows/release.yml)
            config.linkerFlags.push('-Wl,-headerpad_max_install_names')
            break
        }
        default: {
            const home = option('GS4JS_HOME') || '/usr/lib/x86_64-linux-gnu'
            const lib = option('GS4JS_LIB') || 'libgs.so'
            config.linkerFlags.push(ensureExists(path.join(home, lib)))
        }
    }

    return config
}
