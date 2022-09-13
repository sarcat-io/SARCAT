import {existsSync, mkdirSync, writeFileSync} from 'node:fs'
// import bundleTemplate from '../../templates/bundle/00_bundleTemplate-CSP.mjs'
import {spawn} from 'child_process'
import {exec, execSync, spawnSync } from 'node:child_process'
import { execPath } from 'node:process'
import { Easy } from 'easy-lowdb'
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions

export async function addStandardDirs(bundleDirectory){
    console.log('Checking bunding file structure')
    try {
        if(!existsSync(bundleDirectory)){
            console.log('Checking bunding directory')
            mkdirSync(bundleDirectory)
        }
        if(!existsSync(`${bundleDirectory}${bundleTemplate[0].dir}${bundleTemplate[0].name}`)){
            console.log('Adding standard bundle structure')
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
    } catch(err){
        console.error(`Error: Make Bundle | Add Standard Dirs -> ${err}`)
    }
    return 
}