export default async function (csvString){
    var allRows = []
    csvString = csvString.split('\r\n')
    const headers = csvString.shift().split(',').map(x=>x.trim().replaceAll(' ', '_'))
    for(var row of csvString){
        row = row.split(',')
        var tmpRow = {}
        for(var i=0; i<headers.length;i++){
            tmpRow[headers[i]] = row[i]
        }
        allRows.push(tmpRow)
    }
    return allRows
}