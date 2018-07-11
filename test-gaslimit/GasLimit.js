/* eslint-disable no-undef */ // Avoid the linter considering truffle elements as undef.
const AuctionMultiple = artifacts.require('AuctionMultiple.sol')
const { expectThrow, increaseTime, getTransactionReceipt } = require('./../test/helpers')

contract('AuctionMultiple - Gas Limit', function (accounts) {
  let owner = accounts[0]
  let beneficiary = accounts[1]
  
  let day = 24 * 60 * 60;
  let duration = 3 * day; // similar amount to `increaseTimeIfBidBeforeEnd`
  let auction;
  let timestampEnd;

  let headBidId = 120000000 * 1e18;
  let tailBidId = 0;
  let newBidId1 = 1;
  let newBidId2 = 2;

  let iterations = 100;

  beforeEach(async function() {
    timestampEnd = web3.eth.getBlock('latest').timestamp  +  duration;
    auction = await AuctionMultiple.new(0.01 * 1e18, "item", timestampEnd, beneficiary, 5, {from: owner});
  });

  it('Should ran out of gas when limit is very small', async function() {
    this.timeout(6000000); // Test takes too long to load, need increase default timeout: https://stackoverflow.com/a/35398816/775359
    var gasUsed = 0; // calculating delta - it is about 1142 more gas for each additional transaction because more comparisons in while loop for insertion point

    for (let i=0; i<iterations; i++) {
      var tx = await auction.sendTransaction({ value: (i + 1) * 0.01 * 1e18, from: accounts[i] }); // otherwise sending 0 and reaching withdraw
      
      if (i % 10 === 0) {
        console.log(i + "\t" + tx.receipt.gasUsed + "\t" + (tx.receipt.gasUsed - gasUsed));
      }

      gasUsed = tx.receipt.gasUsed;
    }

    var tx = await auction.sendTransaction({ value: iterations * 0.01 * 1e18, from: accounts[0] });
    console.log("F" + "\t" + tx.receipt.gasUsed); // "F" means first - first guy bidding more


    // STANDARD CHECKS THAT EVERYTHING IS IN PLACE
    var newBid = await auction.bids.call(newBidId1);
    assert.equal(newBid[0].toNumber(), iterations);
    assert.equal(newBid[1].toNumber(), headBidId);
    assert.equal(newBid[2].toNumber(), (iterations + 1) * 0.01 * 1e18);

    var headBid = await auction.bids.call(headBidId);
    assert.equal(headBid[0].toNumber(), newBidId1);
    assert.equal(headBid[1].toNumber(), tailBidId);

    var tailBid = await auction.bids.call(tailBidId);
    assert.equal(tailBid[0].toNumber(), headBidId);
    assert.equal(tailBid[1].toNumber(), newBidId2);

  });

});