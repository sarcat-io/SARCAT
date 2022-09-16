import { existsSync, mkdirSync } from 'node:fs' //////////Native NodeJS File Management
import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
var logObj = {module: moduleRelPath, function:'N/A'}
/////////////////////////////////////////////////////////////////////////////////////////////////////////
import chalk from 'chalk' //////////3rd Party Library for command line fonts and colors
/////////////////////////////////////////////////////////////////////////////////////////////////////////
import { Easy } from 'easy-lowdb'
import { _SC_utilities } from '../utilities/index_utilities.mjs'
import { _SC_templates } from '../../templates/index_templates.mjs'
const iterateDirectory = new _SC_utilities().directoryIterator
const _tmp = new _SC_templates()
await _tmp.loadJSON()
const archiveTemplateRegistry = _tmp.archive.archive
var directoryObject
var archiveDirectory
/////////////////////////////////////////////////////////////////////////////////////////////////////////
export async function setupArchive(_sc){
    directoryObject = _sc.directoryObject;archiveDirectory=directoryObject.archiveDirectory
    try {
        if(!existsSync(archiveDirectory)){
            console.log(`Creating SARCAT Archive Directory at ${archiveDirectory}`)
            mkdirSync(archiveDirectory)
        }
        console.log(`\nSARCAT Archive Paths:\n    -| Container Volume: ${chalk.yellowBright(archiveDirectory)} \n    -| Host/Local Drive: ${chalk.yellow(`${process.argv[2]}/__SARCAT_ARCHIVE`)}`)
        var archiveDirectoryContents = await iterateDirectory(archiveDirectory, true) //readdirSync(archiveDirectory, {withFileTypes:true})
        var archiveDirectoryContentNames = archiveDirectoryContents.map(x=>x.name)
        console.log(`${chalk.gray(`-----------------`)}\nChecking SARCAT Archive Directory Structure\n${chalk.gray(`-----------------`)}`)
        for(var entry of archiveTemplateRegistry){
            if(!archiveDirectoryContentNames.includes(entry.name)){
                console.log(`SARCAT Archive is missing ${entry.name} ${entry.type == 2? `Directory`:`File`} ....Baseline Template Added`)
                if(entry.type == 2){
                    mkdirSync(`${archiveDirectory}${entry.dir}${entry.name}`)
                } else if(entry.type == 1 && !entry.dir.includes('.sarcat')){
                    try {
                        var tmp_db = new Easy(entry.easy,`${archiveDirectory}${entry.dir}`)
                        await tmp_db.read()
                        await tmp_db.write()
                    } catch(err){
                        console.log(entry.name, err)
                    }

                }
            }
        }
        console.log(chalk.greenBright.bold('-----------------\nSARCAT Archive Structure is complete\n-----------------'))
        return true
    } catch (err){
        console.error(err)
        return false
    }   
}
