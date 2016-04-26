define(function() {
	var ssidSvc = new Service("com.wboss.wcb.auth.authmgr.SsidSvc");
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	function onActive($page,$relativeUrl){
		
	}
	
	function onCreate($page,$relativeUrl) {
			var $form = $page.find(".detail_form");
			var $table = $("#ems_ssid_dataTable");
			//给表单一个默认值，在点击创建按钮时，这个默认值会被反序列化到表单中
			$form.data('default',{status:'00A',isHidden:'F',isWapi:'T'});
			var validator = $form.validate();
			$form.on('click',".btn-class-ok",function(e){
				if(!$form.valid()){
					return;
				}
				var ssid = $form.serializeObject();
				var method = $form.status() == "new" ? 'insertSsid' : 'modifySsid';
				var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';	
				//var flag = false;
		    	if(method=='modifySsid'){	
			        	ssidSvc.call(method,[ssid,false],function(){
							jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
							BootstrapDialog.success(msg);
							$form.status('show');
			        });
				}else{
					ssidSvc.call(method,[ssid],function(){
						jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
						BootstrapDialog.success(msg);
						$form.status('show');
					});
				}
			});
			//设置运营商默认值
			var vnoId=model.user().vnoId();
			var vnoName=model.user().vnoName();
			$page.find("input[name='vnoId']").val(vnoId);
			$page.find("input[name='vnoName']").val(vnoName);
			$form.data('default',{status:'00A',vnoId:vnoId,vnoName:vnoName});
			

			var jqGrid = $table.jqGrid({
								url :'/data/com.wboss.wcb.auth.authmgr.SsidSvc?m=querySsidListJq.object.object',
								colModel :
									[ 
									  {label : '',name : 'ssidId',hidden:true},
									  {label : '',name : 'accObjId',hidden:true},
									  {label : '广播SSID名称',name : 'ssid'}, 
									  {label : '描述',name : 'ssidDesc'}, 
									  {label : '快速开户模板名称',name : 'custTemplateName'}, 
									  {label : 'PORTAL策略名称',name : 'policyName'},
									  {label : '',name : 'vnoId',hidden:true}, 
									  {label : '企业名称',name : 'vnoName',sortable:false,width:200}, 
									  {label : '是否WAPI接入',name : 'isWapi',hidden:true},
									  {label : '是否隐藏SSID',name : 'isHidden',hidden:true}, 
									  {label : 'VLAN标识',name : 'vlan',hidden:true},
									  {label : '状态',name : '_status',sortable:false}
									 ],
								onSelectRow : function(rowId) {
									var data = jqGrid.ssidDo.rows[rowId-1];
									//清空校验信息
									validator.resetForm();
									$form.deSerializeObject(data).status('show');
									//页面加载时，编辑不可用
							    	$page.find(".btn-class-edit").prop('disabled', false);
								},onPaging:function(){
							    	$form.status('show');
							    },
							   	onSortCol:function(){
							    	$form.status('show');
							    },
							   	loadComplete:function(data){
							   		jqGrid.ssidDo = data;
							   		$form.status('show');
							   		//页面加载时，编辑不可用
							    	$page.find(".btn-class-edit").prop('disabled', true);
							    },
								pager : "#ems_ssid_jqGridPager"
							});
		}
	return {
		onCreate : onCreate,
		onActive : onActive
	};
});
