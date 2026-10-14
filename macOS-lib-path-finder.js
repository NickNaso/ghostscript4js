'use strict'

const { promisify } = require('util')
const exec = promisify(require('child_process').exec)
const {stat} = require('fs').promises
const path = require('path')


const LIBRARY = 'libgs.dylib'
const SYSTEM_PATH = '/usr/local/lib'

const isLibraryExists = async (libraryPath) => {
    try {
        await stat(libraryPath)
        return true
    } catch (err) {
        return false
    }
}

const isInstalled = async (command) => {
    try {
        await exec(`which ${command}`)
        return true
    } catch (err) {
        return false
    }

}


async function findLibraryPath() {
    try {
        let isGSExists = false
        isGSExists = await isLibraryExists(path.join(SYSTEM_PATH, LIBRARY))
        if (isGSExists) {
            return SYSTEM_PATH
        } else {
            if (!await isInstalled('brew')) {
                return ''
            }
            if (!await isInstalled('gs')) {
                return ''
            }
            const cellarPath = (await exec('brew --cellar')).stdout
            const gsVersion = (await exec('gs --version')).stdout
            const gsLibraryPath = path.join(cellarPath.trim(), 'ghostscript', gsVersion.trim(), 'lib')
            isGSExists = await isLibraryExists(path.join(gsLibraryPath, LIBRARY))

            if (isGSExists) {
                return gsLibraryPath
            } else {
                return ''
            }
        }
    } catch (err) {
        process.emitWarning(err)
        return ''
    }

}

module.exports = findLibraryPath
