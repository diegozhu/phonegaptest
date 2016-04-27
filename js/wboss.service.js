/**
 * mybufallo 
 * @author zhu.haiyang3@zte.com.cn
 * 调用后台java svc
 * 调用方法 (new Service(package.class,async)).call(method,[arg1,arg2,arg3...],sucessfunction,errorfunction);
 * 参数支持string,array,object,boolean 4种类型，因此后台java 类不支持 类型方法重载，
 * 因为无法区分：
 * TestSvc.dosomething(XXXVO vo); 和 TestSvc.dosomething(XXXPO po);
 * 参数类型对应关系：
 * javascript                      对应                    java
 * array ([],new Array())                                ArrayList,[]
 * string                                                  int,Integer,Long,long,double,Double,string,String
 * boolean                                                  boolean,Boolean
 * 
 * com.ztesoft.wsmp.rating.charge.chargeimpl.PeapChargeSvc?reqAccessInfo.object.object
 * */
var I18n = {};
var wboss = {getWay:'http://112.84.178.83:19090'};
function Service(svc,async){
    this.getway = wboss.getWay + "/api/"+svc+"?m=";
    this.async = async == undefined ? true : async;
    this.debug = true;
    return this; 
}
/**
 *  @param svc : required
 *  @param args : array
 *  @param successFunc 
 *  @param errorFunc
 * 
 * */
Service.prototype.help = function(){
   var str = [];
   str.push("前后台互交的json rpc框架");
   str.push("1. 支持数组，boolean，string，object四种类型，number视为string，因此前端不再需要parseInt($dom.value())");
   str.push("2. 调用方法：(new Service(package.class).call(method,[arg1,arg2,arg3...],sucessfunction,errorfunction);");
   str.push("3. 调用后台java方法时，只能通过boolean，string，array，object四种类型做方法重载，因此 method(String a) 和 method(Long a)认为是重复的（数字类型认为字符串，包括Long,long,Double,double,int,Integer等）。");
   str.push("4. 调用后台java方法时，使用[] 声明的数组和使用ArrayList声明的数组都可以但不区分，因此method(XXX[] a)和method(ArrayList<XXX>) 认为是重复方法（没办法做调用方法推测）");
   str.push("5. 根据java后台接受参数类型，自动将yyyy-MM-dd hh:mm:ss 格式的字符串转为Date类型，因此不需要new Date()");
   str.push("6. 当调用的方法含有modify或者update关键字(不区分大小写)时,传到后台的object空字段(null,\"\",'',undefined)会自动被转义为com.ztesoft.common.Constants里面对应的null类型");
   console.clear();
   console.log(str.join("\n"));
   return "(ˇˍˇ） for better ~";
}

Service.error = Service.prototype.error = function(msg,xhr){
  console.error(msg);
  if(typeof msg == "object"){
    var newMsg = msg.status || msg.statusText;
    msg = newMsg || "未知异常";
  }
  var onhide = xhr == 401 ? function(){location.reload()}:function(){};
  BootstrapDialog.show({
                type: BootstrapDialog.TYPE_DANGER,
                title: '出错啦',onhide:onhide,
                message: msg,
                buttons: [{
                    label: '确定',action: function(dialogItself){
                    dialogItself.close();
                }}]
  });
}
Service.prototype.call = function(method,args,successFunc,errorFunc){
    var logger = this.debug ? console :  {log:function(){},error:function(){},clear:function(){},warn:function(){}};
    var resultData,count = 30;
    if(successFunc === undefined){
        logger.warn("没有指定回调函数");
    }
    if((method = (method || "").trim()) == ""){ alert("错误 ! 没有指定调用方法! ----需要帮助请调用 Service.help()"); return; }
    var xhr = getXHR(),method = (this.getway+method);
    xhr.successFunc = successFunc || function(){};
    xhr.errorFunc = errorFunc || this.error;
    xhr.fatalFunc =  errorFunc || this.error;
    try{xhr.withCredentials = true;}catch(e){}
    xhr.ontimeout = function(){this.errorFunc("请求超时！")};
    xhr.onreadystatechange = statusChange;
    xhr.onerror = errorFunc || this.error;
    	
    for(var i = 0;i<args.length;i++){
        method += ("."+getArgType(args[i]));
        args[i] = JSON.stringify(serialize(args[i])).replace(/\n/gi,"").replace(/NaN/g,"0"); //.replace("<","&lt;").replace(">","&gt;");
    }
    method += "&timestamp="+(new Date()).getTime();
    args = args.join("\n");
    xhr.open("POST",method,this.async);
    if(this.async == true){
        xhr.timeout = 15000;
    }
    xhr.setRequestHeader("Content-Type","text/xml;charset=utf-8");
    try{
        xhr.send(args);
    }catch(e){
       logger.error(e);
       log.error("网络异常 "+e.message);
    }
    return resultData;
    function serialize(obj){
        var type = typeof obj;
        switch(type){
        case "object":
            if(obj instanceof Date){
                var d = obj;
                logger.error("传入 yyyy-MM-dd hh:mm:ss 格式的字符串即可。 ----需要帮助请调用 Service.help()")
                return "yyyy-MM-dd hh:mm:ss".replace("yyyy",d.getFullYear()).replace("MM",d.getMonth() < 9 ? d.getMonth()+1 : "0"+(d.getMonth()+1)).replace("dd",d.getDate()).replace("hh",d.getHours()).replace("mm",d.getMinutes()).replace("ss",d.getSeconds());
            }else if (obj instanceof Array || obj instanceof Object){
                for(var i in obj){
                     obj[i] = serialize(obj[i]);
                 }
                return obj;
            }
            return obj;//null value
        case "undefined":
      	   return "";
        case "null":
      	   return "";
        case "number":
            return obj.toString();
       default:   // boolean ,string, function
            return obj;
        }
    }
    function deserialize(obj){
        if(typeof obj == "string" && obj.match(/^\d{4}-\d{1,2}-\d{1,2} \d{1,2}:\d{1,2}:\d{1,2}/gi)){
            obj = new Date(obj.replace(/-/gi,"/"));
        }else if(typeof obj =="object" && obj != null){
           for(var i in obj){ obj[i] = deserialize(obj[i]); }
        }
        return obj;
    }
    function getXHR(){
        var xhr,XMLversions = [ 'Microsoft.XMLHTTP', 'MSXML.XMLHTTP','Microsoft.XMLHTTP', 'Msxml2.XMLHTTP.7.0','Msxml2.XMLHTTP.6.0', 'Msxml2.XMLHTTP.5.0','Msxml2.XMLHTTP.4.0', 'MSXML2.XMLHTTP.3.0','MSXML2.XMLHTTP' ];
        if(window.XMLHttpRequest){
           xhr = new XMLHttpRequest();
        }else if(window.ActiveXObject){
            for(var i = 0; i < versions.length; i++) {
                try{ xhr = new ActiveXObject(XMLversions[i]); break; }catch (e){}
            }
        }
        if(!xhr){ alert('请升级您的浏览器'); throw "could not create xhr"; }
        return xhr;
    }
    function getArgType(arg){
       var type = typeof arg;
       switch(type){
       case "number": //return "number";
       case "string":
          return "string";
       case "boolean":
          return "boolean";
       case "object":
           if(arg instanceof Date) return "string";
           if(arg instanceof Array) return "array";
           return "object";
       case "undefined":
      	   return "string";
       case "null":
    	   return "string";
       default :
          throw "unsupported type , only long,double,string,boolean,object,date,array";
       }
    }
    function statusChange(){
        if(this.readyState !=4 ){ return ; }
        var r = this.responseText;
        try{
        	r = JSON.parse(this.responseText);
        }catch(e){}
        if(this.status==200){
            if(r.error == 0){  //ok
                resultData = deserialize(r.res);
                this.successFunc.call(r,resultData);
            }else if(r.error == 1){  // business exception
                resultData = r.res;
                console.error(r.res);
                this.errorFunc.call(r,r.res.replace(/\n/gi,"<br />"));
            }else if(r.error == -1){   // -1 buffalo throwable
                resultData = r.res;
                console.error(r.res);
                this.fatalFunc.call(r,"异常，联系管理员 zhy."+(r.res||'').replace(/\n/gi,"<br />"));
            }else{   // 2 svc throwable
                resultData = r.res;
                console.error(r.res);
                this.fatalFunc.call(r,"异常，联系管理员。"+(r.res||'').replace(/\n/gi,"<br />"));
            }
        }else if(this.status == 401){
            this.errorFunc('您还没有登录！\n\n'+((r||{}).res || ""),this);
            location.href = "index.html";
        }else if(this.status == 403){
            this.errorFunc('没有权限！\n\n'+((r||{}).res || ""));
        }else{
            if(this.status != 0){
              var msg = '异常 '+this.status+" "+this.statusText;
              resultData = msg;
              console.error(msg);
              Service.error(msg);
        	};
        }
        xhr = null;
    }
}

var cacheSvc = new Service('com.wboss.wcb.admin.cache.CacheMgr');
wboss.dictionay={};
cacheSvc.call('getDataDictionaryCache', [''], function(res){
	var display = {};
	for(var i in res){
		var obj ={};
		for(var j in res[i]){
			var item = res[i][j];
			obj[item.v] = item.n;
		}
		display[i] = obj;
	}
	wboss.dictionary = display;
	wboss._dictionary = res;
});

wboss.addDic = function(dicName,newDicName){
	if(newDicName == undefined || newDicName.trim() == "")
		throw "new dic name should not be empty !";
	if(wboss._dictionary[newDicName] != undefined)
		throw newDicName+" already exist !";
	wboss._dictionary[newDicName] = [];
	var newDic = wboss._dictionary[newDicName];
	for(var i = 2;i<arguments.length;i++){
		newDic.push(arguments[i]);
	}
	var orginalDic = wboss._dictionary[dicName] || [];
	for(var i = 0;i<orginalDic.length;i++){
		newDic.push(orginalDic[i]);
	}
	return newDic;
}
