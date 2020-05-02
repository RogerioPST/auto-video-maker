// use strict - O que é ela faz basicamente é melhorar a qualidade do código, pois chama exceções quando usamos variáveis não declaradas, por exemplo
'use strict';

const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js'),
    image: require('./robots/image.js'),
    video: require('./robots/video.js'),
    youtube: require('./robots/youtube.js'),
}

async function start(){
    
 //   robots.input()
  //  await robots.text()
  //  await robots.image()
  //  await robots.video()
    await robots.youtube()
  
    //const content = robots.state.load()
//console.dir mantem o log original do console.log, mas mantem td profundida 
//e ainda imprime de forma bonita
    //console.dir(content, { depth: null})
    //console.log(JSON.stringify(content, null, 4))

}

start()