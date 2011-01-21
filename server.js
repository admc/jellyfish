var sys = require('sys')
  , http = require('http')
  , url = require('url')
  , path = require('path')
  , paperboy = require('paperboy')
  , WEBROOT = path.join(path.dirname(__filename), 'static')
  , browsers = require('./lib/browsers');
  
//Global registry of browsers
var tentacles = {};
var port = 9000;
  
// Generate a uuid
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

// Give me an array of keys
var keys = function(obj){
  var keys = [];
  for(i in obj) {
    if (obj.hasOwnProperty(i) && obj[i].connected){
      keys.push(i);
    } 
  }
  return keys;
}

// Finish the request
var finish = function(req, res, data) {
  var dataString = JSON.stringify(data);
  req.headers['content-type'] = 'application/json';
  req.headers['content-length'] = dataString.length;
  res.writeHead(200, req.headers);
  res.write(dataString);
  res.end();
}

// Service communication server
http.createServer(function (req, res) {
  req.addListener("data", function(chunk) {
    var data = chunk.toString();
    var cmd = JSON.parse(data);
        
    // Starting up a tentacle session
    if (cmd.meth == "start") {
      var startURL = "http://jelly.io/";
      var session = {};
      session.port = port;
      session.tid = uuid();
      session.frames = {};
      session.queue = [];
      session.resolve = {};
      port++;
      
      // Start the proxy server
      var server = http.createServer(function (req, res) {
        var ip = req.connection.remoteAddress;
        var uri = url.parse(req.url);

        if (uri.port == undefined) {
          uri.port = {"http:":80,"https:":443}[uri.protocol]
        }
        var pathname = uri.search ? uri.pathname + uri.search : uri.pathname;

        //communcation loop
         if (pathname.indexOf('_jellyfish/poll') != -1) {           
           if (session.queue.length != 0) {
             
             var title = "";
             try {
               title = unescape(uri.query.split("=")[1]);
             } catch(err){}
 
              var j = session.queue[0];
                            
              if ((j.frame) && (j.frame == title)) {
                var job = session.queue.shift();
                session.resolve[job.qid] = job;
                console.log("Dispatching "+job.meth+" to: "+session.tid+" title: "+title);
                var msg = {meth:"run"};
                msg.code = job.code;
                msg.qid = job.qid;
                finish(req, res, msg);
              }
              else if (!j.frame) {
                var job = session.queue.shift();
                session.resolve[job.qid] = job;
                console.log("Dispatching "+job.meth+" to: "+session.tid+" title: "+title);
                var msg = {meth:"run"};
                msg.code = job.code;
                msg.qid = job.qid;
                finish(req, res, msg);
              }
              else {
                finish(req, res, {tid:session.tid});
              }
           }
           
           finish(req, res, {tid:session.tid});
         }
         else if (pathname.indexOf('_jellyfish/die') != -1) {
            req.addListener("data", function (chunk) {
              var data = chunk.toString();
              var msg = JSON.parse(data);

              console.log("Frame dying: " + JSON.stringify(msg));
              delete session.frames[msg.title];
              finish(req, res, {tid:session.tid, result:true});
            })
         }
         else if (pathname.indexOf('_jellyfish/result') != -1) {
           req.addListener("data", function (chunk) {
             var data = chunk.toString();
             var msg = JSON.parse(data);
             
             console.log("Recording result for: " + JSON.stringify(msg));
             var job = session.resolve[msg.qid];
             finish(job.req, job.res, {"result":msg.res});
             finish(req, res, {tid:session.tid, result:true});
           })
         }
         //register frames
         else if (pathname.indexOf('_jellyfish/wake') != -1) {
           req.addListener("data", function (chunk) {
             var data = chunk.toString();
             var msg = JSON.parse(data);
             
             console.log("Registering frame: "+"tid:"+ session.tid + " title: "+ msg.title);
             session.frames[msg.title] = msg;
             finish(req, res, {tid:session.tid});
           })
         }
         //unregister frames
         else if (pathname.indexOf('_jellyfish/sleep') != -1) {
           console.log("Frame disconnect on TID "+ session.tid);
           finish(req, res, {tid:session.tid});
          }
          else if (pathname.indexOf('_jellyfish/serv') != -1) {
            //if _jellyfish is involved, we rm the whole path except the file
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
          // Actual proxying happens here
          var c = http.createClient(uri.port, uri.hostname);
          c.on("error", function (e) { console.error("client error "+e.stack) }) 

          // Stop from requesting gzip
          req.headers['accept-encoding'] = "text/html";

          var proxyRequest = c.request(req.method, pathname, req.headers);
          proxyRequest.on("error", function (e) { console.error("request error "+e.stack) }) 

          proxyRequest.addListener("response", function (response) {
            res.writeHead(response.statusCode, response.headers);
            response.addListener("data", function (chunk) {
              // modify the html content
              if (response.headers['content-type'].indexOf("text/html") != -1) {
                 if (chunk.toString().indexOf('</head>')) {
                   var includes = '<script type="text/javascript" src="/_jellyfish/serv/jquery-1.4.4.min.js"></script>';
                   includes += '<script type="text/javascript" src="/_jellyfish/serv/nemato.js"></script>';
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
      });
      
      //this should be a loop to find the next available port
      try {
        server.listen(session.port);
      } catch(err) {
        port++;
        session.port++;
        server.listen(session.port);
      }

      console.log("Started server for "+session.tid+" on port "+session.port)
      session.server = server;
      
      // Launch gchrome
      if (cmd.browser == "chrome") {
        session.browser = new browsers.chrome();
        session.browser.start(function(b){
          b.on('exit', function (code) {
            console.log('Killed browser with TID: ' + session.tid);
          });
        }, startURL, session.port)
      }
      // Launch firefox
      else if (cmd.browser == "firefox") {
        session.browser = new browsers.firefox();
        session.browser.start(function(b){
          b.on('exit', function (code) {
            console.log('Killed browser with TID: ' + session.tid);
          });
        }, startURL, session.port)        
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
    
    // Stop the browser and server for the session
    if (cmd.meth == "stop") {
      var session = tentacles[cmd.tid];
      session.browser.stop();
      session.server.close();
      console.log("Killing server for TID: "+session.tid);
      delete tentacles[cmd.tid];
      
      finish(req, res, {"result":"true"});
    }
    // List all tentacles running
    else if (cmd.meth == "list") {
      var arr = [];
      for (var key in tentacles) {
        arr.push(key);
      }
      finish(req, res, arr);
    }
    // Get all the frames for a tid
    else if (cmd.meth == "frames") {
      var session = tentacles[cmd.tid];
      finish(req, res, session.frames);
    }
    // Run javascript!
    else if (cmd.meth == "run") {
      console.log("Adding " + JSON.stringify(cmd))   ;
      var session = tentacles[cmd.tid];
      var run = {meth:"run"};
      run.code = cmd.code;
      
      //if a specific frame was provided
      if (cmd.frame) {
        run.frame = cmd.frame;
      }
      
      run.req = req;
      run.res = res;
      run.qid = uuid();
      session.queue.push(run);
    }
    // Bad option
    else {
      finish(req, res, {"result": "WTF"});
    }
  });
}).listen(8888);
sys.puts('Jellyfish Server running at http://127.0.0.1:8888/');

// Nice cleanup
process.on('exit', function () {
  for (var key in tentacles) {
    tentacles[key].browser.stop();
    tentacles[key].server.close();
  }
});

process.on('uncaughtException', function (err) {
  console.log('Caught exception: ' + err);
});
