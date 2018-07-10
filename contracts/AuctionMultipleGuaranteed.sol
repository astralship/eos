pragma solidity ^0.4.23;

import "./AuctionMultiple.sol";

// 1, "something", 1529659548, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 3

contract AuctionMultipleGuaranteed is AuctionMultiple {

  uint public howManyGuaranteed; // after guaranteed slots are used, we decrease the number of slots available
  uint public priceGuaranteed;
  address[] public guaranteedContributors;
  mapping (address => uint) public guaranteedContributions; // keeping track if a certain address contirbuted

  event GuaranteedBid(address addr, uint value);
  
  constructor(uint _price, string _description, uint _timestampEnd, address _beneficiary, uint _howMany, uint _howManyGuaranteed, uint _priceGuaranteed) AuctionMultiple(_price, _description, _timestampEnd, _beneficiary, _howMany) public {
    require(_howMany > _howManyGuaranteed, "The number of guaranteed items should be less than total items, otherwise impossible or fixed price sell");
    require(_priceGuaranteed > 0, "Guranteed price must be greated than zero");

    howManyGuaranteed = _howManyGuaranteed;
    priceGuaranteed = _priceGuaranteed;
  }

  function() public payable {
    if (msg.value == 0) {
      withdraw();
    } else {
      require(now < timestampEnd, "cannot bid after the auction ends");
      require(guaranteedContributions[msg.sender] == 0, "already a guranteed contributor, cannot more than once");

      if (msg.value >= priceGuaranteed && howManyGuaranteed > 0) {
        guaranteedContributors.push(msg.sender);
        guaranteedContributions[msg.sender] = msg.value;
        howManyGuaranteed--;
        emit GuaranteedBid(msg.sender, msg.value);
      } else {
        bid();
      }
    } 
  }


}
