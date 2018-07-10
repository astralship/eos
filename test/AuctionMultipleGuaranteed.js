/* eslint-disable no-undef */ // Avoid the linter considering truffle elements as undef.
const AuctionMultipleGuaranteed = artifacts.require('AuctionMultipleGuaranteed.sol')
const AuctionMultiple = artifacts.require('AuctionMultiple.sol')
const { expectThrow, increaseTime, getGasLimit, getTransaction } = require('./helpers')

contract('AuctionMultipleGuaranteed', function (accounts) {
  let owner = accounts[0]
  let bidderA = accounts[1]
  let bidderB = accounts[2]
  let bidderC = accounts[3]
  let bidderD = accounts[4]
  let beneficiary = accounts[5]
  
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

  let contribution1 = 1e18;
  let contribution2 = 2e18;
  let contribution3 = 1.5e18; // in between
  let contribution4 = 2.5e18;

  beforeEach(async function() {
    timestampEnd = web3.eth.getBlock('latest').timestamp  +  duration; // 1 hour from now
    auction = await AuctionMultipleGuaranteed.new(1e18, "item", timestampEnd, beneficiary, 5, 3, 2e18, {from: owner});
  });

  it('Should be able to set up the constructor for multiple auction with guranteed', async function() {
    assert.equal(await auction.owner(), owner, 'The owner is not set correctly');
    assert.equal(await auction.description(), "item", 'The description is not set correctly');
    assert.equal(await auction.timestampEnd(), timestampEnd, 'The endtime is not set correctly');
    assert.equal(await auction.beneficiary(), beneficiary, 'The beneficiary is not set correctly');
    assert.equal(await auction.howMany(), 5, 'The beneficiary is not set correctly');
    assert.equal(await auction.howManyGuaranteed(), 3, 'The beneficiary is not set correctly');
    assert.equal(await auction.priceGuaranteed(), 2e18, 'The beneficiary is not set correctly');
  });



});