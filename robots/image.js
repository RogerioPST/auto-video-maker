// use strict - O que é ela faz basicamente é melhorar a qualidade do código, pois chama exceções quando usamos variáveis não declaradas, por exemplo
'use strict';

const imageDownloader = require('image-downloader')
const jimp = require('jimp');

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
    await convertAllImages(content)  
    await createAllSentenceImages(content)
    await createYouTubeThumbnail()


  //  state.save(content)
    
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
    
    async function downloadAllImages(content){
        content.downloadedImages = []

        for(let sentenceIndex =0; sentenceIndex < content.sentences.length; sentenceIndex++){
            const images = content.sentences[sentenceIndex].images

            for (let imageIndex =0; imageIndex < images.length; imageIndex++){
                const imageURL = images[imageIndex]  
                
                try{
                    if (content.downloadedImages.includes(imageURL)){
                        throw new Error('Imagem já foi baixada')
                    }
                    await downloadAndSave(imageURL, `${sentenceIndex}-original.png`)
                    content.downloadedImages.push(imageURL)
                    console.log(`> [${sentenceIndex}][${imageIndex}] Baixou imagem com sucesso ${imageURL}`)
                    break
                }catch(error){
                    console.log(`>[${sentenceIndex}][${imageIndex}] Erro ao baixar imagem: ${imageURL} - ${error}`)                            
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

    async function convertAllImages(content){
        for(let sentenceIndex =0; sentenceIndex < content.sentences.length; sentenceIndex++){
            await convertImage(sentenceIndex)
        }            
    }

    async function convertImage(sentenceIndex){
// o [0] eh um comando p, caso venha um GIF, q seja aproveitado apenas o primeiro frame desse gif
//const inputFile = `./content/${sentenceIndex}-original.png[0]`
        const inputFile = `./content/${sentenceIndex}-original.png`
        const outputFile = `./content/${sentenceIndex}-converted.png`
        const width = 1920
        const height = 1080

        jimp.read(inputFile)
        .then(newImg => {
            console.log(`> Image converted: ${inputFile}`)            
            return newImg
            .resize(width, height) // resize
            .quality(60) // set JPEG quality   
            .blur(10)         
            .write(outputFile)
        })
        .catch(err => {
            console.error(err);
            throw new Error(err);
        });
    }

    async function createAllSentenceImages(content){
        for(let sentenceIndex =0; sentenceIndex < content.sentences.length; sentenceIndex++){
            await createSentenceImage(sentenceIndex, content.sentences[sentenceIndex].text)
        }

    }

    async function createSentenceImage(sentenceIndex, sentenceText){
        const outputFile = `./content/${sentenceIndex}-sentence.png`

        const templateSettings ={
            0: {
                size: '1920x400',
                gravity: 'center'
            },
            1: {
                size: '1920x1080',
                gravity: 'center'
            },
            2: {
                size: '800x1080',
                gravity: 'west'
            },
            3: {
                size: '1920x400',
                gravity: 'center'
            },
            4: {
                size: '1920x1080',
                gravity: 'center'
            },
            5: {
                size: '800x1080',
                gravity: 'west'
            },
            6: {
                size: '1920x400',
                gravity: 'center'
            }
        }

        //0x0 - gera imagem com fundo transparente
        new jimp(1920, 1080, 0x0, (err, newImg) => {
            // this image is 256 x 256, every pixel is set to #FF00FF    
            jimp.loadFont(jimp.FONT_SANS_128_WHITE).then(font => {
              console.log(`> Sentence created: ${outputFile}`)  
              newImg
              .print(font, 10, 10, 
                {
                  text: sentenceText,
                  alignmentX: jimp.HORIZONTAL_ALIGN_CENTER,
                  alignmentY: jimp.VERTICAL_ALIGN_MIDDLE
                },  
                1920,
                1080
              )              
              .write(outputFile); 
            });
          });
    }

    async function createYouTubeThumbnail(){
        jimp.read('./content/0-original.png')
            .then(thumbnail => {
                console.log(`> Creating YouTube thumbnail`)
                return thumbnail                                                
                .write('./content/youtube-thumbnail.jpg')        
            })
            .catch(err => {
                console.error(err);
            });
    }
}

module.exports = robot