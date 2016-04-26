define(function() {
	var vlanSvc = new Service("com.wboss.wcb.auth.authmgr.VlanSvc");
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	return {
		onCreate : function($page, $relativeUrl) {

			var $form = $page.find(".detail_form");
			var $table = $("#ems_vlan_dataTable");
			// 给表单一个默认值，在点击创建按钮时，这个默认值会被反序列化到表单中
			//设置运营商默认值
			var vnoId=model.user().vnoId();
			var vnoName=model.user().vnoName();
			$page.find("input[name='vnoId']").val(vnoId);
			$page.find("input[name='vnoName']").val(vnoName);
			$form.data('default',{status:'00A',vnoId:vnoId,vnoName:vnoName});
			
			var validator = $form.validate();

			$form.on('click', ".btn-class-ok",
					function(e) {
						if (!$form.valid()) {
							return;
						}
						var vlan = $form.serializeObject();
						var method = $form.status() == "new" ? 'addVlan'
								: 'modifyVlan';
						var msg = $form.status() == "new" ? '添加成功！' : '更新成功！';
						vlanSvc.call(method, [ vlan ], function() {
							jqGrid.jqGrid("setGridParam", {
								search : true
							}).trigger("reloadGrid", [ {
								page : 1
							} ]);
							BootstrapDialog.success(msg);
							$form.status('show');
						});
					});

			var $table = $("#ems_vlan_dataTable");
			var jqGrid = $table
					.jqGrid({
						url : '/data/com.wboss.wcb.auth.authmgr.VlanSvc?m=qryVlanInfoJq.object.object',
						colModel : [
								{name : 'vlanId',hidden : true},
								{name : 'accObjId',hidden:true},
								{label : 'vlan名称',name : 'vlan'},
								{label : '描述',name : 'nasidDesc'},
								{label : '快速开户模板名称',name : 'custTemplateName'}, 
								{label : 'PORTAL策略名称',name : 'policyName'},
								{label : '',name : 'vnoId',hidden : true},
								{label : '企业名称',name : 'vnoName',sortable : false,width : 200},
								{label : '状态',name : '_status'}
								],
						onSelectRow : function(rowId) {

							var data = jqGrid.vlan.rows[rowId - 1];
							// 清空校验
							validator.resetForm();
							$form.deSerializeObject(data).status('show');
							//获取选中行时，编辑可用
					    	$page.find(".btn-class-edit").prop('disabled', false);
						},
						onPaging : function() {
							$form.status('show');
						},
						onSortCol : function() {
							$form.status('show');
						},
						loadComplete : function(data) {
							jqGrid.vlan = data;
							$form.status('show');
							//页面加载时，编辑不可用
					    	$page.find(".btn-class-edit").prop('disabled', true);
						},
					 pager:ems_vlan_jqGridPager
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