var eth = {};

// https://ropsten.etherscan.io/address/0x3bf530b7a5a1f2235f9a1c6518a6c26672bb6163#code
eth.address = "0x3BF530b7A5a1f2235f9A1C6518A6C26672BB6163";

eth.ABI = [{"constant":true,"inputs":[],"name":"timestampEnd","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"bid","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":true,"inputs":[],"name":"initialPrice","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"instructions","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"beneficiary","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[],"name":"finalize","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[{"name":"addr","type":"address"}],"name":"refundOnBehalf","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":false,"inputs":[],"name":"refund","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"bids","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"increaseTimeIfBidBeforeEnd","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"description","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"owner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_description","type":"string"}],"name":"setDescription","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"price","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"finalized","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"increaseTimeBy","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"accountsList","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"winner","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"_instructions","type":"string"}],"name":"setInstructions","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"inputs":[{"name":"_price","type":"uint256"},{"name":"_description","type":"string"},{"name":"_timestampEnd","type":"uint256"},{"name":"_beneficiary","type":"address"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"bidder","type":"address"},{"indexed":true,"name":"price","type":"uint256"},{"indexed":true,"name":"timestamp","type":"uint256"}],"name":"BidEvent","type":"event"},{"anonymous":false,"inputs":[{"indexed":false,"name":"addr","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"timestamp","type":"uint256"}],"name":"Refund","type":"event"}];

var Instance;
var BidEvent;

window.addEventListener('load', function() {
  if (typeof web3 !== 'undefined') {          
    web3js = new Web3(web3.currentProvider);// Use Mist/MetaMask's provider

    if(! web3.eth.accounts[0]) {
      $("#metamask-locked").show();
    } else {
      $("#angular-app").show();
    }
  } else {
    $("#metamask-notloaded").show();
  }


  var networkDetected = false;
  web3.version.getNetwork((err, netId) => {
    networkDetected = true;

    console.log("getNetwork: " + netId);

    switch (netId) {
      case "1":
        console.log('This is mainnet')
        break
      case "2":
        console.log('This is the deprecated Morden test network.')
        break
      case "3":
        console.log('This is the ropsten test network.')
        break
      case "4":
        console.log('This is the Rinkeby test network.')
        break
      case "42":
        console.log('This is the Kovan test network.')
        break
      default:
        console.log('This is an unknown network.')
    }
  });

  setTimeout(function() {
    if (networkDetected === false) {
      alert("Could not detect the network, can you check you are online?");
    }
  }, 5000);

  var account = web3.eth.accounts[0];
  var accountInterval = setInterval(function() {
    if (web3.eth.accounts[0] !== account) {
      if (web3.eth.accounts[0] && !account) { // transition from a state where there was no account and now there isn't
        $("#metamask-locked .locked").hide();
        $("#metamask-locked .unlocked").show();
      } else if (!web3.eth.accounts[0]) {
        alert("account locked");       
      } else {
        alert("change");
      }
      account = web3.eth.accounts[0];
    }
  }, 100); // long polling, not sure what is the best technique here...

  web3.eth.defaultAccount = web3.eth.accounts[0];
  var Contract = web3.eth.contract(eth.ABI);
  Instance = Contract.at(eth.address);
  

  angular.bootstrap(angular.element("#angular-app")[0], ['app']); // https://stackoverflow.com/questions/16537783/which-method-should-i-use-to-manually-bootstrap-my-angularjs

});


// OPTIONALLY
// window.onbeforeunload = function(e) {
//   var dialogText = 'Screw the MetaMask';
//   e.returnValue = dialogText;
//   return dialogText;
// };