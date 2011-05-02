var assert = require('assert')
  , jellyfish = require('jellyfish');

var log = function(cmd, args) {
  console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args.join(', '));
}

var test = function(b) {
  b.js("document.title", function(o) {
      log(b.name , [b.tid, JSON.stringify(o)]);
      assert.equal(o.result,"Jelly.io: Jellyfish Home")
    })
    .js("document.getElementsByClassName(\'code\').length", function(o) {
      log(b.name , [b.tid, JSON.stringify(o)]);
    })
    .js("document.getElementsByClassName(\'env\')[0].style.border", function(o) {
      log(b.name , [b.tid, JSON.stringify(o)]);
    })
    .jsfile("./test.js", function(o) {
      log(b.name , [b.tid, JSON.stringify(o)]);
      b.stop(function() {
        log(b.name , [b.tid, "Finished"]);
      });
    })
};

for (var x=0;x<3;x++) {
  var browsers = [];
  var url = "http://localhost"
  browsers.push(jellyfish.createFirefox(url));
  browsers.push(jellyfish.createChrome(url));
  //browsers.push(jellyfish.createSafari(url));
  //browsers.push(jellyfish.createSauce(url));
  browsers.push(jellyfish.createWebdriver(url));
  browsers.push(jellyfish.createZombie(url));

  browsers.forEach(function(o) {
    log(o.name , [o.tid, "Started"]);
    test(o);
  });
}
