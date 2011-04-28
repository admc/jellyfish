var assert = require('assert')
  , jellyfish = require('jellyfish');

var test = function(b) {
  b.go("http://www.google.com")
    .js("document.title", function(o) {
      console.log(o);
      assert.equal(o.result,"Google")
    })
    .js("document.getElementsByName(\'q\')[0].value = \'test\'", function(o) {
      console.log(o);
    })
    .js("document.getElementsByName(\'q\')[0].value", function(o) {
      console.log(o);
    })
    .jsfile("./test.js", function(o) {
      console.log(o);
      b.stop(function() {
        setTimeout(process.exit, 2000);
      });
    })
}

for (var x=0;x<2;x++) {
  var browsers = [];
  var url = "http://www.jelly.io";

  browsers.push(jellyfish.createFirefox(url));
  browsers.push(jellyfish.createChrome(url));
  browsers.push(jellyfish.createZombie(url));
  browsers.push(jellyfish.createSauce(url));

  browsers.forEach(function(o) {
    test(o);
  });
}