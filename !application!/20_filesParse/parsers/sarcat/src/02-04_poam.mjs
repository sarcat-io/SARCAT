import { Easy } from "easy-lowdb";
import {normalize} from 'path'
import { readFileSync } from "node:fs";
import {_SC_utilities} from '../../../../utilities/index_utilities.mjs'
import { writeFileSync } from "node:fs";
//https://cve.mitre.org/data/downloads/allitems.csv.gz
// unique bios and image IDs (e.g. AMI) for better grouping
//
//

/**
 * asset aggregate => 
 *                  asset identifiers
 *                  software
 *                  containers
 *              
 *                  Asset registry
 *                      types:
 * 
 *                          network addressing
 *                              ip
 *                              fqdn
 *                              mac
 *                              hostname
 *                          network connections
 *                              tcp
 *                              udp
 *                          services listening
 *                              tcp 
 *                              udp
 *                          system configuration
 *                              ami
 *                              software package
 *                              bios uuid
 *                          
 *                          system identifier
 *                              vpc
 *                              instance
 *                          
 *                          register aggregate
 *                          sarcat id
 * 
 * 
 *                          vpc
 *                          instance
 *                          
 *                          
 */
async function getCVE(year){
    var cve_db = new Easy(`CVE-${year}`,normalize(`${process.cwd()}/../commonData/cve_data/`))
    return cve_db.read()
}
var data; var fileName; var fileHash; var outputDirectory; var resObj

export async function poam(runObj, poam_db, ro, outDir){
    
    resObj = ro
    outputDirectory = outDir
    try {
        data = runObj.data; fileName = runObj.fileName, fileHash = runObj.fileHash; 
        const utils = new _SC_utilities()
        var cveDict = {}
        var vulnDict = {}
        resObj.sarcat_db.data.assessment.allCVEs.forEach(x=>{
            vulnDict[x] = resObj.sarcat_db.data.host.filter(y=>y.report.host_report_summary.cve_list.includes(x)).map(z=>z.name)
            cveDict[x.split('-')[1]]||=[]
            cveDict[x.split('-')[1]].push(x)
        })
        poam_db.data.description = ``
        poam_db.data.CVE_Official||={}
        for(var y in cveDict){
            var _db = await getCVE(y)
            for(var v of cveDict[y]){
                var mitreVerbiage = _db.data.cve.filter(x=>x.id == v)
                if(mitreVerbiage.length == 1){
                    poam_db.data.CVE_Official[v] = mitreVerbiage[0].row.split(`,Candidate,`)[1].replaceAll(`\"`,'').slice(0,-1)
                    poam_db.data.CVE_Official[v] = poam_db.data.CVE_Official[v].replace(/\s{1,6}\|\s{1,6}/gi,'\n')
                    poam_db.data.CVE_Official[v] = `${poam_db.data.CVE_Official[v].split(/\.,[A-Z]{1,10}:/)[0]}.`
                } else {
                    console.log(mitreVerbiage)
                }
    
            }
        }
        var hostSoftware = {}
        poam_db.data.assets = resObj.sarcat_db.data.host.map(x=>x.asset_id)
        poam_db.data.assessment_CVEs =  Object.keys(vulnDict)
        var softwarePackageInventory = {}
        resObj.summary_db.data.detailPluginCapture['22869'].map(y=>y.output).forEach(b=>{
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
        poam_db.data.softwarePackages = softwarePackageInventory
        poam_db.data.hostSoftware||={}
        resObj.summary_db.data.detailPluginCapture['22869'].forEach(x=>{
            poam_db.data.hostSoftware[x.host]||=[]
            for(var sp of x.output){
                var tmp = sp.split('|')
                var name = tmp[0].split(/\-\d/)[0]
                var ver = tmp[0].split(`${name}-`)[1]
                poam_db.data.hostSoftware[x.host].push({"name": name, "version": ver})
            }
        })

        await poam_db.write()
        var vrArr = []
        for(var vId in resObj.summary_db.data.vulnReference){
            vrArr.push(resObj.summary_db.data.vulnReference[vId])
        }

        poam_db.data.finding_detail = {}
        for(var entry of vrArr){
            if(entry.cve && typeof entry.cve == 'string'){
                entry.cve_detail = poam_db.data.CVE_Official[entry.cve]
            } else if(entry.cve && typeof entry.cve == 'object'){
                entry.cve_detail = []
                for(var cve of entry.cve){
                    entry.cve_detail.push({cve: cve, detail:poam_db.data.CVE_Official[cve]})
                }
            }
            poam_db.data.finding_detail[entry.uniqueQualifier] = Object.assign({},entry.plugin_output)
            delete entry.plugin_output
        }
        poam_db.data.findings = vrArr.filter(x=>x.severity > 0)
        delete poam_db.data.CVE_Official
    


        poam_db.data.uniqueHosts = resObj.summary_db.data.uniqueHosts


        // var softwarePackageInventory = {}
        // poam_db.data.softwarePackages = []
        // if(resObj.summary_db.data.detailPluginCapture['22869'].length > 0){
        //     resObj.summary_db.data.detailPluginCapture['22869'].map(y=>y.output).forEach(b=> {
        //         for(var pkg of b){
        //             var tmp = pkg.split('|')
        //             var name = tmp[0].split(/\-\d/)[0]
        //             var ver = tmp[0].split(`${name}-`)[1]
        //             softwarePackageInventory[name]||={versions:[]}
        //             softwarePackageInventory[name].versions.push(ver)
        //         }
        //     })
        //     for(var key in softwarePackageInventory){
        //         poam_db.data.softwarePackages.push({name: key, versions: [... new Set(softwarePackageInventory[key].versions)]})
        //     }
        //     // poam_db.data.softwarePackages = softwarePackageInventory
        // }

        poam_db.data.allContainers = resObj.summary_db.data.allContainers
        poam_db.data.hostContainers||={}
        var hostKeys = Object.keys(resObj.summary_db.data.hostContainers)
        hostKeys.forEach(c=>{
            poam_db.data.hostContainers[c] = resObj.summary_db.data.hostContainers[c].length > 0? resObj.summary_db.data.hostContainers[c] : []
        })
        poam_db.data.pluginsByFamily = {}
        vrArr.forEach(va => {
            poam_db.data.pluginsByFamily[va.pluginFamily]||=new Set()
            poam_db.data.pluginsByFamily[va.pluginFamily].add(va.pluginID)
        })
        for (var fm in  poam_db.data.pluginsByFamily){
            poam_db.data.pluginsByFamily[fm] = [...poam_db.data.pluginsByFamily[fm]]
        }

        
        poam_db.data.byCVE = {summary: {totalCVEs: Object.keys(vulnDict).length, totalHostCount: resObj.sarcat_db.data.host.length}}
        await poam_db.write()

        poam_db.data.netstat||={}
        resObj.sarcat_db.data.host.forEach(z=>{
            poam_db.data.netstat[z.name]||=[]
            z.netstat.forEach(a=>{
                var tmpVar = a.name.split('-')
                var tmpObj = {"connection_state": tmpVar[1],"protocol": tmpVar[2].split('4')[0]}
                var estObj = a.value.split('-')
                tmpObj.local_ip =  estObj[0].split(':')[0]
                tmpObj.local_port =  estObj[0].split(':')[1]
                if(tmpVar[1] == 'established'){
                    tmpObj.remote_ip =  estObj[1].split(':')[0]
                    tmpObj.remote_port =  estObj[1].split(':')[1]
                } 
                poam_db.data.netstat[z.name].push(tmpObj)
            })
        })
        await poam_db.write()
        //breakout by CVE severity and unique affected host count at that severity level e.g. 30 hosts have highs, 
        // for(var entries in resObj.summary_db.vulnReference){
    
        // }
    
        // // process inventory 
        // // user inventory
        // //hostname IP mappin// connection inventory?
        //     // include service name and port
        // await poam_db.write()
        var res =''
        res +=`Successfully created ${fileHash}_poam.json (Processed Data -> POAM Output Objects\n`
        res += `SARCAT_OUT|${fileHash}_poam.json|${outputDirectory}|poam\n`
        resObj.poamRes = res + `DELIVERABLE_OUT|${outputDirectory}${fileHash}_poam.json\n`
    
        resObj.poam_db = poam_db
        return resObj
    }catch(err){
        return {error:'poam', err:err}
    }
    
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
/**
 * need a unique identifier
 * POAM ID	                        auto-generate (incrementail)
 * Controls	                        RA-5 SI-7
 * Weakness Name                    plugin name 
 * Weakness Description	            Mitre CVE verbiage > plugin > 3PAO
 * Weakness Detector Source	        nessus?
 * Weakness Source Identifier	    ?
 * Asset Identifier	                fqdn 
 * Point of Contact	                email address in bundle
 * Resources Required               ***
 * Overall Remediation Plan	        ***
 * Original Detection Date          *** or defect registry
 * Scheduled Completion Date        *** and default to rule threshold threshold
 * Planned Milestones               ***
 * Milestone Changes                *** (auto populate based on date changes / at minimum overdue)
 * Status Date today
 * Vendor Dependency                ***
 * Last Vendor Check-in Date        *** (should have evidence on file like email or publication?)
 * Vendor Dependent Product Name	***
 * Original Risk Rating	            CVSS / Severity
 * Adjusted Risk Rating             ***
 * Risk Adjustment                  ***
 * False Positive	                ***
 * Operational Requirement	        ***
 * Deviation Rationale	            ***
 * Supporting Documents	            select files in registry
 * Comments	                        Notes to from
 * Auto-Approve	
 * Binding Operational Directive 22-01 tracking	
 * Binding Operational Directive 22-01 
 * Due Date	                        atuopopulte based on detection
 * CVE                              from report
 * CSP ticket info
 * sarcat finding UUID
 */ 
