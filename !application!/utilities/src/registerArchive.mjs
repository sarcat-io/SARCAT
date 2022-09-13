
import { Easy } from 'easy-lowdb'
import {readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, readdir} from 'node:fs' //////////Native NodeJS File Management
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
const archiveTemplate = JSON.parse(readFileSync(normalize(`${process.cwd()}/../templates/archive/archive.json`)))
export default async function register(archiveDirectory){
    var directoryObject = {archiveDirectory: archiveDirectory}
    var configurationObject = {}
    await archiveTemplate.filter(z=>z.type == 2).forEach(x => {
        directoryObject[x.label] = `${archiveDirectory}${x.dir}${x.name}`
    });
    await archiveTemplate.filter(z=>z.type == 1).forEach(x => {
        configurationObject[x.label] = {"easy":`${x.easy}`,"directory":`${archiveDirectory}${x.dir}${x.name}`}
    });
    return {directoryObject:directoryObject,configurationObject:configurationObject}
}