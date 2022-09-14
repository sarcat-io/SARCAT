import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
import { readFileSync } from 'node:fs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
import { _SC_utilities } from '../utilities/index_utilities.mjs'
import parseFiles from './index_parse.mjs'
export class _SC_20_filesParse {
    constructor (_SC_classObject){
        for(var main in _SC_classObject){
            this[main] = _SC_classObject[main]
        }
        
    }
    runFilesParse = async (workingBundle, updateEvent) => {
        await parseFiles(workingBundle, await this.rawScanFileRegistry.read(), await this.bundleRegistry.read(), updateEvent)
    }
}