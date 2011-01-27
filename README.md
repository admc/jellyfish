Dependencies

paperboy
request

Client API

Instantiate - /firefox/chrome/

ff = new jellyfish("firefox")

or

ff = new jellyfish();
ff.start("firefox")

Run

raw javascript: 
ff.js("$jfQ(document.body).html()", function(o) {
  console.log(o.result)
})

local script: 
ff.jsfile("./test.js", function(o){
  console.log(o.result)
})

remote script: 
ff.jsurl("http://www.adamchristian.com/test.js", function(o) { console.log(o.result)})

Assert

ff.js("document.title", function(o) {
  assert.equal(o.result,"Jellyfish")
})

Go - Go to a URL

ff.go("http://jelly.io")

Frames - See all the frames registered for that 

ff.frames()

jQuery

You can always use the injected jQuery, called $jfQ


User interactions

ff.user("type", {text:'moo', name:'q'})
ff.user("click", {name:'btnG'})

also alt + t gives you a JS runner

and you can paste the following test in there to run it:

wm.user('type',{'text':'testing', 'name':'q'});
wm.user('waits.sleep', {'ms':5000});
wm.user('type',{'text':'numbertwo', 'name':'q'});
wm.user('asserts.assertValue', {'name':'q', 'validator':'numbertwo'})
wm.user('waits.sleep', {'ms':3000});
wm.user('type',{'text':'finally', 'name':'q'});
wm.user('asserts.assertValue', {'name':'q', 'validator':'finally'}))


----------------

Raw API

curl -X PUT http://127.0.0.1:8888/ -d '{"meth":"start", "browser":"chrome"}'

curl -X PUT http://127.0.0.1:8888/ -d '{"meth":"stop", "tid":"cb8b34ef-da4b-463c-b400-bb14c1882ca2"}'

curl -X PUT http://127.0.0.1:8888/ -d '{"meth":"frames", "tid":"977466a0-2e2f-4902-a5fc-eb4a8d261a98"}'

curl -X PUT http://127.0.0.1:8888/ -d '{"meth":"list"}'  

curl -X PUT http://127.0.0.1:8888/ -d '{"meth":"run", "code":"window.location.href=\"http://www.google.com\";","tid":"78565d31-aaeb-4256-83c5-7f08641f5aeb"}'