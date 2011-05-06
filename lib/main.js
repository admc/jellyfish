var fs = require('fs')
  , EventEmitter = require('events').EventEmitter
  , request = require('request')
  , utils = require('./utils')
  , envs = require('./envs')
  , jellyproxy = require('./jellyproxy')
  , h = {accept:'application/json', 'content-type':'application/json'}
  , http = require('http')
  ;

var tentacles = {};
exports.tentacles = tentacles;

jellyfish = function(b, url, cb) {
  if (typeof url == "function") {
    cb = url;
    url = null;
  }
  
  var _this = this;
  this.startURL = url || "http://jelly.io/";
  this.tid = utils.uuid();
  this.tentacles = tentacles;
  this.port = 0;
  this.frame = null;
  this.live = false;
  this.jfComplete = false;
  this.queue = [];
  this.resolve = {};
  this.frames = {};
  this.config = {};
  this.opts = {};
  this.log = [];
  this.startTime = null;
  EventEmitter.call(this);
  
  this.start = function(b, cb) {
    _this.name = b;
    if (envs.browserEnv.micro.indexOf(b) != -1) {
      b = "browser";
      _this.server = jellyproxy.jellyproxy(_this);
      _this.port = _this.server.address().port;
    }
    var env = eval("envs." + b + "Env");
    if (typeof env == "function"){
      utils.copy(_this, env);
    }
        
    //parse out the config
    fs.readFile(process.env.HOME+'/.jfrc', encoding='utf8', function(err, data) {
      if (!err){
        try {
          _this.config = JSON.parse(data);
        } catch(err) {
          console.log("ERROR: .jfrc is broken, "+err);
          process.exit();
        }
      }
      
      _this.init(_this.name);
      _this.startTime = Math.round(new Date().getTime() / 1000);
      tentacles[_this.tid] = this;
      if (cb) { cb(_this); }
     });
     
     return _this;
  };

  //start!
  if (b) {
    _this.start(b, cb);
  }
};
jellyfish.prototype.__proto__ = EventEmitter.prototype;

jellyfish.prototype.to = function(frame) {
  if (frame) { this.frame = frame; }
  else { this.frame = null; }
  return this;
};

jellyfish.prototype._resolve = function(ret, cb) {
  var _this = this;
  var endTime = Math.round(new Date().getTime() / 1000);
  ret.runTime = endTime - this.startTime;
  if (this.couchObj) {
    utils.writeToCouch(this.tid, this.couchObj, ret);
  }
  _this.emit("result", ret);
  if (cb) { cb(ret); }
};

//run code in local script
jellyfish.prototype.jsfile = function(path, cb) {
  var _this = this;
  fs.readFile(path, 'utf8', function(err, code) {
   if (err) {
     _this._resolve({"result":false, "path": path}, cb);         
   }
   else { _this.js(code, cb); }
  });
  return this;
};

//run code in a provided url
jellyfish.prototype.jsurl = function(url, cb) {
  var _this = this;
  request({ uri: url, method: 'GET'}, function(err, resp, code) {
    if (err) {
      _this._resolve({"result":false, "url": url}, cb);         
    }
    else { _this.js(code, cb); }
  });
  return this;
};

jellyfish.prototype.couch = function(obj) {
  var _this = this;
  
  if (!obj) { var obj = {}; }
  if (!obj.uri) { obj.uri = "http://127.0.0.1"; }
  if (!obj.port) { obj.port = 5984; }
  if (!obj.db) { obj.db = 'jellyfish'; }
  
  obj.path = obj.uri+':'+obj.port+'/'+obj.db;
  request({uri:obj.path, method:'PUT', headers:h}, function (err, resp, b) {
    if (err) { 
      _this.log.push(['output', 'couchdb access error: ', err]);
    }
    if (resp.statusCode !== 201) {
      _this.log.push(['output', 'couchdb could not create db: ', b]);
    }
    _this.log.push(['output', 'couchdb access: ', 'success.']);
    _this.couchObj = obj;    
    
    request({uri:obj.path+"/"+_this.tid, method:'PUT', 
      body:JSON.stringify({browser:_this.name, tid: _this.tid, results:[]})}, function (err, resp, b) {        
      if (err) { 
        _this.log.push(['output', 'couchdb access error: ', err]);
      }
      if (resp.statusCode !== 201) {
        _this.log.push(['output', 'couchdb could not create doc: ', b]);
      }
      _this.log.push(['output', 'couchdb create document: ', 'success.']);
    });
  });
};

exports.createJellyfish = function (b, url, cb) {
  if (typeof url == 'function') {
    cb = url;
  }
  return new jellyfish(b, url, cb);
}

//Dynamically generate environment create methods
for (e in envs) {
  if (envs[e].micro) {
    for (m in envs[e].micro) {
      var str = "create"+envs[e].micro[m].substr(0, 1).toUpperCase() + envs[e].micro[m].substr(1);
      exports[str] = eval("(function(url, cb) {var name='" +
        envs[e].micro[m] + "'; if (typeof url == 'function'){ cb = url; } return new jellyfish(name, url, cb) })");
    }
  }
  else {
    e = e.replace("Env", "");
    var str = "create"+e.substr(0, 1).toUpperCase() + e.substr(1);
    str = str.replace("Env", "");
      exports[str] = eval("(function(url, cb) {var name='" + e +
        "'; if (typeof url == 'function'){ cb = url; } return new jellyfish(name, url, cb) })");
  }
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
  console.log(' \x1b[33mCaught exception: \x1b[0m :' + err);
  console.log(' \x1b[33mException Stack: \x1b[0m :' + err.stack);
  _this.log.push(['Caught exception: ' + err]);
  _this.log.push([err.stack]);
});