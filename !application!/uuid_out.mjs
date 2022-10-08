import { v4 } from "uuid";
if(process.argv[2]){
    for(var i=Number(process.argv[2]);i>0;i--){
        console.log(v4())
    }
} else {
    console.log(v4())
}