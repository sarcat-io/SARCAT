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
        var bundleRes = await stageBundle(this.directoryObject, null, this.configurationObject.bundleRegistry, null)
    }
}
