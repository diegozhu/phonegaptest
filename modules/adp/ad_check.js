define (function(){
	var adInSvc= new Service("com.wboss.wcb.admin.ad.AdMgrSvc");
	var sysparamSvc = new Service("com.wboss.general.param.SysParamSvc"); 
	
	function onActive($page, $relativeUrl){
		
	}
	
	function onCreate($page, $relativeUrl){
		
		
		var vnoId =model.user().vnoId();
		var vnoName =model.user().vnoName();
		$page.find("input[name='vnoId']").val(vnoId);
		$page.find("input[name='vnoName']").val(vnoName);
				
		var $form = $page.find(".detail_form");
		//修改新增的方法
		 
	       
		$form.on('click',".btn-class-sh",function(e){
			if(!$form.valid()){
				return;
			}
			var param = $form.serializeObject();
			var method = 'auditAd';
			var msg='';
			var flag=false;
			
			var audit= function(result){
	            if(result){
	            	flag = true;
	            	msg='审核通过';
	            }else{
	            	flag = false;
	            	msg='审核未通过'
	            }
			    var ads = jqGrid.jqGrid('getGridParam','selarrrow');
				adInSvc.call(method,[flag,param.operDesc,ads],function(){
					jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					BootstrapDialog.success(msg);
					$form.status('show');
				 });
			};
			
			if(method=='auditAd'){
				//缔
				BootstrapDialog.confirm({btnOKLabel:'YES', btnCancelLabel:'NO',message:'审核是否通过?', callback: audit});
			}
		});
		
		var $table = $("#adp_ad_check_dataTable");
		var validator=$form.validate();
		var jqGrid = $table.jqGrid({
		    url: wboss.getWay + '/data/com.wboss.wcb.admin.ad.AdMgrSvc?m=jqueryAdInstanceVoList.object.object',
		    multiselect: true,
		    datatype:'local',
		    colModel:[
		     //不加上key，那么每行取得id相当于0，1，2,加上去，就把主键当作rowid
			{name:'adInstanceId',hidden:true,key: true},
			{label:'广告名称',name:'adName'},
			{label:'广告位名称',name:'adPositionName'},
			{label:'广告服务类型',name:'_adSvcType'},
			{label:'广告链接',name:'adLink'},
			{label:'广告文字',name:'adContent',hidden:true},
			{label:'广告描述',name:'adDesc'},
			{label:'创建时间',name:'createDate'},
			{label:'生效时间',name:'effDate'},
			{label:'广告信息',name:'adInfo'},
			{label:'展示场景',name:'_showScene'},
			{label:'图片展示类型',name:'_imgShowType'},
			{label:'广告类型',name:'_adType'},
			{label:'企业名称',name:'vnoName',sortable:false},
			{label:'状态',name:'_status'}
			],
		    onSelectRow:function(rowId){
		    	//如果页面上什么都没选中，下面所有都被禁用掉
		    	var isSelected = jqGrid.jqGrid('getGridParam','selarrrow');
		    	if(isSelected==""){
		    		$form.find("textarea[name='operDesc']").prop("disabled", true);
		    		$form.find(".btn-class-sh").prop('disabled',true);
		    	}else{
		    		$form.find("textarea[name='operDesc']").prop("disabled", false);
		    		$form.find(".btn-class-sh").prop('disabled',false);
		    	}
		    	
		    	//$form.find("input[name='flag']").prop('disabled',false);
		    	validator.resetForm();
//		    	var data = jqGrid.griddata.rows[rowId-1];
//		    	$form.deSerializeObject(data).status('show');
		    },
		    onPaging:function(){
		    	$form.status('show');
		    },
		   	onSortCol:function(){
		    	$form.status('show');
		    },beforeSelectRow: function (rowid, e) { 
		    	//根据rowid获取对象
		    	var data=jqGrid.jqGrid('getRowData',rowid);
		    	//虽然值获取到了，因为加了key，而且status经过了formatter,如果想要获取原来的值，只有在loadComplete里面把原生值反序列化到页面上
		    	if(data.status!='审核中'){
		    	var isShow = $form.status() === 'show',
		    	box = $($(e.target).closest('td')[0]).find('input[type="checkbox"]');
		    	var isSelected = jqGrid.jqGrid('getGridParam','selarrrow').indexOf(rowid) != -1;
		    	box.prop('checked', isSelected || !isShow);
		        return !isShow; 
		    	}
		    	return isShow;
		    },
		   	loadComplete:function(data){
		   		$form.find(".btn-class-sh").prop('disabled',true);
		   		$page.find("#cb_adp_ad_check_dataTable").prop('disabled',true);
		   		if(jqGrid)
		   		jqGrid.griddata = data;
		    	$form.status('show');
		    },
		    pager: "#adp_ad_check_jqGridPager"
		});
		//
		$('.checkboxes input[type=checkbox]').on('click',function(e){
			//e.target相当于this
		    $t = $(e.target);
		    var $status=$page.find(".statu");
		    $status.val($t.prop('checked')? $status.val()+'_'+$t.val() :  $status.val().replace($t.val(),''));
		})
		//设初始值
		var postData = jqGrid.jqGrid("getGridParam", "postData");
		var queryParam = $page.find('.search-form').serializeObject();
	  	postData.param = JSON.stringify(queryParam);
		jqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]); 
	}
	return { onCreate : onCreate, onActive : onActive };
});