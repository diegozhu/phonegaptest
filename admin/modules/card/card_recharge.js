define(function() {
	var cardInfoSvc=new Service('com.wboss.wcb.cardinfo.CardInfoSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");

	function onActive($page, $relativeUrl) {
	}

	function onCreate($page, $relativeUrl) {
		var $form = $page.find(".detail_form");		
		$form.validate();
		//1、充值
        $page.on("click",".btn[name='cardRecharge']",function(e){
        	$page.find("input[name='custCode']").focus();
			if (!$form.valid()) {
				return;
			}
			
			//表单取值
			var custCode=$page.find("input[name='custCode']").val();
			var cardNo=$page.find("input[name='cardNo']").val();
			var pinCode=$page.find("input[name='pinCode']").val();
			var vnoId=$page.find("input[name='vnoId']").val();
			

			//表单提交
			cardInfoSvc.call('cardRecharge', [ custCode,cardNo,pinCode,vnoId ],
					function(res) {
						BootstrapDialog.success('充值成功!');	
					});
        });
		
		//2、重置
        $page.on("click",".btn[name='reset']",function(e){	 
			$page.find("input").val('');
        });
  	}
   		
	return {onCreate : onCreate,onActive : onActive};	
});
