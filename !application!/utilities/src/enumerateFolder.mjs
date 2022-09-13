import {readdirSync} from 'node:fs'
const g_manifestObjects = []

const ignore = ["node_modules",".git",".DS_Store"]

export default async function enumFolder(targetFolderPath, ignoreFolders){
    if(!ignoreFolders){
        ignoreFolders = []
    }
    ignoreFolders.push(...ignore)
    var fileObjects = []
    var dirData = readdirSync(targetFolderPath,{withFileTypes: true})
    var files = dirData.filter(x=>x.isFile())
    files = files.map(x=>x.name)
    var dirs = dirData.filter(x=>x.isDirectory() &&ignoreFolders.indexOf(x.name) < 0)
    dirs = dirs.map(x=>x.name)
    if(files.length > 0){
        for(var f of files){
            fileObjects.push({name: f, path: targetFolderPath,type:1})
        }
    }
    if(dirs.length > 0){
        for(var d of dirs){
            fileObjects.push({name: f, path: targetFolderPath,type:2})
            fileObjects = fileObjects.concat(await enumFolder(`${targetFolderPath}/${d}`))
        }
    }
    return fileObjects
}