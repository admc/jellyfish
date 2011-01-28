var assert = require('assert')
  , jellyfish = require('../client/jellyfish').jellyfish;

var ff = new jellyfish("firefox");

ff.on('command', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

ff.go("http://www.google.com")
  .js("document.title", function(o) {
    assert.equal(o.result,"Google")
  })
  .user("type", { name:'q', text:'moo'}, function(o){
    console.log(o.result);
  })
  .user("click", { name:'btnG' }, function(o){
    console.log(o.result);
  })
  .jsfile("./test.js", function(o) {
    console.log(o.result)
  })
  .jsurl("http://jelly.io/test.js", function(o) { 
    console.log(o.result);
  })
  .stop(function(o) {
    process.exit();
  });