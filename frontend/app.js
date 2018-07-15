var app = angular.module('app', [])

app.run(function($rootScope) {
  var address = "0x2328bc22d5705b2cde99e02a780e2fecdca4ad6b"; // https://ropsten.etherscan.io/address/0x2328bc22d5705b2cde99e02a780e2fecdca4ad6b
  var ABI = [{"constant":true,"inputs":[],"name":"timestampEnd","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"howManyGuaranteed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"addr","type":"address"}],"name":"getPosition","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"bid","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"HEAD","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"initialPrice","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"contributors","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"instructions","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"beneficiary","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"bids","outputs":[{"name":"prev","type":"uint256"},{"name":"next","type":"uint256"},{"name":"value","type":"uint256"},{"name":"contributor","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getGuaranteedContributorsLenght","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"finalize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"refundOnBehalf","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"lastBidID","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"howMany","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"bids","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"guaranteedContributors","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"increaseTimeIfBidBeforeEnd","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"description","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getPosition","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_description","type":"string"}],"name":"setDescription","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"_contribution","type":"uint256"},{"name":"_startSearch","type":"uint256"}],"name":"searchInsertionPoint","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"LIMIT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"finalized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"priceGuaranteed","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"getAccountListLenght","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"TAIL","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"increaseTimeBy","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"accountsList","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"winner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"guaranteedContributions","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_instructions","type":"string"}],"name":"setInstructions","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_price","type":"uint256"},{"name":"_description","type":"string"},{"name":"_timestampEnd","type":"uint256"},{"name":"_beneficiary","type":"address"},{"name":"_howMany","type":"uint256"},{"name":"_howManyGuaranteed","type":"uint256"},{"name":"_priceGuaranteed","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"GuaranteedBid","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"number","type":"uint256"}],"name":"LogNumber","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"text","type":"string"}],"name":"LogText","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"}],"name":"LogAddress","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"bidder","type":"address"},{"indexed":true,"name":"price","type":"uint256"},{"indexed":true,"name":"timestamp","type":"uint256"}],"name":"BidEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"addr","type":"address"},{"indexed":true,"name":"value","type":"uint256"},{"indexed":true,"name":"timestamp","type":"uint256"}],"name":"Refund","type":"event"}];


  if (typeof web3 !== 'undefined') {
    web3 = new Web3(web3.currentProvider);
  } else {
    web3 = new Web3(new Web3.providers.HttpProvider("https://ropsten.infura.io/hi8olE2lF8OqjyBSdtSm "));
  }

  $rootScope.metamask = web3.currentProvider.isMetaMask;

  $rootScope.contract = web3.eth.contract(ABI).at(address);
});

app.controller('ctrl', function($scope, $q) {

	$scope.accounts = [];
	$scope.bids = [];


  // struct Bid {
  //   uint prev;            // bidID of the previous element.
  //   uint next;            // bidID of the next element.
  //   uint value;
  //   address contributor;  // The contributor who placed the bid.
  // }  

	

  $scope.contract.getAccountListLenght(function(err, res) {

    lenght = res.toNumber() + 1; // because we have HEAD and TAIL we do some shananigans here

    for (i=0; i<lenght; i++) {
      $scope.contract.bids(i, function(err2, res2) {

        console.log(res2);

        if(res2[3] === "0x0000000000000000000000000000000000000000") return; // HEAD and TAIL shenanigans again

        var account = {
          address: res2[3],
          bid: +web3.fromWei(res2[2].toNumber()) // BigNumber to Number to Ether to digits...
        }

        $scope.accounts.push(account);  
        $scope.$apply(); // THINKING: promises, $apply only once towards the end

      });
    }


  })




  let bidEvent = $scope.contract.BidEvent({}, {fromBlock: 0, toBlock: 'latest'})
  bidEvent.get(function(error, events) {

    console.log(events);

  	events.forEach(function(event) {
  		var bid = {
  			bidder: event.args.bidder,
  			price: +web3.fromWei( event.args.price.toNumber() ),
  			timestamp: event.args.timestamp.toNumber(),
  			tx: event.transactionHash,
  			block: event.blockNumber
  		}
  		$scope.bids.push(bid);
  	});

  	$scope.$apply();
  });

  // TODO: display popup as new bid is incoming
  // BidEvent = Instance.BidEvent();
  // BidEvent.watch(function(error, result){
  //  console.log(error, result);
  // });



});
