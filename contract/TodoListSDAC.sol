//
// Example todolist smart data access contract
//
// This is about as basic as it comes.  It specifies a single directory that the owner of the contract has permission
// to read and write.  The directory has the id "0x0000000000000000000000000000000000000001".
//
// An SDAC defines the access permissions for all files in your vault.  When you construct a vault on an off-chain vault
// server you specify the address of the smart contract you want to control it.  The vault service will call the
// getPermissions method of the contract whenever someone tries to read or write to the vault and will accept or
// reject the request depending on the posix-style permission bits it returns.  All files and directories in Datona
// are ethereum addresses for privacy reasons.
//
// An example improvement would be to extend this contract to allow the owner to grant and revoke read access for
// other people.
//

pragma solidity ^0.6.3;

import "./SDAC-v0.0.2.sol";

contract TodoListSDAC is SDAC {

    bool terminated = false;

    function getPermissions( address requester, address file ) public view override returns (byte) {
        if (requester != owner || hasExpired()) return NO_PERMISSIONS;
        if ( file == address(1) ) return NO_PERMISSIONS | DIRECTORY_BIT | READ_BIT | WRITE_BIT | APPEND_BIT;
        return NO_PERMISSIONS;
    }

    function hasExpired() public view override returns (bool) {
        return terminated;
    }

    function terminate() public override {
        require(msg.sender == owner, "permission denied");
        terminated = true;
    }

}
