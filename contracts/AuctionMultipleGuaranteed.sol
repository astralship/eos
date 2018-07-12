pragma solidity ^0.4.23;

import "./AuctionMultiple.sol";

// 1, "something", 1529659548, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 3

// For instance: effering limited "Early Bird" tickets that are guaranteed
contract AuctionMultipleGuaranteed is AuctionMultiple {

  uint public howManyGuaranteed; // after guaranteed slots are used, we decrease the number of slots available
  uint public priceGuaranteed;
  address[] public guaranteedContributors; // cannot iterate mapping, keeping addresses in an array
  mapping (address => uint) public guaranteedContributions; 

  event GuaranteedBid(address addr, uint value);
  
  constructor(uint _price, string _description, uint _timestampEnd, address _beneficiary, uint _howMany, uint _howManyGuaranteed, uint _priceGuaranteed) AuctionMultiple(_price, _description, _timestampEnd, _beneficiary, _howMany) public {
    require(_howMany >= _howManyGuaranteed, "The number of guaranteed items should be less or equal than total items. If equal = fixed price sell, kind of OK with me");
    require(_priceGuaranteed > 0, "Guranteed price must be greated than zero");

    howManyGuaranteed = _howManyGuaranteed;
    priceGuaranteed = _priceGuaranteed;
  }

  function() public payable {
    if (msg.value == 0) {
      refund();
    } else {
      require(now < timestampEnd, "cannot bid after the auction ends");
      require(guaranteedContributions[msg.sender] == 0, "already a guranteed contributor, cannot more than once");

      if (msg.value >= priceGuaranteed && howManyGuaranteed > 0) {
        guaranteedContributors.push(msg.sender);
        guaranteedContributions[msg.sender] = msg.value;
        howManyGuaranteed--;
        howMany--;
        emit GuaranteedBid(msg.sender, msg.value);
      } else {
        bid();
      }
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

    // At all times we are aware of gas limits - that's why we limit auction to 2000 participants
    // See also `test-gasLimit` folder
    for (uint i=0; i<guaranteedContributors; i++) {
      sumContributions += guaranteedContributions[ guaranteedContributors[i] ];
    }

    beneficiary.transfer(sumContributions);
  }  


}
