/* eslint-disable no-undef */ // Avoid the linter considering truffle elements as undef.
const AuctionMultiple = artifacts.require('AuctionMultiple.sol')
const { expectThrow, increaseTime } = require('./helpers')

contract('AuctionMultiple', function (accounts) {
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

  it('Should set HEAD and TAIL bids', async function() {
    var head = await auction.bids.call(0);
    assert.equal(head[3], address0);
  });

  it('Should reject a bid that is too low', async function() {
    await expectThrow( auction.sendTransaction({ value: tooLittle, from: bidderA }) );

    var headBid = await auction.bids.call(headBidId);
    assert.equal(headBid[0].toNumber(), tailBidId);
    assert.equal(headBid[1].toNumber(), tailBidId);

    var tailBid = await auction.bids.call(tailBidId);
    assert.equal(tailBid[0].toNumber(), headBidId);
    assert.equal(tailBid[1].toNumber(), headBidId);
  });

  it('Should accept a bid from a guy and set "next" "prev" correctly', async function() {
    await auction.sendTransaction({ value: contribution1, from: bidderA });

    var newBid = await auction.bids.call(newBidId1);
    assert.equal(newBid[0].toNumber(), tailBidId);
    assert.equal(newBid[1].toNumber(), headBidId);
    assert.equal(newBid[2].toNumber(), contribution1);

    var headBid = await auction.bids.call(headBidId);
    assert.equal(headBid[0].toNumber(), newBidId1);
    assert.equal(headBid[1].toNumber(), tailBidId);

    var tailBid = await auction.bids.call(tailBidId);
    assert.equal(tailBid[0].toNumber(), headBidId);
    assert.equal(tailBid[1].toNumber(), newBidId1);
  });

  it('Should accept a 2 bids from 2 guys', async function() {
    await auction.sendTransaction({ value: contribution1, from: bidderA });
    await auction.sendTransaction({ value: contribution2, from: bidderB });

    var newBid1 = await auction.bids.call(newBidId1);
    var newBid2 = await auction.bids.call(newBidId2);
    var headBid = await auction.bids.call(headBidId);
    var tailBid = await auction.bids.call(tailBidId);

    assert.equal(newBid1[0].toNumber(), tailBidId);
    assert.equal(newBid1[1].toNumber(), newBidId2);
    assert.equal(newBid1[2].toNumber(), contribution1);    

    assert.equal(newBid2[0].toNumber(), newBidId1);
    assert.equal(newBid2[1].toNumber(), headBidId);
    assert.equal(newBid2[2].toNumber(), contribution2);

    assert.equal(headBid[0].toNumber(), newBidId2);
    assert.equal(headBid[1].toNumber(), tailBidId);

    assert.equal(tailBid[0].toNumber(), headBidId);
    assert.equal(tailBid[1].toNumber(), newBidId1);
  });    

  it('Should accept a 3 bids from 3 guys (testing simple cases first)', async function() {
    await auction.sendTransaction({ value: contribution1, from: bidderA });
    await auction.sendTransaction({ value: contribution2, from: bidderB });
    await auction.sendTransaction({ value: contribution3, from: bidderC });

    var newBid1 = await auction.bids.call(newBidId1);
    var newBid2 = await auction.bids.call(newBidId2);
    var newBid3 = await auction.bids.call(newBidId3);
    var headBid = await auction.bids.call(headBidId);
    var tailBid = await auction.bids.call(tailBidId);

    assert.equal(newBid1[0].toNumber(), tailBidId);
    assert.equal(newBid1[1].toNumber(), newBidId3);
    assert.equal(newBid1[2].toNumber(), contribution1);    

    assert.equal(newBid2[0].toNumber(), newBidId3);
    assert.equal(newBid2[1].toNumber(), headBidId);
    assert.equal(newBid2[2].toNumber(), contribution2);

    assert.equal(newBid3[0].toNumber(), newBidId1);
    assert.equal(newBid3[1].toNumber(), newBidId2);
    assert.equal(newBid3[2].toNumber(), contribution3);

    assert.equal(headBid[0].toNumber(), newBidId2);
    assert.equal(headBid[1].toNumber(), tailBidId);

    assert.equal(tailBid[0].toNumber(), headBidId);
    assert.equal(tailBid[1].toNumber(), newBidId1);
  });  

  it('Should allow an increasing bid', async function() {
    let moar = 1.1e18;
    await auction.sendTransaction({ value: contribution1, from: bidderA });
    await auction.sendTransaction({ value: contribution2, from: bidderB });
    await auction.sendTransaction({ value: moar, from: bidderA });

    var newBid1 = await auction.bids.call(newBidId1);
    var newBid2 = await auction.bids.call(newBidId2);
    var headBid = await auction.bids.call(headBidId);
    var tailBid = await auction.bids.call(tailBidId);

    assert.equal(newBid1[0].toNumber(), newBidId2);
    assert.equal(newBid1[1].toNumber(), headBidId);
    assert.equal(newBid1[2].toNumber(), contribution1 + moar);    

    assert.equal(newBid2[0].toNumber(), tailBidId);
    assert.equal(newBid2[1].toNumber(), newBidId1);
    assert.equal(newBid2[2].toNumber(), contribution2);

    assert.equal(headBid[0].toNumber(), newBidId1);
    assert.equal(headBid[1].toNumber(), tailBidId);

    assert.equal(tailBid[0].toNumber(), headBidId);
    assert.equal(tailBid[1].toNumber(), newBidId2);
  });

  it('Should allow 3 guys bidding moar and moar (increasing bid just like last time but more action)', async function() {
    let moar = 1.1e18;
    await auction.sendTransaction({ value: contribution1, from: bidderA });
    await auction.sendTransaction({ value: contribution2, from: bidderB });
    await auction.sendTransaction({ value: contribution3, from: bidderC });
    await auction.sendTransaction({ value: moar, from: bidderA });

    var newBid1 = await auction.bids.call(newBidId1);
    var newBid2 = await auction.bids.call(newBidId2);
    var newBid3 = await auction.bids.call(newBidId3);
    var headBid = await auction.bids.call(headBidId);
    var tailBid = await auction.bids.call(tailBidId);

    assert.equal(newBid1[0].toNumber(), newBidId2);
    assert.equal(newBid1[1].toNumber(), headBidId);
    assert.equal(newBid1[2].toNumber(), contribution1 + moar);    

    assert.equal(newBid2[0].toNumber(), newBidId3);
    assert.equal(newBid2[1].toNumber(), newBidId1);
    assert.equal(newBid2[2].toNumber(), contribution2);

    assert.equal(newBid3[0].toNumber(), tailBidId);
    assert.equal(newBid3[1].toNumber(), newBidId2);
    assert.equal(newBid3[2].toNumber(), contribution3);

    assert.equal(headBid[0].toNumber(), newBidId1);
    assert.equal(headBid[1].toNumber(), tailBidId);

    assert.equal(tailBid[0].toNumber(), headBidId);
    assert.equal(tailBid[1].toNumber(), newBidId3);

    await auction.sendTransaction({ value: moar, from: bidderC });
    // after sending now the standing is: C (1.5 + 1.1) A (1.0 + 1.1) B (2.0)

    var newBid1 = await auction.bids.call(newBidId1);
    var newBid2 = await auction.bids.call(newBidId2);
    var newBid3 = await auction.bids.call(newBidId3);
    var headBid = await auction.bids.call(headBidId);
    var tailBid = await auction.bids.call(tailBidId);

    assert.equal(newBid1[0].toNumber(), newBidId2);
    assert.equal(newBid1[1].toNumber(), newBidId3);
    assert.equal(newBid1[2].toNumber(), contribution1 + moar);    

    assert.equal(newBid2[0].toNumber(), tailBidId);
    assert.equal(newBid2[1].toNumber(), newBidId1);
    assert.equal(newBid2[2].toNumber(), contribution2);

    assert.equal(newBid3[0].toNumber(), newBidId1);
    assert.equal(newBid3[1].toNumber(), headBidId);
    assert.equal(newBid3[2].toNumber(), contribution3 + moar);

    assert.equal(headBid[0].toNumber(), newBidId3);
    assert.equal(headBid[1].toNumber(), tailBidId);

    assert.equal(tailBid[0].toNumber(), headBidId);
    assert.equal(tailBid[1].toNumber(), newBidId2);

    await auction.sendTransaction({ value: contribution4, from: bidderD });
    // final bid, this time from a new guy D (2.5)

    var newBid1 = await auction.bids.call(newBidId1);
    var newBid2 = await auction.bids.call(newBidId2);
    var newBid3 = await auction.bids.call(newBidId3);
    var newBid4 = await auction.bids.call(newBidId4);
    var headBid = await auction.bids.call(headBidId);
    var tailBid = await auction.bids.call(tailBidId);

    assert.equal(newBid1[0].toNumber(), newBidId2);
    assert.equal(newBid1[1].toNumber(), newBidId4);
    assert.equal(newBid1[2].toNumber(), contribution1 + moar);    

    assert.equal(newBid2[0].toNumber(), tailBidId);
    assert.equal(newBid2[1].toNumber(), newBidId1);
    assert.equal(newBid2[2].toNumber(), contribution2);

    assert.equal(newBid3[0].toNumber(), newBidId4);
    assert.equal(newBid3[1].toNumber(), headBidId);
    assert.equal(newBid3[2].toNumber(), contribution3 + moar);    

    assert.equal(newBid4[0].toNumber(), newBidId1);
    assert.equal(newBid4[1].toNumber(), newBidId3);
    assert.equal(newBid4[2].toNumber(), contribution4);

    assert.equal(headBid[0].toNumber(), newBidId3);
    assert.equal(headBid[1].toNumber(), tailBidId);

    assert.equal(tailBid[0].toNumber(), headBidId);
    assert.equal(tailBid[1].toNumber(), newBidId2);    
  });

  it('Correctly tell position of the bids', async function() {
    let moar = 1.1e18;
    await auction.sendTransaction({ value: contribution1, from: bidderA });
    await auction.sendTransaction({ value: contribution2, from: bidderB });
    await auction.sendTransaction({ value: contribution3, from: bidderC });
    await auction.sendTransaction({ value: moar, from: bidderA });

    var pos1, pos2, pos3, post4;

    pos1 = await auction.getPosition.call(bidderA);
    pos2 = await auction.getPosition.call(bidderB);
    pos3 = await auction.getPosition.call(bidderC);
    await expectThrow(auction.getPosition.call(bidderD)); 



    assert.equal(pos1.toNumber(), 1);
    assert.equal(pos2.toNumber(), 2);
    assert.equal(pos3.toNumber(), 3);

    await auction.sendTransaction({ value: moar, from: bidderC });
    // after sending now the standing is: C (1.5 + 1.1) A (1.0 + 1.1) B (2.0)

    pos1 = await auction.getPosition.call(bidderA);
    pos2 = await auction.getPosition.call(bidderB);
    pos3 = await auction.getPosition.call(bidderC);
    assert.equal(pos1.toNumber(), 2);
    assert.equal(pos2.toNumber(), 3);
    assert.equal(pos3.toNumber(), 1);

    await auction.sendTransaction({ value: contribution4, from: bidderD });
    // final bid, this time from a new guy D (2.5)

    // DIFFERENT SYNTAX - anyone can call "getPosition"
    pos1 = await auction.getPosition(bidderA, {from: owner});
    pos2 = await auction.getPosition(bidderB, {from: owner});
    pos3 = await auction.getPosition(bidderC, {from: owner});
    pos4 = await auction.getPosition(bidderD, {from: owner});
    assert.equal(pos1.toNumber(), 3);
    assert.equal(pos2.toNumber(), 4);
    assert.equal(pos3.toNumber(), 1);
    assert.equal(pos4.toNumber(), 2);
  });

});