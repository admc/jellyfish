var assert = require('assert')
  , jellyfish = require('../lib/main');

var ff = jellyfish.createFirefox();

ff.on('command', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

ff.go("http://www.google.com", function(o) {
  ff.js("document.title", function(o) {
    assert.equal(o.result,"Google");
    process.exit();
  })
})