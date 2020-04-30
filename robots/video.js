/*
Pessoal, como alternativa ao after effects, no github do felvieira tem um código que usa um ou outro dependendo do parametro q vc passar e funcionou blzinha.
vc soh precisa instalar as libs necessárias que o apfjunior colocou:
# Videoshow
$ npm i videoshow

# Ffmpeg
npm install ffmpeg

# @ffmpeg-installer/ffmpeg
npm install --save @ffmpeg-installer/ffmpeg

# @ffprobe-installer/ffprobe
npm install --save @ffprobe-installer/ffprobe


Valeu demais!!!
*/
const state = require('./state.js')
//com child_process, eh possivel executar qualquer programa, processo dentro do pc
const spawn = require("child_process").spawn;
const path = require("path");
const rootPath = path.resolve(__dirname, "..");
const videoshow = require("videoshow");
const ffmpegPath = require("@ffmpeg-installer/ffmpeg").path;
const ffprobePath = require("@ffprobe-installer/ffprobe").path;
let ffmpeg = require("fluent-ffmpeg");
ffmpeg.setFfmpegPath(ffmpegPath);
ffmpeg.setFfprobePath(ffprobePath);

const jimp = require('jimp');

async function robot(){
    console.log('> [video-robot] Starting...')
    const content = state.load()    

    await convertAllImages(content)  
    await createAllSentenceImages(content)
    await createYouTubeThumbnail()
    await createAfterEffectsScript(content);
    await renderVideo("node", content);
    
    state.save(content)

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

    async function createAfterEffectsScript(content) {
        await state.saveScript(content);
      }
    
      async function renderVideoWithAfterEffects() {
        return new Promise((resolve, reject) => {
          const aerenderFilePath =
            "/Applications/Adobe After Effects CC 2019/aerender";
          const templateFilePath = `${rootPath}/templates/1/template.aep`;
          const destinationFilePath = `${rootPath}/content/output.mov`;
    
          console.log('> [video-robot] Starting After Effects')
    
//para executar o aerender(after effects render, passamos o binario q queremos executar)
          const aerender = spawn(aerenderFilePath, [
            "-comp",
            "main",
            "-project",
            templateFilePath,
            "-output",
            destinationFilePath
          ]);
    
          //loga progresso
          aerender.stdout.on("data", data => {
            process.stdout.write(data);
          });
    
          aerender.on("close", () => {
            console.log("> After Effects closed");
            resolve();
          });
        });
      }
    
      async function renderVideoWithNode(content) {
        let images = [];
    
        for (
          let sentenceIndex = 0;
          sentenceIndex < content.sentences.length;
          sentenceIndex++
        ) {
          images.push({
            path: `./content/${sentenceIndex}-converted.png`,
            caption: content.sentences[sentenceIndex].text
          });
        }
    
        const videoOptions = {
          fps: 25,
          loop: 5, // seconds
          transition: true,
          transitionDuration: 1, // seconds
          videoBitrate: 1024,
          videoCodec: "libx264",
          size: "640x?",
          audioBitrate: "128k",
          audioChannels: 2,
          format: "mp4",
          pixelFormat: "yuv420p",
          useSubRipSubtitles: false, // Use ASS/SSA subtitles instead
          subtitleStyle: {
            Fontname: "Verdana",
            Fontsize: "26",
            PrimaryColour: "11861244",
            SecondaryColour: "11861244",
            TertiaryColour: "11861244",
            BackColour: "-2147483640",
            Bold: "2",
            Italic: "0",
            BorderStyle: "2",
            Outline: "2",
            Shadow: "3",
            Alignment: "1", // left, middle, right
            MarginL: "40",
            MarginR: "60",
            MarginV: "40"
          }
        };
    
        videoshow(images, videoOptions)
          // .audio("song.mp3")
          .save("./content/video.mp4")
          .on("start", function(command) {
            console.log("ffmpeg process started:", command);
          })
          .on("error", function(err, stdout, stderr) {
            console.error("Error:", err);
            console.error("ffmpeg stderr:", stderr);
          })
          .on("end", function(output) {
            console.error("Video created in:", output);
          });
      }
    
      async function renderVideo(type, content) {
        if (type == "after") {
          await renderVideoWithAfterEffects();
        } else {
          await renderVideoWithNode(content);
        }
      }
    }

module.exports = robot
