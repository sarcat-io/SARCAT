import he from 'he'
import parser from 'fast-xml-parser'
import { Easy } from 'easy-lowdb'
import {createReadStream, createWriteStream} from 'node:fs'

var xmlParserOptions = {
    attributeNamePrefix: "",
    textNodeName: "value",
    ignoreAttributes: false,
    ignoreNameSpace: false,
    allowBooleanAttributes: false,
    parseNodeValue: true,
    parseAttributeValue: true,
    trimValues: true,
    cdataTagName: "__cdata", 
    cdataPositionChar: "\\c",
    parseTrueNumberOnly: false,
    arrayMode: true, 
    attrValueProcessor: (val, attrName) => he.decode(val, { isAttributeValue: true }),
    tagValueProcessor: (val, tagName) => he.decode(val)
}


var numberSeverity = {
    0: 'Information',
    1: 'Low',
    2: 'Moderate',
    3: 'High',
    4: 'Critical'
}


export async function parse(runObj, _scanParse_db, outputDirectory){
    try {
        var {data, fileName, outputDirectories, fileHash} = runObj
        var outputDirectory = outputDirectories.parsedRawDirectory
    
        if (parser.validate(data) === true) { 
            var jsonObj = parser.parse(data, xmlParserOptions);
            console.log('Parsing Filename:',fileName)
            var scanParse_db = jsonObj.NessusClientData_v2[0]
            var hostInfo = scanParse_db.Report.map(x=> x.ReportHost)[0].map(x=>x.name)
            var hostInfoSet = new Set(hostInfo)
            hostInfoSet = [...hostInfoSet]
            var reportItems = []
            await scanParse_db.Report.map(x=> x.ReportHost)[0].map(y=>y.ReportItem.forEach(z=> {
                var uniqStr = `${z.severity}_${z.svc_name}_${z.pluginID}_${z.pluginName}`
                reportItems.push(uniqStr)
            }))
            var reportItemsSet = new Set(reportItems)
            reportItemsSet = [...reportItemsSet]
            var sevDict={}
            var sevCount={}
            await reportItems.forEach(x=>{
                var sev = Number(x.split('_')[0])
                sevDict[sev]||=[]
                sevDict[sev].push(x)
            })
            for(var sev in sevDict){
                sevDict[sev] = [...new Set(sevDict[sev])]
                sevCount[sev]= sevDict[sev].length
            }
    
            _scanParse_db.data = Object.assign({},scanParse_db)
            await _scanParse_db.write()

            var res = ''
            res+=`Successfully created ${fileName.slice(0, -7)}_parsed.json (Raw .nessus XML -> Raw JSON)\n`
            res+=`File ${fileName} output contains:\n`
            res+=` -| Unique Hosts: ${hostInfoSet.length}\n`
            res+=` -| Total Reports: ${reportItems.length} total reports\n`
            res+=` -| Unique Vulns: ${reportItemsSet.length} unique reports\n`
            res+=` -| Unique Vulns by Severity:\n`
            res+=`SARCAT_SEPARATOR\n`
            for(var k of Object.keys(sevCount)){
                res+=`  |-   ${numberSeverity[k]}: ${sevCount[k]}\n`
            }
            res+=`SARCAT_OUT|${fileName.slice(0, -7)}_parsed.json|${outputDirectory}02-01_parsed-raw-data|parsed\n`
            return {parseRes:res, parse_db:_scanParse_db}
        }
    }catch(err){
        return {error: 'parse', err:err}
    }
    
}