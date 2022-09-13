export default async function updateRegistryEntry(updatedObject, db){
    var key = `${updatedObject.type}s`
    await db.read()
    db.data[key] = db.data[key].filter(x=>x.uuid != updatedObject.uuid)
    db.data[key].push(updatedObject)
    await db.write()
    return
}