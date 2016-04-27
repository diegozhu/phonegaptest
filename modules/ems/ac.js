define(function () {
//方法
var AcSvc = new Service('com.wboss.wcb.auth.authmgr.AcSvc');
var sysparam = new Service("com.wboss.general.param.SysParamSvc");
var ctEquipListSvc = new Service("com.wboss.wcb.auth.authmgr.CtEquipListSvc");

function onActive($page,$relativeUrl){

	
}

function onCreate($page,$relativeUrl){

	//查询设备名称
	ctEquipListSvc.call('findctEquipName',[],function(r){
		var dom = "";
		for(var i in r){
			dom += "<option class='form-control' value='"+r[i].ctEquipId+"'>"+r[i].ctEquipName+"</option>"
		}
		$page.find(".ctEquip_selector").append(dom);
	});
	
	var $form = $page.find(".detail_form");
	var $table = $("#ems_ac_dataTable");
		//gid显示隐藏
	$page.find(".ctEquip_selector").change(function(){
		if(this.value=="20"){
			$page.find(".gwid").show();
			return;
		}
		$page.find(".gwid").hide();
	});
	//取消事件
	$page.on('click',".btn-class-cancel",function(e){
		var data = $($(e.target).parents("form")[0]).data('backup');
		if(data.ctEquipId == "20"){
			$page.find(".gwid").show();
		}else{
			$page.find(".gwid").hide();
		}
	});
	//虚拟运行商
	var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
	$page.find('input[name="vnoId"]').val(vnoId);
	$page.find('input[name="vnoName"]').val(vnoName);
	$form.data('default',{status:'00A',ctEquipId:'1',vnoId:vnoId,vnoName:vnoName});
	$form.on('click',".btn-class-ok",function(e){
		 if (!$form.valid()) {
	            return;
	        }
		var ac = $form.serializeObject();
		var method = $form.status() == "new" ? 'insertAc' : 'modifyAc';
		var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';

		AcSvc.call(method,[ac],function(){
			jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			BootstrapDialog.success(msg);
			$form.status('show');
		});
	});
	var validator = $form.validate();
	var jqGrid = $table.jqGrid({
	    url: wboss.getWay + '/data/com.wboss.wcb.auth.authmgr.AcSvc?m=queryAcList.object.object',
	    colModel: [
	   	        { label: 'AC标识', name: 'acId',width: 200 ,hidden:true},
	   	        { label: 'AC名称', name: 'acName',width: 200},
	   	        { label: 'IP地址', name: 'ip',width: 100},
	   	        { label: '鉴权端口', name: 'authPort',width: 100},
	   	        { label: '鉴权KEY', name: 'authKey',width: 200},
	   	        { label: '计费KEY', name: 'acctKey',width: 200},
	   	        {label : '快速开户模板名称',name : 'custTemplateName'}, 
	   	        {label : 'PORTAL策略名称',name : 'policyName'},
	   	        { label: 'VnoId',name: 'vnoId',width: 200,hidden:true},
	   	        { label:'企业名称', name: 'vnoName',width: 200,sortable:false},
	   	        { label:'状态', name: '_status',sortable:false},
	   	        { label:'设备名称', name: 'ctEquipId',hidden:true },
	   	        { label:'GW_ID', name: 'gwId'}
	   	    ],
	    onSelectRow:function(rowId){
	    	//选中行是,编辑按钮可编辑
	    	$page.find(".btn-class-edit").prop('disabled', false);
	    	//清除之前的校验信息
	    	validator.resetForm();
	    	//获取选中行信息
	    	var data = jqGrid.griddata.rows[rowId-1];
	    	$form.deSerializeObject(data).status('show');
	    	//如果是ikuai就显示
	    	if(data.ctEquipId=="20"){
	    		$page.find(".gwid").show();
	    		return;
	    	}
	    	$page.find(".gwid").hide();

	    },
	    onPaging:function(){
	    	$form.status('show');
	    },
	   	onSortCol:function(){
	    	$form.status('show');
	    },
	   	loadComplete:function(data){
	   		jqGrid.griddata = data;
	    	$form.status('show');
	    	//页面加载时，编辑不可用
	    	$page.find(".btn-class-edit").prop('disabled', true);
	    },
	    pager: "#ems_ac_jqGridPager"
	});
}

return { onCreate : onCreate, onActive : onActive };
});


