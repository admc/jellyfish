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
  , h = {accept:'application/json', 'content-type':'application/json'}
  , zombie = require('zombie');
  ;

var tentacles = {};
exports.tentacles = tentacles;
var port = 9000;

jellyfish = function(b, cb) {
  var _this = this;
  this.startURL = "http://jelly.io";
  this.tid = utils.uuid();
  this.port = port + 5;
  this.frames = {};
  this.queue = [];
  this.resolve = {};
  this.frame = null;
  this.live = false;

  this.start = function(b, cb) {
    _this.name = b;
    
    // Start the proxy server
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

          var job = _this.resolve[msg.qid];
          job.result = msg.res;
          
          _this.emit('output', 'recording result', JSON.stringify(job));
          if (_this.couchObj) {
            utils.writeToCouch(_this.tid, _this.couchObj, job);
          }
                
          if (job.cb) { job.cb({"result":msg.res}); }
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
      _this.emit('output', 'Initializing zombie: ', _this.tid);      
      _this.zombie = true;
      _this.browser = new zombie.Browser();
      _this.browser.on("error", function(err) {
        //_this.emit('output', 'Zombie error: ', err);
      });
      _this.browser.on("loaded", function() {
        _this.emit('output', 'Zombie loaded: ',  _this.browser.location.href);        
      });
      
      _this.browser.click = function(obj, cb) {
        obj.result = true;
        try {
          var val = _this.browser.fire("click", _this.browser.css(obj.query)[0]);
        } catch(err) {
          obj.result = false;
          obj.error = err;
        }
        _this._resolve(obj, cb);
      };
      
      _this.browser.type = function(obj, cb) {
        obj.result = true;
        try {
          var val = _this.browser.fill(obj.query, obj.text);
        } catch(err) {
          obj.result = false;
          obj.error = err;
        }
        _this._resolve(obj, cb);
      };
      
      _this.browser.visit(_this.startURL, function(err, browser, status) {
        _this.live = true;
        _this.tide = setInterval(function() {
          //we have an active
          if (_this.live && _this.tid && (_this.queue.length != 0)) {
            var wave = _this.queue.shift();
            _this.emit('command', wave.meth, JSON.stringify(wave));
            wave.fn(wave.cb);
          }
        }, 1000);
      });
    }
    
    tentacles[_this.tid] = this;
    if (cb) { cb(); }
    return _this;
  };
  
  //stop browser
  this.stop = function(cb) {
    var stopObj = {meth:"stop"};
    stopObj.fn = function(cb) {
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
      if (cb) {
        cb();
      }
    };
    
    stopObj.cb = cb; 
    _this.queue.push(stopObj);
    
    return _this;
  };
  
  this._resolve = function(ret, cb) {
    _this.emit('output', 'recording result', JSON.stringify(ret));
    if (_this.couchObj) {
      utils.writeToCouch(_this.tid, _this.couchObj, ret);
    }
    if (cb) {
      cb(ret);
    }
  };
  
  //run raw js
  this.js = function(code, cb) {
    if (_this.zombie) {
      var run = utils.getRunObj(function(cb) {
        _this.emit('output', 'running in sandbox', code);
        _this.browser.window.$jfQ = _this.browser.querySelectorAll;
        var rObj = {};
        var alert = null;
        _this.browser.onalert(function(str) {
          alert = "alerted: "+str;
        });
        try {
          var ret = _this.browser.evaluate(code);
          rObj.result = ret;
        } catch(err) {
          rObj.result = err;
        }
        if (alert) {
          rObj.result = alert;
        }
        rObj.code = code;
        _this._resolve(rObj, cb);
      }, cb);
    }
    else { 
      //otherwise we have a real browser so we use the queue
      var run = {meth:"run"};
      run.qid = utils.uuid();
      run.code = code;
      run.cb = cb;
    
      //if a specific frame was provided
      if (_this.frame) {
        run.frame = _this.frame;
      }
    }
    
    _this.queue.push(run);
    return _this;
  };
  
  //navigate to a url
  this.go = function(url, cb) {
    if (_this.zombie) {
      _this.live = false;
      var run = utils.getRunObj(function(cb) {
        _this.emit('output', 'Zombie loading ', url);
        _this.browser.visit(url, function(err, browser, status) {
          if (err) {
            _this.emit('output', 'error initializing page', err.message);
          }
          _this.live = true;
          _this._resolve({"result":true}, cb);
        });
      }, cb);
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
         _this._resolve({"result":false, "path": path}, cb);         
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
         _this._resolve({"result":false, "url": url}, cb);         
       }
       else {
         _this.js(code, cb);
       }
     });

     return _this;
   };
   
  //run raw js
  this.user = function(meth, obj, cb) {
    if (_this.zombie) {
      var run = utils.getRunObj(function(cb) {
        _this.browser[meth](obj, cb);
      }, cb);
      _this.queue.push(run);
    }
    else {
      var code = "user."+meth+"("+JSON.stringify(obj)+")";
      _this.js(code, cb);
    }
    return _this;
  };
  
  this.to = function(frame) {
    if (frame) { _this.frame = frame; }
    else { _this.frame = null; }
    return _this;
  };
  
  this.couch = function(obj) {
    if (!obj) {
      var obj = {};
    }
    if (!obj.uri) {
      obj.uri = "http://127.0.0.1";
    }
    if (!obj.port) {
      obj.port = 5984;
    }
    if (!obj.db) {
      obj.db = 'jellyfish';
    }
    
    obj.path = obj.uri+':'+obj.port+'/'+obj.db
    
    request({uri:obj.path, method:'PUT', headers:h}, function (err, resp, b) {
      if (err) { 
        _this.emit('output', 'couchdb access error: ', err);
      }
      if (resp.statusCode !== 201) {
        _this.emit('output', 'couchdb could not create db: ', b);          
      }
      _this.emit('output', 'couchdb access: ', 'success.');
      _this.couchObj = obj;
    
      request({uri:obj.path+"/"+_this.tid, method:'PUT', 
        body:JSON.stringify({browser:_this.name, tid:_this.tid, results:[]})}, function (err, resp, b) {
        if (err) { 
          _this.emit('output', 'couchdb access error: ', err);
        }
        if (resp.statusCode !== 201) {
          _this.emit('output', 'couchdb could not create doc: ', b);          
        }
        _this.emit('output', 'couchdb create document: ', 'success.');
      })
    })
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

exports.createZombie = function (cb) {
  return new jellyfish('zombie', cb)
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