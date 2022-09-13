import parser from 'fast-xml-parser'
import he from 'he'
import {readdirSync} from 'fs'
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { join } from 'path'
import { Low, JSONFile, JSONFileSync } from 'lowdb'
import {read, write} from 'easy-lowdb'
import neo4j from 'neo4j-driver'
import {invFunction} from './vulnScan_gen.mjs'

var globalVulns
var img2sha = {}
var hostContainerList = {}
const tagKeyList = ["host-ip", "Credentialed_Scan", "operating-system", "virtual-mac-address", "aws-instance-hostname", "aws-instance-local-ipv4", "aws-instance-mac", "mac-address", "aws-instance-accountId", "aws-instance-region", "aws-instance-availabilityZone", "aws-instance-vpc-id", "aws-instance-version", "aws-instance-instanceType", "aws-instance-instanceId", "aws-instance-imageId", "bios-uuid", "hostname"]

var shaList = new Set()
var imageIdList = new Set()
var easy_lowdb
export async function parseNetwork(sarcatConfig){
    easy_lowdb = await read(null, sarcatConfig.SARCAT_path_dataDir)

    if(!easy_lowdb['Vulnerability_Dictionary']){
        easy_lowdb['Vulnerability_Dictionary'] = {data: []}
    } 

    globalVulns = new Set(easy_lowdb['Vulnerability_Dictionary'].data)
    var parsed_files = Object.keys(easy_lowdb)

    for(var fn of sarcatConfig.rawScanFiles){
        var pk = fn.split('.')
        pk = pk[0]
        if(parsed_files.includes(`${pk}_summary`)){
            await detailCaptureProcess(pk, easy_lowdb[`${pk}_summary`].data.detailPluginCapture, sarcatConfig)
        }
        if(parsed_files.includes(`${pk}_parsed`)){
            await reportParse(pk, easy_lowdb[`${pk}_parsed`].data.Report[0].ReportHost, sarcatConfig)
            

            

        } 
    }
    
}


async function noDashKeys(key) {
    var newKey = key.split('-')
    newKey = newKey.map(x => x[0].toUpperCase() + x.slice(1,))
    newKey = newKey.join('')
    newKey = newKey[0].toLowerCase() + newKey.slice(1,)
    return newKey
}

async function reportParse(pk, repObj, sarcatConfig){
    var primeKey = pk || 'daily'
    var tempArr = []
    var repLength = repObj.length
    console.log("parsing network")
    console.log("parsing containers")
    console.log("parsing scan report details\n")
    repObj.forEach(async (x) => {
        var temp = { name: x.name, network: {}, vulnerabilities:[]}
        temp.instanceId = x.HostProperties[0].tag.filter(y => y.name == "aws-instance-instanceId").map(z => z.value)[0]
        temp.temp = x.HostProperties[0].tag.filter(y => tagKeyList.includes(y.name))
        temp.vulnerabilities = []
        var vulnIDs = new Set(x.ReportItem.map(t=>t.pluginID))
        temp.vuln_ids = [...vulnIDs]
        await x.ReportItem.forEach(g=>{

            var tempObj = {pluginID: g.pluginID, severity: g.severity, svc_name: g.svc_name, protocol: g.protocol, pluginName: g.pluginName, pluginFamily:g.pluginFamily,agent: g.agent, description:g.description}
            globalVulns.add(JSON.stringify(tempObj, Object.keys(tempObj).sort()))
            if(g.severity != 0){
                tempObj.port = g.port
                temp.vulnerabilities.push(tempObj)
            } 
        })
        if (temp.vulnerabilities.length == 0){
            temp.vulnerabilities.push({pluginID: 0, severity: 0, pluginName: `SARCAT: No Vulnerabilities ${Date.now()}`})
        }
        var repItems = x.ReportItem.map(a=> a)
        var repDocker = repItems.filter(a => a.pluginID = '110483').map(y => y.plugin_output)
        repDocker = repDocker
        hostContainerList[temp.name] = []
        var systemImageIds = []
        if (repDocker.length > 0){
            for (var line of repDocker){

                if (line){
                    line = line.split('\n')
                    for (var i=0;i<line.length;i++){
                        var lIndex = line[i].indexOf('Image ID :')
                       
                        if (lIndex >-1){
                            var shaId = line[i].split(' : ')
                            var imageId = line[i+2].split(/\s{1,}/)
                            systemImageIds[imageId[1]] = shaId[1]
                            shaList.add(shaId[1])
                        }
                    }
                }
                
            }
            for (var line of repDocker){
                if (line){
                    line = line.split('\n')
                    for (var i=0;i<line.length;i++){
                        var lIndex2 = line[i].indexOf('docker-containerd')
                        if (lIndex2 >-1){
                            if(!line[i].includes('unix:///')){
                                var imageId = line[i].split(/\s{1,}/)
                                var lindex3 = imageId.indexOf('docker-containerd-shim')
                                imageId = imageId[lindex3+1]
                                if(!systemImageIds[imageId]){
                                } else {
                                    imageIdList.add(imageId)
                                    hostContainerList[temp.name].push(systemImageIds[imageId])
                                    shaList.add(systemImageIds[imageId])
                                }
                            }
                        }
                    }

                }
            }
        }
        for (var key of tagKeyList) {
            var ndk = await noDashKeys(key)

            temp[ndk] = x.HostProperties[0].tag.filter(y => y.name == key)
            if (temp[ndk].length == 1) {
                temp[ndk] = temp[ndk][0].value

            } else if (temp[ndk].length == 0) {
                delete temp[ndk]
            }
            if (typeof temp[ndk] == 'string' && temp[ndk].includes('\n')) {
                temp[ndk] = temp[ndk].split('\n')
            }
        }
        if(temp.hostname){
            temp.role = temp.hostname.split('-')[1].slice(0, -1)
        }

        temp.security = {}
        temp.security.cpe = x.HostProperties[0].tag.filter(y => y.name.includes("cpe-")).map(z => z.value)
        temp.security.cves = x.HostProperties[0].tag.filter(y => y.name.includes("summary-cves-")).map(z => z.value)
        temp.network.listen_tcp = x.HostProperties[0].tag.filter(y => y.name.includes('netstat-listen-tcp')).map(z => z.value).filter(a => !a.includes('127.0.0.1'))
        temp.network.listen_udp = x.HostProperties[0].tag.filter(y => y.name.includes('netstat-listen-udp')).map(z => z.value).filter(a => !a.includes('127.0.0.1'))
        temp.network.established_tcp = x.HostProperties[0].tag.filter(y => y.name.includes('netstat-established-tcp')).map(z => z.value).filter(a => !a.includes('127.0.0.1'))
        temp.network.established_udp = x.HostProperties[0].tag.filter(y => y.name.includes('netstat-established-udp')).map(z => z.value).filter(a => !a.includes('127.0.0.1'))

        delete temp.temp
        tempArr.push(temp)
    })

    // })
    var tempInt = setInterval(async ()=>{
        if(repLength == tempArr.length){

            globalVulns = [...globalVulns]
            await write('Vulnerability_Dictionary', globalVulns,  sarcatConfig.SARCAT_path_dataDir)
            clearInterval(tempInt)
            await write(`${pk}_inv`, tempArr, sarcatConfig.SARCAT_path_dataDir)
            await write(`${pk}_containers`, {imageIdList: [...imageIdList], shaList: [...shaList], hostContainerList:hostContainerList},  sarcatConfig.SARCAT_path_dataDir)
            await hostNetServices(`${pk}_inv`,sarcatConfig)
            await allNetwork(`${pk}_inv`,sarcatConfig)
            return
        }
    },1000)


}

async function allNetwork(inv_key, sarcatConfig) {
    try{
        var net_key = `${inv_key.split('_')[0]}_net`
        var network = await read(net_key,sarcatConfig.SARCAT_path_dataDir)
        var inventory = await read(inv_key,sarcatConfig.SARCAT_path_dataDir)
        network.listen_tcp = [...new Set([].concat.apply([], inventory.map(x => x.network.listen_tcp)))]
        network.listen_udp = [...new Set([].concat.apply([], inventory.map(x => x.network.listen_udp)))]
        network.established_tcp = inventory.map(x => x.network.established_tcp)
        network.established_tcp = [...new Set([].concat.apply([], network.established_tcp.filter(y => y.length > 0)))]
        network.established_udp = inventory.map(x => x.network.established_udp)
        network.established_udp = [...new Set([].concat.apply([], network.established_udp.filter(y => y.length > 0)))]
        await write(net_key, network, sarcatConfig.SARCAT_path_dataDir)
    } catch (err){
        console.log('allnetwork', inv_key, err)
    }

    return
}

async function hostNetServices(inv_key, sarcatConfig) {
    var inventory = await read(inv_key, sarcatConfig.SARCAT_path_dataDir)
    var records = inventory.length
    for (var i=0;i<inventory.length;i++){
        inventory[i].network.services = {}
        inventory[i].network.services.tcp = inventory[i].network.listen_tcp.map(x => x.split(':')[1])
        inventory[i].network.services.udp = inventory[i].network.listen_udp.map(x => x.split(':')[1])
        inventory[i].network.mapped = {}
        inventory[i].network.mapped.tcp = []
        inventory[i].network.mapped.udp = []
        inventory[i].network.outbound = {}
        inventory[i].network.outbound.tcp = []
        inventory[i].network.outbound.udp = []
        if (inventory[i].network.established_tcp) {
            inventory[i].network.established_tcp.forEach(x => {
                if (x[0]) {
                    var node = x.split('-')[0]
                    var node_p = node.split(':')[1]
                    node = node.split(':')[0]
                    var guest = x.split('-')[1]
                    var guest_p = guest.split(':')[1]
                    guest = guest.split(':')[0]
                    if (node == guest) {
                        inventory[i].network.mapped.tcp.push({ node: node_p, guest: guest_p })
                    } else if (!inventory[i].network.services.tcp.includes(node_p)) {
                        inventory[i].network.outbound.tcp.push({ remote: guest, port: guest_p })
                    }
                }
            })
        }

        if (inventory[i].network.established_udp) {
            inventory[i].network.established_udp.forEach(x => {
                if (x[0]) {
                    var node = x.split('-')[0]
                    var node_p = node.split(':')[1]
                    node = node.split(':')[0]
                    var guest = x.split('-')[1]
                    var guest_p = guest.split(':')[1]
                    guest = guest.split(':')[0]
                    if (node == guest) {
                        inventory[i].network.mapped.udp.push({ node: node_p, guest: guest_p })
                    } else if (!inventory[i].network.services.udp.includes(node_p)) {
                        inventory[i].network.outbound.udp.push({ remote: guest, port: guest_p })
                    }
                }
            })
        }
        records--
        if(records % 100 ==0){
            console.log(`Net Services ${inv_key}: Remaining: ${records} of ${inventory.length}`)
        }


        await write(inv_key,inventory, sarcatConfig.SARCAT_path_dataDir)
    } 

    console.log()
    return
}

var finalDict = {}
async function detailCaptureProcess(key, data, sarcatConfig){
    var mKeys = Object.keys(data)
    var res = await packages(data[22869], 22869)
    var subKey = key.split('_')[0]
    await write(`${subKey}_detail`, res, sarcatConfig.SARCAT_path_dataDir)


     
}

var groupCount = 0
async function recursiveShrink(insider, pId, hosts){
    var i=0
    var counter1=0
    var counter2=0
    var track = []
    var maxLow = 10
    var maxHigh = 0
    for(var x=0;x<insider.length;x++){

        if(x != i){
            var delta1 = insider[i].filter(z=> !insider[x].includes(z))
            var delta2 = insider[x].filter(z=> !insider[i].includes(z))
            var ratio = delta1.length / insider[x].length
    
            if(ratio < 0.02){
                track.push(x)
            } else {
                if(ratio < maxLow){
                    maxLow = ratio
                } 
                if(ratio > maxHigh){
                    maxHigh = ratio
                }
            }
        }
       
    }

    var finalHold = insider[i]
    var finalHH = []
    finalHH.push(hosts[i])
    var slider = 0
    for(var bad of track){
        bad = bad-slider
        finalHH.push(hosts[bad])
        finalHold = [...finalHold, ...insider[bad]]

        var ar1h = hosts.slice(0,bad);
        var ar2h = hosts.slice(bad+1,)
        var hosts = [...ar1h, ...ar2h]

        var ar1 = insider.slice(0,bad)
        var ar2 = insider.slice(bad+1,)
        var insider = [...ar1, ...ar2]
        slider++
    }
    hosts.shift()
    insider.shift()
    finalDict[pId].push([...new Set(finalHold)])
    finalDict[`${pId}_hosts`].push([...new Set(finalHH)])
    return {cleanOut: insider, hosts: hosts}
}

async function packages(data, pId){
    var storeDict = {}
    var hosts = data.map(x=>x.host)
    finalDict[pId] = []
    finalDict[`${pId}_hosts`] = []
    var cleanOut = []
    var output = data.map(x=>x.output)
    var ticker = 0
    await output.forEach(async(x)=>{
        var tmp = []
        x = x.trim().split('\n')
        await x.forEach(y=>{
            tmp.push(y.split('|')[0].trim())
        })
        cleanOut.push([...new Set(tmp.slice(2,).sort())])
        ticker++
    })
    for(var a=0;a<hosts.length;a++){
        storeDict[hosts[a]]=cleanOut[a]
    }
    do {
        var obj = await recursiveShrink(cleanOut, pId, hosts)
        var cleanOut = obj.cleanOut
        var hosts = obj.hosts
    } while(cleanOut.length > 0)
    console.log(`\nFuzzy Logic Config Groups: ${finalDict[pId].length}\n`)
    return {plugin: pId, hostPkgs:storeDict, pkgConfigGroups: finalDict[pId], pkgConfigGroupsHosts: finalDict[`${pId}_hosts`]}
}

