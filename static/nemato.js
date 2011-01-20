var $jfQ = jQuery.noConflict();

$jfQ(document).ready(function(){
  
  var socket = new io.Socket('localhost');
  socket.connect();
  socket.on('connect', function() {
    var frame = {};
    frame.meth = "reg";
    frame.title = window.document.title;
    socket.send(JSON.stringify(frame));
  });
  socket.on('message', function(data) {
    var obj = JSON.parse(data);
    
    if (obj.meth == "run") {
      window.alert = function(str) {
        return "Alerted: " + str;
      }
      window.onbeforeunload = function() {
        var rObj = {};
        rObj.meth = "result";
        rObj.res = "Page Unloaded";
        rObj.qid = obj.qid;
        socket.send(JSON.stringify(rObj));
      }
      var res = null;
      try {
        res = eval(obj.code);
      } catch(err){
        res = err;
      }
      var rObj = {};
      rObj.meth = "result";
      rObj.res = res;
      rObj.qid = obj.qid;
      socket.send(JSON.stringify(rObj));
    }
  });
  // socket.on('disconnect', function(data) {
  //   //socket.connect();
  //   window.location.reload(true);
  // });
  $jfQ(document.body).append('<script type="text/javascript" src="/jelly-serv/user.js"></script>')
});

