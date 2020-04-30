const fs = require('fs')
const contentFilePath = './content.json'
const scriptFilePath = './content/after-effects-script.js'

function save(content){
    const contentString = JSON.stringify(content)
    return fs.writeFileSync(contentFilePath, contentString)
}

//para o after effects, eh necessário um arquivo javascript em q a estrategia vai ser
//criar esse arquivo com o codigo "var content =${contentString}"
function saveScript(content) {
    const contentString = JSON.stringify(content)
    const scriptString = `var content = ${contentString}`
    return fs.writeFileSync(scriptFilePath, scriptString)
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
    saveScript,
    load
}