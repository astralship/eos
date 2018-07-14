pragma solidity ^0.4.23;

import "./AuctionMultiple.sol";

// 100000000000000000, "membership in Casa Crypto", 1546300799, "0x8855Ef4b740Fc23D822dC8e1cb44782e52c07e87", 20, 5, 5000000000000000000
// 100000000000000000, "membership in Casa Crypto", 1546300799, "0x85A363699C6864248a6FfCA66e4a1A5cCf9f5567", 20, 5, 5000000000000000000

// For instance: effering limited "Early Bird" tickets that are guaranteed
contract AuctionMultipleGuaranteed is AuctionMultiple {

  uint public howManyGuaranteed; // after guaranteed slots are used, we decrease the number of slots available (in the parent contract)
  uint public priceGuaranteed;
  address[] public guaranteedContributors; // cannot iterate mapping, keeping addresses in an array
  mapping (address => uint) public guaranteedContributions;
  function getGuaranteedContributorsLenght() public constant returns(uint) { return guaranteedContributors.length; } // lenght is not accessible from DApp, exposing convenience method: https://stackoverflow.com/questions/43016011/getting-the-length-of-public-array-variable-getter

  event GuaranteedBid(address addr, uint value, uint timestamp);
  
  constructor(uint _price, string _description, uint _timestampEnd, address _beneficiary, uint _howMany, uint _howManyGuaranteed, uint _priceGuaranteed) AuctionMultiple(_price, _description, _timestampEnd, _beneficiary, _howMany) public {
    require(_howMany >= _howManyGuaranteed, "The number of guaranteed items should be less or equal than total items. If equal = fixed price sell, kind of OK with me");
    require(_priceGuaranteed > 0, "Guranteed price must be greated than zero");

    howManyGuaranteed = _howManyGuaranteed;
    priceGuaranteed = _priceGuaranteed;
  }

  function bid() public payable {
    require(now < timestampEnd, "cannot bid after the auction ends");
    require(guaranteedContributions[msg.sender] == 0, "already a guranteed contributor, cannot more than once");

    if (msg.value >= priceGuaranteed && howManyGuaranteed > 0) {
      guaranteedContributors.push(msg.sender);
      guaranteedContributions[msg.sender] = msg.value;
      howManyGuaranteed--;
      howMany--;
      emit GuaranteedBid(msg.sender, msg.value, now);
    } else {
      super.bid(); // https://ethereum.stackexchange.com/questions/25046/inheritance-and-function-overwriting-who-can-call-the-parent-function
    }
  }

  function finalize() public ended() onlyOwner() {
    require(finalized == false, "auction already finalized, can withdraw only once");
    finalized = true;

    uint sumContributions = 0;
    uint counter = 0;
    Bid memory currentBid = bids[HEAD];
    while(counter++ < howMany && currentBid.prev != TAIL) {
      currentBid = bids[ currentBid.prev ];
      sumContributions += currentBid.value;
    }

    // At all times we are aware of gas limits - that's why we limit auction to 2000 participants, see also `test-gasLimit` folder
    for (uint i=0; i<guaranteedContributors.length; i++) {
      sumContributions += guaranteedContributions[ guaranteedContributors[i] ];
    }

    beneficiary.transfer(sumContributions);
  }  


}
