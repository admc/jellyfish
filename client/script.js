var assert = require('assert')
  , jellyfish = require('./jellyfish');

var ff = new jellyfish.jellyfish();

ff.start("firefox",function(o) { 
  this.go("http://www.google.com", function(o) {
    this.js("document.title", function(o) {
      assert.equal(o.result,"Google")
    }, function(o) {
        this.stop();
    })
  })
});
  
  // go("http://www.google.com")
  // .js("document.title", function(o) {
  //   assert.equal(o.result,"Google")
  // })
  // .user("type", { name:'q', text:'moo'})
  // .user("click", { name:'btnG' })
  // .jsfile("./test.js", function(o) {
  //   console.log(o.result)
  // })
  // .jsurl("http://ad4m.net/test.js", function(o) { 
  //   console.log(o.result)
  // }).stop();
