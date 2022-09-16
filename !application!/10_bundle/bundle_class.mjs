import {stageBundle} from './bundle.mjs'
import {addStandardDirs} from './makeBundle.mjs'
import {stageRawFiles} from './rawFiles.mjs'

// rawFiles = async(directoryObject, rawScanFileRegistry) => {
//     return await stageRawFiles(directoryObject, rawScanFileRegistry)
// }
export class _SC_01_bundle {
    constructor(_SC_classObject) {
        for(var main in _SC_classObject){
            this[main] = _SC_classObject[main]
        }
    }
    bundle = async() =>{
        return await stageBundle(this)
        // return await stageBundle(this.directoryObject, null, this.bundleRegistry, await this.rawScanFileRegistry.read(), await this.sarcatConfig.read())
    }
}
