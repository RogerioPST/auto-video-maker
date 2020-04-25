//robo de texto

const algorithmia = require('algorithmia')
const algorithmiaApiKey = require('../credentials/algorithmia.json').apiKey
const fs = require('fs');
const watsonApiKey = require('../credentials/watson-nlu.json').apikey

const NaturalLanguageUnderstandingV1 = require('ibm-watson/natural-language-understanding/v1');
//const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
//const { IamAuthenticator } = require('watson-developer-cloud/authorization/v1.js');
const { IamAuthenticator } = require('ibm-watson/auth');

//lib responsavel por separar por sentenças, verificando pontos e tal.
const sentenceBoundaryDetection = require('sbd')

const nlu = new NaturalLanguageUnderstandingV1({
  authenticator: new IamAuthenticator({ apikey: watsonApiKey }),
  version: '2018-04-05',
  url: 'https://api.eu-gb.natural-language-understanding.watson.cloud.ibm.com/instances/399a924f-eddf-455f-ae48-206aaa7b4d66'
});

//console.log(nlu.analyze)
/*
nlu.analyze(
{
    html: sentence,
    features: {    
    keywords: {}
    }
})
.then(response => {
    //console.log('sucesso', JSON.stringify(response.result, null, 2));
    const keywords = response.keywords.map((keyword) =>{
        return keyword.text
    })

    resolve(keywords)
})
.catch(err => {
    console.log('error chato: ', err);
    
});
*/

//eh um singleton
async function robot(content){
    await fetchContentFromWikipedia(content)    
    sanitizeContent(content)
    breakContentIntoSentences(content)
    limitMaximumSentences(content)
    await fetchKeywordOfAllSentences(content)

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

    function limitMaximumSentences(content){
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function fetchKeywordOfAllSentences(content){
        for (const sentence of content.sentences){
            sentence.keywords = await fetchWatsonAndReturnKeyWords(sentence.text)
            //console.log(sentence.keywords)
        }
    }

    async function fetchWatsonAndReturnKeyWords(sentence){       
       return nlu.analyze(
        {
            html: sentence,
            features: {    
            keywords: {}
            }
        })
        .then(response => {
            //console.log('sucesso', JSON.stringify(response.result, null, 2));
            //console.log("resposta", JSON.stringify(response.result, null, 2))
            const keywords = response.result.keywords.map((keyword) =>{
                return keyword.text
            })
        
            return keywords
        })
        .catch(err => {
            console.log('error chato: ', err);
            
        });                                      
    }
}
module.exports = robot