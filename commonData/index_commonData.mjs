import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
import { readFileSync } from 'node:fs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
import {_SC_utilities} from '../!application!/utilities/index_utilities.mjs'
export class _SC_commonData {
    constructor(){
        this._di = new _SC_utilities().directoryIterator
        this.sarcat = {}
    }
    async loadSarcat(){
        this.sarcat.dataFiles = await (await this._di(`${__dirname}/sarcat`)).filter(x=>x.extension == 'json')
        for(var cd_file of this.sarcat.dataFiles){
            try {
                var data = readFileSync(`${cd_file.path}/${cd_file.name}`)
                if(data.length > 0){
                    this.sarcat[cd_file.label] = JSON.parse(data)
                } 
            } catch(err){
                console.error(cd_file.name, err)
            }
        }
    }
}