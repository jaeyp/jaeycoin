
import * as Crypto from 'crypto-js';
import * as ecdsa from 'elliptic';
import * as Validator from './validator';
import * as Util from '../util';

const ec = new ecdsa.ec('secp256k1');

/**
 * Coinbase transaction
 *  The coinbase transaction is always the first transaction in the block.
 *  it contains only an output, but no inputs.
 */
const COINBASE_AMOUNT: number = 50; // the initial coins of the block

/**
 * An Unspent Transaction Output (UTXO) that can be spent as an input in a new transaction.
 */
class UnspentTxOut {
    public readonly txOutId: string;
    public readonly txOutIndex: number;
    public readonly address: string;
    public readonly amount: number;

    constructor(txOutId: string, txOutIndex: number, address: string, amount: number) {
        this.txOutId = txOutId;
        this.txOutIndex = txOutIndex;
        this.address = address;
        this.amount = amount;
    }
}

/**
 * Transaction input provides the information "where" the coins are coming from.
 */
class TxIn {
    public txOutId: string;     // transaction-id (of the target output transaction)
    public txOutIndex: number;  // block-index (which the target output transaction belongs)
    public signature: string;   // digital signature for transaction-id. so it's invalid if any of the contents in the transactions is modified
}

/**
 * Transaction output consists of an address(=public-key) and an amount of coins.
 * This means that only the user having the private-key of the referenced public-key(=address) will be able to access the coins.
 */
class TxOut {
    public address: string; // public-key (ownership)
    public amount: number;  // amount of coins (actual data of transaction)

    constructor(address: string, amount: number) {
        this.address = address;
        this.amount = amount;
    }
}

class Transaction {
    public id: string;  // hash sum of the contents of the transaction
    public txIns: TxIn[];
    public txOuts: TxOut[];
}

// getTransactionId
const calculateTransactionId = (transaction: Transaction): string => {
    const txInContent: string = transaction.txIns
        // the signatures of the txIds are not included in the transaction hash as it will be added later on to the transaction.
        .map((txIn: TxIn) => txIn.txOutId + txIn.txOutIndex)
        .reduce((a, b) => a + b, '');

    const txOutContent: string = transaction.txOuts
        .map((txOut: TxOut) => txOut.address + txOut.amount)
        .reduce((a, b) => a + b, '');

    return Crypto.SHA256(txInContent + txOutContent).toString();
};

const getTxInAmount = (txIn: TxIn, aUnspentTxOuts: UnspentTxOut[]): number => {
    return findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts).amount;
};

const findUnspentTxOut = (transactionId: string, index: number, aUnspentTxOuts: UnspentTxOut[]): UnspentTxOut => {
    return aUnspentTxOuts.find((uTxO) => uTxO.txOutId === transactionId && uTxO.txOutIndex === index);
};

/**
 * signTxIn: Signing the transaction
 * @param transaction 
 * @param txInIndex 
 * @param privateKey 
 * @param aUnspentTxOuts 
 * @description 
 *  When signing the transaction inputs, only the txId will be signed.
 *  Therefore, if any of the contents in the transactions is modified,
 *  the txId must change to make the transaction and signature invalid.
 */
const signTxIn = (
    transaction: Transaction, 
    txInIndex: number,
    privateKey: string, 
    aUnspentTxOuts: UnspentTxOut[]
): string => {
    const txIn: TxIn = transaction.txIns[txInIndex];
    const dataToSign = transaction.id;
    
    // get UTXO
    const referencedUnspentTxOut: UnspentTxOut = findUnspentTxOut(txIn.txOutId, txIn.txOutIndex, aUnspentTxOuts);
    if (referencedUnspentTxOut == null) {
        console.log('could not find referenced txOut');
        throw Error();
    }

    // validate ownership of target UTXO
    const referencedAddress = referencedUnspentTxOut.address;   // address(=public-key)
    if (Util.getPublicKey(privateKey) !== referencedAddress) {
        console.log('trying to sign an input with private' +
            ' key that does not match the address that is referenced in txIn');
        throw Error();
    }

    // generate signature
    const key = ec.keyFromPrivate(privateKey, 'hex');
    const signature: string = Util.toHexString(key.sign(dataToSign).toDER());
    return signature;
};

/**
 * updateUnspentTxOuts: Updating unspent transaction outputs
 * @param newTransactions 
 * @param aUnspentTxOuts 
 * @description
 *  Every time a new block is added to the chain, we must update our list of unspent transaction outputs. 
 *  This is because the new transactions will spend some of the existing transaction outputs and introduce new unspent outputs.
 */
const updateUnspentTxOuts = (newTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[]): UnspentTxOut[] => {
    // First, we retrieve all new unspent transaction outputs (newUnspentTxOuts) from the new block:
    const newUnspentTxOuts: UnspentTxOut[] = newTransactions
        // generate new UTXO list from txOuts of each new transaction
        .map((t) => t.txOuts.map((txOut, index) => new UnspentTxOut(t.id, index, txOut.address, txOut.amount)))
        // merge all UTXO lists into one list
        .reduce((a, b) => a.concat(b), []);

    // Second, we need to know which transaction outputs are consumed by the new transactions of the block (consumedTxOuts).
    // This will be solved by examining the inputs of the new transactions:
    const consumedTxOuts: UnspentTxOut[] = newTransactions
        // extract transaction input list from each new transaction
        .map((t) => t.txIns)
        // merge all transaction input list into one list
        .reduce((a, b) => a.concat(b), [])
        // list consumed txOuts from transaction input list
        .map((txIn) => new UnspentTxOut(txIn.txOutId, txIn.txOutIndex, '', 0));

    // Finally, we can generate the new unspent transaction outputs by removing the consumedTxOuts 
    // and adding the newUnspentTxOuts to our existing transaction outputs.
    const resultingUnspentTxOuts = aUnspentTxOuts
        // remove the consumedTxOuts from existing unspent transaction outputs
        .filter(((uTxO) => !findUnspentTxOut(uTxO.txOutId, uTxO.txOutIndex, consumedTxOuts)))
        // add the newUnspentTxOuts to existing unspent transaction outputs
        .concat(newUnspentTxOuts);

    return resultingUnspentTxOuts;
};

const processTransactions = (aTransactions: Transaction[], aUnspentTxOuts: UnspentTxOut[], blockIndex: number) => {

    if (!Validator.isValidTransactionsStructure(aTransactions)) {
        return null;
    }

    if (!Validator.validateBlockTransactions(aTransactions, aUnspentTxOuts, blockIndex)) {
        console.log('invalid block transactions');
        return null;
    }
    return updateUnspentTxOuts(aTransactions, aUnspentTxOuts);
};

export {
    COINBASE_AMOUNT,
    UnspentTxOut, 
    TxIn,
    TxOut,
    Transaction, 
    calculateTransactionId,
    getTxInAmount,
    processTransactions,
    signTxIn
}