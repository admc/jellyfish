var utils = require('../utils')
  , request = require('request')
  , browsers = require('../browsers')
  , fs = require('fs');

var browserEnv = function() {};
browserEnv.micro = ["firefox", "safari", "chrome"];

browserEnv.prototype.init = function(b) {
  var _this = this;
  
  _this.target = new browsers[b](_this);  
  _this.target.start(function(b) {
    b.on('exit', function (code) {
      //console.log('output', 'killed browser ', _this.tid);
    });
  }, _this.startURL, _this.port)
};

//run raw js
browserEnv.prototype.js = function(code, cb) {
  //otherwise we have a real browser so we use the queue
  var run = {meth:"run"};
  run.qid = utils.uuid();
  run.code = code;
  run.cb = cb;

  //if a specific frame was provided
  if (this.frame) {
    run.frame = this.frame;
  }
  
  this.queue.push(run);
  return this;
};

browserEnv.prototype.go = function(url, cb) {
  this.js("window.location.href='"+url+"'", cb)
  return this;
};

//stop browser
browserEnv.prototype.stop = function(cb) {
  var _this = this;
  var stopObj = {meth:"stop"};
  stopObj.fn = function(cb) {
    try { _this.target.stop(); }
    catch(err) {
     // console.log('output', 'exiting', 'failed killing ' + _this.tid);
    }
    try { _this.server.close(); }
    catch(err){
    //  console.log('output', 'exiting', 'failed killing ' + _this.tid);
    }
  
    delete _this.tentacles[_this.tid];
    if (cb) { cb(); }
  };
  stopObj.cb = cb; 
  this.queue.push(stopObj);
  
  return this;
};

module.exports = browserEnv;