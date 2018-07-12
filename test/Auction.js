/* eslint-disable no-undef */ // Avoid the linter considering truffle elements as undef.
const Auction = artifacts.require('Auction.sol')
const { expectThrow, increaseTime } = require('./helpers')

contract('Auction', function (accounts) {
  let owner = accounts[0]
  let bidderA = accounts[1]
  let bidderB = accounts[2]
  let bidderC = accounts[3]
  let beneficiary = accounts[4]
  
  let day = 24 * 60 * 60;
  let duration = 3 * day; // similar amount to `increaseTimeIfBidBeforeEnd`
  let auction;
  let timestampEnd;

  beforeEach(async function() {
    timestampEnd = web3.eth.getBlock('latest').timestamp  +  duration; // 1 hour from now
    auction = await Auction.new(1e18, "item", timestampEnd, beneficiary, {from: owner});
  });

  it('Should be able to set up the constructor auction', async function() {
    assert.equal(await auction.owner(), owner, 'The owner is not set correctly')
    assert.equal(await auction.description(), "item", 'The description is not set correctly')
    assert.equal(await auction.timestampEnd(), timestampEnd, 'The endtime is not set correctly')
    assert.equal(await auction.beneficiary(), beneficiary, 'The beneficiary is not set correctly')
  })  

  it('Should be able to send a bid above the initial price', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    assert.equal(await auction.price(), 1e18, "Price not set up correctly");
    assert.equal(await auction.winner(), bidderA, "Winner not set up correctly");
  })  

  it('Should not be able to send a bid below the initial price', async function() {
    await expectThrow(auction.sendTransaction({ value: 0.5e18, from: bidderA }));
  })

  it('Should not be able to send a bid after the end of auction', async function() {
    increaseTime(duration + 1);
    await expectThrow(auction.sendTransaction({ value: 1e18, from: bidderA }));
  })  

  it('Should be able to outbid', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    await auction.sendTransaction({ value: 1.25e18, from: bidderB });
    assert.equal(await auction.price(), 1.25e18, "Price not set up correctly");
    assert.equal(await auction.winner(), bidderB, "Winner not set up correctly");
  })  

  it('Should not be able to outbid if bid too low', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    await expectThrow(auction.sendTransaction({ value: 1.2e18, from: bidderB }))
    assert.equal(await auction.price(), 1e18, "Price not set up correctly");
    assert.equal(await auction.winner(), bidderA, "Winner not set up correctly");
  });

  it('Should be able to outbid - partially (we already have some ETH', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    await auction.sendTransaction({ value: 1.25e18, from: bidderB });
    await auction.sendTransaction({ value: 0.5625e18, from: bidderA });
    assert.equal(await auction.price(), 1.5625e18, "Price not set up correctly");
    assert.equal(await auction.winner(), bidderA, "Winner not set up correctly");
  });

  it('Winner should be able to set delivery instructions', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    increaseTime(duration + 1);
    await expectThrow(auction.setInstructions("whitehouse", {from: bidderB }));
    await auction.setInstructions("whitehouse", {from: bidderA });
    assert.equal(await auction.instructions(), "whitehouse", "Delivery instructions not set up correctly");
  });    

  it('Bidding just before the end should increase duration of the auction', async function() {
    increaseTime(2.5 * day);
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    assert.closeTo((await auction.timestampEnd()).toNumber(), timestampEnd + (0.5 * day), 60, "Did not increase timestamp by 0.5 days");
    increaseTime(0.9 * day);
    await auction.sendTransaction({ value: 1.25e18, from: bidderB });
    assert.closeTo((await auction.timestampEnd()).toNumber(), timestampEnd + ((0.5 + 0.9) * day), 60, "Did not increase timestamp by 0.5 + 0.9 days");
  });    

  it('Bidding in early stages should NOT increase duration of the auction', async function() {
    increaseTime(1 * day);
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    assert.equal((await auction.timestampEnd()).toNumber(), timestampEnd, "Should not increse the end timestamp");
  });

  it('Beneficiary should receive ETH equal to winning bid', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    await expectThrow(auction.finalize({ from: owner })); // cannot withdraw before the end
   
    increaseTime(duration + 1);

    var balanceBefore = web3.eth.getBalance(beneficiary).toNumber()
    await auction.finalize({ from: owner });
    var balanceAfter = web3.eth.getBalance(beneficiary).toNumber()
    assert.equal(balanceBefore + 1e18, balanceAfter, "beneficiary didn't receive correct amount")
    
    await expectThrow(auction.finalize({ from: owner })); // cannot withdraw more than once
  });  

  // REMOVED DANGEROUS METHOD
  // https://github.com/astralship/eos/issues/11

  // function refundContributors() public ended() onlyOwner() {
  //   bids[winner] = 0; // setting it to zero that in the refund loop it is skipped
  //   for (uint i = 0; i < accountsList.length;  i++) {
  //     if (bids[accountsList[i]] > 0) {
  //       uint refundValue = bids[accountsList[i]];
  //       bids[accountsList[i]] = 0;
  //       accountsList[i].transfer(refundValue); 
  //     }
  //   }
  // }    

  // it('Other guys should get a refund ', async function() {
  //   await auction.sendTransaction({ value: 1e18, from: bidderA });
  //   await auction.sendTransaction({ value: 1.5e18, from: bidderB });
  //   await auction.sendTransaction({ value: 2e18, from: bidderC });

  //   increaseTime(duration + 1);

  //   var balanceBeforeA = web3.eth.getBalance(bidderA).toNumber()
  //   var balanceBeforeB = web3.eth.getBalance(bidderB).toNumber()
  //   var balanceBeforeC = web3.eth.getBalance(bidderC).toNumber()
  //   var balanceBeforeBen = web3.eth.getBalance(beneficiary).toNumber()

  //   await auction.finalize({ from: owner });
  //   await auction.refundContributors({ from: owner });

  //   var balanceAfterA = web3.eth.getBalance(bidderA).toNumber()
  //   var balanceAfterB = web3.eth.getBalance(bidderB).toNumber()
  //   var balanceAfterC = web3.eth.getBalance(bidderC).toNumber()
  //   var balanceAfterBen = web3.eth.getBalance(beneficiary).toNumber()

  //   assert.equal(balanceBeforeA + 1e18, balanceAfterA, "bidder A didn't receive correct refund")
  //   assert.equal(balanceBeforeB + 1.5e18, balanceAfterB, "bidder B didn't receive correct refund")
  //   assert.equal(balanceBeforeC, balanceAfterC, "bidder C should not receive any (he is the winner)")
  //   assert.equal(balanceBeforeBen + 2e18, balanceAfterBen, "beneficiary receive correct refund")
  // });

  it('Should fail if some random guy wants a refund', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    increaseTime(duration + 1);
    await expectThrow(auction.refund({ from: bidderB })); 
  });

  it('Should be able to withdraw', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    await auction.sendTransaction({ value: 1.25e18, from: bidderB });

    var balanceBeforeA = web3.eth.getBalance(bidderA).toNumber()
    await auction.refund({ from: bidderA })
    var balanceAfterA = web3.eth.getBalance(bidderA).toNumber()
    assert.closeTo(balanceBeforeA + 1e18, balanceAfterA, 0.01 * 1e18, "bidder A didn't receive correct refund"); // closeTo because of the gas fees
  });


  it('Should NOT be able to withdraw if the highest bidder', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    await expectThrow( auction.refund({ from: bidderA }) );  
  });

  it('Should be able to withdraw via fallback function', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });
    await auction.sendTransaction({ value: 1.25e18, from: bidderB });

    var balanceBeforeA = web3.eth.getBalance(bidderA).toNumber()
    await auction.sendTransaction({ value: 0, from: bidderA })
    var balanceAfterA = web3.eth.getBalance(bidderA).toNumber()
    assert.closeTo(balanceBeforeA + 1e18, balanceAfterA, 0.01 * 1e18, "bidder A didn't receive correct refund"); // closeTo because of the gas fees
  });
  
});