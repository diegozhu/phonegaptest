define(function () {
//方法
var ProductOfferSvc = new Service('com.wboss.wcb.offermgr.ProductOfferSvc');
var sysparam = new Service("com.wboss.general.param.SysParamSvc");
function onActive($page,$relativeUrl){
	
}
function onCreate($page,$relativeUrl){
	
	//永久使用的change事件
	$page.find("select[name='lifecycleUnit']").change(function(){
		var permanent= $page.find('.permanent>option:selected').val();
		var parmanentv=$page.find('input[name="lifecycleValue"]');
		if (permanent=='-1') {
			$page.find('input[name="lifecycleValue"]').val("");
			$page.find('input[name="lifecycleValue"]').prop('disabled',true);
			parmanentv.rules("remove");
			return;
		}
		parmanentv.rules("add",{isNumber4:true,messages:{isNumber4:'只支持正整数和0'}});
		$page.find('input[name="lifecycleValue"]').prop('disabled',false);
	});
	var $form = $page.find(".detail_form");
	var $table = $("#cfg_product_offer_dataTable");
	var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
	$page.find('input[name="vnoId"]').val(vnoId);
	$page.find('input[name="vnoName"]').val(vnoName);
	//默认状态
	$form.data('default',{status:'00A',effDate : new Date().toString("yyyy-MM-dd hh:mm:ss"),expDate : '2030-01-01 00:00:00',vnoId:vnoId,vnoName:vnoName,useType:'20B',isOfferPack:'F',offerType:'60A',lifecycleUnit:'HOU',portalFlag:"0",sourceType:"0"});
	//当类似是永久使用，对文本框的控制
	$form.on('click',".btn-class-new",function(e){
		$page.find('input[name="expDate"]').prop('disabled',true);
		$page.find('input[name="lifecycleValue"]').prop('disabled',false);
	});
	$form.on('click',".btn-class-edit",function(e){
		$page.find('input[name="effDate"]').prop('disabled',true);
		$page.find('input[name="expDate"]').prop('disabled',true);
		if ($page.find('.permanent>option:selected').val()=='-1') {
			$page.find('input[name="lifecycleValue"]').prop('disabled',true);
			return;
		}
		$page.find('input[name="lifecycleValue"]').prop('disabled',false);
	});

	$form.on('click',".btn-class-ok",function(e){
		 if (!$form.valid()) {
	            return;
	        }
		var product = $form.serializeObject();
		var method = $form.status() == "new" ? 'insert' : 'modifyProductOffer';
		var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';
		var price = parseFloat($page.find('input[name="price"]').val());
		product.price=Math.round(price*100);
		ProductOfferSvc.call(method,[product],function(){
			jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			BootstrapDialog.success(msg);
			$form.status('show');
		});
	});
	//校验
	var validator = $form.validate();
	var jqGrid = $table.jqGrid({
	    url: '/data/com.wboss.wcb.offermgr.ProductOfferSvc?m=queryProductOfferList.object.object',
	    colModel: [
	            { label: '商品编码', name: 'offerCode',width: 100},
	            { label: '商品ID', name: 'offerId',width: 100,hidden:true},
	            { label: '商品名称', name: 'offerName',width: 100},
	   	        { label: '商品类型', name: '_offerType',width: 200},
	   	        { label: '使用类型', name: '_useType',width: 100},
	   	        { label: '是否打包商品', name: '_isOfferPack',width: 200},
	   	        { label: '优先级', name: 'priority',width: 200},
	   	        { label: '鉴权策略名称', name: 'authenName',width: 200,sortable:false},
	   	        { label: '授权策略名称', name: 'accessName',width: 200,sortable:false},
	   	        { label: '定价', name: '_price',width: 200},
	   	        { label: '生效时间', name: 'effDate',width: 100},
	   	        { label: '失效时间', name: 'expDate',width: 100},
	   	        { label: 'VnoId',name: 'vnoId',width: 200,hidden:true},
	   	        { label:'企业名称', name: 'vnoName',width: 200,sortable:false},
	   	        { label:'状态', name: '_status'},
				{ label:'生命周期单位', name: '_lifecycleUnit',width: 200},
   	        	{ label: '生命周期数值',name: 'lifecycleValue',width: 200,hidden:true}
	   	    ],
	    onSelectRow:function(rowId){
	    	//选中行是,编辑按钮可编辑
	    	$page.find(".btn-class-edit").prop('disabled', false);
	    	//清除之前的校验信息
	    	validator.resetForm();
	    	//获取选中行信息
	    	var data = jqGrid.griddata.rows[rowId-1];
	    	$form.deSerializeObject(data).status('show');
	    	$page.find('input[name="price"]').val(data.price/100);
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
	    pager: "#cfg_product_offer_jqGridPager"
	});
 
}
		


	
	return { onCreate : onCreate, onActive : onActive };
});


