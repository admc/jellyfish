var $jfQ = jQuery.noConflict();

$jfQ.getScript("/_jellyfish/serv/user-xpath.js");
$jfQ.getScript("/_jellyfish/serv/user-lookup.js");
$jfQ.getScript("/_jellyfish/serv/user-events.js");
$jfQ.getScript("/_jellyfish/serv/user-meth.js");

function run (data) {
  var res = null;
  try {
    res = eval(data);
  } catch(err){
    res = err;
  }
  return res;
};

function waitForJellyMsg() {
  try {
    if (!user) { return };
  } catch(err){
    return;
  }
  
  $jfQ.ajax({
    type: "GET",
    url: "/_jellyfish/poll",
    data: {"title":document.title},
    async: false,
    cache: false,
    timeout: 50000,
    dataType: 'json',
    success: function(obj) {
      window.jfrunning = true;
      
      if (obj.meth == "run") {
        var res = run(obj.code);
        
        var rObj = {};
        rObj.meth = "result";
        rObj.res = res;
        rObj.qid = obj.qid;
             
        $jfQ.ajax({
          type: 'POST',
          url: '/_jellyfish/result',
          data: JSON.stringify(rObj),
          success: function(o){},
          dataType: 'json'
        });
      }
      
      setTimeout('waitForJellyMsg()', 1000);
    },
    error: function(XMLHttpRequest, textStatus, errorThrown) {
      setTimeout('waitForJellyMsg()', "15000");
    },
  });
};

$jfQ(document).ready(function() {
  var data = {};
  data.title = window.document.title;
  data.url = window.location.href;
  data.agent = navigator.userAgent;
  
  $jfQ.post('/_jellyfish/wake', JSON.stringify(data), function(data) {
    window.onbeforeunload = function() {
      var data = {};
      data.title = window.document.title;
      data.url = window.location.href;
      data.agent = navigator.userAgent;
      
      $jfQ.post('/_jellyfish/die', JSON.stringify(data), function(data) {});
    }
    waitForJellyMsg();
    setTimeout(function() {
      if (!window.jfrunning) {
        waitForJellyMsg();
      }
    }, 2000);
    
  }, 'json');
  
  window.alert = function(str) {
    return "alerted: " + str;
  }
});
