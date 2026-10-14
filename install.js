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

// Installs the addon. The prebuilt binary for the current platform is
// downloaded from the GitHub release of this version. When there is none, or
// it cannot be loaded (for example because Ghostscript is missing or has a
// different major version), the addon is built from source with Marmotta.

const fs = require('fs')
const path = require('path')
const zlib = require('zlib')
const { spawnSync } = require('child_process')
const { version } = require('./package.json')

const ADDON = path.join(__dirname, 'build', 'Release', 'ghostscript4js.node')
const BINARY_HOST = 'https://github.com/NickNaso/ghostscript4js/releases/download'
const DOWNLOAD_TIMEOUT = 60 * 1000

// Same lookup as in marmotta.config.js
function option(name) {
    return process.env[name] || process.env[`npm_config_${name.toLowerCase()}`] || ''
}

function isSet(value) {
    return value !== '' && value !== 'false' && value !== '0'
}

function buildFromSource() {
    return isSet(option('GS4JS_BUILD_FROM_SOURCE')) ||
        isSet(process.env.npm_config_build_from_source || '') ||
        // These options name the library to link, so they only apply to a build
        isSet(option('GS4JS_LIB')) ||
        isSet(option('GS4JS_DLL')) ||
        // A clone of the repository uses its own sources
        fs.existsSync(path.join(__dirname, '.git'))
}

// The platform in the name of the release assets, for example linux-x64,
// linux-x64-musl, darwin-arm64 or win32-x64
function platform() {
    const musl = process.platform === 'linux' && !process.report.getReport().header.glibcVersionRuntime
    return `${process.platform}-${process.arch}${musl ? '-musl' : ''}`
}

async function download(url) {
    const response = await fetch(url, { signal: AbortSignal.timeout(DOWNLOAD_TIMEOUT) })
    if (!response.ok) {
        throw new Error(`HTTP ${response.status}`)
    }
    // gunzip also fails when the download is incomplete
    const addon = zlib.gunzipSync(Buffer.from(await response.arrayBuffer()))
    fs.mkdirSync(path.dirname(ADDON), { recursive: true })
    fs.writeFileSync(ADDON, addon)
}

// The addon loads the Ghostscript DLL from its own directory, as in marmotta.config.js
function copyWindowsDll() {
    const dll = path.join(option('GS4JS_HOME') || 'C:/gs/bin', 'gsdll64.dll')
    if (fs.existsSync(dll)) {
        fs.copyFileSync(dll, path.join(path.dirname(ADDON), 'gsdll64.dll'))
    }
}

// The addon is loaded in another process, so a crash cannot stop the installation
function checkLoad() {
    const script = 'try { require(process.argv[1]).version() } catch (err) { console.error(err.message); process.exit(1) }'
    const result = spawnSync(process.execPath, ['-e', script, ADDON], { encoding: 'utf8' })
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

async function main() {
    if (buildFromSource()) {
        return build()
    }
    const url = `${option('GS4JS_BINARY_HOST') || BINARY_HOST}/${version}/ghostscript4js-${version}-${platform()}.node.gz`
    try {
        await download(url)
        if (process.platform === 'win32') {
            copyWindowsDll()
        }
        checkLoad()
        console.log(`ghostscript4js: installed the prebuilt binary ${url}`)
    } catch (err) {
        console.warn(`ghostscript4js: cannot use the prebuilt binary ${url}: ${err.message}`)
        console.warn('ghostscript4js: building from source')
        fs.rmSync(ADDON, { force: true })
        build()
    }
}

main()
