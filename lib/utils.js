var request = require('request');

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

// Finish the request
exports.finish = function(req, res, data) {
  var dataString = JSON.stringify(data);
  req.headers['content-type'] = 'application/json';
  req.headers['content-length'] = dataString.length;
  res.writeHead(200, req.headers);
  res.write(dataString);
  res.end();
};

exports.loadJSDOMPage = function(_this, url, cb) {
  request({
     uri: url,
     method: 'GET'
   }, function(err, resp, code) {
       var document = jsdom(code);
       var window = document.createWindow();
       _this.sandbox = {
         document: document,
         window: window
       }
       if (cb) {
         cb(_this);
       }
   });
};
