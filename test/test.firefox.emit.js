var assert = require('assert')
  , jellyfish = require('jellyfish');

var firefox = jellyfish.createFirefox();

firefox.on('result', function(res) {
  console.log(firefox.name + ' : '+firefox.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
});

firefox.go("http://www.wikipedia.com")
  .js("document.title")
  .js("document.getElementById(\'searchInput\').value = \'test\'")
  .js("document.getElementById(\'searchInput\').value")
  .js("document.getElementsByName(\'go\')[0].click()")
  .jsfile("./test.js", function(o) {
    firefox.stop(function() {
      setTimeout(process.exit, 2000);
    });
  })