var sys = require('sys')
  , path = require('path')
  , fs = require('fs')
  , spawn = require('child_process').spawn;

var uuid = function() {
   var chars = '0123456789abcdef'.split('');
   var uuid = [], rnd = Math.random, r;
   uuid[8] = uuid[13] = uuid[18] = uuid[23] = '-';
   uuid[14] = '4'; // version 4

   for (var i = 0; i < 36; i++) {
      if (!uuid[i]) {
         r = 0 | rnd()*16;
         uuid[i] = chars[(i == 19) ? (r & 0x3) | 0x8 : r & 0xf];
      }
   }
   return uuid.join('');
};

firefox = function() {
  var _this = this;
  this.instance = null;
  this.profile = null;
  
  this.start = function(cb, url, port) {
    if (!url) {
      var url = "http://jelly.io";
    }

    var bid = uuid();
    var ff = path.normalize('/Applications/Firefox.app/Contents/MacOS/firefox');
    var createProfile = spawn(ff, ["-CreateProfile", bid +" /tmp/browsers/"+bid]);
    _this.profile = "/tmp/browsers/"+bid;
    
    createProfile.on("exit", function(code) {
      var defaultPref = 'user_pref("browser.shell.checkDefaultBrowser",false);';
      if (port) {
        defaultPref += 'user_pref("network.proxy.http", "127.0.0.1");';
        defaultPref += 'user_pref("network.proxy.http_port",'+port+');'
        defaultPref += 'user_pref("network.proxy.no_proxies_on", "");';
        defaultPref += 'user_pref("network.proxy.type", 1);';
      }
      defaultPref += 'user_pref("startup.homepage_override_url", "'+url+'");';
      defaultPref += 'user_pref("browser.startup.homepage", "'+url+'");';
      defaultPref += 'user_pref("startup.homepage_welcome_url", "");';
      defaultPref += 'user_pref("browser.rights.3.shown", true);';

      var prefjs = fs.createWriteStream('/tmp/browsers/'+bid+'/prefs.js', {'flags': 'a'});
      prefjs.write(defaultPref);
      
      p = spawn(ff, ["-P", bid]);
      _this.instance = p;
      if (cb) {
        cb(_this.instance);
      }
    });
    
    return _this;
  }
  
  this.stop = function(cb) {
    _this.instance.kill('SIGHUP');
    var rmProfile = spawn("rm", ["-rf", _this.profile]);
    rmProfile.on("exit", function(code) {
      if (cb) {
        cb();
      }
    });
    
    return _this;
  }
};

chrome = function() {
  var _this = this;
  this.instance = null;
  this.start = function(cb, url, port) {
      if (!url) {
        var url = "http://jelly.io";
      }
      var chrome = path.normalize('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome');
      if (port) {
        var proxy = "--proxy-server=127.0.0.1:"+port;
        var p = spawn(chrome, [proxy, "--disable-popup-blocking", "--homepage="+url]);        
      }
      else {
        var p = spawn(chrome, ["--disable-popup-blocking", "--homepage="+url]);        
      }
      _this.instance = p;
      if (cb) {
        cb(_this.instance);
      }
      return _this;
  }
  
  this.stop = function(cb) {
    _this.instance.kill('SIGHUP');
    if (cb) {
      cb();
    }
    return _this;
  }
};

exports.firefox = firefox;
exports.chrome = chrome;