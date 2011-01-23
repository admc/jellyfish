var net = require('net')
    , repl = require('repl')
    , assert = require('assert')
    , jellyfish = require('./jellyfish');

connections = 0;


var r = repl.start("(jellyfish): ");
r.context.assert = assert;
r.context.jellyfish = jellyfish;
r.context.help = function(){ console.log("JellyFish Help")};

net.createServer(function (socket) {
  connections += 1;
  repl.start("(jellyfish): ", socket);
}).listen("/tmp/node-repl-sock");

net.createServer(function (socket) {
  connections += 1;
  repl.start("(jellyfish): ", socket);
}).listen(5001);

// process.on('uncaughtException', function (err) {
//   console.log('Caught exception: ' + err);
// });