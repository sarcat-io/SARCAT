import {readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs' //////////Native NodeJS File Management
import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
import path from 'node:path'
import chalk from 'chalk'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
var logObj = {module:moduleRelPath, function:'N/A'}
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
import prompt,{sep} from '../utilities/promptUser.mjs'
import { _SC_commonData } from '../../commonData/index_commonData.mjs'
import { _SC_crypto } from '../utilities/crypto_class.mjs'
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
const _cd = new _SC_commonData()
await _cd.loadSarcat()
const fedrampSystems = _cd.sarcat.fedrampSystems
var states = _cd.sarcat.states
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function stageConfig (sarcatConfig){
    if(!sarcatConfig.data.systemIdentification || Object.keys(sarcatConfig.data.systemIdentification).length ==0){
        console.log(`SARCAT Archive Configuration Not Present`)
        await newConfig(sarcatConfig)
        return true
    } else {
        console.log(`SARCAT Archive Configuration Exists`)
        return true
    }
}

async function newConfig(sarcatConfig){
    const logLevels = [{"name":"Info", value: 0}, {"name":"Warning", value: 1},{"name":"Error", value: 2},{"name":"Critical", value: 3}]
    const questions_1 = [
        {
            type: 'list',
            name: 'logLevel',
            default: logLevels[0],
            message: `Select SARCAT console log level`,
            choices: logLevels,
            transformer: (input) => {
                const name = input.split(path.sep).pop();
                return name
            },
            validate: (input)=>{
                const name = input.split(path.sep).pop();
                if (name[0] == ".") {
                    return false
                } else {
                    return true
                }
            },
            onlyShowDir: true,
            onlyShowValid: true
        },
        {
            type: 'list',
            name: 'operatorRole',
            default: "ISSO",
            message: `Select your role (or the role you represent) relative to the system in scope for this activity`,
            choices: ["ISSO", "AO"]
        },
        {
            type: 'input',
            name: 'operatorEmail',
            message: `Enter your email address`,
            transformer: (input) => {
            const name = input.split(path.sep).pop();
            return name
            },
            validate: (input)=>{
            const name = input.split(path.sep).pop();
            if (name[0] == ".") {
                return false
            } else {
                return true
            }
            },
            onlyShowDir: true,
            onlyShowValid: true
        },
        {
            type: 'input',
            name: 'organizationName',
            message: `Enter your organization's name`,
            transformer: (input) => {
            const name = input.split(path.sep).pop();
            return name
            },
            validate: (input)=>{
            const name = input.split(path.sep).pop();
            if (name[0] == ".") {
                return false
            } else {
                return true
            }
            },
            onlyShowDir: true,
            onlyShowValid: true
        },
        {
            type: 'input',
            name: 'organizationDomain',
            message: `Enter your organization's domain (e.g., abc.com)`,
            transformer: (input) => {
            const name = input.split(path.sep).pop();
            return name
            },
            validate: (input)=>{
            const name = input.split(path.sep).pop();
            if (name[0] == ".") {
                return false
            } else {
                return true
            }
            },
            onlyShowDir: true,
            onlyShowValid: true
        },
        {
            type: 'input',
            name: 'serviceID',
            message: `If this bundle will be scoped to a specific service thats a component of the authorized system, provide the service name or other identifier`,
            default: 'N/A'
        },
        {
            type: 'list',
            name: 'systemAuthorizingBody',
            default: 'FedRAMP',
            message: `Select the system's Authorizing Body`,
            choices: ['FedRAMP', 'DISA', 'CMMC', 'Internal', 'N/A'],
            transformer: (input) => {
                const name = input.split(path.sep).pop();
                return name
            },
            validate: (input)=>{
                const name = input.split(path.sep).pop();
                if (name[0] == ".") {
                    return false
                } else {
                    return true
                }
            },
            onlyShowDir: true,
            onlyShowValid: true
        }
    ]

    var configPrompt_1 = new prompt(questions_1)
    console.log('-----------------')
    await configPrompt_1.sarcat_art()
    var answers_1 = await configPrompt_1.ask()
    var systemList = []

    systemList.push({name:"Not listed",value:'new'})
    systemList.push(await sep())

    var officialSystemList = fedrampSystems.filter(x=>(x.Cloud_Service_Provider.toLowerCase() == answers_1.organizationName.toLowerCase() && !x.Package_Id.includes('Inc.')))
    officialSystemList = new Set(officialSystemList.map(x=>`${x.Cloud_Service_Offering} - ${x.Service_Model} - ${x.Package_Id}`))
    officialSystemList = [...officialSystemList]
    if(officialSystemList.length > 0){
        await officialSystemList.forEach(x=>{
            systemList.push({name:x, value:x.split(' - ').at(-1)})
        })
    }
    systemList.push(await sep())


    const questions_2 = [
        {
            type: 'list',
            name: 'authorizedSystemSelection',
            default: systemList[0],
            message: `Select your authorized system`,
            choices: systemList
        }
    ]


    var configPrompt_2 = new prompt(questions_2)
    var answers_2 = await configPrompt_2.ask()

    await saveConfig()


    async function saveConfig(){
        sarcatConfig.data.systemIdentification = Object.assign({},answers_1, answers_2)
        sarcatConfig.data.config.systemRole = sarcatConfig.data.systemIdentification.operatorRole
        delete sarcatConfig.data.systemIdentification.operatorRole
        await sarcatConfig.write()
        return
    }
    return true
}
