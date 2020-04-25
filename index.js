
const robots = {
    input: require('./robots/input.js'),
    text: require('./robots/text.js'),
    state: require('./robots/state.js'),
}

async function start(){
    
    robots.input()
    await robots.text()
  
    const content = robots.state.load()
//console.dir mantem o log original do console.log, mas mantem td profundida 
//e ainda imprime de forma bonita
    console.dir(content, { depth: null})
    //console.log(JSON.stringify(content, null, 4))

}

start()