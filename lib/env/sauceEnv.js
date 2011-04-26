var utils = require('../utils')
  , soda = require('soda')
  ;
  
var sauceEnv = function() {};

sauceEnv.prototype.init = function(b) {
  var _this = this;
  var sauce = soda.createSauceClient({
    'url':  _this.startURL
    , 'username': _this.config.sauceUsername
    , 'access-key': _this.config.sauceApiKey
    , 'os': 'Windows 2008'
    , 'browser': 'iexplore'
    , 'name': 'jellyfish'
    , 'browser-version':'9'
    , 'max-duration': 600
  });
  
  _this.sauce = sauce;

  sauce.on('command', function(cmd, args) {
    console.log(' \x1b[33m%s\x1b[0m: %s', cmd, args.join(', '));
  });
  
  sauce.session(function(err, sid) {
    if (sid) {
      sauce.open('/', function(err, body) {
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

sauceEnv.prototype.go = function(url, cb) {
  var _this = this;
  _this.live = false;
  var run = utils.getRunObj(function(cb) {
    _this.sauce.getEval("selenium.browserbot.getCurrentWindow().location.href='"+url+"'", 
      function(err, body) {
        _this.live = true;
        _this._resolve({"result":body}, cb);
      })
  }, cb);
  
  _this.queue.push(run);
  return _this;
};

sauceEnv.prototype.js = function(code, cb) {
  var _this = this;
  var run = utils.getRunObj(function(cb) {
    _this.sauce.getEval("selenium.browserbot.getCurrentWindow().eval('"+code+"')",
      function(err, body) {
        _this._resolve({"result":body}, cb);
      })
  }, cb);
      
  _this.queue.push(run);
  return _this;
};

// sauceEnv.prototype.user = function(meth, obj, cb) {
//   var _this = this;
//   var run = utils.getRunObj(function(cb) {
//     _this.sauce[meth]("css="+obj.query, obj.text);
//   }, cb);
//   
//   _this.queue.push(run);
//   return _this;
// };

sauceEnv.prototype.stop = function(cb) {
  var _this = this;
  var stopObj = {meth:"stop"};
  stopObj.fn = function(cb) {
    _this.sauce
      .testComplete(function(err, body){
        _this.sauce.end(function(err, body) {});
      })

    delete _this.tentacles[_this.tid];
    if (cb) { cb(); }
  };
  stopObj.cb = cb; 
  _this.queue.push(stopObj);
  
  return _this;
};

module.exports = sauceEnv;