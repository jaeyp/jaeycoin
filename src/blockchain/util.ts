import * as Crypto from "crypto-js"
import Block from "./blockchain"

const calculateHashForBlock = (block: Block): string =>
    calculateHash(block.index, block.previousHash, block.timestamp, block.data)

const calculateHash = (
    index: number, 
    previousHash: string, 
    timestamp: number,
    data: string
): string => Crypto.SHA256(index + previousHash + timestamp + data).toString()

const getCurrentTimestamp = (): number => Math.round(new Date().getTime() / 1000)

export {
    calculateHashForBlock,
    calculateHash,
    getCurrentTimestamp
}