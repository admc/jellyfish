var sys = require('sys')
  , path = require('path')
  , fs = require('fs')
  , spawn = require('child_process').spawn
  , exec  = require('child_process').exec;

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
    
    var writePrefs = function(port, url, prefsFile) {
      var defaultPref = 'user_pref("browser.shell.checkDefaultBrowser",false);\n';
       if (port) {
         defaultPref += 'user_pref("network.proxy.http", "127.0.0.1");\n';
         defaultPref += 'user_pref("network.proxy.http_port",'+port+');\n'
         defaultPref += 'user_pref("network.proxy.no_proxies_on", "");\n';
         defaultPref += 'user_pref("network.proxy.type", 1);';
       }
       defaultPref += 'user_pref("startup.homepage_override_url", "'+url+'");\n';
       defaultPref += 'user_pref("browser.startup.homepage", "'+url+'");\n';
       defaultPref += 'user_pref("startup.homepage_welcome_url", "");\n';
       defaultPref += 'user_pref("browser.rights.3.shown", true);\n';

       var prefjs = fs.createWriteStream(prefsFile, {'flags': 'a'});
       prefjs.write(defaultPref);
    };
    
    var bid = uuid();
    _this.bid = bid;
    
    var ff = path.normalize("/Applications/Firefox.app/Contents/MacOS/firefox-bin");
    
    var getVersion = exec(ff+" --v", function (error, stdout, stderr) {
      if (stdout.indexOf("Mozilla Firefox 4") != -1) {
        _this.version = 4;
      }
      else { _this.version = 3; }
    })
    
    var createProfile = spawn(ff, ["-createprofile", _this.bid]);
    createProfile.stderr.on('data', function (data) {      
      var arr = data.toString().split("'");
      writePrefs(port, url, arr[3]);
      _this.profile = arr[3].replace("/prefs.js", "");
      var p = spawn(ff, ["-profile", _this.profile]);
      _this.instance = p;
      if (cb) {
        cb(_this.instance);
      }
    });
    return _this;
  };
  
  this.stop = function(cb) {
    //remove the profile
    var rmProfile = function() {
      var rmProfile = exec("rm -rf "+ _this.profile, 
        function (error, stdout, stderr) {
          if (cb) {
            cb();
          }
        });
    };
    
    if (_this.version == 3) {
      var ps = exec('ps aux | grep ' + _this.bid,
        function (error, stdout, stderr) {
          //this mess parses the ps output to find the process id
          //then kills it dead
          var lines = stdout.split("\n");
          for (var line in lines) {
            var arr = lines[line].split(/\s+/);
            if (arr[1]) {
              exec('kill -9 ' + arr[1]);
            }
          }
          rmProfile();
      });
    }
    else {
      _this.instance.kill('SIGHUP');
      rmProfile();
    }
    
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
        var p = spawn(chrome, [proxy, "--temp-profile", "--no-first-run", "--disable-popup-blocking", "--homepage="+url]);        
      }
      else {
        var p = spawn(chrome, ["--temp-profile", "--no-first-run", "--disable-popup-blocking", "--homepage="+url]);        
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