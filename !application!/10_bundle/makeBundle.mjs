import {existsSync, mkdirSync, writeFileSync} from 'node:fs'
// import bundleTemplate from '../../templates/bundle/00_bundleTemplate-isso.mjs'
import {spawn} from 'child_process'
import {exec, execSync, spawnSync } from 'node:child_process'
import { execPath } from 'node:process'
import { Easy } from 'easy-lowdb'
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
var bundleDirectory
var bundleTemplate
var updateRegistryEntry
export async function addStandardDirs(_SC_classObject, workingBundle){
    updateRegistryEntry = _SC_classObject.updateRegistryEntry
    bundleDirectory = `${_SC_classObject.directoryObject.bundleDirectory}/${workingBundle.label}`
    bundleTemplate = _SC_classObject.templates.bundle.bundleISSO
    console.log('Checking bundle content structure')
    try {
        if(!existsSync(bundleDirectory)){
            console.log('Creating bundle content directory')
            mkdirSync(bundleDirectory)
        }
        if(!existsSync(`${bundleDirectory}${bundleTemplate[0].dir}${bundleTemplate[0].name}`)){
            console.log('Adding standard content structure from template')
        }
        for(var obj of bundleTemplate){
            if(!existsSync(`${bundleDirectory}${obj.dir}${obj.name}`)){
                if(obj.type == 2){
                    mkdirSync(`${bundleDirectory}${obj.dir}${obj.name}`)
                } else if(obj.type==1){
                    if(obj.name.indexOf('.json') > -1){
                        var tmp_db = new Easy(`${obj.name.split('.json')[0]}`, `${bundleDirectory}${obj.dir}`)
                        await tmp_db.read()
                        await tmp_db.write()
                    } else {
                        writeFileSync(`${bundleDirectory}${obj.dir}${obj.name}`,``)
                    }
                }
            }
            
        }
        console.log('Bundle content structure complete')
    } catch(err){
        console.error(`Error: Make Bundle | Add Standard Dirs -> ${err}`)
    }
    return 
}