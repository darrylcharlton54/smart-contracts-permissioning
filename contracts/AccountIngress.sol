pragma solidity >=0.4.22 <0.6.0;

import "./AccountRulesProxy.sol";
import "./Ingress.sol";


contract AccountIngress is Ingress {
    // version of this contract: semver eg 1.2.14 represented like 001002014
    uint version = 1000000;

    event AccountPermissionsUpdated(
        bool addsRestrictions
    );

    function getContractVersion() public view returns(uint) {
        return version;
    }

    function emitRulesChangeEvent(bool addsRestrictions) public {
        require(registry[RULES_CONTRACT].contractAddress == msg.sender, "Only Rules contract can trigger Rules change events");
        emit AccountPermissionsUpdated(addsRestrictions);
    }

    function transactionAllowed(
        address sender,
        address target,
        uint256 value,
        uint256 gasPrice,
        uint256 gasLimit,
        bytes memory payload
    ) public view returns (bool) {
        if(getContractAddress(RULES_CONTRACT) == address(0)) {
            return false;
        }

        return AccountRulesProxy(registry[RULES_CONTRACT].contractAddress).transactionAllowed(
            sender, target, value, gasPrice, gasLimit, payload
        );
    }
}