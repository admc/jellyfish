var assert = require('assert')
  , jellyfish = require('jellyfish');

var browser = jellyfish.createFirefox();

browser.on('result', function(res) {
  console.log(browser.name + ' : '+browser.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
});

browser.on('complete', function(res) {
  console.log(browser.name + ' : '+browser.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
  browser.js("document.location.href", function() {
    browser.stop(function() {
      setTimeout(process.exit, 2000);
    })
  })
});

browser.go("http://www.wikipedia.com")
  .js("document.title")
  .js("document.getElementById(\'searchInput\').value = \'test\'")
  .js("document.getElementById(\'searchInput\').value")
  .js("window.jfComplete=true;")
