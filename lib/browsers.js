var path = require('path')
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

firefox = function(_this) {
  //if a bin is provided, use it
  if (_this.config[_this.name]) {
    _this.bin = path.normalize(_this.config[b]);
  }
  //otherwise use the default location for the platform
  else {
    if (process.platform == "linux") {
      _this.bin = path.normalize("/usr/bin/firefox");
    }
    else {
      _this.bin = path.normalize("/Applications/Firefox.app/Contents/MacOS/firefox-bin");
    }
  }
  
  this.start = function(cb, url, port) {
    if (!url) { var url = "http://localhost"; }
    
    var writePrefs = function(port, url, prefsFile) {
      var defaultPref = 'user_pref("browser.shell.checkDefaultBrowser", false);\n';
      defaultPref += 'user_pref("startup.homepage_override_url", "'+url+'");\n';
      defaultPref += 'user_pref("browser.startup.homepage", "'+url+'");\n';
      defaultPref += 'user_pref("startup.homepage_welcome_url", "");\n';
      defaultPref += 'user_pref("browser.rights.3.shown", true);\n';
       if (port) {
         defaultPref += 'user_pref("network.proxy.http", "127.0.0.1");\n';
         defaultPref += 'user_pref("network.proxy.http_port",'+port+');\n'
         defaultPref += 'user_pref("network.proxy.no_proxies_on", "");\n';
         defaultPref += 'user_pref("network.proxy.type", 1);\n';
       }
       var prefjs = fs.createWriteStream(prefsFile, {'flags': 'a'});
       prefjs.write(defaultPref);
    };
    
    var bid = uuid();
    _this.bid = bid;

    var getVersion = exec(_this.bin + " --v", function (error, stdout, stderr) {
      if (stdout.indexOf("Mozilla Firefox 4") != -1) {
        _this.version = 4;
      }
      else {
        _this.version = 3;
      }
    })
    
    var createProfile = spawn(_this.bin, ["-createprofile", _this.bid]);
    createProfile.stderr.on('data', function (data) {
      var arr = data.toString().split("'");
      writePrefs(port, url, arr[3]);
      _this.profile = arr[3].replace("/prefs.js", "");
      _this.instance = spawn(_this.bin, ["-profile", _this.profile]);
      if (cb) { cb(_this.instance); }
    });
    return _this;
  };
  
  this.stop = function(cb) {
    //remove the profile
    var rm = function() {
      var rmProfile = exec("rm -rf "+ _this.profile, 
        function (error, stdout, stderr) {
          _this.instance.kill('SIGHUP');
          if (cb) { cb(); }
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
          rm();
      });
    }
    else {
      _this.instance.kill('SIGHUP');
      _this.instance.on('exit', function (code, signal) {
        rm();
      })
    }
    return _this;
  }
};
exports.firefox = firefox;

chrome = function(_this) {
  //if a bin is provided, use it
  if (_this.config[_this.name]) {
    _this.bin = path.normalize(_this.config[b]);
  }
  else {
    if (process.platform == "linux") {
      _this.bin = path.normalize('/usr/bin/google-chrome');
    }
    else {
      _this.bin = path.normalize('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome');
    }
  }
  
  this.start = function(cb, url, port) {
    if (!url) { var url = "http://jelly.io"; }
    
    _this.bid = uuid();
    var flags = [
      url,
      "--user-data-dir="+process.env.TMPDIR+_this.bid,
      "--disable-prompt-on-repost",
      "--disable-metrics",
      "--disable-metrics-reporting",
      "--no-default-browser-check",
      "--disable-web-security",
      "--temp-profile",
      "--no-first-run",
      "--disable-popup-blocking"
    ]
    
    if (port) {
      var proxy = "--proxy-server=127.0.0.1:"+port;
      flags.push(proxy)
    }
    
    _this.instance = spawn(_this.bin, flags);
    if (cb) { cb(_this.instance); }
    return _this;
  }
  
  this.stop = function(cb) {
    _this.instance.on('exit', function (code, signal) {
      var rm = exec("rm -rf "+ "/tmp/"+_this.bid, 
        function (error, stdout, stderr) {
          if (cb) { cb(); }
        });
    });
    _this.instance.kill('SIGHUP');
    return _this;
  }
};
exports.chrome = chrome;

//Define the safari browser
safari = function(_this) {
  if (process.platform != "darwin") {
    console.log("Safari is only supported on MacOSX :-(");
    process.exit();
  }
  
  //if a bin is provided, use it
  if (_this.config[_this.name]) {
    _this.bin = path.normalize(_this.config[b]);
  }
  else { //otherwise use the default location for the platform
    _this.bin = path.normalize('/Applications/Safari.app/Contents/MacOS/Safari');
  }
  
  this.start = function(cb, url, port) {
    if (!url) { var url = "http://jelly.io"; }
    _this.bid = uuid();
    
    //Set the web proxy            
    var setProxy = spawn("networksetup",["-setwebproxy", _this.config.interface, "127.0.0.1", port]);
    setProxy.on("exit", function(code) {
      var setProxyState = spawn("networksetup", ["-setwebproxystate", _this.config.interface, "on"]);
      setProxyState.on("exit", function(code) {
        //start browser
         _this.instance = spawn(_this.bin);
         if (cb) { cb(_this.instance); }
         return _this;  
      })
    });
  }
  
  this.stop = function(cb) {
    _this.instance.on('exit', function (code, signal) {
      var unsetProxyState = spawn("networksetup", ["-setwebproxystate", _this.config.interface, "off"]);
      unsetProxyState.on("exit", function(code) {
        if (cb) { cb(); }
        return _this;
      });
    })
    _this.instance.kill('SIGHUP');    
  }
};
exports.safari = safari; 
