import {appendFileSync, existsSync, writeFileSync, createWriteStream} from 'node:fs'
import { Easy } from 'easy-lowdb' // append to array in future so logs are in single json file in bundle

export default class LogControl {
    constructor(consoleObj, logFileObj){
        this.consoleObj = consoleObj
        this.logFileObj = logFileObj
        this.outputDirectory = logFileObj.outputDirectory

        if(this.consoleObj.consoleMin== 'info'){
            this.minConsole = 0
        } else if(this.consoleObj.consoleMin== 'warn'){
            this.minConsole = 1
        } else if(this.consoleObj.consoleMin== 'error'){
            this.minConsole = 2
        } else if(this.consoleObj.consoleMin== 'critical'){
            this.minConsole = 3
        } if(this.consoleObj.consoleMin== 'none'){
            this.minConsole = 9
        } else {
            this.minConsole = 0
        }

        this.outFile = createWriteStream(`${this.outputDirectory}/runLogs/logOutput_${Date.now()}.log`)
        this.progressOut = createWriteStream(`${this.outputDirectory}/processLogs/sarcatProgress_${Date.now()}.log`)
    }
    prefix = (logLevel) => `${Date.now().toString()}|SARCAT|${logLevel}: ->`
    msg = (logObject, logLevel, message) => `${this.prefix(logLevel)} Module: "${logObject.module}" | Function: "${logObject.function}" | ${logLevel}: ${message}`
    info = async (logObject, message)=>{
        var logLevel = 'inf'
        var outData = this.msg(logObject, logLevel, message)
        if (this.minConsole == 0){
            console.log(outData)
        }
        this.outFile.write(`${outData}\n`)
        return
    }
    warn = async (logObject, message)=>{
        var logLevel = 'wrn'
        var outData = this.msg(logObject, logLevel, message) 
        if (this.minConsole <= 1){
            console.log(outData)
        }
        this.outFile.write(`${outData}\n`)
        return
    }
    error = async (logObject, message)=>{
        var logLevel = 'err'
        var outData = this.msg(logObject, logLevel, message) 
        if (this.minConsole <= 2){
            console.log(outData)
        }
        this.outFile.write(`${outData}\n`)
        return
    }
    critical = async (logObject, message)=>{
        var logLevel = 'crt'
        var outData = this.msg(logObject, logLevel, message) 
        if (this.minConsole <= 3){
            console.log(outData)
        }
        this.outFile.write(`${outData}\n`)
        return
    }
    progressPrefix = () => `${Date.now().toString()}|SARCAT|Progress: ->`
    progressMessage = (logObject, message) => `${this.prefix()} Module: "${logObject.module}" | ${message}`
    progress = async (logObject, message)=>{
        var outData = this.progressMessage(logObject, message)
        console.log(outData)
        this.progressOut.write(`${outData}\n`)
        return
    }
}
