var assert = require('assert')
  , jellyfish = require('../lib/main');

var done = [];

var setDone = function(b) {
  done.push(b);
  if (done.length == 2) {
    process.exit();
  }
};

var test = function(b) {
  b.go("http://www.google.com")
    .js("document.title", function(o) {
      assert.equal(o.result,"Google");
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
      console.log(o.result);
    })
    .jsurl("http://jelly.io/test.js", function(o) { 
      b.stop();
      setDone(b);
    });
};

var firefox = jellyfish.createFirefox();
var chrome = jellyfish.createChrome();
var jsd = jellyfish.createJSDOM();

test(firefox);
test(chrome);
test(jsd);

firefox.on('command', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

firefox.on('output', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

chrome.on('command', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

chrome.on('output', function(cmd, args){
   console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

jsd.on('command', function(cmd, args){
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

jsd.on('output', function(cmd, args){
   console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
