//SELENIUM ONE IS INSANE AND IMPOSSIBLE
var assert = require('assert')
  , jellyfish = require('jellyfish');

var selenium = jellyfish.createSelenium();
//selenium.opts.browserName = "iexplore";
//selenium.opts.version = "9";

selenium.go("http://www.wikipedia.com")
   .js("window.document.title", function(o) {
       console.log(selenium.name + ": " + JSON.stringify(o));
       assert.equal(o.result,"Wikipedia")
    })
   .js("window.document.title", function(o) {
     console.log(selenium.name + ": " + JSON.stringify(o));
   })
  //  .js("document.getElementById(\'searchInput\').value", function(o) {
  //    console.log(selenium.name + ": " + JSON.stringify(o));
  //  })
  //  .js("document.getElementsByName(\'go\')[0].click()", function(o) {
  //    console.log(selenium.name + ": click");
  //  })
  // .jsfile("./test.js", function(o) {
  //   console.log(selenium.name + ": " + JSON.stringify(o));
  //   selenium.stop(function() {
  //     setTimeout(process.exit, 2000);
  //   });
  // })