import {v4} from 'uuid'
if(require.main === module){
    console.log(v4())
} else {
    return v4()
}
