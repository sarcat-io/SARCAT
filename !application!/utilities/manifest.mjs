import {v4} from 'uuid'
import {Easy} from 'easy-lowdb'
import {readdirSync, createReadStream, statSync} from 'node:fs'
import {EventEmitter} from 'node:events'
import chalk from 'chalk'
import { _SC_crypto } from '../utilities/crypto_class.mjs'
import { _SC_utilities } from '../utilities/index_utilities.mjs'
import { _SC_templates } from '../../templates/index_templates.mjs'
const dirIt = new _SC_utilities().directoryIterator
const _crypto = new _SC_crypto()
const {makeHash} = _crypto

const g_manifestObjects = []

async function lines(data_utf){
    var meta = {}
    meta.line_count = data_utf.length
    meta.line_count_distribution = {}
    for(var l of data_utf){
        meta.line_count_distribution[l.length]||=0
        meta.line_count_distribution[l.length]++
    }
    return meta
}

async function fileStats({name, path}){
    var {birthtimeMs, mtimeMs, size, blocks, blksize} = statSync(`${path}/${name}`)
    return {birthtimeMs:birthtimeMs, mtimeMs:mtimeMs, size:size, blocks:blocks, blksize:blksize}
}

async function fileData({name, path}, singleFile){
    var fileHash
    var meta
    var data
    var bufferCatch = []
    var file_rs = new createReadStream(`${path}/${name}`)
    file_rs.on('data', async (data) => {
        bufferCatch.push(data)

    })
    file_rs.on('end', async () =>{
        data = Buffer.concat(bufferCatch)
        var data_utf = data.toString('utf-8').split('\n')
        meta = await lines(data_utf)
        fileHash = await makeHash(data.toString('utf-8'))
        singleFile.emit('done', {line_count: meta.line_count, line_count_distribution: meta.line_count_distribution, fileHash: fileHash, data:data})
    })
}

async function finalizeManifest({targetFolderPath, data, writeFile}){
    var manifest = {}
    manifest.uuid = v4()
    manifest.created_ts = Date.now()
    manifest.hash = await makeHash(Buffer.from(JSON.stringify(data)))
    manifest.data = data
    manifest.targetFolderPath = targetFolderPath
    manifest.targetFolder = targetFolderPath.split('/').pop()
    manifest.top = true
    if(writeFile == true){
        var _ez = new Easy('test',`${targetFolderPath}`)
        await _ez.read()
        _ez.data.manifest = manifest
        await _ez.write()
    }
    return manifest
}


export async function baseManifest (configObject, rawScanFileRegistry) {
    var {targetFolderPath, writeFile} = configObject
    if(writeFile == null) {
        writeFile = false
    }
    var targetFolder = targetFolderPath.split('/').slice(-2).join('/')
    var fileDone = new EventEmitter
    var folderContents = await dirIt(targetFolderPath, false)
    var alreadyRegistered = 0
    if(folderContents.length > 0){
        await folderContents.forEach(async (x)=> {
            x.targetFolder = x.path.split('/').pop()
            var stats = await fileStats(x)
            var current = rawScanFileRegistry.data.files.filter(y=>(x.name == y.name && x.path == y.path) && stats.size == y.data.size)
            if(current.length == 0){
                var singleFile = new EventEmitter
                fileData(x, singleFile)
                singleFile.on('done', data => {
                    fileDone.emit('file',Object.assign({}, x, stats, data))
                })
            } else {
                alreadyRegistered++
            }
        })
        return new Promise ((resolve, reject) =>fileDone.on('file', async (data) => {
            delete data.data
            var finalObject = {uuid: v4(), create_ts: Date.now(), hash: await makeHash(Buffer.from(JSON.stringify(data))), name: data.name, targetFolder: data.targetFolder, path: data.path,data: data}
            g_manifestObjects.push(finalObject)
            if(g_manifestObjects.length + alreadyRegistered == folderContents.length){
                resolve(await finalizeManifest({targetFolderPath: targetFolderPath, data:g_manifestObjects, writeFile: writeFile}))
            }
        }))
    } else {
        console.log(`No contents found in the container volume directory: ${chalk.inverse(targetFolder)}\nTo resolve this: On the host system that is running the SARCAT Container, copy files to this directory:\n${chalk.dim('-')}\n${chalk.yellowBright(`${process.argv[2]}/${targetFolder}`)}\n${chalk.dim('-')}\n${chalk.whiteBright.bold(`Make Note:  `)}${chalk.greenBright(`Re-run SARCAT once files are added to the directory above`)}\n${chalk.dim('-')}`)
        return null
    }
    

    
}

async function validateHash({data, hash}, isNotObject){
    if(isNotObject){
    } else {
        data = Buffer.from(JSON.stringify(data))
    }
    var newHash = await makeHash(data)
    if(newHash == hash){
        return true
    } else {
        return false
    }
}

async function integrityCheck(manifest){
    var results = []
    if(manifest.top){
        results.push({top: true, targetFolder: g_manifestObjects.targetFolder,result: await validateHash(manifest)})
        for(var d of manifest.data){
            results = results.concat(await integrityCheck(d))
        }
    }  else if(manifest.data.fileHash){
        results.push({top: false, object: true, file: false, name: manifest.name, targetFolder: manifest.targetFolder,result: await validateHash(manifest)})
        var singleFile = new EventEmitter
        fileData(manifest, singleFile)
        results.push(await new Promise ((resolve, reject) => singleFile.on('done', async (data) => {
            var hashResult = 'fail'
            var line_count = 'fail'
            var line_count_distribution = 'fail'
            if(await validateHash({data:data.data, hash:manifest.data.fileHash}, true)){
                hashResult = 'pass'
            }
            if(data.line_count == manifest.data.line_count){
                line_count = 'pass'
            }
            var passCount = 0
            for(var k in manifest.data.line_count_distribution){
                if(manifest.data.line_count_distribution[k] == data.line_count_distribution[k]){
                    passCount++
                }
            }
            if(passCount == Object.keys(manifest.data.line_count_distribution).length){
                line_count_distribution = 'pass'
            }
            resolve({top: false, object:false, file: true, name: manifest.name, path: manifest.path, targetFolder: manifest.targetFolder, 
                fileHashCheck:hashResult, line_count_check: line_count, line_count_distribution: line_count_distribution, 
                checkHashes: {storedHash: manifest.data.fileHash, checkHash: data.fileHash}})
        })))
    } 
    return results
}


export async function manifestIntegrity({targetFolderPath}){
    var _ez = new Easy('test',`${targetFolderPath}`)
    await _ez.read()
    return await integrityCheck(_ez.data.manifest)
}

// export async function stageManifest(){

// }



// async function testBaseManifest(){
//     var cO = {
//         "targetFolderPath": `/Users/brianthompson/Code/SARCAT`
//     }
//     var res = await baseManifest(cO)
//     // console.log(res)
// }

// async function testmanifestIntegrity(){
//     var cO = {
//         "targetFolderPath": `/Users/brianthompson/Code/SARCAT`
//     }
//     console.log(await manifestIntegrity(cO))

// }

// async function testConvert(){
//     var cO = {
//         "targetFolderPath": `/Users/brianthompson/Code/SARCAT`
//     }
//     var res = await manifestIntegrity(cO)

//     convert(res)
// }
// // testConvert()
// // testmanifestIntegrity()
// // testBaseManifest()