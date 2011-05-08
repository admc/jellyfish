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
  console.log("\n\x1b[36mJELLYFISH\x1b[0m - What would you like to do? \n\x1b[33m--------------------------------------\x1b[0m");
  var methodsArr = [];
  for (x in jellyfish) {
    x = x.replace("createJellyfish", "createShell")
    if (x.indexOf("create") != -1) {
      methodsArr.push(x.replace("create", "").toLowerCase());
    }
  }
  console.log("Options:\n")
  console.log(methodsArr.toString());
  console.log("");
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
