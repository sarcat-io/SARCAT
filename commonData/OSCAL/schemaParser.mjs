import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

import { readFileSync, readdirSync } from "fs";


var files = readdirSync(__dirname)
files = files.filter(x=>x.indexOf(`.json`)>-1)
var dataDict = {}
for(var f of files){
    dataDict[f.split('.json')[0]] = JSON.parse(readFileSync(`${__dirname}/${f}`))
}

var fileNames = Object.keys(dataDict)
var defDict = {}
for(var f in dataDict){
    var defKeys = Object.keys(dataDict[f].definitions)
    defDict[f.split('.json')[0]]||=[]
    defKeys.forEach(x=>{
        defDict[f.split('.json')[0]].push(x.split(':')[1])
    })
}

for (var f in defDict){
    for(var fn of fileNames){
        if (f != fn){
            var h = defDict[f].filter(x=> !defDict[fn].includes(x))
            console.log(f, fn, h)
        }
    }
}