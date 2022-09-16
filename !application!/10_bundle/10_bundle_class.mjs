import {stageBundle} from './bundle.mjs'
import {addStandardDirs} from './makeBundle.mjs'
import {stageRawFiles} from './rawFiles.mjs'

// rawFiles = async(directoryObject, rawScanFileRegistry) => {
//     return await stageRawFiles(directoryObject, rawScanFileRegistry)
// }
export class _SC_10_bundle {
    constructor(_SC_classObject) {
        for(var main in _SC_classObject){
            this[main] = _SC_classObject[main]
        }
    }
    bundle = async() =>{
        var workingBundle = await stageBundle(this)
        await addStandardDirs(this,workingBundle)
        return workingBundle
    }
}
