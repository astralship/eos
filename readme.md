# 1. Simple auction
[Auction.sol](https://github.com/genesisdotre/ethereum-auction/blob/master/contracts/Auction.sol)

Ethereum was designed with financial applications in mind, that is why auction is an equivalent of "Hello World".

There are many existing implementations of an auction, here is one of them: http://solidity.readthedocs.io/en/v0.4.21/solidity-by-example.html#simple-open-auction

The significant difference:
* bid just before the end increases the time

# 2. Multiple items
[AuctionMultiple.sol](https://github.com/genesisdotre/ethereum-auction/blob/master/contracts/AuctionMultiple.sol)

# 3. Multiple items, with guranteed placements
[AuctionMultipleGuaranteed.sol](https://github.com/genesisdotre/ethereum-auction/blob/master/contracts/AuctionMultipleGuaranteed.sol)

For example: 
* selling seats at a workshop in an auction and having 5 place guaranteed at certain price.
* auctioning memberships to an exclusive villa

### Scalability issues
For simplicity currenly there is an artificial limit of 2000 accounts participating in the auction.

See [`test-gasLimit`](https://github.com/genesisdotre/ethereum-auction/tree/master/test-gaslimit) folder for more information about testing gas limits.

Longer term, it is perfectly possible to avoid limitation by providing starting index to each loop. That, however would increase complexity and development time.

We are not selling tickets to Burning Man or The Rolling Stones at Wembley Stadium, 2000 limit is reasonable for now.
>  **premature optimization is the root of all evil**

https://en.wikiquote.org/wiki/Donald_Knuth#Computer_Programming_as_an_Art_(1974)

> Programmers waste enormous amounts of time thinking about, or worrying about, the speed of noncritical parts of their programs, and these attempts at efficiency actually have a strong negative impact when debugging and maintenance are considered. We should forget about small efficiencies, say about 97% of the time: premature optimization is the root of all evil. Yet we should not pass up our opportunities in that critical 3%.

### Front-end Dapp
* Not yet.
* Send ETH directly.
* To refund - send `0 ether` transaction.
* To view state of the contract - use Etherscan.

### Tests
* Aiming for 100% coverage.
* `truffle test` gives an error: ` Error: The contract code couldn't be stored, please check your gas amount.`
* When running tests individually it works OK:
  * `truffle test ./test/Auction.js`
  * `truffle test ./test/AuctionMultiple.js`
  * `truffle test ./test/AuctionMultipleGuaranteed.js`
  * `truffle test ./test-gaslimit/GasLimit.js` *(expect long wait)*
* TODO: better tooling: https://blog.colony.io/code-coverage-for-solidity-eecfa88668c2

### Think
* Can `buyerA` outbid `buyerA`? Does it make any sense in terms of game theory incentives? Pay extra 25% to extend the auction? It's not me to judge, there could be a valid reason for that.
* With single item auction, outbidding towards the end makes sense to increase time. Does it make sense with multiple items?
* How winners communicate with the owner about shipping address? Currently setting instructions on-chain. Signing message with the private key (complicated) or off-chain communication possible too.

### Security audits
* Please don't [hack](https://ethernaut.zeppelin.solutions/).
* Please don't [kill](https://github.com/paritytech/parity/issues/6995).
* Be kind - open an issue, submit a pull request.

![](https://raw.githubusercontent.com/astralship/auction-ethereum/master/owasp.png)

### Acknowledgements

Thanks to [@GriffGreen](https://github.com/GriffGreen) and [@fosgate29](https://github.com/fosgate29) for reviewing early versions of the code.

This is my first contract I wrote from start to finish, not using copy-paste method.

I'm grateful for **Kleros** and their IICO model that motivated me to level up my coding skills. You can view my commits to their smart contract code [here](https://github.com/kleros/openiico-contract/commits?author=stefek99).