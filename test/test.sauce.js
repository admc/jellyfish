var assert = require('assert')
  , jellyfish = require('jellyfish');

var sauce = jellyfish.createSauce();
sauce.opts.platform = "WINDOWS";
sauce.opts.browserName = "iexplore";
sauce.opts.version = "8";

sauce.go("http://www.wikipedia.com")
   .js("document.title", function(o) {
     console.log(sauce.name + ": " + JSON.stringify(o));
     assert.equal(o.result,"Wikipedia")
   })
   .js("document.getElementById(\'searchInput\').value = \'test\'", function(o) {
     console.log(sauce.name + ": " + JSON.stringify(o));
   })
   .js("document.getElementById(\'searchInput\').value", function(o) {
     console.log(sauce.name + ": " + JSON.stringify(o));
   })
   .js("document.getElementsByName(\'go\')[0].click()", function(o) {
     console.log(sauce.name + ": click");
   })
  .jsfile("./test.js", function(o) {
    console.log(sauce.name + ": " + JSON.stringify(o));
    sauce.stop(function() {
      setTimeout(process.exit, 2000);
    });
  })