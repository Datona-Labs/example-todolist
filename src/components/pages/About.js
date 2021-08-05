import React from 'react';

const About = (props) => {
    return (
        <React.Fragment>
          <h1>About</h1>
          <p>TodoList app v0.0.1</p>
          <p>This is a basic demonstration of using the Datona platform as a private, off-chain data layer for a decentralised application.  The data is held on the cloud based datonavault.com, which is a generic data vault service compatible with the datona protocol.  Access to the vault is controlled by a smart contract on the Rinkeby testnet (see below for the contract address).</p>
          <p>App.js demonstrates the use of datona, including deploying the contract, constructing the vault, reading a directory and reading & writing files.  The private key is hard coded in App.js for convenience (see below for the key's public account address).  If you change the key you'll need to fund the account.</p>
          <br/>
          <p>Your account: <a className="code" href={"https://rinkeby.etherscan.io/address/"+props.myKeyAddress}>{props.myKeyAddress}</a></p>
          <p>Your contract address: <a className="code" href={"https://rinkeby.etherscan.io/address/"+props.contractAddress}>{props.contractAddress}</a></p>
          <p>Your vault server: {props.vaultServer}</p>
        </React.Fragment>
    )
}

export default About;