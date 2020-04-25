//modulo usado para pegar o input do usuario
const readline = require('readline-sync')
const state = require('./state.js')

function robot(){    
    const content ={
        maximumSentences : 7
    }

    content.searchTerm = askAndReturnSearchTerm()
    content.prefix = askAndReturnPrefix()
    state.save(content)

    function askAndReturnSearchTerm(){        
        return readline.question('Type a Wikipedia search term: ')
    }

    function askAndReturnPrefix(){
        const prefixes = ['Who is', 'What is', 'The history of']
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose one option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]
        //console.log(selectedPrefixText)
        return selectedPrefixText

    }
}

module.exports = robot
