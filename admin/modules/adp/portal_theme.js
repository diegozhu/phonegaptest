var portalThemeMemberSvc = new Service("com.wboss.wcb.admin.theme.PortalThemeMemberSvc");
function deletePortalThemeMember(themeMemberId,tmpType){
	BootstrapDialog.confirm({title:'删除提示', btnOKLabel:'确定', btnCancelLabel:'取消', message:'确定删除吗?', callback: function(flag){
		if(flag){
			var PortalThemeMemberPo = {themeMemberId: themeMemberId};
			portalThemeMemberSvc.call('delThemeMember', [PortalThemeMemberPo], function(res){
				if(tmpType=='P'){
					$("#adp_pc_show_template_dataTable").jqGrid().jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
				}
				if(tmpType=='I'){
					$("#adp_mobile_show_template_dataTable").jqGrid().jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
				}
			},function(e){
			console.log(e);
			});
		}
	}});
}

function upShowTemplate(rowId,tmpType){
	var typeName = '';
	if(tmpType=='P'){
		typeName = '#adp_pc_show_template_dataTable';
	}else{
		typeName = '#adp_mobile_show_template_dataTable';
	}
	
	var selectedObj = $(typeName).jqGrid('getRowData',rowId);
	var overObj = $(typeName).jqGrid('getRowData',rowId-1);
	
	var selectedPortalThemeMemberPo = {themeMemberId:selectedObj.themeMemberId, portalSeq:overObj.portalSeq};
	var overPortalThemeMemberPo = {themeMemberId:overObj.themeMemberId, portalSeq:selectedObj.portalSeq};
	
	portalThemeMemberSvc.call('modifyPortalThemeMemberSeq',[[selectedPortalThemeMemberPo, overPortalThemeMemberPo],tmpType],function(res){
		if(tmpType=='P'){
			$("#adp_pc_show_template_dataTable").jqGrid().jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
		}
		if(tmpType=='I'){
			$("#adp_mobile_show_template_dataTable").jqGrid().jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
		}
	});
}

function downShowTemplate(rowId,tmpType){
	var typeName = '';
	if(tmpType=='P'){
		typeName = '#adp_pc_show_template_dataTable';
	}else{
		typeName = '#adp_mobile_show_template_dataTable';
	}
	var selectedObj = $(typeName).jqGrid('getRowData',rowId);
	var underObj = $(typeName).jqGrid('getRowData',parseInt(rowId)+1);
	
	var selectedPortalThemeMemberPo = {themeMemberId:selectedObj.themeMemberId, portalSeq:underObj.portalSeq};
	var underPortalThemeMemberPo = {themeMemberId:underObj.themeMemberId, portalSeq:selectedObj.portalSeq};
	
	portalThemeMemberSvc.call('modifyPortalThemeMemberSeq',[[selectedPortalThemeMemberPo, underPortalThemeMemberPo],tmpType],function(res){
		if(tmpType=='P'){
			$("#adp_pc_show_template_dataTable").jqGrid().jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
		}
		if(tmpType=='I'){
			$("#adp_mobile_show_template_dataTable").jqGrid().jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
		}
	});
}

define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	var portalThemeSvc = new Service("com.wboss.wcb.admin.theme.PortalThemeSvc");
	function onActive($page,$relativeUrl){
		
	}
	function onCreate($page,$relativeUrl){
		var $form = $page.find(".detail_form");
		var $table = $("#adp_portal_theme_dataTable");
		$portalThemeId = '';
		var SHOW_MODE={};
		var TMP_TYPE={};0
		var AUTOWIDTH = parseInt($('#adp_pc_show_template_dataTable').width() / 4 * 0.12);
		$form.data('default',{status:'00A'});
		//字典
//		sysparam.call('getDicData',['DIC_TMP_TYPE'],function(res){
//			var dom = "";
//			for(var i in res){
//				TMP_TYPE[res[i].dicValue]=res[i].dicValueName;
//			}
//		});
		
		
		//悬停事件
		$page.find("adp_pc_show_template_dataTable .updown").hover(function () {
				alert(1);
			 	$(this).addClass("updown");
			 }, function () {
				$(this).remoteClass("updown"); 
		});
					
		
		
		//校验
		var validator=$form.validate({
			errorPlacement : function(error, element) {
				if (element.parent().hasClass("input-group")) {
					error.appendTo(element.parent().parent());
				}else{
					error.appendTo(element.parent());
				}
			}
		});
		
		$form.on('click',".btn-class-ok",function(e){
			if(!$form.valid()){
				return;
			}
			var portalThemePo = $form.serializeObject();
			var method = $form.status() == "new" ? 'insertPortalTheme' : 'modifyPortalTheme	';
			var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';

			portalThemeSvc.call(method,[portalThemePo],function(){
				jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					BootstrapDialog.success(msg);
					$form.status('show');
				});
		});
		
		var jqGrid = $table.jqGrid({
		    url: '/data/com.wboss.wcb.admin.theme.PortalThemeSvc?m=queryPortalThemeList4Jq.object.object',
		    colModel: [
		        { name: 'portalThemeId', hidden:true},
		        { label: 'PORTAL主题名称', name: 'portalThemeName'},
		        { label: 'PORTAL主题描述', name: 'portalThemeDesc'},
		        { label: '状态', name: '_status'}
		    ],
		    onSelectRow:function(rowId){
		    	//清除之前的校验信息
				validator.resetForm();
		    	var data = jqGrid.griddata.rows[rowId-1];
		    	$page.find(".btn-class-edit").prop('disabled', false);
		    	//设置表单状态，目前有new，edit，show三种状态，
		    	$form.deSerializeObject(data).status('show');
		    	$portalThemeId=data.portalThemeId;
		    	$page.find('input[name="PortalThemeId"]').val($portalThemeId);
		    	var pcType = $page.find('input[value="P"]').val();
		    	var mobileType = $page.find('input[value="I"]').val();
		    	//把参数传到另一个jqGrid 另一个jqGrid调用参数并刷新
		    	var postDataPc = pcGrid.jqGrid("getGridParam", "postData");
				postDataPc.param = JSON.stringify({portalThemeId: data.portalThemeId,tmpType: pcType});
				pcGrid.jqGrid("setGridParam", {datatype: 'json',search:true}).trigger("reloadGrid", [{ page: 1}]);
				
				var postDataMobile = mobileGrid.jqGrid("getGridParam", "postData");
				postDataMobile.param = JSON.stringify({portalThemeId: data.portalThemeId,tmpType: mobileType});
				mobileGrid.jqGrid("setGridParam", {datatype: 'json',search:true}).trigger("reloadGrid", [{ page: 1}]);
		    },
		    onPaging:function(){
		    	$form.status('show');
		    },
		   	onSortCol:function(){
		    	$form.status('show');
		    },
		   	loadComplete:function(data){
		   		$page.find('.search-form').find('input[name="portalThemeId"]').val('');
		   		$page.find(".btn-class-edit").prop('disabled', true);
		   		jqGrid.griddata = data;
		    	$form.status('show');
		    },
		    pager: "#adp_portal_theme_jqGridPager"
		});
		
		var pcGrid = $('#adp_pc_show_template_dataTable').jqGrid({
			url: '/data/com.wboss.wcb.admin.ad.AdShowTemplateSvc?m=qryAdShowTemplateByThemeId.object.object',
			datatype: 'local',
		    colModel: [
		        { label: '',name: 'themeMemberId', hidden: true},
		    	{ label: '', name: 'showTemplateId', hidden: true},
		    	{ label: '', name: 'tmpType', hidden: true},
		    	{ label: '成员别名', name: 'memberAlias'},
		    	{ label: '页面名称', name: 'templateName'},
		        { label: '展现模式', name: '_showMode'},
		        { label: '优先级', name: 'portalSeq'},
		        { label: '操作',
		        	formatter: function (cellValue, options, row){
            			var del = '<div class="col-lg-3 col-sm-3 col-md-3"><a class="glyphicon glyphicon-remove-circle " href="javascript:void(0);" title="删除" onclick="deletePortalThemeMember(\''+row.themeMemberId+'\',\''+row.tmpType+'\')"></a></div>';
            			var edit = '<div class="col-lg-3 col-sm-3 col-md-3"><span class="pop-win"><span class=\'input-group\'><a class=" glyphicon glyphicon-edit pop-win-contoller pointer" data-pop-win="ad_position_instance" title="编辑"><input class="hide" name="showTemplateId" value="'+row.showTemplateId+'" /></a></span></span></div>';
            			
            			var up = '<div class="col-lg-3 col-sm-3 col-md-3"><a class="up_pc_'+ options.rowId +' glyphicon glyphicon-arrow-up " href="javascript:void(0);" title="上移" onclick="upShowTemplate(\''+options.rowId+'\',\''+row.tmpType+'\')"></a></div>';
            			var down = '<div class="col-lg-3 col-sm-3 col-md-3"><a class="down_pc_'+ options.rowId +' glyphicon glyphicon-arrow-down " href="javascript:void(0);" title="下移" onclick="downShowTemplate(\''+options.rowId+'\',\''+row.tmpType+'\')"></a></div>';
            			return del+edit+up+down;
            		},
            		sortable:false
		        }
		        
		    ],loadComplete:function(data){
	        	$page.find('input[name="pcShowTemplateIds"]').val('');
	        	if(!data){
	        		return;
	        	}
	        	var showTemplateIds = ',';
	        	for(var i=0; i< data.length; i++){
	        		showTemplateIds +=data[i].showTemplateId+',';
	        	}
	        	$page.find('input[name="pcShowTemplateIds"]').val(showTemplateIds);
	        	
	        	$('#adp_pc_show_template_dataTable').find('.up_pc_1').parent().remove();
	        	$('#adp_pc_show_template_dataTable').find('.down_pc_'+data.length).parent().remove();
	        }
		});
		
		var mobileGrid = $('#adp_mobile_show_template_dataTable').jqGrid({
			url: '/data/com.wboss.wcb.admin.ad.AdShowTemplateSvc?m=qryAdShowTemplateByThemeId.object.object',
			datatype: 'local',
		    colModel: [
		        { label: '',name: 'themeMemberId', hidden: true},
		    	{ label: '', name: 'showTemplateId', hidden: true},
		    	{ label: '', name: 'tmpType', hidden: true},
		    	{ label: '成员别名', name: 'memberAlias'},
		    	{ label: '页面名称', name: 'templateName'},
		        { label: '展现模式', name: '_showMode'},
		        { label: '优先级', name: 'portalSeq'},
		        { label: '操作',
		        	formatter: function (cellValue, options, row){
            			var del = '<div class="col-lg-3 col-sm-3 col-md-3"><a class="glyphicon glyphicon-remove-circle " href="javascript:void(0);" title="删除" onclick="deletePortalThemeMember(\''+row.themeMemberId+'\',\''+row.tmpType+'\')"></a></div>';
            			var edit = '<div class="col-lg-3 col-sm-3 col-md-3"><span class="pop-win"><span class=\'input-group\'><a class=" glyphicon glyphicon-edit pop-win-contoller pointer" data-pop-win="ad_position_instance" title="编辑"><input class="hide" name="showTemplateId" value="'+row.showTemplateId+'" /></a></span></span></div>';
            			
            			var up = '<div class="col-lg-3 col-sm-3 col-md-3"><a class="up_mobile_'+options.rowId+' glyphicon glyphicon-arrow-up " href="javascript:void(0);" title="上移" onclick="upShowTemplate(\''+options.rowId+'\',\''+row.tmpType+'\')"></a></div>';
            			var down = '<div class="col-lg-3 col-sm-3 col-md-3"><a class="down_mobile_'+options.rowId+' glyphicon glyphicon-arrow-down " href="javascript:void(0);" title="下移" onclick="downShowTemplate(\''+options.rowId+'\',\''+row.tmpType+'\')"></a></div>';
            			return del+edit+up+down;
            		},
            		sortable:false
		        }
		        
		    ],loadComplete:function(data){
	        	$page.find('input[name="mobileShowTemplateIds"]').val('');
	        	if(!data){
	        		return;
	        	}
	        	var showTemplateIds = ',';
	        	for(var i=0; i< data.length; i++){
	        		showTemplateIds +=data[i].showTemplateId+',';
	        	}
	        	$page.find('input[name="mobileShowTemplateIds"]').val(showTemplateIds);
	        	
	        	$('#adp_mobile_show_template_dataTable').find('.up_mobile_1').parent().remove();
	        	$('#adp_mobile_show_template_dataTable').find('.down_mobile_'+data.length).parent().remove();
	        }
		});
		
		window.editShowTemplate = function(showTemplateId){
			require(["/admin/popwin/js/ad_position_instance.js"],function(popwin) {
				window.popwin = popwin;
		 		popwin.createPopWin(null,{showTemplateId: showTemplateId});
			});
		};
	}
	return { onCreate : onCreate, onActive : onActive };
});


