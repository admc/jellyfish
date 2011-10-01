var assert = require('assert')
  , jellyfish = require('jellyfish');

var browser = jellyfish.createSauce();
browser.opts.platform = "WINDOWS";
browser.opts.browserName = "iexplore";
browser.opts.version = "8";
browser.opts.name = "Jellyfish test for iexplorer 8";

browser.on('result', function(res) {
  console.log(browser.name + ' : '+browser.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
});

browser.go("http://www.wikipedia.com")
   .js("document.title")
   .js("document.getElementById(\'searchInput\').value = \'test\'")
   .js("document.getElementById(\'searchInput\').value")
   .js("document.getElementsByName(\'go\')[0].click()")
   .jsfile("../stub/example_file.js", function(o) {
    browser.stop(function() {
      setTimeout(process.exit, 2000);
    });
   })