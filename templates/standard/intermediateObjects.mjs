/* 
    This template defines the output requirements for industry provided parsers.
    SARCAT will catalog and register the files and then run the parser to produce the intermediat objects identified below.

    There are three supported output format structures for parsing
    1. Asset -> List of vulnerabilities
    2. Vulnerability -> list of assets || <-- POAM 
    3. Unique Vulnerability <> Asset pairs. 

    Minimum Attribution:
        1. Asset Identifiers
            1 unique value in assetIdentifiers.networkAddressing
            or
            1 unique value in assetIdentifiers.systemNaming
        2. Vulnerability

*/

/* 
    The below example and default method is #1 above or "asset".
    structure is as follows:
    {
        File Info
        output: [
            {
                assetIdentifiers:{}
                vulnerabilities:[
                    {vuln 1},
                    {vuln 2},
                    {vuln 3},
                ]
            }
        ]
    }
*/
/* 
    The below example is #2 above or "vulnerability".
    structure is as follows:
    {
        File Info
        output: [
            {
                vulnerability:{}
                assets:[
                    {assetIdentifiers 1},
                    {assetIdentifiers 2},
                    {assetIdentifiers 3},
                ]
            }
        ]
    }
*/

/* 
    The below example is #3 above or "none".
    structure is as follows:
    {
        File Info
        output: [
            {
                vulnerability:{}
                assetIdentifiers:{}
            }
        ]
    }
*/




export const fileInfo = {
    "uuid":"SARCAT PROVIDED",
    "scanFileName": "SARCAT PROVIDED",
    "scanFileHash": "SARCAT PROVIDED",
    "firstSeen": "SARCAT PROVIDED",
    "scanStartTS":"System Owner Provided",
    "format":"System Owner Provided", // asset (e.g., #1 above), vulnerability (e.g., #2 above), none (e.g., #3 above - unique vuln <> asset pairs)
    "rawOutputTool": "", //
    "assessmentAccess":{
        "ubiquitous":true, //only true if access is verifiably consistent for every check conducted. 
        "proximity":"agent, local, remote", // local-root, local-insecure, local-secure, remote-internal-insecure, remote-internal-secure, remote-external, mixed // remote internal implies 
        "privilege":"secure, insecure, root/admin",
    },
    "output":[]
}

export const assetIdentifiers = {

        "uuid": "SARCAT PROVIDED",
        "networkAddressing":[
            {
                "IPv4":[""],
                "IPv6":[""],
                "MAC":[""],
                "VIP":[""],
                "NAT":[""]
            }
        ],
        "systemNaming": [
            {
                "hostname":[""],
                "fqdn":[""],
            }
        ],
        "processorId": [
            {
                "hostname":[""],
                "fqdn":[""],
            }
        ],
        "virtualCompute": [
            {
                "uuid":[""],
                "serial":[""]
            }
        ],
        "endPoint": [
            {
                "url":[""]
            }
        ],
        "container": [
            {
                "image_sha256":[""],
                "containerName":[""],
                "repository": [""]
            }
        ],
        "image": [
            {
                "sha256":[""]
            }
        ],
        "repository": [
            {
                "url":[""]
            }
        ]
    }

const vulnerability = {
    "uuid":"SARCAT PROVIDED",
    "cve":"",
    "cvss_v2":"",
    "cvss_v3":{},
    "pluginId":"",
    "signatureId":"",
    "vendorRiskScore":"", // e.g., 
    "releaseDate":"",
    "result":"positive, present", // Vulnerability not detected = 0,absent,not detected, | Vunerability detected: 3,present,detected,fail | Vulnerability possibly present, 1, present    
    "assessmentAccess":{
        "ubiquitous":true, //only true if the vulnerability check access is verifiably consistent for every asset. 
        "proximity":"agent, local, remote", // local-root, local-insecure, local-secure, remote-internal-insecure, remote-internal-secure, remote-external, mixed // remote internal implies 
        "privilege":"secure, insecure, root/admin",
    },
}


const results = {
    "0": "Check not run, results from check not present, check results not included in output, incomplete record",
    "1": "Not detected, vulnerability is absent,not detected, not applicable (e.g., vulnerable component not present on system",
    "2": "",
    "3": "Vulnerability detected",
}

const assessmentEventConfiguration = {
    "access": { 
        "ubiquitous":true, //only true if all vulnerability checks conducted on the asset are verifiably consistent. 
        "proximity":"agent, local, remote", // local-root, local-insecure, local-secure, remote-internal-insecure, remote-internal-secure, remote-external, mixed // remote internal implies 
        "privilege":"secure, insecure, root/admin",
    },
    "time":{
        
    }
}

const assessmentCheckDetail = {

}
        
const systemConfig = {
    hardware: {},
    software: {}
}

const recordFormat_1 = Object.assign({},fileInfo)
const recordFormat_1_Asset = Object.assign({}, assetIdentifiers)
recordFormat_1_Asset.vulnerabilities = [vulnerability,vulnerability,vulnerability,vulnerability]
recordFormat_1.output = [recordFormat_1_Asset, recordFormat_1_Asset, recordFormat_1_Asset, recordFormat_1_Asset]
export const format_1 = Object.assign({},recordFormat_1)

const recordFormat_2 = Object.assign({},fileInfo)
const recordFormat_2_vulnerability = Object.assign({}, vulnerability)
recordFormat_2_vulnerability.assets = [assetIdentifiers,assetIdentifiers,assetIdentifiers,assetIdentifiers]
recordFormat_2.output = [recordFormat_2_vulnerability,recordFormat_2_vulnerability,recordFormat_2_vulnerability,recordFormat_2_vulnerability]
export const format_2 = Object.assign({},recordFormat_2)

const recordFormat_3 = Object.assign({},fileInfo)
const recordFormat_3_pair = [assetIdentifiers, vulnerability]
recordFormat_3.output = [recordFormat_3_pair, recordFormat_3_pair, recordFormat_3_pair, recordFormat_3_pair]
export const format_3 = Object.assign({},recordFormat_3)