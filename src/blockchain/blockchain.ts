import * as Validator from "./validator"
import * as Util from "./util"

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
const genesisBlock: Block = new Block(0, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7", "0", 1588310945, "Genesis block!!")

// A in-memory Javascript array is used to store the blockchain. 
let blockchain: Block[] = [genesisBlock]

const calculateHashForBlock = (block: Block): string =>
    Util.calculateHash(block.index, block.previousHash, block.timestamp, block.data)


const getBlockchain = (): Block[] => blockchain

const getGenesisBlock = (): Block => genesisBlock

const getLatestBlock = (): Block => blockchain[blockchain.length - 1]

const generateNextBlock = (data: string): Block => {
    const previousBlock: Block = getLatestBlock()
    const nextIndex: number = previousBlock.index + 1
    const nextTimestamp: number = Util.getCurrentTimestamp()
    const nextHash: string = Util.calculateHash(
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

export default Block
export {
    calculateHashForBlock,
    getBlockchain,
    getGenesisBlock,
    getLatestBlock,
    generateNextBlock,
    addBlockToChain
}