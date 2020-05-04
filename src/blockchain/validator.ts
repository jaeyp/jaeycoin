import Block, * as Blockchain from "./blockchain"
import * as Util from "../util"

const isValidChain = (blockchainToValidate: Block[]): boolean => {
        const isValidGenesis = (block: Block): boolean => JSON.stringify(block) === JSON.stringify(Blockchain.getGenesisBlock())

        // We first check that the first block in the chain matches with the genesisBlock.
        if (!isValidGenesis(blockchainToValidate[0])) {
            return false
        }
        // After that, we validate every consecutive block using the previously described methods.
        for (let i=1; i<blockchainToValidate.length; i++) {
            if (!isValidNewBlock(blockchainToValidate[i], blockchainToValidate[i-1]))
                return false
        }
        return true
    }
const isValidNewBlock = (newBlock: Block, previousBlock: Block): boolean => {
    const isValidIndex = (newBlock, previousBlock) => previousBlock.index + 1 === newBlock.index
    const isValidPreviousHash = (newBlock, previousBlock) => previousBlock.hash === newBlock.previousHash
    if (!isValidBlockStructure(newBlock)) {
        console.log(`invalid block structure: ${JSON.stringify(newBlock)}`);
        return false;
    } else if (!isValidIndex(newBlock, previousBlock)) {
        console.log('invalid index');
        return false;
    } else if (!isValidPreviousHash(newBlock, previousBlock)) {
        console.log('invalid previoushash');
        return false;
    } else if (!isValidTimestamp(newBlock, previousBlock)) {
        console.log('invalid timestamp');
        return false;
    } else if (!hasValidHash(newBlock)) {
        return false;
    }
    return true;
    /* return isValidBlockStructure(newBlock) &&
        isValidIndex(newBlock, previousBlock) &&
        isValidPreviousHash(newBlock, previousBlock) &&
        isValidTimestamp(newBlock, previousBlock) &&
        hasValidHash(newBlock); */
}
const isValidBlockStructure = (block: Block): boolean => {
        return typeof block.index === 'number'
            && typeof block.hash === 'string'
            && typeof block.previousHash === 'string'
            && typeof block.timestamp === 'number'
            && typeof block.data === 'object';
}
/**
 * isValidTimestamp
 * @param newBlock 
 * @param previousBlock 
 * @description 
 *  To mitigate the attack where a false timestamp is introduced in order to manipulate the difficulty 
 *  the following rules is introduced:
 *  1. A block is valid, if the timestamp is at most 1 min in the future from the time we perceive.
 *  2. A block in the chain is valid, if the timestamp is at most 1 min in the past of the previous block.
 */
const isValidTimestamp = (newBlock: Block, previousBlock: Block): boolean => {
    const TOLERANCE = 60;  // in seconds
    const isAfterPreviousBlock = () => previousBlock.timestamp - TOLERANCE < newBlock.timestamp;
    const isBeforeCurrentTime = () => newBlock.timestamp - TOLERANCE < Util.getCurrentTimestamp();
    return isAfterPreviousBlock() && isBeforeCurrentTime();
};
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

const hashMatchesDifficulty = (hash: string, difficulty: number): boolean => {
    const hashInBinary: string = Util.hexToBinary(hash);
    const requiredPrefix: string = '0'.repeat(difficulty);
    return hashInBinary.startsWith(requiredPrefix);
}

export {
    isValidChain,
    isValidNewBlock,
    isValidBlockStructure,
    isValidTimestamp,
    hasValidHash,
    hashMatchesDifficulty,
}