var utils = require('../utils')
  , soda = require('soda')
  ;
  
var seleniumEnv = function() {};

seleniumEnv.prototype.init = function(b) {
  var _this = this;
  _this.target = soda.createClient({
    'url':  _this.startURL
    , 'host': _this.opts.host || '127.0.0.1'
    , 'port': _this.opts.port || 4444
    , 'browser': _this.opts.browserName || '*chrome'
    , 'browser-version': _this.opts.browserVersion || '4'
    , 'max-duration': 600
  });
    
  _this.target.session(function(err, sid) {
    if (sid) {
      _this.target.getEval("selenium.browserbot.getCurrentWindow().location.href='"+_this.startURL+"'", function(err, body) {
        _this.live = true;
        _this.tide = setInterval(function() {
          //we have an active
          if (_this.live && _this.tid && (_this.queue.length != 0)) {
            var wave = _this.queue.shift();
            wave.fn(wave.cb);
          }
        }, 1000);
      })
    }
  });
};

seleniumEnv.prototype.go = function(url, cb) {
  var _this = this;
  _this.live = false;
  var run = utils.getRunObj(function(cb) {
    _this.target.getEval("selenium.browserbot.getCurrentWindow().location.href='"+url+"'", function(err, body) {
      _this.live = true;
      _this._resolve({"result":body}, cb);
    })
  }, cb);
  
  _this.queue.push(run);
  return _this;
};

seleniumEnv.prototype.js = function(code, cb) {
  var _this = this;
  var run = utils.getRunObj(function(cb) {
    //WHY DOESN'T THIS WORK
    _this.target.getEval("selenium.browserbot.getCurrentWindow().eval('"+code+"')", function(err, body) {
      _this._resolve({"result":body}, cb);
    })
  }, cb);
      
  _this.queue.push(run);
  return _this;
};

seleniumEnv.prototype.stop = function(cb) {
  var _this = this;
  var stopObj = {meth:"stop"};
  stopObj.fn = function(cb) {
    _this.target
      .testComplete(function(err, body){
        _this.target.end(function(err, body) {});
      })

    delete _this.tentacles[_this.tid];
    if (cb) { cb(); }
  };
  stopObj.cb = cb; 
  _this.queue.push(stopObj);
  
  return _this;
};

module.exports = seleniumEnv;