var user = {};
user.asserts = {};

/**
* Select an option from a Select element by either value or innerHTML
* @param {Object} p The JavaScript providing: Locator, option or value
* @throws Exception Unable to select the specified option.
*/
user.select = function (p) {
  //lookup
  var element = elementslib.lookup(p);
  
  //if the index selector was used, select by index
  if (p.index){
    element.options[p.index].selected = true;
    return true;
  }
      
  //Sometimes we can't directly access these at this point, not sure why
  try {
    if (element.options[element.options.selectedIndex].text == p['option']){
      return true;
    }
  } catch(err){}
  
  try {  
    if (element.options[element.options.selectedIndex].value == p['val']){
      return true;
    }
  } catch(err){}
  
  events.triggerEvent(element, 'focus', false);
  var optionToSelect = null;
  for (opt = 0; opt < element.options.length; opt++){
    try {
      var el = element.options[opt];
      if (p.option != undefined){
        if(el.innerHTML.indexOf(p.option) != -1){
          if (el.selected && el.options[opt] == optionToSelect){
            continue;
          }
          optionToSelect = el;
          optionToSelect.selected = true;
          events.triggerEvent(element, 'change', true);
          break;
        }
      }
      else {
         if(el.value.indexOf(p.val) != -1){
            if (el.selected && el.options[opt] == optionToSelect){
              continue;
            }
            optionToSelect = el;
            optionToSelect.selected = true;
            events.triggerEvent(element, 'change', true);
            break;
          }
      }
    }
    catch(err){}
  }
  if (optionToSelect == null){
    throw "Unable to select the specified option.";
  }
  return true;
};

user.mouseDown = function (p) {
    var mupElement = elementslib.lookup(p);
    if (mupElement == null){
      mupElement = window.document.body;
    }
    if (/MSIE[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
        var box = mupElement.getBoundingClientRect(); 
        var left = box.left;
        var top = box.top + 2;
        events.triggerMouseEvent(mupElement, 'mousedown', true, left, top);  
    }
    else { events.triggerMouseEvent(mupElement, 'mousedown', true);  }
};

/**
* Fire a mousemove event ending at a specified set of coordinates
* @param {Object} p The JavaScript object providing: coords
*/
user.mouseMoveTo = function (p) {
  var webApp = window;
  var coords = p.coords.split(',');
  coords[0] = coords[0].replace('(','');
  coords[1] = coords[1].replace(')','');
  
  events.triggerMouseEvent(webApp.document.body, 'mousemove', true, coords[0], coords[1]);
};

/**
* Fire the mouseup event against a specified node, defaulting to document.body
* @param {Object} p The JavaScript object providing: Locator
*/
user.mouseUp = function (p){
 try {
   var mupElement = elementslib.lookup(p);
 } catch(err){}
 
 if (mupElement == null){
   mupElement = window.document.body;
 }
 if (/MSIE[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
   var box = mupElement.getBoundingClientRect(); 
   var left = box.left;
   var top = box.top + 2;
   events.triggerMouseEvent(mupElement, 'mouseup', true, left, top);
 }
 else{
   events.triggerMouseEvent(mupElement, 'mouseup', true);
 }
};

/**
* Fire the mouseover event against a specified DOM element
* @param {Object} p The JavaScript object providing: Locator
*/  
user.mouseOver = function (p){
 var mdnElement = elementslib.lookup(p);
 events.triggerMouseEvent(mdnElement, 'mouseover', true);
};

/**
* Fire the mouseout event against a specified DOM element
* @param {Object} p The JavaScript object providing: Locator
*/
user.mouseOut = function (p){
 var mdnElement = elementslib.lookup(p);
 events.triggerMouseEvent(mdnElement, 'mouseout', true);
};

/**
* Fire keypress event
* @param
*/
user.keyPress = function(p){
 try {
   var element = elementslib.lookup(p);
 } catch(err){ var element = window.document.body; }

 p.options = p.options.replace(/ /g, "");

 var opts = p.options.split(",");
 events.triggerEvent(element, 'focus', false);
 //element, eventType, keySequence, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown
 events.triggerKeyEvent(element, "keypress", opts[0], eval(opts[1]), eval(opts[2]), eval(opts[3]), eval(opts[4]), eval(opts[5]));
};

/**
* Fire keydown event
* @param
*/
user.keyDown = function(p){
 try {
   var element = elementslib.lookup(p);
 } catch(err){ var element = window.document.body; }

 p.options = p.options.replace(/ /g, "");

 var opts = p.options.split(",");
 events.triggerEvent(element, 'focus', false);
 //element, eventType, keySequence, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown
 events.triggerKeyEvent(element, "keyDown", opts[0], eval(opts[1]), eval(opts[2]), eval(opts[3]), eval(opts[4]), eval(opts[5]));
};

/**
* Fire keydown event
* @param
*/
user.keyUp = function(p){
 try {
   var element = elementslib.lookup(p);
 } catch(err){ var element = window.document.body; }

 p.options = p.options.replace(/ /g, "");

 var opts = p.options.split(",");
 events.triggerEvent(element, 'focus', false);
 //element, eventType, keySequence, canBubble, controlKeyDown, altKeyDown, shiftKeyDown, metaKeyDown
 events.triggerKeyEvent(element, "keyUp", opts[0], eval(opts[1]), eval(opts[2]), eval(opts[3]), eval(opts[4]), eval(opts[5]));
};

/**
* Trigger the back function in the Windmill Testing Application Window
*/
user.goBack = function(p){
 window.history.back();
}

/**
* Trigger the forward function in the Windmill Testing Application Window
*/
user.goForward = function(p){
 window.history.forward();
}

/**
* Trigger the refresh function in the Windmill Testing Application Window
*/
user.refresh = function(p){
 window.location.reload(true);
}

/**
* Trigger the scroll function in the Windmill Testing Application Window
* @param {Object} p The JavaScript object providing: coords
*/
user.scroll = function(p){
 var d = p.coords;
 d = d.replace('(','');
 d = d.replace(')','');
 var cArr = d.split(',');
 window.scrollTo(cArr[0],cArr[1]);
}


//Firefox Specific Controller Methods
if (/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){  
  //Click function for Mozilla with Chrome
  user.click = function(p){
    var element = elementslib.lookup(p);
    events.triggerEvent(element, 'focus', false);

    // Add an event listener that detects if the default action has been prevented.
    // (This is caused by a javascript onclick handler returning false)
    // we capture the whole event, rather than the getPreventDefault() state at the time,
    // because we need to let the entire event bubbling and capturing to go through
    // before making a decision on whether we should force the href
    var savedEvent = null;

    element.addEventListener('click', function(evt) {
        savedEvent = evt;
    }, false);

    // Trigger the event.
    events.triggerMouseEvent(element, 'mousedown', true);
    events.triggerMouseEvent(element, 'mouseup', true);
    events.triggerMouseEvent(element, 'click', true);
    try {
      // Perform the link action if preventDefault was set.
      // In chrome URL, the link action is already executed by triggerMouseEvent.
      if (!browser.isChrome && savedEvent != null && !savedEvent.getPreventDefault()) {
          if (element.href) {
              user.open({"url": element.href, 'reset':false});
          } 
          else {
              var itrElement = element;
              while (itrElement != null) {
                if (itrElement.href) {
                  user.open({"url": itrElement.href, 'reset':false});
                  break;
                }
                itrElement = itrElement.parentNode;
              }
          }
      }
    }
    catch(err){}
    return true;
    
  };

  //there is a problem with checking via click in safari
  user.check = function(p){
    return user.click(p);    
  };

  //Radio buttons are even WIERDER in safari, not breaking in FF
  user.radio = function(p){
    return user.click(p);      
  };

  //Double click for Mozilla
  user.doubleClick = function(p) {
   //Look up the dom element, return false if its not there so we can report failure
   var element = elementslib.lookup(p);
   events.triggerEvent(element, 'focus', false);
   events.triggerMouseEvent(element, 'dblclick', true);
   events.triggerEvent(element, 'blur', false);
  };

  //Type Function
  user.type = function (p){
   var element = elementslib.lookup(p);

   //clear the box
   element.value = '';
   //Get the focus on to the item to be typed in, or selected
   events.triggerEvent(element, 'focus', false);
   events.triggerEvent(element, 'select', true);

   //Make sure text fits in the textbox
   var maxLengthAttr = element.getAttribute("maxLength");
   var actualValue = p.text;
   var stringValue = p.text;

   if (maxLengthAttr != null) {
     var maxLength = parseInt(maxLengthAttr);
     if (stringValue.length > maxLength) {
       //truncate it to fit
       actualValue = stringValue.substr(0, maxLength);
     }
   }

   var s = actualValue;
   for (var c = 0; c < s.length; c++){
     events.triggerKeyEvent(element, 'keydown', s.charAt(c), true, false,false, false,false);
     events.triggerKeyEvent(element, 'keypress', s.charAt(c), true, false,false, false,false); 
     if (s.charAt(c) == "."){
       element.value += s.charAt(c);
     }
     events.triggerKeyEvent(element, 'keyup', s.charAt(c), true, false,false, false,false);
   }
   //if for some reason the key events don't do the typing
   if (element.value != s){
     element.value = s;
   }

   // DGF this used to be skipped in chrome URLs, but no longer.  Is xpcnativewrappers to blame?
   //Another wierd chrome thing?
   events.triggerEvent(element, 'change', true);
   return true;
 };
};

//Load Safari Specific Controller Methods
if (/Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
  //there is a problem with checking via click in safari
  user.check = function(p){
    return user.click(p);    
  };

  //Radio buttons are even WIERDER in safari
  user.radio = function(p){
    var element = elementslib.lookup(p);
    element.checked = true;
  };

  //Safari Click function
  user.click = function(p){
    var element = elementslib.lookup(p);
    events.triggerEvent(element, 'focus', false);

      // For form element it is simple.
      if (element['click']) {
        element['click']();
      }
      else{
        // And since the DOM order that these actually happen is as follows when a user clicks, we replicate.
        if (element.nodeName != 'SELECT'){
          events.triggerMouseEvent(element, 'mousedown', true);
          events.triggerMouseEvent(element, 'mouseup', true);
        }
        events.triggerMouseEvent(element, 'click', true);
      }

    return true;
  };

  //Double click for Safari
  user.doubleClick = function(p) {
    var element = elementslib.lookup(p);
    events.triggerEvent(element, 'focus', false);
    events.triggerMouseEvent(element, 'dblclick', true);
    events.triggerEvent(element, 'blur', false);
  };

  //Type Function
  user.type = function (p){

    var element = elementslib.lookup(p);
    //clear the box
    element.value = '';
    //Get the focus on to the item to be typed in, or selected
    events.triggerEvent(element, 'focus', false);
    events.triggerEvent(element, 'select', true);

    //Make sure text fits in the textbox
    var maxLengthAttr = element.getAttribute("maxLength");
    var actualValue = p.text;
    var stringValue = p.text;

    if (maxLengthAttr != null) {
      var maxLength = parseInt(maxLengthAttr);
      if (stringValue.length > maxLength) {
        //truncate it to fit
        actualValue = stringValue.substr(0, maxLength);
      }
    }

    var s = actualValue;
    for (var c = 0; c < s.length; c++){
       element.value += s.charAt(c);
       events.triggerKeyEvent(element, 'keydown', s.charAt(c), true, false,false, false,false);
       events.triggerKeyEvent(element, 'keypress', s.charAt(c), true, false,false, false,false); 
       events.triggerKeyEvent(element, 'keyup', s.charAt(c), true, false,false, false,false);
    }
    // DGF this used to be skipped in chrome URLs, but no longer.  Is xpcnativewrappers to blame?
    //Another wierd chrome thing?
    events.triggerEvent(element, 'change', true);
    return true;
  };

};

if (/MSIE[\/\s](\d+\.\d+)/.test(navigator.userAgent)){

  user.click = function(p){        
    var element = elementslib.lookup(p);
    events.triggerEvent(element, 'focus', false);

    // And since the DOM order that these actually happen is as follows when a user clicks, we replicate.
    //try {events.triggerMouseEvent(element, 'mousedown', true); } catch(err){}
    //try {events.triggerMouseEvent(element, 'mouseup', true); } catch(err){}
    user.mouseDown(p);
    user.mouseUp(p);
    try {events.triggerMouseEvent(element, 'click', true); } catch(err){}
  };

  //there is a problem with checking via click in safari
  user.check = function(p){
    return user.click(p);
  }

  //Radio buttons are even WIERDER in safari, not breaking in FF
  user.radio = function(p){
    return user.click(p);
  }

  //double click for ie
  user.doubleClick = function(p){      
     var element = elementslib.lookup(p);
     events.triggerEvent(element, 'focus', false);
     // Trigger the mouse event.
     events.triggerMouseEvent(element, 'dblclick', true);   
     events.triggerEvent(element, 'blur', false);       
  };

  //Type Function
   user.type = function (p){

     var element = elementslib.lookup(p);

     //clear the box
     element.value = '';
     //Get the focus on to the item to be typed in, or selected
     events.triggerEvent(element, 'focus', false);
     events.triggerEvent(element, 'select', true);

     //Make sure text fits in the textbox
     var maxLengthAttr = element.getAttribute("maxLength");
     var actualValue = p.text;
     var stringValue = p.text;

     if (maxLengthAttr != null) {
       var maxLength = parseInt(maxLengthAttr);
       if (stringValue.length > maxLength) {
         //truncate it to fit
         actualValue = stringValue.substr(0, maxLength);
       }
     }

     var s = actualValue;
     for (var c = 0; c < s.length; c++){
       element.value += s.charAt(c);
       events.triggerKeyEvent(element, 'keydown', s.charAt(c), true, false,false, false,false);
       events.triggerKeyEvent(element, 'keypress', s.charAt(c), true, false,false, false,false); 
       events.triggerKeyEvent(element, 'keyup', s.charAt(c), true, false,false, false,false);
     }

     // DGF this used to be skipped in chrome URLs, but no longer.  Is xpcnativewrappers to blame?
     //Another wierd chrome thing?
     events.triggerEvent(element, 'change', true);
     return true;
   };
};    

//Load opera specific controller methods
if (/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
  user.click = function(p){        
     var element = elementslib.lookup(p);
     events.triggerEvent(element, 'focus', false);

     // And since the DOM order that these actually happen is as follows when a user clicks, we replicate.
     try {events.triggerMouseEvent(element, 'mousedown', true); } catch(err){}
     try {events.triggerMouseEvent(element, 'mouseup', true); } catch(err){}
     try {events.triggerMouseEvent(element, 'click', true); } catch(err){}
  };

 //Sometimes opera requires that you manually toggle it
 user.check = function(p){
   //return user.click(p);
   var element = elementslib.lookup(p);
   events.triggerEvent(element, 'focus', false);

   var state = element.checked;
   // And since the DOM order that these actually happen is as follows when a user clicks, we replicate.
   try {events.triggerMouseEvent(element, 'mousedown', true); } catch(err){}
   try {events.triggerMouseEvent(element, 'mouseup', true); } catch(err){}
   try {events.triggerMouseEvent(element, 'click', true); } catch(err){}

   //if the event firing didn't toggle the checkbox, do it directly
   if (element.checked == state){
     if (element.checked){
       element.checked = false;
     }
     else {
       element.checked = true;
     }
   }
 };

 //Radio buttons are even WIERDER in safari, not breaking in FF
user.radio = function(p){
   return user.click(p);
 };

 //double click for ie
user.doubleClick = function(p){      
   var element = elementslib.lookup(p);
   events.triggerEvent(element, 'focus', false);
   events.triggerMouseEvent(element, 'dblclick', true);   
   events.triggerEvent(element, 'blur', false);       
 };

 //Type Function
 user.type = function (p){
   var element = elementslib.lookup(p);
   //clear the box
   element.value = '';
   //Get the focus on to the item to be typed in, or selected
   events.triggerEvent(element, 'focus', false);
   events.triggerEvent(element, 'select', true);

   //Make sure text fits in the textbox
   var maxLengthAttr = element.getAttribute("maxLength");
   var actualValue = p.text;
   var stringValue = p.text;

   if (maxLengthAttr != null) {
    var maxLength = parseInt(maxLengthAttr);
    if (stringValue.length > maxLength) {
      //truncate it to fit
      actualValue = stringValue.substr(0, maxLength);
    }
   }

   var s = actualValue;
   for (var c = 0; c < s.length; c++){
    element.value += s.charAt(c);
    events.triggerKeyEvent(element, 'keydown', s.charAt(c), true, false,false, false,false);
    events.triggerKeyEvent(element, 'keypress', s.charAt(c), true, false,false, false,false); 
    events.triggerKeyEvent(element, 'keyup', s.charAt(c), true, false,false, false,false);
   }

   // DGF this used to be skipped in chrome URLs, but no longer.  Is xpcnativewrappers to blame?
   //Another wierd chrome thing?
   events.triggerEvent(element, 'change', true);

 };
};

/****************************/
/* asserts
/*******************/

user.asserts.assertRegistry = {
  'assertTrue': {
  expr: function (a) {
      if (typeof a != 'boolean') {
        throw('Bad argument to assertTrue.');
      }
      return a === true;
    },
  errMsg: 'expected true but was false.'
  },

  'assertFalse': {
  expr: function (a) {
      if (typeof a != 'boolean') {
        throw('Bad argument to assertFalse.');
      }
      return a === false;
    },
  errMsg: 'expected false but was true.'
  },

  'assertEquals': {
  expr: function (a, b) { return a === b; },
  errMsg: 'expected $1 but was $2.'
  },

  'assertNotEquals': {
  expr: function (a, b) { return a !== b; },
  errMsg: 'expected one of the two values not to be $1.'
  },

  'assertNull': {
  expr: function (a) { return a === null; },
  errMsg: 'expected to be null but was $1.'
  },

  'assertNotNull': {
  expr: function (a) { return a !== null; },
  errMsg: 'expected not to be null but was null.'
  },

  'assertUndefined': {
  expr: function (a) { return typeof a == 'undefined'; },
  errMsg: 'expected to be undefined but was $1.'
  },

  'assertNotUndefined': {
  expr: function (a) { return typeof a != 'undefined'; },
  errMsg: 'expected not to be undefined but was undefined.'
  },

  'assertNaN': {
  expr: function (a) { return isNaN(a); },
  errMsg: 'expected $1 to be NaN, but was not NaN.'
  },

  'assertNotNaN': {
  expr: function (a) { return !isNaN(a); },
  errMsg: 'expected $1 not to be NaN, but was NaN.'
  },

  'assertEvaluatesToTrue': {
  expr: function (a) { return !!a; },
  errMsg: 'value of $1 does not evaluate to true.'
  },

  'assertEvaluatesToFalse': {
  expr: function (a) { return !a; },
  errMsg: 'value of $1 does not evaluate to false.'
  },

  'assertContains': {
  expr: function (a, b) {
      if (typeof a != 'string' || typeof b != 'string') {
        throw('Bad argument to assertContains.');
      }
      return (a.indexOf(b) > -1);
    },
  errMsg: 'value of $1 does not contain $2.'
  }
};

//Currently only does one level below the provided div
//To make it more thorough it needs recursion to be implemented later
user.asserts.assertText = function (p) {

  var n = elementslib.lookup(p);
  var validator = p.validator;
  if (n.innerHTML.indexOf(validator) != -1){
    return true;
  }
  if (n.hasChildNodes()){
    for(var m = n.firstChild; m != null; m = m.nextSibling) {
      //for non text nodes
      if (m.nodeType != 3){
        if (m.innerHTML.indexOf(validator) != -1){
          return true;
        }
        if (m.value.indexOf(validator) != -1){
          return true;
        }
      }
    }
  }
  throw "Text '"+validator+"' was not found in the provided node.";
};

//Assert that a specified node exists
user.asserts.assertNode = function (p) {
  var element = elementslib.lookup(p);
};

//Assert that a form element contains the expected value
user.asserts.assertValue = function (p) {
  var n = elementslib.lookup(p);
  var validator = p.validator;

  if (n.value.indexOf(validator) == -1){
    throw "Value not found, "+ n.value + "not equal to "+ validator;
  }
  
};

//Assert that a provided value is selected in a select element
user.asserts.assertJS = function (p) {
  var js = p.js;
  var result = eval(js);
  if (result != true){
    throw "JavaScript did not return true."
  }
};

//Asserting javascript with an element object available
user.asserts.assertElemJS = function (p) {
  var element = elementslib.lookup(p);
  var js = p.js;
  var result = eval(js);
  if (result != true){
    throw "JavaScript did not return true."
  }
};

//Assert that a provided value is selected in a select element
user.asserts.assertSelected = function (p) {
  var n = elementslib.lookup(p);
  var validator = p.validator;

  if ((n.options[n.selectedIndex].value != validator) && (n.options[n.selectedIndex].innerHTML != validator)){
    throw "Not selected, "+n.options[n.selectedIndex].value+" is not equal to " + validator;
  }
};

//Assert that a provided checkbox is checked
user.asserts.assertChecked = function (p) {
  var n = elementslib.lookup(p);

  if (!n.checked){
    throw "Checked property not true";
  }
};

// Assert that a an element's property is a particular value
user.asserts.assertProperty = function (p) {
  var element = elementslib.lookup(p);
  var vArray = p.validator.split('|');
  var value = eval ('element.' + vArray[0]+';');
  
  if (value.indexOf(vArray[1]) != -1){
    return true;
  }
  if (String(value) == String(vArray[1])) {
    return true;
  }
  
  throw "Property did not match."
};

// Assert that a specified image has actually loaded
// The Safari workaround results in additional requests
// for broken images (in Safari only) but works reliably
user.asserts.assertImageLoaded = function (p) {
  var img = elementslib.lookup(p);
  if (!img || img.tagName != 'IMG') {
    throw "The node was not an image."
  }
  var comp = img.complete;
  var ret = null; // Return value

  // Workaround for Safari -- it only supports the
  // complete attrib on script-created images
  if (typeof comp == 'undefined') {
    test = new Image();
    // If the original image was successfully loaded,
    // src for new one should be pulled from cache
    test.src = img.src;
    comp = test.complete;
  }

  // Check the complete attrib. Note the strict
  // equality check -- we don't want undefined, null, etc.
  // --------------------------
  // False -- Img failed to load in IE/Safari, or is
  // still trying to load in FF
  if (comp === false) {
    throw "Image complete attrib false."
  }
  // True, but image has no size -- image failed to
  // load in FF
  else if (comp === true && img.naturalWidth == 0) {
    throw "Image has no size, failure to load."
  }
  // Otherwise all we can do is assume everything's
  // hunky-dory
  else {
    ret = true;
  }
  return ret;
};

user.asserts._AssertFactory = new function () {
  var _this = this;
  function validateArgs(count, args) {
    if (!(args.length == count ||
	  (args.length == count + 1 && typeof(args[0]) == 'string') )) {
      throw('Incorrect arguments passed to assert function');
    }
  }
  function createErrMsg(msg, arr) {
    var str = msg;
    for (var i = 0; i < arr.length; i++) {
      //When calling jum functions arr is an array with a null entry
      if (arr[i] != null){
        var val = arr[i];
        var display = '<' + val.toString().replace(/\n/g, '') +
          '> (' + getTypeDetails(val) + ')';
        str = str.replace('$' + (i + 1).toString(), display);
      }
    }
    return str;
  }
  function getTypeDetails(val) {
    var r = typeof val;
    try {
      if (r == 'object' || r == 'function') {
        var m = val.constructor.toString().match(/function\s*([^( ]+)\(/);
						 if (m) { r = m[1]; }
						 else { r = 'Unknown Data Type' }
						 }
      }
      finally {
        r = r.substr(0, 1).toUpperCase() + r.substr(1);
        return r;
      }
    }
    this.createAssert = function (meth) {
      return function () {
      var args = Array.prototype.slice.call(arguments);
      args.unshift(meth);
      return _this.doAssert.apply(_this, args);
      }
    }
    this.doAssert = function () {
      // Convert arguments to real Array
      var args = Array.prototype.slice.call(arguments);
      // The actual assert method, e.g, 'equals'
      var meth = args.shift();
      // The assert object
      var asrt = user.asserts.assertRegistry[meth];
      // The assert expresion
      var expr = asrt.expr;
      // Validate the args passed
      var valid = validateArgs(expr.length, args);
      // Pull off additional comment which may be first arg
      var comment = args.length > expr.length ?
        args.shift() : null;
      // Run the assert
      var res = expr.apply(window, args);
      if (res) {
	      return true;
      }
      else {
        var message = meth + ' -- ' +        
        createErrMsg(asrt.errMsg, args);
        
	      throw new user.asserts._WindmillAssertException(comment, message);
      }
    };
  };

// Create all the assert methods on user.asserts
// Using the items in the assertRegistry
for (var meth in user.asserts.assertRegistry) {
  user.asserts[meth] = user.asserts._AssertFactory.createAssert(meth);
  user.asserts[meth].jsUnitAssert = true;
}

user.asserts._WindmillAssertException = function (comment, message) {
  this.comment = comment;
  this.message = message;
};