define(function () {
//方法
var FastCustTemplateSvc = new Service('com.wboss.wcb.custmgr.FastCustTemplateSvc');

wboss.addDic('DIC_OFFSET_TIME_TYPE','DIC_OFFSET_TIME_TYPE_T',{v:'',n:'立即生效'});
wboss.addDic('DIC_OFFSET_TIME_TYPE','DIC_OFFSET_TIME_TYPE_P',{v:'',n:'永不失效'});
function onActive($page,$relativeUrl){
	
}

function onCreate($page,$relativeUrl){	
	var $form = $page.find(".detail_form");
	var $table = $("#cust_cust_dataTable");
	//时间偏移类型的change事件
	var btnOffsetTimeType = $page.find('select[name="offsetTimeType"]');
	var btnPassExpOffsetType = $page.find('select[name="passExpOffsetType"]');
	
	btnOffsetTimeType.change(function(){
		var timeTypeValue=$page.find('.DicoffsetTimeType>option:selected').val();
		if (timeTypeValue=='') {
			$page.find('input[name="effOffsetValue"]').prop('disabled',true);
			$page.find('input[name="expOffsetValue"]').prop('disabled',true);
			$page.find('input[name="expOffsetValue"]').removeClass("error");
			$page.find('input[name="effOffsetValue"]').removeClass("error");
			$page.find('input[name="effOffsetValue"]').attr("placeholder","");
			$page.find('input[name="expOffsetValue"]').attr("placeholder","");
			$page.find('input[name="effOffsetValue"]').val('');
			$page.find('input[name="expOffsetValue"]').val('');
		}else{
			var isFormEditStatus = $form.status() == 'edit' || $form.status() == 'new';
			if(isFormEditStatus){
				$page.find('input[name="effOffsetValue"]').prop('disabled',false);
				$page.find('input[name="expOffsetValue"]').prop('disabled',false);
			}else{
				$page.find('input[name="effOffsetValue"]').prop('disabled',true);
				$page.find('input[name="expOffsetValue"]').prop('disabled',true);
			}
		}
	});
	
	//密码失效偏移类型
	btnPassExpOffsetType.change(function(){
		var passExpType=$page.find('.Dicpassexpoffsettype>option:selected').val();
		if (passExpType=='') {
			$page.find('input[name="passExpOffsetValue"]').prop('disabled',true);
			$page.find('input[name="passExpOffsetValue"]').removeClass("error");
			$page.find('input[name="passExpOffsetValue"]').val('');
		}else{
			var isFormEditStatus = $form.status() == 'edit' || $form.status() == 'new';
			if(isFormEditStatus){
				$page.find('input[name="passExpOffsetValue"]').prop('disabled',false);
			}else{
				$page.find('input[name="passExpOffsetValue"]').prop('disabled',true);
			}
		}
	});
	
	$page.find(".btn-class-edit,.btn-class-cancel,.btn-class-new").click(function(){
			btnOffsetTimeType.trigger('change');
			btnPassExpOffsetType.trigger('change');
	})
	
	var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
	$page.find('input[name="vnoId"]').val(vnoId);
	$page.find('input[name="vnoName"]').val(vnoName);
	$form.data('default',{status:'00A',custTemplateType:'CT1',vnoId:vnoId,vnoName:vnoName,offsetTimeType:'HOU',passExpOffsetType:'HOU'});
	btnOffsetTimeType.trigger('change');
	btnPassExpOffsetType.trigger('change');
	//校验
	var validator = $form.validate();
	$form.on('click',".btn-class-ok",function(e){
		 if (!$form.valid()) {
	            return;
	        }
		var fastCust = $form.serializeObject();
		var method = $form.status() == "new" ? 'insert' : 'modifyFastCustTemplate';
		var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';
		var offerID=$page.find("input[name='offerIds']").val();
		fastCust.offerIds=offerID;
		FastCustTemplateSvc.call(method,[fastCust],function(){
			jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			BootstrapDialog.success(msg);
			$form.status('show');
			btnOffsetTimeType.trigger('change');
			btnPassExpOffsetType.trigger('change');
		});
	});

	var jqGrid = $table.jqGrid({
	    url: '/data/com.wboss.wcb.custmgr.FastCustTemplateSvc?m=queryFastCustTemplate.object.object',
	    colModel: [
	   	        { label: '模板ID', name: 'custTemplateId',width: 200},
	   	        { label: '模板名称', name: 'custTemplateName',width: 200},
	   	        { label: '模板类型', name: '_custTemplateType',width: 100},
	   	        { label: '客户名称', name: 'custName',width: 100},
	   	        { label: '默认订购商品', name: 'offerName',width: 200,sortable:false},
	   	        {  name: 'offerIds',hidden:true},
	   	        { label: '组织标识', name: 'orgnizationId',width: 100},
	   	        { label: '偏移时间类型', name: '_offsetTimeType'},
	   	        { label: '客户有效偏移时间', name: 'effOffsetValue',width: 100},
	   	        { label: '客户失效偏移时间', name: 'expOffsetValue',width: 100},
	   	        { label: 'VnoId',name: 'vnoId',width: 200,hidden:true},
	   	        { label: '创建时间', name: 'createDate',width: 100},
	   	        { label: '状态时间', name: 'statusDate',width: 100},
	   	        { label: '密码失效偏移类型', name: '_passExpOffsetType'},
	   	        { label: '密码失效偏移时间', name: 'passExpOffsetValue',width: 100},
	   	        { label:'企业名称', name: 'vnoName',width: 200,sortable:false},
	   	        { label:'状态', name: '_status'},
	   	    ],
	    onSelectRow:function(rowId){
	    	//获取选中行信息
	    	//清除之前的校验信息
	    	validator.resetForm();
	    	var data = jqGrid.griddata.rows[rowId-1];
	    	$form.deSerializeObject(data).status('show');
	    	btnOffsetTimeType.trigger('change');
	    	btnPassExpOffsetType.trigger('change');
	    	//选中行是,编辑按钮可编辑
	    	$page.find(".btn-class-edit").prop('disabled', false);
	    },
	    onPaging:function(){
	    	$form.status('show');
	    	btnOffsetTimeType.trigger('change');
	    	btnPassExpOffsetType.trigger('change');
	    },
	   	onSortCol:function(){
	    	$form.status('show');
	    	btnOffsetTimeType.trigger('change');
	    	btnPassExpOffsetType.trigger('change');
	    },
	   	loadComplete:function(data){
	   		jqGrid.griddata = data;
	    	$form.status('show');
	    	btnOffsetTimeType.trigger('change');
	    	btnPassExpOffsetType.trigger('change');
	    	//页面加载时，编辑不可用
	    	$page.find(".btn-class-edit").prop('disabled', true);
	    },
	    pager: "#cust_cust_jqGridPager"
	});
}

return { onCreate : onCreate, onActive : onActive };
});


