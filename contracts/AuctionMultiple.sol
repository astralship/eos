pragma solidity ^0.4.23;

import "./Auction.sol";

contract AuctionMultiple is Auction {

  uint public howMany;
  

  constructor(uint _price, string _description, uint _timestampEnd, address _beneficiary, uint _howMany) 
    Auction(_price, _description, _timestampEnd, _beneficiary) public {
    howMany = _howMany;
  }


}
