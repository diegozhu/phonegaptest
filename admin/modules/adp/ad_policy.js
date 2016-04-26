define(function() {
	var adPolicySvc = new Service("com.wboss.wcb.admin.ad.AdGetPolicySvc");
	var adPolicyContentSvc = new Service("com.wboss.wcb.admin.ad.AdGetPolictyContentSvc");
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	var ssidSvc = new Service("com.wboss.wcb.auth.authmgr.SsidSvc");
	var apSvc = new Service("com.wboss.wcb.auth.authmgr.ApSvc");
	var timeSpanSvc = new Service("com.wboss.wcb.rating.config.TimeSpanCfgSvc");
	var data ;
	
	return {
		onCreate : function($page, $relativeUrl) {
			//行业
			sysparam.call('getDicData', [ 'DIC_INDUSTRY_TYPE' ], function(res) {
				var dom = "";
				for ( var i in res) {
					dom += "<option class='form-control' id='optionType' value='"
							+ res[i].dicValue + "'>" + res[i].dicValueName
							+ "</option>"
				}
				$page.find("select[name='industry_type']").append(dom);
			});
			
			var $PolicyId = '';
			var jqGridContent = '';
			var $form = $page.find(".detail_form");
			var $formContent = $page.find(".detail_content_form");
			var $table = $("#adp_ad_policy_dataTable");
			var vnoId = model.user().vnoId(), vnoName = model.user().vnoName();
			$page.find('input[name="vnoName"]').val(vnoName);
			$page.find('input[name="vnoId"]').val(vnoId);
			//虚拟运营商初始化
			$form.find('input[name="vnoId"]').val(vnoId);
			$form.find('input[name="vnoName"]').val(vnoName);
			
			// 给表单一个默认值，在点击创建按钮时，这个默认值会被反序列化到表单中
			$form.data('default', {
				status : '00A',createDate:new Date().toString("yyyy-MM-dd hh:mm:ss"),vnoId:vnoId,vnoName:vnoName
			});
			var validator = $form.validate({
				// 校验后会变形，调整在下方
				errorPlacement : function(error, element) {
					if (element.parent().hasClass("input-group")) {
						error.appendTo(element.parent().parent());
					} else { 
						error.appendTo(element.parent());
					}
				}
			});
			$form.on('click', ".btn-class-ok",
					function(e) {
						if (!$form.valid()) {
							return;
						}
						var policy = $form.serializeObject();
						var method = $form.status() == "new" ? 'addAdGetPolicy'
								: 'modifyAdGetPolicy';
						var msg = $form.status() == "new" ? '添加成功！' : '更新成功！';
						adPolicySvc.call(method, [ policy ], function() {
							jqGrid.jqGrid("setGridParam", {
								search : true
							}).trigger("reloadGrid", [ {
								page : 1
							} ]);
							jqGridContent.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
							BootstrapDialog.success(msg);
							$form.status('show');
							$formContent.status('show');
						});
					});
			var jqGrid = $table
					.jqGrid({
						url : '/data/com.wboss.wcb.admin.ad.AdGetPolicySvc?m=queryAdGetPolicyListJq.object.object',
						colModel : [
								{name : 'getPolicyId',hidden : true},
								{label : '广告策略名称',name : 'policyName'},
								{label : '策略描述',name : 'policyDesc'},
								{label : '',name : 'vnoId',hidden : true},
								{label : '企业名称',name : 'vnoName',sortable : false,width : 200},
								{ label:'状态', name: '_status',sortable:false}
								],
						onSelectRow : function(rowId) {
							var data = jqGrid.adGetPolicy.rows[rowId - 1];
							// 清空校验
							validator.resetForm();
							$form.deSerializeObject(data).status('show');
							//获取选中行时，编辑可用
							$form.find(".btn-class-edit").prop('disabled', false);
							$formContent.find(".btn-class-new").prop('disabled', false);
					    	//获取policyId
					    	$PolicyId = data.getPolicyId;
					    	//把参数传到另一个jqGrid 另一个jqGrid调用参数并刷新
					    	var postData = jqGridContent.jqGrid("getGridParam", "postData");
							postData.param = JSON.stringify({getPolicyId: data.getPolicyId});
							jqGridContent.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
						},
						onPaging : function() {
							$form.status('show');
						},
						onSortCol : function() {
							$form.status('show');
						},
						loadComplete : function(data) {
							jqGrid.adGetPolicy = data;
							$form.status('show');
							//页面加载时，编辑不可用
							$form.find(".btn-class-edit").prop('disabled', true);
							$formContent.find(".btn-class-new").prop('disabled', true);
						},
						pager : "#adp_ad_policy_jqGridPager"
					});
			//------------------------------右边关联表
			
			var $tableContent = $("#adp_ad_policy_content_dataTable");
			var $referObjCode = '';
			// 给表单一个默认值，在点击创建按钮时，这个默认值会被反序列化到表单中
			$formContent.data('default', {
				status:'00A',operator:'IN',referObjType:'10A',industry_type:"INS01",vnoId:vnoId,vnoName:vnoName
			});
			
			var validator = $formContent.validate();
			//下拉框的选择事件
			$formContent.on('change','select[name="referObjType"]',
					function(e){
				var policyContent = $formContent.serializeObject();
				var $type = policyContent.referObjType;
				//备份数据
				var bakData = $formContent.data('backup');
				var type = bakData.referObjType;
				var $container = $formContent.find('.refer_obj_code');
				$container.find(".pop-win-contoller").val('');
				if($type=="20A")
					{
			    		$container.find(".industry_type").css("display","block");
			    		$container.find(".pop-win").css("display","none");
					}else{
						$container.find(".industry_type").css("display","none");
			    		$container.find(".pop-win").css("display","block");
			    		$container.find(".pop-win-contoller").val('');
					}
		    	switch($type){
		    	case "10A":
		    		$container.find(".pop-win-contoller").attr("name","ssid");
		    		$container.find(".pop-win-contoller").attr("data-pop-win","ssid");
		    		$container.find(".pop-win-contoller").data('pop-win', "ssid");
		    		$container.find(".hide").attr("name","ssidId");
		    		$container.find(".pop-win-contoller").val(bakData.ssid);
		    		break;		
		    	case "10B":
		    		$container.find(".pop-win-contoller").attr("name","apName");
		    		$container.find(".pop-win-contoller").attr("data-pop-win","ap");
		    		$container.find(".hide").attr("name","apId");
		    		$container.find(".pop-win-contoller").data('pop-win', "ap");
		    		$container.find(".pop-win-contoller").val(bakData.apName);
		    		break;
		    	case "20A":
		    		$container.find(".industry_type").css("display","block");
		    		$container.find(".pop-win").css("display","none");
		    		break;
		    	case "60B":
		    		$container.find(".pop-win-contoller").attr("name","timeSpanName");
		    		$container.find(".pop-win-contoller").attr("data-pop-win","timespan");
		    		$container.find(".hide").attr("name","timeSpanId");
		    		$container.find(".pop-win-contoller").data('pop-win', "timespan");	
		    		$container.find(".pop-win-contoller").val(bakData.timeSpanName);
		    		break;
		    	}
				
			});
			$formContent.on('click', ".btn-class-cancel",function(e) {
				//备份数据
				var bakData = $formContent.data('backup');
				var type = bakData.referObjType;
				var $container = $formContent.find('.refer_obj_code');
				if(type=="20A")
					{
					$container.find(".industry_type").css("display","block");
		    		$container.find(".pop-win").css("display","none");
					}
				else{
				$container.find(".pop-win-contoller").attr("name", getTypeObj(type).name);
	    		$container.find(".pop-win-contoller").attr("data-pop-win", getTypeObj(type).popWin);
	    		$container.find(".hide").attr("name", getTypeObj(type).id);
	    		$container.find(".pop-win-contoller").data('pop-win', getTypeObj(type).popWin);
	    		$container.find(".industry_type").css("display","none");
	    		$container.find(".pop-win").css("display","block");
				}
			});
			$formContent.on('click', ".btn-class-new",function(e) {
				
				var $container = $formContent.find('.refer_obj_code');
				$container.find(".industry_type").css("display","none");
	    		$container.find(".pop-win").css("display","block");
				//$container.find(".pop-win").attr("display","show");
	    		$container.find(".pop-win-contoller").attr("name","ssid");
	    		$container.find(".pop-win-contoller").attr("data-pop-win","ssid");
	    		$container.find(".pop-win-contoller").data('pop-win', "ssid");
	    		$container.find(".hide").attr("name","ssidId");
	    		$container.find(".pop-win-contoller").val('');
			});
			$formContent.on('click', ".btn-class-edit",function(e) {
				
			});
			
			function getTypeObj(type){
				switch(type){
			    	case "10A":
			    		return {id: 'ssidId',name: 'ssid', type: '10A', popWin: 'ssid'};
			    	case "10B":
			    		return {id: 'apId', name: 'apName', type: '10B', popWin: 'ap'};
			    	case "60B":
			    		return {id: 'timeSpanId', name: 'timeSpanName', type: '60B', popWin: 'timespan'};
		    		default :
		    			return {};
				}
			}
			$formContent.on('click', ".btn-class-ok",
					function(e) {
						if (!$formContent.valid()) {
							return;
						}
						var policyContent = $formContent.serializeObject();
						//获取policyId
						policyContent.getPolicyId = $PolicyId;
					//	policyContent.referObjCode = $referObjCode ;
						var method_content = $formContent.status() == "new" ? 'insertAdGetPolicyContent'
								: 'modifyAdGetPolicyContent';
						var msg_content = $formContent.status() == "new" ? '添加成功！' : '更新成功！';
						//判断获取到的值
						if(policyContent.referObjType=='10A')
						{
						policyContent.referObjCode = $formContent.find("input[name='ssidId']").val();
						}
						else if(policyContent.referObjType=='10B')
						{
						policyContent.referObjCode = $formContent.find("input[name='apId']").val();
						}
						else if(policyContent.referObjType=='20A')
						{
						policyContent.referObjCode = $formContent.find(".industry").val();
						}
						else{
						policyContent.referObjCode = $formContent.find("input[name='timeSpanId']").val();	
						}
						adPolicyContentSvc.call(method_content, [ policyContent ], function() {
							jqGridContent.jqGrid("setGridParam", {
								search : true
							}).trigger("reloadGrid", [ {
								page : 1
							} ]);
							BootstrapDialog.success(msg_content);
							$formContent.status('show');
						});
					});
			jqGridContent = $tableContent
			.jqGrid({
				url : '/data/com.wboss.wcb.admin.ad.AdGetPolictyContentSvc?m=queryAdPolicyContentListJq.object.object',
				colModel : [
						{name : 'policyContentId',hidden : true},
						{name : 'getPolicyId',hidden:true},
						{label : '参考对象类型',name : '_referObjType'},
						{label : '参考对象编码',name : 'referObjCode',hidden:true},
						{label : '运算符',name : '_operator',sortable : false},
						{ label:'状态', name: '_status',sortable:false},
						{label : '',name : 'vnoId',hidden : true},
						{label : '企业名称',name : 'vnoName',sortable : false,width : 200}
						],
				onSelectRow : function(rowId) {
				    data = jqGridContent.adPolicyContent.rows[rowId - 1];
					// 清空校验
					validator.resetForm();
					$formContent.deSerializeObject(data).status('show');
				  	//获取policyId
			    	$PolicyId = data.getPolicyId;
			    	//获取选中行的referObjCode
			    	$referObjCode = data.referObjCode;
					//获取选中行时，编辑可用
			    	$formContent.find(".btn-class-edit").prop('disabled', false);
			    	//获取选中行时,参考对象编码变换
			    	var $type = data.referObjType;
					$formContent.find("[data-value-name='referObjCode']").hide().attr('name',"");
				  	var $targetElement = $formContent.find("[data-value-type='"+$type+"']").show();
				  	var valueName = $targetElement.data('value-name');
				    $targetElement.attr('name',valueName).val($type);
			    	var $container = $formContent.find('.refer_obj_code');
			    	if($type=="20A")
					{
			    		$container.find(".industry_type").css("display","block");
			    		$container.find(".pop-win").css("display","none");
					}else{
						$container.find(".industry_type").css("display","none");
			    		$container.find(".pop-win").css("display","block");
					}
		    	switch($type){
		    	case "10A":
		    		$container.find(".pop-win").attr("display","show");
		    		$container.find(".pop-win-contoller").attr("name","ssid");
		    		$container.find(".pop-win-contoller").attr("data-pop-win","ssid");
		    		$container.find(".pop-win-contoller").data('pop-win', "ssid");
		    		$container.find(".hide").attr("name","ssidId");
					var ssids = [];
					var ssidIds =[];
					ssidSvc.call('querySsidByIds', [$referObjCode], function(res) {
						for ( var i in res) {
							ssids.push(res[i].ssid);
							ssidIds.push(res[i].ssidId);
						}
						//反序列化把值带到页面上
						data.ssid=ssids.join(",");
						data.ssidId=ssidIds;
						$formContent.deSerializeObject(data).status('show');
					});
		    		break;		
		    	case "10B":
		    		$container.find(".pop-win-contoller").attr("name","apName");
		    		$container.find(".pop-win-contoller").attr("data-pop-win","ap");
		    		$container.find(".hide").attr("name","apId");
		    		$container.find(".pop-win-contoller").data('pop-win', "ap");
		    		var apNames = [];
					var apIds =[];
					apSvc.call('queryApByIds', [$referObjCode], function(res) {
						for ( var i in res) {
							apNames.push(res[i].apName);
							apIds.push(res[i].apId);
						}
						//反序列化把值带到页面上
						data.apName=apNames.join(",");
						data.apId=apIds;
						$formContent.deSerializeObject(data).status('show');
					});
		    		break;
		    	case "20A":
		    		$container.find(".industry_type").css("display","block");
		    		$container.find(".pop-win").css("display","none");
		    		$container.find(".industry").val($referObjCode);
		    		break;
		    	case "60B":
		    		$container.find(".pop-win-contoller").attr("name","timeSpanName");
		    		$container.find(".pop-win-contoller").attr("data-pop-win","timespan");
		    		$container.find(".hide").attr("name","timeSpanId");
		    		$container.find(".pop-win-contoller").data('pop-win', "timespan");
		    		var timeSpanNames = [];
					var timeSpanIds =[];
					timeSpanSvc.call('queryTimeSpanByIds', [$referObjCode], function(res) {
						for ( var i in res) {
							timeSpanNames.push(res[i].timeSpanName);
							timeSpanIds.push(res[i].timeSpanId);
						}
						//反序列化把值带到页面上
						data.timeSpanName=timeSpanNames.join(",");
						data.timeSpanId=timeSpanIds;
						$formContent.deSerializeObject(data).status('show');
					});
		    		break;
		    	}
				},
				onPaging : function() {
					$formContent.status('show');
				},
				onSortCol : function() {
					$formContent.status('show');
				},
				loadComplete : function(data) {
					//一开始data为null，当点击之后data不为null，可是点击刷新之后data被改为null，但页面数据还显示，所以rowId没被获取到
					if(data!=null)
					jqGridContent.adPolicyContent = data;
					$formContent.status('show');
					//页面加载时，编辑不可用
					$formContent.find(".btn-class-edit").prop('disabled', true);
				},
				pager : "#adp_ad_policy_content_jqGridPager"
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