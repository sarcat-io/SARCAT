
import {readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, readdir} from 'node:fs' //////////Native NodeJS File Management
import {execSync} from 'node:child_process' //////////Native NodeJS Command Line Process
import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
const archiveDirectory = normalize(`${process.cwd()}/../!SARCAT_ARCHIVE!`)
import { Easy } from 'easy-lowdb'
import prompt from './utilities/promptUser.mjs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
var logObj = {module:moduleRelPath, function:'N/A'}
import { _SC } from './sarcat_class.mjs'
const SC = new _SC(archiveDirectory, moduleRelPath)
var _ef = await SC.loadUtility('enumerateFolder')
// /////////////////////////////////////////////////////////////////////////////
// const sarcatConfig = new Easy(`config.sarcat`, archiveDirectory) 
// await sarcatConfig.read()
// // const bundleRegistry = new Easy(`bundleRegistry.sarcat`, directoryObject.archiveDirectory)
// // await bundleRegistry.read()
// // const rawScanFileRegistry = new Easy('rawScanFileRegistry.sarcat',`${directoryObject.archiveDirectory}`)
// // await rawScanFileRegistry.read()
// // const authorizationRuleRegistry = new Easy('authorizationRuleRegistry.sarcat',`${directoryObject.archiveDirectory}`)
// // await authorizationRuleRegistry.read()
// // const fedrampSystems = new Easy('fedrampSystems', directoryObject.registryDirectory)
// // await fedrampSystems.read()
// // const archiveTemplateRegistry = new Easy('archive',`${directoryObject.templateDirectory}/archive`)
// // await archiveTemplateRegistry.read()
// // await archiveTemplateRegistry.write()

// // import { setupAchive }from './00_setup/archive.mjs'
// // import { stageRawFiles } from './00_setup/rawFiles.mjs'
// // import { stageBundle, removeFileFromBundle } from './00_setup/bundle.mjs'
// // import parseScanFiles from './20_parse/index.mjs'

// // async function checkUpdateRoute(workingBundle){
// //     check() // check if all fields and all related records and references are accurate and up to date
// //     // if(required)
// //     update() // status, manifests, files, archive
// //     // once updated route the bundle to the next step of the process
// //     route() // to function
// //     /**
// //      * always asks to pick bundle from unsealed bundles  
// //      * then if there are new raw files asks if adding
// //      * if adding, notify that any downstream artifacts and processes will be re-run.
// //      * statuses: 
// //      *      new, in_process, sealed, validated, committed, , completed
// //      *      new: brand new to one group of unparsed files added
// //      *      in_process: parsed ot more than one group of files, 20 (all added files parsed), 30-40-50 (all deliverables created),60(all files, manifests, and scripts added to bundle),70,90 | if validation completes successfully
// //      *      validated:
// //      *      committed: -> generates the nonce json file signed by ISSO that is counter-signed by the AO
// //      *      completed: countersigned nonce json file is added to the bundle and confirmed.
// //      */

// // }

// // async function _main_(){
// //     // first run
// //     await setupAchive(sarcatConfig, archiveTemplateRegistry, fedrampSystems)
// //     // directoryObject.logControl = new LogControl({consoleMin:'info'},{outputDirectory: directoryObject.logOutputDirectory})
    
// //     // default every run adds new files in the rawScanFile directory
// //     var newRawFiles = await stageRawFiles(scDirs, rawScanFileRegistry)
// //     if(!newRawFiles || newRawFiles.length == 0){
// //         return
// //     } else {
// //         var workingBundle = await stageBundle(scDirs, newRawFiles, bundleRegistry, rawScanFileRegistry)
// //     }
// //     //check bundle and confirm or  update status
// //     workingBundle = await parseScanFiles(scDirs, workingBundle, rawScanFileRegistry, bundleRegistry)


// // }
// // _main_()