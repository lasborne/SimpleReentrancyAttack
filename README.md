# SimpleReentrancyAttack


WEEK1 - This is a simple smart contract with a Bank demonstrating a simple Reentrancy attack vulnerability, and, also, a solution.

The BankContract is the main contract serving as a smart contract bank that stores users' deposits, tracks users' balances, and makes available for withdrawals (through the withdraw function). This contract, however, is highly susceptible to Reentrancy Attacks from other smart contracts.

The attackContract is an example of a smart contract that can exploit the withdraw function of the BankContract, by doing a deposit, asking for an instant withdraw, and running a looping fallback, receive function that keeps draining the BankContract's fund without allowing it to update it's state to zero. Hence, the BankContract still thinks and works as if the attackContract still has balances while it drains the fund in a loop.

The BankContractSecured is a simple smart contract created by modifying the original BankContract and including OpenZeppelin's Reentrancy guard which disallows another external smart contract from running functions (fallbacks) repeatedly when the state variables have not been updated, thereby, causing any Reentrancy attack to fail and disallow stealing of funds.
