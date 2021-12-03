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

// Configuration data, including blockchain provider, contract abi & object code and private key is at the end of this file.

class App extends Component {

  contractAddress = window.localStorage.getItem('contractAddress');

  state = {
    contractReady: this.contractAddress !== null,
    vaultReady: window.localStorage.getItem('vaultReady') || false,
    contractExpired: false,
    todos: []
  }

  componentDidMount() {
    // Deploy the contract and construct the vault if this hasn't been done before
    if (!this.state.contractReady) this.deployContract();
    else {
      // Check if contract has been terminated
      const contract = new datona.blockchain.Contract(todoListContract.abi, this.contractAddress);
      contract.hasExpired()
        .then( (expired) => {
          if (expired) {
            window.localStorage.removeItem('contractAddress');
            window.localStorage.removeItem('vaultReady');
            this.setState({ contractExpired: true });
          }
          else if (!this.state.vaultReady) this.constructVault();
          else {
            // Read the todolist from the vault
            this.vault = new datona.vault.RemoteVault(vaultService.url, this.contractAddress, myKey, vaultService.id);
            this.initialiseTodoList();
          }
        })
        .catch( (error) => {
          this.setState({ error: error });
        })
    }
  }

  deployContract = () => {
    console.log("deploying contract");
    const contract = new datona.blockchain.Contract(todoListContract.abi);
    contract.deploy(myKey, todoListContract.bytecode, [])
      .then( (address) => {
        console.log("contract deployed at address", address);
        this.contractAddress = address;
        window.localStorage.setItem('contractAddress', address);
        this.setState({ contractReady: true });
        return this.constructVault();
      })
      .catch( (error) => {
        console.log("deploy contract", error);
        this.setState({ error: error });
      })
  }

  constructVault = () => {
    console.log("constructing vault");
    this.vault = new datona.vault.RemoteVault(vaultService.url, this.contractAddress, myKey, vaultService.id);
    return this.vault.create()
      .then( () => {
        console.log("vault constructed");
        window.localStorage.setItem('vaultReady', true);
        this.setState({ vaultReady: true });
      })
      .catch( (error) => {
        console.log("construct vault", error);
        this.setState({ error: error });
      })
  }

  // Read todolist from vault
  initialiseTodoList = () => {
    console.log("reading todo list from vault");
    this.vault.read(todoDirectory)
      .then( (filesAsString) => {
        const files = filesAsString.length === 0 ? [] : filesAsString.split('\n');
        console.log("todo list files: ", files);
        if (datona.assertions.isArray(files) && files.length > 0) {
          for (let i = 0; i < files.length; i++) {
            this.vault.read(todoDirectory + "/" + files[i])
              .then((content) => {
                const todoItem = {id: files[i], content: this.decrypt(content)};
                if (todoItem.content.state !== "deleted") this.setState({todos: [...this.state.todos, todoItem]});
              })
              .catch( (error) => {
                console.log("initialise todo list", error);
              })
          }
        }
      })
      .catch( (error) => {
        console.log("initialise todo list", error);
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
    else if (this.state.contractExpired) {
      content = <p className="statusMsg">Todo list has been deleted. Refresh to create a new one</p>
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

const blockchain = {"name":"bubblenet","chainId":45021,"networkId":45021,"comment":"The Bubble main chain","url":"https://ethstats.net/","genesis":{"hash":"0xd4e56740f876aef8c010b86a40d5f56745a118d0906a34e69aec8c0db1cb8fa3","timestamp":null,"gasLimit":5000,"difficulty":17179869184,"nonce":"0x0000000000000042","extraData":"0x11bbe8db4e347b4e8c937c1c8370e4b5ed33adb3db69cbdb7a38e1e50b1b82fa","stateRoot":"0xd7f8974fb5ac78d9ac099b9ad5018bedc2ce0a72dad1827a1709da30580f0544"},"hardforks":[{"name":"chainstart","block":0,"consensus":"pow","finality":null},{"name":"homestead","block":1150000,"consensus":"pow","finality":null},{"name":"dao","block":1920000,"consensus":"pow","finality":null},{"name":"tangerineWhistle","block":2463000,"consensus":"pow","finality":null},{"name":"spuriousDragon","block":2675000,"consensus":"pow","finality":null},{"name":"byzantium","block":4370000,"consensus":"pow","finality":null},{"name":"constantinople","block":7280000,"consensus":"pow","finality":null},{"name":"petersburg","block":7280000,"consensus":"pow","finality":null},{"name":"istanbul","block":9069000,"consensus":"pow","finality":null},{"name":"muirGlacier","block":9200000,"consensus":"pow","finality":null}],"bootstrapNodes":[{"ip":"18.138.108.67","port":30303,"id":"d860a01f9722d78051619d1e2351aba3f43f943f6f00718d1b9baa4101932a1f5011f16bb2b1bb35db20d6fe28fa0bf09636d26a87d31de9ec6203eeedb1f666","location":"ap-southeast-1-001","comment":"bootnode-aws-ap-southeast-1-001"},{"ip":"3.209.45.79","port":30303,"id":"22a8232c3abc76a16ae9d6c3b164f98775fe226f0917b0ca871128a74a8e9630b458460865bab457221f1d448dd9791d24c4e5d88786180ac185df813a68d4de","location":"us-east-1-001","comment":"bootnode-aws-us-east-1-001"},{"ip":"34.255.23.113","port":30303,"id":"ca6de62fce278f96aea6ec5a2daadb877e51651247cb96ee310a318def462913b653963c155a0ef6c7d50048bba6e6cea881130857413d9f50a621546b590758","location":"eu-west-1-001","comment":"bootnode-aws-eu-west-1-001"},{"ip":"35.158.244.151","port":30303,"id":"279944d8dcd428dffaa7436f25ca0ca43ae19e7bcf94a8fb7d1641651f92d121e972ac2e8f381414b80cc8e5555811c2ec6e1a99bb009b3f53c4c69923e11bd8","location":"eu-central-1-001","comment":"bootnode-aws-eu-central-1-001"},{"ip":"52.187.207.27","port":30303,"id":"8499da03c47d637b20eee24eec3c356c9a2e6148d6fe25ca195c7949ab8ec2c03e3556126b0d7ed644675e78c4318b08691b7b57de10e5f0d40d05b09238fa0a","location":"australiaeast-001","comment":"bootnode-azure-australiaeast-001"},{"ip":"191.234.162.198","port":30303,"id":"103858bdb88756c71f15e9b5e09b56dc1be52f0a5021d46301dbbfb7e130029cc9d0d6f73f693bc29b665770fff7da4d34f3c6379fe12721b5d7a0bcb5ca1fc1","location":"brazilsouth-001","comment":"bootnode-azure-brazilsouth-001"},{"ip":"52.231.165.108","port":30303,"id":"715171f50508aba88aecd1250af392a45a330af91d7b90701c436b618c86aaa1589c9184561907bebbb56439b8f8787bc01f49a7c77276c58c1b09822d75e8e8","location":"koreasouth-001","comment":"bootnode-azure-koreasouth-001"},{"ip":"104.42.217.25","port":30303,"id":"5d6d7cd20d6da4bb83a1d28cadb5d409b64edf314c0335df658c1a54e32c7c4a7ab7823d57c39b6a757556e68ff1df17c748b698544a55cb488b52479a92b60f","location":"westus-001","comment":"bootnode-azure-westus-001"}]};

datona.blockchain.setProvider(blockchainGateway, blockchain);


//
// Private key
//

// This demo uses the hard coded private key below.  This has been pre-funded.
const myKey = new datona.crypto.Key("052274d012c7926ee3faa7c21e1941bae48cba100b2a6877aa0aebdebd0b24fa");

// If you want to generate a new key then use the following command:
//   const myKey = datona.crypto.generateKey();
// You'll need to request funds for this account on the Bubble discord server: https://discord.gg/sSnvK5C
