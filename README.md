# Datona Todo List Example

Basic example of a DApp using the [Datona platform](https://github.com/Datona-Labs/datona-lib) to provide it's off-chain data.

## What is the Datona Platform

Datona provides a generic private data layer for a decentralised application with user authentication and read/write/append access controls for individual files and folders.  Data is stored in a 'vault' within any compatible 'vault server' and can be read, written and deleted provided the user has the appropriate permissions.  A vault server could be a home server, a cloud vault service, or a company server.  Permissions are granted by a 'smart data access contract' (SDAC) - a smart contract conforming to the [SDAC interface](https://datona-lib.readthedocs.io/en/latest/types.html#sdacinterface).  The SDAC provides a flexible way for DApp developers to create static or dynamic access permissions and explore monetisation of data.    

For more information see the [online documentation](https://datona-lib.readthedocs.io/en/latest) or download the [white paper](https://datonalabs.org/documents/WhitePaper.pdf).

## The DApp

[App.js](src/App.js) contains all the interesting datona calls and configuration, including deploying the contract, constructing the vault, reading a directory and reading & writing files.  The private key is hard coded for convenience.  If you change the key you'll need to fund the account.

On first launching the app a basic smart data access contract is deployed to the Rinkeby testnet - see [contracts/TodoListSDAC.sol](contracts/TodoListSDAC.sol).  Once deployed, a vault is created on the cloud based datonavault.com server ready to hold the data.  The contract address and vault information is saved to local storage.  Refreshing the page will reload all todo items from the vault.

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