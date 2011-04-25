#!/usr/bin/env node

var shell = require('./shell')
  , repl = require('repl')
  , assert = require('assert')
  , jellyfish = require('./main')
  ;

var startRepl = function(b, str) {
  var r = repl.start('('+process.argv[2]+'): ');
  r.context.assert = assert;
  r.context.jellyfish = jellyfish;
  r.context.tentacles = jellyfish.tentacles;
  r.context.browser = b;
  r.context.help = function() {
    console.log("Jellyfish "+ process.argv[2] + " shell.");
    console.log("Access the browser via the object: 'browser'");
  };
};

if (!process.argv[2]) {
  console.log("JELLYFISH\n---------------");
  console.log("What would you like to do?");
  console.log("shell, firefox, chrome");
  return;
}

if (process.argv[2] == "shell") {
  shell.start();
}

var env = process.argv[2].charAt(0).toUpperCase() + process.argv[2].slice(1);

if (jellyfish["create"+env]) {
    var b = null;
    //goto provided url
    if (process.argv[3]) {
      b = jellyfish["create"+env](process.argv[3]);
    }
    else {
      b = jellyfish["create"+env]();
    }
    startRepl(b);
}
