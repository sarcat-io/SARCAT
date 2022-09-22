/**
 * This parser package is an example of how a SARCAT parser should be structured. 
 * It is broken out to several modular components for the following reasons:
 *      As a less dense example to serve as a reference
 *      Simplify maintenance and upkeep for future SARCAT stakeholders
 *      For modular usage by other SARCAT parsers in the event it is more expedient / efficient
 * 
 *
 * This example shows three run methods:
 *      Shell, Dockerized, Module / Function Import (native nodejs)
 *      Dockerized is preferred for many reasons but the primary reasons are:
 *          Multi-threading: each docker execution can spawn with its own CPU/RAM resources
 *              Shell takes advantage of this
 *              Module Import does not
*           The only advantage to module importing parser libraries is that data and functions can be more dynamic two way
            Docker and Shell are more or less a black box. Handing over input and output paths and thats all

    Using Easy-LowDB handles both JSON structure and fileSaving
        reading creates the class object with JSON structure and writing as seen below writes the json file to disk
 */

import url from 'url'
import {createReadStream} from 'node:fs'
import {Easy} from 'easy-lowdb'

import {parse} from './src/02-01_parse.mjs'
import {summaryObjects} from './src/02-02_summary.mjs'
import {sarcatObjects} from './src/02-03_sarcat.mjs'
import {poam} from './src/02-04_poam.mjs'




async function __parse__(runObj,parsedOutput){
/////
///// 1st stage. Function to convert from raw/proprietary data format, to JSON
/////
/**
 * Parse the file contents as original as possible. The idea is to maintain audit traceability between the original raw and the parsed file. 
 */
    return 



}

async function __summary__(runIbj, parseOutput, summaryOutput){


/////
///// 2nd stage. Function to extract summary information from 1st stage JSON. Summary Objects include cursory POAM objects.
/////
/**
 * Summary Example:
 *  Scan Tool Detail
 *      
 *  Scan Event Details
 *  Inventories: * Indicates mandatory output
 *      Assets Inventories
 *          *Primary Asset: Category -> list of asset unique identifiers
 *          Secondary Asset:
 *      Vulnerability Inventory:
 *          *Inventory of all vulnerabilities in scan with results (regardless of result)
 *          
 *          
 *          
 */
//  console.log(parseRes)



}


async function __sarcatObjects__(){
/**
 * These are the SARCAT intermediate objects and go beyond the data required for a POAM. These will grow and adapt over time as data points are identified and deemed valuable. Primarily focused on risk management (including CVSS 3.1)
 */





}





async function __poam__(){
/**
 * This function should output JSON objects with the same contents of a POAM. 
 * POAMs have finding entries (vulnerability, list of assets, detection date, severity etc....) in addition to inventories, and running trackers for changes
 * This function is not intended to complete a POAM, but simple to create the POAM objects based on the information in the scan file being parsed. The POAM objects will be correlated and assembled later in the overall process to include the output poam objects from multiple scan files
 * These poam objects are not yet filtered by rules or addressing false positives and deviations. That will be done later
 */






}


async function normalization(){
    /////
    /////
    /////

    /**
     * This function is to be used for all modules other than parse (which must represent as much of the original output in JSON format as is possible)
     * E.g., Severity Category, Date/Times, CVE format, verbiage, asset identifiers can all differ tool to tool.
     * The intention is for data conformity to "normal" will have automated testing. 
     */

    async function fields(){}
    async function values(){}

}



async function __main__(runObj){
    var resObj = {}
    /**
     * The main function preps the output directories for each subsequent functions exection
     * Although not linear, most functions will use the output of previous functions as data inputs
     * There will only be three arguments going from the parse engine to the parser index:
     *      input file path
     *      output directory path and filename
     * 
     */
    try {
        const {fileName, fileHash} = runObj
        const fileLabel = fileName.slice(0, -7)
        ///// 02-01
        var parseOutputDirectory = runObj.outputDirectories.parsedRawDirectory
        var parsedOutput = new Easy(`${fileHash}_parsed`,`${parseOutputDirectory}`)
        await parsedOutput.read()
        await parsedOutput.write()
        var resObj = await parse(runObj, parsedOutput, parseOutputDirectory)
        if(resObj.error){
            console.error(resObj.error, resObj.err)
            return
        }
        // console.log(resParse)
        // ///// 02-02
        var summaryObjectsDirectory = runObj.outputDirectories.summaryDirectory
        var summaryOutput = new Easy(`${fileHash}_summary`,`${summaryObjectsDirectory}`)
        await summaryOutput.read()
        await summaryOutput.write()
        resObj = await summaryObjects(runObj, summaryOutput, resObj, summaryObjectsDirectory)
        if(resObj.error){
                console.error(resObj.error, resObj.err)
                return
        }
        /// 02-03
        var sarcatObjectsDirectory = runObj.outputDirectories.sarcatObjectsDirectory
        var sarcatOutput = new Easy(`${fileHash}_sarcat`,`${sarcatObjectsDirectory}`)
        await sarcatOutput.read()
        await sarcatOutput.write()
        resObj = await sarcatObjects(runObj, sarcatOutput, resObj, sarcatObjectsDirectory)
        if(resObj.error){
            console.error(resObj.error, resObj.err)
            return
        }
        // resObj.parse_db = parsedOutput
        // resObj.summary_db = summaryOutput
        // resObj.sarcat_db = sarcatOutput
    
        ///// 02-04
        var poamObjectsDirectory = runObj.outputDirectories.poamObjectsDirectory
        var poamOutput = new Easy(`${fileHash}_poam`,`${runObj.outputDirectories.poamObjectsDirectory}`)
        await poamOutput.read()
        await poamOutput.write()
        resObj = await poam(runObj, poamOutput, resObj, poamObjectsDirectory)
        if(resObj.error){
            console.error(resObj.error, resObj.err)
            return
        }
        var {parseRes, summaryRes, sarcatRes, poamRes} = resObj
        console.log(parseRes, summaryRes, sarcatRes, poamRes)
    } catch(err){
        console.error(err)
    }
    

}



export default async function runDirect(fileName, filePath, outputDirectories){
    var runObj = {
        fileName: fileName, filePath:filePath, outputDirectories:outputDirectories
    }
    return loadData(runObj)
}


async function loadData(runObj){
    /////
    ///// Loads the data from the input file provided and converts to UTF-8 encoding
    /////
    var {fileName, filePath, outputDirectory} = runObj
    var dataArray = []
    var dataStream = createReadStream(`${filePath}/${fileName}`)
    dataStream.on('data', (data)=>{
        dataArray.push(data)
    })
    dataStream.on('end',()=>{
        runObj.data = Buffer.concat(dataArray).toString('utf-8')
        __main__(runObj)
    })
}


if (import.meta.url === url.pathToFileURL(process.argv[1]).href) {
    /////
    ///// Grabs arguments from the command line issued by the parser engine
    /////
    var outputDirectories = {}
    for(var i=4;i<process.argv.length;i++){
        outputDirectories[process.argv[i].split(':')[0]] = process.argv[i].split(':')[1]
    }
    var rawFilePath = process.argv[2].split('/')
    var rawfileName = rawFilePath.pop()
    var fileHash = process.argv[3]
    rawFilePath = rawFilePath.join('/')
    var runObj = {fileName:rawfileName, filePath:rawFilePath, fileHash: fileHash, outputDirectories: outputDirectories}
    loadData(runObj)
}




