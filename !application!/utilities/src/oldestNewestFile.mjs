//takes in array of statSync/node:fs objects
export default async function (fileArray){
    var sortedArray = fileArray.sort((a,b) => a.data.birthtimeMs - b.data.birthtimeMs)
    return {oldest: sortedArray.at(0), newest:sortedArray.at(-1)}
}