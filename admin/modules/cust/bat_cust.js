var BatchBusiRequestSvc=new Service('com.wboss.wcb.custmgr.BatchBusiRequestSvc');
var BatchCustmgrJob=new Service('com.wboss.wcb.custmgr.BatchCustmgrJob');

define(function() {
	function onActive($page, $relativeUrl) {
	}
	function onCreate($page, $relativeUrl) {
		//时间
		var myDate=new Date();
		var runTime=myDate.toString("yyyy-MM-dd HH:mm:ss");
		var isIntTrue=$page.find("input[type='checkbox']").is(':checked');
		if (isIntTrue==true) {
			$page.find("input[name='applyTime']").prop('disabled',true);
			$page.find("input[name='applyTime']").val(runTime);
		}
		//立即执行，改变文本框的状态change事件
		$page.find("input[name='checkBox']").change(function(){
			var isTrue=$page.find("input[type='checkbox']").is(':checked');
			if (isTrue==true) {
				$page.find("input[name='applyTime']").prop('disabled',true);
				$page.find("input[name='applyTime']").val(runTime);
				return;
			}
			$page.find("input[name='applyTime']").prop('disabled',false);
			$page.find("input[name='applyTime']").val('');
		});
		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
		$page.find('input[name="vnoId"]').val(vnoId);
		$page.find('input[name="vnoName"]').val(vnoName);
		var $form = $page.find(".detail_form");
		//添加信息
		$form.on('click',".btn_class_submit",function(e){
			if (!$form.valid()) {
	            return;
	        }
			var batCust = $form.serializeObject();
			var staffid=model.user().userId();
			batCust.staffId=staffid;
			batCust.fileName=batCust.filename;
			var method = 'insert';
			var msg = '提交成功！';
			var isExcute=$page.find("input[type='checkbox']").is(':checked');
			BatchBusiRequestSvc.call(method,[batCust,isExcute],function(){
				BootstrapDialog.success(msg);
				//清空数据
				$page.find("input[name='filename']").val('');
				$page.find("input[name='applyTime']").val(runTime);
			});
		});
	}

	return {
		onCreate : onCreate,
		onActive : onActive
	};
});
