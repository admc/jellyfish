var assert = require('assert')
  , jellyfish = require('jellyfish');

var jd = jellyfish.createZombie();

jd.on('command', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

jd.go("http://www.google.com")
  .js("document.title", function(o) {
    assert.equal(o.result,"Google")
  })
  .user("type", { query:'input[name="q"]', text:'moo'}, function(o) {
    console.log(o.result);
  })
  .js("$jfQ('input[name=\"q\"]')[0].value", function(o) {
    console.log(o.result);
  })
  .user("click", { query:'input[name="btnG"]' }, function(o) {
    console.log(o.result);
  })
  .jsfile("./test.js", function(o) {
    console.log(o.result)
  })
  .jsurl("http://jelly.io/test.js", function(o) { 
    console.log(o.result);
    process.exit();
  })