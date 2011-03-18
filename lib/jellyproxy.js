var http = require('http')
  , url = require('url')
  , path = require('path')
  , paperboy = require('paperboy')
  , WEBROOT = path.join(path.dirname(__filename), '../static')
  , h = {accept:'application/json', 'content-type':'application/json'}
  , includes = '<script type="text/javascript" src="/_jellyfish/serv/jquery-1.4.4.min.js"></script>'
  includes += '<script type="text/javascript" src="/_jellyfish/serv/nemato.js"></script>'
  includes += '</head>';
  
  var includesLength = Buffer.byteLength(includes.substr(0,includes.length - 7)) // </head> is 7 chars long

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

     //communcation loop
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
           _this.emit('output', 'dispatcher', job.meth+" to: "+_this.tid+" title: "+title);
           _this.emit('command', job.meth, JSON.stringify(job));

           var msg = {meth:"run"};
           msg.code = job.code;
           msg.qid = job.qid;
           finish(req, res, msg);
         }
         else if (!j.frame) {
           var job = _this.queue.shift();
           _this.resolve[job.qid] = job;
           _this.emit('output', 'dispatcher', job.meth+" to: "+_this.tid+" title: "+title);
           _this.emit('command', job.meth, JSON.stringify(job));

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
         var msg = JSON.parse(data);
         _this.emit('output', 'frame dying', JSON.stringify(msg));
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

         _this.emit('output', 'recording result', JSON.stringify(job));
         _this.emit('report', job);

         if (job.cb) { job.cb({"result":msg.res}); }
         finish(req, res, {tid:_this.tid, result:true});
       })
     }
     //register frames
     else if (pathname.indexOf('_jellyfish/wake') != -1) {
       req.addListener("data", function (chunk) {
         var data = chunk.toString();
         var msg = JSON.parse(data);

         _this.emit('output', 'register frame', "tid:"+ _this.tid + " title: "+ msg.title);
         _this.frames[msg.title] = msg;
         finish(req, res, {tid:_this.tid});
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
       c.on("error", function (e) { console.error("client error "+e.stack) }) 

       // Stop from requesting gzip
       req.headers['accept-encoding'] = "text/html";

       var proxyRequest = c.request(req.method, pathname, req.headers);
       proxyRequest.on("error", function (e) { console.error("request error "+e.stack) }) 

       proxyRequest.addListener("response", function (response) {
         
         var addIncludes = (response.headers['content-type'] && response.headers['content-type'].indexOf("text/html") != -1 && response.headers['content-length'])
           , isIncludesAdded = false
           
         
         if (addIncludes){
           response.headers['content-length'] = parseInt(response.headers['content-length']) + includesLength 
         }
         
         //console.log("\033[30m[", req.headers.host, req.method, pathname, response.statusCode, (response.headers['content-type'] && response.headers['content-type'].indexOf("text/html") != -1)?"[Mod]":"", "] \033[0m")
         
         res.writeHead(response.statusCode, response.headers);
         
         response.addListener("data", function (chunk) {
           // modify the html content
           if (addIncludes && chunk.toString() && chunk.toString().indexOf('</head>')) {
                chunk = chunk.toString().replace('</head>', includes);
                isIncludesAdded = true
                res.write(chunk, 'utf8')
            } else{
              res.write(chunk, 'binary');
            }  
           actual += chunk.length
         })
         response.addListener("end", function () {
           if (addIncludes && !isIncludesAdded){
             for (var x=0; x<= includesLength; x+=Buffer.byteLength(" ")){
               res.write(" ", 'utf8')
           }}
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

    _this.emit('output', 'started server', _this.tid+" on port "+_this.port);
    
    return server;
};