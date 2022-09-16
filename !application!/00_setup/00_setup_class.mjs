import {setupArchive} from './archive.mjs'
import { stageConfig } from './config.mjs'



export class _SC_00_setup {
    constructor(_SC_classObject){
        for(var main in _SC_classObject){
            this[main] = _SC_classObject[main]
        }
    }
    archive = async() =>{
        return await setupArchive(this)
    }
    config = async()=>{
        return await stageConfig(this)
    }

}