import * as WebSocket from 'ws';
import {
    Block, getBlockchain, getLatestBlock, replaceChain
} from '../blockchain/';

// active sockets for each nodes
const sockets: WebSocket[] = []

/**
 * MessageType (Communicating with other nodes)
 * 
 * 0: When a node generates a new block, it broadcasts it to the network
 * 1: When a node encounters a block that has an index larger than the current known block, 
 *      it either adds the block the its current chain or querys for the full blockchain.
 * 2: When a node connects to a new peer it querys for the latest block
 */
enum MessageType {
    QUERY_LATEST = 0,           // to query for the latest block
    QUERY_ALL = 1,              // to query for the full blockchain
    RESPONSE_BLOCKCHAIN = 2,    // to broadcast the latest block
    QUERY_TRANSACTION_POOL = 3,
    RESPONSE_TRANSACTION_POOL = 4
}

class Message {
    public type: MessageType;
    public data: any;
}

const write = (ws: WebSocket, message: Message): void => ws.send(JSON.stringify(message));
const broadcast = (message: Message): void => sockets.forEach((socket) => write(socket, message));

const responseLatestMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([getLatestBlock()])
});

const broadcastLatest = (): void => {
    broadcast(responseLatestMsg());
};

export {
    broadcastLatest
}