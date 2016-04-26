define(function() {
	var userReqSvc = new Service("com.wboss.wcb.auth.authmgr.UserReqResultSvc");
	return {
		onCreate : function($page, $relativeUrl) {
			var myDate = new Date();
			var stratTime = myDate.toString('yyyy-MM-dd');
			var endTime = myDate.toString('yyyy-MM-dd');

			var vnoId = model.user().vnoId(), vnoName = model.user().vnoName();
			$page.find('input[name="vnoName"]').val(vnoName);
			$page.find('input[name="vnoId"]').val(vnoId);
			$page.find('input[name="beginDate"]').val(stratTime);
			$page.find('input[name="endDate"]').val(endTime);
			function GetDateDiff(startDate,endDate)  {  
			    var startTime = new Date(Date.parse(startDate.replace(/-/g,   "/"))).getTime();     
			    var endTime = new Date(Date.parse(endDate.replace(/-/g,   "/"))).getTime();     
			    var dates = (endTime - startTime)/(1000*60*60*24);     
			    return  dates;    
			}
			
			$page.on('click',".btn-search,.btn-refresh",function(e){
				var begin = $page.find('input[name="beginDate"]').val();
				var end = $page.find('input[name="endDate"]').val();
				if(begin==''||end==''){
					BootstrapDialog.warning("日期不能为空！");
					return false;
				}
				if(GetDateDiff(begin,end)>10){
					BootstrapDialog.warning("已超过最大天数10天,请重新选择！");
					return false;
				}
			});
			
			var $table = $("#stat_userrequest_dataTable");
			var jqGrid = $table
					.jqGrid({
						url : '/data/com.wboss.wcb.auth.authmgr.UserReqResultSvc?m=queryUserReqList4Jq2.object.object',
						postData : {param:JSON.stringify({beginDate:stratTime,endDate:endTime,vnoId:vnoId})},
						colModel : [
								{label : 'SSID' ,name:'ssid',width : 260},
								{label : '结果',name : 'operResult',formatter : function(cellValue, options, rowObject) { return cellValue == 'T' ?  '成功' : '失败';	},width : 100},
								{label : '次数',name : 'count',width : 100}, 
								{label : '用户IP',name : 'staIp',width : 100}, 
								{label : 'AC返回值',name : 'acRet',width : 100}, 
								{label : '描述',name : 'expDesc',width : 260},
								{label : '',name : 'vnoId',hidden : true},
								{label : '企业名称',name : 'vnoName',sortable : false,width : 160}
								],
					 pager:stat_userrequest_jqGridPager
					});
		},
		onActive : function($page, $relativeUrl) {

		}
	}
	return {
		onCreate : onCreate,
		onActive : onActive
	};
});