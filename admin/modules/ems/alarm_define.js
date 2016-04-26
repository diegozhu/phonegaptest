define(function() {
	var monitorInfoDefineSvc = new Service("com.wboss.iom.monitor.MonitorInfoDefineSvc");
    var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	
	return {
		onCreate : function($page,$relativeUrl) {
			
			
			
			var $form = $page.find(".detail_form");
			var $table = $("#ems_alarm_define_dataTable");
			//给表单一个默认值，在点击创建按钮时，这个默认值会被反序列化到表单中
			$form.data('default',{status:'00A',eqType:'000'});
			var validator =$form.validate();
			
			$form.on('click',".btn-class-ok",function(e){
				if(!$form.valid()){
					return;
				}
				var monitorInfo = $form.serializeObject();
				var method = $form.status() == "new" ? 'addmonitorInfo' : 'modifymonitorInfo';
				var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';		
				monitorInfoDefineSvc.call(method,[monitorInfo],function(){
					jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					BootstrapDialog.success(msg);
					$form.status('show');
				});
			});
			
			var jqGrid = $table.jqGrid({
								url :'/data/com.wboss.iom.monitor.MonitorInfoDefineSvc?m=queryMonitorInfoDefineListJq.object.object',
								colModel :
									[ 
									  {label : '监控信息编码',name : 'infoDefineCode'},
									  {label : '监控信息名称',name : 'infoDefineName'}, 
									  {label : '监控信息描述',name : 'infoDefineDesc'},
									  {label : '设备类型',name : '_eqType'},
									  {label : '状态',name : 'status',hidden:true}, 
										{label : '阀值上限',name : 'upperLimit',
											formatter: function (cellValue){
												if(cellValue=='-1')
													return '不检测阀值';
												else
													return cellValue;
											}},
										{label : '阀值下限',name : 'lowerLimit',
											formatter: function (cellValue){
												if(cellValue=='-1')
													return '不检测阀值';
												else
													return cellValue;
											}
										},
										 {label : '操作反回',name : 'recoverNotifyFlag',
											formatter: function (cellValue){
												if(cellValue=='T')
													return '成功';
												else
													return '失败';
											}
										 }
									  ],
								onSelectRow : function(rowId) {
									var data = jqGrid.monitorDo.rows[rowId-1];
									//清空校验
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
							   		jqGrid.monitorDo = data;
							   		$form.status('show');
							   	//页面加载时，编辑不可用
							    	$page.find(".btn-class-edit").prop('disabled', true);
							    },
								pager : "#ems_alarm_define_jqGridPager"
							});
			
		},
		onActive : function() {
		}
	}
	return {
		onCreate : onCreate,
		onActive : onActive
	};
});
