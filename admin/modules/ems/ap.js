define(function() {

	var apSvc = new Service('com.wboss.wcb.auth.authmgr.ApSvc');
	var sysparam = new Service('com.wboss.general.param.SysParamSvc');
	var ssidSvc=new Service('com.wboss.wcb.auth.authmgr.SsidApSvc');
	function onActive($page, $relativeUrl) {
	}

	function onCreate($page, $relativeUrl) {

		var $form = $page.find(".detail_form");
		var $table = $("#ems_ap_dataTable");
		// 校验MAC
		$page.find(".ems_ap_apMac").triggerInputMac({
			upperCase : true,
			splitor : ":"
		});
		// 验证
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
		// 设置默认值
		var vnoId = model.user().vnoId();
		var vnoName = model.user().vnoName();
		$page.find("input[name='vnoId']").val(vnoId);
		$page.find("input[name='vnoName']").val(vnoName);
		$form.data('default', {
			status : '00A',
			apType:'A01',
			vnoId : vnoId,
			vnoName : vnoName
		});

		$form.on('click', ".btn-class-ok", function(e) {
			if (!$form.valid()) {
				return;
			}
			var ap = $form.serializeObject();
			//重新赋值
			ap.ssidIdList=ap.ssidId;
			ap.ssidList=ap.ssid;
			
			var method = $form.status() == "new" ? 'insertAp' : 'modifyAp';
			var msg = $form.status() == "new" ? '添加成功！' : '更新成功！';
			
			apSvc.call(method, [ ap ], function() {
				jqGrid.jqGrid("setGridParam", {
					search : true
				}).trigger("reloadGrid", [ {
					page : 1
				} ]);
			
				BootstrapDialog.success(msg);
				$form.status('show');
			});
		});
		
		//批量导入AP信息
		$page.on('click', ".btn_import", function(e) {
			var filePath = $page.find('input[name="filename"]').val();
			if(!filePath){
				BootstrapDialog.warning("请选择上传文件");
				return;
			}
			
			apSvc.call('importApInfo', [filePath], function(res){
				console.log(res);
				if(res.indexOf('失败')!=-1){
					BootstrapDialog.warning(res);
				}else{
					BootstrapDialog.success(res);
				}
				jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
				$form.status('show');
			});
		});
		
		var jqGrid = $table.jqGrid({
					url : '/data/com.wboss.wcb.auth.authmgr.ApSvc?m=queryApVoList.object.object',
					colModel : [ {
						name : 'apId',
						hidden : true
					},
					  {label : '',name : 'accObjId',hidden:true}
					, {
						label : 'Ap名称',
						name : 'apName',
					}, {
						label : 'AP_MAC',
						name : 'apMac',
					}, {
						label : 'AP类型',
						name : '_apType',
					}, {
						label : '开户模板名称',
						name : 'custTemplateName',
					},{
						label : '访问策略名称',
						name : 'policyName',
					},{
						label : '地址描述',
						name : 'addr',
						hidden:true
					}, {
						label : '路由描述',
						name : 'apDesc',
					}, {
						label : '企业名称',
						name : 'vnoName',
						sortable:false      //表示这一列不能排序
					}, {
						label : '状态',
						name : '_status',
						sortable:false      //表示这一列不能排序
					} ],
					onSelectRow : function(rowId) {
						validator.resetForm();
						$form.find('.btn-class-edit').prop('disabled',false);
						var data = jqGrid.griddata.rows[rowId - 1];
						var ssids = [];
						var ssidIds =[];
						//调用ssidAp查询语句
						ssidSvc.call('querySsidApList', [ {apId:data.apId} ], function(res) {
							for ( var i in res) {
								ssids.push(res[i].ssid);
								ssidIds.push(res[i].ssidId);
							}
							//反序列化把值带到页面上
							data.ssid=ssids.join(",");
							data.ssidId=ssidIds;
							$form.deSerializeObject(data).status('show');
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
						$form.status('show');
						$form.find(".btn-class-edit").prop("disabled",true);
					},
					pager : "#ems_ap_jqGridPager"
				});
	}

	return {
		onCreate : onCreate,
		onActive : onActive
	};
});
