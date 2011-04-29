var assert = require('assert')
  , jellyfish = require('jellyfish');

var done = [];

var test = function(b) {
  b.go("http://www.wikipedia.com")
     .js("document.title", function(o) {
       console.log(b.name + ": " + JSON.stringify(o));
       assert.equal(o.result,"Wikipedia")
     })
     .js("document.getElementById(\'searchInput\').value = \'test\'", function(o) {
       console.log(b.name + ": " + JSON.stringify(o));
     })
     .js("document.getElementById(\'searchInput\').value", function(o) {
       console.log(b.name + ": " + JSON.stringify(o));
     })
     .js("document.getElementsByName(\'go\')[0].click()", function(o) {
       console.log(b.name + ": click");
     })
    .jsfile("./test.js", function(o) {
      console.log(b.name + ": " + JSON.stringify(o));
      b.stop();
    })
};

var browsers = [];
browsers.push(jellyfish.createFirefox(function(o) { o.couch() }));
browsers.push(jellyfish.createChrome(function(o) { o.couch() }));
//browsers.push(jellyfish.createZombie(function(o) { o.couch() }));

browsers.forEach(function(o) {
  test(o);
  o.on('command', function(cmd, args){
   console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
  });
  o.on('output', function(cmd, args){
   console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args);
  });
});