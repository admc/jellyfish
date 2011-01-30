var sys = require('sys')
  , fs = require('fs')
  , http = require('http')
  , url = require('url')
  , path = require('path')
  , paperboy = require('paperboy')
  , WEBROOT = path.join(path.dirname(__filename), '../static')
  , EventEmitter = require('events').EventEmitter
  , Script = process.binding('evals').Script
  , request = require('request')
  , browsers = require('./browsers')
  , utils = require('./utils')
  ;

var tentacles = {};
exports.tentacles = tentacles;
var port = 9000;

jellyfish = function(b, cb) {
  var _this = this;
  this.startURL = "http://jelly.io/";
  this.tid = utils.uuid();
  this.port = port + 5;
  this.frames = {};
  this.queue = [];
  this.resolve = {};
  this.frame = null;

  this.start = function(b, cb) {
    // Start the proxy server
    var server = http.createServer(function (req, res) {
      var ip = req.connection.remoteAddress;
      var uri = url.parse(req.url);

      if (uri.port == undefined) {
        uri.port = {"http:":80,"https:":443}[uri.protocol]
      }
      var pathname = uri.search ? uri.pathname + uri.search : uri.pathname;

      //communcation loop
       if (pathname.indexOf('_jellyfish/poll') != -1) {           
         if (_this.queue.length != 0) {
           var title = "";
           try {
             title = unescape(uri.query.split("=")[1]);
           } catch(err){}

            var j = _this.queue[0];

            if ((j.frame) && (j.frame == title)) {
              var job = _this.queue.shift();
              _this.resolve[job.qid] = job;
              
              _this.emit('output', 'dispatcher', job.meth+" to: "+_this.tid+" title: "+title);
              _this.emit('command', job.meth, JSON.stringify(job));
              
              var msg = {meth:"run"};
              msg.code = job.code;
              msg.qid = job.qid;
              utils.finish(req, res, msg);
            }
            else if (!j.frame) {
              var job = _this.queue.shift();
              _this.resolve[job.qid] = job;
              
              _this.emit('output', 'dispatcher', job.meth+" to: "+_this.tid+" title: "+title);
              _this.emit('command', job.meth, JSON.stringify(job));
              
              var msg = {meth:"run"};
              msg.code = job.code;
              msg.qid = job.qid;
              utils.finish(req, res, msg);
            }
            else {
              utils.finish(req, res, {tid:_this.tid});
            }
         }
         else {
           utils.finish(req, res, {tid:_this.tid});
         }
       }
       else if (pathname.indexOf('_jellyfish/die') != -1) {
          req.addListener("data", function (chunk) {
            var data = chunk.toString();
            var msg = JSON.parse(data);

            _this.emit('output', 'frame dying', JSON.stringify(msg));
            
            delete _this.frames[msg.title];
            utils.finish(req, res, {tid:_this.tid, result:true});
          })
       }
       else if (pathname.indexOf('_jellyfish/result') != -1) {
         req.addListener("data", function (chunk) {
           var data = chunk.toString();
           var msg = JSON.parse(data);

           _this.emit('output', 'recording result', JSON.stringify(msg));
           
           var job = _this.resolve[msg.qid];
           if (job.cb) {
             job.cb({"result":msg.res});
           }
           utils.finish(req, res, {tid:_this.tid, result:true});
         })
       }
       //register frames
       else if (pathname.indexOf('_jellyfish/wake') != -1) {
         req.addListener("data", function (chunk) {
           var data = chunk.toString();
           var msg = JSON.parse(data);

           _this.emit('output', 'register frame', "tid:"+ _this.tid + " title: "+ msg.title);
           
           _this.frames[msg.title] = msg;
           utils.finish(req, res, {tid:_this.tid});
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
    server.listen(_this.port);
    _this.server = server;
    _this.emit('output', 'started server', _this.tid+" on port "+_this.port);
    port = _this.port;

    // Launch gchrome
    if (b == "chrome") {
      _this.emit('output', 'Initializing chrome:', _this.tid);      
      _this.browser = new browsers.chrome();
      _this.browser.start(function(b) {
        b.on('exit', function (code) {
          _this.emit('output', 'killed browser', _this.tid);
        });
      }, _this.startURL, _this.port)
    }
    // Launch firefox
    else if (b == "firefox") {
      _this.emit('output', 'Initializing firefox:', _this.tid);      
      _this.browser = new browsers.firefox();
      _this.browser.start(function(b) {
        b.on('exit', function (code) {
          _this.emit('output', 'killed browser', _this.tid);
        });
      }, _this.startURL, _this.port)        
    }
    else {
      _this.tide = setInterval(function() {
        //we have an active
        if (_this.tid && (_this.queue.length != 0)) {
          var wave = _this.queue.shift();
          _this.emit('command', wave.meth, JSON.stringify(wave));
          wave.fn.call(_this, wave.cb);
        }
      }, 1000);
      
      _this.emit('output', 'Initializing jsdom', _this.tid);      
      _this.jsdom = true;
      utils.loadJSDOMPage(_this, _this.startURL);
    }
    
    tentacles[_this.tid] = this;
    
    if (cb) {
      cb();
    }
    
    return _this;
  };
  
  //stop browser
  this.stop = function(cb) {
    
    try {
      _this.browser.stop();
    } catch(err){
      _this.emit('output', 'exiting', 'failed killing' + _this.tid);
    }
    
    try {
      _this.server.close();
    } catch(err){
      _this.emit('output', 'exiting', 'failed killing' + _this.tid);
    }
    
    delete tentacles[_this.tid];
    return _this;
  };
  
  //run raw js
  this.js = function(code, cb) {
    if (_this.jsdom) {
      var run = {meth:"run"};
      run.qid = utils.uuid();
      run.fn = function(cb) {
        _this.emit('output', 'running in sandbox', JSON.stringify(code));
        var evalReturn = Script.runInNewContext(code, _this.sandbox);
        if (cb) {
          cb({"result":evalReturn});
        }
      }
      run.cb = cb;
      
      _this.queue.push(run);
      return _this;
    }
        
    //otherwise we have a real browser so we use the queue
    var run = {meth:"run"};
    run.qid = utils.uuid();
    run.code = code;
    run.cb = cb;
    
    //if a specific frame was provided
    if (_this.frame) {
      run.frame = _this.frame;
    }
    _this.queue.push(run);
    return _this;
  };
  
  //navigate to a url
  this.go = function(url, cb) {
    if (_this.jsdom) {
      var run = {meth:"run"};
      run.qid = utils.uuid();
      run.fn = function(cb) {
        _this.emit('output', 'JSDOM loading ', url);
        utils.loadJSDOMPage(_this, url, cb);
        if (cb) {
          cb({"result":true});
        }
      }
      run.cb = cb;
      _this.queue.push(run);
    }
    else {
      _this.js("window.location.href='"+url+"'", cb)
    }
    return _this;
  };
  
  //run code in local script
   this.jsfile = function(path, cb) {
     fs.readFile(path, 'utf8', function(err, code) {
       if (err) {
         console.log("Couldn't read script: " + path);
         cb({"result":false});
       }
       else {
         _this.js(code, cb);
       }
     });
     return _this;
   };

   //run code in a provided url
   this.jsurl = function(url, cb) {
     request({
       uri: url,
       method: 'GET'
     }, 
     function(err, resp, code) {
       if (err) {
         console.log("Couldn't get script: " + url);
         cb({"result":false});
       }
       else {
         _this.js(code, cb);
       }
     });

     return _this;
   };
   
  //run raw js
  this.user = function(meth, obj, cb) {
    if (_this.jsdom) {
      console.log("User actions not yet supported with JSDOM browser.");
      return _this;
    }
    var code = "user."+meth+"("+JSON.stringify(obj)+")";
    _this.js(code, cb);
    return _this;
  };
  
  this.to = function(frame) {
    if (frame) { _this.frame = frame; }
    else { _this.frame = null; }
    return _this;
  };
  
  //start!
  if (b) {
    this.start(b, cb);
  }
};

EventEmitter.call(jellyfish);
jellyfish.prototype.__proto__ = EventEmitter.prototype;

exports.createJellyfish = function (b, cb) {
  return new jellyfish(b, cb);
}

exports.createFirefox = function (cb) {
  return new jellyfish('firefox', cb)
}

exports.createChrome = function (cb) {
  return new jellyfish('chrome', cb)
}

exports.createJSDOM = function (cb) {
  return new jellyfish('jsdom', cb)
}

// Nice cleanup
process.on('exit', function () {
  for (var key in tentacles) {
    try {
      tentacles[key].browser.stop();
    } catch(err) {}
    try {
      tentacles[key].server.close();
    } catch(err) {}
  }
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});