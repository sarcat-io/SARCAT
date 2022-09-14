import {readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync} from 'node:fs' //////////Native NodeJS File Management
import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
import path from 'node:path'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
var logObj = {module:moduleRelPath, function:'N/A'}
///////////////////////////////////////////////////////
import inquirer from 'inquirer' //////////3rd Party Library for managing command line prompt questions and responses
import figlet from 'figlet' //////////3rd Party Library for diplaying ASCII based art
import chalk from 'chalk' //////////3rd Party Library for command line fonts and colors
import { Easy } from 'easy-lowdb'
import iterateDirectory from '../utilities/directoryIterator.mjs'

/////////////////////////////////////////////////////////////////////////////////////////////////////////////
const archiveDirectory = normalize(`${process.cwd()}/../__SARCAT_ARCHIVE`)
const templateDirectory = normalize(`${process.cwd()}/../templates`)
const registryDirectoy = normalize(`${process.cwd()}/../registry`)
const archiveTemplate = new Easy('archive',`${templateDirectory}/archive`)
await archiveTemplate.read()
const fedrampSystems = new Easy('fedrampSystems', registryDirectoy)
await fedrampSystems.read()
/////////////////////////////////////////////////////////////////////////////////////////////////////////
class questionBuild {
    constructor(questionObject){
        for(var k of Object.keys(questionObject)){
            this[k] = questionObject[k]
        }
        // this.onlyShowDir = null
        // this.onlyShowValid = true
    }
    transformer = (input) => {
        const name = input.split(path.sep).pop();
        return name
    }
    validate = (input)=>{
        const name = input.split(path.sep).pop();
        if (name[0] == ".") {
            return false
        } else {
            return true
        }
    }
    ask = async () => {
        return await inquirer.prompt(testQuestion)
        console.log(answer)
        return answer
    }

}
const questions = {
    
}

var testQuestion = {
    type: 'list',
    name: 'existing_settings',
    message: `Existing Settings Detected. Use these? `,
    choices: ['FedRAMP', 'DISA', 'CMMC', 'Internal', 'N/A'],
    default: 'FedRAMP'
}

var test = new questionBuild(testQuestion)
console.log('tesster',await test.ask())



async function setupAchiveConfig(sarcatConfig){
    var answers_1
    var answers_2
    var systemList = []
    var init_question = [ {
        type: 'confirm',
        name: 'existing_settings',
        message: `Existing Settings Detected. Use these? `,
        default: 'Y'
    }]
    const questions_1 = [
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


    if(Object.keys(sarcatConfig.data).length == 0){
        var configObj = {}
        var keys = Object.keys(process.env).filter(x=>x.indexOf('SARCAT_') == 0)
        for(var key of keys){
            configObj[key] = process.env[key]
        }
        console.log('\nSARCAT Settings:');
        console.log(sarcatConfig.data)
        console.log()
        inquirer.prompt(init_question).then(async (answers) => {
            if(answers.existing_settings == true){
                saveConfig(sarcatConfig.data)
            } else {
                await configQuestions()
            }
        });

    } else {
        await configQuestions()
    }


    async function configQuestions(){
        console.log(chalk.green.bold(
            figlet.textSync("SARCAT v0.1", {
            font: 'Fuzzy',
            horizontalLayout: "fitted",
            verticalLayout: "default"
            })
        ))
        inquirer.prompt(questions_1).then(async (answers) => {
                answers_1 = Object.assign({}, answers)
                systemList = fedrampSystems.data.filter(x=>(x.Cloud_Service_Provider.toLowerCase() == answers_1.organizationName.toLowerCase() && !x.Package_Id.includes('Inc.')))
                systemList = new Set(systemList.map(x=>`${x.Cloud_Service_Offering} - ${x.Service_Model} - ${x.Package_Id}`))
                systemList = [...systemList]
                systemList.push('----Not present')
                await q_round_2()
                return
            });

        }
    async function q_round_2(){
        const questions_2 = [
            {
                type: 'list',
                name: 'authorizedSystemSelection',
                default: systemList[0],
                message: `Select your authorized system`,
                choices: systemList,
                transformer: (input) => {
                    const name = input.split(path.sep).pop();
                    if (name[0] == ".") {
                    return chalk.grey(name);
                    }
                    return name;
                },
            }
        ]
        inquirer.prompt(questions_2).then(async (answers) => {
                answers_2 = Object.assign({},answers)
                await saveConfig()
                return
            });
    }
    async function saveConfig(){
        sarcatConfig.data.systemIdentification = Object.assign({},answers_1, answers_2)
        await sarcatConfig.write()
        return
    }
    return true
}

async function keyPairGeneration(){
    console.log(`SARCAT Archive Key Pair Exists`)
    return true
}
