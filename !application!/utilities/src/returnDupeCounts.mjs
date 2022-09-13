export default async function(array){
    var arraySet = new Set()
    var arrayObj = {}
    for(var x of array){
        if(arraySet.has(x)){
            arrayObj[x]||=0
            arrayObj[x]++
        } else {
            arraySet.add(x)
        }
    }
    return arrayObj
}