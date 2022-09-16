import he from 'he'
import parser from 'fast-xml-parser'
import { Easy } from 'easy-lowdb'
import {createReadStream, createWriteStream} from 'node:fs'
/**
 * var numberSeverity = {
    0: (count) => {console.log(`${'Info:')} ${count}`},
    1: (count) => {console.log(`${'Low:')} ${count}`},
    2: (count) => {console.log(`${'Moderate:')} ${count}`},
    3: (count) => {console.log(`${'High:')} ${count}`},
    4: (count) => {console.log(`${chalk.redBright.bold('Critical:')} ${count}`)}
}
 */
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

var detailPlugins = [110483, 22869, 95928]
var detailCapture = {110483: [], 22869: [], 95928: []}
var numberSeverity = {
    0: 'Information',
    1: 'Low',
    2: 'Moderate',
    3: 'High',
    4: 'Critical'
}


export async function parse({fileName, data, outputDirectory}){
    var parseSummary = {}
    var _scanParse_db = new Easy(`${fileName.slice(0, -7)}_parsed`,`${outputDirectory}`)
    await _scanParse_db.read()
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

        try {
            _scanParse_db.data = Object.assign({},scanParse_db)
            await _scanParse_db.write()
        } catch(err){
            console.log(err)
        }

        console.log(`Successfully created ${fileName.slice(0, -7)}_parsed.json (Raw .nessus XML -> Raw JSON)`)
        console.log(`File ${fileName} output contains:`)
        console.log(` -| Unique Hosts: ${hostInfoSet.length}`)
        console.log(` -| Total Reports: ${reportItems.length} total reports`)
        console.log(` -| Unique Vulns: ${reportItemsSet.length} unique reports`)
        console.log(` -| Unique Vulns by Severity:`)
        console.log(`SARCAT_SEPARATOR`)
        for(var k of Object.keys(sevCount)){
            console.log(`  |-   ${numberSeverity[k]}: ${sevCount[k]}`)
        }
        console.log(`SARCAT_OUT|${fileName.slice(0, -7)}_parsed.json|${outputDirectory}02-01_raw-scan-data|parsed`)


    }
    return
}

async function summary(scanParse_db){
    var parseSummary = {}
        var hostInfo = scanParse_db.Report.map(x=> x.ReportHost)[0].map(x=>x.name)
        var hostInfoSet = new Set(hostInfo)
        hostInfoSet = [...hostInfoSet]
        var reportItems = []
        var hostVulnDict = {}
        var vulnHostDict = {}
        await scanParse_db.Report.map(x=> x.ReportHost)[0].map(y=>y.ReportItem.forEach(z=> {
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
        await scanParse_db.Report.map(x=> x.ReportHost)[0].forEach(y=> tmpDict.push({host: y.name, res: y.ReportItem.map(z=>z.pluginID).sort()}))
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
        parseSummary[fileName] = {
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

        var _parseSummary = new Easy(`${fileName.slice(0, -7)}_summary`,`${outputDirectory}`)
        await _parseSummary.read()
        _parseSummary.data = parseSummary[fileName]
        await _parseSummary.write()
        console.log(`Successfully created ${fileName.slice(0, -7)}_summary.json (Raw JSON -> Raw Summary and Grouping)`)
        console.log(`SARCAT_OUT|${fileName.slice(0, -7)}_summary.json|${outputDirectory}02-02_intermediate-objects|summary`)
}
async function prtty(){
    for(var fn in parseSummary){
        delete parseSummary[fn].uniqueReports
        delete parseSummary[fn].uniqueHosts
        delete parseSummary[fn].groupings
        delete parseSummary[fn].cmIssues
        delete parseSummary[fn].severityObj
        delete parseSummary[fn].detailPluginCapture
        delete parseSummary[fn].hostVulnDict
        delete parseSummary[fn].vulnHostDict
        delete parseSummary[fn].hostVulnCounts
        delete parseSummary[fn].vulnHostCounts
        console.log(`${fn} results: ${JSON.stringify(parseSummary[fn])}`)
    }
}



async function loadData(runObj){
    var {fileName, filePath, outputDirectory} = runObj
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