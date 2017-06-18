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

'use strict';

/*!
 * Module dependencies
 */
const gs = require('../')
const fs = require('fs')

process.chdir(__dirname) 

const pdf = 'node-love-ghostscript.pdf'
const pngSync = 'node-love-ghostscript-sync.png'
const pngAsync = 'node-love-ghostscript-async.png'
const cmdSync = `-psconv -q -dNOPAUSE -sDEVICE=pngalpha -o ${pngSync} -sDEVICE=pngalpha -r144 ${pdf}`
const cmdAsync = `-psconv -q -dNOPAUSE -sDEVICE=pngalpha -o ${pngAsync} -sDEVICE=pngalpha -r144 ${pdf}`

console.log('Start cleanup ...')
try {
  fs.unlinkSync(pngSync)
  fs.unlinkSync(pngAsync)
  console.log('Cleanup competed')
} catch (err) {
  console.log('Nothing to clean');
}

describe('Test ghostscript4js', function () {

  it('Should return the version of Ghoscript', function () {
      expect(gs.version).not.toThrow()
      const version = gs.version()
      expect(version.product).toContain('GPL Ghostscript')
      expect(version.copyright).toContain('Copyright (C) 2016 Artifex Software, Inc.  All rights reserved.')
      expect(version.product).not.toBeLessThan(gs.MIN_SUPPORTED_REVISION)
      expect(version.product).not.toBeLessThan(20160323)
  })

  it('Should execute Ghostscript command synchronous', function () {
    try {
      gs.executeSync(cmdSync)
    } catch (err) {
      // Handle error
      throw err
    }
  })

  it('Should execute Ghostscript command asynchronous', function (done) {
    gs.execute(cmdAsync)
    .then(() => {
      done()
    })
    .catch((err) => {
      done()
    })   
  })


  /*it('Should execute Ghostscript command to convert from PDF to PDF/A synchronously', function () {
    try {
      gs.executeSync('-dPDFA -dBATCH -dNOPAUSE -sProcessColorModel=DeviceCMYK -sDEVICE=pdfwrite -sPDFACompatibilityPolicy=1 -sOutputFile=my-pdfa-sync.pdf node-love-ghostscript.pdf')
    } catch (err) {
      // Handle error
      throw err
    }
  })

  it('Should execute Ghostscript command to convert from PDF to PDF/A synchronously', function (done) {
    gs.execute('-dPDFA -dBATCH -dNOPAUSE -sProcessColorModel=DeviceCMYK -sDEVICE=pdfwrite -sPDFACompatibilityPolicy=1 -sOutputFile=my-pdfa-async.pdf node-love-ghostscript.pdf')
    .then(() => {
      done()
    })
    .catch((err) => {
      done()
    })   
  })*/

})