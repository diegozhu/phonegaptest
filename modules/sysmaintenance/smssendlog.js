define(function() {
	var smsSendLog = new Service("com.wboss.wcb.auth.authmgr.SMSSendLogSvc");
	return {
		onCreate : function($page,$relativeUrl) {
			var $form = $page.find(".detail_form");
			var $table = $("#ems_ssid_dataTable");
			//设置运营商默认值
			var vnoId=model.user().vnoId();
			var vnoName=model.user().vnoName();
			$page.find("input[name='vnoId']").val(vnoId);
			$page.find("input[name='vnoName']").val(vnoName);
			$form.data('default',{status:'00A',vnoId:vnoId,vnoName:vnoName});
			var jqGrid = $("#sysmaintenance_smssendlog_dataTable")
					.jqGrid(
							{
								url : '/data/com.wboss.wcb.auth.authmgr.SMSSendLogSvc?m=querySmsSendLogList.object.object',
								postData :{param:JSON.stringify({sendDate:$page.find("input[name='sendDate']").val()})},
								colModel : [ 
								    {label : '发送标识',name : 'smsId',hidden : true,key : true}, 
									{label : '发送手机号',name : 'sendMobile'}, 
									{label : '',name : 'vnoId',hidden : true}, 
									{label : '企业名称',name : 'vnoName',sortable : false}, 
									{label : '操作码',name : '_sucFlag'}, 
									{label : '操作返回',name : 'spRet'}, 
									{label : '发送时间',name : 'sendDate'}
									],
								pager : "#privilege_smssendlog_jqGridPager"
							});

			var jqGroupGrid = $("#sysmaintenance_smssendlog_groupDataTable")
					.jqGrid(
							{
								url : '/data/com.wboss.wcb.auth.authmgr.SMSSendLogSvc?m=queryLogCountGroup.object.object',
								postData :{param:JSON.stringify({sendDate:$page.find("input[name='sendDate']").val()})},
								colModel : [
								            {label : '发送时间',name : 'gdate'}, 
								            {label : '操作码',name : '_sucFlag'}, 
											{label : '操作返回',name : 'spRet'}, 
											{label : '统计数',name : 'cnt'} ]
									});
		},
		onActive : function($page,$relativeUrl) {

		}
	}
	return {
		onCreate : onCreate,
		onActive : onActive
	};
});
