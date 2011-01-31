var request = require('request')
  , Script = process.binding('evals').Script
  , fs = require('fs')
  , jsdom = require("jsdom");


exports.uuid = function() {
   var chars = '0123456789abcdef'.split('');
   var uuid = [], rnd = Math.random, r;
   uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
   uuid[14] = '4'; // version 4

   for (var i = 0; i < 36; i++) {
      if (!uuid[i]) {
         r = 0 | rnd()*16;
         uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
      }
   }
   return uuid.join('');
};

exports.getRunObj = function(func, cb) {
  var run = {meth:"run"};
  run.qid = this.uuid();
  run.fn = func;
  run.cb = cb;
  return run;
}

// Finish the request
exports.finish = function(req, res, data) {
  var dataString = JSON.stringify(data);
  req.headers['content-type'] = 'application/json';
  req.headers['content-length'] = dataString.length;
  res.writeHead(200, req.headers);
  res.write(dataString);
  res.end();
};