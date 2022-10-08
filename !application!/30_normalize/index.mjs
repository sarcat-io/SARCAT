import { Easy } from "easy-lowdb"
import { v4 } from "uuid"

export class AssetInventory{
    constructor(archiveDirectory){
        this.archiveDirectory = archiveDirectory
    }
    checkAssets = async (name, value, filehash) => {
        await this.load()
        if(value){
            var chk = this.assetRegistry.data.assets.filter(x=>x.name==name && x.value==value)
        } else {
            var chk = this.assetRegistry.data.assets.filter(x=>x.name==name)
        }
        if(chk.length == 0) {
            var newUUID = v4()
            var type = this.assetRegistry.data.assets.filter(x=>x.name==name)
            this.assetRegistry.data.assets.push({"uuid":newUUID, type:type[0].uuid, "name":name, "value":value, "assessmentFileHash":filehash})
            await this.assetRegistry.write()
            return {"uuid":newUUID, type:type[0].uuid, "name":name, "value":value, "assessmentFileHash":filehash}
        } else if(chk.length == 1) {
            return chk[0]
        } else {
            return chk
        }
    }

    load = async () => {
        this.assetRegistry = new Easy("assetRegistry.sarcat",`${this.archiveDirectory}/.sarcat`)
        return await this.assetRegistry.read()
    }
}