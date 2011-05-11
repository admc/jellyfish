var assert = require('assert')
  , jellyfish = require('jellyfish');

var done = [];
var test = function(b) {
  b.go("http://www.wikipedia.com")
    .js("document.title", function(o) {
      assert.equal(o.result,"Wikipedia")
    })
    .js("document.getElementById(\'searchInput\').value = \'test\'")
    .js("document.getElementById(\'searchInput\').value")
    .js("document.getElementsByName(\'go\')[0].click()")
    .jsfile("../stub/example_file.js", function(o) {
      b.stop();
    })
};

var browsers = [];
browsers.push(jellyfish.createFirefox(function(o) { o.couch() }));
browsers.push(jellyfish.createChrome(function(o) { o.couch() }));
browsers.push(jellyfish.createZombie(function(o) { o.couch() }));
browsers.push(jellyfish.createSafari(function(o) { o.couch() }));
browsers.push(jellyfish.createSauce(function(o) { o.couch() }));
browsers.push(jellyfish.createWebdriver(function(o) { o.couch() }));

browsers.forEach(function(o) {
  o.on('result', function(res) {
    console.log(firefox.name + ' : '+firefox.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
  });
  test(o);
});