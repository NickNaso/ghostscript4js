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

// Finds the prebuilt addon of the running system. Each platform has its own
// package, @ghostscript4js/<platform>, published from the folder npm/<platform>
// and installed by npm as an optional dependency, as the libgs packages. The
// addon is the main file of the package.

const { isMusl } = require('./libgs')

// The platform in the name of the packages, for example linux-x64,
// linux-x64-musl, darwin-arm64 or win32-x64. The 32-bit ARM addons are
// different for armv6 and armv7, as the libgs libraries.
function platform() {
    const arch = process.arch === 'arm' ? `armv${process.config.variables.arm_version}` : process.arch
    return `${process.platform}-${arch}${isMusl() ? '-musl' : ''}`
}

function packageName() {
    return `@ghostscript4js/${platform()}`
}

// The path of the prebuilt addon, or an empty string when npm did not install
// its package, because the platform has none or the optional dependencies were
// omitted
function findPrebuilt() {
    try {
        return require.resolve(packageName())
    } catch (err) {
        if (err.code === 'MODULE_NOT_FOUND') {
            return ''
        }
        throw err
    }
}

module.exports = {
    packageName,
    findPrebuilt
}
