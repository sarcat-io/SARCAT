
import inquirer from 'inquirer' //////////3rd Party Library for managing command line prompt questions and responses
import figlet from 'figlet' //////////3rd Party Library for diplaying ASCII based art
import chalk from 'chalk' //////////3rd Party Library for command line fonts and colors
import path from 'node:path'
inquirer.registerPrompt('search-list', await import('inquirer-search-list'));
import inquirerFileTreeSelection from 'inquirer-file-tree-selection-prompt' //////////3rd Party Library for user input of local files and folders
/////////////////////////////////////////////////////////////////////////////////////////////////////////////
export default class {
    constructor(questionObject){
        var goodTypes = ["input", "password", "confirm"]
        var midTypes = ["datetime"]
        if(questionObject.length >= 1){
            var hold = []
            for(var q of questionObject){

                if (goodTypes.includes(q.type)){
                    q.validate = (input)=>{
                        if(input.length > 0){
                            return true
                        } else {
                            return false
                        }
                    }
                    q.transformer = (input) => {
                        const name = input.split(path.sep).pop();
                        return name
                    }
                } else if(midTypes.includes(q.type)) {
                    console.log(q)
                    q.validate = (input)=>{
                        if(input.length > 0){
                            return true
                        } else {
                            return false
                        }
                    }
                } else{
                    q.validate = (input)=>{
                        if(input.indexOf(path.sep) > -1){
                            var name = input.split(path.sep).pop();
                            if (name[0] == ".") {
                                return false
                            } else {
                                return true
                            }
                        } else {
                            return true
                        }


                    }
                }
                hold.push(q)
            }
            this.q = hold
        } 
        // else if(questionObject){
        //     this.q = questionObject[0]
        //     for(var k of Object.keys(questionObject)){
        //         this[k] = questionObject[k]
        //     }
        //     this.transformer = (input) => {
        //         const name = input.split(path.sep).pop();
        //         return name
        //     }
        //     this.validate = (input)=>{
        //         const name = input.split(path.sep).pop();
        //         if (name[0] == ".") {
        //             return false
        //         } else {
        //             return true
        //         }
        //     }
        //     if (this.q.type == 'input'){
        //         this.validate = (input)=>{
        //             if(input.length > 0){
        //                 return true
        //             } else {
        //                 return false
        //             }
        //         }
        //     }
        //     this.q = [this.q]
        // }
    }

    ask = async () => {
        return await inquirer.prompt(this.q)
    }

    example = async () =>{
        console.log ('Example Question Object',{
            type: 'list',
            name: 'existing_settings',
            message: `Existing Settings Detected. Use these? `,
            choices: ['FedRAMP', 'DISA', 'CMMC', 'Internal', 'N/A'],
            default: 'FedRAMP'
        })
        return await inquirer.prompt(this.testQuestion)
    }

    sarcat_art = async () =>{
        console.log(chalk.green.bold(
            figlet.textSync("SARCAT v1.0.1", {
            font: 'Fuzzy',
            horizontalLayout: "fitted",
            verticalLayout: "default"
            })
        ))
        return
    }

}

export async function sep(){
    return new inquirer.Separator()
}