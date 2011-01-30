var elementslib = new function(){
  
  var domNode = null;
  //keep track of the locators we cant get via the domNode
  var locators = {};
  
  //Translates from the way we are passing objects to functions to the lookups
  this.lookup = function (p, throwErr){
    if (typeof(throwErr) == "undefined"){
      var throwErr = false;
    }

    var s = null;
    var element = null;
    //If a link was passed, lookup as link
    if(typeof p.link != "undefined") {
      s = 'Looking up link '+ p.link;
      element = this.Element.LINK(p.link);
    }
    //if xpath was passed, lookup as xpath
    if(typeof p.xpath != "undefined") {
      s = 'Looking up xpath '+ p.xpath;        
      element = this.Element.XPATH(p.xpath);
    }
    //if id was passed, do as such
    if(typeof p.id != "undefined") {
      s = 'Looking up id '+ p.id;
      element = this.Element.ID(p.id);
    }
    //if name was passed
    if(typeof p.name != "undefined") {
      s = 'Looking up name '+ p.name;
      element = this.Element.NAME(p.name);
    }
    //if name was passed
    if(typeof p.value != "undefined") {
      s = 'Looking up value '+ p.value;
      element = this.Element.VALUE(p.value);
    }
    //if name was passed
    if(typeof p.classname != "undefined") {
      s = 'Looking up classname '+ p.classname;
      element = this.Element.CLASSNAME(p.classname);
    }
    //if name was passed
    if(typeof p.tagname != "undefined") {
      s = 'Looking up tagname '+ p.tagname;
      element = this.Element.TAGNAME(p.tagname);
    }
    //if name was passed
    if(typeof p.label != "undefined") {
      s = 'Looking up label '+ p.label;
      element = this.Element.LABEL(p.label);
    }
    if (typeof p.query != "undefined") {
      s = 'Looking up query '+ p.query;
      element = $jfQ(p.query)[0];
    }
    //scroll so that the element is in view
    if (element) { 
      //element.scrollIntoView(); 
      return element;
    }
    else if (throwErr == true) { throw s + ", failed."; }
    else{ this.lookup(p, true); }
  };
  
  //element constructor
  this.Element = function(node){
    if (node){ domNode = node;}
    if (node.id){ id = node.id;}
    if (node.name){ name = node.name;}
    return domNode;
  };
  //getters
  this.Element.exists = function(){
    if (domNode){ return true; }
    else{ return false; }
  };
  this.Element.getNode = function(){
    return domNode;
  };
  //setters
  this.Element.ID = function(s){
    locators.id = s;
    domNode = nodeSearch(nodeById, s);
    return returnOrThrow(s);
  };
  this.Element.NAME = function(s){
     locators.name = s;
     domNode = nodeSearch(nodeByName, s);
     return returnOrThrow(s);
  };
  this.Element.LINK = function(s){
    locators.link = s;
    domNode = nodeSearch(nodeByLink, s);
    return returnOrThrow(s);
  };
  this.Element.CLASSNAME = function(s){
    locators.classname = s;
    domNode = nodeSearch(nodeByClassname, s);
    return returnOrThrow(s);
  };
  this.Element.TAGNAME = function(s){
    locators.tagname = s;
    domNode = nodeSearch(nodeByTagname, s);
    return returnOrThrow(s);
  };
  this.Element.VALUE = function(s){
    locators.value = s;
    domNode = nodeSearch(nodeByValue, s);
    return returnOrThrow(s);
  };
  this.Element.LABEL = function(s){
    locators.labelname = s;
    domNode = nodeSearch(nodeByLabel, s);
    return returnOrThrow(s);
  };
  this.Element.XPATH = function(s){
    locators.xpath = s;
    domNode = nodeSearch(nodeByXPath, s, document);
    //do the lookup, then set the domNode to the result
    return returnOrThrow(s);
  };
  
  //either returns the element, or throws an exception
  var returnOrThrow = function(s){
    if (!domNode){
      //var e = {};
      //e.message = "Element "+s+" could not be found";
      //throw e;
      return null;
    }
    else{
      return domNode;
    }
  }
  
  //do the recursive search
  //takes the function for resolving nodes and the string
  var nodeSearch = function(func, s, doc){
    var e = null;
    var element = null;
    //inline function to recursively find the element in the DOM, cross frame.
    var recurse = function(w, func, s, doc){
     //do the lookup in the current window
     try{ element = func.call(w, s, doc);}
     catch(err){ element = null; }
     
      if (!element){
        var fc = w.frames.length;
        var fa = w.frames;   
        for (var i=0;i<fc;i++){
          recurse(fa[i], func, s, doc); 
        }
     }
     else { e = element; }
    };
        
    if (element){ return element; }
    recurse(window, func, s, doc);
        
    return e;
  }
  
  //Lookup by ID
  var nodeById = function (s){
    return this.document.getElementById(s);
  }
  
  //DOM element lookup functions, private to elementslib
  var nodeByName = function (s) { //search nodes by name
    //sometimes the win object won't have this object
    try{
      var els = this.document.getElementsByName(s);
      if (els.length > 0) {
        return els[0];
      }
    }
    catch(err){};
    return null;
  };
  
  //Lookup by link
  var nodeByLink = function (s) {//search nodes by link text
    var getText = function(el){
      var text = "";
      if (el.nodeType == 3){ //textNode
        if (el.data != undefined){
          text = el.data;
        }
        else{ text = el.innerHTML; }
        text = text.replace(/\n|\r|\t/g, " ");
      }
      if (el.nodeType == 1){ //elementNode
          for (var i = 0; i < el.childNodes.length; i++) {
              var child = el.childNodes.item(i);
              text += getText(child);
          }
          if (el.tagName == "P" || el.tagName == "BR" || 
            el.tagName == "HR" || el.tagName == "DIV") {
            text += "\n";
          }
      }
      return text;
    }
    //sometimes the windows won't have this function
    try {
      var links = this.document.getElementsByTagName('a');
    }
    catch(err){}
    for (var i = 0; i < links.length; i++) {
      var el = links[i];
      var linkText = getText(el);
      if (linkText.trim() == s.trim()) {
        return el;
      }
    }
    return null;
  };
  
  //DOM element lookup functions, private to elementslib
  var nodeByTagname = function (s) { //search nodes by name
    //sometimes the win object won't have this object
    if (s.indexOf(',') != -1){
      var cn = s.split(',');
      var idx = cn[1];
      var cn = cn[0];
    }
    else{
      var cn = s;
      var idx = 0;
    }
    return this.document.getElementsByTagName(cn)[idx];
  };
  
  //DOM element lookup functions, private to elementslib
  var nodeByClassname = function (s) { //search nodes by name
    //sometimes the win object won't have this object
    if (s.indexOf(',') != -1){
      var cn = s.split(',');
      var idx = cn[1];
      var cn = cn[0];
    }
    else{
      var cn = s;
      var idx = 0;
    }
    return this.document.getElementsByClassName(cn)[idx];
  };
  
  //Lookup DOM node by value attribute
  var nodeByValue = function (s) {
    var getElementsByAttribute = function(oElm, strTagName, strAttributeName, strAttributeValue){
        var arrElements = (strTagName == "*" && oElm.all)? oElm.all : oElm.getElementsByTagName(strTagName);
        var arrReturnElements = new Array();
        var oAttributeValue = (typeof strAttributeValue != "undefined")? new RegExp("(^|\\s)" + strAttributeValue + "(\\s|$)", "i") : null;
        var oCurrent;
        var oAttribute;
        for(var i=0; i<arrElements.length; i++){
            oCurrent = arrElements[i];
            oAttribute = oCurrent.getAttribute && oCurrent.getAttribute(strAttributeName);
            if(typeof oAttribute == "string" && oAttribute.length > 0){
                if(typeof strAttributeValue == "undefined" || (oAttributeValue && oAttributeValue.test(oAttribute))){
                    arrReturnElements.push(oCurrent);
                }
            }
        }
        return arrReturnElements;
    }
    var node = getElementsByAttribute(this.document, "*", "value", s);
    if (node.length == 0){
      return null;
    }
    return node[0];
  };
  
  var nodeByLabel = function (s) { //search nodes by name
    //sometimes the win object won't have this object
    var labels = this.document.getElementsByTagName('label');
    var node = null;
    var label = null;

    //Find the label from all labels on the page
    for (i = 0;i < labels.length; i++){
      if (labels[i].innerHTML.trim() == s.trim()){
        label = labels[i];
      }
    }
    
    //If we have a label, use its for attrib to get the id of the input
    if (label != null){
      if (/MSIE[\/\s](\d+\.\d+)/.test(navigator.userAgent)){
          var iid = label.getAttribute('htmlFor');
      }
      else {
        var iid = label.getAttribute('for');
      }
      node = this.document.getElementById(iid);
    }
    //either return the found input node, or null
    return node;
  };
  
  //Lookup with xpath
  var nodeByXPath = function (xpath, doc) {
    //if there is built in document.evaluate
    if (this.document.evaluate){
      return this.document.evaluate(xpath, this.document, null, 0, null).iterateNext();
    }
    //Else pass the IDE window.document that has a document.evaluate
    else {
      return doc.evaluate(xpath, this.document, null, 0, null).iterateNext();
    }
  };
};