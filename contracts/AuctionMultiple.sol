pragma solidity ^0.4.23;

import "./Auction.sol";

// 1, "something", 1539659548, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 3
// 1, "something", 1539659548, "0x315f80C7cAaCBE7Fb1c14E65A634db89A33A9637", 3

contract AuctionMultiple is Auction {

  uint public constant LIMIT = 2000; // due to gas restrictions we limit the number of participants in the auction (no Burning Man tickets yet)
  uint public constant HEAD = 120000000 * 1e18; // uint(-1); // really big number
  uint public constant TAIL = 0;
  uint public lastBidID = 0;  
  uint public howMany; // number of items to sell, for isntance 40k tickets to a concert

  struct Bid {
    uint prev;            // bidID of the previous element.
    uint next;            // bidID of the next element.
    uint value;
    address contributor;  // The contributor who placed the bid.
  }    

  mapping (uint => Bid) public bids; // map bidID to actual Bid structure
  mapping (address => uint) public contributors; // map address to bidID
  
  event LogNumber(uint number);
  event LogText(string text);
  event LogAddress(address addr);
  
  constructor(uint _price, string _description, uint _timestampEnd, address _beneficiary, uint _howMany) Auction(_price, _description, _timestampEnd, _beneficiary) public {
    require(_howMany > 1, "This auction is suited to multiple items. With 1 item only - use different code. Or remove this 'require' - you've been warned");
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
  }

  function bid() public payable {
    require(now < timestampEnd, "cannot bid after the auction ends");

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
      require(msg.value >= price, "Not much sense sending less than the price, likely an error"); // but it is OK to bid below the cut off bid, some guys may withdraw
      require(lastBidID < LIMIT, "Due to blockGas limit we limit number of people in the auction to 4000 - round arbitrary number - check test gasLimit folder for more info");

      lastBidID++;

      insertionBidId = searchInsertionPoint(msg.value, TAIL);

      contributors[msg.sender] = lastBidID;
      accountsList.push(msg.sender);

      bids[lastBidID] = Bid({
        prev: insertionBidId,
        next: bids[insertionBidId].next,
        value: msg.value,
        contributor: msg.sender
      });

      bids[ bids[insertionBidId].next ].prev = lastBidID;
      bids[insertionBidId].next = lastBidID;
    }

    emit BidEvent(msg.sender, msg.value, now);
  }

  function refund(address addr) private {
    uint bidId = contributors[addr];
    require(bidId > 0, "the guy with this address does not exist, makes no sense to witdraw");
    uint position = getPosition(addr);
    require(position > howMany, "only the non-winning bids can be withdrawn");

    Bid memory thisBid = bids[ bidId ];
    bids[ thisBid.prev ].next = thisBid.next;
    bids[ thisBid.next ].prev = thisBid.prev;

    delete bids[ bidId ]; // clearning storage
    delete contributors[ msg.sender ]; // clearning storage
    // cannot delete from accountsList - cannot shrink an array in place without spending shitloads of gas

    addr.transfer(thisBid.value);
    emit Refund(addr, thisBid.value, now);
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

    beneficiary.transfer(sumContributions);
  }

  // We are  starting from TAIL and going upwards
  // This is to simplify the case of increasing bids (can go upwards, cannot go lower)
  // NOTE: blockSize gas limit in case of so many bids (wishful thinking)
  function searchInsertionPoint(uint _contribution, uint _startSearch) view public returns (uint) {
    require(_contribution > bids[_startSearch].value, "your contribution and _startSearch does not make sense, it will search in a wrong direction");

    Bid memory lowerBid = bids[_startSearch];
    Bid memory higherBid;

    while(true) { // it is guaranteed to stop as we set the HEAD bid with very high maximum valuation
      higherBid = bids[lowerBid.next];

      if (_contribution < higherBid.value) {
        return higherBid.prev;
      } else {
        lowerBid = higherBid;
      }
    }
  }

  function getPosition(address addr) view public returns(uint) {
    uint bidId = contributors[addr];
    require(bidId != 0, "cannot ask for a position of a guy who is not on the list");
    uint position = 1;

    Bid memory currentBid = bids[HEAD];

    while (currentBid.prev != bidId) { // BIG LOOP WARNING, that why we have LIMIT
      currentBid = bids[currentBid.prev];
      position++;
    }
    return position;
  }

  function getPosition() view public returns(uint) { // shorthand for calling without parameters
    return getPosition(msg.sender);
  }

}
