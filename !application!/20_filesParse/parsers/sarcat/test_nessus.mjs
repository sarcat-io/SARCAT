import he from 'he'
import parser from 'fast-xml-parser'
// import {XMLParser} from 'fast-xml-parser/src/fxp.js'
// import Validator from 'fast-xml-parser/src/validator.js'
import { Easy } from 'easy-lowdb'
import { createReadStream } from 'node:fs'

const validator = Validator.validate
const xmlParserOptions = {
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

var detailPlugins = [110483, 22869, 95928]
var detailCapture = {110483: [], 22869: [], 95928: []}


export async function parse({data, fileName, outputDirectory}){
    var parseSummary = new Easy(`${fileName.slice(0, -7)}_summary`, outputDirectory)
    await parseSummary.read()
    const parser = new XMLParser(xmlParserOptions)
    if (validator(data) === true) { 
        var jsonObj = await parser.parse(data);
        console.log('Parsing Filename:',fileName)
        var scanParse_db = new Easy(`${fileName.slice(0, -7)}_parsed`, outputDirectory)
        await scanParse_db.read()
        scanParse_db.data.scanParse = jsonObj.NessusClientData_v2
        var hostInfo = scanParse_db.data.scanParse.Report.ReportHost.map(x=>x.name)
        var hostInfoSet = new Set(hostInfo)
        hostInfoSet = [...hostInfoSet]
        var reportItems = []
        var hostVulnDict = {}
        var vulnHostDict = {}
        await scanParse_db.data.scanParse.Report.ReportHost.map(y=>y.ReportItem.forEach(z=> {
            var uniqStr = `${z.severity}_${z.svc_name}_${z.pluginID}_${z.pluginName}`
            vulnHostDict[z.severity]||={}
            vulnHostDict[z.severity][uniqStr]||=[]
            vulnHostDict[z.severity][uniqStr].push(y.name)
            hostVulnDict[y.name]||={}
            hostVulnDict[y.name][z.severity]||=[]
            hostVulnDict[y.name][z.severity].push(uniqStr)

            reportItems.push(uniqStr)
            if(detailPlugins.includes(z.pluginID)){
                detailCapture[z.pluginID].push({host: y.name, output: z.plugin_output})
            }
        }))

        var tmpDict = []
        var similar = []
        await scanParse_db.data.scanParse.Report.ReportHost.forEach(y=> tmpDict.push({host: y.name, res: y.ReportItem.map(z=>z.pluginID).sort()}))
        var hosts = tmpDict.map(x=> x.host)
        var data = tmpDict.map(x=> x.res)
        for(var i=0;i<hosts.length;i++){
            var sim = [hosts[i]]
            for (var x=0;x<data.length;x++){
                    var delta1 = data[i].filter(z=> !data[x].includes(z))
                    var delta2 = data[x].filter(z=> !data[i].includes(z))

                    if(delta1.length + delta2.length == 0 && x != i){
                        sim.push(hosts[x])
                    }
                
            }
            similar.push(sim.sort())

        }
        var final = []
        var lastFinal = []
        async function splicer(){

        }
        async function recursiveShrink(insider){
            var i=0
            var counter1=0
            var counter2=0

            var track = []
            for(var x=0;x<insider.length;x++){
                var delta1 = insider[i].filter(z=> !insider[x].includes(z))
                var delta2 = insider[x].filter(z=> !insider[i].includes(z))
                if(delta1.length + delta2.length == 0 && x != i){
                    track.push(x)
                } 
            }

            var finalHold = insider[i]
            var slider = 0
            for(var bad of track){
                bad = bad-slider
                finalHold = [...finalHold, ...insider[bad]]
                var ar1 = insider.slice(0,bad);
                var ar2 = insider.slice(bad+1,)
                var insider = [...ar1, ...ar2]
                slider++
            }
            insider.shift()
            final.push([...new Set(finalHold)])
            return insider
        }
        do {
            similar = await recursiveShrink(similar)
        } while(similar.length > 0)

        console.log(`Distinct Configuration Groups: ${final.length}`)
        var totCOunt = 0
        var cmIssues=[]
        for(var group of final){
            if (group.length < 3){
                cmIssues = [...cmIssues,...group]
            }
            totCOunt+=group.length
        }

        console.log(`Hosts with potential CM issues: ${cmIssues.length}`)
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

        var hostVulnCounts = {}
        for(var host in hostVulnDict){
            hostVulnCounts[host]||={}
            hostVulnCounts[host].count = 0
            for(var sev in hostVulnDict[host]){
                hostVulnCounts[host][sev] = hostVulnDict[host][sev].length
                hostVulnCounts[host].count+=hostVulnDict[host][sev].length
            }

        }

        var vulnHostCounts = {}
        for(var sev in vulnHostDict){
            vulnHostCounts[sev]||={}
            vulnHostCounts[sev].count = 0
            for(var vuln in vulnHostDict[sev]){
                vulnHostCounts[sev][vuln] = vulnHostDict[sev][vuln].length
                vulnHostCounts[sev].count+=vulnHostDict[sev][vuln].length
            }

        }

        var reportItemsSet = new Set(reportItems)
        reportItemsSet = [...reportItemsSet]
        parseSummary.data[fileName] = {
            hostCount: hostInfo.length, 
            uniqueHosts: hostInfoSet.length, 
            totalReportCount: reportItems.length, 
            uniquePositiveHitCount: reportItemsSet.length, 
            groupingsCount: final.length, 
            severityCounts: sevCount, 
            cmIssuesCount: cmIssues.length, 
            hostVulnCounts: hostVulnCounts,
            vulnHostCounts: vulnHostCounts,
            uniqueHosts: hostInfoSet, 
            uniqueReports: reportItemsSet, 
            groupings: final, 
            cmIssues: cmIssues, 
            severityObj: sevDict, 
            detailPluginCapture: detailCapture, 
            hostVulnDict: hostVulnDict,
            vulnHostDict: vulnHostDict
        }

        await scanParse_db.write()
        await parseSummary.write()
    }
    return
}


async function prtty(){
    for(var fn in parseSummary.data){
        delete parseSummary.data[fn].uniqueReports
        delete parseSummary.data[fn].uniqueHosts
        delete parseSummary.data[fn].groupings
        delete parseSummary.data[fn].cmIssues
        delete parseSummary.data[fn].severityObj
        delete parseSummary.data[fn].detailPluginCapture
        delete parseSummary.data[fn].hostVulnDict
        delete parseSummary.data[fn].vulnHostDict
        delete parseSummary.data[fn].hostVulnCounts
        delete parseSummary.data[fn].vulnHostCounts
        console.log(`${fn} results: ${JSON.stringify(parseSummary.data[fn])}`)
    }
}




async function loadData({fileName, filePath, outputDirectory}){
    var dataArray = []
    var dataStream = createReadStream(`${filePath}/${fileName}`)
    dataStream.on('data', (data)=>{
        dataArray.push(data)
    })
    dataStream.on('end',()=>{
        runObj.data = Buffer.concat(dataArray).toString('utf-8')
        parse(runObj)
    })
}

var rawFilePath = process.argv[2].split('/')
var rawfileName = rawFilePath.pop()
rawFilePath = rawFilePath.join('/')
var runObj = {fileName:rawfileName, filePath:rawFilePath, outputDirectory: process.argv[3]}
loadData(runObj)