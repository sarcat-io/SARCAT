import { Easy } from "easy-lowdb";
import {normalize} from 'path'
// SARCAT/__SARCAT_ARCHIVE/bundles/SARCAT_bundle_0001/02_assessment-data/02-01_parsed-raw-data/2022MAR_conMon_parsed.json
const archiveDirectory = normalize(`${process.cwd()}/../../../../__SARCAT_ARCHIVE/bundles/SARCAT_bundle_0001/02_assessment-data/02-01_parsed-raw-data`)
var vuln = new Easy('2022MAR_conMon_parsed', archiveDirectory)
var vuln_keys = new Easy('vulnKeys', archiveDirectory)
// await vuln.read()

// export async function sarcatObjects(runObj, sarcat_db, resObj, summaryOutput){
export async function poam(runObj, poam_db, resObj, poamOutput){
    // processReportHost(await resObj.parse_db.read())
    //cve column if existing list, then persist list
    //
    var allHostnames =  resObj.sarcat_db.data.host.map(x=> x.name)
    var vulnDict = {}
    resObj.sarcat_db.data.assessment.allCVEs.forEach(x=>{
        vulnDict[x] = resObj.sarcat_db.data.host.filter(y=>y.report.host_report_summary.cve_list.includes(x)).map(z=>z.name)
    })
    poam_db.data.byCVE = {summary: {totalCVEs: Object.keys(vulnDict).length, totalHostCount: allHostnames.length}}
    poam_db.data.inventory = {hostnames: allHostnames, CVEs: Object.keys(vulnDict)}
    var softwarePackageInventory = {}
    resObj.summary_db.data.detailPluginCapture['22869'].map(y=>y.output).forEach(b=> {
        for(var pkg of b){
            var tmp = pkg.split('|')
            var name = tmp[0].split(/\-\d/)[0]
            var ver = tmp[0].split(`${name}-`)[1]
            softwarePackageInventory[name]||={versions:[]}
            softwarePackageInventory[name].versions.push(ver)
        }
    })
    for(var key in softwarePackageInventory){
        softwarePackageInventory[key].versions = [... new Set(softwarePackageInventory[key].versions)]
    }
    poam_db.data.inventory.softwarePackages = softwarePackageInventory

    // process inventory 
    // user inventory
    //hostname IP mappin// connection inventory?
        // include service name and port
    await poam_db.write()
    return
    // By pluginID
    // by CVE => resObj.sarcat_db.data.assessment.allCVEs

    // host.name
    // host.properties.identifiers
    // host.report
    // host.report.summary_by_severity  report_detail_by_severity
    // host.report.cve_report cve_detail
    // host.report.general_information (config details)
    
    // existing findings -> update status
    // prompt for deviations if new. (do this in analyze stage)

    // asset inventory systems, software, containers, configs
    
    
}


export const regularExpressions= [
    {"type":"ip","exp": RegExp(/\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}↵(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/gi)},
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
const tagInterest = [{"type":"identifier","values":["ip", "mac", "fqdn", "id","address", "host"]},{"type":"config", "values":["os", "operating", "kernel","image","ami"]},{"type": "cloud","values":["aws","vpc","ec2"]}]
async function hostProp(hp){
    var hostDict = {
        hostPropertiesTopLevel: [],
        hptl:{},
        hp2l:{},
        h3pl:[]
    }
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
            hostDict.hp2l[k] = hpEntry[k]
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
        }
    }
    return hostDict
}
// await vuln_keys.read()

var fieldList = ["severity","risk_factor","cve","cwe","plugin","port","svc_name","fname","stig_severity"]
async function allKeys(report){
    await report.forEach(async (x)=>{
        vuln_keys.data.pluginSev[x.pluginID]||={}
        var cvssList = Object.keys(x).filter(x=>x.includes('cvss'))
        if(cvssList.length > 0){
            fieldList = [...new Set(fieldList.concat(cvssList))]
        }
        for(var f of fieldList){
            if(x[f]){
                vuln_keys.data.pluginSev[x.pluginID][f]||=[]
                if(typeof x[f] == 'string' || typeof x[f] == 'number'){
                    vuln_keys.data.pluginSev[x.pluginID][f].push(x[f])
                } else {
                    vuln_keys.data.pluginSev[x.pluginID][f].push(...x[f])
                }
                
            }
        }
    })
    var sevDict = {}
    vuln_keys.data.vulnDict||= {}
    var severity = [...new Set(report.map(x=>x.severity))]
    for(var sev of severity){
        sevDict[sev] = report.filter(x=>x.severity == sev)
    }
    for(var sev of severity){
        vuln_keys.data.vulnDict.allVulnKeys||={}
        vuln_keys.data.vulnDict.allVulnKeys[sev] = new Set(vuln_keys.data.vulnDict.allVulnKeys[sev])

        sevDict[sev].forEach(x=>{
            var xKeys = Object.keys(x)
            for(var key of xKeys){
                vuln_keys.data.vulnDict.allVulnKeys[sev].add(key)
            }
        })
        vuln_keys.data.vulnDict.allVulnKeys[sev] = [...vuln_keys.data.vulnDict.allVulnKeys[sev]]
    }
    
    return
}

async function deltaK(report){
    var sevDict = {}
    vuln_keys.data.vulnDict||= {}
    var severity = [...new Set(report.map(x=>x.severity))]
    for(var sev of severity){
        vuln_keys.data.vulnDict.deltaVulnKeys||={}
        vuln_keys.data.vulnDict.deltaVulnKeys[sev]||=[]
        sevDict[sev] = report.filter(x=>x.severity == sev)
        vuln_keys.data.vulnDict.deltaVulnKeys[sev] = new Set(vuln_keys.data.vulnDict.deltaVulnKeys[sev])
    }
    for(var sev of severity){
        sevDict[sev].forEach(x=>{
            var delta = vuln_keys.data.vulnDict.allVulnKeys[sev].filter(y=>!Object.keys(x).includes(y))
            if(delta.length > 0){
                delta.forEach(z=>{
                    vuln_keys.data.vulnDict.deltaVulnKeys[sev].add(z)
                })
            }
        })
        vuln_keys.data.vulnDict.deltaVulnKeys[sev] = [...vuln_keys.data.vulnDict.deltaVulnKeys[sev]]
    }
    return
}
async function processReportHost(report){
    await vuln_keys.read()
    vuln_keys.data.pluginSev||={}

    await report.Report[0].ReportHost.forEach(async(repHost)=>{
        await allKeys(repHost.ReportItem)
    })
    

    await report.Report[0].ReportHost.forEach(async(repHost)=>{
        await deltaK(repHost.ReportItem)
    })

    vuln_keys.data.vulnDict.stable||= {}
    for(var sev in vuln_keys.data.vulnDict.allVulnKeys){
        var all = vuln_keys.data.vulnDict.allVulnKeys[sev]
        var delta = vuln_keys.data.vulnDict.deltaVulnKeys[sev]
        vuln_keys.data.vulnDict.stable[sev] = all.filter(x=>!delta.includes(x))
    }
    vuln_keys.data.compDict||={}
    for(var sev in vuln_keys.data.vulnDict.stable){
        for(var sev2 in vuln_keys.data.vulnDict.stable){
            if(sev != sev2){
                vuln_keys.data.compDict[`${sev}_${sev2}`] = vuln_keys.data.vulnDict.stable[sev].filter(x=>!vuln_keys.data.vulnDict.stable[sev2].includes(x))
            }
        }
    }
    var badField = ['cve', 'port','svc_name']
    for(var pl in vuln_keys.data.pluginSev){
        for(var f in vuln_keys.data.pluginSev[pl]){
            vuln_keys.data.pluginSev[pl][f] = [...new Set(vuln_keys.data.pluginSev[pl][f])]
            if(vuln_keys.data.pluginSev[pl][f].length > 1 && !badField.includes(f)){
                console.log(pl, f, vuln_keys.data.pluginSev[pl][f])
            }
        }
    }
    // await vuln_keys.write()
    console.log('done')

    // var hostProperties = await hostProp(repHost.HostProperties)
    // var reports = 
    // console.log(hostProperties)
}

// processReportHost(vuln.data)