var request = require('request')
  , Script = process.binding('evals').Script
  , fs = require('fs')
  , http = require('http')
  , url = require('url')
  , path = require('path')
  , paperboy = require('paperboy')
  , WEBROOT = path.join(path.dirname(__filename), '../static')
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

exports.copy = function(receivingClass, givingClass) {
  for (methodName in givingClass.prototype) {
    receivingClass[methodName] = givingClass.prototype[methodName];
  }
};

exports.mix = function(receivingClass, givingClass) {
  for (methodName in givingClass.prototype) {
    receivingClass.prototype[methodName] = givingClass.prototype[methodName];
  }
};

exports.getJellyProxy = function(_this) {
  // Finish the request
  var finish = function(req, res, data) {
    var dataString = JSON.stringify(data);
    req.headers['content-type'] = 'application/json';
    req.headers['content-length'] = dataString.length;
    res.writeHead(200, req.headers);
    res.write(dataString);
    res.end();
  };
  
  var server = http.createServer(function (req, res) {
     var ip = req.connection.remoteAddress;
     var uri = url.parse(req.url, true);

     if (uri.port == undefined) {
       uri.port = {"http:":80,"https:":443}[uri.protocol]
     }
     var pathname = uri.search ? uri.pathname + uri.search : uri.pathname;

     //communcation loop
     if (pathname.indexOf('_jellyfish/poll') != -1) {
       if (_this.queue.length != 0) {
         var title = "";
         if (uri.query.title != "") {
           title = uri.query.title;
         }
         var j = _this.queue[0];
         //If there is a function, just run it
         if (j.fn) {
           var job = _this.queue.shift();
           job.fn(job.cb);
           return;
         }
         if ((j.frame) && (j.frame == title)) {
           _this.resolve[job.qid] = job;
           _this.emit('output', 'dispatcher', job.meth+" to: "+_this.tid+" title: "+title);
           _this.emit('command', job.meth, JSON.stringify(job));

           var msg = {meth:"run"};
           msg.code = job.code;
           msg.qid = job.qid;
           finish(req, res, msg);
         }
         else if (!j.frame) {
           var job = _this.queue.shift();
           _this.resolve[job.qid] = job;
           _this.emit('output', 'dispatcher', job.meth+" to: "+_this.tid+" title: "+title);
           _this.emit('command', job.meth, JSON.stringify(job));

           var msg = {meth:"run"};
           msg.code = job.code;
           msg.qid = job.qid;
           finish(req, res, msg);
         }
         else {
           finish(req, res, {tid:_this.tid});
         }
       }
       else {
         finish(req, res, {tid:_this.tid});
       }
     }
     else if (pathname.indexOf('_jellyfish/die') != -1) {
       req.addListener("data", function (chunk) {
         var data = chunk.toString();
         var msg = JSON.parse(data);
         _this.emit('output', 'frame dying', JSON.stringify(msg));
         delete _this.frames[msg.title];
         finish(req, res, {tid:_this.tid, result:true});
       })
     }
     else if (pathname.indexOf('_jellyfish/result') != -1) {
       req.addListener("data", function (chunk) {
         var data = chunk.toString();
         var msg = JSON.parse(data);

         var job = _this.resolve[msg.qid];
         job.result = msg.res;

         _this.emit('output', 'recording result', JSON.stringify(job));
         _this.emit('report', job);

         if (job.cb) { job.cb({"result":msg.res}); }
         finish(req, res, {tid:_this.tid, result:true});
       })
     }
     //register frames
     else if (pathname.indexOf('_jellyfish/wake') != -1) {
       req.addListener("data", function (chunk) {
         var data = chunk.toString();
         var msg = JSON.parse(data);

         _this.emit('output', 'register frame', "tid:"+ _this.tid + " title: "+ msg.title);
         _this.frames[msg.title] = msg;
         finish(req, res, {tid:_this.tid});
       })
     }
     else if (pathname.indexOf('_jellyfish/serv') != -1) {
       //if _jellyfish is involved, we rm the whole path except the file
       //name and serve it from the static directory
       var fname = req.url.split("/");
       req.url = req.url.replace(pathname, "/" + fname[fname.length -1]);

       paperboy
       .deliver(WEBROOT, req, res)
       .otherwise(function() {
         res.writeHead(404, {'Content-Type': 'text/plain'});
         res.write('Sorry, no paper this morning!');
         res.close();
       });
     }
     else {
       // Actual proxying happens here
       var c = http.createClient(uri.port, uri.hostname);
       c.on("error", function (e) { console.error("client error "+e.stack) }) 

       // Stop from requesting gzip
       req.headers['accept-encoding'] = "text/html";

       var proxyRequest = c.request(req.method, pathname, req.headers);
       proxyRequest.on("error", function (e) { console.error("request error "+e.stack) }) 

       proxyRequest.addListener("response", function (response) {
         res.writeHead(response.statusCode, response.headers);
         response.addListener("data", function (chunk) {
           // modify the html content
           if (response.headers['content-type'].indexOf("text/html") != -1) {
              if (chunk.toString().indexOf('</head>')) {
                var includes = '<script type="text/javascript" src="/_jellyfish/serv/jquery-1.4.4.min.js"></script>';
                includes += '<script type="text/javascript" src="/_jellyfish/serv/nemato.js"></script>';
                includes += '</head>';
                chunk = chunk.toString().replace('</head>', includes);
              }
           }
           res.write(chunk, 'binary');
         })
         response.addListener("end", function () {
           res.end();
         })
       })
       req.addListener("data", function (chunk) {
         proxyRequest.write(chunk, 'binary');
       })
       req.addListener("end", function () {
         proxyRequest.end();
       })
     }
    });

    //needs to be safer
    server.listen(_this.port, function() {
     _this.port = server.address().port;
    });

    _this.emit('output', 'started server', _this.tid+" on port "+_this.port);
    
    return server;
};