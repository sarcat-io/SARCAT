import {DateTime} from 'luxon'
export default async function (ts){
    if(!ts){
        var dt = DateTime.now()
    } else {
        var dt = DateTime.fromMillis(ts)
    }
    var dt_detail = dt.c
    var dt_month = dt.monthShort.toUpperCase()
    var dt_day = String(dt_detail.day).padStart(2,0)
    return `${dt.year}${dt_month}${dt_day}`
}
