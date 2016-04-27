var accessRuleSvc = new Service('com.wboss.wcb.rating.config.AccessRuleCfgSvc');
function deleteAccessDetail(detailRuleId){
	BootstrapDialog.confirm({title:'删除提示', btnOKLabel:'确定', btnCancelLabel:'取消', message:'确定删除吗?', callback: function(flag){
		if(flag){
			var accessRuleVo = {detailRuleId: detailRuleId, accessId: $accessId};
			accessRuleSvc.call('deleteAccessRule', [accessRuleVo], function(res){
				$("#cfg_access_detail_dataTable").jqGrid().jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
			},function(e){
				console.log(e);
			});
		}
	}});
}
define(function () {
	var accessSvc = new Service('com.wboss.wcb.rating.config.AccessCfgSvc');
	function onActive($page,$relativeUrl){
		
	}
	function onCreate($page,$relativeUrl){
		var $form = $page.find(".detail_form");
		var $table = $("#cfg_access_dataTable");
		$accessId = '';
		var detailGrid = '';
		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
		$page.find('input[name="vnoName"]').val(vnoName);
		$page.find('input[name="vnoId"]').val(vnoId);
		//虚拟运营商初始化
		$form.find('input[name="vnoId"]').val(vnoId);
		$form.find('input[name="vnoName"]').val(vnoName);
		$form.data('default',{status:'00A', vnoId:vnoId, vnoName:vnoName, effDate:new Date().toString("yyyy-MM-dd hh:mm:ss"), expDate:'2030-01-01 00:00:00'});
		
		//校验
		var validator=$form.validate();
		
		$form.on('click',".btn-class-ok",function(e){
			if(!$form.valid()){
				return;
			}
			var accessInfo = $form.serializeObject();
			
			var method = $form.status() == "new" ? 'insertAccessInfo' : 'updateAccessInfo';
			var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';

			accessSvc.call(method,[accessInfo],function(){
				jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
				BootstrapDialog.success(msg);
				$form.status('show');
			});
		});
		
		var jqGrid = $table.jqGrid({
		    url: wboss.getWay + '/data/com.wboss.wcb.rating.config.AccessCfgSvc?m=queryAllAccessInfoByJq.object.object',
		    colModel: [
		        { name: 'accessId', hidden:true},
		        { label: '授权模板名称', name: 'accessName'},
		        { label: '授权模板描述', name: 'comments'},
		        { label: '生效时间', name: 'effDate'},
		        { label: '失效时间', name: 'expDate'},
		        { label: '状态', name: '_status'},
		        { name: 'vnoId', hidden:true},
		        { label: '企业名称', name: 'vnoName',sortable:false}
		    ],
		    onSelectRow:function(rowId){
		    	//清除之前的校验信息
				validator.resetForm();
		    	var data = jqGrid.griddata.rows[rowId-1];
		    	$page.find(".btn-class-edit").prop('disabled', false);
		    	//设置表单状态，目前有new，edit，show三种状态，
		    	$form.deSerializeObject(data).status('show');
		    	$accessId=data.accessId;
		    	$page.find('.search-form').find('input[name="selectAccessId"]').val($accessId);
		    	//把参数传到另一个jqGrid 另一个jqGrid调用参数并刷新
		    	var postData = detailGrid.jqGrid("getGridParam", "postData");
				postData.param = JSON.stringify({accessId: data.accessId});
				detailGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
		    },
		    onPaging:function(){
		    	$form.status('show');
		    },
		   	onSortCol:function(){
		    	$form.status('show');
		    },
		   	loadComplete:function(data){
		   		$page.find('.search-form').find('input[name="selectAccessId"]').val('');
		   		$page.find(".btn-class-edit").prop('disabled', true);
		   		jqGrid.griddata = data;
		    	$form.status('show');
		    },
		    pager: "#cfg_access_jqGridPager"
		});
		
		detailGrid = $('#cfg_access_detail_dataTable').jqGrid({
			url: wboss.getWay + '/data/com.wboss.wcb.rating.config.AccessRuleCfgSvc?m=queryAccessDetailRuleList.object.object',
		    colModel: [
		    	{ label: '', name: 'detailRuleId', hidden: true, key: true},
		    	{ label: '规则名称', name: 'detailRuleName'},
		        { label: '规则类型', name: '_ruleType'},
		        { label: '授权类型', name: '_accessType'},
		        { label: '操作',
		        	formatter: function (cellValue, options, row){
            			if(row.status=="30B"){
            				return '';
            			}
            			var s = '<div id="del"><a href="javascript:void(0);" onclick="deleteAccessDetail(\''+row.detailRuleId+'\')">删除</a></div>';
            				return s;
            		},
            		sortable:false
		        }
		        
		    ],loadComplete:function(data){
	        	$page.find('.search-form').find('input[name="detailRuleIds"]').val('');
	        	if(!data){
	        		return;
	        	}
	        	var ruleIds = ',';
	        	for(var i=0; i< data.length; i++){
	        		ruleIds +=data[i].detailRuleId+',';
	        	}
	        	$page.find('.search-form').find('input[name="detailRuleIds"]').val(ruleIds);
	        }
		});
	}
return { onCreate : onCreate, onActive : onActive };
});