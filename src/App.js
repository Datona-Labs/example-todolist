// Importing Modules
import React, { Component } from 'react';
import datona from 'datona-lib';
import { BrowserRouter as Router, Route } from 'react-router-dom';

// Importing Components
import Todos from './components/Todos';
import Header from './components/layout/Header';
import AddTodo from './components/AddTodo';
import About from './components/pages/About';

import './App.css';

class App extends Component {

  contractAddress = window.localStorage.getItem('contractAddress');

  state = {
    contractReady: this.contractAddress !== null,
    vaultReady: window.localStorage.getItem('vaultReady') || false,
    todos: []
  }

  componentDidMount() {
    // Deploy the contract and construct the vault if this hasn't been done before
    if (!this.contractAddress) this.deployContract();
    else if (!this.state.vaultReady) this.constructVault();
    else {
      // Read the todolist from the vault
      this.vault = new datona.vault.RemoteVault(vaultService.url, this.contractAddress, myKey, vaultService.id);
      this.initialiseTodoList();
    }
  }

  deployContract = () => {
    const contract = new datona.blockchain.Contract(todoListContract.abi);
    contract.deploy(myKey, todoListContract.bytecode, [])
      .then( (address) => {
        this.contractAddress = address;
        window.localStorage.setItem('contractAddress', address);
        this.setState({ contractReady: true });
        return this.constructVault();
      })
      .catch( (error) => {
        this.setState({ error: error });
      })
  }

  constructVault = () => {
    this.vault = new datona.vault.RemoteVault(vaultService.url, this.contractAddress, myKey, vaultService.id);
    return this.vault.create()
      .then( () => {
        window.localStorage.setItem('vaultReady', true);
        this.setState({ vaultReady: true });
      })
      .catch( (error) => {
        this.setState({ error: error });
      })
  }

  // Read todolist from vault
  initialiseTodoList = () => {
    this.vault.read(todoDirectory)
      .then( (filesAsString) => {
        const files = filesAsString.length === 0 ? [] : filesAsString.split('\n');
        console.log("files: ", files);
        if (datona.assertions.isArray(files) && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            this.vault.read(todoDirectory + "/" + files[i])
              .then((content) => {
                const todoItem = {id: files[i], content: this.decrypt(content)};
                if (todoItem.content.state !== "deleted") this.setState({todos: [...this.state.todos, todoItem]});
              })
              .catch( (error) => {
                console.log(error);
              })
          }
        }
      })
      .catch( (error) => {
        this.setState({ error: error });
      })
  }

  // Toggle Complete
  toggleComplete = (item) => {
    item.content.state = (item.content.state === "active") ? "completed" : "active";
    this.vault.write(this.encrypt(item.content), todoDirectory+"/"+item.id)
      .then( () => {
        this.setState({
          todos: this.state.todos.map(todo => {
            if(todo.id === item.id) return item
            return todo;
          })
        });
      });
  }

  // Delete Todo
  delTodo = (item) => {
    item.content.state = "deleted";
    this.vault.write(this.encrypt(item.content), todoDirectory+"/"+item.id)
      .then( () => {
        this.setState({ todos: [...this.state.todos.filter(todo => todo.id !== item.id)] })
      });
  }

  addTodo = (title) => {
    const newTodoItem = {
      id: datona.crypto.hash(""+Math.random()),
      content: {
        title: title,
        state: "active"
      }
    };
    this.vault.write(this.encrypt(newTodoItem.content), todoDirectory+"/"+newTodoItem.id)
      .then( () => {
        this.setState({ todos: [...this.state.todos, newTodoItem] })
      });
  }

  encrypt = (obj) => {
    return myKey.encrypt(myKey.publicKey, JSON.stringify(obj));
  }

  decrypt = (data) => {
    return JSON.parse(myKey.decrypt(myKey.publicKey, data));
  }

  render() {
    let content;
    if (this.state.error) {
      content = <p className="errorMsg">Error! {this.state.error.message ? this.state.error.message : this.state.error}</p>
    }
    else if (!this.state.contractReady) {
      content =
        <>
          <p className="statusMsg">Deploying Contract, please wait...</p>
          <p className="statusMsg">(this may take 30 seconds or so)</p>
        </>
    }
    else if (!this.state.vaultReady) {
      content = <p className="statusMsg">Constructing Vault, please wait...</p>
    }
    else {
      content =
        <>
          <AddTodo addTodo={this.addTodo} />
          <Todos todos={this.state.todos} toggleComplete={this.toggleComplete} delTodo={this.delTodo}/>
        </>
    }
    return (
      <Router>
        <div className="App">
          <div className="container">
            <Header />
            <br />
            <Route exact path="/" render={props => (
              <React.Fragment>
                {content}
              </React.Fragment>
            )} />

            <Route path="/about" render={() => <About contractAddress={this.contractAddress} myKeyAddress={myKey.address} vaultServer={vaultService.name}/>} />
          </div>
        </div>
      </Router>
    );
  }
}

export default App;



//
// Configuration
//

const blockchainGateway = {
  scheme: "https",
  host: "datonavault.com",
  port: "8130"
}

const vaultService = {
  name: "datonavault.com",
  id: "0x288b32F2653C1d72043d240A7F938a114Ab69584",
  url: {
    scheme: "https",
    host: "datonavault.com",
    port: 8131
  }
}

const todoListContract = {
  abi: [ { "inputs": [], "name": "ALL_PERMISSIONS", "outputs": [ { "internalType": "bytes1", "name": "", "type": "bytes1" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "APPEND_BIT", "outputs": [ { "internalType": "bytes1", "name": "", "type": "bytes1" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "DIRECTORY_BIT", "outputs": [ { "internalType": "bytes1", "name": "", "type": "bytes1" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "DatonaProtocolVersion", "outputs": [ { "internalType": "string", "name": "", "type": "string" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "NO_PERMISSIONS", "outputs": [ { "internalType": "bytes1", "name": "", "type": "bytes1" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "READ_BIT", "outputs": [ { "internalType": "bytes1", "name": "", "type": "bytes1" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "WRITE_BIT", "outputs": [ { "internalType": "bytes1", "name": "", "type": "bytes1" } ], "stateMutability": "view", "type": "function" }, { "inputs": [ { "internalType": "address", "name": "requester", "type": "address" }, { "internalType": "address", "name": "file", "type": "address" } ], "name": "getPermissions", "outputs": [ { "internalType": "bytes1", "name": "", "type": "bytes1" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "hasExpired", "outputs": [ { "internalType": "bool", "name": "", "type": "bool" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [ { "internalType": "address", "name": "", "type": "address" } ], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "terminate", "outputs": [], "stateMutability": "nonpayable", "type": "function" } ],
  bytecode: "6080604052336000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060008060146101000a81548160ff02191690831515021790555034801561006a57600080fd5b5061063a8061007a6000396000f3fe608060405234801561001057600080fd5b50600436106100a95760003560e01c80634f08de63116100715780634f08de63146102125780638da5cb5b1461029557806390e64d13146102c95780639e994d82146102e9578063d519f96d14610329578063edfa433f14610369576100a9565b80630c08bf88146100ae5780630dd542cf146100b857806321291239146100f85780632ed938d0146101385780634757d3bb14610178575b600080fd5b6100b66103a9565b005b6100c0610487565b60405180827effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b61010061048f565b60405180827effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b610140610497565b60405180827effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b6101da6004803603604081101561018e57600080fd5b81019080803573ffffffffffffffffffffffffffffffffffffffff169060200190929190803573ffffffffffffffffffffffffffffffffffffffff16906020019092919050505061049f565b60405180827effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b61021a610579565b6040518080602001828103825283818151815260200191508051906020019080838360005b8381101561025a57808201518184015260208101905061023f565b50505050905090810190601f1680156102875780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b61029d6105b2565b604051808273ffffffffffffffffffffffffffffffffffffffff16815260200191505060405180910390f35b6102d16105d6565b60405180821515815260200191505060405180910390f35b6102f16105ec565b60405180827effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b6103316105f4565b60405180827effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b6103716105fc565b60405180827effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916815260200191505060405180910390f35b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff161461046a576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004018080602001828103825260118152602001807f7065726d697373696f6e2064656e69656400000000000000000000000000000081525060200191505060405180910390fd5b6001600060146101000a81548160ff021916908315150217905550565b600460f81b81565b608060f81b81565b600260f81b81565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614158061050157506105006105d6565b5b1561051257600060f81b9050610573565b600173ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff16141561056b57600160f81b600260f81b600460f81b608060f81b600060f81b171717179050610573565b600060f81b90505b92915050565b6040518060400160405280600581526020017f302e302e3200000000000000000000000000000000000000000000000000000081525081565b60008054906101000a900473ffffffffffffffffffffffffffffffffffffffff1681565b60008060149054906101000a900460ff16905090565b600160f81b81565b600760f81b81565b600060f81b8156fea264697066735822122069d4acc7dafaaf1d9db9838e1de0f2add2df8faf34532c583b2c49543c1a90ff64736f6c634300060c0033"
};

const todoDirectory = "0x0000000000000000000000000000000000000001";

datona.blockchain.setProvider(blockchainGateway, "rinkeby");


//
// Setup your private key
//

// Create a new private key (if you don't already have one)
// You'll need to fund this acount before you can deploy and transact with the contract
// const myKey = datona.crypto.generateKey();

// ...or setup your private key (if you already have one)
const myKey = new datona.crypto.Key("052274d012c7926ee3faa7c21e1941bae48cba100b2a6877aa0aebdebd0b24fa");
