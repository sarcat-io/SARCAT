import {readdirSync} from 'node:fs' //////////Native NodeJS File Management
export default async function iterateDir(targetDirectory, passDirs){
    var fp_files = []
    var rawScanFiles = readdirSync(targetDirectory,{withFileTypes:true})
    var dirs = rawScanFiles.filter(x=>x.isDirectory())
    var files = rawScanFiles.filter(x=>x.isFile())
    for(var d of dirs){
        fp_files.push(...await iterateDir(`${targetDirectory}/${d.name}`, true))
        if(passDirs){
            fp_files.push({name: d.name, path:targetDirectory, type: 2})
        }
    }
    for(var fn of files){
        fp_files.push({name: fn.name, path:targetDirectory, type:1, extension: fn.name.split('.').at(-1)})
    }
    return fp_files
}