pragma solidity >=0.4.22 <0.6.0;

import "./AdminProxy.sol";
import "./AdminList.sol";


contract Admin is AdminProxy, AdminList {
    modifier onlyAdmin() {
        require(isAuthorized(msg.sender), "Sender not authorized");
        _;
    }

    modifier notSelf(address _address) {
        require(msg.sender != _address, "Cannnot invoke method with own account as parameter");
        _;
    }

    constructor() public {
        add(msg.sender);
    }

    function isAuthorized(address _address) public view returns (bool) {
        return exists(_address);
    }

    function addAdmin(address _address) public onlyAdmin notSelf(_address) returns (bool) {
        return add(_address);
    }

    function removeAdmin(address _address) public onlyAdmin notSelf(_address) returns (bool) {
        return remove(_address);
    }

    function getAdmins() public view returns (address[] memory){
        return getAll();
    }
}