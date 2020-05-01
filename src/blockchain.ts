class Block {
    public index: number;
    public hash: string;
    public previousHash: string;
    public data: string;
    public timestamp: number;
    constructor(
        index: number,
        hash: string,
        previousHash: string,
        data: string,
        timestamp: number
    ) {
        this.index = index;
        this.hash = hash;
        this.previousHash = previousHash;
        this.data = data;
        this.timestamp = timestamp;
    }
}

// The first block of the blockchain is always a so-called “genesis-block”, which is hard coded.
const genesisBlock: Block = new Block(0, "816534932c2b7154836da6afc367695e6337db8a921823784c14378abed4f7d7", "0", "my genesis block!!", 1465154705);

// A in-memory Javascript array is used to store the blockchain. 
let blockchain: [Block] = [genesisBlock]