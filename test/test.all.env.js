var assert = require('assert')
  , jellyfish = require('jellyfish');

var done = [];

var test = function(b) {
  b.go("http://www.wikipedia.com")
    .js("document.title", function(o) {
      console.log(b.name +" - "+b.tid+": " + JSON.stringify(o));
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
};

var browsers = [];
browsers.push(jellyfish.createFirefox());
browsers.push(jellyfish.createChrome());
browsers.push(jellyfish.createSafari());
browsers.push(jellyfish.createSauce());
browsers.push(jellyfish.createWebdriver());
browsers.push(jellyfish.createZombie());

browsers.forEach(function(o) {
  test(o);
});