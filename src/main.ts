import * as Blockchain from './blockchain'

Blockchain.addBlockToChain(Blockchain.generateNewBlock("Hello"))
Blockchain.addBlockToChain(Blockchain.generateNewBlock("Bye Bye"))

console.log(Blockchain.getBlockchain())

export {}