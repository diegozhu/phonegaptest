define(function () {
	var staffSvc = new Service('com.wboss.general.staff.StaffSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	var vnoId;

function onActive($page,$relativeUrl){
	
}

function onCreate($page,$relativeUrl){
	var $form = $page.find(".detail_form");
	$page.on('click',".btn-class-new,.btn-refresh",function(e){
		//禁用复选框
		$page.find("input[type='checkbox']").prop("disabled",false);
		priGrid.resetSelection();
	});

	$page.on('click',".btn-class-reset-passwd",function(e){
		var staffId = $form.find('input[name="staffId"]').val();
		if(!staffId){
			  BootstrapDialog.show({
	                type: BootstrapDialog.TYPE_DANGER,
	                title: '请选择员工',
	                message: '请选择员工',
	                buttons: [{
	                	label: '确定',action: function(dialogItself){
	                    dialogItself.close();
	                }}]
			  });
			return ;
		}
		staffSvc.call('resetStaffPass',[staffId],function(res){
			BootstrapDialog.success('密码重置成功');
		});
		
	});

	var $btnEdit = $page.find(".btn-class-edit"), 
		$btnResetPasswd = $page.find(".btn-class-reset-passwd"),
		$btnNew = $page.find(".btn-class-new");

	$form.privilege({
			'com.wboss.general.staff.StaffSvc?modifyStaff.object' : $btnEdit ,
			'com.wboss.general.staff.StaffSvc?resetPassword.object' : $btnResetPasswd ,
			//'com.wboss.general.staff.StaffSvc?addStaff.object' : $btnNew
			'com.wboss.general.staff.StaffSvc?addStaff.object' : function(svcUrl,hasPrivilege){ 
				if(!hasPrivilege){
					$btnNew.attr('data-privilege',false).prop('disabled',true);
					BootstrapDialog.warning('您没有添加权限');
				}
			}
	});

	
	$page.on('click',".btn-class-cancel",function(e){
		//全选按钮恢复禁用状态
		$page.find("input[type='checkbox']").prop("disabled",true);
		var rowId = jqGrid.jqGrid('getGridParam','selrow');
		if(!rowId){
			priGrid.resetSelection();
			return;
		}
	
		var data = jqGrid.getRowData(rowId);
		staffSvc.call('queryStaffRoleList', [{staffId: data.staffId}], function(res){
    		priGrid.resetSelection();
    		$.each(res, function(i, row){
    			priGrid.jqGrid('setSelection',row.roleId);
    		});
    	});
	})

	//给表单一个默认值，在点击创建按钮时，这个默认值会被反序列化到表单中
	vnoId = model.user().vnoId(), vnoName = model.user().vnoName();
	$page.find('input[name="vnoId"]').val(vnoId);
	$page.find('input[name="vnoName"]').val(vnoName);
	$form.data('default',{status:'00A',vnoShowFlag: 'F', vnoId: vnoId, vnoName: vnoName, passExpDate:'2030-01-01 00:00:00',createDate: new Date().toString("yyyy-MM-dd hh:mm:ss")});
	
	var validator = $form.validate({
		errorPlacement : function(error, element) {
			if (element.parent().hasClass("input-group")) {
				error.appendTo(element.parent().parent());
			}else{
				error.appendTo(element.parent());
			}
		}
	});
	
	function done(data){
		var staff = $form.serializeObject();
		var staffId = staff['staffId'];
		jqGrid.jqGrid("setGridParam", {
				search : true
			}).trigger("reloadGrid", [ {
				page : 1
			} ]);
			$form.status('show');
			
			var roleIds = priGrid.jqGrid('getGridParam','selarrrow').join(',');
			staffSvc.call('addStaffRole', [staffId , roleIds], function(res){
	    		BootstrapDialog.success("更新成功");
	    	});
	}

	$form.on('click',".btn-class-ok",function(e){
	    if (!$form.valid()) {
            return;
        }
		var staff = $form.serializeObject();
		var method = $form.status() == "new" ? 'addStaff' : 'modifyStaff';
		var msg = $form.status() == "new" ? '添加成功！' : '更新成功！';
        
		if(method=="modifyStaff"){
			delete staff.password;
			staffSvc.call(method, [ staff ], function() {
				jqGrid.jqGrid("setGridParam", {
					search : true
				}).trigger("reloadGrid", [ {
					page : 1
				} ]);
				$form.status('show');
				
				var roleIds = priGrid.jqGrid('getGridParam','selarrrow').join(',');
				staffSvc.call('addStaffRole', [staff.staffId,roleIds], function(res){
		    		BootstrapDialog.success(msg);
		    	});
			});
		}else{
			staffSvc.call(method, [ staff ], function(re) {
				jqGrid.jqGrid("setGridParam", {
					search : true
				}).trigger("reloadGrid", [ {
					page : 1
				} ]);
				$form.status('show');
				
				var roleIds = priGrid.jqGrid('getGridParam','selarrrow').join(',');
				staffSvc.call('addStaffRole', [re.staffId,roleIds], function(res){
		    		BootstrapDialog.success(msg);
		    	});
			});
		}
	});

	var jqGrid = $("#privilege_staffmanage_dataTable").jqGrid({
					url : '/data/com.wboss.general.staff.StaffSvc?m=queryStaffList4Jq.object.object',
					colModel : [
							{label : '员工编码', name : 'staffId', hidden : true },
							{label : '员工账号', name : 'staffCode' },
							{label : '员工姓名', name : 'staffName' },
							{label : '创建日期', name : 'createDate'},
							{label : '状态', name : '_status'},
							{label : '', name : 'vnoId',hidden : true},
							{label : '企业名称',name : 'vnoName', sortable : false},
							{label : '密码失效时间',name : 'passExpDate',hidden : true}
						],
					onSelectRow : function(rowId) {
						var data = jqGrid.griddata.rows[rowId - 1];
						// 清除之前的校验信息
						validator.resetForm();
				    	$form.deSerializeObject(data).status('show');

				    	$btnEdit.data('privilege') !== false && $btnEdit.prop('disabled', false);
						$btnResetPasswd.data('privilege') !== false && $btnResetPasswd.prop('disabled', false);
						
						
				    	staffSvc.call('queryStaffRoleList', [{staffId: data.staffId}], function(res){
				    		priGrid.resetSelection();
				    		$.each(res, function(i, row){
				    			priGrid.jqGrid('setSelection',row.roleId);
				    		});
				    	});
					},
					onPaging : function() {
						$form.status('show');
					},
					onSortCol : function() {
						$form.status('show');
					},
					loadComplete : function(data) {
						jqGrid.griddata = data;
						//默认禁用全选按钮
						$page.find("input[type='checkbox']").prop("disabled",true);
						$page.find(".btn-class-edit").prop('disabled', true);
						$page.find(".btn-class-reset-passwd").prop('disabled', true);
						priGrid.resetSelection();
						$form.status('show');
					},
					pager : "#privilege_staffmanage_jqGridPager"
				});
	
    //点击编辑或者新增时触发的事件
	   $page.find(".btn-class-edit").click(function(){
		   $page.find("input[type='checkbox']").prop("disabled",false);
	   });
	   	
		var  priGrid = $('#privilege_staffRoleDataTable').jqGrid({
				url: '/data/com.wboss.general.staff.RoleSvc?m=queryRoleList4Jq.object.object',
			    multiselect: true,
			    colModel: [
			        { label: '角色编码', name: 'roleId', key: true},
			        { label: '角色名称', name: 'roleName'}
			    ],
			    height: '378px',
			    rowNum : 200,
			    shrinkToFit:true,
			    beforeSelectRow: function (rowid, e) {
			    	var isShow = $form.status() === 'show',
			    	box = $($(e.target).closest('td')[0]).find('input[type="checkbox"]');
			    	var isSelected = priGrid.jqGrid('getGridParam','selarrrow').indexOf(rowid) != -1;
			    	box.prop('checked', isSelected || !isShow);
			        return !isShow;  
			    }
		});
	}



	return {onCreate : onCreate, onActive : onActive };
});
