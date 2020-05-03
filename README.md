# mincoin
Minimal Implementation of Blockchain and Cryptocurrency

### Installation
```bash
~$ yarn install
```

### Run app
```bash
~$ yarn start
```

### Test API
#### Get blockchain
```bash
~$ curl http://localhost:3001/blocks
```
#### Create block
```bash
~$ curl -H "Content-type:application/json" -d "{\"data\":\"Some data to the first block\"}" http://localhost:3001/mineBlock
```
#### Query connected peers
```bash
~$ curl http://localhost:3001/peers
```
#### Add peer
```bash
~$ curl -H "Content-type:application/json" --data "{\"peer\":\"ws://localhost:6001\"}" http://localhost:3001/addPeer
```

### Reference
https://github.com/lhartikk/naivecoin
