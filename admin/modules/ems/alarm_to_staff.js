define(function() {
    var alarmSvc = new Service("com.wboss.iom.monitor.AlarmToStaffSvc");
    var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	return {
		onCreate : function($page,$relativeUrl) {
			
			var $form = $page.find(".detail_form");
			var $table = $("#ems_alarm_to_staff_dataTable");
			
			var validator = $form.validate();
			//设置默认值
			var vnoId=model.user().vnoId();
			var vnoName=model.user().vnoName();
			$page.find("input[name='vnoId']").val(vnoId);
			$page.find("input[name='vnoName']").val(vnoName);
			$form.data('default',{status:'00A',isHidden:'F',isWapi:'T',alarmWay:'M',vnoId:vnoId,vnoName:vnoName});
			
			$form.on('click',".btn-class-new",function(e){
				$page.find("input[name='alarmWay']").prop('disabled', false);
			 });
			
			
			$form.on('click',".btn-class-ok",function(e){
				if(!$form.valid()){
					return;
				}
				var alarm = $form.serializeObject();
				alarm.alarmWay = (alarm.alarmWay||"").join(',');
				var method = $form.status() == "new" ? 'insertAlarm' : 'updateAlarm';
				var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';	  
				alarmSvc.call(method,[alarm],function(){
					jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					BootstrapDialog.success(msg);
					$form.status('show');
				});
			});
			
			var jqGrid = $("#ems_alarm_to_staff_dataTable")
					.jqGrid(
							{
								url : '/data/com.wboss.iom.monitor.AlarmToStaffSvc?m=queryAlarmListJq.object.object',
								colModel : [ 
								{label : '',name : 'toStaffId',hidden:true},
							    {label : '',name : 'staffId',hidden:true},
							    {label : '员工',name : 'staffName' },
								{label : '监控信息名称',name : 'infoDefineName'}, 
								{label : '',name : 'infoDefineCode',hidden:true}, 
								{label : '告警方式',name : '_alarmWay'
								}, 
								{label : '',name : 'vnoId',hidden : true}, 
								{label : '企业名称',name : 'vnoName',sortable : false} ,
								   { label:'状态', name: '_status'}],
								onSelectRow : function(rowId) {
									var data = jqGrid.alarmDo.rows[rowId-1];
									
									//清除校验信息
									validator.resetForm();
									$form.deSerializeObject(data).status('show');
									
									//获取选中行时，编辑可用
							    	$page.find(".btn-class-edit").prop('disabled', false);
								},onPaging:function(){
							    	$form.status('show');
							    },
							   	onSortCol:function(){
							    	$form.status('show');
							    },
							   	loadComplete:function(data){
							   		jqGrid.alarmDo = data;
							   		$form.status('show');
							   	//页面加载时，编辑不可用
							    	$page.find(".btn-class-edit").prop('disabled', true);
							    },
								pager : "#ems_alarm_to_staff_jqGridPager"
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
