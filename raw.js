'use strict'

const gs = require('./')
const pdfInvalid = 'invalid.pdf'
async function run() {
  await gs.execute(`-q -dNOPAUSE -sDEVICE=jpeg -o test/out-%02d.jpg -r144 ${pdfInvalid}`)
}

run().catch(err => console.error(err))