var commonService = new Service('com.wboss.wcb.common.CommonService');
var jqGrid = null;

function logout(custId, userIp, acCode, mac, apMac ){
	BootstrapDialog.confirm({title:'下线提示', btnOKLabel:'确定', btnCancelLabel:'取消', message:'确定踢下线?', callback: function(flag){
		if(flag){
			setTimeout(function(){
				commonService.call('forceLogOut', [custId, userIp, acCode, mac, apMac, '001' ], function(res){
					jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
				});
			}, 3000)
		}
	}});
}

define(function() {
	
	var onlineUserSvc = new Service('com.wboss.wcb.rating.onlineuser.OnlineUserSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	function onActive($page,$relativeUrl) {
	}
	
	function onCreate($page,$relativeUrl) {
		
		
		var $form = $page.find(".detail_form");
		var $table = $page.find("#sysmaintenance_onlineuser_dataTable");
		$page.find("#sysmaintenance_onlineuser_apMac").triggerInputMac({ upperCase: true, splitor : ":" });
		//$page.find("#sysmaintenance_onlineuser_apMac").destroyInputMac();
		var myDate = new Date();
		var stratTime = myDate.toString('yyyy-MM-dd')+' 00:00:00';
		var endTime = myDate.toString('yyyy-MM-dd')+' 23:59:59';
		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName();
		var STATUS = {};
		var OFFLINETYPE = {};
		//$page.find("#sysmaintenance_onlineuser_onlineDate").val(stratTime);
		//$page.find("#sysmaintenance_onlineuser_offlineDate").val(endTime);
		$page.find('input[name="vnoName"]').val(vnoName);
		$page.find('input[name="vnoId"]').val(vnoId);
		
		// 校验MAC
		$page.find(".user_ap_apMac").triggerInputMac({
			upperCase : true,
			splitor : ":"
		});
		
		$page.find("select[name='status']").change(function(){
			var status = $page.find(".status>option:selected").val()
			if(status == "30A"){
				$page.find(".onlineDate").prop("disabled", true);
				$page.find(".offlineDate").prop("disabled", true);
				$page.find("#sysmaintenance_onlineuser_onlineDate").val("");
				$page.find("#sysmaintenance_onlineuser_offlineDate").val("");
			}else if(status == "30B"){
				$page.find(".onlineDate").prop("disabled", false);
				$page.find(".offlineDate").prop("disabled", false);
				$page.find("#sysmaintenance_onlineuser_onlineDate").val(stratTime);
				$page.find("#sysmaintenance_onlineuser_offlineDate").val(endTime);
			}
		});
		
		jqGrid = $table.jqGrid({
							url : '/data/com.wboss.wcb.rating.onlineuser.OnlineUserSvc?m=queryOnlineUserList4Jq.object.object',
							postData : {param:JSON.stringify({status:'30A',vnoId:vnoId})},
							colModel : [{name : "custId",hidden:true},
							            {label : '客户编码',name : 'custCode'},
							            {label : '客户名称',name : 'custName',hidden:true},
							            {label : '终端IP',name : 'staIp'},
							            {label : '终端MAC	',name : 'staMac'},
							            {label : 'AC/BAS名称',name : 'acName'},
							            {label : 'AP MAC',name : 'apMac'},
							            {label : 'ssid',name : 'ssid'},
							            {label : '状态',name : '_status'},
							            {label : '上线开始时间',name : 'onlineDate'},
							            {label : '上线结束时间',name : 'offlineDate'},
							            {label : '流量',name : '_traffic'},
							            {label : '在线时长',name : '_duration'},
							            {label : '下线原因',name : '_dmReason'},
							            {label : '更新时间',name : 'updateDate'},
							            {name : "vnoId",hidden:true},
							            {label : '企业名称',name : 'vnoName',sortable:false},
							            {label :'操作', 
							            		formatter: function (cellValue, options, row){
							            			if(row.status=="30B"){
							            				return '';
							            			}
							            			var s = '<div id="logout"><a href="javascript:void(0);"  onclick="logout(\''+row.custId+'\',\''+row.staIp+'\',\''+row.acName+'\',\''+row.staMac+'\',\''+row.apMac+'\')">踢下线</a></div>';
							            				return s;
							            		},
							            		sortable:false
							            }],
							onSelectRow : function(rowId) {
								var data = $table.getRowData(rowId);
								$form.deSerializeObject(data).status('show');
							},
						    onPaging:function(){
						    	$form.status('show');
						    },
						   	onSortCol:function(){
						    	$form.status('show');
						    },
						   	loadComplete:function(){
						    	$form.status('show');
						    },
						    pager: "#sysmaintenance_onlineuser_jqGridPager"
						});
	}
	return {
		onCreate : onCreate,
		onActive : onActive
	};
});


