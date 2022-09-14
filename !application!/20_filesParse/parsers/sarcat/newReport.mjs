import { Easy } from "easy-lowdb";
import {normalize} from 'path'
import { pid } from "process";
// SARCAT/__SARCAT_ARCHIVE/bundles/SARCAT_bundle_0001/02_assessment-data/02-01_raw-scan-data/2022MAR_conMon_parsed.json
const archiveDirectory = normalize(`${process.cwd()}/../../../../__SARCAT_ARCHIVE/bundles/SARCAT_bundle_0001/02_assessment-data/02-01_raw-scan-data`)
var vuln = new Easy('2022MAR_conMon_parsed', archiveDirectory)
var nessus = new Easy('nessus', archiveDirectory)
await vuln.read()
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
    summary.pluginIDs = [...new Set(report.map(x=>x.pluginID))]
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
        report_detail_by_severity: pluginBySeverity,
        host_information: hostInfo,
        general_information: holder
    }
}

async function parsePolicy(policy){
    await nessus.read()
    var serverPreferences = policy[0].Preferences[0].ServerPreferences[0].preference
    var spNames = serverPreferences.map(x=>x.name)
    var spPluginSet = serverPreferences.filter(x=>x.name=='plugin_set')[0].value.split(';')
    var spTarget = serverPreferences.filter(x=>x.name=='TARGET')[0].value.split(',')
    var spAgentUUIDs = serverPreferences.filter(x=>x.name=='agent_uuids')[0].value.split(',')
    var pluginPreferences = policy[0].Preferences[0].PluginsPreferences[0].item
    var pluginIds = [...new Set(pluginPreferences.map(x=>x.pluginId))]
    var pidall = []
    var pluginIdAll = [... new Set(nessus.data.host.map(x=>x.report.host_report_summary.pluginIDs))].forEach(y=>{
        pidall.push(...y)
    })
    pidall = [...new Set(pidall)]
    var delta = pidall.filter(x=>pluginIds.includes(x))
    console.log(spAgentUUIDs.length)
}
async function processReport(report){
    // await nessus.read()
    // nessus.data.host||=[]
    // await report.Report[0].ReportHost.forEach(async(repHost)=>{
    //     var hostObject = {name: repHost.name}
    //     hostObject.properties = await hostProp(repHost.HostProperties)
    //     hostObject.report = await processHostReport(repHost.ReportItem)
    //     nessus.data.host.push(hostObject)
    // })
    // await nessus.write()
    // console.log('done')
    await parsePolicy(report.Policy)
    /**
     * Generate a scan event object with Unique IDs.
     * tag data with ids and bind the scan event with the raw scan files
     * time scan was run and duration
     * plugins
     * hosts
     * deltas (plugins and hosts didnt respond)
     * 
     */
    // var hostProperties = await hostProp(repHost.HostProperties)
    // var reports = 
    // console.log(hostProperties)
}

processReport(vuln.data)