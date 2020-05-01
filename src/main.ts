import * as Blockchain from './blockchain'

Blockchain.generateNewBlock("Hello")
Blockchain.generateNewBlock("Bye Bye")

console.log(Blockchain.getBlockchain())

export {}