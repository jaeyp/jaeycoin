import * as Validator from "./validator"
import * as Util from "./util"
import * as Network from "../network/"

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