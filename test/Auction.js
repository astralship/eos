/* eslint-disable no-undef */ // Avoid the linter considering truffle elements as undef.
const Auction = artifacts.require('Auction.sol')
const { expectThrow, increaseTime } = require('./helpers')

contract('Auction', function (accounts) {
  let owner = accounts[0]
  let bidderA = accounts[1]
  let bidderB = accounts[2]
  let bidderC = accounts[3]
  
  let duration = 3600;
  let auction;
  let timestampEnd

  beforeEach(async function() {
    timestampEnd = web3.eth.getBlock('latest').timestamp  +  duration; // 1 hour from now
    auction = await Auction.new(1e18, "item", timestampEnd, {from: owner});
  });

  it('Should be able to set up the constructor auction', async function() {
    assert.equal(await auction.owner(), owner, 'The owner is not set correctly')
    assert.equal(await auction.description(), "item", 'The description is not set correctly')
    assert.equal(await auction.timestampEnd(), timestampEnd, 'The endtime is not set correctly')
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
    increaseTime(3700);
    await expectThrow(auction.setInstructions("whitehouse", {from: bidderB }));
    await auction.setInstructions("whitehouse", {from: bidderA });
    assert.equal(await auction.instructions(), "whitehouse", "Delivery instructions not set up correctly");
  });
   

  
});