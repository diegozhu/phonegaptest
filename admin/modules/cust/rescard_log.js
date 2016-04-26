define(function(){
  
	function onActive($page, $relativeUrl){
		
	}
	
	wboss.addDic("DIC_CARDLOG_TYPE","DIC_CARDLOG_TYPE_NEW",{v:"",n:"全部"});
    function onCreate($page, $relativeUrl){
		
    	var vnoId = model.user().vnoId();
    	var vnoName=model.user().vnoName();
    	$page.find("input[name='vnoId']").val(vnoId);
    	$page.find("input[name='vnoName']").val(vnoName);
    	
    	var beginDate=$page.find("input[name='beginDate']");
    	var endDate=$page.find("input[name='endDate']");
    	
    	$page.on('click',".btn-search,.btn-refresh",function(e){
    		var begin = $page.find('input[name="beginDate"]').val();
    		var end = $page.find('input[name="endDate"]').val();
    		if(DateDiff(begin,end)>99){
    			BootstrapDialog.warning("已超过最大天数100天,请重新选择！");
    			return false;
    		}
    		if(begin>end){
    			BootstrapDialog.warning("开始时间晚于结束时间,请重新选择！");
    			return false;
    		}
    		else if(begin==''||end==''){
    			BootstrapDialog.warning("日期不能为空！");
    			return false;
    		}
    	});
    	
    	var $table=$('#cust_rescard_log_dataTable');
    	var  jqGrid = $table.jqGrid({
		    url : '/data/com.wboss.wcb.custmgr.ReschargeCardLogSvc?m=queryRechargeCardLogList.object.object',
		    postData:{param:JSON.stringify({beginDate:beginDate.val(),endDate:endDate.val(),vnoId:vnoId})},
			colModel: [
			        { label: '充值卡充值流水号', name: 'rechargeLogId'},
			        { label: '充值时间', name: 'createDate'},
			        { label: '卡号', name: 'cardNo'},
			        { label: '卡金额', name: 'faceValue'},
			        { label: '使用月份', name: 'useMonth'},
			        { label: '手机号', name: 'mobilePhone'},
			        { label: '商品名称', name: 'offerName'},
			        { label: '有效时间', name: 'validTime'},
			        { label: '卡密代理商', name: 'dealer'},
			        { label: '状态', name: '_status'},
			        { label: '企业名称', name: 'vnoName',sortable:false}
			    ],
			   
				pager:"cust_rescard_log_jqGridPager"
		});
	  
    	
	}
	
	return {onActive:onActive, onCreate:onCreate}
});