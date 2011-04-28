var assert = require('assert')
  , jellyfish = require('jellyfish');

var chrome = jellyfish.createChrome();

chrome.go("http://www.wikipedia.com")
   .js("document.title", function(o) {
     console.log(chrome.name + ": " + JSON.stringify(o));
     assert.equal(o.result,"Wikipedia")
   })
   .js("document.getElementById(\'searchInput\').value = \'test\'", function(o) {
     console.log(chrome.name + ": " + JSON.stringify(o));
   })
   .js("document.getElementById(\'searchInput\').value", function(o) {
     console.log(chrome.name + ": " + JSON.stringify(o));
   })
   .js("document.getElementsByName(\'go\')[0].click()", function(o) {
     console.log(chrome.name + ": click");
   })
  .jsfile("./test.js", function(o) {
    console.log(chrome.name + ": " + JSON.stringify(o));
    chrome.stop(function() {
      setTimeout(process.exit, 2000);
    });
  })