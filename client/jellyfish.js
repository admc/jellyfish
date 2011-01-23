var sys = require('sys')
  , fs = require('fs')
  , EventEmitter = require('events').EventEmitter
  , request = require('request');


//executor of the queue
var d = function(obj, func) {
  var _this = this;
  if (this.tid) {
    obj.tid = this.tid;
  }
  if (this.frame) {
    obj.frame = this.frame;
  }
  
  request({
      uri: this.server,
      method: 'PUT', 
      body: JSON.stringify(obj) 
    }, function(err, resp, body) {
      if (!body) {
        console.log("Please make sure there is a Jellyfish server running at: " + _this.server);
        process.exit();
      }
      func(err, resp, body);
      _this.live = true;
    });
};

init = function(b, cb) {
  var _this = this;
  this.server = 'http://localhost:8888';
  this.tid = null;
  this.live = false;
  this.frame = null;
  this.queue = [];
  this.tide = setInterval(function() {
    //we have an active
    if (_this.tid && _this.live 
                  && (_this.queue.length != 0)) {
          
      _this.live = false;
      var wave = _this.queue.shift();
      _this.emit('command', wave.job.meth, JSON.stringify(wave.job));
      d.call(_this, wave.job, wave.fn);
    }
  }, 1000);

  //start a browser
  this.start = function(browser, cb) {
    d.call(_this, {meth:'start', browser:browser}, 
    function(err, resp, body) {      
      var obj = JSON.parse(body);
      _this.tid = obj.tid;
      _this.emit('command', 'start', JSON.stringify({browser:browser}));
      if (cb) { cb.call(_this, obj); }
    })
    return _this;
  };
  
  //navigate to a url
  this.go = function(url, cb) {
    var wave = {};
    wave.job = {meth:'run', code:"window.location.href='"+url+"'"};
    wave.fn = function(err, resp, body) {
      var obj = JSON.parse(body);
      if (cb) { cb.call(_this, obj); }
    };
      
    _this.queue.push(wave);
    return _this;
  };
  
  //stop browser
  this.stop = function(cb) {
    var wave = {};
    wave.job = {meth:'stop'};
    wave.fn = function(err, resp, body) {
      _this.tid = null;
      var obj = JSON.parse(body);
      if (cb) { cb.call(_this, obj); }
    };
    
    _this.queue.push(wave);
    return _this;
  };
  
  //list available frames
  this.frames = function(cb) {
    var wave = {};
    wave.job = {meth:'frames'};
    wave.fn = function(err, resp, body) {
      var obj = JSON.parse(body);
      if (cb) { cb.call(_this, obj); }
    };
    
    _this.queue.push(wave);
    return _this;
  };
  
  //run raw js
  this.js = function(str, cb) {
    var wave = {};
    wave.job = {meth:'run', code:str};
    wave.fn = function(err, resp, body) {
      var obj = JSON.parse(body);
      if (cb) { cb.call(_this, obj); }
    };
    
    _this.queue.push(wave);
    return _this;
  };
  
  //run code in local script
  this.jsfile = function(path, cb) {
    fs.readFile(path, 'utf8', function(err, code) {
      if (err) {
        console.log("Couldn't read script: " + path);
      }
      else {
        var wave = {};
        wave.job = {meth:'run', code:code};
        wave.fn = function(err, resp, body) {
          var obj = JSON.parse(body);
          if (cb) { cb.call(_this, obj); }
        };
        
        _this.queue.push(wave);
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
      }
      else {
        var wave = {};
        wave.job = {meth:'run', code:code};
        wave.fn = function(err, resp, body) {
          var obj = JSON.parse(body);
          if (cb) { cb.call(_this, obj); }
        };
        
        _this.queue.push(wave);
      }
    });
    
    return _this;
  };
  
  //run raw js
  this.user = function(meth, obj, cb) {
    var str = "wm.ctrl."+meth+"("+JSON.stringify(obj)+")";
    
    var wave = {};
    wave.job = {meth:'run', code:str};
    wave.fn = function(err, resp, body) {
      var obj = JSON.parse(body);
      if (cb) { cb.call(_this, obj); }
    };
    
    _this.queue.push(wave);
    return _this;
  };
  
  this.to = function(frame) {
    if (frame) { _this.frame = frame; }
    else { _this.frame = null; }
    return _this;
  };
  
  //if a browser is provided, start it
  if (b) { this.start(b, cb); }
};

EventEmitter.call(init);
init.prototype.__proto__ = EventEmitter.prototype;

exports.init = init;