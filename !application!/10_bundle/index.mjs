import { regularExpressions } from "../utilities/regexPatterns.mjs";
import {normalize} from 'path'
import {createReadStream} from 'node:fs'

var rs = new createReadStream(normalize(`${process.cwd()}/../../../!bundle_temp/rawScanFiles/2022MAR_conMon.nessus`))
var dataArray = []

rs.on('data', (data)=>{
    dataArray.push(data)
})

rs.on('end', ()=>{
    dataArray = Buffer.concat(dataArray).toString('utf-8')
    iterateData(dataArray)
})

async function iterateData(data){
    var dataSplit = data.split('\n')
    for(var line of dataSplit){
        iterateRegexp(line)
    }
}
var lineCount = 0
async function iterateRegexp(line){
    for(var r of Object.keys(regularExpressions)){
        var res = line.match(regularExpressions[r])
        if(res != null){
          console.log(r, lineCount, res)  
        }
    }
    lineCount++

}