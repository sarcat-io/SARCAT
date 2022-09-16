import {readFileSync} from 'node:fs'
import chalk from 'chalk'
export const logo = chalk.whiteBright.bold(readFileSync('./logo_ansi_200.ans').toString())
export const sarcat = chalk.greenBright.bold(readFileSync('./logo_sarcat.txt').toString())
