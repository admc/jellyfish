# Jellyfish -- Browser launcher and Javascript execution engine.

Jellyfish bridges the gap between server and client side javascript by allowing 
control of all the major browsers from a node script.

From running unit tests across platforms, to automating browser based workflows,
jellyfish aims to free javascript from the confines of a single environment.

## Install

<pre>
npm install jellyfish
</pre>

Or from source:

<pre>
git clone git://github.com/admc/jellyfish.git 
cd jellyfish
npm link .
</pre>

## Platforms

MacOSX 10.6<br>
Ubuntu 10.x

## Browsers
Firefox 3.x, 4b <br>
Google Chrome <br>
Zombie (headless node.js browser)

(Provides hooks to Saucelabs OnDemand platform allowing execution in
all major browsers.)

## Usage
npm require
<pre>
var jellyfish = require('jellyfish'),
  , assert = require('assert');
</pre>

init a browser (createFirefox, createChrome, createZombie)
<pre>
var browser = jellyfish.createFirefox();
</pre>

goto a web site
<pre>
browser.go("http://www.jelly.io")
</pre>

verify the title
<pre>
.js("document.title", function(o) {
  assert.equal(o.result, "Jelly.io: Jellyfish Home")
})
</pre>

run some local javascript
<pre>
.jsfile("./test.js", function(o) {
  assert.equal(o.result, "alerted: Jellyfish local file loaded successfully!")
})
</pre>

run some remote javascript, stop the browser, then exit
<pre>
.jsurl("http://jelly.io/test.js", function(o) { 
  assert.equal(o.result, "alerted: Jellyfish remote file loaded successfully!")
  browser.stop(function() {
    process.exit();
  })
})
</pre>

## User Simulation

<pre>
var browser = jellyfish.(createFirefox, createChrome, createZombie)();
browser.go("http://www.google.com")
  .js("document.title", function(o) {
    console.log(o);
    assert.equal(o.result,"Google")
  })
  .js("document.getElementsByName(\'q\')[0].value = \'test\'", function(o) {
    console.log(o);
  })
  .js("document.getElementsByName(\'q\')[0].value", function(o) {
    console.log(o);
  })
  .jsfile("./test.js", function(o) {
    console.log(o);
    browser.stop(function() {
      setTimeout(process.exit, 2000);
    });
  })
</pre>

## ~/.jfrc

<pre>
{
  "log": false //show me logs
  , "firefox": "/path/to/binary" //binary path to firefox if you want to set it manually
  , "chrome": "path/to/binary" //binary path
  , "safari": "path/to/binary" //binary path
  , "interface": "Airport" // required for safari testing (proxy setting)
  , "username": "username" //sauce labs username
  , "accessKey": "apikey" //sauce labs apikey
  , "browserName": "firefox" //sauce labs default browser
  , "version": "4.0" // sauce labs default browser version
}
</pre>