define(function () {
//方法
var productOfferSvc = new Service('com.wboss.wcb.offermgr.ProductOfferSvc');
var sysparam = new Service("com.wboss.general.param.SysParamSvc");
function onActive($page,$relativeUrl){

	
}
function onCreate($page,$relativeUrl){
	var currentProduct;
	//查询状态
	var LSTYPE={null:''};
	sysparam.call('getDicData',['DIC_PRO_OFFER_LS_TYPE'],function(res){
		for(var i in res){
			LSTYPE[res[i].dicValue]=res[i].dicValueName;
		}
	});


	var $table = $("#cfg_product_offer_audit_dataTable");
	var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
	$page.find('input[name="vnoId"]').val(vnoId);
	$page.find('input[name="vnoName"]').val(vnoName);

	var jqGrid = $table.jqGrid({
	    url: '/data/com.wboss.wcb.offermgr.ProductOfferSvc?m=queryProductOfferaAuditList.object.object',
	    multiselect: true,
	    colModel: [
	              { label: '商品ID', name: 'offerId',width: 100,key:true,hidden:true},
	            { label: '商品名称', name: 'offerName',width: 100},
	   	        { label: '商品类型', name: '_offerType',width: 200 },
	   	        { label: '使用类型', name: '_useType',width: 100},
	   	        { label: '是否打包商品', name: '_isOfferPack',width: 200},
	   	        { label: '优先级', name: 'priority',width: 200},
	   	        { label: '鉴权策略名称', name: 'authenName',width: 200,sortable:false},
	   	        { label: '授权策略名称', name: 'accessName',width: 200,sortable:false},
	   	        { label: '商品编码', name: 'offerCode',width: 100},
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
	    	currentProduct= $table.jqGrid("getRowData",rowId);
	    },
	    onPaging:function(){
	    },
	   	onSortCol:function(){
	    },
	   	loadComplete:function(data){
	   		jqGrid.griddata = data;
	    },
	    pager: "#cfg_product_offer_audit_jqGridPager"
	});
	
	
	//批量审核通过
	$page.on("click",".btn[name='auditPass']",function(e){
			var offerIds= jqGrid.jqGrid('getGridParam', 'selarrrow');
			//验证是否已选择商品
			if(offerIds==null||offerIds==''){
				  BootstrapDialog.show({
		                type: BootstrapDialog.TYPE_DANGER,
		                title: '请选择商品',
		                message: '请选择商品',
		                buttons: [{
		                	label: '确定',action: function(dialogItself){
		                    dialogItself.close();
		                }}]
				  });
				return ;
			}
			offerIds=offerIds.join(",");
            var status="00A";
			 productOfferSvc.call('modifyProductOffer', [offerIds,status],
					function(res) {
						BootstrapDialog.success('审核通过!');
						jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					});
	});
	
	//批量审核不通过
	$page.on("click",".btn[name='auditNotPassed']",function(e){
			var offerIds= jqGrid.jqGrid('getGridParam', 'selarrrow');
			//验证是否已选择商品
			if(offerIds==null||offerIds==''){
				  BootstrapDialog.show({
		                type: BootstrapDialog.TYPE_DANGER,
		                title: '请选择商品',
		                message: '请选择商品',
		                buttons: [{
		                	label: '确定',action: function(dialogItself){
		                    dialogItself.close();
		                }}]
				  });
				return ;
			}
			offerIds=offerIds.join(",");
            var status="00N";
			 productOfferSvc.call('modifyProductOffer', [offerIds,status],
					function(res) {
						BootstrapDialog.success('审核未通过!');
						jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					});
	});

	
}




return { onCreate : onCreate, onActive : onActive };
});


