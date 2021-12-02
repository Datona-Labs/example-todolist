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

[App.js](src/App.js) contains all the interesting datona calls and configuration, including deploying the contract, constructing the vault, reading a directory, encrypting/decrypting and reading & writing files.  The private key is hard coded for convenience.  If you change the key you'll need to fund the account.  You can request funds on our [discord server](https://discord.gg/sSnvK5C).

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

const blockchain = {"name":"bubblenet","chainId":45021,"networkId":45021,"comment":"The Bubble main chain","url":"https://ethstats.net/","genesis":{"hash":"0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3","timestamp":null,"gasLimit":5000,"difficulty":17179869184,"nonce":"0x0000000000000042","extraData":"0x11bbe8db4e347b4e8c937c1c8370e4b5ed33adb3db69cbdb7a38e1e50b1b82fa","stateRoot":"0xd7f8974fb5ac78d9ac099b9ad5018bedc2ce0a72dad1827a1709da30580f0544"},"hardforks":[{"name":"chainstart","block":0,"consensus":"pow","finality":null},{"name":"homestead","block":1150000,"consensus":"pow","finality":null},{"name":"dao","block":1920000,"consensus":"pow","finality":null},{"name":"tangerineWhistle","block":2463000,"consensus":"pow","finality":null},{"name":"spuriousDragon","block":2675000,"consensus":"pow","finality":null},{"name":"byzantium","block":4370000,"consensus":"pow","finality":null},{"name":"constantinople","block":7280000,"consensus":"pow","finality":null},{"name":"petersburg","block":7280000,"consensus":"pow","finality":null},{"name":"istanbul","block":9069000,"consensus":"pow","finality":null},{"name":"muirGlacier","block":9200000,"consensus":"pow","finality":null}],"bootstrapNodes":[{"ip":"18.138.108.67","port":30303,"id":"d860a01f9722d78051619d1e2351aba3f43f943f6f00718d1b9baa4101932a1f5011f16bb2b1bb35db20d6fe28fa0bf09636d26a87d31de9ec6203eeedb1f666","location":"ap-southeast-1-001","comment":"bootnode-aws-ap-southeast-1-001"},{"ip":"3.209.45.79","port":30303,"id":"22a8232c3abc76a16ae9d6c3b164f98775fe226f0917b0ca871128a74a8e9630b458460865bab457221f1d448dd9791d24c4e5d88786180ac185df813a68d4de","location":"us-east-1-001","comment":"bootnode-aws-us-east-1-001"},{"ip":"34.255.23.113","port":30303,"id":"ca6de62fce278f96aea6ec5a2daadb877e51651247cb96ee310a318def462913b653963c155a0ef6c7d50048bba6e6cea881130857413d9f50a621546b590758","location":"eu-west-1-001","comment":"bootnode-aws-eu-west-1-001"},{"ip":"35.158.244.151","port":30303,"id":"279944d8dcd428dffaa7436f25ca0ca43ae19e7bcf94a8fb7d1641651f92d121e972ac2e8f381414b80cc8e5555811c2ec6e1a99bb009b3f53c4c69923e11bd8","location":"eu-central-1-001","comment":"bootnode-aws-eu-central-1-001"},{"ip":"52.187.207.27","port":30303,"id":"8499da03c47d637b20eee24eec3c356c9a2e6148d6fe25ca195c7949ab8ec2c03e3556126b0d7ed644675e78c4318b08691b7b57de10e5f0d40d05b09238fa0a","location":"australiaeast-001","comment":"bootnode-azure-australiaeast-001"},{"ip":"191.234.162.198","port":30303,"id":"103858bdb88756c71f15e9b5e09b56dc1be52f0a5021d46301dbbfb7e130029cc9d0d6f73f693bc29b665770fff7da4d34f3c6379fe12721b5d7a0bcb5ca1fc1","location":"brazilsouth-001","comment":"bootnode-azure-brazilsouth-001"},{"ip":"52.231.165.108","port":30303,"id":"715171f50508aba88aecd1250af392a45a330af91d7b90701c436b618c86aaa1589c9184561907bebbb56439b8f8787bc01f49a7c77276c58c1b09822d75e8e8","location":"koreasouth-001","comment":"bootnode-azure-koreasouth-001"},{"ip":"104.42.217.25","port":30303,"id":"5d6d7cd20d6da4bb83a1d28cadb5d409b64edf314c0335df658c1a54e32c7c4a7ab7823d57c39b6a757556e68ff1df17c748b698544a55cb488b52479a92b60f","location":"westus-001","comment":"bootnode-azure-westus-001"}]};

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
const contract = new datona.blockchain.Contract(<abi>);

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
Note, only the contract owner can construct the vault.  By default the SDAC interface sets this to the address that deployed the smart contract but it can be overidden by your contract implementation (Ultimately the owner is the address returned by the getOwner() method of the smart contract).
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