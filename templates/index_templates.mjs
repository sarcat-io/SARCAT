import { fileURLToPath } from 'url' //////////Native NodeJS fileUrl <> Path function
import { dirname, normalize } from 'path' //////////Native NodeJS local file path functions
import { readFileSync } from 'node:fs'
const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const moduleRelPath = `.${__filename.split(process.cwd()).at(-1)}`
import {_SC_utilities} from '../!application!/utilities/index_utilities.mjs'
export class _SC_templates {
    constructor(){
        this._di = new _SC_utilities().directoryIterator
    }

    loadJSON = async ()=> {
        var jsonFiles = await (await this._di(`${__dirname}`)).filter(x=>x.extension == 'json')
        for(var template_file of jsonFiles){
            var targetFolder = template_file.path.split('/').at(-1)
            this[targetFolder]||={}
            try {
                var data = readFileSync(`${template_file.path}/${template_file.name}`)
                if(data.length > 0){
                    this[targetFolder][template_file.label] = JSON.parse(data)
                }
            } catch(err){
                console.error(template_file.name, err)
            }
        }
        return this
    }
    loadModules = async () => {
        var modules = await (await this._di(`${__dirname}`)).filter(x=>x.extension == 'mjs')
        for(var template_file of modules){
            try {
                this[template_file.label] = await import(`${template_file.path}/${template_file.name}`)
            } catch(err){
                console.error(template_file.name, err)
            }
        }
        return
    }
}