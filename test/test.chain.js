var assert = require('assert')
  , jellyfish = require('../client/jellyfish');

var ff = new jellyfish.init("firefox");

ff.on('command', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

ff.go("http://www.google.com")
  .js("document.title", function(o) {
    assert.equal(o.result,"Google")
  })
  .user("type", { name:'q', text:'moo'})
  .user("click", { name:'btnG' })
  .jsfile("./test.js", function(o) {
    console.log(o.result)
  })
  .jsurl("http://jelly.io/test.js", function(o) { 
    console.log(o.result);
  })
  .stop(function(o) {
    process.exit();
  });