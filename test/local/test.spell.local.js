//Take firefox browsers and spell JF for Jellyfish!
var assert = require('assert')
  , jellyfish = require('jellyfish');

var browsers = [];

var jTop = jellyfish.createFirefox("http://localhost");
browsers.push(jTop);
jTop.js("window.resizeTo(400,10)")
  .js("window.moveTo(150,0)")
  .js("document.body.innerHTML = ''")
  .js("document.getElementsByTagName('html')[0].style.background = 'lightgray'")
  
var jMid = jellyfish.createFirefox("http://localhost");
browsers.push(jMid);
jMid.js("window.resizeTo(10, 500)")
  .js("window.moveTo(400,100)")
  .js("document.body.innerHTML = ''")
  .js("document.getElementsByTagName('html')[0].style.background = 'lightgray'")

var jBot = jellyfish.createFirefox("http://localhost");
browsers.push(jBot);
jBot.js("window.resizeTo(250, 10)")
  .js("window.moveTo(250,600)")  
  .js("document.body.innerHTML = ''")
  .js("document.getElementsByTagName('html')[0].style.background = 'lightgray'")

var fTop = jellyfish.createFirefox("http://localhost");
browsers.push(fTop);
fTop.js("window.resizeTo(400, 10)")
  .js("window.moveTo(750,0)")  
  .js("document.body.innerHTML = ''")
  .js("document.getElementsByTagName('html')[0].style.background = 'lightgray'")

var fMid = jellyfish.createFirefox("http://localhost");
browsers.push(fMid);
fMid.js("window.resizeTo(10, 700)")
  .js("window.moveTo(650,0)")
  .js("document.body.innerHTML = ''")
  .js("document.getElementsByTagName('html')[0].style.background = 'lightgray'")
  
var fBot = jellyfish.createFirefox("http://localhost");
browsers.push(fBot);
fBot.js("window.resizeTo(400, 10)")
  .js("window.moveTo(750, 300)")  
  .js("document.body.innerHTML = ''")
  .js("document.getElementsByTagName('html')[0].style.background = 'lightgray'", function(o) {
    
    //Morph JF to JS
    setTimeout(function() {
      fMid.js("window.resizeTo(10, 380)")

      var sBot = jellyfish.createFirefox("http://localhost");
      browsers.push(sBot);
      sBot.js("window.resizeTo(500, 10)")
        .js("window.moveTo(650, 600)")  
        .js("document.body.innerHTML = ''")
        .js("document.getElementsByTagName('html')[0].style.background = 'lightgray'");

      var sRight = jellyfish.createFirefox("http://localhost");
      browsers.push(sRight);
      sRight.js("window.resizeTo(10, 300)")
        .js("window.moveTo(1050, 300)")
        .js("document.body.innerHTML = ''")
        .js("document.getElementsByTagName('html')[0].style.background = 'lightgray'", function(o) {
          //wait 10 seconds and kill all the browser instances
          setTimeout(function() {
            for (b in browsers) {
              browsers[b].stop();
            }
          }, 10000);
        });
    }, 10000)
    
  })
  

  