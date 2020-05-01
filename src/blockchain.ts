import * as Crypto from "crypto-js"

const Validator = {    
    isValidNewBlock: (newBlock: Block, previousBlock: Block): boolean => {
        if (!Validator.isValidBlockStructure(newBlock)) {
            console.log(`invalid block structure: ${JSON.stringify(newBlock)}`);
            return false;
        }
        if (previousBlock.index + 1 !== newBlock.index) {
            console.log('invalid index');
            return false;
        } else if (previousBlock.hash !== newBlock.previousHash) {
            console.log('invalid previoushash');
            return false;
        } else if (!Validator.isValidTimestamp(newBlock, previousBlock)) {
            console.log('invalid timestamp');
            return false;
        } else if (!Validator.hasValidHash(newBlock)) {
            return false;
        }
        return true;
    },
    isValidBlockStructure: (block: Block): boolean => {
        return typeof block.index === 'number'
            && typeof block.hash === 'string'
            && typeof block.previousHash === 'string'
            && typeof block.timestamp === 'number'
            && typeof block.data === 'string';
    },
    isValidTimestamp: (newBlock: Block, previousBlock: Block): boolean => {
        return ( previousBlock.timestamp - 60 < newBlock.timestamp )
            && newBlock.timestamp - 60 < getCurrentTimestamp();
    },
    hasValidHash: (block: Block): boolean => {
        const hashMatchesBlockContent = (block: Block): boolean => {
            const blockHash: string = calculateHashForBlock(block);
            return blockHash === block.hash;
        }
        if (!hashMatchesBlockContent(block)) {
            console.log(`invalid hash, got: ${block.hash}`);
            return false;
        }
        return true;
    },
}

class Block {
    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: string;

    constructor(
        index: number,
        hash: string,
        previousHash: string,
        timestamp: number,
        data: string
    ) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
    }
}

// The first block of the blockchain is always a so-called “genesis-block”, which is hard coded.
const genesisBlock: Block = new Block(0, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7", "0", 1588310945, "Genesis block!!");

// A in-memory Javascript array is used to store the blockchain. 
let blockchain: Block[] = [genesisBlock]

const calculateHashForBlock = (block: Block): string =>
    calculateHash(block.index, block.previousHash, block.timestamp, block.data);

const calculateHash = (
    index: number, 
    previousHash: string, 
    timestamp: number,
    data: string
): string => Crypto.SHA256(index + previousHash + timestamp + data).toString();

const getBlockchain = (): Block[] => blockchain;

const getLatestBlock = (): Block => blockchain[blockchain.length - 1]

const getCurrentTimestamp = (): number => Math.round(new Date().getTime() / 1000);

const generateNewBlock = (data: string): Block => {
    const previousBlock: Block = getLatestBlock()
    const nextIndex: number = previousBlock.index + 1
    const nextTimestamp: number = getCurrentTimestamp()
    const nextHash: string = calculateHash(
        nextIndex,
        previousBlock.hash,
        nextTimestamp,
        data
    )
    const newBlock: Block = new Block(nextIndex, nextHash, previousBlock.hash, nextTimestamp, data)
    addBlockToChain(newBlock)
    return newBlock
}

const addBlockToChain = (newBlock: Block): void => {
    if (Validator.isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock)
    }
}

export {
    getBlockchain,
    generateNewBlock
};