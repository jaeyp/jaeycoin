import Block, { 
    getBlockchain,
    getLatestBlock,
    generateNextBlock,
    addBlockToChain,
    replaceChain
} from "./blockchain"

import {
    isValidChain,
    isValidNewBlock,
    isValidBlockStructure,
    isValidTimestamp,
    hasValidHash
} from "./validator"

export default Block
export {
    // blockchain methods
    getBlockchain,
    getLatestBlock,
    generateNextBlock,
    addBlockToChain,
    replaceChain,
    // validator methods
    isValidChain,
    isValidNewBlock,
    isValidBlockStructure,
    isValidTimestamp,
    hasValidHash
};