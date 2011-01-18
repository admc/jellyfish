var $jellyQ = jQuery.noConflict();

$jellyQ(document).ready(function(){
  var socket = new io.Socket();
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
  //   socket.connect();
  // });
});
