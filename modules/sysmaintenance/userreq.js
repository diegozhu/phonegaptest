define(function() {
	var userReqSvc = new Service("com.wboss.wcb.auth.authmgr.UserReqResultSvc");
	var sysParamSvc = new Service("com.wboss.general.param.SysParamSvc");
	
	function onCreate($page, $relativeUrl) {
		var TYPE_OBJ = {};
		sysParamSvc.call('getDicData',[ 'DIC_ACCESS_TYPE' ],function(res){
			for(var i in res){
				TYPE_OBJ[res[i].dicValue]=res[i].dicValueName;
			}
		});
		
		var myDate = new Date();
		var stratTime = myDate.toString('yyyy-MM-dd')+' 00:00:00';
		var endTime = myDate.toString('yyyy-MM-dd')+' 23:59:59';

		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName();
		$page.find('input[name="vnoName"]').val(vnoName);
		$page.find('input[name="vnoId"]').val(vnoId);
		$page.find('input[name="beginDate"]').val(stratTime);
		$page.find('input[name="endDate"]').val(endTime);
		
		function GetDateDiff(startDate,endDate)  {  
		    var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();     
		    var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();     
		    var dates = Math.abs((startTime - endTime))/(1000*60*60*24);     
		    return  dates;    
		}
		
		// 校验MAC
		$page.find(".user_ap_apMac").triggerInputMac({
			upperCase : true,
			splitor : ":"
		});
		
		$page.on('click',".btn-search,.btn-refresh",function(e){
			var begin = $page.find('input[name="beginDate"]').val();
			var end = $page.find('input[name="endDate"]').val();
			if(GetDateDiff(begin,end)>10){
				BootstrapDialog.warning("已超过最大天数10天,请重新选择！");
				return false;
			}
			if(begin>end){
				BootstrapDialog.warning("开始时间晚于结束时间,请重新选择！");
				return false;
			}
			else if(begin==''||end==''){
				BootstrapDialog.warning("日期不能为空！");
				return false;
			}
		});
		
		var $table = $("#sysmaintenance_userreq_dataTable");
		var jqGrid = $table
				.jqGrid({
					url : wboss.getWay + '/data/com.wboss.wcb.auth.authmgr.UserReqResultSvc?m=queryUserReqList4Jq.object.object',
					postData : {param:JSON.stringify({beginDate:stratTime,endDate:endTime,vnoId:vnoId})},
					colModel : [
							{label : '客户编码' ,name:'custCode'},
							{label : '上网类型',name : 'opType'},
							{label : '接入类型',name : 'accessType', formatter : function(c) { return TYPE_OBJ[c] || ''; }},
							{label : '终端MAC',name : 'staMac'},
							{label : '终端IP',name : 'staIp'},
							{label : '设备名称',name : 'acName'}, 
							{label : 'SSID',name : 'ssid'},
							{label : 'AP MAC',name : 'apMac'},
							{label : '认证结果',name : 'operResult', formatter : function(c, o, r) { return c == 'T' ? '成功' : '失败'; }},
							{label : '错误编码',name : 'expCode'},
							{label : '错误信息',name : 'expDesc'},
							{label : 'AC返回',name : 'acRet'},
							{label : '创建时间',name : 'createDate'},
							{label : '',name : 'vnoId',hidden : true},
							{label : '企业名称',name : 'vnoName',sortable: false},
							{label : 'GWID',name : 'gwId'},
							{label : '客户端',name : 'httpClient'}
						],
				 pager: 'sysmaintenance_userreq_jqGridPager'
			});
	}
	
	function onActive($page, $relativeUrl) { }
	
	return { onCreate : onCreate, onActive : onActive };
});