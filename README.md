# Datona Todo List Example

Basic example of a decentralised Todo List app (DApp) with private, encrypted off-chain data storage provided by the [Datona platform](https://github.com/Datona-Labs/datona-lib).  It's built using React and uses the Datona (aka Bubble) proof-of-authority testnet.

## What is the Datona Platform

Datona is a generic private data layer for decentralised applications.  It is a set of end-to-end encrypted private file servers with the file permissions held as smart contracts on the blockchain and authentication performed with public key cryptography.  A developer can create a 'vault' on any datona-compatible file server and design a smart contract to control access to the files in that vault.  Being a state machine, a smart contract is much more powerful than standard POSIX permissions or ACLs, allowing access controls to change dynamically in response to state transitions by authorised parties.  Being on the blockchain the smart contract gives all parties visibility of the access controls, allows them to make and view state transitions, and acts as an audit trail.

Example use cases for DApp and Web developers are:
  * Private user account data
  * Privately sharing data between users (e.g. messaging or file sharing)
  * Syncing private data between devices
  * Paywalled content
  * Auditable verified credentials
  * Backup

A vault server could be a home server, a cloud vault service, or a company server.  

The main method within a datona smart contract is a `getPermissions(<address> requester, <address> fileId) return <permissions_bit_field>` function, specified in accordance with the [SDAC interface](https://datona-lib.readthedocs.io/en/latest/types.html#sdacinterface);  the file server queries the contract before allowing read or write access to the signatory of a file access request.

For more information see the [online documentation](https://datona-lib.readthedocs.io/en/latest) or download the [white paper](https://datonalabs.org/documents/WhitePaper.pdf).

## The DApp

[App.js](src/App.js) contains all the interesting datona calls and configuration, including deploying the contract, constructing the vault, reading a directory, encrypting/decrypting and reading & writing files.  The private key is hard coded for convenience.  If you change the key you'll need to fund the account.

On first launching the app a basic smart data access contract is deployed to the Datona testnet - see [contracts/TodoListSDAC.sol](contract/TodoListSDAC.sol).  Once deployed, a vault is created on the cloud based datonavault.com server ready to hold the data.  The contract address and vault information is saved to local storage.  Refreshing the page will reload all todo items from the vault.

## Install & Run This DApp

```
$ git clone git@github.com:Datona-Labs/example-todolist.git
$ cd example-todolist
$ npm install
$ npm start
```


## How To Build Datona Into Your Own DApp
If you want to use a datona vault in your own DApp these are the general steps you should follow.  If you have any problems please contact us through discord or raise a ticket.

### Build Your Smart Contract
Build and test a smart contract (e.g. in remix) that implements the [SDAC interface](https://github.com/Datona-Labs/datona-lib/blob/master/contracts/SDAC.sol)

Copy its abi and bytecode for use later.

### Install datona-lib
```
$ npm install datona-lib
```
### Import datona-lib
Import datona-lib into your javascript DApp
```
import datona from 'datona-lib';
```

### Set Provider
```
const blockchainGateway = {
  scheme: "https",
  host: "datonavault.com",
  port: "8130"
}

const blockchain = <see App.js>;

datona.blockchain.setProvider(blockchainGateway, blockchain);
```

### Create a Private Key
e.g.
```
const key = datona.crypto.generateKey();
```
or
```
const key = new datona.crypto.Key("<private key as hex string");
```

### Deploy the Contract 
```
const contract = new datona.blockchain.Contract(todoListContract.abi);

var contractAddress;

contract.deploy(key, <bytecode>, <constructorParams>)
  .then( address => {
    console.log("contract deployed at address", address);
    contractAddress = address;
  })
  .catch( error => {
    console.log("failed to deploy contract", error);
  })
```

### Construct the Vault
```
const vaultService = {
  name: "datonavault.com",
  id: "0x288b32F2653C1d72043d240A7F938a114Ab69584",
  url: {
    scheme: "https",
    host: "datonavault.com",
    port: 8131
  }
}

const vault = new datona.vault.RemoteVault(vaultService.url, contractAddress, key, vaultService.id);

vault.create()
  .then( () => {
    console.log("vault constructed");
  })
  .catch( error => {
    console.log("failed to construct vault", error);
  })
```

### Write Some Data
```
const encryptedData = key.encrypt(key.publicKey, "Hello World!");

const fileId = "0x0000000000000000000000000000000000000001";

vault.write(encryptedData, fileId)
  .then( () => {
    console.log("data written successfully");
  })
  .catch( error => {
    console.log("failed to write data", error);
  })
```

### Read Some Data
```
vault.read(fileId)
  .then( data => {
    console.log(key.decrypt(key.publicKey, data));
  })
  .catch( error => {
    console.log("failed to read data", error);
  })
```

### Delete the Vault
```
contract.terminate(key);
```



## Community

- [Discord](https://discord.gg/sSnvK5C)
- [Twitter](https://twitter.com/DatonaLabs)

## Credits

Thanks to [nirnejak](https://github.com/nirnejak) for the [To-Do List React App](https://github.com/JitendraNirnejak/todolist.git)

## Copyright

Copyright (c) 2021 [Datona Labs](https://datonalabs.org)

Released under the [MIT License](LICENSE)