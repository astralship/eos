This is my first contract I wrote from start to finish, not using copy-paste method.

I'm grateful for **Kleros** and their IICO model that motivated me to level up my coding skills. You can view my commits to their smart contract code [here](https://github.com/kleros/openiico-contract/commits?author=stefek99).

<!---
### Simple auction contract

Because I want to sell something, namely EOS whitepaper signed by Ian Griggs.

I've figured out how to run the Docker  on my Mac but before I achieve a certain level of proficiency in working with EOS it will take a while.

*(chances are it will take you some time as well to figure out how to securely transact on the EOS blockchain)*
-->

// REFUND

// TODO: minting a NFT

// TODO: extend time 

// TODO: store cut-off bid value ! ! ! ! ! 

// TODO: clear storage
https://ethereum.stackexchange.com/questions/26923/how-to-remove-the-contract-storage-associated-with-instance-variables


### Front-end Dapp

* Not yet.
* Send ETH directly.
* To refund - send `0 ether` transaction.
* To view state of the contract - use Etherscan.

### Automatic refund at the end

You don't need to worry about anything, as we witdraw the winning bid, you'll be refunded too.

Theoretically, starting from `1 wei` there could be plenty of micro increments and plenty of `send` to excute.

Realistically, even if I pay the gas fees - it won't be that much.

Note the aligned incentives - `beneficiary` wants to receive ETH therefore chances are the bidders will receive their money.


### Tests

Aiming for 100% coverage.

`truffle test`


### TODO THINK

* Anyone to call the `finalize` function?

* Can `buyerA` outbid `buyerA`? Does it make any sense in terms of game theory incentives? Pay extra 25% to extend the auction? It's not me to judge, it could be a valid motivation perhaps.

* Starting time!


### Multiple auction


### Security

Please don't [hack](https://ethernaut.zeppelin.solutions/).

Please don't [kill](https://github.com/paritytech/parity/issues/6995).

Be kind - open an issue, submit a pull request.

![](https://raw.githubusercontent.com/astralship/auction-ethereum/master/owasp.png)

Bounty paid in [MAIL](https://mailhustle.com/) tokens.