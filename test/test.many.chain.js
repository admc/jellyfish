var assert = require('assert')
  , jellyfish = require('../client/jellyfish').jellyfish;

var test = function(b) {
  b.go("http://www.google.com")
    .js("document.title", function(o) {
      console.log(o.result);
      assert.equal(o.result,"Google")
    })
    .user("type", { name:'q', text:'moo'})
    .user("click", { name:'btnG' })
    .jsfile("./test.js", function(o) {
      console.log(o.result)
    })
    .jsurl("http://jelly.io/test.js")
    .stop();
}

for (var x=0;x<4;x++) {
  var b = new jellyfish("firefox");
  var c = new jellyfish("chrome");

  b.on('command', function(cmd, args){
    console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
  });
  
  c.on('command', function(cmd, args){
    console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
  });

  test(b);
  test(c);
  
}
