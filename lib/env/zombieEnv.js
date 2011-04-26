var utils = require('../utils')
, zombie = require('zombie');

var zombieEnv = function() {};

zombieEnv.prototype.init = function(b) {
  var _this = this;
  _this.log('output', 'Initializing zombie: ', _this.tid);      
  _this.browser = new zombie.Browser();
  _this.browser.on("error", function(err) {
    //_this.emit('output', 'Zombie error: ', err);
  });
  _this.browser.on("loaded", function() {
    _this.log('output', 'Zombie loaded: ',  _this.browser.location.href);        
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
        _this.log('command', wave.meth, JSON.stringify(wave));
        wave.fn(wave.cb);
      }
    }, 1000);
  });
};

zombieEnv.prototype.go = function(url, cb) {
  var _this = this;
  _this.live = false;
  var run = utils.getRunObj(function(cb) {
    _this.log('output', 'Zombie loading ', url);
    _this.browser.visit(url, function(err, browser, status) {
      if (err) {
        _this.log('output', 'error initializing page', err.message);
      }
      _this.live = true;
      _this._resolve({"result":true}, cb);
    });
  }, cb);
  
  _this.queue.push(run);
  return _this;
};

zombieEnv.prototype.js = function(code, cb) {
  var _this = this;
  var run = utils.getRunObj(function(cb) {
    _this.log('output', 'running in sandbox', code);
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
      
  _this.queue.push(run);
  return _this;
};

//run raw js
zombieEnv.prototype.user = function(meth, obj, cb) {
  var _this = this;
  var run = utils.getRunObj(function(cb) {
    _this.browser[meth](obj, cb);
  }, cb);
  _this.queue.push(run);
  return _this;
};

zombieEnv.prototype.stop = function(cb) {
  var _this = this;
  var stopObj = {meth:"stop"};
  stopObj.fn = function(cb) {
    delete _this.tentacles[_this.tid];
    if (cb) { cb(); }
  };
  stopObj.cb = cb; 
  _this.queue.push(stopObj);
  
  return _this;
};

module.exports = zombieEnv;