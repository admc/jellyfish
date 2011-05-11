var assert = require('assert')
  , jellyfish = require('jellyfish');

var test = function(b) {
  b.go("http://www.wikipedia.com")
    .js("document.title", function(o) {
      assert.equal(o.result,"Wikipedia")
    })
    .js("document.getElementById(\'searchInput\').value = \'test\'")
    .js("document.getElementById(\'searchInput\').value")
    .js("document.getElementsByName(\'go\')[0].click()")
    .jsfile("../stub/example_file.js", function(o) {
      b.stop(function() {
        console.log(b.name + ' : '+b.tid + ' - \x1b[33m%s\x1b[0m', 'Stopped');
      });
    })
}

for (var x=0;x<5;x++) {
  var url = "http://www.google.com";
  var browsers = [];
  
  browsers.push(jellyfish.createChrome(url));
  browsers.push(jellyfish.createFirefox(url));
  browsers.push(jellyfish.createSauce(url));
  browsers.push(jellyfish.createWebdriver(url));
  browsers.push(jellyfish.createZombie(url));
  
  browsers.forEach(function(o) {
    console.log(o.name + ' : '+o.tid + ' - \x1b[33m%s\x1b[0m', 'Started');
    o.on('result', function(res) {
      console.log(o.name + ' : '+o.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
    });
    test(o);
  });
}
