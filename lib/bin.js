var shell = require('./shell')
  , repl = require('repl')
  , assert = require('assert')
  , jellyfish = require('./main');

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

if (process.argv[2] == "shell") {
  shell.start();
}
//cmd line chrome launcher
else if (process.argv[2] == "chrome") {
  var b = null;
  //goto provided url
  if (process.argv[3]) {
    b = jellyfish.createChrome(process.argv[3]);
  }
  else {
    b = jellyfish.createChrome();
  }
  startRepl(b);
}
//cmd line firefox launcher
else if (process.argv[2] == "firefox") {
  var b = null;
  //goto provided url
  if (process.argv[3]) {
    b = jellyfish.createFirefox(process.argv[3]);
  }
  else {
    b = jellyfish.createFirefox();
  }
  startRepl(b);
}
else {
  console.log("What would you like to do?");
  console.log("shell, firefox, chrome")
}

