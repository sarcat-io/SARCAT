import he from 'he'
import parser from 'fast-xml-parser'
import { Easy } from 'easy-lowdb'
import {createReadStream, createWriteStream} from 'node:fs'
import { _SC_templates } from '../../../../../templates/index_templates.mjs'
var nessusConfigFamilies = ["Service detection", "General", "Settings"]
var detailPlugins = [] //[110483, 22869, 95928, 35351, 34098, 25203, 33276, 133964, 55472, 14272, 19506, 117887, 112063, 93561, 25221] //19506 scan config //117887 local checks enabled//112063 kubernetes 93561 docker
var detailCapture = {}//{110483: [], 22869: [], 95928: [], 35351: [],34098:[], 25203:[],33276:[], 133964:[], 55472:[], 14272: [], 19506:[], 117887:[], 112063:[], 93561:[], 25221:[]}
var detailHostCapture = {}
var shaList = new Set()
var systemImageIds = {}
export async function summaryObjects(runObj, _parseSummary, resObj, outputDirectory){
    try {
        var res = ''
        var {data, fileName, fileHash} = runObj
        var scanParse_db = Object.assign({}, resObj.parse_db.data)
    
    
        var parseSummary = {}
            var hostInfo = scanParse_db.Report.map(x=> x.ReportHost)[0].map(x=>x.name)
            var hostInfoSet = new Set(hostInfo)
            hostInfoSet = [...hostInfoSet]
            var reportItems = []
            var hostVulnDict = {}
            var vulnHostDict = {}
            var vulnReference = {}
            var hostContainers = {}
            var allContainers = new Set()
            var pluginByFamily = []
            var pluginByFamilyDict = {}
            await scanParse_db.Report.map(x=> x.ReportHost)[0].map(y=>y.ReportItem.forEach(z=> {
                pluginByFamilyDict[z.pluginID] = {family:z.pluginFamily, id: z.pluginID, name: z.pluginName}
            }))
            for(var pgId in pluginByFamilyDict){
                pluginByFamily.push(pluginByFamilyDict[pgId])
            }
            detailPlugins = pluginByFamily.filter(x=>nessusConfigFamilies.indexOf(x.family)>-1).map(y=>y.id)
            detailPlugins.forEach(x=>detailCapture[x] = [])
            await scanParse_db.Report.map(x=> x.ReportHost)[0].map(y=>y.ReportItem.forEach(z=> {
                z.svc_name = z.svc_name.split('?')[0]
                var uniqStr = `${z.severity}_${z.svc_name}_${z.pluginID}_${z.pluginName}`
                var uniqStr2 = `${z.pluginID}|${z.severity}|${z.svc_name.split('?')[0]}|${z.pluginName}`
                z.uniqueQualifier = uniqStr2
                vulnReference[uniqStr2]||={detail: z, ports: new Set(), protocols: new Set(), plugin_outputs: new Set(), hosts: new Set()}
                vulnReference[uniqStr2].protocols.add(z.protocol)
                vulnReference[uniqStr2].plugin_outputs.add({host: y.name, output: z.plugin_output})
                vulnReference[uniqStr2].ports.add(z.port)
                vulnReference[uniqStr2].hosts.add(y.name)
                vulnHostDict[z.severity]||={}
                vulnHostDict[z.severity][uniqStr]||=[]
                vulnHostDict[z.severity][uniqStr].push(y.name)
                hostVulnDict[y.name]||={}
                hostVulnDict[y.name][z.severity]||=[]
                hostVulnDict[y.name][z.severity].push(uniqStr)
    
                // ||={shaList: [],systemImageIds: [], imageIdList: []}
                reportItems.push(uniqStr)
                if(detailPlugins.includes(z.pluginID) && z.plugin_output){

                    var tmpDetail = z.plugin_output.split('\n').map(y=> y.trim())
                    if(z.pluginID == 22869){
                        tmpDetail = tmpDetail.slice(2)
                    } else if (z.pluginID == 110483){
                        var imageId = tmpDetail.filter(x=>x.indexOf('Image ID') > -1)
                        var containerD =  tmpDetail.filter(x=>x.indexOf('docker-containerd')>-1)
                        if(containerD.length == 0 && imageId.length == 0){
                        } else {
                            hostContainers[y.name]||={}
                            if(imageId.length > 0){
                                hostContainers[y.name].imageId = imageId
                                // for(var i=0;i<tmpDetail.length;i++){
                                //     var shaId = tmpDetail[i].split(' : ')
                                //     var imageId = tmpDetail[i+2].split(/\s{1,}/)
                                //     hostContainers[y.name].systemImageIds[imageId[1]] = shaId[1]
                                //     hostContainers[y.name].shaList.push(shaId[1])
                                // }
        
                            }
                            if (containerD.length > 0){
                                var tmpy = new Set()
                                containerD.forEach(x=>{
                                    var cont = x.split(' ').filter(x=>x.trim().length == 64)[0]
                                    if(cont){
                                        tmpy.add(cont)
                                        allContainers.add(cont)
                                    }
                                })
                                tmpy = [...tmpy]
                                if(tmpy.length > 0){
                                    hostContainers[y.name] = tmpy
                                }
                                
                                // hostContainers[y.name]||={}
                                // for(var i=0;i<tmpDetail.length;i++){
                                //     console.log(tmpDetail[i])
                                //     var imageId = tmpDetail[i].split(/\s{1,}/)
                                // var lindex3 = tmpDetail[i].indexOf('docker-containerd-shim')
                                // imageId = imageId[lindex3+1]
                                // if(!systemImageIds[imageId]){
                                // } else {
                                //     hostContainers[y.name].imageIdList.push(imageId)
                                //     hostContainers[y.name].shaList.push(systemImageIds[imageId])
                                // }
                                // }
                                
                            }
                        }
                        
    
                        tmpDetail = tmpDetail.map(a=>a.split(' ').at(-2)+" "+a.split(' ').at(-1))
    
                    }
                    var colonCounter = 0
                    var interfaceCounter = 0
                    var doubleDashCounter = 0
                    var tmpArr = []
                    var tmpDict = {}
                    for(var ent of tmpDetail){
                        if(ent.indexOf(":") > -1){
                            colonCounter++
                        }
                        if(ent.indexOf('interface')>-1){
                            interfaceCounter++
                        }
                        if(ent.indexOf('[')>-1 || ent.indexOf(']')>-1){
                            doubleDashCounter++
                        }
                    }
                    if(colonCounter > 0){
                        tmpDetail = tmpDetail.filter(x=>x.length > 0)

                        if(interfaceCounter > 0 && (tmpDetail[0].indexOf(":") == tmpDetail[0].length -1 && tmpDetail[1].indexOf('- ') == 0)){
                            for(var ent of tmpDetail){
                                if(ent.indexOf('interface')>0){
                                    var tmpSplit = ent.split('interface')
                                    tmpSplit[0] = tmpSplit[0].split('- ')[1].split(' ')[0]
                                    tmpSplit[1] =  tmpSplit[1].split(' ')[1].slice(0,-1)
                                    tmpArr.push({address: tmpSplit[0], interface: tmpSplit[1]})
                                }
                            }

                        } else if (z.pluginID != 110483) {
                            for(var ent of tmpDetail){
                                var tmpSplit = ent.split(":")
                                if(tmpSplit.length == 2){
                                    tmpSplit[0] = tmpSplit[0].trim()
                                    if(tmpSplit[0].indexOf('- ')==0){
                                        tmpSplit[0] = tmpSplit[0].split('- ')[1]
                                    }
                                    if(!tmpDict[tmpSplit[0]] && (isNaN(Number(tmpSplit[0])) && tmpSplit[1])){
                                        tmpDict[tmpSplit[0]]=tmpSplit[1].trim()
                                    } else if((isNaN(Number(tmpSplit[0])) && tmpSplit[1])) {
                                        tmpArr.push(tmpDict)
                                        tmpDict = {}
                                        tmpDict[tmpSplit[0]]=tmpSplit[1].trim()
                                    }
                                } 
                            }
                        }

                        if(Object.keys(tmpDict).length > 0){
                            tmpArr.push(tmpDict)
                        }
                    }
                    if(tmpArr.length > 0){
                        tmpDetail = tmpArr
                    }

                    detailCapture[z.pluginID].push({host: y.name, pluginName: z.pluginName, output: tmpDetail})
                    detailHostCapture[y.name]||=[]
                    detailHostCapture[y.name].push({host: y.name, pluginID: z.pluginID, pluginFamily: z.pluginFamily, pluginName: z.pluginName, output: tmpDetail})
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
    
            res += `Distinct Configuration Groups: ${final.length}\n`
            var totCOunt = 0
            var cmIssues=[]
            for(var group of final){
                if (group.length < 3){
                    cmIssues = [...cmIssues,...group]
                }
                totCOunt+=group.length
            }
    
            res +=`Hosts with potential CM issues: ${cmIssues.length}\n`
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
            for(var key in vulnReference){
                vulnReference[key].detail.protocol = [...vulnReference[key].protocols]
                if(vulnReference[key].detail.protocol.length == 1){
                    vulnReference[key].detail.protocol = vulnReference[key].detail.protocol[0]
                }
                vulnReference[key].detail.plugin_output = [...vulnReference[key].plugin_outputs]
                if(vulnReference[key].detail.plugin_output.length == 1){
                    vulnReference[key].detail.plugin_output = vulnReference[key].detail.plugin_output[0]
                }
                vulnReference[key].detail.port = [...vulnReference[key].ports]
                if(vulnReference[key].detail.port.length == 1){
                    vulnReference[key].detail.port = vulnReference[key].detail.port[0]
                }
                vulnReference[key].detail.hostCount = [...vulnReference[key].hosts].length
                vulnReference[key].detail.hosts = [...vulnReference[key].hosts]
                vulnReference[key] = Object.assign({},vulnReference[key].detail)

    
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
                detailPlugins: detailPlugins,
                detailPluginCapture: detailCapture,
                detailHostCapture: detailHostCapture,
                hostVulnDict: hostVulnDict,
                vulnHostDict: vulnHostDict,
                vulnReference: vulnReference,
                hostContainers: hostContainers,
                allContainers: [...allContainers]
            }
    
    
            await _parseSummary.read()
            _parseSummary.data = parseSummary[fileName]
            await _parseSummary.write()
            res +=`Successfully created ${fileHash}_summary.json (Raw JSON -> Raw Summary and Grouping)\n`
            res += `SARCAT_OUT|${fileHash}_summary.json|${outputDirectory}|summary\n`
            resObj.summaryRes = res
            resObj.summary_db = _parseSummary
            return resObj
    } catch(err){
        return {error:'summary', err:err}
    }
    
}
