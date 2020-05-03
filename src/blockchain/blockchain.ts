import * as Validator from "./validator"
import * as Util from "./util"
import * as Network from "../network/"

class Block {
    public index: number;
    public hash: string;
    public previousHash: string;
    public timestamp: number;
    public data: string;
    public difficulty: number;
    public nonce: number;

    constructor(
        index: number,
        hash: string,
        previousHash: string,
        timestamp: number,
        data: string,
        difficulty: number,
        nonce: number
    ) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.timestamp = timestamp;
        this.data = data;
        this.difficulty = difficulty;
        this.nonce = nonce;
    }
}

// The first block of the blockchain is always a so-called “genesis-block”, which is hard coded.
const genesisBlock: Block = new Block(0, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7", "0", 1588310945, "Genesis block!!", 0, 0)

// A in-memory Javascript array is used to store the blockchain. 
let blockchain: Block[] = [genesisBlock]

const getBlockchain = (): Block[] => blockchain

const getGenesisBlock = (): Block => genesisBlock

const getLatestBlock = (): Block => blockchain[blockchain.length - 1]

// in seconds
const BLOCK_GENERATION_INTERVAL: number = 10;

// in blocks
const DIFFICULTY_ADJUSTMENT_INTERVAL: number = 10;

const getDifficulty = (aBlockchain: Block[]): number => {
    const latestBlock: Block = aBlockchain[blockchain.length - 1];
    if (latestBlock.index % DIFFICULTY_ADJUSTMENT_INTERVAL === 0 && latestBlock.index !== 0) {
        return getAdjustedDifficulty(latestBlock, aBlockchain);
    } else {
        return latestBlock.difficulty;
    }
};

const getAdjustedDifficulty = (latestBlock: Block, aBlockchain: Block[]) => {
    const prevAdjustmentBlock: Block = aBlockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
    const timeExpected: number = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;
    const timeTaken: number = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
    if (timeTaken < timeExpected / 2) {
        return prevAdjustmentBlock.difficulty + 1;
    } else if (timeTaken > timeExpected * 2) {
        return prevAdjustmentBlock.difficulty - 1;
    } else {
        return prevAdjustmentBlock.difficulty;
    }
};


const generateNextBlock = (data: string): Block => {
    const previousBlock: Block = getLatestBlock()
    const nextIndex: number = previousBlock.index + 1
    const nextTimestamp: number = Util.getCurrentTimestamp()
    const difficulty: number = getDifficulty(getBlockchain());
    const newBlock: Block = findBlock(nextIndex, previousBlock.hash, nextTimestamp, data, difficulty);

    addBlockToChain(newBlock)
    Network.broadcastLatest()
    return newBlock
}

const findBlock = (index: number, previousHash: string, timestamp: number, data: string, difficulty: number): Block => {
    let nonce = 0;
    while (true) {
        const hash: string = Util.calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
        if (Validator.hashMatchesDifficulty(hash, difficulty)) {
            return new Block(index, hash, previousHash, timestamp, data, difficulty, nonce);
        }
        nonce++;
    }
};

const addBlockToChain = (newBlock: Block): Boolean => {
    if (Validator.isValidNewBlock(newBlock, getLatestBlock())) {
        blockchain.push(newBlock)
        return true
    }
    return false
}

const replaceChain = (newBlockchain: Block[]) => {
    /**
     * Resolving confilicts
     * 
     * There should always be only one explicit set of blocks in the chain at a given time.
     * In case of conflicts,
     * we choose the chain that has the longest number of blocks.
     */
    if (Validator.isValidChain(newBlockchain) && newBlockchain.length > getBlockchain().length) {
        console.log('Received blockchain is valid. Replacing current blockchain with received blockchain');
        blockchain = newBlockchain;
        Network.broadcastLatest();
    } else {
        console.log('Received blockchain invalid');
    }
}

export default Block
export {
    getBlockchain,
    getGenesisBlock,
    getLatestBlock,
    generateNextBlock,
    addBlockToChain,
    replaceChain
}