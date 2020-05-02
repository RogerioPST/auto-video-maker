//link https://www.npmjs.com/package/jimp
var Jimp = require('jimp');
 
// open a file called "lenna.png"
 Jimp.read('./content/0-original.png', (err, lenna) => {
  if (err) throw err;
  lenna
    .resize(256, 256) // resize
    .quality(60) // set JPEG quality
    .greyscale() // set greyscale
    .write('lena-small-bw.jpg'); // save
});
 
//using promises

 
const imginput = './content/0-original.png'

Jimp.read(imginput)
  .then(lenna => {
    return lenna
      .resize(1290, 1080) // resize
      .quality(60) // set JPEG quality
      .blur(100)
      .writeAsync('./content/0-blur.png')
        .then(imgBorrada =>{
            return imgBorrada
            .composite(lenna, 500, 500, {
                mode: Jimp.BLEND_MULTIPLY,
                opacitySource: 0.5,
                opacityDest: 0.9                                
            })
            //.resize(1290,1080) // resize                        
            .write('./content/0-teste-composicao.png')
            })
            .catch(err => {
                console.error(err);
            }); // save
  })
  .catch(err => {
    console.error(err);
  });


  Jimp.read('./content/0-original.png', (err, lenna) => {
    if (err) throw err;

    Jimp.loadFont(Jimp.FONT_SANS_128_WHITE).then(font => {
      lenna
      .print(font, 10, 10, 'Hello world! Hello world!')
      .resize(256, 256) // resize
      .quality(60) // set JPEG quality        
      .write('./content/0-original-com-texto.png'); // save
    });          
  });



  Jimp.read(imginput)
  .then(lenna => {
    return lenna
      .resize(1290, 1080) // resize
      .quality(60) // set JPEG quality
      .blur(10)      
      .write('./content/0-1290.png')        
  })
  .catch(err => {
    console.error(err);
  });


  new Jimp(256, 256, 0x0, (err, imagemN) => {
    // this image is 256 x 256, every pixel is set to #FF00FF    
    Jimp.loadFont(Jimp.FONT_SANS_32_WHITE).then(font => {
      imagemN
      .print(font, 10, 10, 
        {
          text: 'texto teste!',
          alignmentX: Jimp.HORIZONTAL_ALIGN_CENTER,
          alignmentY: Jimp.VERTICAL_ALIGN_MIDDLE
        },  
        256,
        256
      )
      .resize(256, 256) // resize
      .quality(60) // set JPEG quality        
      .write('./content/0-transparent-com-texto3.png'); // save
    });
  });
