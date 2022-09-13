import {DateTime, Duration} from 'luxon'
import humanizeDuration from 'humanize-duration'
import {v4} from 'uuid'
import {readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs' //////////Native NodeJS File Management
import {execSync} from 'node:child_process' //////////Native NodeJS Command Line Process
import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
import { Easy } from 'easy-lowdb'
// import addStandardDirs from './makeBundle.mjs'
import prompt,{sep} from '../utilities/promptUser.mjs'
import chalk from 'chalk'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
var logObj = {module:moduleRelPath, function:'N/A'}
const archiveDirectory = normalize(`${process.cwd()}/../!SARCAT_ARCHIVE!`)
//////////
async function updateRegistryEntry(updatedObject, db){
    var key = `${updatedObject.type}s`
    await db.read()
    db.data[key] = db.data[key].filter(x=>x.uuid != updatedObject.uuid)
    db.data[key].push(updatedObject)
    await db.write()
    return
}

async function newBundleObject(directoryObject, bundleDirectoryName, label, addFiles, status, ts){
    var bundleRegistationEntry = {
        "uuid": v4(),
        "label": label,
        "created_ts": ts,
        "modified_ts": ts,
        "packageID":"",
        "serviceID":"",
        "currentStatus": status,
        "name": bundleDirectoryName,
        "path": directoryObject.bundleDirectory,
        "type":"bundle",
        "data":{
            "journal": [status],
            "rawFileHashes": addFiles
        }
    }
    bundleRegistationEntry.hash = await makeHash(Buffer.from(JSON.stringify(bundleRegistationEntry.data)))
    return bundleRegistationEntry
}

async function prepBundle(bundle, addFiles, bundleRegistry, rawScanFileRegistry){
    var ts = Date.now()
    bundle.data.journal.push({"action":"added files to bundle", "rawFileHashes":addFiles, "action_ts": ts})
    var bundleStatus = {"status": "in_process", "status_ts":Date.now()}
    var fileStatus = {"status": "in_bundle", "status_ts":Date.now()}
    for(var fileHash of addFiles){
        var fileStatus = {"status": "in_bundle", "status_ts":ts}
        await addRawScanFileToBundle(fileHash, fileStatus, bundle.uuid, rawScanFileRegistry)
        bundle.data.rawFileHashes.push(fileHash)
    }
    bundle.currentStatus = bundleStatus
    bundle.modified_ts = bundleStatus.status_ts
    bundle.data.journal.push(bundleStatus)
    await updateRegistryEntry(bundle, bundleRegistry)
    return bundle

}

async function addRawScanFileToBundle(fileHash, fileStatus, bundleUUID, rawScanFileRegistry){
    var ts = fileStatus.status_ts
    await rawScanFileRegistry.read()
    var fileEntry = rawScanFileRegistry.data.files.filter(x=>x.data.fileHash == fileHash)[0]
    fileEntry.currentStatus = fileStatus
    fileEntry.modified_ts = fileStatus.status_ts
    fileEntry.data.journal.push({"action":"added to bundle", "bundle_uuid":bundleUUID, "action_ts": ts})
    fileEntry.data.journal.push(fileStatus)
    fileEntry.bundle = bundleUUID
    fileEntry.hash = await makeHash(Buffer.from(JSON.stringify(fileEntry.data)))
    await updateRegistryEntry(fileEntry, rawScanFileRegistry)
    return
}
async function addLabel(bundleRegistry){
    var question = {
        type: 'input',
        name: 'bundleLabel',
        message: `Please provide a label for this new bundle:`,
        default: `SARCAT_bundle_${String(bundleRegistry.data.bundles.length + 1).padStart(4,0)}`
    }
    try {
        var askBundleLabel = new prompt([question])
        var {bundleLabel} = await askBundleLabel.ask()
        return bundleLabel
    } catch(err){
        console.log(err)
    }
}
async function askBundleDetails(priorBundles){
    var questions = [
            {
        type: 'datetime',
        name: 'bundleStart',
        message: 'Time scope: What is the start date of this bundle?',
        format: ['mm', '/', 'dd', '/', 'yyyy']
        },
        {
            type: 'datetime',
            name: 'bundleEnd',
            message: 'Time scope: What is the end date of this bundle?',
            format: ['mm', '/', 'dd', '/', 'yyyy']
        },
        {
            type: 'confirm',
            name: 'independent',
            message: 'Is this bundle independent or continuation'
        }
    ]
    if(priorBundles.length > 0){

    }
    try {
        var askBundleDetails = new prompt(questions)
        var bundleDetails = await askBundleLabel.ask()
        return bundleDetails
    } catch(err){
        console.log(err)
    }
}

async function newBundle(directoryObject, bundleRegistry){
    await bundleRegistry.read()
    console.log(chalk.greenBright.bold('-----------------\nGenerating Bundle\n-----------------'))
    var label = await addLabel(bundleRegistry)
    var {bundleStart, bundleEnd, independent} = await askBundleDetails(bundleDirectoryName)
    if(independent){

    } else {
        var bundleDirectoryName = `SARCAT_bundle_${String(bundleRegistry.data.bundles.length + 1).padStart(4,0)}`
    }


    var status = {"status": "new", "status_ts":Date.now()}

    var bundleRegistationEntry = await newBundleObject(directoryObject, bundleDirectoryName, label, addFiles, status, Date.now())

    bundleRegistry.data.bundles.push(bundleRegistationEntry)
    await bundleRegistry.write()
    return bundleRegistationEntry
}

async function addMoreQuestion(newFiles, workingBundle, rawScanFileRegistry){
    var currentFiles = rawScanFileRegistry.data.files.filter(x=>workingBundle.data.rawFileHashes.includes(x.data.fileHash))
    
    var options = []
    console.log(`This bundle has ${currentFiles.length} files:`)
    var count = 1
    await currentFiles.forEach(x=>{
        console.log(`${count}) ${`${x.name} in -> .${x.filePath.split(`!SARCAT_ARCHIVE!`)[1]}/`}`)
    })
    if(newFiles.length>0){
        options.push({"name": `Add more files (${newFiles.length} more files available to add)`, value: {"add":true, "remove":false}})
    }
    if(currentFiles.length > 0){
        options.push({"name": `Remove some files (${currentFiles.length} files currently in bundle)`, value: {"add":true, "removeSome":true}})
    }
    options.push(await sep())
    if(currentFiles.length > 0 && newFiles.length > 0){

        options.push({"name": "Add and remove files", value: {"addMore":true, "removeSome":true}})

        options.push({"name": "Parse existing files", value: {"addMore":false, "removeSome":false}})
    }
    options.push(await sep())
    var question =
        {
            type: 'list',
            name: 'bundleFiles',
            message: `What would you like to do`,
            choices: options,
            default: options[0]
        }
    var askWhichFiles = new prompt([question])
    var {bundleFiles} = await askWhichFiles.ask()
    return bundleFiles
}

async function askAddFiles(newFiles){
    var options = []
    await newFiles.forEach(x=>{
        options.push({"name": `${x.name} in -> .${x.filePath.split(`!SARCAT_ARCHIVE!`)[1]}/`, value:x.data.fileHash})
    })
    options.push(await sep())
    var question =
        {
            type: 'checkbox',
            name: 'addFiles',
            message: `Select which files you want to add to the bundle`,
            choices: options,
            default: options[0]
        }
    var askWhichFiles = new prompt([question])
    var {addFiles} = await askWhichFiles.ask()
    return addFiles
}

async function bundleDescription(x){
    return `${x.label} | Status: ${x.currentStatus.status} | Created: ~ ${(humanizeDuration(Date.now() - x.created_ts)).split(', ').slice(0,2).join(' and ')} ago | Modified: ~ ${(humanizeDuration(Date.now() - x.modified_ts)).split(', ').slice(0,2).join(' and ')} ago | UUID: ${x.uuid}`
}

async function selectBundle(bundles){
    var options = []
    await bundles.forEach(async (x)=>{
        x.dirname = x.name
        x.name = await bundleDescription(x)
        x.value = x.uuid
        options.push(x)
        return
    })
    options.push(await sep())
    options.push({name: 'Create New Bundle', value:'new'})
    var question = 
        {
            type: 'list',
            name: 'bundleSelection',
            message: `Select which bundle you want to work with`,
            choices: options,
            default: options[0]
        }
    var askSelect = new prompt([question])
    var {bundleSelection} = await askSelect.ask()
    if(bundleSelection == 'new'){
        return false
    } else {
        return bundles.filter(x=>x.uuid == bundleSelection).pop()
    }
}

export async function removeFileFromBundle(bundleRegistry, rawScanFileRegistry, workingBundle){
    if(!workingBundle){
        var unsealedBundles = bundleRegistry.data.bundles.filter(x=>x.currentStatus.status != "sealed")
        if(unsealedBundles.length > 0){
            var workingBundle = await selectBundle(unsealedBundles)
        } else {
            return null
        }
    }

    var files = rawScanFileRegistry.data.files.filter(x=>workingBundle.data.rawFileHashes.includes(x.data.fileHash))
    var options = []
    await files.forEach(x=>{
        options.push({name: x.name, value: x.data.fileHash})
    })
    workingBundle.name = workingBundle.dirname
    delete workingBundle.dirname
    delete workingBundle.value
    var question = 
    {
        type: 'checkbox',
        name: 'removeFiles',
        message: `Select which files you want to remove from ${workingBundle.label}`,
        choices: options,
        default: options[0]
    }
    var askSelect = new prompt([question])
    var {removeFiles} = await askSelect.ask()
    var fileObjects = files.filter(x=>removeFiles.includes(x.data.filehash))
    var ts = Date.now()
    var fileStatus = {"status": "new", "status_ts": ts}
    var bundleAction = {"action": "removed files", rawFileHashes: removeFiles, "action_ts": ts}
    workingBundle.data.journal.push(bundleAction)
    workingBundle.modified_ts = ts
    workingBundle.data.rawFileHashes = workingBundle.data.rawFileHashes.filter(x=>!removeFiles.includes(x))
    console.log(workingBundle.data.rawFileHashes)
    workingBundle.hash = await makeHash(Buffer.from(JSON.stringify(workingBundle.data)))

    for(var file of fileObjects){
        file.currentStatus = fileStatus
        file.data.journal.push(fileStatus)
        file.modified_ts = ts
        file.hash = await makeHash(Buffer.from(JSON.stringify(file.data)))
        await updateRegistryEntry(file, rawScanFileRegistry)
    }
    await updateRegistryEntry(workingBundle, bundleRegistry)
    console.log("done")
    return
    
}

export async function stageBundle(directoryObject, newFiles, bundleRegistry,rawScanFileRegistry){
    await bundleRegistry.read()
    var unsealedBundles = bundleRegistry.data.bundles.filter(x=>x.currentStatus.status != "sealed")
    if(unsealedBundles.length > 0){
        var workingBundle = await selectBundle(unsealedBundles)
        workingBundle.name = workingBundle.dirname
        delete workingBundle.dirname
        delete workingBundle.value
        if(workingBundle == false){
            workingBundle = await newBundle(directoryObject, bundleRegistry)
        } else {
            var {addMore, removeSome} = await addMoreQuestion(newFiles, workingBundle, rawScanFileRegistry)
            console.log(addMore, removeSome)
            console.log()
            if(addMore == true){
                workingBundle = await prepBundle(workingBundle, await askAddFiles(newFiles), bundleRegistry, rawScanFileRegistry)
            }
            if(removeSome == true){
                workingBundle = await removeFileFromBundle(bundleRegistry, rawScanFileRegistry, workingBundle)
            }
            
        }
    } else {
        var workingBundle = await newBundle(directoryObject, bundleRegistry)
    }
    // await addStandardDirs(`${workingBundle.path}/${workingBundle.name}`)
    await bundleRegistry.write()
    if(rawScanFileRegistry){
        await rawScanFileRegistry.write()
    }
    return workingBundle
}
// need to connect bundles / manual selection 
// add package ID 
// add service ID