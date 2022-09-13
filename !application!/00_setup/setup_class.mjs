import {setupArchive} from './archive.mjs'
import { stageConfig } from './config.mjs'



export class _SC_00_setup {
    constructor(archiveDirectory){
        this.archiveDirectory = archiveDirectory
    }
    archive = async() =>{
        return await setupArchive(this.archiveDirectory)
    }
    config = async(sarcatConfig)=>{
        return await stageConfig(sarcatConfig)
    }

}