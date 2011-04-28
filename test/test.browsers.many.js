var assert = require('assert')
  , jellyfish = require('jellyfish');

var test = function(b) {
  b.go("http://www.wikipedia.com")
    .js("document.title", function(o) {
      console.log(b.name + ": " + JSON.stringify(o));
      assert.equal(o.result,"Wikipedia")
    })
    .js("document.getElementById(\'searchInput\').value = \'test\'", function(o) {
      console.log(b.name +" - "+b.tid+": " + JSON.stringify(o));
    })
    .js("document.getElementById(\'searchInput\').value", function(o) {
      console.log(b.name +" - "+b.tid+": " + JSON.stringify(o));
    })
    .js("document.getElementsByName(\'go\')[0].click()", function(o) {
      console.log(b.name+" - "+b.tid +": click");
    })
    .jsfile("./test.js", function(o) {
      console.log(b.name +" - "+b.tid+": " + JSON.stringify(o));
      b.stop(function() {
        console.log(b.name +" - "+b.tid+": DONE");
      });
    })
}

for (var x=0;x<3;x++) {
  var url = "http://www.google.com";
  var browsers = [];
  
  browsers.push(jellyfish.createChrome(url));
  browsers.push(jellyfish.createFirefox(url));
  //browsers.push(jellyfish.createSauce(url));
  //browsers.push(jellyfish.createZombie(url));
  
  browsers.forEach(function(o) {
    test(o);
  });
}