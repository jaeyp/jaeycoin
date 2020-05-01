import * as Blockchain from './blockchain/'

Blockchain.generateNextBlock("Hello")
Blockchain.generateNextBlock("Bye Bye")

console.log(Blockchain.getBlockchain())

export {}