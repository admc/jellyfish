var assert = require('assert')
  , jellyfish = require('jellyfish');

var sauce = jellyfish.createSauce();

sauce.on('command', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});
sauce.on('output', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

sauce.go("http://www.google.com")
  .js("document.title", function(o) {
    assert.equal(o.result,"Google")
  })
  .jsfile("./test.js", function(o) {
    console.log(o)
    sauce.stop(function() {
      process.exit();
    });
  })
  // .user("type", { query:'input[name="q"]', text:'jellyfish'}, function(o) {
  //   console.log(o);
  // })
  // .js("window.$jfQ", function(o) {
  //   console.log(o);
  // })
  // .user("click", { query:'input[name="btnG"]' }, function(o) {
  //   console.log(o);
  // })

  // .jsurl("http://jelly.io/test.js", function(o) { 
  //   console.log(o);
  //   sauce.stop(function() {
  //     process.exit();
  //   });
  // })