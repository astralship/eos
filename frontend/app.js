var app = angular.module('app', [])

app.controller('ctrl', function($scope, $q) {

	$scope.myAccount = web3.eth.accounts[0];
	$scope.accounts = [];
	$scope.bids = [];


	// List of all accounts
	// Different than list of all bids
	// Single account can do multiple bids

	lenght = 2;

	for (i=0; i<lenght; i++) {
		Instance.accountsList(i, function(err2, res2) {
			var promise = Instance.bids(res2, function(err3, res3) {
				var account = {
					address: res2,
					bid: +web3.fromWei(res3.toNumber()) // BigNumber to Number to Ether to digits...
				}
				$scope.accounts.push(account);
				$scope.$apply(); // THINKING: promises, $apply only once towards the end
			});

		});
	}


  BidEvent = Instance.BidEvent();
  BidEvent.watch(function(error, result){
   console.log(error, result);
  });

  let bigEvent = Instance.BidEvent({}, {fromBlock: 0, toBlock: 'latest'})
  bigEvent.get(function(error, logs) {

  	var bid = {
  		
  	}
    // we have the logs, now print them
    logs.forEach(log => console.log(log.args))
  });



});
