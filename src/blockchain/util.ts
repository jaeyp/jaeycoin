import * as Crypto from "crypto-js"

const calculateHash = (
    index: number, 
    previousHash: string, 
    timestamp: number,
    data: string
): string => Crypto.SHA256(index + previousHash + timestamp + data).toString()

const getCurrentTimestamp = (): number => Math.round(new Date().getTime() / 1000)

export {
    calculateHash,
    getCurrentTimestamp
}