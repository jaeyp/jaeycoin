import * as express from 'express';

import Block, * as Blockchain from './blockchain/'
import * as Network from './network/';
import { initP2PServer } from './network'

const httpPort: number = parseInt(process.env.HTTP_PORT) || 3001;
const p2pPort: number = parseInt(process.env.P2P_PORT) || 6001;

const initHttpServer = ( myHttpPort: number ) => {
    const app = express();
    app.use(express.json());

    app.get('/blocks', (req, res) => {
        res.send(Blockchain.getBlockchain());
    });
    app.post('/mineBlock', (req, res) => {
        console.log(req.body)
        const newBlock: Block = Blockchain.generateNextBlock(req.body.data);
        res.send(newBlock);
    });
    app.get('/peers', (req, res) => {
        res.send(Network.getSockets().map(( s: any ) => s._socket.remoteAddress + ':' + s._socket.remotePort));
    });
    app.post('/addPeer', (req, res) => {
        Network.connectToPeers(req.body.peer);
        res.send();
    });

    app.listen(myHttpPort, () => {
        console.log('Listening http on port: ' + myHttpPort);
    });
};

initHttpServer(httpPort);
initP2PServer(p2pPort);

/* 
Blockchain.generateNextBlock("Hello")
Blockchain.generateNextBlock("Bye Bye")

console.log(Blockchain.getBlockchain())
*/