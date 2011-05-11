var assert = require('assert')
  , jellyfish = require('jellyfish');

var test = function(b) {
  b.js("document.title", function(o) {
      assert.equal(o.result,"Jelly.io: Jellyfish Home")
    })
    .js("document.getElementsByClassName(\'code\').length")
    .js("window.location.href")
    .jsfile("../stub/example_file.js", function(o) {
      b.stop(function() {
        console.log(b.name + ' : '+b.tid + ' - \x1b[33m%s\x1b[0m', 'Stopped');
      });
    })
};

var browsers = [];
var url = "http://localhost"
browsers.push(jellyfish.createFirefox(url));
browsers.push(jellyfish.createChrome(url));
//browsers.push(jellyfish.createSafari(url)); //interface issue with safari working locally
browsers.push(jellyfish.createSauce("http://jelly.io"));
browsers.push(jellyfish.createWebdriver(url));
browsers.push(jellyfish.createZombie(url));

browsers.forEach(function(o) {
  o.on('result', function(res) {
    console.log(o.name + ' : '+o.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
  });
  test(o);
});