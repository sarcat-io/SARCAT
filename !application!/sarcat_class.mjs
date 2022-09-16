
import { Easy } from 'easy-lowdb'
import { createReadStream, createWriteStream } from 'node:fs'
import { EventEmitter } from 'node:events'
// import { LogControl } from "./utilities/log_management.mjs";
import {readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, readdir} from 'node:fs' //////////Native NodeJS File Management
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
import { _SC_templates } from '../templates/index_templates.mjs'
const _tmp = new _SC_templates()
await _tmp.loadJSON()
import {_SC_00_setup} from './00_setup/setup_class.mjs'
import { _SC_01_bundle } from './10_bundle/bundle_class.mjs'
import { _SC_20_filesParse } from './20_filesParse/parse_class.mjs'
import { _SC_crypto } from './utilities/crypto_class.mjs'

const archiveTemplate = _tmp.archive.archive
export class _SC {
    constructor (archiveDirectory){
        this.directoryObject = {archiveDirectory: archiveDirectory}
        archiveTemplate.filter(z=>z.type == 2).forEach(x => {
            this.directoryObject[x.label] = `${archiveDirectory}${x.dir}${x.name}`
        })

        this.configurationObject||={}
        

    }

    newBundle = async () => {
        return
    }
    newRawScanFile = async () => {

    }


    easyInit = async (easyObj,data) => {
        try {
            await easyObj.read()
            if(data){
                for(var k of Object.keys(data)){
                    if(!easyObj.data[k]){
                        easyObj.data[k] = data[k]
                    }
                }
            }
            return await easyObj.write()
        } catch(err){
            console.log(easyObj, err)
        }
    }

    updateRegistryEntry = async (updatedObject, db_name) => {
        var db = await this.easyInit(db_name)
        var key = this.configurationObject[db_name].data
        db.data = db.data[key].filter(x=>x.uuid != updatedObject.uuid)
        db.data[key].push(updatedObject)
        await db.write()
        return
        /**
         *         
        var updateEvent = new EventEmitter
        
        updateEvent.on('update', (updateObject, db_name) => {
            this.updateRegistryEntry(updateObject, db_name)
        })
        
         */
    }

    bootstrap = async () => {
        archiveTemplate.filter(z=>z.type == 1).forEach(x => {
            this.configurationObject[x.label] = {"easy":`${x.easy}`,"directory":`${this.directoryObject.archiveDirectory}${x.dir}`,"data":x.data}
        })
        for(var registry in this.configurationObject){
            this[registry] = new Easy(this.configurationObject[registry].easy, this.configurationObject[registry].directory)
            await this.easyInit(this[registry], this.configurationObject[registry].data)
        }
        await this.sarcatConfig.read()
        this.setup = new _SC_00_setup(this)
        this.bundle = new _SC_01_bundle(this)
        this.filesParse = new _SC_20_filesParse(this)
        this.crypto = new _SC_crypto(this)

    }
    runSetup = async()=>{
        await this.setup.archive(this)
        await this.setup.config(this)
        
    }

    runBundle = async () => {
        var res = await this.bundle.bundle(this)
    }

    runData = async () => {
        var res = await this.filesParse(workingBundle)
        // var rawFileRes = await this.stage.rawFiles(this.directoryObject, this.rawScanFileRegistry)
    }
    runParseNormalize = async () => {

    }

    runAnalyzeCorrelate = async() => {

    }

    runAssemble2Seal = async () => {
        if(this.sarcatConfig.data.config.systemRole == "ISSO"){
            var operatorKeys = await this.crypto.getKeys(this.sarcatConfig.data.config.systemRole, this.sarcatConfig.data.systemIdentification.systemAuthorizingBody)

            var {publicKey, privateKey} = this.keyManagement.data.keyPairs.filter(x=>x.role == "AO" && x.systemAuthorizingBody == this.sarcatConfig.data.systemIdentification.systemAuthorizingBody).pop().encKeys
            var doneEvent = new EventEmitter()
            var writeFileStream = createWriteStream(`${this.directoryObject.archiveDirectory}/test.enc`)
            var readFileStream = createReadStream(normalize(`${this.directoryObject.archiveDirectory}/.sarcat/dockerImages/sarcat_1663107204.tar.gz`))
            doneEvent.on('done', (data) => {
                this.sarcatConfig.data.encObj = data
                this.sarcatConfig.write()
                console.log(data)
            })
            this.crypto.encrypt_bundle(publicKey, privateKey, readFileStream, writeFileStream,`${this.directoryObject.archiveDirectory}/test.enc`,doneEvent)

        } else {
            console.log('fail')
            //var loadArchive
            //var loadBundle
        }
    }

    runValidation = async () => {

    }
}