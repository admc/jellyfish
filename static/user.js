var elementslib=new function(){var domNode=null;var locators={};this.lookup=function(p,throwErr){if(typeof(throwErr)=="undefined"){var throwErr=false;}
var s=null;var element=null;if(typeof p.link!="undefined"){s='Looking up link '+p.link;element=this.Element.LINK(p.link);}
if(typeof p.xpath!="undefined"){s='Looking up xpath '+p.xpath;element=this.Element.XPATH(p.xpath);}
if(typeof p.id!="undefined"){s='Looking up id '+p.id;element=this.Element.ID(p.id);}
if(typeof p.name!="undefined"){s='Looking up name '+p.name;element=this.Element.NAME(p.name);}
if(typeof p.value!="undefined"){s='Looking up value '+p.value;element=this.Element.VALUE(p.value);}
if(typeof p.classname!="undefined"){s='Looking up classname '+p.classname;element=this.Element.CLASSNAME(p.classname);}
if(typeof p.tagname!="undefined"){s='Looking up tagname '+p.tagname;element=this.Element.TAGNAME(p.tagname);}
if(typeof p.label!="undefined"){s='Looking up label '+p.label;element=this.Element.LABEL(p.label);}
if(element){return element;}
else if(throwErr==true){throw s+", failed.";}
else{this.lookup(p,true);}};this.Element=function(node){if(node){domNode=node;}
if(node.id){id=node.id;}
if(node.name){name=node.name;}
return domNode;};this.Element.exists=function(){if(domNode){return true;}
else{return false;}};this.Element.getNode=function(){return domNode;};this.Element.ID=function(s){locators.id=s;domNode=nodeSearch(nodeById,s);return returnOrThrow(s);};this.Element.NAME=function(s){locators.name=s;domNode=nodeSearch(nodeByName,s);return returnOrThrow(s);};this.Element.LINK=function(s){locators.link=s;domNode=nodeSearch(nodeByLink,s);return returnOrThrow(s);};this.Element.CLASSNAME=function(s){locators.classname=s;domNode=nodeSearch(nodeByClassname,s);return returnOrThrow(s);};this.Element.TAGNAME=function(s){locators.tagname=s;domNode=nodeSearch(nodeByTagname,s);return returnOrThrow(s);};this.Element.VALUE=function(s){locators.value=s;domNode=nodeSearch(nodeByValue,s);return returnOrThrow(s);};this.Element.LABEL=function(s){locators.labelname=s;domNode=nodeSearch(nodeByLabel,s);return returnOrThrow(s);};this.Element.XPATH=function(s){locators.xpath=s;domNode=nodeSearch(nodeByXPath,s,document);return returnOrThrow(s);};var returnOrThrow=function(s){if(!domNode){return null;}
else{return domNode;}}
var nodeSearch=function(func,s,doc){var e=null;var element=null;var recurse=function(w,func,s,doc){try{element=func.call(w,s,doc);}
catch(err){element=null;}
if(!element){var fc=w.frames.length;var fa=w.frames;for(var i=0;i<fc;i++){recurse(fa[i],func,s,doc);}}
else{e=element;}};if(element){return element;}
recurse(window,func,s,doc);return e;}
var nodeById=function(s){return this.document.getElementById(s);}
var nodeByName=function(s){try{var els=this.document.getElementsByName(s);if(els.length>0){return els[0];}}
catch(err){};return null;};var nodeByLink=function(s){var getText=function(el){var text="";if(el.nodeType==3){if(el.data!=undefined){text=el.data;}
else{text=el.innerHTML;}
text=text.replace(/\n|\r|\t/g," ");}
if(el.nodeType==1){for(var i=0;i<el.childNodes.length;i++){var child=el.childNodes.item(i);text+=getText(child);}
if(el.tagName=="P"||el.tagName=="BR"||el.tagName=="HR"||el.tagName=="DIV"){text+="\n";}}
return text;}
try{var links=this.document.getElementsByTagName('a');}
catch(err){}
for(var i=0;i<links.length;i++){var el=links[i];var linkText=getText(el);if(linkText.trim()==s.trim()){return el;}}
return null;};var nodeByTagname=function(s){if(s.indexOf(',')!=-1){var cn=s.split(',');var idx=cn[1];var cn=cn[0];}
else{var cn=s;var idx=0;}
return this.document.getElementsByTagName(cn)[idx];};var nodeByClassname=function(s){if(s.indexOf(',')!=-1){var cn=s.split(',');var idx=cn[1];var cn=cn[0];}
else{var cn=s;var idx=0;}
return this.document.getElementsByClassName(cn)[idx];};var nodeByValue=function(s){var getElementsByAttribute=function(oElm,strTagName,strAttributeName,strAttributeValue){var arrElements=(strTagName=="*"&&oElm.all)?oElm.all:oElm.getElementsByTagName(strTagName);var arrReturnElements=new Array();var oAttributeValue=(typeof strAttributeValue!="undefined")?new RegExp("(^|\\s)"+strAttributeValue+"(\\s|$)","i"):null;var oCurrent;var oAttribute;for(var i=0;i<arrElements.length;i++){oCurrent=arrElements[i];oAttribute=oCurrent.getAttribute&&oCurrent.getAttribute(strAttributeName);if(typeof oAttribute=="string"&&oAttribute.length>0){if(typeof strAttributeValue=="undefined"||(oAttributeValue&&oAttributeValue.test(oAttribute))){arrReturnElements.push(oCurrent);}}}
return arrReturnElements;}
var node=getElementsByAttribute(this.document,"*","value",s);if(node.length==0){return null;}
return node[0];};var nodeByLabel=function(s){var labels=this.document.getElementsByTagName('label');var node=null;var label=null;for(i=0;i<labels.length;i++){if(labels[i].innerHTML.trim()==s.trim()){label=labels[i];}}
if(label!=null){if(/MSIE[\/\s](\d+\.\d+)/.test(navigator.userAgent)){var iid=label.getAttribute('htmlFor');}
else{var iid=label.getAttribute('for');}
node=this.document.getElementById(iid);}
return node;};var nodeByXPath=function(xpath,doc){if(this.document.evaluate){return this.document.evaluate(xpath,this.document,null,0,null).iterateNext();}
else{return doc.evaluate(xpath,this.document,null,0,null).iterateNext();}};};events=new function(){this.createEventObject=function(element,controlKeyDown,altKeyDown,shiftKeyDown,metaKeyDown){var evt=element.ownerDocument.createEventObject();evt.shiftKey=shiftKeyDown;evt.metaKey=metaKeyDown;evt.altKey=altKeyDown;evt.ctrlKey=controlKeyDown;return evt;};this.triggerEvent=function(element,eventType,canBubble,controlKeyDown,altKeyDown,shiftKeyDown,metaKeyDown){canBubble=(typeof(canBubble)==undefined)?true:canBubble;if(element.fireEvent){var evt=events.createEventObject(element,controlKeyDown,altKeyDown,shiftKeyDown,metaKeyDown);element.fireEvent('on'+eventType,evt);}
else{var evt=document.createEvent('HTMLEvents');evt.shiftKey=shiftKeyDown;evt.metaKey=metaKeyDown;evt.altKey=altKeyDown;evt.ctrlKey=controlKeyDown;evt.initEvent(eventType,canBubble,true);element.dispatchEvent(evt);}};this.getKeyCodeFromKeySequence=function(keySequence){var match=/^\\(\d{1,3})$/.exec(keySequence);if(match!=null){return match[1];}
match=/^.$/.exec(keySequence);if(match!=null){return match[0].charCodeAt(0);}
match=/^\d{2,3}$/.exec(keySequence);if(match!=null){return match[0];}
windmill.err("invalid keySequence");}
this.triggerKeyEvent=function(element,eventType,keySequence,canBubble,controlKeyDown,altKeyDown,shiftKeyDown,metaKeyDown){var keycode=events.getKeyCodeFromKeySequence(keySequence);canBubble=(typeof(canBubble)==undefined)?true:canBubble;if(element.fireEvent){var keyEvent=events.createEventObject(element,controlKeyDown,altKeyDown,shiftKeyDown,metaKeyDown);keyEvent.keyCode=keycode;element.fireEvent('on'+eventType,keyEvent);}
else{var evt;if(window.KeyEvent){evt=document.createEvent('KeyEvents');evt.initKeyEvent(eventType,true,true,window,controlKeyDown,altKeyDown,shiftKeyDown,metaKeyDown,keycode,keycode);}
else{evt=document.createEvent('UIEvent');evt.shiftKey=shiftKeyDown;evt.metaKey=metaKeyDown;evt.altKey=altKeyDown;evt.ctrlKey=controlKeyDown;evt.initUIEvent(eventType,true,true,window,1);evt.charCode=keycode;evt.keyCode=keycode;evt.which=keycode;}
element.dispatchEvent(evt);}}
this.triggerMouseEvent=function(element,eventType,canBubble,clientX,clientY,controlKeyDown,altKeyDown,shiftKeyDown,metaKeyDown){clientX=clientX?clientX:0;clientY=clientY?clientY:0;var screenX=0;var screenY=0;canBubble=(typeof(canBubble)==undefined)?true:canBubble;if(element.fireEvent){var evt=events.createEventObject(element,controlKeyDown,altKeyDown,shiftKeyDown,metaKeyDown);evt.detail=0;evt.button=1;evt.relatedTarget=null;if(!screenX&&!screenY&&!clientX&&!clientY){if(eventType=="click"){element.click();}
else{element.fireEvent('on'+eventType);}}
else{evt.screenX=screenX;evt.screenY=screenY;evt.clientX=clientX;evt.clientY=clientY;try{windmill.testWin().event=evt;}
catch(e){}
element.fireEvent('on'+eventType,evt);}}
else{var evt=document.createEvent('MouseEvents');if(evt.initMouseEvent){evt.initMouseEvent(eventType,canBubble,true,document.defaultView,1,screenX,screenY,clientX,clientY,controlKeyDown,altKeyDown,shiftKeyDown,metaKeyDown,0,null)}
else{evt.initEvent(eventType,canBubble,true);evt.shiftKey=shiftKeyDown;evt.metaKey=metaKeyDown;evt.altKey=altKeyDown;evt.ctrlKey=controlKeyDown;}
element.dispatchEvent(evt);}}};(function(){var undefined=void(0);var defaultConfig={targetFrame:undefined,exportInstaller:false,useNative:true,useInnerText:true};var config;if(window.jsxpath){config=window.jsxpath;}
else{var scriptElms=document.getElementsByTagName('script');var scriptElm=scriptElms[scriptElms.length-1];var scriptSrc=scriptElm.src;config={};var scriptSrcMatchResult=scriptSrc.match(/\?(.*)$/);if(scriptSrcMatchResult){var configStrings=scriptSrcMatchResult[1].split('&');for(var i=0,l=configStrings.length;i<l;i++){var configString=configStrings[i];var configStringSplited=configString.split('=');var configName=configStringSplited[0];var configValue=configStringSplited[1];if(configValue==undefined){configValue==true;}
else if(configValue=='false'||/^-?\d+$/.test(configValue)){configValue=eval(configValue);}
config[configName]=configValue;}}}
for(var n in defaultConfig){if(!(n in config))config[n]=defaultConfig[n];}
config.hasNative=!!(document.implementation&&document.implementation.hasFeature&&document.implementation.hasFeature("XPath",null));if(config.hasNative&&config.useNative&&!config.exportInstaller){return;}
var BinaryExpr;var FilterExpr;var FunctionCall;var Literal;var NameTest;var NodeSet;var NodeType;var NodeUtil;var Number;var PathExpr;var Step;var UnaryExpr;var UnionExpr;var VariableReference;var uai=new function(){var ua=navigator.userAgent;if(RegExp==undefined){if(ua.indexOf("Opera")>=0){this.opera=true;}else if(ua.indexOf("Netscape")>=0){this.netscape=true;}else if(ua.indexOf("Mozilla/")==0){this.mozilla=true;}else{this.unknown=true;}
if(ua.indexOf("Gecko/")>=0){this.gecko=true;}
if(ua.indexOf("Win")>=0){this.windows=true;}else if(ua.indexOf("Mac")>=0){this.mac=true;}else if(ua.indexOf("Linux")>=0){this.linux=true;}else if(ua.indexOf("BSD")>=0){this.bsd=true;}else if(ua.indexOf("SunOS")>=0){this.sunos=true;}}
else{if(/AppleWebKit\/(\d+(?:\.\d+)*)/.test(ua)){this.applewebkit=RegExp.$1;if(RegExp.$1.charAt(0)==4){this.applewebkit2=true;}
else{this.applewebkit3=true;}}
else if(typeof Components=="object"&&(/Gecko\/(\d{8})/.test(ua)||navigator.product=="Gecko"&&/^(\d{8})$/.test(navigator.productSub))){this.gecko=RegExp.$1;}
if(typeof(opera)=="object"&&typeof(opera.version)=="function"){this.opera=opera.version();this['opera'+this.opera[0]+this.opera[2]]=true;}else if(typeof opera=="object"&&(/Opera[\/ ](\d+\.\d+)/.test(ua))){this.opera=RegExp.$1;}else if(this.ie){}else if(/Safari\/(\d+(?:\.\d+)*)/.test(ua)){this.safari=RegExp.$1;}else if(/NetFront\/(\d+(?:\.\d+)*)/.test(ua)){this.netfront=RegExp.$1;}else if(/Konqueror\/(\d+(?:\.\d+)*)/.test(ua)){this.konqueror=RegExp.$1;}else if(ua.indexOf("(compatible;")<0&&(/^Mozilla\/(\d+\.\d+)/.test(ua))){this.mozilla=RegExp.$1;if(/\([^(]*rv:(\d+(?:\.\d+)*).*?\)/.test(ua))
this.mozillarv=RegExp.$1;if(/Firefox\/(\d+(?:\.\d+)*)/.test(ua)){this.firefox=RegExp.$1;}else if(/Netscape\d?\/(\d+(?:\.\d+)*)/.test(ua)){this.netscape=RegExp.$1;}}else{this.unknown=true;}
if(ua.indexOf("Win 9x 4.90")>=0){this.windows="ME";}else if(/Win(?:dows)? ?(NT ?(\d+\.\d+)?|\d+|ME|Vista|XP)/.test(ua)){this.windows=RegExp.$1;if(RegExp.$2){this.winnt=RegExp.$2;}else switch(RegExp.$1){case"2000":this.winnt="5.0";break;case"XP":this.winnt="5.1";break;case"Vista":this.winnt="6.0";break;}}else if(ua.indexOf("Mac")>=0){this.mac=true;}else if(ua.indexOf("Linux")>=0){this.linux=true;}else if(/(\w*BSD)/.test(ua)){this.bsd=RegExp.$1;}else if(ua.indexOf("SunOS")>=0){this.sunos=true;}}};var Lexer=function(source){var proto=Lexer.prototype;var tokens=source.match(proto.regs.token);for(var i=0,l=tokens.length;i<l;i++){if(proto.regs.strip.test(tokens[i])){tokens.splice(i,1);}}
for(var n in proto)tokens[n]=proto[n];tokens.index=0;return tokens;};Lexer.prototype.regs={token:/\$?(?:(?![0-9-])[\w-]+:)?(?![0-9-])[\w-]+|\/\/|\.\.|::|\d+(?:\.\d*)?|\.\d+|"[^"]*"|'[^']*'|[!<>]=|(?![0-9-])[\w-]+:\*|\s+|./g,strip:/^\s/};Lexer.prototype.peek=function(i){return this[this.index+(i||0)];};Lexer.prototype.next=function(){return this[this.index++];};Lexer.prototype.back=function(){this.index--;};Lexer.prototype.empty=function(){return this.length<=this.index;};var Ctx=function(node,position,last){this.node=node;this.position=position||1;this.last=last||1;};var BaseExpr=function(){};BaseExpr.prototype.number=function(ctx){var exrs=this.evaluate(ctx);if(exrs.isNodeSet)return exrs.number();return+exrs;};BaseExpr.prototype.string=function(ctx){var exrs=this.evaluate(ctx);if(exrs.isNodeSet)return exrs.string();return''+exrs;};BaseExpr.prototype.bool=function(ctx){var exrs=this.evaluate(ctx);if(exrs.isNodeSet)return exrs.bool();return!!exrs;};var BaseExprHasPredicates=function(){};BaseExprHasPredicates.parsePredicates=function(lexer,expr){while(lexer.peek()=='['){lexer.next();if(lexer.empty()){throw Error('missing predicate expr');}
var predicate=BinaryExpr.parse(lexer);expr.predicate(predicate);if(lexer.empty()){throw Error('unclosed predicate expr');}
if(lexer.next()!=']'){lexer.back();throw Error('bad token: '+lexer.next());}}};BaseExprHasPredicates.prototyps=new BaseExpr();BaseExprHasPredicates.prototype.evaluatePredicates=function(nodeset,start){var predicates,predicate,nodes,node,nodeset,position,reverse;reverse=this.reverse;predicates=this.predicates;nodeset.sort();for(var i=start||0,l0=predicates.length;i<l0;i++){predicate=predicates[i];var deleteIndexes=[];var nodes=nodeset.list();for(var j=0,l1=nodes.length;j<l1;j++){position=reverse?(l1-j):(j+1);exrs=predicate.evaluate(new Ctx(nodes[j],position,l1));switch(typeof exrs){case'number':exrs=(position==exrs);break;case'string':exrs=!!exrs;break;case'object':exrs=exrs.bool();break;}
if(!exrs){deleteIndexes.push(j);}}
for(var j=deleteIndexes.length-1,l1=0;j>=l1;j--){nodeset.del(deleteIndexes[j]);}}
return nodeset;};if(!window.BinaryExpr&&window.defaultConfig)
window.BinaryExpr=null;BinaryExpr=function(op,left,right,datatype){this.op=op;this.left=left;this.right=right;this.datatype=BinaryExpr.ops[op][2];this.needContextPosition=left.needContextPosition||right.needContextPosition;this.needContextNode=left.needContextNode||right.needContextNode;if(this.op=='='){if(!right.needContextNode&&!right.needContextPosition&&right.datatype!='nodeset'&&right.datatype!='void'&&left.quickAttr){this.quickAttr=true;this.attrName=left.attrName;this.attrValueExpr=right;}
else if(!left.needContextNode&&!left.needContextPosition&&left.datatype!='nodeset'&&left.datatype!='void'&&right.quickAttr){this.quickAttr=true;this.attrName=right.attrName;this.attrValueExpr=left;}}};BinaryExpr.compare=function(op,comp,left,right,ctx){var type,lnodes,rnodes,nodes,nodeset,primitive;left=left.evaluate(ctx);right=right.evaluate(ctx);if(left.isNodeSet&&right.isNodeSet){lnodes=left.list();rnodes=right.list();for(var i=0,l0=lnodes.length;i<l0;i++)
for(var j=0,l1=rnodes.length;j<l1;j++)
if(comp(NodeUtil.to('string',lnodes[i]),NodeUtil.to('string',rnodes[j])))
return true;return false;}
if(left.isNodeSet||right.isNodeSet){if(left.isNodeSet)
nodeset=left,primitive=right;else
nodeset=right,primitive=left;nodes=nodeset.list();type=typeof primitive;for(var i=0,l=nodes.length;i<l;i++){if(comp(NodeUtil.to(type,nodes[i]),primitive))
return true;}
return false;}
if(op=='='||op=='!='){if(typeof left=='boolean'||typeof right=='boolean'){return comp(!!left,!!right);}
if(typeof left=='number'||typeof right=='number'){return comp(+left,+right);}
return comp(left,right);}
return comp(+left,+right);};BinaryExpr.ops={'div':[6,function(left,right,ctx){return left.number(ctx)/right.number(ctx);},'number'],'mod':[6,function(left,right,ctx){return left.number(ctx)%right.number(ctx);},'number'],'*':[6,function(left,right,ctx){return left.number(ctx)*right.number(ctx);},'number'],'+':[5,function(left,right,ctx){return left.number(ctx)+right.number(ctx);},'number'],'-':[5,function(left,right,ctx){return left.number(ctx)-right.number(ctx);},'number'],'<':[4,function(left,right,ctx){return BinaryExpr.compare('<',function(a,b){return a<b},left,right,ctx);},'boolean'],'>':[4,function(left,right,ctx){return BinaryExpr.compare('>',function(a,b){return a>b},left,right,ctx);},'boolean'],'<=':[4,function(left,right,ctx){return BinaryExpr.compare('<=',function(a,b){return a<=b},left,right,ctx);},'boolean'],'>=':[4,function(left,right,ctx){return BinaryExpr.compare('>=',function(a,b){return a>=b},left,right,ctx);},'boolean'],'=':[3,function(left,right,ctx){return BinaryExpr.compare('=',function(a,b){return a==b},left,right,ctx);},'boolean'],'!=':[3,function(left,right,ctx){return BinaryExpr.compare('!=',function(a,b){return a!=b},left,right,ctx);},'boolean'],'and':[2,function(left,right,ctx){return left.bool(ctx)&&right.bool(ctx);},'boolean'],'or':[1,function(left,right,ctx){return left.bool(ctx)||right.bool(ctx);},'boolean']};BinaryExpr.parse=function(lexer){var op,precedence,info,expr,stack=[],index=lexer.index;while(true){if(lexer.empty()){throw Error('missing right expression');}
expr=UnaryExpr.parse(lexer);op=lexer.next();if(!op){break;}
info=this.ops[op];precedence=info&&info[0];if(!precedence){lexer.back();break;}
while(stack.length&&precedence<=this.ops[stack[stack.length-1]][0]){expr=new BinaryExpr(stack.pop(),stack.pop(),expr);}
stack.push(expr,op);}
while(stack.length){expr=new BinaryExpr(stack.pop(),stack.pop(),expr);}
return expr;};BinaryExpr.prototype=new BaseExpr();BinaryExpr.prototype.evaluate=function(ctx){return BinaryExpr.ops[this.op][1](this.left,this.right,ctx);};BinaryExpr.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'binary: '+this.op+'\n';indent+='    ';t+=this.left.show(indent);t+=this.right.show(indent);return t;};if(!window.UnaryExpr&&window.defaultConfig)
window.UnaryExpr=null;UnaryExpr=function(op,expr){this.op=op;this.expr=expr;this.needContextPosition=expr.needContextPosition;this.needContextNode=expr.needContextNode;};UnaryExpr.ops={'-':1};UnaryExpr.parse=function(lexer){var token;if(this.ops[lexer.peek()])
return new UnaryExpr(lexer.next(),UnaryExpr.parse(lexer));else
return UnionExpr.parse(lexer);};UnaryExpr.prototype=new BaseExpr();UnaryExpr.prototype.datatype='number';UnaryExpr.prototype.evaluate=function(ctx){return-this.expr.number(ctx);};UnaryExpr.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'unary: '+this.op+'\n';indent+='    ';t+=this.expr.show(indent);return t;};if(!window.UnionExpr&&window.defaultConfig)
window.UnionExpr=null;UnionExpr=function(){this.paths=[];};UnionExpr.ops={'|':1};UnionExpr.parse=function(lexer){var union,expr;expr=PathExpr.parse(lexer);if(!this.ops[lexer.peek()])
return expr;union=new UnionExpr();union.path(expr);while(true){if(!this.ops[lexer.next()])break;if(lexer.empty()){throw Error('missing next union location path');}
union.path(PathExpr.parse(lexer));}
lexer.back();return union;};UnionExpr.prototype=new BaseExpr();UnionExpr.prototype.datatype='nodeset';UnionExpr.prototype.evaluate=function(ctx){var paths=this.paths;var nodeset=new NodeSet();for(var i=0,l=paths.length;i<l;i++){var exrs=paths[i].evaluate(ctx);if(!exrs.isNodeSet)throw Error('PathExpr must be nodeset');nodeset.merge(exrs);}
return nodeset;};UnionExpr.prototype.path=function(path){this.paths.push(path);if(path.needContextPosition){this.needContextPosition=true;}
if(path.needContextNode){this.needContextNode=true;}}
UnionExpr.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'union:'+'\n';indent+='    ';for(var i=0;i<this.paths.length;i++){t+=this.paths[i].show(indent);}
return t;};if(!window.PathExpr&&window.defaultConfig)
window.PathExpr=null;PathExpr=function(filter){this.filter=filter;this.steps=[];this.datatype=filter.datatype;this.needContextPosition=filter.needContextPosition;this.needContextNode=filter.needContextNode;};PathExpr.ops={'//':1,'/':1};PathExpr.parse=function(lexer){var op,expr,path,token;if(this.ops[lexer.peek()]){op=lexer.next();token=lexer.peek();if(op=='/'&&(lexer.empty()||(token!='.'&&token!='..'&&token!='@'&&token!='*'&&!/(?![0-9])[\w]/.test(token)))){return FilterExpr.root();}
path=new PathExpr(FilterExpr.root());if(lexer.empty()){throw Error('missing next location step');}
expr=Step.parse(lexer);path.step(op,expr);}
else{expr=FilterExpr.parse(lexer);if(!expr){expr=Step.parse(lexer);path=new PathExpr(FilterExpr.context());path.step('/',expr);}
else if(!this.ops[lexer.peek()])
return expr;else
path=new PathExpr(expr);}
while(true){if(!this.ops[lexer.peek()])break;op=lexer.next();if(lexer.empty()){throw Error('missing next location step');}
path.step(op,Step.parse(lexer));}
return path;};PathExpr.prototype=new BaseExpr();PathExpr.prototype.evaluate=function(ctx){var nodeset=this.filter.evaluate(ctx);if(!nodeset.isNodeSet)throw Exception('Filter nodeset must be nodeset type');var steps=this.steps;for(var i=0,l0=steps.length;i<l0&&nodeset.length;i++){var step=steps[i][1];var reverse=step.reverse;var iter=nodeset.iterator(reverse);var prevNodeset=nodeset;nodeset=null;var node,next;if(!step.needContextPosition&&step.axis=='following'){for(node=iter();next=iter();node=next){if(uai.applewebkit2){var contains=false;var ancestor=next;do{if(ancestor==node){contains=true;break;}}while(ancestor=ancestor.parentNode);if(!contains)break;}
else{try{if(!node.contains(next))break}
catch(e){if(!(next.compareDocumentPosition(node)&8))break}}}
nodeset=step.evaluate(new Ctx(node));}
else if(!step.needContextPosition&&step.axis=='preceding'){node=iter();nodeset=step.evaluate(new Ctx(node));}
else{node=iter();var j=0;nodeset=step.evaluate(new Ctx(node),false,prevNodeset,j);while(node=iter()){j++;nodeset.merge(step.evaluate(new Ctx(node),false,prevNodeset,j));}}}
return nodeset;};PathExpr.prototype.step=function(op,step){step.op=op;this.steps.push([op,step]);this.quickAttr=false;if(this.steps.length==1){if(op=='/'&&step.axis=='attribute'){var test=step.test;if(!test.notOnlyElement&&test.name!='*'){this.quickAttr=true;this.attrName=test.name;}}}};PathExpr.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'path:'+'\n';indent+='    ';t+=indent+'filter:'+'\n';t+=this.filter.show(indent+'    ');if(this.steps.length){t+=indent+'steps:'+'\n';indent+='    ';for(var i=0;i<this.steps.length;i++){var step=this.steps[i];t+=indent+'operator: '+step[0]+'\n';t+=step[1].show(indent);}}
return t;};if(!window.FilterExpr&&window.defaultConfig)
window.FilterExpr=null;FilterExpr=function(primary){this.primary=primary;this.predicates=[];this.datatype=primary.datatype;this.needContextPosition=primary.needContextPosition;this.needContextNode=primary.needContextNode;};FilterExpr.parse=function(lexer){var expr,filter,token,ch;token=lexer.peek();ch=token.charAt(0);switch(ch){case'$':expr=VariableReference.parse(lexer);break;case'(':lexer.next();expr=BinaryExpr.parse(lexer);if(lexer.empty()){throw Error('unclosed "("');}
if(lexer.next()!=')'){lexer.back();throw Error('bad token: '+lexer.next());}
break;case'"':case"'":expr=Literal.parse(lexer);break;default:if(!isNaN(+token)){expr=Number.parse(lexer);}
else if(NodeType.types[token]){return null;}
else if(/(?![0-9])[\w]/.test(ch)&&lexer.peek(1)=='('){expr=FunctionCall.parse(lexer);}
else{return null;}
break;}
if(lexer.peek()!='[')return expr;filter=new FilterExpr(expr);BaseExprHasPredicates.parsePredicates(lexer,filter);return filter;};FilterExpr.root=function(){return new FunctionCall('root-node');};FilterExpr.context=function(){return new FunctionCall('context-node');};FilterExpr.prototype=new BaseExprHasPredicates();FilterExpr.prototype.evaluate=function(ctx){var nodeset=this.primary.evaluate(ctx);if(!nodeset.isNodeSet){if(this.predicates.length)
throw Error('Primary result must be nodeset type '+'if filter have predicate expression');return nodeset;}
return this.evaluatePredicates(nodeset);};FilterExpr.prototype.predicate=function(predicate){this.predicates.push(predicate);};FilterExpr.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'filter: '+'\n';indent+='    ';t+=this.primary.show(indent);if(this.predicates.length){t+=indent+'predicates: '+'\n';indent+='    ';for(var i=0;i<this.predicates.length;i++){t+=this.predicates[i].show(indent);}}
return t;};if(!window.NodeUtil&&window.defaultConfig)
window.NodeUtil=null;NodeUtil={to:function(valueType,node){var t,type=node.nodeType;if(type==1&&config.useInnerText&&!uai.applewebkit2){t=node.textContent;t=(t==undefined||t==null)?node.innerText:t;t=(t==undefined||t==null)?'':t;}
if(typeof t!='string'){if(type==9||type==1){if(type==9){node=node.documentElement;}
else{node=node.firstChild;}
for(t='',stack=[],i=0;node;){do{if(node.nodeType!=1){t+=node.nodeValue;}
stack[i++]=node;}while(node=node.firstChild);while(i&&!(node=stack[--i].nextSibling)){}}}
else{t=node.nodeValue;}}
switch(valueType){case'number':return+t;case'boolean':return!!t;default:return t;}},attrPropMap:{name:'name','class':'className',dir:'dir',id:'id',name:'name',title:'title'},attrMatch:function(node,attrName,attrValue){if(!attrName||attrValue==null&&node.hasAttribute&&node.hasAttribute(attrName)||attrValue!=null&&node.getAttribute&&node.getAttribute(attrName)==attrValue){return true;}
else{return false;}},getDescendantNodes:function(test,node,nodeset,attrName,attrValue,prevNodeset,prevIndex){if(prevNodeset){prevNodeset.delDescendant(node,prevIndex);}
if(attrValue&&attrName=='id'&&node.getElementById){node=node.getElementById(attrValue);if(node&&test.match(node)){nodeset.push(node);}}
else if(attrValue&&attrName=='name'&&node.getElementsByName){var nodes=node.getElementsByName(attrValue);for(var i=0,l=nodes.length;i<l;i++){node=nodes[i];if(uai.opera?(node.name==attrValue&&test.match(node)):test.match(node)){nodeset.push(node);}}}
else if(attrValue&&attrName=='class'&&node.getElementsByClassName){var nodes=node.getElementsByClassName(attrValue);for(var i=0,l=nodes.length;i<l;i++){node=nodes[i];if(node.className==attrValue&&test.match(node)){nodeset.push(node);}}}
else if(test.notOnlyElement){(function(parent){var f=arguments.callee;for(var node=parent.firstChild;node;node=node.nextSibling){if(NodeUtil.attrMatch(node,attrName,attrValue)){if(test.match(node.nodeType))nodeset.push(node);}
f(node);}})(node);}
else{var name=test.name;if(node.getElementsByTagName){var nodes=node.getElementsByTagName(name);if(nodes){var i=0;while(node=nodes[i++]){if(NodeUtil.attrMatch(node,attrName,attrValue))nodeset.push(node);}}}}
return nodeset;},getChildNodes:function(test,node,nodeset,attrName,attrValue){for(var node=node.firstChild;node;node=node.nextSibling){if(NodeUtil.attrMatch(node,attrName,attrValue)){if(test.match(node))nodeset.push(node);}}
return nodeset;}};if(!window.Step&&window.defaultConfig)
window.Step=null;Step=function(axis,test){this.axis=axis;this.reverse=Step.axises[axis][0];this.func=Step.axises[axis][1];this.test=test;this.predicates=[];this._quickAttr=Step.axises[axis][2]};Step.axises={ancestor:[true,function(test,node,nodeset,_,__,prevNodeset,prevIndex){while(node=node.parentNode){if(prevNodeset&&node.nodeType==1){prevNodeset.reserveDelByNode(node,prevIndex,true);}
if(test.match(node))nodeset.unshift(node);}
return nodeset;}],'ancestor-or-self':[true,function(test,node,nodeset,_,__,prevNodeset,prevIndex){do{if(prevNodeset&&node.nodeType==1){prevNodeset.reserveDelByNode(node,prevIndex,true);}
if(test.match(node))nodeset.unshift(node);}while(node=node.parentNode)
return nodeset;}],attribute:[false,function(test,node,nodeset){var attrs=node.attributes;if(attrs){if((test.notOnlyElement&&test.type==0)||test.name=='*'){for(var i=0,attr;attr=attrs[i];i++){nodeset.push(attr);}}
else{var attr=attrs.getNamedItem(test.name);if(attr){nodeset.push(attr);}}}
return nodeset;}],child:[false,NodeUtil.getChildNodes,true],descendant:[false,NodeUtil.getDescendantNodes,true],'descendant-or-self':[false,function(test,node,nodeset,attrName,attrValue,prevNodeset,prevIndex){if(NodeUtil.attrMatch(node,attrName,attrValue)){if(test.match(node))nodeset.push(node);}
return NodeUtil.getDescendantNodes(test,node,nodeset,attrName,attrValue,prevNodeset,prevIndex);},true],following:[false,function(test,node,nodeset,attrName,attrValue){do{var child=node;while(child=child.nextSibling){if(NodeUtil.attrMatch(child,attrName,attrValue)){if(test.match(child))nodeset.push(child);}
nodeset=NodeUtil.getDescendantNodes(test,child,nodeset,attrName,attrValue);}}while(node=node.parentNode);return nodeset;},true],'following-sibling':[false,function(test,node,nodeset,_,__,prevNodeset,prevIndex){while(node=node.nextSibling){if(prevNodeset&&node.nodeType==1){prevNodeset.reserveDelByNode(node,prevIndex);}
if(test.match(node)){nodeset.push(node);}}
return nodeset;}],namespace:[false,function(test,node,nodeset){return nodeset;}],parent:[false,function(test,node,nodeset){if(node.nodeType==9){return nodeset;}
if(node.nodeType==2){nodeset.push(node.ownerElement);return nodeset;}
var node=node.parentNode;if(test.match(node))nodeset.push(node);return nodeset;}],preceding:[true,function(test,node,nodeset,attrName,attrValue){var parents=[];do{parents.unshift(node);}while(node=node.parentNode);for(var i=1,l0=parents.length;i<l0;i++){var siblings=[];node=parents[i];while(node=node.previousSibling){siblings.unshift(node);}
for(var j=0,l1=siblings.length;j<l1;j++){node=siblings[j];if(NodeUtil.attrMatch(node,attrName,attrValue)){if(test.match(node))nodeset.push(node);}
nodeset=NodeUtil.getDescendantNodes(test,node,nodeset,attrName,attrValue);}}
return nodeset;},true],'preceding-sibling':[true,function(test,node,nodeset,_,__,prevNodeset,prevIndex){while(node=node.previousSibling){if(prevNodeset&&node.nodeType==1){prevNodeset.reserveDelByNode(node,prevIndex,true);}
if(test.match(node)){nodeset.unshift(node)}}
return nodeset;}],self:[false,function(test,node,nodeset){if(test.match(node))nodeset.push(node);return nodeset;}]};Step.parse=function(lexer){var axis,test,step,token;if(lexer.peek()=='.'){step=this.self();lexer.next();}
else if(lexer.peek()=='..'){step=this.parent();lexer.next();}
else{if(lexer.peek()=='@'){axis='attribute';lexer.next();if(lexer.empty()){throw Error('missing attribute name');}}
else{if(lexer.peek(1)=='::'){if(!/(?![0-9])[\w]/.test(lexer.peek().charAt(0))){throw Error('bad token: '+lexer.next());}
axis=lexer.next();lexer.next();if(!this.axises[axis]){throw Error('invalid axis: '+axis);}
if(lexer.empty()){throw Error('missing node name');}}
else{axis='child';}}
token=lexer.peek();if(!/(?![0-9])[\w]/.test(token.charAt(0))){if(token=='*'){test=NameTest.parse(lexer)}
else{throw Error('bad token: '+lexer.next());}}
else{if(lexer.peek(1)=='('){if(!NodeType.types[token]){throw Error('invalid node type: '+token);}
test=NodeType.parse(lexer)}
else{test=NameTest.parse(lexer);}}
step=new Step(axis,test);}
BaseExprHasPredicates.parsePredicates(lexer,step);return step;};Step.self=function(){return new Step('self',new NodeType('node'));};Step.parent=function(){return new Step('parent',new NodeType('node'));};Step.prototype=new BaseExprHasPredicates();Step.prototype.evaluate=function(ctx,special,prevNodeset,prevIndex){var node=ctx.node;var reverse=false;if(!special&&this.op=='//'){if(!this.needContextPosition&&this.axis=='child'){if(this.quickAttr){var attrValue=this.attrValueExpr?this.attrValueExpr.string(ctx):null;var nodeset=NodeUtil.getDescendantNodes(this.test,node,new NodeSet(),this.attrName,attrValue,prevNodeset,prevIndex);nodeset=this.evaluatePredicates(nodeset,1);}
else{var nodeset=NodeUtil.getDescendantNodes(this.test,node,new NodeSet(),null,null,prevNodeset,prevIndex);nodeset=this.evaluatePredicates(nodeset);}}
else{var step=new Step('descendant-or-self',new NodeType('node'));var nodes=step.evaluate(ctx,false,prevNodeset,prevIndex).list();var nodeset=null;step.op='/';for(var i=0,l=nodes.length;i<l;i++){if(!nodeset){nodeset=this.evaluate(new Ctx(nodes[i]),true);}
else{nodeset.merge(this.evaluate(new Ctx(nodes[i]),true));}}
nodeset=nodeset||new NodeSet();}}
else{if(this.needContextPosition){prevNodeset=null;prevIndex=null;}
if(this.quickAttr){var attrValue=this.attrValueExpr?this.attrValueExpr.string(ctx):null;var nodeset=this.func(this.test,node,new NodeSet(),this.attrName,attrValue,prevNodeset,prevIndex);nodeset=this.evaluatePredicates(nodeset,1);}
else{var nodeset=this.func(this.test,node,new NodeSet(),null,null,prevNodeset,prevIndex);nodeset=this.evaluatePredicates(nodeset);}
if(prevNodeset){prevNodeset.doDel();}}
return nodeset;};Step.prototype.predicate=function(predicate){this.predicates.push(predicate);if(predicate.needContextPosition||predicate.datatype=='number'||predicate.datatype=='void'){this.needContextPosition=true;}
if(this._quickAttr&&this.predicates.length==1&&predicate.quickAttr){var attrName=predicate.attrName;this.attrName=attrName;this.attrValueExpr=predicate.attrValueExpr;this.quickAttr=true;}};Step.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'step: '+'\n';indent+='    ';if(this.axis)t+=indent+'axis: '+this.axis+'\n';t+=this.test.show(indent);if(this.predicates.length){t+=indent+'predicates: '+'\n';indent+='    ';for(var i=0;i<this.predicates.length;i++){t+=this.predicates[i].show(indent);}}
return t;};if(!window.NodeType&&window.defaultConfig)
window.NodeType=null;NodeType=function(name,literal){this.name=name;this.literal=literal;switch(name){case'comment':this.type=8;break;case'text':this.type=3;break;case'processing-instruction':this.type=7;break;case'node':this.type=0;break;}};NodeType.types={'comment':1,'text':1,'processing-instruction':1,'node':1};NodeType.parse=function(lexer){var type,literal,ch;type=lexer.next();lexer.next();if(lexer.empty()){throw Error('bad nodetype');}
ch=lexer.peek().charAt(0);if(ch=='"'||ch=="'"){literal=Literal.parse(lexer);}
if(lexer.empty()){throw Error('bad nodetype');}
if(lexer.next()!=')'){lexer.back();throw Error('bad token '+lexer.next());}
return new NodeType(type,literal);};NodeType.prototype=new BaseExpr();NodeType.prototype.notOnlyElement=true;NodeType.prototype.match=function(node){return!this.type||this.type==node.nodeType;};NodeType.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'nodetype: '+this.type+'\n';if(this.literal){indent+='    ';t+=this.literal.show(indent);}
return t;};if(!window.NameTest&&window.defaultConfig)
window.NameTest=null;NameTest=function(name){this.name=name.toLowerCase();};NameTest.parse=function(lexer){if(lexer.peek()!='*'&&lexer.peek(1)==':'&&lexer.peek(2)=='*'){return new NameTest(lexer.next()+lexer.next()+lexer.next());}
return new NameTest(lexer.next());};NameTest.prototype=new BaseExpr();NameTest.prototype.match=function(node){var type=node.nodeType;if(type==1||type==2){if(this.name=='*'||this.name==node.nodeName.toLowerCase()){return true;}}
return false;};NameTest.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'nametest: '+this.name+'\n';return t;};if(!window.VariableReference&&window.defaultConfig)
window.VariableReference=null;VariableReference=function(name){this.name=name.substring(1);};VariableReference.parse=function(lexer){var token=lexer.next();if(token.length<2){throw Error('unnamed variable reference');}
return new VariableReference(token)};VariableReference.prototype=new BaseExpr();VariableReference.prototype.datatype='void';VariableReference.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'variable: '+this.name+'\n';return t;};if(!window.Literal&&window.defaultConfig)
window.Literal=null;Literal=function(text){this.text=text.substring(1,text.length-1);};Literal.parse=function(lexer){var token=lexer.next();if(token.length<2){throw Error('unclosed literal string');}
return new Literal(token)};Literal.prototype=new BaseExpr();Literal.prototype.datatype='string';Literal.prototype.evaluate=function(ctx){return this.text;};Literal.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'literal: '+this.text+'\n';return t;};if(!window.Number&&window.defaultConfig)
window.Number=null;Number=function(digit){this.digit=+digit;};Number.parse=function(lexer){return new Number(lexer.next());};Number.prototype=new BaseExpr();Number.prototype.datatype='number';Number.prototype.evaluate=function(ctx){return this.digit;};Number.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'number: '+this.digit+'\n';return t;};if(!window.FunctionCall&&window.defaultConfig)
window.FunctionCall=null;FunctionCall=function(name){var info=FunctionCall.funcs[name];if(!info)
throw Error(name+' is not a function');this.name=name;this.func=info[0];this.args=[];this.datatype=info[1];if(info[2]){this.needContextPosition=true;}
this.needContextNodeInfo=info[3];this.needContextNode=this.needContextNodeInfo[0]};FunctionCall.funcs={'context-node':[function(){if(arguments.length!=0){throw Error('Function context-node expects ()');}
var ns;ns=new NodeSet();ns.push(this.node);return ns;},'nodeset',false,[true]],'root-node':[function(){if(arguments.length!=0){throw Error('Function root-node expects ()');}
var ns,ctxn;ns=new NodeSet();ctxn=this.node;if(ctxn.nodeType==9)
ns.push(ctxn);else
ns.push(ctxn.ownerDocument);return ns;},'nodeset',false,[]],last:[function(){if(arguments.length!=0){throw Error('Function last expects ()');}
return this.last;},'number',true,[]],position:[function(){if(arguments.length!=0){throw Error('Function position expects ()');}
return this.position;},'number',true,[]],count:[function(ns){if(arguments.length!=1||!(ns=ns.evaluate(this)).isNodeSet){throw Error('Function count expects (nodeset)');}
return ns.length;},'number',false,[]],id:[function(s){var ids,ns,i,id,elm,ctxn,doc;if(arguments.length!=1){throw Error('Function id expects (object)');}
ctxn=this.node;if(ctxn.nodeType==9)
doc=ctxn;else
doc=ctxn.ownerDocument;s=s.string(this);ids=s.split(/\s+/);ns=new NodeSet();for(i=0,l=ids.length;i<l;i++){id=ids[i];elm=doc.getElementById(id);if(uai.opera&&elm&&elm.id!=id){var elms=doc.getElementsByName(id);for(var j=0,l0=elms.length;j<l0;j++){elm=elms[j];if(elm.id==id){ns.push(elm);}}}
else{if(elm)ns.push(elm)}}
ns.isSorted=false;return ns;},'nodeset',false,[]],'local-name':[function(ns){var nd;switch(arguments.length){case 0:nd=this.node;break;case 1:if((ns=ns.evaluate(this)).isNodeSet){nd=ns.first();break;}
default:throw Error('Function local-name expects (nodeset?)');break;}
return''+nd.nodeName.toLowerCase();},'string',false,[true,false]],name:[function(ns){return FunctionCall.funcs['local-name'][0].apply(this,arguments);},'string',false,[true,false]],'namespace-uri':[function(ns){return'';},'string',false,[true,false]],string:[function(s){switch(arguments.length){case 0:s=NodeUtil.to('string',this.node);break;case 1:s=s.string(this);break;default:throw Error('Function string expects (object?)');break;}
return s;},'string',false,[true,false]],concat:[function(s1,s2){if(arguments.length<2){throw Error('Function concat expects (string, string[, ...])');}
for(var t='',i=0,l=arguments.length;i<l;i++){t+=arguments[i].string(this);}
return t;},'string',false,[]],'starts-with':[function(s1,s2){if(arguments.length!=2){throw Error('Function starts-with expects (string, string)');}
s1=s1.string(this);s2=s2.string(this);return s1.indexOf(s2)==0;},'boolean',false,[]],contains:[function(s1,s2){if(arguments.length!=2){throw Error('Function contains expects (string, string)');}
s1=s1.string(this);s2=s2.string(this);return s1.indexOf(s2)!=-1;},'boolean',false,[]],substring:[function(s,n1,n2){var a1,a2;s=s.string(this);n1=n1.number(this);switch(arguments.length){case 2:n2=s.length-n1+1;break;case 3:n2=n2.number(this);break;default:throw Error('Function substring expects (string, string)');break;}
n1=Math.round(n1);n2=Math.round(n2);a1=n1-1;a2=n1+n2-1;if(a2==Infinity){return s.substring(a1<0?0:a1);}
else{return s.substring(a1<0?0:a1,a2)}},'string',false,[]],'substring-before':[function(s1,s2){var n;if(arguments.length!=2){throw Error('Function substring-before expects (string, string)');}
s1=s1.string(this);s2=s2.string(this);n=s1.indexOf(s2);if(n==-1)return'';return s1.substring(0,n);},'string',false,[]],'substring-after':[function(s1,s2){if(arguments.length!=2){throw Error('Function substring-after expects (string, string)');}
s1=s1.string(this);s2=s2.string(this);var n=s1.indexOf(s2);if(n==-1)return'';return s1.substring(n+s2.length);},'string',false,[]],'string-length':[function(s){switch(arguments.length){case 0:s=NodeUtil.to('string',this.node);break;case 1:s=s.string(this);break;default:throw Error('Function string-length expects (string?)');break;}
return s.length;},'number',false,[true,false]],'normalize-space':[function(s){switch(arguments.length){case 0:s=NodeUtil.to('string',this.node);break;case 1:s=s.string(this);break;default:throw Error('Function normalize-space expects (string?)');break;}
return s.replace(/\s+/g,' ').replace(/^ /,'').replace(/ $/,'');},'string',false,[true,false]],translate:[function(s1,s2,s3){if(arguments.length!=3){throw Error('Function translate expects (string, string, string)');}
s1=s1.string(this);s2=s2.string(this);s3=s3.string(this);var map=[];for(var i=0,l=s2.length;i<l;i++){var ch=s2.charAt(i);if(!map[ch])map[ch]=s3.charAt(i)||'';}
for(var t='',i=0,l=s1.length;i<l;i++){var ch=s1.charAt(i);var replace=map[ch]
t+=(replace!=undefined)?replace:ch;}
return t;},'string',false,[]],'boolean':[function(b){if(arguments.length!=1){throw Error('Function boolean expects (object)');}
return b.bool(this)},'boolean',false,[]],not:[function(b){if(arguments.length!=1){throw Error('Function not expects (object)');}
return!b.bool(this)},'boolean',false,[]],'true':[function(){if(arguments.length!=0){throw Error('Function true expects ()');}
return true;},'boolean',false,[]],'false':[function(){if(arguments.length!=0){throw Error('Function false expects ()');}
return false;},'boolean',false,[]],lang:[function(s){return false;},'boolean',false,[]],number:[function(n){switch(arguments.length){case 0:n=NodeUtil.to('number',this.node);break;case 1:n=n.number(this);break;default:throw Error('Function number expects (object?)');break;}
return n;},'number',false,[true,false]],sum:[function(ns){var nodes,n,i,l;if(arguments.length!=1||!(ns=ns.evaluate(this)).isNodeSet){throw Error('Function sum expects (nodeset)');}
nodes=ns.list();n=0;for(i=0,l=nodes.length;i<l;i++){n+=NodeUtil.to('number',nodes[i]);}
return n;},'number',false,[]],floor:[function(n){if(arguments.length!=1){throw Error('Function floor expects (number)');}
n=n.number(this);return Math.floor(n);},'number',false,[]],ceiling:[function(n){if(arguments.length!=1){throw Error('Function ceiling expects (number)');}
n=n.number(this);return Math.ceil(n);},'number',false,[]],round:[function(n){if(arguments.length!=1){throw Error('Function round expects (number)');}
n=n.number(this);return Math.round(n);},'number',false,[]]};FunctionCall.parse=function(lexer){var expr,func=new FunctionCall(lexer.next());lexer.next();while(lexer.peek()!=')'){if(lexer.empty()){throw Error('missing function argument list');}
expr=BinaryExpr.parse(lexer);func.arg(expr);if(lexer.peek()!=',')break;lexer.next();}
if(lexer.empty()){throw Error('unclosed function argument list');}
if(lexer.next()!=')'){lexer.back();throw Error('bad token: '+lexer.next());}
return func};FunctionCall.prototype=new BaseExpr();FunctionCall.prototype.evaluate=function(ctx){return this.func.apply(ctx,this.args);};FunctionCall.prototype.arg=function(arg){this.args.push(arg);if(arg.needContextPosition){this.needContextPosition=true;}
var args=this.args;if(arg.needContextNode){args.needContexNode=true;}
this.needContextNode=args.needContextNode||this.needContextNodeInfo[args.length];};FunctionCall.prototype.show=function(indent){indent=indent||'';var t='';t+=indent+'function: '+this.name+'\n';indent+='    ';if(this.args.length){t+=indent+'arguments: '+'\n';indent+='    ';for(var i=0;i<this.args.length;i++){t+=this.args[i].show(indent);}}
return t;};var NodeID={uuid:1,get:function(node){return node.__jsxpath_id__||(node.__jsxpath_id__=this.uuid++);}};if(!window.NodeSet&&window.defaultConfig)
window.NodeSet=null;NodeSet=function(){this.length=0;this.nodes=[];this.seen={};this.idIndexMap=null;this.reserveDels=[];};NodeSet.prototype.isNodeSet=true;NodeSet.prototype.isSorted=true;NodeSet.prototype.merge=function(nodeset){this.isSorted=false;if(nodeset.only){return this.push(nodeset.only);}
if(this.only){var only=this.only;delete this.only;this.push(only);this.length--;}
var nodes=nodeset.nodes;for(var i=0,l=nodes.length;i<l;i++){this._add(nodes[i]);}};NodeSet.prototype.sort=function(){if(this.only)return;if(this.sortOff)return;if(!this.isSorted){this.isSorted=true;this.idIndexMap=null;var nodes=this.nodes;nodes.sort(function(a,b){if(a==b)return 0;if(a.compareDocumentPosition){var result=a.compareDocumentPosition(b);if(result&2)return 1;if(result&4)return-1;return 0;}
else{var node1=a,node2=b,ancestor1=a,ancestor2=b,deep1=0,deep2=0;while(ancestor1=ancestor1.parentNode)deep1++;while(ancestor2=ancestor2.parentNode)deep2++;if(deep1>deep2){while(deep1--!=deep2)node1=node1.parentNode;if(node1==node2)return 1;}
else if(deep2>deep1){while(deep2--!=deep1)node2=node2.parentNode;if(node1==node2)return-1;}
while((ancestor1=node1.parentNode)!=(ancestor2=node2.parentNode)){node1=ancestor1;node2=ancestor2;}
while(node1=node1.nextSibling)if(node1==node2)return-1;return 1;}});}};NodeSet.prototype.reserveDelByNodeID=function(id,offset,reverse){var map=this.createIdIndexMap();var index;if(index=map[id]){if(reverse&&(this.length-offset-1)>index||!reverse&&offset<index){var obj={value:index,order:String.fromCharCode(index),toString:function(){return this.order},valueOf:function(){return this.value}};this.reserveDels.push(obj);}}};NodeSet.prototype.reserveDelByNode=function(node,offset,reverse){this.reserveDelByNodeID(NodeID.get(node),offset,reverse);};NodeSet.prototype.doDel=function(){if(!this.reserveDels.length)return;if(this.length<0x10000){var dels=this.reserveDels.sort(function(a,b){return b-a});}
else{var dels=this.reserveDels.sort(function(a,b){return b-a});}
for(var i=0,l=dels.length;i<l;i++){this.del(dels[i]);}
this.reserveDels=[];this.idIndexMap=null;};NodeSet.prototype.createIdIndexMap=function(){if(this.idIndexMap){return this.idIndexMap;}
else{var map=this.idIndexMap={};var nodes=this.nodes;for(var i=0,l=nodes.length;i<l;i++){var node=nodes[i];var id=NodeID.get(node);map[id]=i;}
return map;}};NodeSet.prototype.del=function(index){this.length--;if(this.only){delete this.only;}
else{var node=this.nodes.splice(index,1)[0];if(this._first==node){delete this._first;delete this._firstSourceIndex;delete this._firstSubIndex;}
delete this.seen[NodeID.get(node)];}};NodeSet.prototype.delDescendant=function(elm,offset){if(this.only)return;var nodeType=elm.nodeType;if(nodeType!=1&&nodeType!=9)return;if(uai.applewebkit2)return;if(!elm.contains){if(nodeType==1){var _elm=elm;elm={contains:function(node){return node.compareDocumentPosition(_elm)&8;}};}
else{elm={contains:function(){return true;}};}}
var nodes=this.nodes;for(var i=offset+1;i<nodes.length;i++){if(elm.contains(nodes[i])){this.del(i);i--;}}};NodeSet.prototype._add=function(node,reverse){var seen=this.seen;var id=NodeID.get(node);if(seen[id])return true;seen[id]=true;this.length++;if(reverse)
this.nodes.unshift(node);else
this.nodes.push(node);};NodeSet.prototype.unshift=function(node){if(!this.length){this.length++;this.only=node;return}
if(this.only){var only=this.only;delete this.only;this.unshift(only);this.length--;}
return this._add(node,true);};NodeSet.prototype.push=function(node){if(!this.length){this.length++;this.only=node;return;}
if(this.only){var only=this.only;delete this.only;this.push(only);this.length--;}
return this._add(node);};NodeSet.prototype.first=function(){if(this.only)return this.only;if(this.nodes.length>1)this.sort();return this.nodes[0];};NodeSet.prototype.list=function(){if(this.only)return[this.only];this.sort();return this.nodes;};NodeSet.prototype.string=function(){var node=this.only||this.first();return node?NodeUtil.to('string',node):'';};NodeSet.prototype.bool=function(){return!!(this.length||this.only);};NodeSet.prototype.number=function(){return+this.string();};NodeSet.prototype.iterator=function(reverse){this.sort();var nodeset=this;if(!reverse){var count=0;return function(){if(nodeset.only&&count++==0)return nodeset.only;return nodeset.nodes[count++];};}
else{var count=0;return function(){var index=nodeset.length-(count++)-1;if(nodeset.only&&index==0)return nodeset.only;return nodeset.nodes[index];};}};var install=function(win){win=win||this;var doc=win.document;var undefined=win.undefined;win.XPathExpression=function(expr){if(!expr.length){throw win.Error('no expression');}
var lexer=this.lexer=Lexer(expr);if(lexer.empty()){throw win.Error('no expression');}
this.expr=BinaryExpr.parse(lexer);if(!lexer.empty()){throw win.Error('bad token: '+lexer.next());}};win.XPathExpression.prototype.evaluate=function(node,type){return new win.XPathResult(this.expr.evaluate(new Ctx(node)),type);};win.XPathResult=function(value,type){if(type==0){switch(typeof value){case'object':type++;case'boolean':type++;case'string':type++;case'number':type++;}}
this.resultType=type;switch(type){case 1:this.numberValue=value.isNodeSet?value.number():+value;return;case 2:this.stringValue=value.isNodeSet?value.string():''+value;return;case 3:this.booleanValue=value.isNodeSet?value.bool():!!value;return;case 4:case 5:case 6:case 7:this.nodes=value.list();this.snapshotLength=value.length;this.index=0;this.invalidIteratorState=false;break;case 8:case 9:this.singleNodeValue=value.first();return;}};win.XPathResult.prototype.iterateNext=function(){return this.nodes[this.index++]};win.XPathResult.prototype.snapshotItem=function(i){return this.nodes[i]};win.XPathResult.ANY_TYPE=0;win.XPathResult.NUMBER_TYPE=1;win.XPathResult.STRING_TYPE=2;win.XPathResult.BOOLEAN_TYPE=3;win.XPathResult.UNORDERED_NODE_ITERATOR_TYPE=4;win.XPathResult.ORDERED_NODE_ITERATOR_TYPE=5;win.XPathResult.UNORDERED_NODE_SNAPSHOT_TYPE=6;win.XPathResult.ORDERED_NODE_SNAPSHOT_TYPE=7;win.XPathResult.ANY_UNORDERED_NODE_TYPE=8;win.XPathResult.FIRST_ORDERED_NODE_TYPE=9;doc.createExpression=function(expr){return new win.XPathExpression(expr,null);};doc.evaluate=function(expr,context,_,type){return doc.createExpression(expr,null).evaluate(context,type);};};var win;if(config.targetFrame){var frame=document.getElementById(config.targetFrame);if(frame)win=frame.contentWindow;}
if(config.exportInstaller){window.install=install;}
if(!config.hasNative||!config.useNative){install(win||window);}})();wminit=function(){var o=document.createElement('div');o.id='wmUI';o.style.width="500px";o.style.height="125px";o.style.position="absolute";o.style.top="0px";o.style.left="0px";o.style.background="#696969";o.style.border="2px solid #aaa";o.style.zIndex="9999999";o.style.display="none";o.style.opacity="0.9";o.style.filter="alpha(opacity=90)";document.body.appendChild(o);var d=document.createElement('div');d.id='wmOut';d.style.top="5px";d.style.left="5px";d.style.width="200px";d.style.height="80px";d.style.position="relative";d.style.overflow="auto";d.style.background="lightblue";d.style.border="1px solid #aaa";d.style.font="11px arial";d.style.padding="4px";o.appendChild(d);var i=document.createElement('textarea');i.id='wmIn';i.cols="32";i.rows="5";i.style.left="220px";i.style.top="5px";i.style.position="absolute";i.onkeypress=function(e){if(e.charCode==96){this.blur();}};o.appendChild(i);var b=document.createElement('button');b.innerHTML="Run Test";b.style.left="420px";b.style.top="95px";b.style.position="absolute";b.onclick=function(){var code=document.getElementById('wmIn').value;var fa=[];re=/(^var\s+|^function\s+)(test_[^\s(]+)/gm;while(m=re.exec(code)){fa.push(m[2]);}
try{eval(code);}catch(err){alert('Your code is the suck, '+err);}
for(var f=0;f<fa.length;f++){wm.write(fa[f],null);eval(fa[f]+'()');}};o.appendChild(b);var l=document.createElement('div');l.style.fontColor="darkgray";l.innerHTML="<p><i>Windmill Lite</i>";o.appendChild(l);};window.document.onkeypress=function(e){var o=document.getElementById('wmUI');if((e.altKey==true)&&(e.charCode==8224)){if(o.style.display=="block"){o.style.display="none";return;}
o.style.display="block";}};(function(){try{var pagebdy=window.document.body;wminit();}
catch(err){window.onload=wminit;}})();wm=new function(){this.win=window;this.asleep=false;this.stack=[];this.errorArr=[];this.err=function(s){wm.errorArr.push(s);};this.doStack=function(){while(this.stack.length!=0){if(this.asleep){return;}
var act=this.stack.shift();try{if(act.meth.indexOf('.')==-1){this.ctrl[act.meth](act.p);}
else{var ns=act.meth.split('.');this.ctrl[ns[0]][ns[1]](act.p);}
wm.write('Starting: <b>'+act.meth+'</b>',true);}
catch(err){wm.write(err,false);}}};this.user=function(meth,p){if(this.asleep){this.stack.push({'meth':meth,'p':p});return;}
if(this.stack.length!=0){this.doStack();}
try{if(meth.indexOf('.')==-1){this.ctrl[meth](p);}
else{var ns=meth.split('.');this.ctrl[ns[0]][ns[1]](p);}
wm.write('Starting: <b>'+meth+'</b>',true)}catch(err){wm.write(err,false);}};this.write=function(s,bool){var o=document.getElementById('wmOut');if(o){if(bool==null){o.innerHTML+='<b>Running: '+s+'</b><br>';}
else{o.innerHTML+=s;if(bool){o.innerHTML+=' -- <font color="darkgreen"><b>PASS</b></font>'+'<br>';}
else{o.innerHTML+=' -- <font color="darkred"><b>FAIL</b></font>'+'<br>';}}
o.scrollTop=o.scrollHeight;}};};wm.ctrl=new function(){this.asserts={};this.waits={};}
wm.ctrl.waits.sleep=function(p){wm.asleep=true;setTimeout('wm.asleep = false; wm.doStack();',p.ms);}
wm.ctrl.waits.forElement=function(p){wm.asleep=true;if(p.timeout){window.searchTimeout=p.timeout;}
else{window.searchTimeout=8000;}
window.incTimeout=0;window.node=p;window.search=function(){var element=null;try{element=elementslib.lookup(window.node);}catch(err){var error=err;}
if(element!=null){clearInterval(window.searchIntv);wm.asleep=false;wm.doStack();}
else{window.incTimeout+=100;if(window.incTimeout>=window.searchTimeout){clearInterval(window.searchIntv);wm.write(error,false);wm.asleep=false;wm.doStack();}}}
window.searchIntv=setInterval('window.search()',100);}
wm.ctrl.open=function(p){wm.win.location=p.url;};wm.ctrl.select=function(p){var element=elementslib.lookup(p);if(p.index){element.options[p.index].selected=true;return true;}
try{if(element.options[element.options.selectedIndex].text==p['option']){return true;}}catch(err){wm.err(err)}
try{if(element.options[element.options.selectedIndex].value==p['val']){return true;}}catch(err){wm.err(err)}
events.triggerEvent(element,'focus',false);var optionToSelect=null;for(opt=0;opt<element.options.length;opt++){try{var el=element.options[opt];if(p.option!=undefined){if(el.innerHTML.indexOf(p.option)!=-1){if(el.selected&&el.options[opt]==optionToSelect){continue;}
optionToSelect=el;optionToSelect.selected=true;events.triggerEvent(element,'change',true);break;}}
else{if(el.value.indexOf(p.val)!=-1){if(el.selected&&el.options[opt]==optionToSelect){continue;}
optionToSelect=el;optionToSelect.selected=true;events.triggerEvent(element,'change',true);break;}}}
catch(err){}}
if(optionToSelect==null){throw"Unable to select the specified option.";}};wm.ctrl.mouseDown=function(p){var mupElement=elementslib.lookup(p);if(mupElement==null){mupElement=wm.win.document.body;}
if(/MSIE[\/\s](\d+\.\d+)/.test(navigator.userAgent)){var box=mupElement.getBoundingClientRect();var left=box.left;var top=box.top+2;events.triggerMouseEvent(mupElement,'mousedown',true,left,top);}
else{events.triggerMouseEvent(mupElement,'mousedown',true);}};wm.ctrl.mouseMoveTo=function(p){var webApp=wm.win;var coords=p.coords.split(',');coords[0]=coords[0].replace('(','');coords[1]=coords[1].replace(')','');events.triggerMouseEvent(webApp.document.body,'mousemove',true,coords[0],coords[1]);};wm.ctrl.mouseUp=function(p){try{var mupElement=elementslib.lookup(p);}catch(err){}
if(mupElement==null){mupElement=wm.win.document.body;}
if(/MSIE[\/\s](\d+\.\d+)/.test(navigator.userAgent)){var box=mupElement.getBoundingClientRect();var left=box.left;var top=box.top+2;events.triggerMouseEvent(mupElement,'mouseup',true,left,top);}
else{events.triggerMouseEvent(mupElement,'mouseup',true);}};wm.ctrl.mouseOver=function(p){var mdnElement=elementslib.lookup(p);events.triggerMouseEvent(mdnElement,'mouseover',true);};wm.ctrl.mouseOut=function(p){var mdnElement=elementslib.lookup(p);events.triggerMouseEvent(mdnElement,'mouseout',true);};wm.ctrl.keyPress=function(p){try{var element=elementslib.lookup(p);}catch(err){var element=wm.win.document.body;}
p.options=p.options.replace(/ /g,"");var opts=p.options.split(",");events.triggerEvent(element,'focus',false);events.triggerKeyEvent(element,"keypress",opts[0],eval(opts[1]),eval(opts[2]),eval(opts[3]),eval(opts[4]),eval(opts[5]));};wm.ctrl.keyDown=function(p){try{var element=elementslib.lookup(p);}catch(err){var element=wm.win.document.body;}
p.options=p.options.replace(/ /g,"");var opts=p.options.split(",");events.triggerEvent(element,'focus',false);events.triggerKeyEvent(element,"keyDown",opts[0],eval(opts[1]),eval(opts[2]),eval(opts[3]),eval(opts[4]),eval(opts[5]));};wm.ctrl.keyUp=function(p){try{var element=elementslib.lookup(p);}catch(err){var element=wm.win.document.body;}
p.options=p.options.replace(/ /g,"");var opts=p.options.split(",");events.triggerEvent(element,'focus',false);events.triggerKeyEvent(element,"keyUp",opts[0],eval(opts[1]),eval(opts[2]),eval(opts[3]),eval(opts[4]),eval(opts[5]));};wm.ctrl.goBack=function(p){wm.win.history.back();}
wm.ctrl.goForward=function(p){wm.win.history.forward();}
wm.ctrl.refresh=function(p){wm.win.location.reload(true);}
wm.ctrl.scroll=function(p){var d=p.coords;d=d.replace('(','');d=d.replace(')','');var cArr=d.split(',');wm.win.scrollTo(cArr[0],cArr[1]);}
if(/Firefox[\/\s](\d+\.\d+)/.test(navigator.userAgent)){wm.browser="Firefox";wm.ctrl.click=function(p){var element=elementslib.lookup(p);events.triggerEvent(element,'focus',false);var savedEvent=null;element.addEventListener('click',function(evt){savedEvent=evt;},false);events.triggerMouseEvent(element,'mousedown',true);events.triggerMouseEvent(element,'mouseup',true);events.triggerMouseEvent(element,'click',true);try{if(!browser.isChrome&&savedEvent!=null&&!savedEvent.getPreventDefault()){if(element.href){wm.ctrl.open({"url":element.href,'reset':false});}
else{var itrElement=element;while(itrElement!=null){if(itrElement.href){wm.ctrl.open({"url":itrElement.href,'reset':false});break;}
itrElement=itrElement.parentNode;}}}}
catch(err){}};wm.ctrl.check=function(p){return wm.ctrl.click(p);};wm.ctrl.radio=function(p){return wm.ctrl.click(p);};wm.ctrl.doubleClick=function(p){var element=elementslib.lookup(p);events.triggerEvent(element,'focus',false);events.triggerMouseEvent(element,'dblclick',true);events.triggerEvent(element,'blur',false);};wm.ctrl.type=function(p){var element=elementslib.lookup(p);element.value='';events.triggerEvent(element,'focus',false);events.triggerEvent(element,'select',true);var maxLengthAttr=element.getAttribute("maxLength");var actualValue=p.text;var stringValue=p.text;if(maxLengthAttr!=null){var maxLength=parseInt(maxLengthAttr);if(stringValue.length>maxLength){actualValue=stringValue.substr(0,maxLength);}}
var s=actualValue;for(var c=0;c<s.length;c++){events.triggerKeyEvent(element,'keydown',s.charAt(c),true,false,false,false,false);events.triggerKeyEvent(element,'keypress',s.charAt(c),true,false,false,false,false);if(s.charAt(c)=="."){element.value+=s.charAt(c);}
events.triggerKeyEvent(element,'keyup',s.charAt(c),true,false,false,false,false);}
if(element.value!=s){element.value=s;}
events.triggerEvent(element,'change',true);};};if(/Safari[\/\s](\d+\.\d+)/.test(navigator.userAgent)){wm.browser="Safari";wm.ctrl.check=function(p){return wm.ctrl.click(p);};wm.ctrl.radio=function(p){var element=elementslib.lookup(p);element.checked=true;};wm.ctrl.click=function(p){var element=elementslib.lookup(p);events.triggerEvent(element,'focus',false);if(element['click']){element['click']();}
else{if(element.nodeName!='SELECT'){events.triggerMouseEvent(element,'mousedown',true);events.triggerMouseEvent(element,'mouseup',true);}
events.triggerMouseEvent(element,'click',true);}
return true;};wm.ctrl.doubleClick=function(p){var element=elementslib.lookup(p);events.triggerEvent(element,'focus',false);events.triggerMouseEvent(element,'dblclick',true);events.triggerEvent(element,'blur',false);};wm.ctrl.type=function(p){var element=elementslib.lookup(p);element.value='';events.triggerEvent(element,'focus',false);events.triggerEvent(element,'select',true);var maxLengthAttr=element.getAttribute("maxLength");var actualValue=p.text;var stringValue=p.text;if(maxLengthAttr!=null){var maxLength=parseInt(maxLengthAttr);if(stringValue.length>maxLength){actualValue=stringValue.substr(0,maxLength);}}
var s=actualValue;for(var c=0;c<s.length;c++){element.value+=s.charAt(c);events.triggerKeyEvent(element,'keydown',s.charAt(c),true,false,false,false,false);events.triggerKeyEvent(element,'keypress',s.charAt(c),true,false,false,false,false);events.triggerKeyEvent(element,'keyup',s.charAt(c),true,false,false,false,false);}
events.triggerEvent(element,'change',true);};};if(/MSIE[\/\s](\d+\.\d+)/.test(navigator.userAgent)){wm.ctrl.click=function(p){var element=elementslib.lookup(p);events.triggerEvent(element,'focus',false);wm.ctrl.mouseDown(p);wm.ctrl.mouseUp(p);try{events.triggerMouseEvent(element,'click',true);}catch(err){}};wm.ctrl.check=function(p){return wm.ctrl.click(p);}
wm.ctrl.radio=function(p){return wm.ctrl.click(p);}
wm.ctrl.doubleClick=function(p){var element=elementslib.lookup(p);events.triggerEvent(element,'focus',false);events.triggerMouseEvent(element,'dblclick',true);events.triggerEvent(element,'blur',false);};wm.ctrl.type=function(p){var element=elementslib.lookup(p);element.value='';events.triggerEvent(element,'focus',false);events.triggerEvent(element,'select',true);var maxLengthAttr=element.getAttribute("maxLength");var actualValue=p.text;var stringValue=p.text;if(maxLengthAttr!=null){var maxLength=parseInt(maxLengthAttr);if(stringValue.length>maxLength){actualValue=stringValue.substr(0,maxLength);}}
var s=actualValue;for(var c=0;c<s.length;c++){element.value+=s.charAt(c);events.triggerKeyEvent(element,'keydown',s.charAt(c),true,false,false,false,false);events.triggerKeyEvent(element,'keypress',s.charAt(c),true,false,false,false,false);events.triggerKeyEvent(element,'keyup',s.charAt(c),true,false,false,false,false);}
events.triggerEvent(element,'change',true);};};if(/Opera[\/\s](\d+\.\d+)/.test(navigator.userAgent)){wm.browser="Opera";wm.ctrl.click=function(p){var element=elementslib.lookup(p);events.triggerEvent(element,'focus',false);try{events.triggerMouseEvent(element,'mousedown',true);}catch(err){}
try{events.triggerMouseEvent(element,'mouseup',true);}catch(err){}
try{events.triggerMouseEvent(element,'click',true);}catch(err){}};wm.ctrl.check=function(p){var element=elementslib.lookup(p);events.triggerEvent(element,'focus',false);var state=element.checked;try{events.triggerMouseEvent(element,'mousedown',true);}catch(err){}
try{events.triggerMouseEvent(element,'mouseup',true);}catch(err){}
try{events.triggerMouseEvent(element,'click',true);}catch(err){}
if(element.checked==state){if(element.checked){element.checked=false;}
else{element.checked=true;}}};wm.ctrl.radio=function(p){return wm.ctrl.click(p);};wm.ctrl.doubleClick=function(p){var element=elementslib.lookup(p);events.triggerEvent(element,'focus',false);events.triggerMouseEvent(element,'dblclick',true);events.triggerEvent(element,'blur',false);};wm.ctrl.type=function(p){var element=elementslib.lookup(p);element.value='';events.triggerEvent(element,'focus',false);events.triggerEvent(element,'select',true);var maxLengthAttr=element.getAttribute("maxLength");var actualValue=p.text;var stringValue=p.text;if(maxLengthAttr!=null){var maxLength=parseInt(maxLengthAttr);if(stringValue.length>maxLength){actualValue=stringValue.substr(0,maxLength);}}
var s=actualValue;for(var c=0;c<s.length;c++){element.value+=s.charAt(c);events.triggerKeyEvent(element,'keydown',s.charAt(c),true,false,false,false,false);events.triggerKeyEvent(element,'keypress',s.charAt(c),true,false,false,false,false);events.triggerKeyEvent(element,'keyup',s.charAt(c),true,false,false,false,false);}
events.triggerEvent(element,'change',true);};};wm.ctrl.asserts.assertRegistry={'assertTrue':{expr:function(a){if(typeof a!='boolean'){throw('Bad argument to assertTrue.');}
return a===true;},errMsg:'expected true but was false.'},'assertFalse':{expr:function(a){if(typeof a!='boolean'){throw('Bad argument to assertFalse.');}
return a===false;},errMsg:'expected false but was true.'},'assertEquals':{expr:function(a,b){return a===b;},errMsg:'expected $1 but was $2.'},'assertNotEquals':{expr:function(a,b){return a!==b;},errMsg:'expected one of the two values not to be $1.'},'assertNull':{expr:function(a){return a===null;},errMsg:'expected to be null but was $1.'},'assertNotNull':{expr:function(a){return a!==null;},errMsg:'expected not to be null but was null.'},'assertUndefined':{expr:function(a){return typeof a=='undefined';},errMsg:'expected to be undefined but was $1.'},'assertNotUndefined':{expr:function(a){return typeof a!='undefined';},errMsg:'expected not to be undefined but was undefined.'},'assertNaN':{expr:function(a){return isNaN(a);},errMsg:'expected $1 to be NaN, but was not NaN.'},'assertNotNaN':{expr:function(a){return!isNaN(a);},errMsg:'expected $1 not to be NaN, but was NaN.'},'assertEvaluatesToTrue':{expr:function(a){return!!a;},errMsg:'value of $1 does not evaluate to true.'},'assertEvaluatesToFalse':{expr:function(a){return!a;},errMsg:'value of $1 does not evaluate to false.'},'assertContains':{expr:function(a,b){if(typeof a!='string'||typeof b!='string'){throw('Bad argument to assertContains.');}
return(a.indexOf(b)>-1);},errMsg:'value of $1 does not contain $2.'}};wm.ctrl.asserts.assertText=function(p){var n=elementslib.lookup(p);var validator=p.validator;if(n.innerHTML.indexOf(validator)!=-1){return true;}
if(n.hasChildNodes()){for(var m=n.firstChild;m!=null;m=m.nextSibling){if(m.nodeType!=3){if(m.innerHTML.indexOf(validator)!=-1){return true;}
if(m.value.indexOf(validator)!=-1){return true;}}}}
throw"Text '"+validator+"' was not found in the provided node.";};wm.ctrl.asserts.assertNode=function(p){var element=elementslib.lookup(p);};wm.ctrl.asserts.assertValue=function(p){var n=elementslib.lookup(p);var validator=p.validator;if(n.value.indexOf(validator)==-1){throw"Value not found, "+n.value+"not equal to "+validator;}};wm.ctrl.asserts.assertJS=function(p){var js=p.js;var result=eval(js);if(result!=true){throw"JavaScript did not return true."}};wm.ctrl.asserts.assertElemJS=function(p){var element=elementslib.lookup(p);var js=p.js;var result=eval(js);if(result!=true){throw"JavaScript did not return true."}};wm.ctrl.asserts.assertSelected=function(p){var n=elementslib.lookup(p);var validator=p.validator;if((n.options[n.selectedIndex].value!=validator)&&(n.options[n.selectedIndex].innerHTML!=validator)){throw"Not selected, "+n.options[n.selectedIndex].value+" is not equal to "+validator;}};wm.ctrl.asserts.assertChecked=function(p){var n=elementslib.lookup(p);if(!n.checked){throw"Checked property not true";}};wm.ctrl.asserts.assertProperty=function(p){var element=elementslib.lookup(p);var vArray=p.validator.split('|');var value=eval('element.'+vArray[0]+';');if(value.indexOf(vArray[1])!=-1){return true;}
if(String(value)==String(vArray[1])){return true;}
throw"Property did not match."};wm.ctrl.asserts.assertImageLoaded=function(p){var img=elementslib.lookup(p);if(!img||img.tagName!='IMG'){throw"The node was not an image."}
var comp=img.complete;var ret=null;if(typeof comp=='undefined'){test=new Image();test.src=img.src;comp=test.complete;}
if(comp===false){throw"Image complete attrib false."}
else if(comp===true&&img.naturalWidth==0){throw"Image has no size, failure to load."}
else{ret=true;}
return ret;};wm.ctrl.asserts._AssertFactory=new function(){var _this=this;function validateArgs(count,args){if(!(args.length==count||(args.length==count+1&&typeof(args[0])=='string'))){throw('Incorrect arguments passed to assert function');}}
function createErrMsg(msg,arr){var str=msg;for(var i=0;i<arr.length;i++){if(arr[i]!=null){var val=arr[i];var display='<'+val.toString().replace(/\n/g,'')+'> ('+getTypeDetails(val)+')';str=str.replace('$'+(i+1).toString(),display);}}
return str;}
function getTypeDetails(val){var r=typeof val;try{if(r=='object'||r=='function'){var m=val.constructor.toString().match(/function\s*([^( ]+)\(/);if(m){r=m[1];}
else{r='Unknown Data Type'}}}
finally{r=r.substr(0,1).toUpperCase()+r.substr(1);return r;}}
this.createAssert=function(meth){return function(){var args=Array.prototype.slice.call(arguments);args.unshift(meth);return _this.doAssert.apply(_this,args);}}
this.doAssert=function(){var args=Array.prototype.slice.call(arguments);var meth=args.shift();var asrt=wm.ctrl.asserts.assertRegistry[meth];var expr=asrt.expr;var valid=validateArgs(expr.length,args);var comment=args.length>expr.length?args.shift():null;var res=expr.apply(window,args);if(res){return true;}
else{var message=meth+' -- '+
createErrMsg(asrt.errMsg,args);throw new wm.ctrl.asserts._WindmillAssertException(comment,message);}};};for(var meth in wm.ctrl.asserts.assertRegistry){wm.ctrl.asserts[meth]=wm.ctrl.asserts._AssertFactory.createAssert(meth);wm.ctrl.asserts[meth].jsUnitAssert=true;}
wm.ctrl.asserts._WindmillAssertException=function(comment,message){this.comment=comment;this.message=message;};