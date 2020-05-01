import Block, * as Blockchain from "./blockchain"
import * as Util from "./util"

const isValidChain = (blockchainToValidate: Block[]): boolean => {
        const isValidGenesis = (block: Block): boolean => {
            return JSON.stringify(block) === JSON.stringify(Blockchain.getGenesisBlock())
        }
        // We first check that the first block in the chain matches with the genesisBlock.
        if (!isValidGenesis(blockchainToValidate[0])) {
            return false
        }
        // After that we validate every consecutive block using the previously described methods.
        for (let i=1; i<blockchainToValidate.length; i++) {
            if (!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i-1]))
                return false
        }
        return true
    }
const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
        if (!isValidBlockStructure(newBlock)) {
            console.log(`invalid block structure: ${JSON.stringify(newBlock)}`);
            return false;
        }
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('invalid previoushash');
            return false;
        } else if (!isValidTimestamp(newBlock, previousBlock)) {
            console.log('invalid timestamp');
            return false;
        } else if (!hasValidHash(newBlock)) {
            return false;
        }
        return true;
}
const isValidBlockStructure = (block: Block): boolean => {
        return typeof block.index === 'number'
            && typeof block.hash === 'string'
            && typeof block.previousHash === 'string'
            && typeof block.timestamp === 'number'
            && typeof block.data === 'string';
}
const isValidTimestamp = (newBlock: Block, previousBlock: Block): boolean => {
        return ( previousBlock.timestamp - 60 < newBlock.timestamp )
            && newBlock.timestamp - 60 < Util.getCurrentTimestamp();
}
const hasValidHash = (block: Block): boolean => {
        const hashMatchesBlockContent = (block: Block): boolean => {
            const blockHash: string = Util.calculateHashForBlock(block);
            return blockHash === block.hash;
        }
        if (!hashMatchesBlockContent(block)) {
            console.log(`invalid hash, got: ${block.hash}`);
            return false;
        }
        return true;
}

export {
    isValidChain,
    isValidNewBlock,
    isValidBlockStructure,
    isValidTimestamp,
    hasValidHash
}