import * as WebSocket from 'ws';
import { Server } from 'ws';
import Block, * as Blockchain from '../blockchain/';

// active sockets for each nodes (peers)
const sockets: WebSocket[] = []

/**
 * MessageType (Communicating with other nodes)
 * 
 * 0: When a node connects to a new peer it querys for the latest block
 * 1: When a node encounters a block that has an index larger than the current known block, 
 *      it either adds the block the its current chain or querys for the full blockchain.
 * 2: When a node generates a new block, it broadcasts it to the network
 */
enum MessageType {
    QUERY_LATEST = 0,           // to query for the latest block
    QUERY_ALL = 1,              // to query for the full blockchain
    RESPONSE_BLOCKCHAIN = 2,    // to broadcast the latest block
}

class Message {
    public type: MessageType;
    public data: any;
}

const JSONToObject = <T>(data: string): T => {
    try {
        return JSON.parse(data);
    } catch (e) {
        console.log(e);
        return null;
    }
};

const getSockets = () => sockets;

const initP2PServer = (p2pPort: number) => {
    const server: Server = new WebSocket.Server({port: p2pPort});
    server.on('connection', (ws: WebSocket) => {
        console.log('Event: connection')
        console.log(`SERVER accept...: ${(<any>ws)._socket.remoteAddress}:${(<any>ws)._socket.remotePort}`)
        initConnection(ws);
    });
    console.log('listening websocket p2p port on: ' + p2pPort);
};

const initConnection = (ws: WebSocket) => {
    // 1. add new socket to peers
    sockets.push(ws);
    // 2. register socket handlers for message, close and error
    initMessageHandler(ws);
    initErrorHandler(ws);
    // 3. send message (QUERY_LATEST): connect to P2P server
    write(ws, queryChainLengthMsg());
    //ws.send(JSON.stringify(queryChainLengthMsg()));
};

const initMessageHandler = (ws: WebSocket) => {
    ws.on('message', (data: string) => {
        console.log('Event: message ')
        console.log(`remote node: ${(<any>ws)._socket.remoteAddress}:${(<any>ws)._socket.remotePort}`)
        // receiving data
        const message: Message = JSONToObject<Message>(data);
        if (message === null) {
            console.log('could not parse received JSON message: ' + data);
            return;
        }
        console.log('Received message: ' + JSON.stringify(message));
        switch (message.type) {
            case MessageType.QUERY_LATEST:  // node connected to a new peer
                write(ws, responseLatestMsg());  // send the latest block
                break;
            case MessageType.QUERY_ALL:  // node encountered a block out of its chain
                write(ws, responseChainMsg());  // send full chain
                break;
            case MessageType.RESPONSE_BLOCKCHAIN:  // node generated a new block
                const receivedBlocks: Block[] = JSONToObject<Block[]>(message.data);
                if (receivedBlocks === null) {
                    console.log('invalid blocks received:');
                    console.log(message.data)
                    break;
                }
                handleBlockchainResponse(receivedBlocks);  // broadcast the latest block
                break;
        }
    });
};

const handleBlockchainResponse = (receivedBlocks: Block[]) => {
    if (receivedBlocks.length === 0) {
        console.log('received block chain size of 0');
        return;
    }
    const latestBlockReceived: Block = receivedBlocks[receivedBlocks.length - 1];
    if (!Blockchain.isValidBlockStructure(latestBlockReceived)) {
        console.log('block structuture not valid');
        return;
    }
    const latestBlockHeld: Block = Blockchain.getLatestBlock();
    if (latestBlockReceived.index > latestBlockHeld.index) {
        console.log('blockchain possibly behind. We got: '
            + latestBlockHeld.index + ' Peer got: ' + latestBlockReceived.index);
        if (latestBlockHeld.hash === latestBlockReceived.previousHash) {
            if (Blockchain.addBlockToChain(latestBlockReceived)) {
                broadcast(responseLatestMsg());
            }
        } else if (receivedBlocks.length === 1) {
            console.log('We have to query the chain from our peer');
            broadcast(queryAllMsg());
        } else {
            console.log('Received blockchain is longer than current blockchain');
            Blockchain.replaceChain(receivedBlocks);
        }
    } else {
        console.log('received blockchain is not longer than received blockchain. Do nothing');
    }
};

const initErrorHandler = (ws: WebSocket) => {
    const closeConnection = (myWs: WebSocket) => {
        console.log('connection failed to peer: ' + myWs.url);
        sockets.splice(sockets.indexOf(myWs), 1);
    };
    ws.on('close', () => closeConnection(ws));
    ws.on('error', () => closeConnection(ws));
};

const write = (ws: WebSocket, message: Message): void => ws.send(JSON.stringify(message));
const broadcast = (message: Message): void => sockets.forEach((socket) => write(socket, message));

const queryChainLengthMsg = (): Message => ({'type': MessageType.QUERY_LATEST, 'data': null});
const queryAllMsg = (): Message => ({'type': MessageType.QUERY_ALL, 'data': null});

const responseChainMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN, 'data': JSON.stringify(Blockchain.getBlockchain())
});

const responseLatestMsg = (): Message => ({
    'type': MessageType.RESPONSE_BLOCKCHAIN,
    'data': JSON.stringify([Blockchain.getLatestBlock()])
});

const broadcastLatest = (): void => {
    broadcast(responseLatestMsg());
};

/**
 * Add a new peer to peers(const sockets: WebSocket[])
 * @param newPeer 
 * @description
 *      p2p session between new peer and p2p server established here (Hybrid P2P)
 */
const connectToPeers = (destURL: string): void => {
    console.log('connectToPeers: ', destURL)
    // Create a new socket!
    const ws: WebSocket = new WebSocket(destURL);
    // Connect to destURL - localhost:6001 (P2P Server)
    ws.on('open', () => {
        console.log('Event: open')
        // initialize socket and send data
        console.log(`CLIENT send data to ${(<any>ws)._socket.remoteAddress}:${(<any>ws)._socket.remotePort}`)
        initConnection(ws);
    });
    ws.on('error', () => {
        console.log('connection failed');
    });
};

export {
    getSockets,
    broadcastLatest,
    connectToPeers,
    initP2PServer
}