var assert = require('assert')
  , jellyfish = require('jellyfish');

var firefox = jellyfish.createFirefox("http://localhost");

firefox.js("document.title", function(o) {
    console.log(firefox.name +" - "+firefox.tid+": " + JSON.stringify(o));
    assert.equal(o.result,"Wikipedia")
  })
  .js("document.getElementsByClassName(\'code\').length", function(o) {
    console.log(firefox.name +" - "+firefox.tid+": " + JSON.stringify(o));
  })
  .js("document.getElementsByClassName(\'env\')[0].innerHTML", function(o) {
    console.log(firefox.name+" - "+firefox.tid +": click");
  })
  .jsfile("./test.js", function(o) {
    console.log(firefox.name +" - "+firefox.tid+": " + JSON.stringify(o));
    firefox.stop(function() {
      console.log(firefox.name +" - "+firefox.tid+": DONE");
    });
  })