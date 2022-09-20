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
import { _SC_crypto } from '../utilities/crypto_class.mjs'
// import { files } from 'jszip'
const makeHash = new _SC_crypto().makeHash
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
var logObj = {module:moduleRelPath, function:'N/A'}
const archiveDirectory = normalize(`${process.cwd()}/../__SARCAT_ARCHIVE`)
/////// Preparing module global variables assigned from _SC / SARCAT_CLASS
var directoryObject; var newFiles; var bundleRegistry; var rawScanFileRegistry; var sarcatConfig; var workingBundle; var updateRegistryEntry


const monthList = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"]
//////////
// async function updateRegistryEntry(updatedObject, db){
//     var key = `${updatedObject.type}s`
//     await db.read()
//     db.data[key] = db.data[key].filter(x=>x.uuid != updatedObject.uuid)
//     db.data[key].push(updatedObject)
//     await db.write()
//     return
// }

async function newBundleObject(bundleDirectoryName, label, addFiles, status, ts, details){
    var endMonthIndex = monthList.indexOf(details.startMonth) + details.bundleDuration-1
        if(endMonthIndex > 11){
            var endMonth = monthList[endMonthIndex-12]
            var endYear = details.startYear + 1
        } else {
            var endMonth = monthList[endMonthIndex]
            var endYear = details.startYear
        }
    var bundleRegistationEntry = {
        "uuid": v4(),
        "label": label,
        "created_ts": ts,
        "modified_ts": ts,
        "bundleStart": `${details.startYear}-${details.startMonth}`,
        "bundleEnd": `${endYear}-${endMonth}`,
        "packageID": sarcatConfig.data.systemIdentification.authorizedSystemSelection,
        "serviceID":sarcatConfig.data.systemIdentification.serviceID,
        "isSolo": details.independent,
        "currentStatus": status,
        "name": bundleDirectoryName,
        "path": `${directoryObject.bundleDirectory}/${label}`,
        "type":"bundle",
        "data":{
            "meta":{},
            "journal": [status],
            "rawFileHashes": addFiles,
        }
    }
    bundleRegistationEntry.data.meta = Object.assign({},bundleRegistationEntry)
    delete bundleRegistationEntry.data.meta.data
    delete bundleRegistationEntry.data.meta.currentStatus
    delete bundleRegistationEntry.data.meta.modified_ts
    bundleRegistationEntry.hash = await makeHash(Buffer.from(JSON.stringify(bundleRegistationEntry.data)))
    return bundleRegistationEntry
}

async function prepBundle(workingBundle, addFiles){
    var ts = Date.now()
    workingBundle.data.journal.push({"action":"added files to bundle", "rawFileHashes":addFiles, "action_ts": ts})
    var bundleStatus = {"status": "in_process", "status_ts":Date.now()}
    var fileStatus = {"status": "in_bundle", "status_ts":Date.now()}
    for(var fileHash of addFiles){
        var fileStatus = {"status": "in_bundle", "status_ts":ts}
        await addRawScanFileToBundle(fileHash, fileStatus, workingBundle.uuid, rawScanFileRegistry)
        workingBundle.data.rawFileHashes.push(fileHash)
    }
    workingBundle.currentStatus = bundleStatus
    workingBundle.modified_ts = bundleStatus.status_ts
    workingBundle.data.journal.push(bundleStatus)
    await updateRegistryEntry(workingBundle, bundleRegistry, 'bundles')
    return workingBundle

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
    var current_dt = DateTime.now()
    var year = current_dt.c.year
    var month = current_dt.c.month
    var monthShort = current_dt.monthShort
    var yearList = []

    var timeLength = [{name: "Year", value:12}, {name: "Quarter", value: 3},{name: "Month", value:1}]
    for(var i=-1;i<6;i++){
        yearList.push(year-i)
    }

    var questions = [
        {
            type: 'list',
            name: 'bundleDuration',
            message: `Time Scope of Bundle`,
            choices: timeLength,
            default: timeLength[2]
        },
        {
            type: 'list',
            name: 'startYear',
            message: `Bundle Start Year`,
            choices: yearList,
            default: yearList[yearList.indexOf(year)]
        },
        {
            type: 'list',
            name: 'startMonth',
            message: `Bundle Start Month`,
            choices: monthList,
            default: monthList[monthList.indexOf(monthShort.toUpperCase())-1]
        }
    ]
    if(priorBundles.length > 0){
        questions.push(
            {
                type: 'confirm',
                name: 'independent',
                message: 'This bundle is a one-off (e.g., not correlated with or connected to other bundles)',
                default: false
            })
    }
    try {
        var bundleDetailsPrompt = new prompt(questions)
        var bundleDetails = await bundleDetailsPrompt.ask()
        return bundleDetails
    } catch(err){
        console.log(err)
    }
}

async function newBundle(){
    await bundleRegistry.read()
    console.log(chalk.greenBright.bold('-----------------\nGenerating Bundle\n-----------------'))
    var label = await addLabel(bundleRegistry)
    var details = await askBundleDetails(bundleRegistry.data.bundles)
    if(details.independent){

    } else {
        var bundleDirectoryName = `SARCAT_bundle_${String(bundleRegistry.data.bundles.length + 1).padStart(4,0)}`
    }

    var status = {"status": "new", "status_ts":Date.now()}
    var bundleRegistationEntry = await newBundleObject(bundleDirectoryName, label, [], status, Date.now(), details)

    bundleRegistry.data.bundles.push(bundleRegistationEntry)
    await bundleRegistry.write()
    return bundleRegistationEntry
}

export async function manageBundleFiles(){
    // (check status of current files. allow selection of current files to parse or re-parse)
    await rawScanFileRegistry.read()

    var currentFiles = rawScanFileRegistry.data.files.filter(x=>workingBundle.data.rawFileHashes.includes(x.data.fileHash))
    var newFiles = rawScanFileRegistry.data.files.filter(x=>x.bundle == null)
    var options = []

    var count = 1
    var parsedFiles = []
    var toParse = []
    if(currentFiles.length > 0){
        await currentFiles.forEach(x=>{
            console.log(`${count}) ${`${x.name} in -> .${x.path.split(`__SARCAT_ARCHIVE`)[1]}/`}`)
            if(x.currentStatus.status != 'New' || x.currentStatus.status != 'in_bundle'  ){
                parsedFiles.push(x.uuid)
            } else {
                toParse.push(x.uuid)
            }
        })
    }
    if(newFiles && newFiles.length>0){
        options.push({"name": `Add more files (${newFiles.length} more files available to add)`, value: {"add":true, "remove":false}})
    }
    if(currentFiles && currentFiles.length > 0){
        console.log(`This bundle has ${chalk.yellowBright.bold(currentFiles.length)} files:`)
        options.push({"name": `Remove some files (${currentFiles.length} files currently in bundle)`, value: {"add":true, "removeSome":true}})
    }

    if(currentFiles.length > 0 && newFiles.length > 0){
        options.push(await sep())
        options.push({"name": "Add and remove files", value: {"addMore":true, "removeSome":true}})

        options.push({"name": "Parse existing files", value: {"addMore":false, "removeSome":false, "toParse": toParse, "parsed": parsedFiles}})
        options.push(await sep())
    }
    if((newFiles && newFiles.length==0) &&(currentFiles && currentFiles.length==0)){
        console.log(chalk.red(`There are no registered files to add to the bundle and no files added to the bundle to remove.`))
    }
    if(options.length > 0){
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
    } else {
        return null
    }

}

async function askAddFiles(){
    var options = []
    var newFiles = rawScanFileRegistry.data.files.filter(x=>x.bundle == null)
    await newFiles.forEach(x=>{
        options.push({"name": `${x.name} in -> .${x.path.split(`__SARCAT_ARCHIVE`)[1]}/`, value:x.data.fileHash})
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

async function selectBundle(){
    var unsealedBundles = bundleRegistry.data.bundles.filter(x=>x.currentStatus.status != "sealed")
    var options = []
    await unsealedBundles.forEach(async (x)=>{
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
        return unsealedBundles.filter(x=>x.uuid == bundleSelection).pop()
    }
}

async function removeFileFromBundle(){

    if(!workingBundle){
        return null
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
    workingBundle.hash = await makeHash(Buffer.from(JSON.stringify(workingBundle.data)))

    for(var file of fileObjects){
        file.currentStatus = fileStatus
        file.data.journal.push(fileStatus)
        file.modified_ts = ts
        file.hash = await makeHash(Buffer.from(JSON.stringify(file.data)))
        await updateRegistryEntry(file, rawScanFileRegistry)
    }
    await updateRegistryEntry(workingBundle, bundleRegistry)
    return
    
}

export async function stageBundle(_SC_classObject){
    directoryObject = _SC_classObject.directoryObject; bundleRegistry =_SC_classObject.bundleRegistry;rawScanFileRegistry = _SC_classObject.rawScanFileRegistry, sarcatConfig=_SC_classObject.sarcatConfig; updateRegistryEntry = _SC_classObject.updateRegistryEntry
    await bundleRegistry.read()
    await rawScanFileRegistry.read()
    workingBundle = await selectBundle()
    if(workingBundle == false){
        workingBundle = await newBundle()
    } else {
        workingBundle.name = workingBundle.dirname
        delete workingBundle.dirname
        delete workingBundle.value
    }

    await bundleRegistry.write()
    await rawScanFileRegistry.write()

    var moreQuestion = await await manageBundleFiles()
    if(moreQuestion) {
        var {add, remove} = moreQuestion 
        if(add == true){
            workingBundle = await prepBundle(workingBundle, await askAddFiles())
        }
        if(remove == true){
            workingBundle = await removeFileFromBundle()
        }
        workingBundle.parsingStage = {toParse: moreQuestion.toParse, parsed: moreQuestion.parsed}
    } 


    return workingBundle
}
// need to connect bundles / manual selection 
// add package ID 
// add service ID