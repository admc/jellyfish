var fs = require('fs')
  , EventEmitter = require('events').EventEmitter
  , request = require('request')
  , zombieEnv = require('./env/zombieEnv')
  , browserEnv = require('./env/browserEnv')
  , utils = require('./utils')
  , jellyproxy = require('./jellyproxy')
  , h = {accept:'application/json', 'content-type':'application/json'}
  ;

var tentacles = {};
exports.tentacles = tentacles;

jellyfish = function(b, url, cb) {
  var _this = this;
  this.startURL = "http://jelly.io";
  this.tid = utils.uuid();
  this.tentacles = tentacles;
  this.port = 0;
  this.frame = null;
  this.live = false;
  this.queue = [];
  this.resolve = {};
  this.frames = {};
  this.config = {};
  
  if (url) {
    this.startURL = url;
  }
  
  this.start = function(b, cb) {
    _this.name = b;
    
    if (b == "zombie") {
      utils.copy(_this, zombieEnv);
    }
    else {
      //browser
      utils.copy(_this, browserEnv);
      _this.server = jellyproxy.jellyproxy(_this);
      _this.port = _this.server.address().port;
    }
    
    //parse out the config
    fs.readFile(process.env.HOME+'/.jfrc', encoding='utf8', function(err, data) {
       if (!err){
         _this.config = JSON.parse(data);        
       }
       _this.init(b);
       tentacles[_this.tid] = this;
       if (cb) { cb(); }
     });
     
     return _this;
  };

  //start!
  if (b) {
    _this.start(b, cb);
    _this.on('report', function(cmd, args) {
      if (_this.couchObj) {
        utils.writeToCouch(_this.tid, _this.couchObj, cmd);
      }
    });
  }
};

jellyfish.prototype.log = function(category, action, obj) {
  if (this.config.log) {
    this.emit(category, action, obj);
  }
};

jellyfish.prototype.to = function(frame) {
  if (frame) { this.frame = frame; }
  else { this.frame = null; }
  return this;
};

jellyfish.prototype._resolve = function(ret, cb) {
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
  request({
   uri: url,
   method: 'GET'
  }, 
  function(err, resp, code) {
   if (err) {
     _this._resolve({"result":false, "url": url}, cb);         
   }
   else { _this.js(code, cb); }
  });
  
  return this;
};

jellyfish.prototype.couch = function(obj) {
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
  
  obj.path = obj.uri+':'+obj.port+'/'+obj.db;
  request({uri:obj.path, method:'PUT', headers:h}, function (err, resp, b) {
    if (err) { 
      this.emit('output', 'couchdb access error: ', err);
    }
    if (resp.statusCode !== 201) {
      this.emit('output', 'couchdb could not create db: ', b);          
    }
    this.emit('output', 'couchdb access: ', 'success.');
    this.couchObj = obj;
  
    request({uri:obj.path+"/"+this.tid, method:'PUT', 
      body:JSON.stringify({browser:this.name, tid: this.tid, results:[]})}, function (err, resp, b) {
      if (err) { 
        this.emit('output', 'couchdb access error: ', err);
      }
      if (resp.statusCode !== 201) {
        this.emit('output', 'couchdb could not create doc: ', b);          
      }
      this.emit('output', 'couchdb create document: ', 'success.');
    });
  });
};

EventEmitter.call(jellyfish);
jellyfish.prototype.__proto__ = EventEmitter.prototype;

exports.createJellyfish = function (b, url, cb) {
  if (typeof url == 'function') {
    cb = url;
  }
  return new jellyfish(b, url, cb);
}

exports.createFirefox = function (url, cb) {
  if (typeof url == 'function') {
    cb = url;
  }
  return new jellyfish('firefox', url, cb)
}

exports.createChrome = function (url, cb) {
  if (typeof url == 'function') {
    cb = url;
  }
  return new jellyfish('chrome', url, cb)
}

exports.createSafari = function (url, cb) {
  if (typeof url == 'function') {
    cb = url;
  }
  return new jellyfish('safari', url, cb)
}

exports.createZombie = function (url, cb) {
  if (typeof url == 'function') {
    cb = url;
  }
  return new jellyfish('zombie', url, cb);
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
  console.log(err.stack)
});
