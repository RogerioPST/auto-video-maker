const fs = require('fs')
const contentFilePath = './content.json'

function save(content){
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, contentString)
}

function load(){
    const fileBuffer = fs.readFileSync(contentFilePath, 'utf-8')
    const contentJson = JSON.parse(fileBuffer)
    return contentJson
}

//no node, se o arquivo q está no file system eh JSON, podemos carregar assim
//mas uma vez q o node carregou, vai usar p sempre, msm q mude o arquivo
//vai usar do cache
//function load2(){
  //  return require('./content.json')
//}


module.exports ={
    save, 
    load
}