pragma solidity ^0.4.23;

import "./Auction.sol";

// 1, "something", 1529659548, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 3

contract AuctionMultiple is Auction {


  uint constant HEAD = uint(-1); // really big number
  uint constant TAIL = 0;
  uint public lastBidID = 0;
  uint private TEMP = 0; // need to use it when creating new struct
 
  struct Bid {
      uint prev;            // bidID of the previous element.
      uint next;            // bidID of the next element.
      uint value;
      address contributor;  // The contributor who placed the bid.
  }    

  mapping (uint => Bid) public bids; // Map bidID to bid
  mapping (address => uint) public contributors; 
    
  uint public howMany; // number of items to sell, for isntance 40k tickets to a concert

  event LogNumber(uint number);
  
  constructor(uint _price, string _description, uint _timestampEnd, address _beneficiary, uint _howMany) Auction(_price, _description, _timestampEnd, _beneficiary) public {
    howMany = _howMany;

    bids[HEAD] = Bid({
        prev: TAIL,
        next: TAIL,
        value: HEAD,
        contributor: address(0)
    });
    bids[TAIL] = Bid({
        prev: HEAD,
        next: HEAD,
        value: TAIL,
        contributor: address(0)
    });    

    emit LogNumber(HEAD);
  }

  function() public payable {

    if (msg.value == 0) {
      // TODO: withdraw
    } else {
      uint myBidId = contributors[msg.sender];
      uint insertionBidId;
      

      if (myBidId > 0) { // sender has already placed bid, we increase the existing one
          Bid storage existingBid = bids[myBidId];
          existingBid.value = existingBid.value + msg.value;
          if (existingBid.value > bids[existingBid.next].value) { // else do nothing (we are lower than the next one)
            insertionBidId = searchInsertionPoint(existingBid.value, existingBid.next);

            existingBid.prev = insertionBidId;
            existingBid.next = bids[insertionBidId].next;

            bids[insertionBidId].next = myBidId;
            bids[existingBid.next].prev = lastBidID;


          } 

      } else { // bid from this guy does not exist, create a new one
          ++lastBidID;
          
          bids[lastBidID] = Bid({
            value: msg.value,
            contributor: msg.sender,
            prev: TEMP,
            next: TEMP
          });

          Bid storage myBid = bids[lastBidID];

          insertionBidId = searchInsertionPoint(myBid.value, TAIL);

          myBid.prev = insertionBidId;
          myBid.next = bids[insertionBidId].next;

          bids[insertionBidId].next = lastBidID;
          bids[myBid.next].prev = lastBidID;
      }


    }
        
  }

  // function submitBid(uint _maxValuation, uint _next) public payable {
  //   Bid storage nextBid = bids[_next];
  //   uint prev = nextBid.prev;
  //   Bid storage prevBid = bids[prev];
  //   require(_maxValuation >= prevBid.maxValuation && _maxValuation < nextBid.maxValuation); // The new bid maxValuation is higher than the previous one and strictly lower than the next one.
  //   require(now >= startTime && now < endTime); // Check that the bids are still open.

  //   ++lastBidID; // Increment the lastBidID. It will be the new bid's ID.
  //   // Update the pointers of neighboring bids.
  //   prevBid.next = lastBidID;
  //   nextBid.prev = lastBidID;

  //   // Insert the bid.
  //   bids[lastBidID] = Bid({
  //       prev: prev,
  //       next: _next,
  //       maxValuation: _maxValuation,
  //       contrib: msg.value,
  //       bonus: bonus(),
  //       contributor: msg.sender,
  //       withdrawn: false,
  //       redeemed: false
  //   });

  //   // Add the bid to the list of bids by this contributor.
  //   contributorBidIDs[msg.sender].push(lastBidID);

  //   // Emit event
  //   emit BidSubmitted(msg.sender, lastBidID, now);
  // }


  // function searchAndBid(uint _maxValuation, uint _next) public payable {
  //   submitBid(_maxValuation, search(_maxValuation,_next));
  // }

  // We are always starting from TAIL and going upwards
  // This is to simplify the case of increasing bids (can go upwards, cannot go lower)
  // NOTE: blockSize gas limit in case of so many bids (wishful thinking)
  function searchInsertionPoint(uint _contribution, uint _startSearch) view public returns (uint) {
    require(_contribution > bids[_startSearch].value, "your contribution and _startSearch does not make sense, it will search in a wrong direction");

    Bid storage lowerBid = bids[_startSearch];
    Bid storage higherBid;

    while(true) { 
      higherBid = bids[lowerBid.next];

      if (higherBid.value > _contribution) {
        return higherBid.prev;
      } else {
        lowerBid = higherBid;
      }
    }
  }



}
