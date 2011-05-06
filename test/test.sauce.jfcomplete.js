var assert = require('assert')
  , jellyfish = require('jellyfish');

var firefox = jellyfish.createSauce();
firefox.opts.platform = "VISTA";
firefox.opts.browserName = "iexplore";
firefox.opts.version = "9";

firefox.on('result', function(res) {
  console.log(firefox.name + ' : '+firefox.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
});

firefox.on('complete', function(res) {
  console.log(firefox.name + ' : '+firefox.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
   firefox.stop(function() {
    setTimeout(process.exit, 2000);
   })
});

firefox.go("http://www.wikipedia.com")
  .js("document.title")
  .js("document.getElementById(\'searchInput\').value = \'test\'")
  .js("document.getElementById(\'searchInput\').value")
  .js("window.jfComplete=true;")
