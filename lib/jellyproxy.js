var http = require('http')
  , url = require('url')
  , path = require('path')
  , paperboy = require('paperboy')
  , WEBROOT = path.join(path.dirname(__filename), '../static')
  , h = {accept:'application/json', 'content-type':'application/json'}
  , tag = "</head>";

exports.jellyproxy = function(_this) {
  // Finish the request
  var finish = function(req, res, data) {
    var dataString = JSON.stringify(data);
    req.headers['content-type'] = 'application/json';
    req.headers['content-length'] = dataString.length;
    res.writeHead(200, req.headers);
    res.write(dataString);
    res.end();
  };
  
  var server = http.createServer(function (req, res) {
     var ip = req.connection.remoteAddress;
     var uri = url.parse(req.url, true);

     if (uri.port == undefined) {
       uri.port = {"http:":80,"https:":443}[uri.protocol]
     }
     var pathname = uri.search ? uri.pathname + uri.search : uri.pathname;

     if (pathname.indexOf('_jellyfish/poll') != -1) {
       if (_this.queue.length != 0) {
         var title = "";
         if (uri.query.title != "") {
           title = uri.query.title;
         }
         var j = _this.queue[0];
         //If there is a function, just run it
         if (j.fn) {
           var job = _this.queue.shift();
           job.fn(job.cb);
           return;
         }
         if ((j.frame) && (j.frame == title)) {
           _this.resolve[job.qid] = job;

           var msg = {meth:"run"};
           msg.code = job.code;
           msg.qid = job.qid;
           finish(req, res, msg);
         }
         else if (!j.frame) {
           var job = _this.queue.shift();
           _this.resolve[job.qid] = job;
           
           var msg = {meth:"run"};
           msg.code = job.code;
           msg.qid = job.qid;
           finish(req, res, msg);
         }
         else {
           finish(req, res, {tid:_this.tid});
         }
       }
       else {
         finish(req, res, {tid:_this.tid});
       }
     }
     else if (pathname.indexOf('_jellyfish/die') != -1) {
       req.addListener("data", function (chunk) {
         var data = chunk.toString();
         try { var msg = JSON.parse(data); }
         catch(err) { return; }
         
         delete _this.frames[msg.title];
         finish(req, res, {tid:_this.tid, result:true});
       })
     }
     else if (pathname.indexOf('_jellyfish/result') != -1) {
       req.addListener("data", function (chunk) {
         var data = chunk.toString();
         var msg = JSON.parse(data);

         var job = _this.resolve[msg.qid];
         job.result = msg.res;

         _this._resolve({"result":msg.res}, job.cb);
         finish(req, res, {tid:_this.tid, result:true});
       })
     }
     //register frames
     else if (pathname.indexOf('_jellyfish/wake') != -1) {
       req.addListener("data", function (chunk) {
         var data = chunk.toString();
         try{ var msg = JSON.parse(data); }
         catch(err){ return; }
         _this.frames[msg.title] = msg;
         finish(req, res, {tid:_this.tid});
       })
     }
     else if (pathname.indexOf('_jellyfish/complete') != -1) {
       req.addListener("data", function (chunk) {
         var data = chunk.toString();
         var msg = JSON.parse(data);
         if (msg.result == true) {
            var endTime = Math.round(new Date().getTime() / 1000);
            var runTime = endTime - _this.startTime;
           _this.emit("complete", {result:"complete", runTime:runTime});
         }
         finish(req, res, {tid:_this.tid, result:true});
       })
       
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

       // Stop from requesting gzip
       req.headers['accept-encoding'] = "text/html";

       // allow additional default headers
       var headers={},h;

       for(h in req.headers)headers[h]=req.headers[h];

       if(_this.default_headers)for(h in _this.default_headers)headers[h]=_this.default_headers[h];

       var proxyRequest = c.request(req.method, pathname, headers);

       var clientError = function (e) { 
         if (!res._header) {
           res.writeHead(502, {})
           res.end();
         } else {
           res.end();
           // This should not be debug, it should always display because it's really bad!
           _this.log.push(["client error after writeHead was called. "+e.stack]);
         }
       }  
       
       c.on("error", clientError);
       proxyRequest.on("error", clientError);

       proxyRequest.addListener("response", function (response) {
         if (response.headers['content-type'] &&
          response.headers['content-type'].indexOf("text/html") != -1) {
           delete response.headers['content-length'];
         }
         res.writeHead(response.statusCode, response.headers);
         response.addListener("data", function (chunk) {
           // modify the html content
            if (response.headers['content-type'] && 
              response.headers['content-type'].indexOf("text/html") != -1) {
              if (chunk.toString().indexOf(tag)) {
                var cache = new Date().getTime();
                var includes = '<script type="text/javascript" src="/_jellyfish/serv/jquery-1.4.4.min.js?'+cache+'"></script>';
                includes += '<script type="text/javascript" src="/_jellyfish/serv/nemato.js?'+cache+'"></script>';
                includes += tag;
                chunk = chunk.toString().replace(tag, includes);
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

    //needs to be safer
    server.listen(_this.port, function() {
     _this.port = server.address().port;
    });

    _this.log.push(['output', 'started server', _this.tid+" on port "+_this.port]);
    return server;
};
