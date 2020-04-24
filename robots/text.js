//robo de texto

const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
//lib responsavel por separar por sentenças, verificando pontos e tal.
const sentenceBoundaryDetection = require('sbd')

//eh um singleton
async function robot(content){
    await fetchContentFromWikipedia(content)    
    sanitizeContent(content)
    breakContentIntoSentences(content)

    //toda funcao assincrona retorna uma promise
    //console.log('logando na linha abaixo se a funcao "fetchContentFromWikipedia" retorna uma promise ')
    //console.log(fetchContentFromWikipedia())
    async function fetchContentFromWikipedia(content){        
        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey)
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo("web/WikipediaParser/0.1.2")
        const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm)
       // console.log('Fazendo log do objeto "wikipediaResponse" ')
        //console.log(wikipediaResponse)
        const wikipediaContent = wikipediaResponse.get()
        //console.log(wikipediaContent)

        content.sourceContentOriginal = wikipediaContent.content

    }

    function sanitizeContent(content){
        const withoutBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(content.sourceContentOriginal)
        const withoutDatesInParentheses = removeDatesInParentheses(withoutBlankLinesAndMarkDown)
        //console.log(withoutDatesInParentheses)

        content.sourceContentSanitized = withoutDatesInParentheses

        function removeBlankLinesAndMarkDown(text){
            const allLines = text.split('\n')            
            //removendo as linhas em branco do wikipedia
            const withoutBlankLinesAndMarkDown = allLines.filter((line) =>{
                if (line.trim().length === 0 || line.trim().startsWith('=')){
                    return false
                }
                return true
            })
            return withoutBlankLinesAndMarkDown.join(' ')
        }       

        function removeDatesInParentheses(text){
            //o wikipedia retornava esses caracteres malucos em replace(/  /g,' '). 
            //por isso o replace
            return text.replace(/\((?:\([^()]*\)|[^()])*\)/gm, '').replace(/  /g,' ')
        }
    }

    function breakContentIntoSentences(content){
        content.sentences = []
        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized)
        sentences.forEach((sentence) =>{
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
        //console.log(sentences)

    }
}

module.exports = robot