var assert = require('assert')
  , jellyfish = require('jellyfish');

var firefox = jellyfish.createFirefox();

firefox.go("http://www.google.com")
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
    firefox.stop(function() {
      setTimeout(process.exit, 2000);
    });
  })