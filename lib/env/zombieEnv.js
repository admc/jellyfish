var utils = require('../utils')
, zombie = require('zombie');

var zombieEnv = function() {};

zombieEnv.prototype.init = function(b) {
  var _this = this;  
  _this.target = new zombie.Browser();

  _this.target.on("error", function(err) {});
  _this.target.on("loaded", function() {});
  
  _this.target.visit(_this.startURL, function(err, browser, status) {
    _this.live = true;
    _this.tide = setInterval(function() {
      if (_this.live && _this.tid && (_this.queue.length != 0)) {
        var wave = _this.queue.shift();
        wave.fn(wave.cb);
      }
    }, 1000);

    _this.state = setInterval(function() {
      if (_this.live && _this.tid) {
        var ret = _this.target.evaluate("window.jfComplete");
        if (ret == true) {
           var endTime = Math.round(new Date().getTime() / 1000);
           var runTime = endTime - _this.startTime;
          if (!_this.jfComplete) {
            _this.jfComplete = true;
            _this.emit("complete", {result:"complete", runTime:runTime});
          }
        }
      }
    }, 1000);
    
  });
};

zombieEnv.prototype.go = function(url, cb) {
  var _this = this;
  _this.jfComplete = false;
  
  var run = utils.getRunObj(function(cb) {
    _this.live = false;
    _this.target.visit(url, function(err, browser, status) {
      _this._resolve({"result":true}, cb);
      _this.live = true;
    });
  }, cb);
  
  _this.queue.push(run);
  return _this;
};

zombieEnv.prototype.js = function(code, cb) {
  var _this = this;
  var run = utils.getRunObj(function(cb) {
    _this.target.window.$jfQ = _this.target.querySelectorAll;
    var rObj = {};
    var alert = null;
    _this.target.onalert(function(str) {
      alert = "alerted: "+str;
    });
    try {
      var ret = _this.target.evaluate(code);
      rObj.result = ret;
    } catch(err) {
      rObj.result = err;
    }
    if (alert) {
      rObj.result = alert;
    }
    _this._resolve(rObj, cb);
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