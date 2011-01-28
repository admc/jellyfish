var assert = require('assert')
  , jellyfish = require('../client/jellyfish').jellyfish;

var ff = new jellyfish();

ff.on('command', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

ff.start("firefox",function(o) {
  this.go("http://www.google.com", function(o) {
    this.js("document.title", function(o) {
      assert.equal(o.result,"Google");
      this.stop(function() {
        process.exit();
      })
    })
  })
})