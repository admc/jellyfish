//browser ONE IS INSANE AND IMPOSSIBLE
var assert = require('assert')
  , jellyfish = require('jellyfish');

var browser = jellyfish.createSelenium();
//browser.opts.browserName = "iexplore";
//browser.opts.version = "9";
browser.on('result', function(res) {
  console.log(firefox.name + ' : '+firefox.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
});

browser.go("http://www.wikipedia.com")
   .js("window.document.title", function(o) {
       console.log(browser.name + ": " + JSON.stringify(o));
       assert.equal(o.result,"Wikipedia")
    })
   .js("window.document.title", function(o) {
     console.log(browser.name + ": " + JSON.stringify(o));
   })
  //  .js("document.getElementById(\'searchInput\').value", function(o) {
  //    console.log(browser.name + ": " + JSON.stringify(o));
  //  })
  //  .js("document.getElementsByName(\'go\')[0].click()", function(o) {
  //    console.log(browser.name + ": click");
  //  })
  // .jsfile("../example_file.js", function(o) {
  //   console.log(browser.name + ": " + JSON.stringify(o));
  //   browser.stop(function() {
  //     setTimeout(process.exit, 2000);
  //   });
  // })