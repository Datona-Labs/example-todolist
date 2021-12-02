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

## Usage

```
$ git clone git@github.com:Datona-Labs/example-todolist.git
$ cd example-todolist
$ npm install
$ npm start
```

## Community

- [Discord](https://discord.gg/sSnvK5C)
- [Twitter](https://twitter.com/DatonaLabs)

## Credits

Thanks to [nirnejak](https://github.com/nirnejak) for the [To-Do List React App](https://github.com/JitendraNirnejak/todolist.git)

## Copyright

Copyright (c) 2021 [Datona Labs](https://datonalabs.org)

Released under the [MIT License](LICENSE)