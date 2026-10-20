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

// Chooses the Ghostscript library the addon is built with. By default it is
// libgs (https://github.com/NickNaso/libgs), installed as the optional
// dependency @libgs/<platform> matching the system. The Ghostscript installed
// on the system is used instead when one of SYSTEM_OPTIONS is set.

const path = require('path')

// The options that point the build to the Ghostscript installed on the system
const SYSTEM_OPTIONS = ['GS4JS_HOME', 'GS4JS_LIB', 'GS4JS_DLL', 'GS4JS_INCLUDE']

// Installation options can be set as environment variables or passed to npm,
// for example: npm install ghostscript4js --GS4JS_HOME="C:/gs/bin"
function option(name) {
    return process.env[name] || process.env[`npm_config_${name.toLowerCase()}`] || ''
}

function useSystemGhostscript() {
    return SYSTEM_OPTIONS.some((name) => option(name) !== '')
}

// Zig names of the architectures, as in x86_64-linux-gnu, and their names in Node.js
const ZIG_ARCHS = {
    x86_64: 'x64',
    aarch64: 'arm64',
    x86: 'ia32',
    arm: 'arm',
    powerpc64le: 'ppc64',
    s390x: 's390x',
    loongarch64: 'loong64',
    riscv64: 'riscv64'
}

const ZIG_OSES = {
    linux: 'linux',
    macos: 'darwin',
    windows: 'win32',
    freebsd: 'freebsd'
}

function isMusl() {
    return process.platform === 'linux' && !process.report.getReport().header.glibcVersionRuntime
}

// The system a Zig target such as aarch64-linux-musl or x86_64-macos.13 builds for or,
// without a target, the running system
function system(target) {
    if (!target) {
        return {
            platform: process.platform,
            arch: process.arch,
            musl: isMusl(),
            armVersion: process.config.variables.arm_version
        }
    }
    const [arch, os = '', abi = ''] = target.split('-')
    return {
        platform: ZIG_OSES[os.split('.')[0]] || os,
        arch: ZIG_ARCHS[arch] || arch,
        musl: abi.startsWith('musl'),
        // The armv6 and armv7 libraries both have the arm architecture in Zig
        armVersion: '7'
    }
}

// The name of the libgs package for a system. The names keep some historical
// architecture names, which differ from the ones of Node.js.
function packageName({ platform, arch, musl, armVersion }) {
    switch (platform) {
        case 'darwin':
            return `@libgs/darwin-${arch === 'arm64' ? 'aarch64' : arch}`
        case 'win32':
            return `@libgs/win32-${arch === 'ia32' ? 'x86' : arch}`
        case 'freebsd':
            return `@libgs/freebsd-${arch}`
        case 'linux':
            return `@libgs/linux-${musl ? 'musl-' : ''}${arch === 'arm' ? `armv${armVersion}` : arch}`
        default:
            return `@libgs/${platform}-${arch}`
    }
}

// The libgs package for a Zig target or, without one, for the running system:
// its name, the folder of its headers, the library to link and, on Windows, the
// DLL to ship next to the addon. installed is false when npm did not install
// the package, because the platform has none or the optional dependencies were
// omitted.
function findLibgs(target) {
    const name = packageName(system(target))
    let libgs
    try {
        libgs = require(name)
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            return { name, installed: false }
        }
        throw err
    }
    // gs.a, or the import library of gsdll32.dll or gsdll64.dll on Windows
    const library = libgs.files.find((file) => /^(gs\.a|gsdll(32|64)\.lib)$/.test(file))
    if (!library) {
        throw new Error(`The Ghostscript library is missing in ${name}`)
    }
    return {
        name,
        installed: true,
        include: libgs.include,
        library: path.join(libgs.path, library),
        dll: library.endsWith('.lib') ? path.join(libgs.path, library.replace(/\.lib$/, '.dll')) : ''
    }
}

module.exports = {
    SYSTEM_OPTIONS,
    option,
    useSystemGhostscript,
    findLibgs
}
