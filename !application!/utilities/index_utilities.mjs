import {v4} from 'uuid'
import {readdirSync, createReadStream, writeFileSync} from 'node:fs' //////////Native NodeJS File Management
import {createHash} from 'crypto'
import { normalize, sep } from 'node:path'
import { execSync } from 'node:child_process'

export class _SC_utilities {
    constructor (directoryObject){
        this.directoryObject = directoryObject
    }
    load = async (name) => {
        var mod = await import(this[name])
        if(mod.default){
            return mod.default
        } else {
            console.log(Object.keys(mod))
        }
    }
    isObject = (obj) => {
        if(typeof obj == 'object') {
            return true
        } else {
            return false
        }
    }
    csv2json = async (csvString) => {
        var allRows = []
        csvString = csvString.split('\r\n')
        const headers = csvString.shift().split(',').map(x=>x.trim().replaceAll(' ', '_'))
        for(var row of csvString){
            row = row.split(',')
            var tmpRow = {}
            for(var i=0; i<headers.length;i++){
                tmpRow[headers[i]] = row[i]
            }
            allRows.push(tmpRow)
        }
        return allRows
    }

    json2csv = async (arrayObjects) => {
        var headerSet = new Set()

        async function index(obj,is, value) {
            if (typeof is == 'string')
                return index(obj,is.split('.'), value);
            else if (is.length==1 && value!==undefined)
                return obj[is[0]] = value;
            else if (is.length==0)
                return obj;
            else
                return index(obj[is[0]],is.slice(1), value);
        }

        async function singleObject(jsonObject, parentKeys) {
            if(!parentKeys){
                parentKeys = []
            }
            var keys = Object.keys(jsonObject)

            for(var k of keys){
                if(parentKeys.length == 0){
                    headerSet.add(k)
                } else {
                    headerSet.add(`${parentKeys.join('.')}.${k}`)
                }
                if(isObject(jsonObject[k])){
                    parentKeys.push(k)
                    console.log(parentKeys)
                    await singleObject(jsonObject[k], parentKeys)
                } 
            }
            return
        }
        var rows = []
        for(var aO of arrayObjects){
            await singleObject(aO)
        }
        headerSet = [...headerSet]
        rows.push(headerSet)
        for(var aO of arrayObjects){
            var row = ''
            for(var h of headerSet){
                if(h.indexOf('.')>0){
                    var ha = h.split('.')
                    if(aO[ha[0]]){
                        var test = await index(aO, h)
                        row += test + ','
                    } else {
                        row += ','
                    }
                } else if(!aO[h]){
                    row += ','
                } else if(isObject(aO[h])){
                    row += ','
                } else {
                    row += aO[h]+','
                }
            }
            rows.push(row)
        }
        return rows.join('\n')
    }
    
    directoryIterator = async (targetDirectory, passDirs) => {
        //passDirs if true includes directories in the returned array of objects
        var fp_files = []
        var rawScanFiles = readdirSync(targetDirectory,{withFileTypes:true})
        var dirs = rawScanFiles.filter(x=>x.isDirectory())
        var files = rawScanFiles.filter(x=>x.isFile())
        for(var d of dirs){
            fp_files.push(...await this.directoryIterator(`${targetDirectory}/${d.name}`, passDirs))
            if(passDirs == true){
                fp_files.push({name: d.name, path:targetDirectory, type: 2})
            }
        }
        for(var fn of files){
            fp_files.push({label: fn.name.split('.')[0], name: fn.name, path:targetDirectory, type:1, extension: fn.name.split('.').at(-1)})
        }
        return fp_files
    }

    enumFolder = async (targetFolderPath, ignoreFolders) => {
        if(!ignoreFolders){
            ignoreFolders = []
        }
        var fileObjects = []
        var dirData = readdirSync(targetFolderPath,{withFileTypes: true})
        var files = dirData.filter(x=>x.isFile())
        files = files.map(x=>x.name)
        var dirs = dirData.filter(x=>x.isDirectory() && ignoreFolders.indexOf(x.name) < 0)
        dirs = dirs.map(x=>x.name)
        console.log('files',files)
        console.log('dirs',dirs)
        if(files.length > 0){
            for(var f of files){
                fileObjects.push({name: f, path: targetFolderPath,type:1})
            }
        }
        if(dirs.length > 0){
            for(var d of dirs){
                // fileObjects.push({name: f, path: targetFolderPath,type:2})
                fileObjects = fileObjects.concat(await this.enumFolder(`${targetFolderPath}/${d}`))
            }
        }
        return fileObjects
    }

    oldNew  = async (fileArray) => {
        //takes in array of statSync/node:fs objects
        var sortedArray = fileArray.sort((a,b) => a.data.birthtimeMs - b.data.birthtimeMs)
        return {oldest: sortedArray.at(0), newest:sortedArray.at(-1)}
    }

    dupeCount  = async (array) => {
        var arraySet = new Set()
        var arrayObj = {}
        for(var x of array){
            if(arraySet.has(x)){
                arrayObj[x]||=0
                arrayObj[x]++
            } else {
                arraySet.add(x)
            }
        }
        return arrayObj
    }

    uuid = async () => {
        return v4()
    }

    unzipData = async (inPath, archiveName, outPath,pw) => {
        execSync(`7z e -p${pw} ${outPath}${sep}${archiveName}.7z ${inPath? inPath: archiveDirectory}`)
    }

    zipData = async(inPath, archiveName, outPath, pw)=>{
        execSync(`7z a -t7z -m0=lzma2 -mx=9 -mfb=64 -md=1024m -ms=on -mhe=on -p${pw} ${outPath}${sep}${archiveName}.7z ${inPath? inPath: archiveDirectory}`)
        //-p -mhe=on -P$password "$package"
    }

    zipBundle = async (bundleName, unZip) =>{
        var bundlePW// prompt for password
        if(unZip){
            await this.unzipData(this.directoryObject.deliverableDirectory, bundleName, this.directoryObject.bundleDirectory, bundlePW)
        } else {
            await this.zipData(this.directoryObject.bundleDirectory, bundleName, this.directoryObject.deliverableDirectory, bundlePW)
        }
    }
}