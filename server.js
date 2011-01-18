var sys = require("sys")
  ,http = require("http")
  ,url = require("url")
  ,path = require('path')
  ,fs = require('fs')
  ,paperboy = require('paperboy')
  ,WEBROOT = path.join(path.dirname(__filename), 'static')
  ,io = require('socket.io')
  ,spawn = require('child_process').spawn;
  
//Global registry of browsers
var tentacles = {};
var port = 9000;
  
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

var keys = function(obj){
  var keys = [];
  for(i in obj) if (obj.hasOwnProperty(i)){
    keys.push(i);
  }
  return keys;
}

//Finish the request
var finish = function(req, res, data) {
  var dataString = JSON.stringify(data);
  req.headers['content-type'] = 'application/json';
  req.headers['content-length'] = dataString.length;
  res.writeHead(200, req.headers);
  res.write(dataString);
  res.end();
}

var requestHandler = function (req, res) {
  var ip = req.connection.remoteAddress;
  var uri = url.parse(req.url);

  if (uri.port == undefined) {
    uri.port = {"http:":80,"https:":443}[uri.protocol]
  }
  var pathname = uri.search ? uri.pathname + uri.search : uri.pathname;
  
  //Serve up static files
  if (pathname.indexOf('jelly-serv') != -1) {
    //if jelly-serv is involved, we rm the whole path except the file
    //name and serve it from the static directory
    var fname = req.url.split("/");
    req.url = req.url.replace(pathname, "/" + fname[fname.length -1]);

    paperboy
    .deliver(WEBROOT, req, res)
    .otherwise(function() {
      res.writeHead(404, {'Content-Type': 'text/plain'});
      res.write('Sorry, no paper this morning!');
      res.close();
    });
  }
  else {
    //Actual proxying happens here
    var c = http.createClient(uri.port, uri.hostname);
    c.on("error", function (e) { console.error("client error "+e.stack) }) 
    
    //Stop from requesting gzip
    req.headers['accept-encoding'] = "text/html";

    var proxyRequest = c.request(req.method, pathname, req.headers);
    proxyRequest.on("error", function (e) { console.error("request error "+e.stack) }) 
    
    proxyRequest.addListener("response", function (response) {
      res.writeHead(response.statusCode, response.headers);
      response.addListener("data", function (chunk) {
        // modify the html content
        if (response.headers['content-type'].indexOf("text/html") != -1) {
           if (chunk.toString().indexOf('</head>')) {
             var includes = '<script type="text/javascript" src="/jelly-serv/jquery-1.4.4.min.js"></script>';
             includes += '<script type="text/javascript" src="/jelly-serv/socket.io.js"></script>';
             includes += '<script type="text/javascript" src="/jelly-serv/nemato.js"></script>';
             //include each of the args specified on the CLI
             // args.forEach(function (val, index, array) {
             //   includes += '<script type="text/javascript" src="/jelly-serv/'+val+'.js"></script>';
             // });
             includes += '</head>';
             chunk = chunk.toString().replace('</head>', includes);
           }
        }
        res.write(chunk, 'binary');
      })
      response.addListener("end", function () {
        res.end();
      })
    })
    req.addListener("data", function (chunk) {
      proxyRequest.write(chunk, 'binary');
    })
    req.addListener("end", function () {
      proxyRequest.end();
    })
  }
}

//Service communication server
http.createServer(function (req, res) {
  req.addListener("data", function(chunk) {
    var data = chunk.toString();
    var cmd = JSON.parse(data);

    if (cmd.meth == "start") {
      var startURL = "http://www.jeeoh.com/jelly-serv/index.html";
      var session = {};
      session.port = port;
      session.tid = uuid();
      session.frames = {};
      session.queue = [];
      session.resolve = {};
      port++;
      session.interval = setInterval(function() {
        if ((keys(session.frames).length != 0) &&
          (session.queue.length != 0)) {
            
          var job = session.queue.shift();
          session.resolve[job["qid"]] = job;
          
          console.log("Taking job "+job.qid);
          var msg = {meth:"run"};
          msg.code = job.code;
          msg.qid = job.qid;
          
          var arr = keys(session["frames"]);
          //allow multiple frame logic
          var frame = null;
          if (!job.frame) {
            frame = session["frames"][arr[0]];
          }
          else {
            frame = session["frames"][job["frame"]];
          }
          console.log("Sending job to "+arr[0]);
          
          frame.send(JSON.stringify(msg));
        }
      }, 1000);
      
      //start the proxy server
      var server = http.createServer(requestHandler);
      server.listen(session.port);
      var socket = io.listen(server);
      socket.on('connection', function(client) {
        
        //delete dead clients
        for (var key in session["frames"]) {
          if (!session.frames[key].connected){
            delete session.frames[key];
          }
        }
        
        // new client is here!
        console.log("Frame Socket connected on TID "+ session.tid);
        client.on('message', function(message) {
          var msg = JSON.parse(message);
          if (msg.meth == "reg") {
            console.log("Registering frame: "+msg.title);
            session.frames[msg.title] = client;
          }
          else if (msg.meth == "result") {
            console.log("Got result from "+msg.qid);
            var job = session.resolve[msg.qid];
            console.log(msg.res);
            finish(job.req, job.res, {"result":msg.res});
          }
        }) 
        client.on('disconnect', function() {
          console.log("Frame Socket disconnect on TID "+ session.tid);
        }) 
      });

      console.log("Started server for "+session.tid+" on port "+session.port)
      session.server = server;
      session.socket = socket;
      
      if (cmd.browser == "chrome") {
        //start chrome
        var chrome = path.normalize('/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome');
        var proxy = "--proxy-server=127.0.0.1:"+session.port;
        session.browser = spawn(chrome, [proxy, "--disable-popup-blocking", "--homepage="+startURL]);
        //output when it's killed
        session.browser.on('exit', function (code) {
          console.log('Killed browser with TID: ' + session.tid);
        });
      }
      else if (cmd.browser == "firefox") {
        var ff = path.normalize('/Applications/Firefox.app/Contents/MacOS/firefox');
        var createProfile = spawn(ff, ["-CreateProfile", session.tid+" /tmp/jelly/"+session.tid]);
        createProfile.on("exit", function(code) {
          
          var defaultPref = 'user_pref("browser.shell.checkDefaultBrowser",false);';
          defaultPref += 'user_pref("network.proxy.http", "127.0.0.1");';
          defaultPref += 'user_pref("network.proxy.http_port",'+session.port+');'
          defaultPref += 'user_pref("network.proxy.no_proxies_on", "");';
          defaultPref += 'user_pref("network.proxy.type", 1);';
          defaultPref += 'user_pref("startup.homepage_override_url", "'+startURL+'");';
          defaultPref += 'user_pref("browser.startup.homepage", "'+startURL+'");';
          defaultPref += 'user_pref("startup.homepage_welcome_url", "");';
          defaultPref += 'user_pref("browser.rights.3.shown", true);';
                    
          var prefjs = fs.createWriteStream('/tmp/jelly/'+session.tid+'/prefs.js', {'flags': 'a'});
          prefjs.write(defaultPref);
          session.browser = spawn(ff, ["-P", session.tid]);
          //output when it's killed
          session.browser.on('exit', function (code) {
            console.log('Killed browser with TID: ' + session.tid);
          });
        });

      }
      else {
        //probably default to a tobi browser
        server.close();
        return;
      }
      
      tentacles[session.tid] = session;
      
      var resp = {tid:session.tid};
      finish(req, res, resp);
    }
    
    if (cmd.meth == "stop") {
      var session = tentacles[cmd.tid];
      session.browser.kill('SIGHUP');
      session.server.close();
      console.log("Killing server for TID: "+session.tid);
      delete tentacles[cmd.tid];
      
      finish(req, res, {"result":"true"});
    }
    
    if (cmd.meth == "list") {
      var arr = [];
      for (var key in tentacles) {
        arr.push(key);
      }
      finish(req, res, arr);
    }
    
    if (cmd.meth == "frames") {
      var nemato = tentacles[cmd.tid];
      var arr = [];
      for (var key in nemato["frames"]) {
        arr.push(key);
      }
      finish(req, res, arr);
    }
    
    if (cmd.meth == "run") {
      var nemato = tentacles[cmd.tid];

      var run = {meth:"run"};
      run.code = cmd.code;
      run.req = req;
      run.res = res;
      run.qid = uuid();
      nemato.queue.push(run);
    }
    
  });
}).listen(8888);
sys.puts('Service Server running at http://127.0.0.1:8888/');

//Nice cleanup
process.on('exit', function () {
  for (var key in tentacles) {
    tentacles[key].browser.kill('SIGHUP');
    tentacles[key].socket.close();
    tentacles[key].server.close();
  }
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
