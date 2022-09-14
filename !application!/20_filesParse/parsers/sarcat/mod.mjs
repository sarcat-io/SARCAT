import {readFileSync} from 'node:fs'

console.log(readFileSync(`${process.cwd()}/Dockerfile`).toString().split('\n'))