define(function() {
	var taskSvc = new Service("com.wboss.general.task.TaskTimingCfgSvc");

	return {
		onCreate : function($page, $relativeUrl) {
			
			var $form = $page.find(".detail_form");
			var $table = $("#cfg_task_dataTable");
			//给表单一个默认值，在点击创建按钮时，这个默认值会被反序列化到表单中
			$form.data('default',{status:'00A'});
			var validator = $form.validate();
			
			$form.on('click',".btn-class-ok",function(e){
				if(!$form.valid()){
					return;
				}
				var task = $form.serializeObject();
				var method = $form.status() == "new" ? 'addTask' : 'modifyTask';
				var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';		
				if(!$form.isDataChanged() && $form.status() == 'edit'){
					BootstrapDialog.warning('您没有做任何改变');
					return;
				}
				taskSvc.call(method,[task],function(){
					jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					BootstrapDialog.success(msg);
					$form.status('show');
				});
			});
			
			var $table = $("#cfg_task_dataTable");
			var $btnEdit = $page.find(".btn-class-edit");
			var jqGrid = 
				$table.jqGrid(
							{
								url : wboss.getWay + '/data/com.wboss.general.task.TaskTimingCfgSvc?m=qryTaskTimingInfoJq.object.object',
								colModel : [
								            {name : 'taskId',hidden:true}, 
								            {label : '任务名称',name : 'taskName'}, 
								            {label : '任务类型',name : 'taskType'}, 
								            {label : '任务描述',name : 'taskDesc'}, 
								            {label : '任务服务名',name : 'taskSvc'},
								            {label : '任务工作时间',name : 'taskWorkTime'},
								            {label : '任务参数',name : 'taskParam'},
								            { label:'状态',name: '_status'}
								            ],
								onSelectRow : function(rowId) {
									//获取选中行时，编辑可用
							    	$btnEdit.data('privilege') !== false && $btnEdit.prop('disabled', false);
									var data = jqGrid.task.rows[rowId-1];									
									//清空校验
									validator.resetForm();
									$form.deSerializeObject(data).status('show');
								},onPaging:function(){
							    	$form.status('show');
							    },
							   	onSortCol:function(){
							    	$form.status('show');
							    },
							   	loadComplete:function(data){
							   		jqGrid.task = data;
							   		$form.status('show');
							   		//页面加载时，编辑不可用
							    	$page.find(".btn-class-edit").prop('disabled', true);
							    },
							    pager: $("#cfg_task_jqGridPager")
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