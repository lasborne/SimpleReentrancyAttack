const { expect } = require("chai");
const { ethers } = require('hardhat');

describe("ReEntrancy Attack", function () {
    let deployer, bankContract, attackerContract

    beforeEach (async () => {
        [ deployer, newUser1, attacker ] = await ethers.getSigners()
        const BankContract = await ethers.getContractFactory('BankContract', deployer)
        bankContract = await BankContract.deploy("BankToken", "BTN")

        await bankContract.deposit({ value: ethers.utils.parseEther('250') })
        await bankContract.connect(newUser1).deposit(
            { value: ethers.utils.parseEther('500')}
        )

        // Add the hacker/attacker's contract
        const AttackerContract = await ethers.getContractFactory('AttackerContract', attacker)
        attackerContract = await AttackerContract.deploy(bankContract.address)

    })

    describe('enables Ether withdrawals and deposits', () => {
        it('permits Ether deposits', async() => {
            // Check BankContract deployer's deposit balance
            const deployerBalance = await bankContract.balanceOf(deployer.address)
            expect(deployerBalance).to.eq(ethers.utils.parseEther('250'))

            // Check user's deposit balance
            const newUser1Balance = await bankContract.balanceOf(newUser1.address)
            expect(newUser1Balance).to.eq(ethers.utils.parseEther('500'))

            // Check Contract address balance (Vault)
            const bankContractAddress = await bankContract.bank()
            const bankContractBalance = await bankContract.balanceOf(bankContractAddress)
            expect(bankContractBalance).to.eq(ethers.utils.parseEther('1000000'))
        })

        it('permits Ether withdrawals', async() => {
            //Check withdrawals can be done
            const newUser1BalanceBefore = await bankContract.balanceOf(newUser1.address)
            await bankContract.connect(newUser1).withdraw()
            
            const newUser1BalanceAfter = await bankContract.balanceOf(newUser1.address)
            const deployerBalanceAfter = await bankContract.balanceOf(deployer.address)
            
            expect(newUser1BalanceBefore).to.equal(ethers.utils.parseEther('500'))
            expect(newUser1BalanceAfter).to.eq(ethers.utils.parseEther('0'))
            expect(deployerBalanceAfter).to.equal(ethers.utils.parseEther('250'))
        })
        
        it('permits an attacker to drain funds using the withdraw function of the bank', 
        async() => {
            const bankContractBal = await ethers.provider.getBalance(bankContract.address)
            const attackerContractBal = await ethers.provider.getBalance(attackerContract.address)
            console.log('***Before the Hack***')
            console.log(`Bank Contract's balance is ${ethers.utils.formatEther(bankContractBal)}`)
            console.log(`Attacker Contract's balance is ${ethers.utils.formatEther(attackerContractBal)}`)
            
            // Hack
            await attackerContract.hack({value: ethers.utils.parseEther('10')})

            console.log('\n***After the Hack***')
            const bankContractBal_ = await ethers.provider.getBalance(bankContract.address)
            const attackerContractBal_ = await ethers.provider.getBalance(attackerContract.address)
            console.log(`Bank Contract's balance is ${ethers.utils.formatEther(bankContractBal_)}`)
            console.log(`Attacker Contract's balance is ${ethers.utils.formatEther(attackerContractBal_)}`)
            
            // Check if the hack was successful and bank Contract is drained
            expect(bankContractBal_).to.equal(ethers.utils.parseEther('0'))
            console.log(ethers.utils.formatEther(await ethers.provider.getBalance(attacker.address)))
            expect(await ethers.provider.getBalance(attacker.address)).to.greaterThanOrEqual(ethers.utils.parseEther('750'))
        })
    })
});