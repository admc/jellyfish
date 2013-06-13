var http = require('http')
  , url = require('url')
  , path = require('path')
  , WEBROOT = path.join(path.dirname(__filename), '../static')
  , h = {accept:'application/json', 'content-type':'application/json'}
  , tag = "</head>"
  , jellyProxy = require('jelly-proxy')
  , send = require("send")

var payload = function(){
  var cache = new Date().getTime();
  var includes = ('<script type="text/javascript" ' +
    'src="/_jellyfish/serv/jquery-1.4.4.min.js?'+cache+'"></script>');
  includes += ('<script type="text/javascript"' +
    'src="/_jellyfish/serv/nemato.js?'+cache+'"></script>');
  return includes
}

var opts = {
  tag: tag
, payload : payload
}


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


  var handleJelly = function(req, res){
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
       send(req, req.url).root(WEBROOT).pipe(res); 
      }
  }

  var server = jellyProxy(opts, handleJelly, 80)// TODO don't assume port 80

  //needs to be safer
  server.listen(_this.port, function() {
   _this.port = server.address().port;
  });

  _this.log.push(['output', 'started server', _this.tid+" on port "+_this.port]);
  return server;
};
