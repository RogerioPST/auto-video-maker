// use strict - O que é ela faz basicamente é melhorar a qualidade do código, pois chama exceções quando usamos variáveis não declaradas, por exemplo
'use strict';

// a linha debaixo equivale a isso
//const {google} = require('googleapis');
const google = require('googleapis').google
const customsearch = google.customsearch('v1')

const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')
async function robot(){
    const content = state.load()

    await fetchImagesOfAllSentences(content)

    state.save(content)
    
    async function fetchImagesOfAllSentences(content){
        for (const sentence of content.sentences){
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)

            sentence.googleSearchQuery = query
        }            
    }
    
    //const imagesArray = await fetchGoogleAndReturnImagesLinks('Michael Jackson')
    //console.dir(imagesArray, { depth: null})
    //process.exit(0)

    async function fetchGoogleAndReturnImagesLinks(query){
        //console.log("query", query)
        const response = await customsearch.cse.list({
            auth: googleSearchCredentials.apiKey,
            cx: googleSearchCredentials.searchEngineId,                       
            q: query,            
            searchType: 'image',            
            num: 2,
                     
        })

        //console.log('URL', response)

        const imagesUrl = response.data.items.map((item) =>{
            return item.link
        })

        return imagesUrl
    }            
}

module.exports = robot