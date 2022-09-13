import {readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs' //////////Native NodeJS File Management
import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
import path from 'node:path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
var logObj = {module:moduleRelPath, function:'N/A'}
///////////////////////////////////////////////////////
import inquirer from 'inquirer' //////////3rd Party Library for managing command line prompt questions and responses
import figlet from 'figlet' //////////3rd Party Library for diplaying ASCII based art
import chalk from 'chalk' //////////3rd Party Library for command line fonts and colors
import { Easy } from 'easy-lowdb'
import { _SC_crypto } from '../utilities/crypto_class.mjs'
import { _SC_utilities } from '../utilities/index_utilities.mjs'
import { baseManifest } from '../utilities/manifest.mjs'
const dupeCheck = new _SC_utilities().dupeCount
const oldNew = new _SC_utilities().oldNew
const makeHash = new _SC_crypto().makeHash
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
const archiveDirectory = normalize(`${process.cwd()}/../!SARCAT_ARCHIVE!`)
const nullFileHash = `e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855`
/////////////////////////////////////////////////////////////////////////////////////////////////////////
async function checkDuplicates(newManifest){
    var manifestFileHashes = newManifest.data.map(x=>x.data.fileHash)
    var dupeCounts = await dupeCheck(manifestFileHashes)
    var dupeCountKeys = Object.keys(dupeCounts)
    var postDupeCheckFiles = newManifest.data.filter(x=>!dupeCountKeys.includes(x.data.fileHash))
    if(dupeCountKeys.length > 0){
        for(var dKey of dupeCountKeys){
            var dupeFiles = newManifest.data.filter(x=>x.data.fileHash == dKey)
            var paths = dupeFiles.map(x=>`${x.path}/${x.name}`)
            var {oldest, newest} = await oldNew(dupeFiles)
            console.log(`File hash of ...${dKey.slice(-10)} has ${dupeCounts[dKey]} duplicate${dupeCounts[dKey]>1?'s':''}`)
            for(var fPath of paths){
                console.log(`${dKey.slice(-10)} -> .${fPath.split(`!SARCAT_ARCHIVE!`)[1]}`)
            }
            console.log(`Preferring oldest file: ${oldest.data.path}/${oldest.data.name}\n`)
            postDupeCheckFiles.push(oldest)
        }
    }
    return postDupeCheckFiles 
}

async function registerNewFiles(postDupeCheckFiles, rawScanFileRegistry){
    await rawScanFileRegistry.read()
    if(rawScanFileRegistry.data.files.length > 0){
        var registeredFileHashes = rawScanFileRegistry.data.files.map(x=>x.data.fileHash)
    } else {
        var registeredFileHashes = []
    }
    var newUnregisteredFiles = postDupeCheckFiles.filter(x=>!registeredFileHashes.includes(x.data.fileHash))
    console.log(`Registering ${chalk.yellowBright(newUnregisteredFiles.length)} new files`)
    for(var file of newUnregisteredFiles){
        file.currentStatus = {"status":"new", status_ts:Date.now()}
        file.data.journal = [file.currentStatus]
        file.hash = await makeHash(Buffer.from(JSON.stringify(file.data)))
        file.bundle = null
        file.type = 'file'
        file.extension = file.name.split('.')[1]
        rawScanFileRegistry.data.files.push(file)
        console.log(`Registered: .${file.path.split(`!SARCAT_ARCHIVE!`)[1]}/${file.name}`)
    }
    await rawScanFileRegistry.write()
    return rawScanFileRegistry.data.files.filter(x=>x.currentStatus.status == 'new')
}

async function nullFileCheck(newManifest){
    var nullFiles = newManifest.data.filter(x=>x.data.fileHash == nullFileHash)
    if(nullFiles.length > 0){
        console.log(`SARCAT detected several files with null data`)
        for(var file of nullFiles){
            console.log(`${chalk.red(`Null data:`)} .${file.path.split(`!SARCAT_ARCHIVE!`)[1]}/${file.name}`)
        }
    }
    return newManifest.data.filter(x=>x.data.fileHash != nullFileHash)
}

export async function stageRawFiles(directoryObject, rawScanFileRegistry){
    try {
        var newManifest = await baseManifest({targetFolderPath: directoryObject.rawScanFileDirectory, writeFile: false})
        if(!newManifest){
            return null
        } else {
            var newManifest_good = {data: await nullFileCheck(newManifest)}
            var postDupeCheckFiles = await checkDuplicates(newManifest_good)
            return await registerNewFiles(postDupeCheckFiles, rawScanFileRegistry) // <- returns all registered files in new status
        }
    } catch (err){
        console.log(err)
    }

}