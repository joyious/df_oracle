pragma solidity ^0.4.23;

import "./DsThing.sol";

contract Authority is DSAuth {
    mapping (address => mapping (address => mapping (bytes4 => bool))) acl;

    function permit(address src, address dst, bytes4 sig) public auth {
        acl[src][dst][sig] = true;
    }

    function forbid(address src, address dst, bytes4 sig) public auth {
        acl[src][dst][sig] = false;
    }

    function canCall(address src, address dst, bytes4 sig) public view returns (bool) {
        return acl[src][dst][sig];
    }
}


