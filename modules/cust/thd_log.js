define(function() {
wboss.addDic('DIC_THDLOG_STATUS','DIC_THDLOG_STATUS_ALL',{n:'全部',v:''});
function onCreate($page, $relativeUrl) {
    var svc = new Service('com.wboss.wcb.thdpaymentlog.ThdPaymentOrderLogSvc');
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
    
    $("#cust_thd_log_dataTable").jqGrid({
        url : wboss.getWay + '/data/com.wboss.wcb.thdpaymentlog.ThdPaymentOrderLogSvc?m=queryForJqGrid.object.object',
        postData:{param:JSON.stringify({beginDate:beginDate.val(),endDate:endDate.val(),vnoId:vnoId})},
        colModel : [ { label : '支付订购记录', name : 'paymentOrderId', hidden:true },
                     { label : '客户名称', name : 'custName'},
                     { label : '充值号码', name : 'mobilePhone'},
                     { label : '金额(元)',name : '_amount'},
                     { label : '支付方式', name : '_paymentMethod'},
                     { label : '支付渠道', name : '_paymentChannel'},
                     { label : '状态', name : '_status'},
                     { label : '下单时间', name : 'createDate'},
                     { label : '更新时间', name : 'statusDate'},
                     { label : '订单号', name : 'thdOrderSn'},
                     { label : '交易号', name : 'thdPaySn',hidden:true},
                     { label : '支付类型', name : '_thdType'},
                     { label : '支付时间', name : 'thdPayDate',hidden:true},
                     { label : '交易成功标识', name : 'thdSucFlag',hidden:true},
                     { label : '套餐', name : 'offerName',sortable:false},
                     { label : '数量', name : 'orderNum'},
                     { label : '订购套餐生效时间', name : 'offerEffDate',hidden:true},
                     { label : '订购套餐失效时间', name : 'offerExpDate',hidden:true},
                     { label : '支付记录', name : 'paymentId',hidden:true},
                     { label : '商品订购实例标识', name : 'productOfferInstanceId',hidden:true},
                     { label : '冲正支付订购记录', name : 'reverPaymentOrderId',hidden:true},
                     { label : '冲正原因', name : 'reverReason',hidden:true},
                     { label : '企业名称', name : 'vnoName',sortable:false}
                ],
        shrinkToFit:false,
        pager : "#cust_thd_log_jqGridPager"
    });
}
return { onCreate : onCreate };
});
