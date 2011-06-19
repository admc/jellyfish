var jellyfish = require('jellyfish')
  , assert = require('assert')
  ;
  
var sauce = jellyfish.createSauce();
sauce.opts.platform = "VISTA";
sauce.opts.browserName = "iexplore";
sauce.opts.version = "9";

sauce.on('result', function(res) {
  console.log(sauce.name + ' : '+sauce.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
});

sauce.on('complete', function(res) {
  console.log(sauce.name + ' : '+sauce.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
  sauce.js("window.testOutput", function(o) {
    try {
      assert.equal(o.result.failed, 0);
      sauce.stop(function() {
       process.exit(0);
      })
    }
    catch(e) {
      console.log(e);
      sauce.stop(function() {
       process.exit(1);
      })
    }
  })
});

sauce.go("http://adamchristian.com/jquery/test/index.html")
  .js("QUnit.done = function(res) {window.testOutput=res;window.jfComplete=true;}")
  ;