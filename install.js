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

// Installs the addon. npm installs the prebuilt addon of the platform, which
// contains Ghostscript from libgs (on Windows the DLL of libgs is next to it),
// as the optional dependency @ghostscript4js/<platform>, and it is loaded once
// to check that it works. When there is none, or it cannot be loaded, the addon
// is built from source with Marmotta. It is always built from source to use the
// Ghostscript installed on the system, chosen with the GS4JS_HOME, GS4JS_LIB,
// GS4JS_DLL and GS4JS_INCLUDE options.

const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')
const { option, isSet, useSystemGhostscript } = require('./libgs')
const { packageName, findPrebuilt } = require('./prebuilt')

const ADDON = path.join(__dirname, 'build', 'Release', 'ghostscript4js.node')

function buildFromSource() {
    return isSet(option('GS4JS_BUILD_FROM_SOURCE')) ||
        isSet(process.env.npm_config_build_from_source || '') ||
        // The prebuilt addons use libgs, not the Ghostscript of the system
        useSystemGhostscript() ||
        // A clone of the repository uses its own sources
        fs.existsSync(path.join(__dirname, '.git'))
}

// The addon is loaded in another process, so a crash cannot stop the installation
function checkLoad(addon) {
    const script = 'try { require(process.argv[1]).version() } catch (err) { console.error(err.message); process.exit(1) }'
    const result = spawnSync(process.execPath, ['-e', script, addon], { encoding: 'utf8' })
    if (result.status !== 0) {
        throw new Error(result.stderr.trim() || `the process ended with ${result.signal || result.status}`)
    }
}

function build() {
    const marmotta = path.join(path.dirname(require.resolve('marmotta/package.json')),
        require('marmotta/package.json').bin.marmotta)
    const result = spawnSync(process.execPath, [marmotta, 'build'], { cwd: __dirname, stdio: 'inherit' })
    if (result.error) {
        console.error(result.error.message)
    }
    process.exitCode = result.status ?? 1
}

function main() {
    if (buildFromSource()) {
        return build()
    }
    const name = packageName()
    const addon = findPrebuilt()
    if (!addon) {
        console.warn(`ghostscript4js: ${name} is not installed, building from source`)
        return build()
    }
    try {
        checkLoad(addon)
    } catch (err) {
        console.warn(`ghostscript4js: cannot load the prebuilt addon of ${name}: ${err.message}`)
        console.warn('ghostscript4js: building from source')
        return build()
    }
    // The addon built from source is loaded before the prebuilt one, so the
    // one of a previous installation, for example with the Ghostscript of the
    // system, is removed
    fs.rmSync(ADDON, { force: true })
    console.log(`ghostscript4js: using the prebuilt addon of ${name}`)
}

main()
