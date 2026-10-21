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

/*!
 * Module dependencies
 */
const { packageName, findPrebuilt } = require('../prebuilt')
const gs = loadAddon()

// The addon built from source by the install script of the package or, when
// there is none, the prebuilt addon of the platform, installed by npm as an
// optional dependency. The install script builds the addon when there is no
// prebuilt one, but npm 12 and later skip it until the package is allowed to
// run it.
function loadAddon() {
    try {
        return require('bindings')('ghostscript4js')
    } catch (err) {
        if (!err.tries) {
            throw err
        }
        const prebuilt = findPrebuilt()
        if (prebuilt) {
            return require(prebuilt)
        }
        throw new Error(`The ghostscript4js native addon is not installed: ${packageName()} is not installed, so ` +
            'the addon is built from source by the install script of the package, and npm did not run the script ' +
            'or the script failed. npm 12 and later run it only for allowed packages: run ' +
            '"npm install-scripts approve ghostscript4js" and "npm rebuild ghostscript4js", or add ' +
            '"allowScripts": { "ghostscript4js": true } to package.json before installing it. ' +
            'Otherwise run "npm rebuild ghostscript4js --foreground-scripts" to see why the installation failed.',
            { cause: err })
    }
}

module.exports = {

    MAX_SUPPORTED_REVISION: 10080,

    MIN_SUPPORTED_REVISION: 919,

    version() {
        return gs.version()  
    },

    execute(cmd, callback) {
        if (!callback) {
            return new Promise((resolve, reject) => {
                gs.execute(cmd, (err) => {
                    if (err) {
                        reject(err)
                    }
                    resolve()
                })
            });
        } else {
            if (typeof callback !== 'function') {
               throw new TypeError('Parameter callback must be a function')
            }
            return gs.execute(cmd, callback)
        } 
    },

    executeSync(cmd) {
        return gs.executeSync(cmd)
    }

}
