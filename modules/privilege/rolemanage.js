define(function () {

var roleSvc = new Service('com.wboss.general.staff.RoleSvc');
var sysparam = new Service("com.wboss.general.param.SysParamSvc");

function onActive($page,$relativeUrl){
}

function onCreate($page,$relativeUrl){

	sysparam.call('getDicData',['DIC_STATUS'],function(res){
		var dom = "";
		for(var i in res){
			dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
		}
		$page.find("select[name='status']").append(dom);
	});

	var $form = $page.find(".detail_form");

	$page.on('click',".btn-class-new,.btn-refresh",function(e){
		priGrid.resetSelection();
	});
	
	$page.on('click',".btn-class-cancel",function(e){
		var rowId = jqGrid.jqGrid('getGridParam','selrow');
		if(!rowId){
			priGrid.resetSelection();
			return;
		}
		var data = jqGrid.getRowData(rowId);
		roleSvc.call('queryRolePrivilegeList', [{roleId: data.roleId}], function(res){
    		priGrid.resetSelection();
    		$.each(res, function(i, row){
    			priGrid.jqGrid('setSelection',row.privilegeId);
    		});
    	});
	});
	$page.on('click',".btn-class-cancel",function(e){
		$page.find("input[type='checkbox']").prop("disabled",true);
	})
	$page.on('click',".btn-class-new,.btn-class-edit",function(e){
		$page.find("input[type='checkbox']").prop("disabled",false);
	})

	//给表单一个默认值，在点击创建按钮时，这个默认值会被反序列化到表单中
	var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
	$page.find('input[name="parentVnoId"]').val(vnoId);
	$page.find('input[name="parentVnoName"]').val(vnoName);
	$form.data('default',{status:'00A', vnoShowFlag: 'F'});
	var validator = $form.validate();
	
	$form.on('click',".btn-class-ok",function(e){
	    if (!$form.valid()) {
            return;
        }
		var role = $form.serializeObject();
		var method = $form.status() == "new" ? 'addRole' : 'modifyRole';
		var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';

		roleSvc.call(method,[role],function(res){
			jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 

			var privilegeIds = priGrid.jqGrid('getGridParam','selarrrow').join(',');
			roleSvc.call('addRolePrivilege', [method == 'addRole' ? res.roleId : role.roleId, privilegeIds], function(res){
				$form.status('show');
	    		BootstrapDialog.success(msg);
	    	});
		});
	});

	var jqGrid = $("#privilege_rolemanage_dataTable").jqGrid({
	    url: wboss.getWay + '/data/com.wboss.general.staff.RoleSvc?m=queryRoleList4Jq.object.object',
	    colModel: [
	        { label: '角色编码', name: 'roleId', hidden: true},
	        { label: '角色名称', name: 'roleName'},
	        { label: '企业名称显示', name: 'vnoShowFlag', formatter: function(c,o,r){return 'T'==c ? '展示': '不展示';}},
	        { label: '登录页面', name: 'loginPage'},
	        { label:'创建日期', name: 'createDate', sortable: false},
	        { label:'', name: 'status',hidden:true}
	    ],
	    onSelectRow:function(rowId){
	    	var data = jqGrid.griddata.rows[rowId-1];
	    	$page.find(".btn-class-edit").prop('disabled', false);
	    	//清除之前的校验信息
	    	validator.resetForm();
	    	//设置表单状态，目前有new，edit，show三种状态，
	    	$form.deSerializeObject(data).status('show');
	    	if(!data.vnoShowFlag){
	    		$page.find("select[name='vnoShowFlag']").val('F');
	    	}
	    	roleSvc.call('queryRolePrivilegeList', [{roleId: data.roleId}], function(res){
	    		priGrid.resetSelection();
	    		$.each(res, function(i, row){
	    			priGrid.jqGrid('setSelection',row.privilegeId);
	    		});
	    	});
	    },
	    onPaging:function(){
	    	$form.status('show');
	    },
	   	onSortCol:function(){
	    	$form.status('show');
	    },
	   	loadComplete:function(data){
	   		jqGrid.griddata = data;
	   		$page.find(".btn-class-edit").prop('disabled', true);
	   		$page.find("input[type='checkbox']").prop("disabled",true);
	   		priGrid.resetSelection();
	    	$form.status('show');
	    },
	    pager: "#privilege_rolemanage_jqGridPager"
	});

	var  priGrid = $('#privilege_dataTable').jqGrid({
	    url: wboss.getWay + '/data/com.wboss.general.staff.PrivilegeSvc?m=queryPrivilegeList.object.object',
	    multiselect: true,
	    colModel: [
	    	{ label: '', name: 'privilegeId', hidden: true, key: true},
	        { label: '权限编码', name: 'privilegeCode'},
	        { label: '权限名称', name: 'privilegeName'}
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

return { onCreate : onCreate, onActive : onActive };
});


