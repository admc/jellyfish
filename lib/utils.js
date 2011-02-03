var request = require('request')
  , Script = process.binding('evals').Script
  , fs = require('fs')
  , h = {accept:'application/json', 'content-type':'application/json'};

exports.writeToCouch = function(tid, couchObj, data) {
  request({uri:couchObj.path+'/'+tid}, function (err, resp, b) {
    if (err) throw err;
    if (resp.statusCode !== 200) throw new Error("Could not get document. "+b);
    
    var doc = JSON.parse(b);
    doc.results.push(data);
    request({uri:couchObj.path+"/"+tid, method:'PUT', body:JSON.stringify(doc)}, function (err, resp, b) {
      if (err) { throw err; }
      if (resp.statusCode !== 201) throw new Error("Could not create document. "+b);
    })
  })
};

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