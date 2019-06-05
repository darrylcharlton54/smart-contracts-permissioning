pragma solidity >=0.4.22 <0.6.0;

import "solidity-linked-list/contracts/StructuredLinkedList.sol";


contract AdminList {
    using StructuredLinkedList for StructuredLinkedList.List;

    StructuredLinkedList.List private list;

    function size() internal view returns (uint256) {
        return list.sizeOf();
    }

    function exists(address _address) internal view returns (bool) {
        return list.nodeExists(uint256(_address));
    }

    function add(address _address) internal returns (bool) {
        return list.push(uint(_address), false);
    }

    function addAll(address[] memory accounts) internal returns (bool) {
        bool allAdded = true;
        for (uint i = 0; i<accounts.length; i++) {
            if (!exists(accounts[i])) {
                allAdded = allAdded && add(accounts[i]);
            }
        }

        return allAdded;
    }

    function remove(address _address) internal returns (bool) {
        uint node = uint(_address);
        return list.remove(node) != 0 ? true : false;
    }

    function get(uint index) internal view returns (bool _exists, address _address) {
        uint listSize = list.sizeOf();
        if (index >= listSize) {
            return (false, address(0));
        }

        uint counter = 0;
        uint pointer = 0;
        bool hasFound = false;

        while(counter <= listSize) {
            (bool nodeExists, uint256 prev, uint256 next) = list.getNode(pointer);
            if (nodeExists) {
                if (counter == index + 1) {
                    hasFound = true;
                    break;
                } else {
                    counter++;
                    pointer = next;
                }
            } else {
                break;
            }
            //Getting rid of unused variable warning
            prev;
        }

        if (hasFound) {
            return (true, address(pointer));
        } else {
            return (false, address(0));
        }
    }

    function getAll() internal view returns (address[] memory) {
        uint listSize = list.sizeOf();
        if (listSize == 0) {
            return new address[](0);
        }

        address[] memory allAddresses = new address[](listSize);

        bool hasNext = true;
        uint counter = 0;
        uint pointer = 0;

        while(hasNext) {
            (bool nodeExists, uint256 prev, uint256 next) = list.getNode(pointer);
            if (nodeExists) {
                if (pointer > 0) {
                    allAddresses[counter++] = address(pointer);
                }

                if (next != 0) {
                    pointer = next;
                } else {
                    hasNext = false;
                }
            }
            //Getting rid of unused variable warning
            prev;
        }

        return allAddresses;
    }
}
