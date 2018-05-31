pragma solidity ^0.4.23;

contract Auction {
  
  string public description;
  string public instructions; // will be used for delivery address or email
  uint public price;
  bool public initialPrice = true; // at first asking price is OK, then +25% required
  uint public timestampEnd;
  address public owner;
  address public winner;
  mapping(address => uint) public bids;

  // TODO - expand time factor
  // a) 24 hours or less before the end
  // b) 4 hours the expansion


  

  event Bid(address indexed winner, uint indexed price, uint indexed timestamp);

  
  modifier onlyOwner { require(owner == msg.sender); _; }
  modifier onlyWinner { require(winner == msg.sender); _; }
  modifier ended { require(timestampEnd > now, "not ended yet"); _; }

  function setDescription(string _description) public onlyOwner() {
    description = _description;
  }

  function setDelivery(string _instructions) public ended() onlyWinner()  {
    instructions = _instructions;
  }

  constructor(uint _price, string _description, uint _timestampEnd) public {
    require(_timestampEnd > now, "end of the auction must be in the future");
    owner = msg.sender;
    price = _price;
    description = _description;
    timestampEnd = _timestampEnd;
  }

  function() public payable {
    if (bids[msg.sender] > 0) { // First we add the bid to an existing bid
      bids[msg.sender] += msg.value;
    } else {
      bids[msg.sender] = msg.value;
    }

    if (initialPrice) {
      require(bids[msg.sender] >= price, "big too low, minimum is the initial price");
    } else {
      require(bids[msg.sender] >= (price * 5 / 4), "big too low, minimum 25% increment");
    }
    
    initialPrice = false;
    price = bids[msg.sender];
    winner = msg.sender;
    emit Bid(winner, price, now);
  }

  function redeem() public ended() onlyOwner() {

  }

}