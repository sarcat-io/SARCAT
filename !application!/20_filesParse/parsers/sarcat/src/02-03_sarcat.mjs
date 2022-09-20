
//Need to capture scan config detail


export const regularExpressions= [
    {"type":"ip","exp": RegExp(/(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)/gi)},
    {"type":"fqdn","exp": RegExp(/(?=^.{4,253}$)(^((?!-)[a-zA-Z0-9-]{1,63}(?<!-)\.)+[a-zA-Z]{2,63}$)/gi)},
    {"type":"fqdn","exp": RegExp(/(?=^.{1,254}$)(^(?:(?!\d+\.)[a-zA-Z0-9_\-]{1,63}\.?)+(?:[a-zA-Z]{1,})$)/gi)},
    {"type":"email","exp": RegExp(/[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/gi)},
    {"type":"url","exp": RegExp(/(https?:\/\/)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/gi)},
    {"type":"url","exp": RegExp(/[-a-zA-Z0-9@:%_\+.~#?&//=]{2,256}\.[a-z]{2,4}\b(\/[-a-zA-Z0-9@:%_\+.~#?&//=]*)?/gi)},
    {"type":"url","exp": RegExp(/((\w+:\/\/)[-a-zA-Z0-9:@;?&=\/%\+\.\*!'\(\),\$_\{\}\^~\[\]`#|]+)/gi)},
    {"type":"ip","exp": RegExp(/(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/gi)},
    {"type":"file","exp": RegExp(/((\/|\\|\/\/|https?:\\\\|https?:\/\/)[a-z0-9 _@\-^!#$%&+={}.\/\\\[\]]+)+\.[a-z]+$/gi)},
    {"type":"mac","exp": RegExp(/(?:[0-9a-fA-F]{2}\:){5}[0-9a-fA-F]{2}/gi)},
    {"type":"cve","exp": RegExp(/CVE-\d{4}-\d{4,9}/gi)},
    {"type":"hash-md5","exp": RegExp(/^[a-fA-F0-9]{32}$/gi)},
    {"type":"hash-sha1","exp": RegExp(/^[a-fA-F0-9]{40}$/gi)},
    {"type":"hash-sha256","exp": RegExp(/^[a-fA-F0-9]{64}$/gi)},
    {"type":"uuid","exp": RegExp(/[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/gi)},
    {"type":"url-html","exp": RegExp(/<\s*a(\s+.*?>|>).*?<\s*\s*a\s*>/)},
    {"type":"kube","exp": RegExp(/k8s.*\n/gi)},
    {"type":"sha","exp": RegExp(/sha:.*\s|\n/gi)}
]
var genInfoPlugins = [45590,19506,11936,95928,90191,35351,45432, 25203,33276, 133964,22869,110483,55472,14272,25221]

const tagInterest = [{"type":"identifier","values":["ip", "mac", "fqdn", "id","address", "host"]},{"type":"config", "values":["os", "operating", "kernel","image","ami"]},{"type": "cloud","values":["aws","vpc","ec2"]}]
var globalCVE = []
var globalPluginIds = []
var data; var fileName; var outputDirectories; var fileHash; var outputDirectory; var resObj
export async function sarcatObjects(runObj, sarcat_db, resObj, outputDirectory){
    data = runObj.data; fileName = runObj.fileName, outputDirectories = runObj.outputDirectories; fileHash = runObj.fileHash; outputDirectory = outputDirectory
    var res = await processReport(resObj.parse_db.data, sarcat_db)
    res +=`Successfully created ${fileHash}_sarcat.json (Processes JSON -> Informative Data Objects\n`
    resObj.sarcatRes = `SARCAT_OUT|${fileHash}_sarcat.json|${outputDirectory}|sarcat\n`
    resObj.sarcat_db = sarcat_db
    return resObj
}
async function hostProp(hp){
    var hostDict = {
        hostPropertiesTopLevel: [],
        hptl:{},
        hp2l:{},
        h3pl:[]
    }
    var regexDict = {}
    var stringText = JSON.stringify(hp)
    for(var regObj of regularExpressions){
        var res = stringText.match(regObj.exp)
        if(res && res.length > 0){
            regexDict[regObj.type]||=[]
            regexDict[regObj.type].push(...res)
        }
    }
    hostDict.regEx = regexDict
    for(var hpEntry of hp){
        var keys = Object.keys(hpEntry)
        hostDict.hostPropertiesTopLevel.push(keys)
        for(var k of keys){
            hostDict.hptl[k] = new Set()
            await hpEntry[k].forEach(x=>{
                Object.keys(x).forEach(y=>{
                    hostDict.hptl[k].add(y)
                })
            })
            hostDict.hptl[k] = [...hostDict.hptl[k]]
            hostDict.netStat = hpEntry[k].filter(x=>x.name.includes('netstat'))
            hostDict.hp2l[k] = hpEntry[k].filter(x=>!x.name.includes('netstat'))
            for(var entry of hostDict.hp2l[k]){
                if(JSON.stringify(entry).indexOf('null')<0){
                    var entryRes = []
                    for(var k2 of hostDict.hptl[k]){
                        for(var ti of tagInterest){
                            for(var val of ti.values){
                                if(String(entry[k2]).includes(val)){
                                    entryRes.push(`${ti.type}:${val}`)
                                }
                            }
                        }
                    }
                    if(entryRes.length > 0){
                        entry.types = entryRes
                        hostDict.h3pl.push(entry)
                    }
                }
            }
            var identifiers = []
            var subTypes = []
            await hostDict.h3pl.filter(async(x)=>JSON.stringify(x.types).includes('identifier')).forEach((y)=>{
                var idSubType = y.types.filter(z=>z.includes('identifier')).map(a=>a.split(':')[1])
                if(idSubType.length > 0){
                    identifiers.push({subTypes:idSubType,value:y.value,tagName:y.name})
                    subTypes.push(...idSubType)

                }
            })
            subTypes = [...new Set(subTypes)]
            var idDict = {}
            for(var st of subTypes){
                identifiers.filter(x=> x.subTypes.includes(st)).forEach(z=>{
                    idDict[st]||=[]
                    idDict[st].push({tagName:z.tagName, value:z.value})
                })

            }
            hostDict.identifiers = idDict
            hostDict.id_source = identifiers
        }
    }
    return hostDict
}

async function processHostReport(report){
    var cveReports = report.filter(x=>x.cve!=null)
    var CVE_SEVERITY_CVSS = []
    var cve_report = {}
    cveReports.forEach(x=>{
        if(x.cve && typeof x.cve == 'object'){
            x.cve.forEach(y=>{
                cve_report[y]||=0
                cve_report[y]++
            })
        } else if(x.cve) {
            cve_report[x.cve]||=0
            cve_report[x.cve]++
        }
        CVE_SEVERITY_CVSS.push(x)
    })
    var reportSummary = {}
    reportSummary.counts = {}
    reportSummary.cve = {}
    reportSummary.pluginID = {}

    var hostInfo = {}
    hostInfo.services = [...new Set(report.map(x=>x.svc_name.replaceAll('?','')))]
    hostInfo.ports = [...new Set(report.map(x=>x.port))]
    var severity = [...new Set(report.map(x=>x.severity))]
    var pluginBySeverity = {}
    for(var sev of severity){
        pluginBySeverity[sev] = report.filter(x=>x.severity == sev)
        reportSummary.counts[sev] = pluginBySeverity[sev].length

        reportSummary.cve[sev] = []
        pluginBySeverity[sev].forEach(x=>{
            if(x.cve && typeof x.cve == 'object'){
                x.cve.forEach(y=>reportSummary.cve[sev].push(y))
            } else if(x.cve) {
                reportSummary.cve[sev].push(x.cve)
            }
        })
        reportSummary.cve[sev] = [...new Set(reportSummary.cve[sev])]
        reportSummary.pluginID[sev] = [...new Set(pluginBySeverity[sev].map(x=>x.pluginID))]
    }

    var summary = {}
    summary.cve = Object.keys(cve_report).length
    summary.cve_unique_reports = 0
    for(var cve in cve_report){
        summary.cve_unique_reports+=cve_report[cve]
    }
    summary.total_reports = report.length
    summary.cve_list = []
    report.forEach(x=>{
        if(x.cve && typeof x.cve == 'object'){
            x.cve.forEach(y=>summary.cve_list.push(y))
        } else if(x.cve) {
            summary.cve_list.push(x.cve)
        }
    })
    summary.cve_list = [...new Set(summary.cve_list)]
    if(summary.cve_list.length > 0){
        globalCVE.push(...summary.cve_list)
        globalCVE = [... new Set(globalCVE)]
    }

    summary.pluginIDs = [...new Set(report.map(x=>x.pluginID))]
    if(summary.pluginIDs.length > 0){
        globalPluginIds.push(...summary.pluginIDs)
        globalPluginIds = [... new Set(globalPluginIds)]
    }
    var genInfo = report.filter(x=>genInfoPlugins.includes(x.pluginID))
    var holder = []
    genInfo = genInfo.forEach(x=>{
        holder.push({pluginID: x.pluginID, port:x.port, plugin_output: x.plugin_output})
    })

    return {
        host_report_summary: summary,
        summary_by_severity: reportSummary,
        cve_report: cve_report,
        cve_detail: CVE_SEVERITY_CVSS,
        // report_detail_by_severity: pluginBySeverity,
        host_information: hostInfo,
        general_information: holder
    }
}

async function parsePolicy(policy, sarcat_db){
    await sarcat_db.read()
    sarcat_db.data.assessment = {}
    var serverPreferences = policy[0].Preferences[0].ServerPreferences[0].preference
    sarcat_db.data.assessment.serverPreferences = serverPreferences
    var spNames = serverPreferences.map(x=>x.name)
    sarcat_db.data.assessment.preferenceNames = [... new Set(spNames)]
    var spPluginSet = serverPreferences.filter(x=>x.name=='plugin_set')[0].value.split(';')
    sarcat_db.data.assessment.pluginSet = [... new Set(spPluginSet)]
    var spTarget = serverPreferences.filter(x=>x.name=='TARGET')[0].value.split(',')
    sarcat_db.data.assessment.targets = [... new Set(spTarget)]
    // var spAgentUUIDs = serverPreferences.filter(x=>x.name=='agent_uuids')[0].value.split(',')
    // sarcat_db.data.assessment.agentUUIDS = [... new Set(spAgentUUIDs)]
    var pluginPreferences = policy[0].Preferences[0].PluginsPreferences[0].item

    var pluginIds = [...new Set(pluginPreferences.map(x=>x.pluginId))]
    sarcat_db.data.assessment.pluginIds = pluginIds 
    var pidall = []
    var pluginIdAll = [... new Set(sarcat_db.data.host.map(x=>x.report.host_report_summary.pluginIDs))].forEach(y=>{
        pidall.push(...y)
    })
    pidall = [...new Set(pidall)]
    sarcat_db.data.assessment.allCVEs = globalCVE
    sarcat_db.data.assessment.allPluginIDs = globalPluginIds
    sarcat_db.data.assessment.pidall = pidall
    var delta = pidall.filter(x=>pluginIds.includes(x))
    sarcat_db.data.assessment.pluginIDallDelta = delta
    await sarcat_db.write()
    return
}

async function processReport(report, sarcat_db){
    await sarcat_db.read()
    sarcat_db.data.host||=[]
    await report.Report[0].ReportHost.forEach(async(repHost)=>{
        var hostObject = {name: repHost.name}
        hostObject.properties = await hostProp(repHost.HostProperties)
        hostObject.report = await processHostReport(repHost.ReportItem)
        // hostObject.containers = await containers(repHost.ReportItem.filter(a => a.pluginID = '110483').map(y => y.plugin_output))
        sarcat_db.data.host.push(hostObject)

    })
    await sarcat_db.write()
    
    await parsePolicy(report.Policy, sarcat_db)



    return true
    /**
     * Generate a scan event object with Unique IDs.
     * tag data with ids and bind the scan event with the raw scan files
     * time scan was run and duration
     * plugins
     * hosts
     * deltas (plugins and hosts didnt respond)
     * 
     */
}

async function containers(repDocker){
    var hostContainers = {
        imageIdList: new Set(),
        shaList: new Set()
    }
    // repDocker = repDocker.filter(a => a.pluginID = '110483').map(y => y.plugin_output)
    var systemImageIds = []
    if (repDocker.length > 0){
        // for (var line of repDocker){
        //     if (line){
        //         try {
        //             line = line.split('\n')
        //             for (var i=0;i<line.length;i++){
        //                 var lIndex = line[i].indexOf('Image ID :')
        //                 if (lIndex >-1){
        //                     var shaId = line[i].split(' : ')
        //                     var imageId = line[i+2].split(/\s{1,}/)
        //                     systemImageIds[imageId[1]] = shaId[1]
        //                     shaList.add(shaId[1])
        //                 }
        //             }
        //         } catch (err) {
        //             console.error(err)
        //         }
        //     }
        // }
        // for (var line of repDocker){
        //     if (line){
        //         line = line.split('\n')
        //         for (var i=0;i<line.length;i++){
        //             var lIndex2 = line[i].indexOf('docker-containerd')
        //             if (lIndex2 >-1){
        //                 if(!line[i].includes('unix:///')){
        //                     var imageId = line[i].split(/\s{1,}/)
        //                     var lindex3 = imageId.indexOf('docker-containerd-shim')
        //                     imageId = imageId[lindex3+1]
        //                     if(!systemImageIds[imageId]){
        //                     } else {
        //                         hostContainers.imageIdList.add(imageId)
        //                         hostContainers.shaList.add(systemImageIds[imageId])
        //                     }
        //                 }
        //             }
        //         }

        //     }
        // }
        hostContainers.imageIdList = [...hostContainers.imageIdList]
        hostContainers.imageIdList = [...hostContainers.shaList]
        return hostContainers
    }
}


// processReport(vuln.data)