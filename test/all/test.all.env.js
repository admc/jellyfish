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
      console.log("\x1b[36m"+b.name + '\x1b[0m : '+b.tid + ' - \x1b[33mStopped\x1b[0m');
      b.stop();
    })
};

var browsers = [];
browsers.push(jellyfish.createFirefox());
browsers.push(jellyfish.createChrome());
browsers.push(jellyfish.createSafari());
browsers.push(jellyfish.createSauce());
browsers.push(jellyfish.createWebdriver());
browsers.push(jellyfish.createZombie());

browsers.forEach(function(o) {
  o.on('result', function(res) {
    console.log("\x1b[36m"+o.name + '\x1b[0m : '+o.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
  });
  test(o);
});