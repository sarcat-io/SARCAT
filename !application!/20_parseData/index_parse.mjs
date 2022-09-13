///////////////////////////////////////////////////////////////////////////////////////////////////
//////////This Module Native Dependencies
///////////////////////////////////////////////////////////////////////////////////////////////////
import {readdirSync, readFileSync} from 'node:fs' //////////Native NodeJS File Management
import {execSync} from 'node:child_process' //////////Native NodeJS Command Line Process
import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
import makeHash from '../utilities/newHash.mjs'
// import { LogControl } from "./log_management.mjs" //////////Log Management Class written by SARCAT using only Native Nodejs
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
///////////////////////////////////////////////////////////////////////////////////////////////////
//////////This Module Dependencies
///////////////////////////////////////////////////////////////////////////////////////////////////
var logObject = {module:moduleRelPath, function:'N/A'}
import {Easy} from 'easy-lowdb' //////////JSON Data Management Library Written by SARCAT
import chalk from 'chalk'
import isDocker from 'is-docker'; //////////Checks if this module is running in a container
import semver from 'semver' //////////Tool for parsing and comparing parser dependency versions
import promptUser from '../utilities/promptUser.mjs'
import {updateRegistryEntry} from '../utilities/updateSingleEntryRegistry.mjs'
import prompt from 'inquirer/lib/ui/prompt.js'
///update to classes
const archiveDirectory = normalize(`${process.cwd()}/../!SARCAT_ARCHIVE!`)
const templateDirectory = normalize(`${process.cwd()}/../templates`)
const registryDirectoy = normalize(`${process.cwd()}/../registry`)
const rawFileDirectory = `${archiveDirectory}/rawScanFiles`
const rawScanFileRegistry = new Easy('rawScanFileRegistry.sarcat',`${archiveDirectory}`)
await rawScanFileRegistry.read()
///////////////////////////////////////////////////////////////////////////////////////////////////
//////////Parser Dependency Check
///////////////////////////////////////////////////////////////////////////////////////////////////
var _db_parsers = new Easy('parser_index',__dirname)
const packageJSON = JSON.parse(readFileSync(`${process.cwd()}/package.json`))
await _db_parsers.read()
///////////////////////////////////////////////////////////////////////////////////////////////////
//////////Utility Functions
///////////////////////////////////////////////////////////////////////////////////////////////////
async function exists(uuid){
    var res = _db_parsers.data.parser_index.filter(x=>x.uuid == uuid)
    if(res.length > 0){
        return true
    } else {
        return false
    }
}

async function iterateDir(targetDirectory){
    var fp_files = []
    var rawScanFiles = readdirSync(targetDirectory,{withFileTypes:true})
    var dirs = rawScanFiles.filter(x=>x.isDirectory())
    var files = rawScanFiles.filter(x=>x.isFile())
    for(var d of dirs){
        fp_files.push(...await iterateDir(`${targetDirectory}/${d.name}`))
    }
    for(var fn of files){
        fp_files.push({fileName: fn.name, path:targetDirectory, extension: fn.name.split('.')[1]})
    }
    return fp_files
}

///////////////////////////////////////////////////////////////////////////////////////////////////
//////////This Module Functions
///////////////////////////////////////////////////////////////////////////////////////////////////

//////////////////////////////////////////////////////////////////////////
//////////Parser tool integration functions
//////////////////////////////////////////////////////////////////////////

async function registerParsers(){
    _db_parsers.data.parser_index = []
    var parserModules = await iterateDir(`${__dirname}/parsers`)
    parserModules = parserModules.filter(x=>x.fileName == '.sarcat')
    for(var module of parserModules){
        var sarcat_id_path = `${module.path}/${module.fileName}`
        var sarcat_ID = JSON.parse(readFileSync(sarcat_id_path))
        sarcat_ID.modulePath = module.path
        _db_parsers.data.parser_index.push(sarcat_ID)
    }
    await _db_parsers.write()
    return
}

async function getParsers(rawScanFiles, bundleFileHashes){
    var extSet = new Set()
    var parsers = {}
    await registerParsers()
    var bundleFiles = rawScanFiles.filter(x=>bundleFileHashes.includes(x.data.fileHash))
    bundleFiles.map(x=>x.extension).forEach(x=>extSet.add(x))
    extSet = [...extSet]
    for(var ext of extSet){
        parsers[ext] = []
        _db_parsers.data.parser_index.filter(x=>x.fileExtensions.includes(ext)).forEach(x=>parsers[ext].push(x))
        if(parsers[ext].length == 0){
            delete parsers[ext]
        }
    }
    var parserExtensions = Object.keys(parsers)
    var missingExtensions = extSet.filter(x=>!parserExtensions.includes(x))
    var question = async (ext) =>  {
        var options = []
        await bundleFiles.filter(x=>x.extension == ext).forEach(y=>{options.push({name:`./${y.path.split('!SARCHAT_ARCHIVE!')[1]}/${y.name}`,value:y.data.fileHash})})
        return {
            type: "checkbox",
            message: `${ext}`,
            default: options[0],
            choices: options
        }
    }
    var addAsEvidence = new prompt() // 
    for(var ext of missingExtensions){
        console.log(`No parsers found for file extension: ${ext}`)
        var noParserPrompt = new prompt()
        var res = await noParserPrompt.ask(await question(ext))
        //create attribute of isEvidence: t/f
        console.log('Would you like to add these files to the bundle as evidence data?[....to add as prompt later]')
    }
    return loadParsers({parsers:parsers, bundleFiles: bundleFiles, extensions: parserExtensions})
}

async function loadParsers({parsers, bundleFiles, extensions}){
    const pkgs = Object.keys(packageJSON.dependencies)
    const parserEngine = {}
    for(var ext of extensions){
        for(var i=0;i<parsers[ext].length;i++){
            console.log(`Installing Dependencies for ${ext} file parser [${i+1} of ${parsers[ext].length}]`)
            var deps = parsers[ext][i].dependencies
            for(var d of deps){
                if(!pkgs.includes(d.name)){
                    var res = execSync(`${parsers[ext][i].packageManagerCommand} ${d.name}@${d.version}`)
                    console.log(`Installing Dependencies for ${ext} file parser [${i+1} of ${parsers[ext].length}]:\n${res}`)
                } else if(!semver.gte(semver.clean(d.version), semver.clean(packageJSON.dependencies[d.name].slice(1,)))){
                    var res = execSync(`${parsers[ext][i].packageManagerCommand} ${d.name}@${d.version}`)
                    console.log(`Installing Dependencies for ${ext} file parser [${i+1} of ${parsers[ext].length}]:\n${res}`)
                } else {
                    console.log(`Already installed ${d.name} for ${ext} file parser [${i+1} of ${parsers[ext].length}]`)
                }
            }
            console.log(`Staging Parser Module Commands for ${ext} file parser [${i+1} of ${parsers[ext].length}]`)
            parserEngine[ext]||={}
            if(parsers[ext][i].run.method == "shell"){
                parsers[ext][i].cmd = `${parsers[ext][i].runCommand.shellExecutable} ${parsers[ext][i].modulePath}/${parsers[ext][i].runCommand.relativeDirectoryPath}${parsers[ext][i].runCommand.fileName}`
                parserEngine[ext][i] = parsers[ext][i]
            } else if(parsers[ext][i].run == "import"){
                // parserEngine[ext][i] = `${parsers[ext][i].shellExecutable} ${parsers[ext][i].modulePath}${parsers[ext][i].relativeDirectoryPath}${parsers[ext][i].fileName}`
            } else {
                // parserEngine[ext][i] = `${parsers[ext][i].shellExecutable} ${parsers[ext][i].modulePath}${parsers[ext][i].relativeDirectoryPath}${parsers[ext][i].fileName}`
                console.error('no support run')
            }
        }
        console.log(`Completed Installing Dependencies for .${ext} files\n`)
    }
    return {parserEngine:parserEngine, bundleFiles:bundleFiles, extensions:extensions}
}

//////////////////////////////////////////////////////////////////////////
//////////Raw Scan File processing
//////////////////////////////////////////////////////////////////////////

async function parseFiles(runObj,workingBundle,rawScanFileRegistry, bundleRegistry){
    console.log(chalk.greenBright.bold('-----------------\nBegin Parsing\n-----------------'))
    var fileCounter = 1
    var extCounter = 1
    var {parserEngine, bundleFiles, extensions, bundleDirectory} = runObj
    var parsedFileHashes = []
    for(var ext of extensions){
        var scanFiles = bundleFiles.filter(x=>x.extension == ext)
        for(var f of scanFiles){
            console.log(`Extension: ${chalk.bold(ext)} (${extCounter++} of ${extensions.length}) | File: ${chalk.yellowBright(fileCounter++)} of ${scanFiles.length}`)
            parsedFileHashes.push(f.data.fileHash)
            var ts = Date.now()
            var cmd = `${parserEngine[ext][0].cmd} ${normalize(`${f.filePath}/${f.name}`)} ${archiveDirectory}/parsedData/`
            var res = execSync(cmd).toString()
            res = res.split('\n')
            var lines = res.filter(x=>x.indexOf('SARCAT_OUT') == 0)
            res = res.filter(x=>x.indexOf('SARCAT_OUT') < 0).join('\n')
            console.log(res)
            for(var l of lines){
                l = l.split('|')
                var mnf = new Easy(l[1],l[2])
                await mnf.read()
                var hashObj = {"inputName":f.name,"inputPath":f.path,"inputHash":f.data.fileHash,"outputName": l[1], "outputPath": l[2], "outputHash": await makeHash(Buffer.from(JSON.stringify(mnf.data))),"outputType":l[3],"parse_ts": ts,parserUUID: parserEngine[ext][0].uuid}
                f.data.auditTrail||=[]
                workingBundle.data.auditTrail||=[]
                workingBundle.data.auditTrail.push(hashObj)
                hashObj.bundleUUID = workingBundle.uuid
                f.data.auditTrail.push(hashObj)
            }
            
            var fileAction = {"action": "file parsed", "action_ts": ts}
            var status = {"status": "parsed", "status_ts": ts}
            f.currentStatus = status
            f.data.journal.push(fileAction)
            f.data.journal.push(status)
            f.modified_ts = ts
            f.hash = await makeHash(Buffer.from(JSON.stringify(f.data)))
            await updateRegistryEntry(f,rawScanFileRegistry)// complete db with read write
        }
        var ts = Date.now()
        var bundleAction = {"action": "parsed files", parsedFileHashes: parsedFileHashes,"action_ts": ts}
        workingBundle.modified_ts = ts
        workingBundle.data.journal.push(bundleAction)
        workingBundle.data.parsedFileHashes = parsedFileHashes
        workingBundle.hash = await makeHash(Buffer.from(JSON.stringify(workingBundle.data)))
        await updateRegistryEntry(workingBundle, bundleRegistry)
    }
    return workingBundle
}
//////////////////////////////////////////////////////////////////////////
//////////This Module Entry Point
//////////////////////////////////////////////////////////////////////////

export default async function (scDirs, workingBundle, rawScanFileRegistry, bundleRegistry){
    var parseObject = await getParsers(rawScanFileRegistry.data.files,workingBundle.data.rawFileHashes)
    parseObject.bundleDirectory = `${workingBundle.path}/${workingBundle.name}`
    // loadParsers({parsers:parsers, rawScanFiles: rawScanFiles, extensions: parserExtensions})
    return await parseFiles(parseObject,workingBundle,rawScanFileRegistry, bundleRegistry)
    
    //log activity output to activityLog
    // check that all files are parsed and update bundle status before running normalize
    // if no parsers exist for file extension type, ask if user wants to remove them
}
