// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//import the ERC-20 token standard and create the Bank's fund token
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import '@openzeppelin/contracts/utils/Address.sol';
import '@openzeppelin/contracts/security/ReentrancyGuard.sol';
//import hardhat's inbuilt console for logging values
import 'hardhat/console.sol';

// This is a simple contract protected from Re-entrancy attack
contract BankContractSecured is ReentrancyGuard {
    // This makes the Address library accessible to all addresses payable
    using Address for address payable;
    
    address public bank;
    string public name;
    string public symbol;
    uint256 private totalSupply = 1000000000000000000000000;
    uint24 private decimals = 18;
    bool success;
    mapping(address => uint256) public balanceOf;

    constructor (string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
        balanceOf[address(this)] = totalSupply;
        bank = address(this);
    }

    // Deposit ether
    function deposit() external payable {
        balanceOf[msg.sender] += msg.value;
    }


    //Test function to show the token name assigned during construction
    function name_() external view {
        console.log(name);
    }

    // Withdraw ether
    function withdraw() external nonReentrant{
        uint256 depositorBalance = balanceOf[msg.sender];
        payable(msg.sender).sendValue(depositorBalance);
        balanceOf[msg.sender] = 0;
    }

}