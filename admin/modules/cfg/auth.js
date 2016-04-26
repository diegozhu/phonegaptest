define(function (){
	var authSvc = new Service('com.wboss.wcb.auth.authmgr.AuthSvc');
	
	function onActive($page,$relativeUrl){
		
	}
	function onCreate($page,$relativeUrl){
		var $form = $page.find(".detail_form");	
		var $table = $page.find("#cfg_auth_dataTable");
		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
		$page.find('input[name="vnoName"]').val(vnoName);
		$page.find('input[name="vnoId"]').val(vnoId);
		
		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
		$form.find('input[name="vnoId"]').val(vnoId);
		$form.find('input[name="vnoName"]').val(vnoName);
		//初始值
		$form.data('default',{status:'00A',vnoId:vnoId,vnoName:vnoName,upVerifyType:'DEF',accBindType:'90A',priority:'0',isForceDm:'F'});
		$form.find('input[name="priority"]').val('0');
		
		//校验
		var validator=$form.validate();
		var $accLimit = $form.find("input[name='accServLimit']");
		var $bindLimit = $form.find("input[name='bindServLimit']");
		$bindLimit.rules('add', {isNumber3:true,required:true});
		$accLimit.rules('add', {isNumber3:true,required:true});
		$(".accBindType").change(function(){
			typeControl($(this).val());
		});
		
		function typeControl(type){
			if(type=='90A'){
				$form.find("input[name='bindServLimit']").prop("disabled",true);
				$form.find("input[name='accServLimit']").prop("disabled",true);
				$form.find("input[name='bindServLimit']").prop("placeholder","");
				$form.find("input[name='accServLimit']").prop("placeholder","");
				$bindLimit.rules('remove');
				$accLimit.rules('remove');
			}else{
				$form.find("input[name='bindServLimit']").prop("disabled",false);
				$form.find("input[name='accServLimit']").prop("disabled",false);
				$form.find("input[name='bindServLimit']").prop("placeholder","");
				$form.find("input[name='accServLimit']").prop("placeholder","");
				$bindLimit.rules('add', {isNumber3:true,required:true});
				$accLimit.rules('add', {isNumber3:true,required:true});
			}
		}
		
		$page.find(".btn-class-edit,.btn-class-cancel").click(function(){
			$(".accBindType").trigger('change');
		});
		
		$page.find(".btn-class-new").click(function(e){
			 var $form = $($(e.target).parents("form")[0]);
			    $form.status('new');
			    $form.data('backup',$form.serializeObject());
			    if($form.data('default') != undefined){
			        $form.deSerializeObject($form.data('default'));
			    }
			$(".accBindType").trigger('change');
			return false;
		});
		
		//修改删除
			$form.on('click',".btn-class-ok",function(e){
				 if (!$form.valid()) {
			            return;
			        }
				var auth = $form.serializeObject();
				var method = $form.status() == "new" ? 'insertAuthInfo' : 'updateAuthInfo';
				var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';

				authSvc.call(method,[auth],function(){
					jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					BootstrapDialog.success(msg);
					$form.status('show');
				});
			});
		
		var jqGrid = $table.jqGrid({
			url : '/data/com.wboss.wcb.auth.authmgr.AuthSvc?m=queryAllAuthenticationList4Jq.object.object',
			colModel : [{label : '鉴权策略标识',name : 'authenId',hidden:true},
			            {label : '鉴权策略名称',name : 'authenName'},
			            {label : '用户密码效验类型',name : '_upVerifyType'},
			            {label : '访问限制类型',name : '_accBindType'},
			            {label : '策略描述',name : 'authenDesc'},
			            {label : '绑定终端限制计数',name : 'bindServLimit'},
			            {label : '访问终端限制计数',name : 'accServLimit'},
			            {label : '是否强踢在线用户',name : '_isForceDm'},
			            {label : '优先级',name : 'priority'},
			            {label : '状态',name : '_status'},
			            {name : 'vnoId',hidden:true},
			            {label : '企业名称',name : 'vnoName',sortable:false}],
			onSelectRow : function(rowId) {
				//清除之前的校验信息
				validator.resetForm();
				var data = jqGrid.griddata.rows[rowId-1];
				$page.find(".btn-class-edit").prop('disabled', false);
				$form.deSerializeObject(data).status('show');
			},
		    onPaging:function(){
		    	$form.status('show');
		    },
		   	onSortCol:function(){
		    	$form.status('show');
		    },
		   	loadComplete:function(data){
		   		$page.find(".btn-class-edit").prop('disabled', true);
		   		jqGrid.griddata = data;
		    	$form.status('show');
		    },
		    pager: "#cfg_auth_jqGridPager"
		});
}	
return { onCreate : onCreate, onActive : onActive };	
});