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

var rawjsonnessus = `/Users/brianthompson/Code/SARCAT/SARCAT/__SARCAT_ARCHIVE/bundles/SARCAT_bundle_0001/02_assessment-data/02-01_parsed-raw-data/`
var ssp_meta = `/Users/brianthompson/Code/SARCAT/OSCAL/src/metaschema/oscal_ssp_metaschema.xml`
var rawkey = `d13c42323cb887b290185552f04c407dfa7eed6cf7055c9d669eafbbb1660fda_parsed`
// system-security-plan.system-implementation.inventory-items[]

// var ssp_json = createReadStream(`${process.cwd()}/ssp.xml`)
var nessus = new Easy(rawkey, rawjsonnessus)
await nessus.read()

var sd_pg_arr = []
for(var host of nessus.data.Report[0].ReportHost){
    sd_pg_arr.push(... new Set(host.ReportItem.filter(x=> x.pluginFamily == "Service detection").map(y=>y.pluginID)))
}

console.log([... new Set(sd_pg_arr)])
// var ssp_xml_path = `${process.cwd()}/ssp.xml`
// var ssp_xml = createReadStream(ssp_meta)

// var xml_ssp = []
// ssp_xml.on('data',chunk=>{
//     xml_ssp.push(chunk)
// })

// ssp_xml.on('end',()=>{
//     xml_ssp = Buffer.concat(xml_ssp).toString('utf-8')
//     parseXML(xml_ssp)

// })


// async function parseXML(data){
//     var valid_ = parser.validate(data)
//     if (valid_) { 
//         iterateDoc(parser.parse(data, xmlParserOptions))
//     } else {
//         console.log(valid_)
//     }
// }

// async function iterateDoc(data){
//     // console.log(component[3])
//     const metaschema = data.METASCHEMA[0]
//     var keys = Object.keys(metaschema)

//     // console.log(keys)
//     for(var k of keys){{
//         // console.log(k, data.METASCHEMA[0][k], )
//         // console.log(k, data.METASCHEMA[0][k])
//         if (Array.isArray(metaschema[k])){
//             var sysImp = metaschema[k].filter(x=>x.name == 'system-implementation')[0]
//             console.log(sysImp)
//             if(sysImp){
//                 var keys2 = Object.keys(sysImp)
//                 for(var kk of keys2){
//                     // console.log(sysImp[kk])
//                     if(!Array.isArray(sysImp[kk])){
//                         // console.log(k, kk, sysImp[kk])
//                         // for(var kkk in sysImp[kk]){
//                         //     console.log()
//                         //     console.log(kkk, sysImp[kk][kkk])
//                         // }
//                     } else {
//                         // console.log(k, kk, sysImp[kk][0].index)
//                         if( sysImp[kk][0].index){
//                             sysImp[kk][0].index.forEach(x=>{
//                                 console.log(x['key-field'])
//                             })
//                         }
 
//                     }
//                     // sysImp[kk].forEach(y=>{
//                     //     console.log(Objwct.keys(y))
//                     // })
//                     // console.log(kk, )
//                 }
//             }
//             // for(var sc of metaschema[k]){

//             //     console.log(sc)
//             // }

//             // console.log(k, data.METASCHEMA[0][k].map(x=>x.name))
//         } 
//         for(var subComp of data.METASCHEMA[0][k]){
//         //     console.log(k, subComp)
//         }
//     }}

// }

// async function iterateDoc(data){
//     var systemImplementation = data['system-security-plan'][0]['system-implementation'][0]
//     var inventory = systemImplementation['inventory-item']
//     var component = systemImplementation.component

//     for (var c of component){
//         console.log(c)
//     }
//     // console.log(component[3])
//     // var keys = Object.keys()
//     // console.log(keys)
//     // for(var k of keys){{
//     //     console.log(k, systemImplementation[k])
//     // }}

// }


/**
 * asset inventory prop values
 *                         <enum value="ipv4-address">The Internet Protocol v4 Address of the asset.</enum>
                        <enum value="ipv6-address">The Internet Protocol v6 Address of the asset.</enum>
                        <enum value="fqdn">The full-qualified domain name (FQDN) of the asset.</enum>
                        <enum value="uri">A Uniform Resource Identifier (URI) for the asset.</enum>
                        <enum value="serial-number">A serial number for the asset.</enum>
                        <enum value="netbios-name">The NetBIOS name for the asset.</enum>
                        <enum value="mac-address">The media access control (MAC) address for the asset.</enum>
                        <enum value="physical-location">The physical location of the asset's hardware (e.g., Data Center ID, Cage#, Rack#, or other meaningful location identifiers).</enum>
                        <enum value="is-scanned">is the asset subjected to network scans? (yes/no)</enum>
 */

// const propTypes = ["attribute", "unique"]

// const baseInventoryObject = {
//     "name":"",
//     "uuid":"",
//     "created_ts":"",
//     "modified_ts":"",
//     "version":"",
//     "scanActivityUUID":"",
//     "scanAsAdmin": "",
//     "scanType": "vulns, configs, pen, map"
// }

// const softwareAssetClassProps = Object.assign(baseInventoryObject, {
//     "format-identified": ["binary/compiled", "service", "process", "library"],
//     "language": [""],
//     "souce-persistence":["local repository", "local disk", "public repository", "internal-repository"],
//     "repository-url": "",
//     "is-cots": "",
//     "is-opensource": "",
//     "is-os-package":"",
//     "is-default-os-package":"",
// })

// const systemAssetClassProps = Object.assign(baseInventoryObject, {
//     "description": "aggreggation of asset components",
//     "format-identified": ["binary/compiled", "service", "process", "library"],
//     "language": [""],
//     "souce-persistence":["local repository", "local disk", "public repository", "internal-repository"],
//     "repository-url": "",
//     "is-cots": "",
//     "is-opensource": "",
//     "is-os-package":"",
//     "is-default-os-package":"",
//     "services":"", // array of service UUIDs 
//     "software":"", // array of service UUIDs 
//     "network":"",
//     "containers":"",
//     "host-operating-system":"",
//     "host-firmware":"", 
//     "bios":"",
//     "kernel":"",
//     "footprint":["container", "virtual machine", "vitual device"],
//     "DC":""
// })

// const geoAssetClass = {
//     datacenters
// }

// const cloudAssetClass = {
//     vpc

// }

// const networkNodetAssetClass = {
//     "type": ["ipv4", "ipv6", "mac", "fqdn", "host"],
//     "value":""
// }

// const configurationAssetClass = {
//     "system-image-id": ""
// }


// const networkAssetClassProps = Object.assign(baseInventoryObject, {
//     "description":"network asset vs system..... ",
//     "format-identified": ["binary/compiled", "service", "process", "library"],
//     "language": [""],
//     "souce-persistence":["local repository", "local disk", "public repository", "internal-repository"],
//     "repository-url": "",
//     "is-cots": "",
//     "is-opensource": "",
//     "is-os-package":"",
//     "is-default-os-package":"",
// })

// const connectionClassProps = Object.assign(baseInventoryObject, {
//     "name":"",
//     "uuid":"",
//     "created_ts":"",
//     "modified_ts":"",
//     "version":"",
//     "format-identified": ["binary/compiled", "service", "process", "library"],
//     "language": [""],
//     "souce-persistence":["local repository", "local disk", "public repository", "internal-repository"],
//     "repository-url": "",
//     "is-cots": "",
//     "is-opensource": "",
//     "is-os-package":"",
//     "is-default-os-package":"",
// })

// const endpointClassProps = Object.assign(baseInventoryObject, {
//     "url":"",
//     "tls-version":"",
//     "public-certificate-serial":"",
//     "port":"",
//     "":""

// })

// const constainerClassProps = {
//     "hash":"",
//     "image-name":"",
//     "platform":"",// executable e.g., docker, containerd, podman, k8s etc...
//     "runCommand": ""//in process output

// }

// const controllerClassProps = {
//     "dns-servers":"",
//     "repositories":"",
//     "authenticationSystems":""

// }



// const inventoryProps = [
//     {"name": "asset-class", "values": ["system", "endpoint", , "service", ], "type": "class"},
//     {"name": "", "value": ""},
//     {"name": "", "value": ""}
// ]

