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
const { SYSTEM_OPTIONS, useSystemGhostscript, findLibgs } = require('../libgs')
const { optionalDependencies } = require('../package.json')

describe('libgs', function () {

  it('Should find the libgs package of a Zig target', function () {
    const packages = {
      'x86_64-linux-gnu.2.28': '@libgs/linux-x64',
      'aarch64-linux-gnu.2.28': '@libgs/linux-arm64',
      'x86_64-linux-musl': '@libgs/linux-musl-x64',
      'aarch64-linux-musl': '@libgs/linux-musl-arm64',
      'arm-linux-gnueabihf': '@libgs/linux-armv7',
      'x86-linux-gnu': '@libgs/linux-ia32',
      'powerpc64le-linux-gnu': '@libgs/linux-ppc64',
      's390x-linux-gnu': '@libgs/linux-s390x',
      'loongarch64-linux-gnu': '@libgs/linux-loong64',
      'riscv64-linux-gnu': '@libgs/linux-riscv64',
      'x86_64-macos': '@libgs/darwin-x64',
      'aarch64-macos.13.5': '@libgs/darwin-aarch64',
      'x86_64-windows': '@libgs/win32-x64',
      'aarch64-windows': '@libgs/win32-arm64',
      'x86-windows': '@libgs/win32-x86',
      'x86_64-freebsd': '@libgs/freebsd-x64'
    }
    for (const [target, name] of Object.entries(packages)) {
      expect(findLibgs(target).name).toBe(name)
      expect(Object.keys(optionalDependencies)).toContain(name)
    }
  })

  it('Should find the libgs package of the running system', function () {
    const libgs = findLibgs()
    expect(Object.keys(optionalDependencies)).toContain(libgs.name)
    if (libgs.installed) {
      expect(fs.existsSync(libgs.include)).toBe(true)
      expect(fs.existsSync(libgs.library)).toBe(true)
      expect(libgs.dll === '' || fs.existsSync(libgs.dll)).toBe(true)
    }
  })

  it('Should use the Ghostscript of the system when a GS4JS option is set', function () {
    const variables = SYSTEM_OPTIONS.flatMap((name) => [name, `npm_config_${name.toLowerCase()}`])
    const saved = {}
    for (const variable of variables) {
      saved[variable] = process.env[variable]
      delete process.env[variable]
    }
    try {
      expect(useSystemGhostscript()).toBe(false)
      for (const name of SYSTEM_OPTIONS) {
        process.env[name] = '/ghostscript'
        expect(useSystemGhostscript()).toBe(true)
        delete process.env[name]
        process.env[`npm_config_${name.toLowerCase()}`] = '/ghostscript'
        expect(useSystemGhostscript()).toBe(true)
        delete process.env[`npm_config_${name.toLowerCase()}`]
      }
    } finally {
      for (const variable of variables) {
        if (saved[variable] !== undefined) {
          process.env[variable] = saved[variable]
        }
      }
    }
  })

})
