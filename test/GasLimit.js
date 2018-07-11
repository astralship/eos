/* eslint-disable no-undef */ // Avoid the linter considering truffle elements as undef.
const AuctionMultiple = artifacts.require('AuctionMultiple.sol')
const { expectThrow, increaseTime, getTransactionReceipt } = require('./helpers')

contract('AuctionMultiple - Gas Limit', function (accounts) {
  let owner = accounts[0]
  let bidderA = accounts[1]
  let bidderB = accounts[2]
  let bidderC = accounts[3]
  let bidderD = accounts[4]
  let beneficiary = accounts[5]
  let address0 = "0x0000000000000000000000000000000000000000";
  
  let day = 24 * 60 * 60;
  let duration = 3 * day; // similar amount to `increaseTimeIfBidBeforeEnd`
  let auction;
  let timestampEnd;

  let headBidId = 120000000 * 1e18;
  let tailBidId = 0;
  let newBidId1 = 1;
  let newBidId2 = 2;
  let newBidId3 = 3;
  let newBidId4 = 4;

  let tooLittle = 0.5e18;
  let contribution1 = 1e18;
  let contribution2 = 2e18;
  let contribution3 = 1.5e18; // in between
  let contribution4 = 2.5e18;

  beforeEach(async function() {
    timestampEnd = web3.eth.getBlock('latest').timestamp  +  duration;
    auction = await AuctionMultiple.new(1e18, "item", timestampEnd, beneficiary, 5, {from: owner});
  });

  it('Should be able to set up the constructor auction', async function() {
    assert.equal(await auction.owner(), owner, 'The owner is not set correctly')
    assert.equal(await auction.description(), "item", 'The description is not set correctly')
    assert.equal(await auction.timestampEnd(), timestampEnd, 'The endtime is not set correctly')
    assert.equal(await auction.beneficiary(), beneficiary, 'The beneficiary is not set correctly')
    assert.equal(await auction.howMany(), 5, 'The beneficiary is not set correctly')
  });

  
  // SOME NEW LESSONS LEARNT
  // https://github.com/kleros/openiico-contract/pull/30#issuecomment-402139640

  it('Should ran out of gas when limit is very small', async function() {

    

    for (let i=0; i<10; i++) {
      var tx = await auction.sendTransaction({ value: (i + 1) * 0.01 * 1e18, from: accounts[i] }); // otherwise sending 0 and reaching withdraw
      console.log(i + "\t" + tx.receipt.gasUsed);
    }



    var tx = await auction.sendTransaction({ value: 12 * 0.01 * 1e18, from: accounts[0] });
    console.log("F" + "\t" + tx.receipt.gasUsed);

  });

});