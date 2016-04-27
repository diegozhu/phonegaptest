define(function (){
	var adMgrSvc = new Service('com.wboss.wcb.admin.ad.AdMgrSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	
	function onActive($page,$relativeUrl){
		
	}
	function onCreate($page,$relativeUrl){
		var $form = $page.find(".detail_form");	
		var $table = $page.find("#adp_ad_position_dataTable");
		//显示页面的转化
		var $radioValue='';
		var $selectValue='';
		var ADPOSITIONTYPE={};
		//初始值
		$form.data('default',{adPositionType:'DEF',switchFlag:'A',isAllowVno:'T',isAllowLink:'T'});
				
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
		
		//类型变换事件
		$(".adPositionType").change(
				function(){
					$selectValue = $(this).val();
					if($selectValue=='THP'){
						$form.find(".switchFlagB").prop("checked", true);
						$form.find("input[name='switchFlag']").prop("disabled",true);
						$page.find("input[name='switchTime']").prop("placeholder","");
						$form.find("input[name='switchTime']").removeClass("error");
						$form.find(".switchTime").hide();
					}else{
						$form.find(".switchFlagA").prop("checked","checked");
						$form.find("input[name='switchFlag']").prop("disabled",false);
						$form.find("input[name='switchFlag']").prop("disabled",false);
						$page.find("input[name='switchTime']").prop("placeholder","");
						$form.find("input[name='switchTime']").removeClass("error");
						$form.find(".switchTime").show();
					}
					
				}
		)
		
		//判断radio是否显示时长
		$("input[name='switchFlag']").change(
			function(){
				$radioValue = $(this).val();
				if($radioValue=='A'){
					$page.find("input[name='switchTime']").prop("placeholder","");
					$form.find("input[name='switchTime']").removeClass("error");
					$form.find(".switchTime").show();
				}
				if($radioValue=='B'){
					$page.find("input[name='switchTime']").prop("placeholder","");
					$form.find("input[name='switchTime']").removeClass("error");
					$form.find(".switchTime").hide();
				}
			}
		)
		
		//抽取radio disabled的方法
		function showRadio(){
			$form.find("input[name='switchFlag']").prop("disabled",false);
			$form.find("input[name='isAllowVno']").prop("disabled",false);
			$form.find("input[name='isAllowLink']").prop("disabled",false);
		}	
		
		//新增事件
		$page.on('click',".btn-class-new",function(e){
			showRadio();
			$form.find(".switchTime").show();
			$form.find(".switchFlagA").prop("checked", true);
			$form.find(".isAllowVnoT").prop("checked", true);
			$form.find(".isAllowLinkT").prop("checked", true);
			
		});
		//取消事件
		$page.on('click',".btn-class-cancel",function(e){
			var data = $($(e.target).parents("form")[0]).data('backup');
			if(data.adPositionType == "THP"||data.switchFlag =="B"){
				$form.find(".switchTime").hide();
			}else{
				$form.find(".switchTime").show();
			}
			
			$form.find("input[name='switchFlag']").prop("disabled",true);
			$form.find("input[name='isAllowVno']").prop("disabled",true);
			$form.find("input[name='isAllowLink']").prop("disabled",true);
		});
		//编辑事件
		$page.on('click',".btn-class-edit",function(e){
			showRadio();
			$radioValue = $form.find("input[name='switchFlag']:checked").val();
			$selectValue = $form.find(".adPositionType option:selected").val();
			if($selectValue == "THP"){
				$form.find(".switchFlagB").prop("checked", true);
				$form.find("input[name='switchFlag']").prop("disabled",true);
				$form.find(".switchTime").hide();
			}else{
				if($radioValue == 'B'){
					$form.find(".switchTime").hide();
				}else{
					$form.find(".switchTime").show();
				}
				
			}
		});
		
		//修改删除
			$form.on('click',".btn-class-ok",function(e){
				if (!$form.valid()) {
			            return;
			    }
				var adPosition = $form.serializeObject();
				adPosition.switchFlag=$form.find("input[name='switchFlag']:checked").val();
				adPosition.isAllowVno=$form.find("input[name='isAllowVno']:checked").val();
				adPosition.isAllowLink=$form.find("input[name='isAllowLink']:checked").val();
				if(adPosition.adPositionType=="THP"){
					adPosition.switchFlag='B';
				}
				if(adPosition.switchFlag=="B"){
					adPosition.switchTime='';
				}
				var method = $form.status() == "new" ? 'addAdPosition' : 'updateAdPosition';
				var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';

				adMgrSvc.call(method,[adPosition],function(){
					jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					BootstrapDialog.success(msg);
					$form.status('show');
				});
			});
		
		var jqGrid = $table.jqGrid({
			url : wboss.getWay + '/data/com.wboss.wcb.admin.ad.AdMgrSvc?m=queryAdPostiionList4Jq.object.object',
			colModel : [{name : 'adPositionId',hidden:true},
			            {label : '广告位名称',name : 'adPositionName'},
			            {label : '广告位类型',name : '_adPositionType'},
			            {label : '广告位置',name : 'showTagId'},
			            {label : '广告切换',name : '_switchFlag' },
			            {label : '切换时长',name : 'switchTime'},
			            {label : '广告大小',name : 'adSize'},
			            {label : '广告描述',name : 'adDesc'},
			            {label : '是否允许VNO配置',name : '_isAllowVno' },
			            {label : '是否允许配置URL',name : '_isAllowLink'},
						{label : '实例限制',name : 'insLimit'}],
			onSelectRow : function(rowId) {
				//清除之前的校验信息
				validator.resetForm();
				var data = jqGrid.griddata.rows[rowId-1];
				$page.find(".btn-class-edit").prop('disabled', false);
				$form.deSerializeObject(data).status('show');
				
				//根据所选的内容判断radio选中
				$form.find("input[name='switchFlag'][value='"+(data.switchFlag || 'A')+"']").prop("checked", true);
				if(data.switchFlag=='A'){
					$form.find(".switchTime").show();
				}
				if(data.switchFlag=='B'){
					$form.find(".switchTime").hide();
				}
				$form.find("input[name='isAllowVno'][value='"+(data.isAllowVno || 'T')+"']").prop("checked", true);
				$form.find("input[name='isAllowLink'][value='"+(data.isAllowLink || 'T')+"']").prop("checked", true);
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
		    pager: "#adp_ad_position_jqGridPager"
		});
}	
return { onCreate : onCreate, onActive : onActive };	
});