var utils = require('../utils')
  , wd = require('wd')
  ;

var sauceEnv = function() {};

sauceEnv.prototype.init = function(b) {
  var _this = this;
  _this.target = wd.createWebDriver("ondemand.saucelabs.com", 80, 
                                    _this.config.username, _this.config.accessKey)
  _this.target.init({
    name:'jellyfish', 
    browserName: _this.opts.browserName || 'iexplore', 
    version: _this.opts.version || '9'
  }, function(sid) {
    if (sid) {
      _this.target.get(_this.startURL, function() {
        _this.live = true;
        _this.tide = setInterval(function() {
          if (_this.live && _this.tid && (_this.queue.length != 0)) {
            var wave = _this.queue.shift();
            wave.fn(wave.cb);
          }
        }, 1000);
      })
    }
  });
};

sauceEnv.prototype.go = function(url, cb) {
  var _this = this;
  
  var run = utils.getRunObj(function(cb) {
    _this.target.get(url, function() {
      _this._resolve({"result":true}, cb);
    })
  }, cb);
  _this.queue.push(run);
  return _this;
};

sauceEnv.prototype.js = function(code, cb) {
  var _this = this;
  
  var run = utils.getRunObj(function(cb) {
    _this.target.exec(code, function(body) {
      _this._resolve({"result":body}, cb);
    })
  }, cb);
  
  _this.queue.push(run);
  return _this;
};

sauceEnv.prototype.stop = function(cb) {
  var _this = this;
  var stopObj = {meth:"stop"};
  
  stopObj.fn = function(cb) {
    _this.target.close(function(){
      _this.target.quit(function(){
        delete _this.tentacles[_this.tid];
        _this._resolve({"result":true}, cb);        
      });
    })
  };
  
  stopObj.cb = cb; 
  _this.queue.push(stopObj);
  return _this;
};

module.exports = sauceEnv;