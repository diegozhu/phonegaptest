typeof console == "undefined" && (console = {log:function(){},error:function(){}});
String.prototype.stripTags =  function() {return this.replace(/<\/?[^>]+>/gi, '');}
String.prototype.toDate = function(){ return new Date(this.replace(/-/gi,"/")); }
Date.prototype.toDate = function(){return this;}
String.prototype.String = function(){return this;}
String.prototype.trim=function(s){ if(s==undefined || s == null||s =="") return this.replace(/(^\s*)|(\s*$)/g, "");  var res = this;  while(res.endsWith(s))  res = res.substring(0,res.length-s.length); while(res.startsWith(s)) res = res.substring(s.length,res.length); return res;}
String.prototype.contains = function(s){return this.indexOf(s) !== -1;}
String.prototype.startsWith = function(prefix) { return prefix == undefined || prefix == null || prefix =="" ? false : this.slice(0, prefix.length) == prefix; }
String.prototype.endsWith = function(suffix) { return suffix == undefined || suffix == null || suffix =="" ? false : this.indexOf(suffix, this.length - suffix.length) !== -1;};
String.prototype.join = function(){return this;};
Date.prototype.toString = function (format){ 
	var d = this;
	var res =  (format || "yyyy-MM-dd hh:mm:ss").replace("yyyy",d.getFullYear()).replace("YYYY",d.getFullYear());
	res = res.replace("MM",d.getMonth() < 9 ? "0"+(d.getMonth()+1) : (d.getMonth()+1));
	res = res.replace("dd",d.getDate()<10?"0"+d.getDate() : d.getDate()).replace("DD",d.getDate()<10?"0"+d.getDate() : d.getDate());
	res = res.replace("hh",d.getHours()<10?"0"+d.getHours():d.getHours()).replace("HH",d.getHours()<10?"0"+d.getHours():d.getHours());
	res = res.replace("mm",d.getMinutes()<10?"0"+d.getMinutes():d.getMinutes());
	res = res.replace("ss",d.getSeconds()<10?"0"+d.getSeconds():d.getSeconds());
	var millisecond = d.getMilliseconds();
	millisecond = millisecond<10 ? "00"+millisecond : millisecond;
	millisecond = millisecond<100 ? "0"+millisecond : millisecond;
	res = res.replace("SSS",millisecond);
	return res;
} 
Date.valid = function(date){
	return date != null && date != undefined && typeof date.getTime == "function" && typeof date.getTime() == "number" && !isNaN(date.getTime());
}
Date.prototype.valid = function(){
	return Date.valid(this);
}
Date.prototype.format = Date.prototype.toString;
String.prototype.format = function(format){this.toDate().toString(format);}
String.prototype.containAll = function(){
	args = arguments[0] instanceof Array ? arguments[0] : arguments
	for(var i =0;i<args.length;i++)
		if(!this.contains(args[i]))
			return false;
	return true;
}
String.prototype.containAny = function(){
	args = arguments[0] instanceof Array ? arguments[0] : arguments
	for(var i =0;i<args.length;i++)
		if(this.contains(args[i]))
			return true;
	return false;
}

typeof getComputedStyle == "undefined" &&  (function() {
var _PT = /pt$/,
    _MORE,
    _UNIT = { m: 1, t: 2, "%": 3, o: 3 }, // em,pt,%,auto
    _THICK = (document.documentMode || 0) === 8 ? "5px" : "6px",
    _BOX_PROPS = [],
    _MOD_PROPS = { top: 1, left: 2, width: 3, height: 4 };

window.getComputedStyle = winstyle;

// window.getComputedStyle
function winstyle(node,     // @param Node:
                  pseudo,   // @param String(= void 0):
                  option) { // @param Number(= 0x0):
                            //   0x0: enum full properties
                            //   0x1: enum more properties
                            //   0x2: enum some properties
                            // @return Hash: { prop: "val", ... }
  if (!node.currentStyle) {
    return {};
  }
  option = option || 0;
  var rv = {},
      ns = node.style,
      cs = node.currentStyle,
      rs = node.runtimeStyle,
      em, rect, unit, v, w, x, i = 0, m1, m2,
      stock = { "0px": "0px", "1px": "1px", "2px": "2px", "5px": "5px",
                thin: "1px", medium: "3px", thick: _THICK };

  if (!option) { // full
    for (w in cs) {
      rv[w] = cs[w];
    }
  } else if (option & 0x1) { // more
    while ( (w = _MORE[i++]) ) {
      rv[w] = cs[w] || ""; // IE8 propertyies -> IE6, IE7 down grade trap
    }
  }

  em = parseFloat(cs.fontSize) * (_PT.test(cs.fontSize) ? 4 / 3 : 1);
  rect = node.getBoundingClientRect();

  // calc border, padding and margin size
  i = 0;
  while ( (w = _BOX_PROPS[i++]) ) {
    v = cs[w];
    if (!(v in stock)) {
      x = v;
      switch (unit = _UNIT[v.slice(-1)] || 0) {
      case 1: x = parseFloat(v) * em; break;    // em
      case 2: x = parseFloat(v) * 4 / 3; break; // pt
      case 3: m1 = ns.left, m2 = rs.left;       // %, auto
              rs.left = cs.left, ns.left = v;
              x = ns.pixelLeft, ns.left = m1, rs.left = m2;
      }
      stock[v] = unit ? x + "px" : x;
    }
    rv[w] = stock[v];
  }
  for (w in _MOD_PROPS) {
    v = cs[w];
    switch (unit = _UNIT[v.slice(-1)] || 0) {
    case 1: v = parseFloat(v) * em; break;    // em
    case 2: v = parseFloat(v) * 4 / 3; break; // pt
    case 3: // %, auto
      switch (_MOD_PROPS[w]) {
      case 1: v = node.offsetTop; break;
      case 2: v = node.offsetLeft; break;
      case 3: v = (node.offsetWidth  || rect.right - rect.left)
                - parseInt(rv.borderLeftWidth) - parseInt(rv.borderRightWidth)
                - parseInt(rv.paddingLeft) - parseInt(rv.paddingRight);
              v = v > 0 ? v : 0;
              break;
      case 4: v = (node.offsetHeight || rect.bottom - rect.top)
                - parseInt(rv.borderTopWidth) - parseInt(rv.borderBottomWidth)
                - parseInt(rv.paddingTop) - parseInt(rv.paddingBottom);
              v = v > 0 ? v : 0;
      }
    }
    rv[w] = unit ? v + "px" : v;
  }
  rv.fontSize = em + "px";
  rv.cssFloat = cs.styleFloat; // compat alias
  return rv;
}

// init - make box props
(function(ary, i, v) {
  while ( (v = ary[i++]) ) {
    _BOX_PROPS.push("border" + v + "Width", "margin" + v, "padding" + v);
  }
})("Top,Left,Right,Bottom".split(","), 0);

// option = 0x1, more properties (IE8 propertyies base)
_MORE = ( 
 "1Attachment,1Color,1Image,1PositionX,1PositionY,1Repeat,23Color,23Style,23W" +
 "idth,2LeftColor,2LeftStyle,2LeftWidth,2RightColor,2RightStyle,2RightWidth,2" +
 "TopColor,2TopStyle,2TopWidth,2Collapse,2Spacing,bottom,captionSide,clear,cl" +
 "ip3,clipLeft,clipRight,clipTop,color,cssFloat,cursor,direction,display,empt" +
 "yCells,fontFamily,fontSize,fontStyle,fontWeight,height,left,letterSpacing,l" +
 "ineBreak,lineHeight,listStyleImage,listStylePosition,listStyleType,margin3," +
 "marginLeft,marginRight,marginTop,maxHeight,maxWidth,minHeight,minWidth,outl" +
 "ineColor,outlineStyle,outlineWidth,overflow,overflowX,overflowY,padding3,pa" +
 "ddingLeft,paddingRight,paddingTop,position,right,styleFloat,textAlign,textA" +
 "utospace,textDecoration,textIndent,textJustify,textOverflow,textTransform,t" +
 "op,verticalAlign,visibility,whiteSpace,width,wordBreak,wordSpacing,wordWrap" +
 ",zIndex").replace(/1/g, "background").replace(/2/g, "border").
 replace(/3/g, "Bottom").split(",");
})();


//解决IE8之类不支持getElementsByClassName
if (!document.getElementsByClassName) {
    document.getElementsByClassName = function (className, element) {
        var children = (element || D).getElementsByTagName('*');
        var elements = new Array();
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var classNames = child.className.split(' ');
            for (var j = 0; j < classNames.length; j++) {
                if (classNames[j] == className) {
                    elements.push(child);
                    break;
                }
            }
        }
        return elements;
    };
}


//B formatter B KB MB 
function formatB(value) {
  var theTrafficB = parseInt(value);// b
  var theTrafficMb = 0;// Mb
  //判断空
  if(theTrafficB){
  	theTrafficMb = theTrafficB/(1024*1024);
  }
  //小于0.01或空都给0.00Mb
  if(theTrafficMb < 0.01){
  	return "0.00M ";
  }
  return theTrafficMb.toFixed(2) + "M ";
}

function formatTime(t,isShowEmpty){
    var s = [60,60,24,1000000];
    var ss = ['秒','分','小时','天'];
    var r = "";
    for(var i = 0;i<s.length;i++){
       r = (t%s[i] == 0 && !isShowEmpty) ? r : t%s[i] + ss[i]+ r;
       t = parseInt(t/s[i]);
       if(t==0)break;
    }
    return r;
}

//now, forever , now - 7d, now + 7d , now +/- nd , 2015-12-23 23:23:23
function parseDate(expression,baseTime){
	 if(expression == undefined)
		return undefined;
	 expression = expression.trim();
	 if(expression == "today"){
		 return (new Date()).toString('yyyy-MM-dd').toDate();
	 }if(expression == "now"){
		return new Date();
     }else if(expression == "forever"){
     	return "2030-12-31 23:59:59".toDate();
     }else if(/now[-,+]\d*d/gi.test(expression.replace(/ /gi,""))){
      	var offsetDays = parseInt(expression.replace(/ |[a-z]|[A-Z]/gi,""));
      	return new Date((new Date()).getTime() + offsetDays*1000*60*60*24);  
      }else if(/today[-,+]\d*d/gi.test(expression.replace(/ /gi,""))){
         	var offsetDays = parseInt(expression.replace(/ |[a-z]|[A-Z]/gi,""));
         	return new Date((new Date()).toString('yyyy-MM-dd').toDate().getTime() + offsetDays*1000*60*60*24);
     }else if((expression.match(/\d| |:|-|\//gi)||[]).join("") == expression){
     	return new Date(expression);
     }else{
    	var offsetDays = parseInt(expression.replace(/ |[a-z]|[A-Z]/gi,""));
      	return new Date((baseTime instanceof Date ? baseTime.getTime() : 0 ) + offsetDays*1000*60*60*24);
     }
}

//PC or Mobile
function IsPC() {
    var userAgentInfo = navigator.userAgent;
    var Agents = ["Android", "iPhone","SymbianOS", "Windows Phone","iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}

//日期差
function DateDiff(start, end) {
    var diff = Math.abs(end.toDate().getTime() - start.toDate().getTime());
    var dayMil= 24*60*60*1000;
    return parseInt(diff /dayMil); //把相差的毫秒数转换为天数
}

var dateTimePickerOpt = {
		showClear:true,
		showClose:true,
		ignoreReadonly: true,
		tooltips: {
		    today: '今天',
		    clear: '清空选择',
		    close: '关闭',
		    selectTime:'选择时间',
		    selectMonth: '选择月份',
		    prevMonth: '前一个月',
		    nextMonth: '下一个月',
		    selectYear: '选择年份',
		    prevYear: '上一年份',
		    nextYear: '下一年份',
		    selectDecade: '以十年取',
		    prevDecade: '上一个十年',
		    nextDecade: '下一个十年',
		    prevCentury: '上一个世纪',
		    nextCentury: '下一个世纪'
		}
};
function ArrayDistinct(array) {
	 var data = [],v;
	 while((v = array.shift()) != undefined)
			if(data.indexOf(v) == -1)
				data.push(v);
	 while((v = data.shift()) != undefined)
		array.push(v);
	 return array;
}

function ArrayPushAll(array,newData) {
	var i = 0; 
	for(;i<newData.length;i++)
		 array.push(newData[i]);
	 return array;
}

String.prototype.toPinyin =function(splitor){
	var s = splitor == undefined ? "" : splitor;
	var PYMapping = {'运':'yun','营':'ying','统':'tong','计':'ji','负':'fu','载':'zai','用':'yong','户':'hu','登':'deng','录':'lu','联':'lian|lain','通':'tong','分':'fen','公':'gong','司':'si','客':'ke','经':'hu','理':'jing','出':'chu','账':'zhang|zang','单':'dan','在':'zaizhai','线':'xian','查':'chaca','询':'xun','员':'yuan','工':'gong','操':'cao','作':'zuo','日':'ri','志':'zhi','短':'duan','信':'xin','发':'fa','送':'song','上':'shang','网':'wang','第':'di','三':'san','方':'fang','支':'zhi','付':'fu','订':'ding','购':'gou','记':'ji','卡':'ka','密':'mi','充':'chong|cong','值':'zhi','系':'xi','参':'can','数':'shusu','配':'pei','置':'zhi','访':'fang','问':'wen','策':'ce','略':'lue','鉴':'jian','权':'quan','授':'shou|sou','时':'shi|si','段':'duan','开':'kai','模':'mu|mo','板':'ban','商':'shang','品':'pin','定':'ding','任':'ren','务':'wu','布':'bu','审':'shen|sen','核':'he','接':'jie','入':'ru','企':'qi','业':'ye','息':'xi','管':'guan','受':'shou|sou','批':'pi','量':'liang','积':'ji','兑':'dui','换':'huan','导':'dao','制':'zhizi','广':'guang','告':'gao','规':'gui','则':'ze','位':'wei','页':'ye','面':'mian','监':'jian','控':'kong','警':'jing','类':'lei','型':'xing','义':'yi','知':'zhi','号':'hao','与':'yu','限':'xian','报':'bao','表':'biao','据':'ju','维':'wei','护':'hu','元':'yuan','设':'she','备':'bei','行':'hang','角':'jue|jiao','色':'se|she','组':'zu','织':'zhiji','地':'di','域':'yu'};
	var ret = [""];
	for(var i = 0;i<this.length;i++){
		if(PYMapping[this.charAt(i)] != undefined){
			var pinyins = PYMapping[this.charAt(i)].split('|');
			var newRet = [];
			for(var m = 0;m < pinyins.length; m++)
				for(var j = 0 ; j < ret.length ; j++)
					newRet.push(ret[j] + s+ pinyins[m]);
			ret = newRet;
		}else{
			if(this.charCodeAt(i) > 256)
				console.error("no "+this.charAt(i)+" in pinyin mapping.");
		}
	}
	return ret.join('|');
}