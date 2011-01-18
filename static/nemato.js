var $jellyQ = jQuery.noConflict();

$jellyQ(document).ready(function(){
  var socket = new io.Socket(window.location.hostname);
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
      var res = eval(obj.code);
      var rObj = {};
      rObj.meth = "result";
      rObj.val = res;
      socket.send(JSON.stringify(rObj));
    }
  });
  socket.on('disconnect', function(data) {
    socket.connect();
  });
});
