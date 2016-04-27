define(function () {
//方法
var PortalAccPolicySvc = new Service('com.wboss.wcb.auth.authmgr.PortalAccPolicySvc');
var PortalThemeSvc =new Service("com.wboss.wcb.admin.theme.PortalThemeSvc");

function onActive($page,$relativeUrl){

	
}

function onCreate($page,$relativeUrl){
	var $form = $page.find(".detail_form");
	var $table = $("#cfg_portal_acc_dataTable");
	//虚拟运行商
	var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
	$page.find('input[name="vnoId"]').val(vnoId);
	$page.find('input[name="vnoName"]').val(vnoName);
	//默认状态
	$form.data('default',{status:'00A',autoCreatAcct:'T',snAuthFlag:'T',passNotifyType:'SMS',accAuthType:'P01',vnoId:vnoId,vnoName:vnoName});
	
	//校验
	var validator=$form.validate();
	$form.on('click',".btn-class-ok",function(e){
		 if (!$form.valid()) {
	            return;
	        }
		var portal = $form.serializeObject();
		var method = $form.status() == "new" ? 'insert' : 'modifyPortalAccPolicy';
		var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';

		PortalAccPolicySvc.call(method,[portal],function(){
			jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			BootstrapDialog.success(msg);
			$form.status('show');
		});
	});

	var jqGrid = $table.jqGrid({
	    url: wboss.getWay + '/data/com.wboss.wcb.auth.authmgr.PortalAccPolicySvc?m=queryPortalAccPolicy.object.object',
	    colModel: [
	   	        { label: '访问策略标识', name: 'portalAccPolicyId',width: 200,hidden:true },
	   	        { label: '策略名称', name: 'policyName',width: 100},
	   	        { label: 'portal主题标识', name: 'portalThemeName',width: 200,sortable:false},
	   	        { label: '接入鉴权类型', name: '_accAuthType'},
	   	        { label: '自助开户', name: '_autoCreatAcct',width: 200},
	   	        { label: '社会化认证', name: '_snAuthFlag',width: 200},
	   	        { label: '第三方登录首页', name: 'loginPage',width: 200},
	   	        { label: '第三方登录成功页面', name: 'loginOkPage',width: 200},
	   	        { label: '密码通知形式', name: '_passNotifyType',width: 200},
	   	        { label: 'VnoId',name: 'vnoId',width: 200,hidden:true},
	   	        { label:'企业名称', name: 'vnoName',width: 200,sortable:false},
	   	        { label:'状态', name: '_status'}
	   	    ],
	    onSelectRow:function(rowId){
	    	//选中行是,编辑按钮可编辑
	    	$page.find(".btn-class-edit").prop('disabled', false);
	    	//清除之前的校验信息
	    	validator.resetForm();
	    	//获取选中行信息
	    	var data = jqGrid.griddata.rows[rowId-1];
	    	$form.deSerializeObject(data).status('show');
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
	    pager: "#cfg_portal_acc_jqGridPager"
	});
}

return { onCreate : onCreate, onActive : onActive };
});


