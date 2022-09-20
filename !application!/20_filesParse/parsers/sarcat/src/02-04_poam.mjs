import { Easy } from "easy-lowdb";
import {normalize} from 'path'
import { readFileSync } from "node:fs";
import {_SC_utilities} from '../../../../utilities/index_utilities.mjs'
import { writeFileSync } from "node:fs";
//https://cve.mitre.org/data/downloads/allitems.csv.gz
// summary vulnReference is POAM
async function getCVE(year){
    var cve_db = new Easy(`CVE-${year}`,normalize(`${process.cwd()}/../commonData/cve_data/`))
    return cve_db.read()
}
var data; var fileName; var outputDirectories; var fileHash; var outputDirectory; var resObj
export async function poam(runObj, poam_db, resObj, poamOutput){
    data = runObj.data; fileName = runObj.fileName, outputDirectories = runObj.outputDirectories; fileHash = runObj.fileHash; outputDirectory = poamOutput
    const utils = new _SC_utilities()
    var cveDict = {}
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
    var vrArr = []
    for(var vId in resObj.summary_db.data.vulnReference){
        vrArr.push(resObj.summary_db.data.vulnReference[vId])
    }
    for(var entry of vrArr){
        if(entry.cve && typeof entry.cve == 'string'){
            entry.cve_detail = poam_db.data.CVE_Official[entry.cve]
        } else if(entry.cve && typeof entry.cve == 'object'){
            entry.cve_detail = []
            for(var cve of entry.cve){
                entry.cve_detail.push({cve: cve, detail:poam_db.data.CVE_Official[cve]})
            }
        }
    }
    poam_db.data.poam_findings = vrArr.filter(x=>x.severity > 0)
    delete poam_db.data.CVE_Official

    poam_db.data.poam_inventory||={hosts:resObj.summary_db.data.uniqueHosts}
    var softwarePackageInventory = {}
    if(resObj.summary_db.data.detailPluginCapture['22869'].length > 0){
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
        poam_db.data.poam_inventory.softwarePackages = softwarePackageInventory
    }
    poam_db.data.poam_inventory.containers = resObj.summary_db.data.allContainers
    await poam_db.write()

    // for(var entries in resObj.summary_db.vulnReference){

    // }

    // // process inventory 
    // // user inventory
    // //hostname IP mappin// connection inventory?
    //     // include service name and port
    // await poam_db.write()
    var res =''
    res +=`Successfully created ${fileHash}_poam.json (Processed Data -> POAM Output Objects\n`
    resObj.poamRes = res + `SARCAT_OUT|${fileHash}_poam.json|${outputDirectory}|poam\n`

    resObj.poam_db = poam_db


    return resObj
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
