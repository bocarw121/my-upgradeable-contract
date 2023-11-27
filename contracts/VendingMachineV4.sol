// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import '@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol';

/**
 * @title VendingMachineV4
 * @author Bocar
 * @notice Fixes bug in withdrawProfits
 *
 */
contract VendingMachineV4 is Initializable {
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
        /// @dev can only withdraw profits once a week now
        /// @notice there was an underflow bug here in v3 bug here it should be block.timestamp >= lastWithdrawalTime + 1 weeks,
        require(
            block.timestamp >= lastWithdrawalTime + 1 weeks,
            'Withdrawal allowed once a week'
        );

        require(
            address(this).balance > 0,
            'Profits must be greater than 0 in order to withdraw!'
        );

        (bool sent, ) = owner.call{value: address(this).balance}('');
        require(sent, 'Failed to send ether');

        lastWithdrawalTime = block.timestamp;
    }

    function sellVendingMachine(address _newOwner) public onlyOwner {
        owner = _newOwner;
    }

    function loadMachine(uint _numSodas) public onlyOwner {
        numSodas += _numSodas;
    }

    modifier onlyOwner() {
        require(msg.sender == owner, 'Only owner can call this function.');
        _;
    }

    event LowSodaCount(address indexed _owner, uint indexed _sodaCount);

    modifier checkLowCount() {
        if (numSodas < 10) {
            emit LowSodaCount(owner, numSodas);
        }
        _;
    }
}
