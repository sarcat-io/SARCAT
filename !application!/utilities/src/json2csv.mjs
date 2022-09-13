const isObject = (obj) => {
    if(typeof obj == 'object') {
        return true
    } else {
        return false
    }
}

async function index(obj,is, value) {
    if (typeof is == 'string')
        return index(obj,is.split('.'), value);
    else if (is.length==1 && value!==undefined)
        return obj[is[0]] = value;
    else if (is.length==0)
        return obj;
    else
        return index(obj[is[0]],is.slice(1), value);
}

var headerSet = new Set()
async function singleObject(jsonObject, parentKeys) {
    if(!parentKeys){
        parentKeys = []
    }
    var keys = Object.keys(jsonObject)

    for(var k of keys){
        if(parentKeys.length == 0){
            headerSet.add(k)
        } else {
            headerSet.add(`${parentKeys.join('.')}.${k}`)
        }
        if(isObject(jsonObject[k])){
            parentKeys.push(k)
            console.log(parentKeys)
            await singleObject(jsonObject[k], parentKeys)
        } 
    }
    return
}

export default async function (arrayObjects){
    var rows = []
    for(var aO of arrayObjects){
        await singleObject(aO)
    }
    headerSet = [...headerSet]
    rows.push(headerSet)
    for(var aO of arrayObjects){
        var row = ''
        for(var h of headerSet){
            if(h.indexOf('.')>0){
                var ha = h.split('.')
                if(aO[ha[0]]){
                    var test = await index(aO, h)
                    row += test + ','
                } else {
                    row += ','
                }
            } else if(!aO[h]){
                row += ','
            } else if(isObject(aO[h])){
                row += ','
            } else {
                row += aO[h]+','
            }
        }
        rows.push(row)
    }
    return rows.join('\n')
}