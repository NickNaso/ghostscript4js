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
// Invalid PDF file by taking a text file with Lorem ipsum text and renaming to have .pdf extension
const pdfInvalid = 'invalid.pdf'
const ps = 'node-love-ghostscript.ps'
const pngSync = 'node-love-ghostscript-sync.png'
const pngAsync = 'node-love-ghostscript-async.png'
const pngSyncArray = 'node love ghostscript sync.png'
const pngAsyncArray = 'node love ghostscript async.png'
const pdfSync = 'node-love-ghostscript-sync.pdf'
const pdfAsync = 'node-love-ghostscript-async.pdf'
const pdfSyncArray = 'node love ghostscript sync.pdf'
const pdfAsyncArray = 'node love ghostscript async.pdf'
// PDF with an unterminated text object and string that Ghostscript repairs with a warning
const pdfDamaged = 'damaged.pdf'

const cmdSyncPng = `-psconv -q -dNOPAUSE -sDEVICE=pngalpha -o ${pngSync} -sDEVICE=pngalpha -r144 ${pdf}`
const cmdAsyncPng = `-psconv -q -dNOPAUSE -sDEVICE=pngalpha -o ${pngAsync} -sDEVICE=pngalpha -r144 ${pdf}`
const cmdSyncPngArray = ['-psconv', '-q', '-dNOPAUSE', '-sDEVICE=pngalpha', '-o', `${pngSyncArray}`, '-sDEVICE=pngalpha', '-r144', `${pdf}`]
const cmdAsyncPngArray = ['-psconv', '-q', '-dNOPAUSE', '-sDEVICE=pngalpha', '-o', `${pngAsyncArray}`, '-sDEVICE=pngalpha', '-r144', `${pdf}`]

const cmdInvalidPdf = `-q -dNOPAUSE -sDEVICE=jpeg -o test/out-%02d.jpg -r144 ${pdfInvalid}`
const cmdSyncPdf = `-psconv -q -dNOPAUSE -sDEVICE=pdfwrite -o ${pdfSync} -f ${ps}`
const cmdAsyncPdf = `-psconv -q -dNOPAUSE -sDEVICE=pdfwrite -o ${pdfAsync} -f ${ps}`
const cmdSyncPdfArray = ['-psconv', '-q', '-dNOPAUSE', '-sDEVICE=pdfwrite', '-o', `${pdfSyncArray}`, '-f', `${ps}`]
const cmdAsyncPdfArray = ['-psconv', '-q', '-dNOPAUSE', '-sDEVICE=pdfwrite', '-o', `${pdfAsyncArray}`, '-f', `${ps}`]
const cmdDamagedPdf = `-q -dNOPAUSE -dBATCH -sDEVICE=nullpage ${pdfDamaged}`
const cmdDamagedPdfStopOnWarning = `-q -dNOPAUSE -dBATCH -dPDFSTOPONWARNING -sDEVICE=nullpage ${pdfDamaged}`

function createDamagedPdf() {
  const content = 'BT /F1 12 Tf 72 700 Td (Hello) Tj ET\nBT /F1 12 Tf 72 600 Td ( unterminated string Tj ET\n'
  const objects = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 5 0 R >> >> /Contents 4 0 R >>',
    `<< /Length ${content.length} >>\nstream\n${content}endstream`,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>'
  ]
  let pdf = '%PDF-1.4\n'
  const offsets = objects.map((object, i) => {
    const offset = pdf.length
    pdf += `${i + 1} 0 obj\n${object}\nendobj\n`
    return offset
  })
  const xref = pdf.length
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`
  pdf += offsets.map((offset) => `${String(offset).padStart(10, '0')} 00000 n \n`).join('')
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`
  fs.writeFileSync(pdfDamaged, pdf)
}

function cleanup() {
  console.log('Start cleanup ...')
  try {
    fs.unlinkSync(pngSync)
    fs.unlinkSync(pngAsync)
    fs.unlinkSync(pdfSync)
    fs.unlinkSync(pdfAsync)
    fs.unlinkSync(pngSyncArray)
    fs.unlinkSync(pngAsyncArray)
    fs.unlinkSync(pdfSyncArray)
    fs.unlinkSync(pdfAsyncArray)
    fs.unlinkSync(pdfDamaged)
    console.log('Cleanup competed')
  } catch (err) {
    console.log('Nothing to clean');
  }
}

describe('Test ghostscript4js', function () {

  beforeAll(function () {
    cleanup()
    createDamagedPdf()
  })

  it('Should return the version of Ghoscript', function () {
      expect(gs.version).not.toThrow()
      const version = gs.version()
      expect(version.product).toContain('GPL Ghostscript')
      expect(version.copyright).toContain('Copyright (C)')
      expect(version.copyright).toContain('Artifex Software, Inc.  All rights reserved.')
      expect(version.revision).not.toBeLessThan(gs.MIN_SUPPORTED_REVISION)
      expect(version.revisiondate).not.toBeLessThan(20160323)
  })

  it('Should execute Ghostscript command synchronous', function () {
    const executeSync = async function execute() {
      return gs.executeSync(cmdSyncPng)
    }
    expect(executeSync).not.toThrow()
  })

  it('Should execute Ghostscript command synchronous with array based API', function () {
    const executeSync = async function execute() {
      return gs.executeSync(cmdSyncPngArray)
    }
    expect(executeSync).not.toThrow()
  })

  it('Should execute Ghostscript command synchronous without parameters and fail with error', function () {
    expect(gs.executeSync).toThrowError('Sorry method\'s argument should be a string or an array of strings');
  })

  it('Should execute Ghostscript command asynchronous', async function () {
    const execute = async function execute() {
      return gs.execute(cmdAsyncPng)
    }
    await expectAsync(execute()).not.toBeRejected()
    await expectAsync(execute()).toBeResolved()
  })

  it('Should execute Ghostscript command asynchronous with array based API', async function () {
    const execute = async function execute() {
      return gs.execute(cmdAsyncPngArray)
    }
    await expectAsync(execute()).not.toBeRejected()
    await expectAsync(execute()).toBeResolved()
  })

  it('Should execute Ghostscript command synchronous', function () {
    const executeSync = async function execute() {
      return gs.executeSync(cmdSyncPdf)
    }
    expect(executeSync).not.toThrow()
  })

  it('Should execute Ghostscript command synchronous with array based API', function () {
    const executeSync = async function execute() {
      return gs.executeSync(cmdSyncPdfArray)
    }
    expect(executeSync).not.toThrow()
  })

  it('Should execute Ghostscript command asynchronous', async function () {
    const execute = async function execute() {
      return gs.execute(cmdAsyncPdf)
    }
    await expectAsync(execute()).not.toBeRejected()
    await expectAsync(execute()).toBeResolved()
  })

  it('Should execute Ghostscript command asynchronous with array based API', async function () {
    const execute = async function execute() {
      return gs.execute(cmdAsyncPdfArray)
    }
    await expectAsync(execute()).not.toBeRejected()
    await expectAsync(execute()).toBeResolved()
  })

  it('Should throw an error if ghostscript command returns nonzero exit code', async function () { 
    const execute = async function execute() {
      return gs.execute(cmdInvalidPdf)
    }   
    await expectAsync(execute()).toBeRejected()
    await expectAsync(execute()).not.toBeResolved()
    await expectAsync(execute()).toBeRejectedWithError('Sorry error happened executing Ghostscript command. Error code: -100')
  })

  it('Should execute Ghostscript command asynchronous without parameters and fail', async function () {
    const execute = async function execute() {
      return gs.execute()
    }  
    await expectAsync(execute()).toBeRejected()
    await expectAsync(execute()).not.toBeResolved()
    await expectAsync(execute()).toBeRejectedWithError('Sorry method\'s argument should be a string or an array of strings')
  })

  it('Should repair a damaged PDF and succeed by default', async function () {
    await expectAsync(gs.execute(cmdDamagedPdf)).toBeResolved()
  })

  it('Should fail on a damaged PDF with -dPDFSTOPONWARNING', async function () {
    // -dPDFSTOPONWARNING is supported by the PDF interpreter of Ghostscript 10
    if (gs.version().revision < 10000) {
      pending('Ghostscript 10 or later is required')
    }
    expect(() => gs.executeSync(cmdDamagedPdfStopOnWarning)).toThrowError('Sorry error happened executing Ghostscript command. Error code: -100')
    await expectAsync(gs.execute(cmdDamagedPdfStopOnWarning)).toBeRejectedWithError('Sorry error happened executing Ghostscript command. Error code: -100')
  })

  afterAll(cleanup)

})