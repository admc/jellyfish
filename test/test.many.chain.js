var assert = require('assert')
  , jellyfish = require('../lib/main');

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
    .jsurl("http://jelly.io/test.js", function(o){
      b.stop();
    })
}

for (var x=0;x<8;x++) {
  var b = jellyfish.createFirefox();

  b.on('command', function(cmd, args){
    console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
  });
  
  b.on('output', function(cmd, args){
    console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
  });
  test(b);
  
  var c = jellyfish.createChrome();
    
  c.on('command', function(cmd, args){
    console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
  });
  
  c.on('output', function(cmd, args){
     console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
   });
  
  test(c);
}

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});