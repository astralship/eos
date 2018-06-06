### Simple auction contract

Because I want to sell something, namely EOS whitepaper.

I've figured out how to run the Docker installation on my Mac but before I achieve a certain level of proficiency it will take a while.





Auction seems like the best  contract seems like the best 


### Front-end Dapp

Work in progress.
Currently calling smart contract methods directly.

### Refund during the auction


### Automatic refund at the end

You don't need to worry about anything, as we witdraw the winning bid, you'll be refunded too.

Theoretically, starting from `1 wei` there could be plenty of micro increments and plenty of `send` to excute.

Realistically, even if I pay the gas fees - it won't be that much.

Note the aligned incentives - `beneficiary` wants to receive ETH therefore chances are the bidders will receive their money.

Think: anyone to call the finalize function?


### TODO THINK

* Can buyerA outbid buyerA? (does it make any sense)