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

// Sets the version of the packages of the prebuilt addons, in the folders of
// npm/, to the version of ghostscript4js, and lists them in its
// optionalDependencies with that version. npm runs it after changing the
// version with npm version. With --check it changes nothing and fails when a
// package is not up to date, as the Release workflow does before publishing.

const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..')
const SCOPE = '@ghostscript4js/'

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function writeJson(file, json) {
    fs.writeFileSync(file, JSON.stringify(json, null, 2) + '\n')
}

function main() {
    const check = process.argv.includes('--check')
    const mainFile = path.join(ROOT, 'package.json')
    const main = readJson(mainFile)
    const errors = []

    const names = []
    for (const entry of fs.readdirSync(__dirname, { withFileTypes: true })) {
        const file = path.join(__dirname, entry.name, 'package.json')
        if (!entry.isDirectory() || !fs.existsSync(file)) {
            continue
        }
        const pkg = readJson(file)
        if (pkg.name !== `${SCOPE}${entry.name}`) {
            errors.push(`${file}: the name must be ${SCOPE}${entry.name}`)
        }
        names.push(pkg.name)
        if (pkg.version !== main.version) {
            errors.push(`${pkg.name} has version ${pkg.version} instead of ${main.version}`)
            pkg.version = main.version
            if (!check) {
                writeJson(file, pkg)
            }
        }
    }

    // The packages of the prebuilt addons, sorted and with the exact version,
    // replace the ones already listed. The other optional dependencies, such
    // as libgs, are kept.
    const others = Object.entries(main.optionalDependencies || {}).filter(([name]) => !name.startsWith(SCOPE))
    const optionalDependencies = Object.fromEntries([...others, ...names.sort().map((name) => [name, main.version])])
    if (JSON.stringify(optionalDependencies) !== JSON.stringify(main.optionalDependencies)) {
        errors.push(`the optionalDependencies of ghostscript4js must list ${names.length} ${SCOPE}* packages ` +
            `with version ${main.version}`)
        main.optionalDependencies = optionalDependencies
        if (!check) {
            writeJson(mainFile, main)
        }
    }

    if (check && errors.length) {
        console.error(errors.join('\n'))
        console.error('Run "node npm/version.js" to update the packages')
        process.exitCode = 1
    }
}

main()
