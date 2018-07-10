pragma solidity ^0.4.23;

import "./AuctionMultiple.sol";

// 1, "something", 1529659548, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 3

contract AuctionMultipleGuaranteed is AuctionMultiple {

  uint public howManyGuaranteed;
  uint public priceGuaranteed;
  uint public howManyLeft; // after guaranteed slots are used, we decrease the number of slots available
  mapping (address => uint) public guaranteedContributors;
  
  constructor(uint _price, string _description, uint _timestampEnd, address _beneficiary, uint _howMany, uint _howManyGuaranteed, uint _priceGuaranteed) AuctionMultiple(_price, _description, _timestampEnd, _beneficiary, _howMany) public {
    require(_howMany > _howManyGuaranteed, "The number of guaranteed items should be less than total items, otherwise impossible or fixed price sell");
    require(_priceGuaranteed > 0, "Guranteed price must be greated than zero");

    howManyGuaranteed = _howManyGuaranteed;
    priceGuaranteed = _priceGuaranteed;
  }

  function() public payable {

    if (msg.value == 0) {
      // TODO: withdraw
    } else {
      
      // Situation when someone has already guaranteed place and bids anyway
      if (guaranteedContributors[msg.sender] > 0) return; // THINK: error? log? something else?

      uint myBidId = contributors[msg.sender];
      uint insertionBidId;
      
      if (myBidId > 0) { // sender has already placed bid, we increase the existing one
          
          Bid storage existingBid = bids[myBidId];
          existingBid.value = existingBid.value + msg.value;
          if (existingBid.value > bids[existingBid.next].value) { // else do nothing (we are lower than the next one)
            insertionBidId = searchInsertionPoint(existingBid.value, existingBid.next);

            bids[existingBid.prev].next = existingBid.next;
            bids[existingBid.next].prev = existingBid.prev;

            existingBid.prev = insertionBidId;
            existingBid.next = bids[insertionBidId].next;

            bids[ bids[insertionBidId].next ].prev = myBidId;
            bids[insertionBidId].next = myBidId;
          } 

      } else { // bid from this guy does not exist, create a new one
          ++lastBidID;

          contributors[msg.sender] = lastBidID;

          insertionBidId = searchInsertionPoint(msg.value, TAIL);

          bids[lastBidID] = Bid({
            prev: insertionBidId,
            next: bids[insertionBidId].next,
            value: msg.value,
            contributor: msg.sender
          });

          bids[ bids[insertionBidId].next ].prev = lastBidID;
          bids[insertionBidId].next = lastBidID;
      }


    }
        
  }


}
