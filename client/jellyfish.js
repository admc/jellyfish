var sys = require('sys')
  , fs = require('fs')
  , request = require('request');


var d = function(obj, func) {
  if (this.tid) {
    obj.tid = this.tid;
  }
  
  request({
      uri: this.server,
      method: 'PUT', 
      body: JSON.stringify(obj) 
    }, func);
};


jellyfish = function(b, cb) {
  var _this = this;
  this.server = 'http://localhost:8888';
  this.tid = null;

  //start a browser
  this.start = function(browser, cb) {
    d.call(_this, {meth:'start', browser:browser}, 
    function(err, resp, body) {
      var obj = JSON.parse(body);
      console.log(obj);
      _this.tid = obj.tid;
      if (cb) {
        cb.call(_this, obj);
      }
    })
    return _this;
  };
  
  //stop browser
  this.stop = function(cb) {
    if (_this.tid){
      d.call(_this, {meth:'stop'}, 
        function(err, resp, body) {
          _this.tid = null;
          var obj = JSON.parse(body);
          console.log(obj);
          if (cb) {
            cb.call(_this, obj);
          }
        })
    }
    return _this;
  };
  
  //list available frames
  this.frames = function(cb) {
    d.call(_this, {meth:'frames'}, 
      function(err, resp, body) {
        var obj = JSON.parse(body);
        console.log(obj);
        if (cb) {
          cb.call(_this, obj);
        }
      })
    return _this;
  };
  
  //navigate to a url
  this.go = function(url, cb) {
    d.call(_this, {meth:'run', code:"window.location.href='"+url+"'"}, 
      function(err, resp, body) {
        var obj = JSON.parse(body);
        console.log(obj);
        if (cb) {
          cb.call(_this, obj);
        }
      })
    return _this;
  };
  
  //run raw js
  this.js = function(str, cb) {
    d.call(_this, {meth:'run', code:str}, 
      function(err, resp, body) {
        var obj = JSON.parse(body);
        console.log(obj);
        if (cb) {
          cb.call(_this, obj);
        }
      })
    return _this;
  }
  
  //run code in local script
  this.jsfile = function(path, cb) {
    fs.readFile(path, 'utf8', function(err, code) {
      if (err) {
        console.log("Couldn't read script: " + path);
      }
      else {
        d.call(_this, {meth:'run', code:code}, 
          function(err, resp, body) {
            var obj = JSON.parse(body);
            console.log(obj);
            if (cb) {
              cb.call(_this, obj);
            }
          })
      }
    });
    return _this;
  }
  
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
        d.call(_this, {meth:'run', code:code}, 
          function(err, resp, body) {
            var obj = JSON.parse(body);
            console.log(obj);
            if (cb) {
              cb.call(_this, obj);
            }
          })
      }
    });
    return _this;
  }
  
  //if a browser is provided, start it
  if (b) {
    this.start(b, cb);
  }
};

exports.jellyfish = jellyfish;