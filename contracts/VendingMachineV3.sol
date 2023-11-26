// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

/**
 * @title VendingMachineV3
 * @author Bocar
 * @notice This makes some more improvements on top of v2
 *
 */
contract VendingMachineV3 is Initializable {
    // these state variables and their values
    // will be preserved forever, regardless of upgrading
    uint public numSodas;
    address public owner;
    mapping(address => uint) userPurchase;
    /// @dev tracks owner witdraw time
    uint public lastWithdrawalTime;

    // safe constructor
    function initialize(uint _numSodas) public initializer {
        numSodas = _numSodas;
        owner = msg.sender;
    }

    /// @dev when user makes a purchase the count will be checked
    function purchaseSodas() public payable checkLowCount {
        require(msg.value == 1000 wei, 'You must pay 1000 wei for a soda!');
        numSodas--;
        userPurchase[msg.sender] += 1;
    }

    /// @dev when owner  withdraws funds the count will also be checked
    function withdrawProfits() public onlyOwner checkLowCount {
        /// @dev can only withdraw profits once a week
        /// @dev it wasn't tested and there was a (Arithmetic operation underflowed or overflowed outside of an unchecked block) this will be fixed in v4
        require(lastWithdrawalTime - block.timestamp >= 1 weeks);

        require(
            address(this).balance > 0,
            'Profits must be greater than 0 in order to withdraw!'
        );

        (bool sent, ) = owner.call{value: address(this).balance}('');
        require(sent, 'Failed to send ether');
        /// @dev lastWithdrawalTime is set to the blocks time stamp
        lastWithdrawalTime = block.timestamp;
    }

    /// @dev changes function name from setNewOwner to sellVendingMachine
    function sellVendingMachine(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    function loadMachine(uint _numSodas) public onlyOwner {
        numSodas = _numSodas;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'Only owner can call this function.');
        _;
    }

    /// @dev Add event for LowSodaCount
    event LowSodaCount(address indexed _owner, uint indexed _sodaCount);

    /// @dev Add modifier that emits the LowSodaCount if its under 10
    modifier checkLowCount() {
        if (numSodas < 10) {
            emit LowSodaCount(owner, numSodas);
        }
        _;
    }
}
