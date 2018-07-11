pragma solidity ^0.4.23;

import "./Auction.sol";

// 1, "something", 1539659548, "0xca35b7d915458ef540ade6068dfe2f44e8fa733c", 3
// 1, "something", 1539659548, "0x315f80C7cAaCBE7Fb1c14E65A634db89A33A9637", 3

contract AuctionMultiple is Auction {

  uint public constant HEAD = 120000000 * 1e18; // uint(-1); // really big number
  uint public constant TAIL = 0;
  uint public lastBidID = 0;
  uint public acceptedBids = 0;
  uint public cutOffBidID = TAIL; // the first one below the treshhold, all above get
  uint public howMany; // number of items to sell, for isntance 40k tickets to a concert
  uint private TEMP = 0; // need to use it when creating new struct
 
  struct Bid {
    uint prev;            // bidID of the previous element.
    uint next;            // bidID of the next element.
    uint value;
    address contributor;  // The contributor who placed the bid.
  }    

  mapping (uint => Bid) public bids; // Map bidID to bid
  mapping (address => uint) public contributors; 
  
  event Withdrawal(address addr, uint value, bool succees);


  event LogNumber(uint number);
  event LogText(string text);
  event LogAddress(address addr);
  
  constructor(uint _price, string _description, uint _timestampEnd, address _beneficiary, uint _howMany) Auction(_price, _description, _timestampEnd, _beneficiary) public {
    emit LogText("constructor");


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

  function() public payable {
    emit LogText("fallback");
    if (msg.value == 0) {
      withdraw();
    } else {
      bid();
    }  
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

          // TODO UPDATE CUTOFF WITDRAWAL BID HERE... ! ! ! ! ! ! ! ! ! ! ! 

        } 

    } else { // bid from this guy does not exist, create a new one
        require(msg.value >= price, "Not much sense sending less than the price, likely an error"); // but it is OK to bid below the cut off bid, some guys may withdraw
        require(lastBidID < 4000, "Due to blockGas limit we limit number of people in the auction to 4000 - round arbitrary number - check test gasLimit folder for more info");

        lastBidID++;
        acceptedBids++;

        insertionBidId = searchInsertionPoint(msg.value, TAIL);

        contributors[msg.sender] = lastBidID;

        bids[lastBidID] = Bid({
          prev: insertionBidId,
          next: bids[insertionBidId].next,
          value: msg.value,
          contributor: msg.sender
        });

        bids[ bids[insertionBidId].next ].prev = lastBidID;
        bids[insertionBidId].next = lastBidID;

        if (msg.value >= bids[cutOffBidID].value && acceptedBids >= howMany) { // the moment acceptedBids == howMany the last accepted bid becomes cutOffBid
          cutOffBidID = bids[cutOffBidID].next;
        }

    }
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

    while (currentBid.prev != bidId) { // BIG LOOP WARNING ! ! ! ! ! ! ! ! !
      currentBid = bids[currentBid.prev];
      position++;
    }
    return position;
  }

  // shorthand for calling without parameters
  function getPosition() view public returns(uint) {
    return getPosition(msg.sender);
  }

  // CODE REVIEW / AUDIT PLEASE
  // What is the best practice here?
  // An option would be:
  // require(myBid.value < cutOffBid.value, "only the non-winning bids can be withdrawn")

  function fuckme() public {
    emit LogText("fuckme");
  }

  function withdraw() public returns (bool) {
    emit LogText("withdraw");

    bool result = withdraw(msg.sender);
    return result;
  }

  function withdraw(address addr) private returns (bool) {
    uint myBidId = contributors[addr];

    require(myBidId > 0, "the guy with this address does not exist, makes no sense to witdraw");

    Bid memory myBid = bids[ myBidId ];
    Bid memory cutOffBid = bids[cutOffBidID];
    if (myBid.value < cutOffBid.value) { // below treshhold, can withdraw

      bids[ myBid.prev ].next = myBid.next;
      bids[ myBid.next ].prev = myBid.prev;

      delete bids[ myBidId ]; // clearning storage
      delete contributors[ msg.sender ]; // clearning storage

      acceptedBids--;

      addr.transfer(myBid.value);
      emit Withdrawal(addr, myBid.value, true);
      return true; // returning value so that we can test
    } else {
      emit Withdrawal(addr, myBid.value, false);
      return false;
    }
  }

  function withdrawOnBehalf(address addr) public onlyOwner returns (bool){
    bool result = withdraw(addr);
    return result;
  }

  function finalize() public ended() onlyOwner() {
    require(finalized == false, "can withdraw only once");
    require(initialPrice == false, "can withdraw only if there were bids");

    finalized = true;
    beneficiary.transfer(1); // TODO: calculate amount to witdraw
  }


}
