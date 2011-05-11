var assert = require('assert')
  , jellyfish = require('jellyfish');

var done = [];

var test = function(b) {
  b.js("document.title", function(o) {
    assert.equal(o.result,"Jelly.io: Jellyfish Home")
  })
  .js("document.getElementsByClassName(\'code\').length")
  .js("document.getElementsByClassName(\'env\')[0].style.border")
  .jsfile("../stub/example_file.js", function(o) {
    b.stop(function() {
      done.push(b);
      if (done.length - 1 == 10){
        setTimeout(process.exit, 1000);
      }
    });
  })
};

for (var x=0;x<10;x++) {
  var browsers = [];
  var url = "http://localhost"
  browsers.push(jellyfish.createFirefox(url));

  browsers.forEach(function(o) {
    o.on('result', function(res) {
      console.log(o.name + ' : '+o.tid + ' - \x1b[33m%s\x1b[0m', JSON.stringify(res));
    });
    test(o);
  });
}
