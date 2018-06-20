/* eslint-disable no-undef */ // Avoid the linter considering truffle elements as undef.
const AuctionMultiple = artifacts.require('AuctionMultiple.sol')
const { expectThrow, increaseTime } = require('./helpers')

contract('AuctionMultiple', function (accounts) {
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
    auction = await AuctionMultiple.new(1e18, "item", timestampEnd, beneficiary, 5, {from: owner});
  });

  it('Should be able to set up the constructor auction', async function() {
    assert.equal(await auction.owner(), owner, 'The owner is not set correctly')
    assert.equal(await auction.description(), "item", 'The description is not set correctly')
    assert.equal(await auction.timestampEnd(), timestampEnd, 'The endtime is not set correctly')
    assert.equal(await auction.beneficiary(), beneficiary, 'The beneficiary is not set correctly')
    assert.equal(await auction.howMany(), 5, 'The beneficiary is not set correctly')
  });

  it('Should set HEAD and TAIL bids', async function() {
    var head = await auction.bids.call(0);
    var address0 = "0x0000000000000000000000000000000000000000";
    assert.equal(head[3], address0);
  });

  it('Should accept a bid from a guy', async function() {
    await auction.sendTransaction({ value: 1e18, from: bidderA });

    var newBid = await auction.bids.call(1);

    console.log(newBid);

    assert.equal(newBid[2].toNumber(), 1e18);
  });



});


// BigNumber {
//     s: 1,
//     e: 77,
//     c:
//      [ 11579208,
//        92373161954235,
//        70985008687907,
//        85326998466564,
//        5640394575840,
//        7913129639935 ] },
//   BigNumber { s: 1, e: 18, c: [ 10000 ] }