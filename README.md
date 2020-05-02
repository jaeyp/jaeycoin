# mincoin

### Installation
* from scratch
```bash
~$ yarn init
# typescript
~$ yarn global add typescript
# support watch mode
~$ yarn add tsc-watch --dev
# crypto library
~$ yarn add crypto-j
# websocket library
~$ yarn add ws
# request body parsing middleware
X ~$ yarn add body-parser # Express 4.16+ has own body-parser
# express
~$ yarn add express
```
* from cloning
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
