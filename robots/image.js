

const imageDownloader = require('image-downloader')

// a linha debaixo equivale a isso
//const {google} = require('googleapis');
const google = require('googleapis').google
const customsearch = google.customsearch('v1')

const state = require('./state.js')

const googleSearchCredentials = require('../credentials/google-search.json')
async function robot(){
    const content = state.load()

    await fetchImagesOfAllSentences(content)
    await downloadAllImages(content)       

    state.save(content)
    
   /*  async function fetchImagesOfAllSentences(content){
        for (const sentence of content.sentences){
            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fetchGoogleAndReturnImagesLinks(query)

            sentence.googleSearchQuery = query
        }            
    } */

    async function fetchImagesOfAllSentences(content) {
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
          let query
    
          if (sentenceIndex === 0) {
            query = `${content.searchTerm}`
          } else {
            query = `${content.searchTerm} ${content.sentences[sentenceIndex].keywords[0]}`
          }
    
          console.log(`> [image-robot] Querying Google Images with: "${query}"`)
    
          content.sentences[sentenceIndex].images = await fetchGoogleAndReturnImagesLinks(query)
          content.sentences[sentenceIndex].googleSearchQuery = query
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
    
    async function downloadAllImages(content){
        content.downloadedImages = []

        for(let sentenceIndex =0; sentenceIndex < content.sentences.length; sentenceIndex++){
            const images = content.sentences[sentenceIndex].images

            for (let imageIndex =0; imageIndex < images.length; imageIndex++){
                const imageURL = images[imageIndex]  
                
                try{
                    if (content.downloadedImages.includes(imageURL)){
                        throw new Error('Image already downloaded')
                    }
                    await downloadAndSave(imageURL, `${sentenceIndex}-original.png`)
                    content.downloadedImages.push(imageURL)
                    console.log(`> [${sentenceIndex}][${imageIndex}] Image succesfully downloaded: ${imageURL}`)
                    break
                }catch(error){
                    console.log(`>[${sentenceIndex}][${imageIndex}] Download Image Error: ${imageURL} - ${error}`)                            
                }
            }
        }
    }

    async function downloadAndSave(url, fileName){
        return imageDownloader.image({
            url: url, 
            dest: `./content/${fileName}`
        })
    }
}    

module.exports = robot