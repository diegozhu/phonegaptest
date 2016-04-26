define(function() {
	var batchCreateCardJobSvc=new Service('com.wboss.wcb.cardinfo.BatchCreateCardJobSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");

	function onActive($page, $relativeUrl) {
	}

	function onCreate($page, $relativeUrl) {
		//表单验证初始化
		var $form = $page.find(".detail_form");
		var validator = $form.validate();
		
		//2、下拉框的选择事件
		$form.on('change','select[name="cardNumType"]',function(e){
			//根据用户的选择获取下拉框的值
			var cardNumType=$page.find('select[name="cardNumType"] option:selected').val();
			//获取元素"打头内容"
			var firstNum=$page.find('input[name="firstNum"]');
			firstNum.val('');
			//全数字
			if(cardNumType=="1"){
				firstNum.rules("remove");
				firstNum.rules("add",{required:true,isNumber16:true,messages:{required:"请输入内容",isNumber16:"打头内容必须1-10位全数字"}});
			}else if(cardNumType=="2"){  //全字母
				firstNum.rules("remove");
				firstNum.rules("add",{required:true,isLetter:true,messages:{required:"请输入内容",isLetter:"打头内容必须1-10位全字母"}});
			}else if(cardNumType=="3"){ //字母数字混合
				firstNum.rules("remove");		
				firstNum.rules("add",{required:true,isLetterOrNumber:true,messages:{required:"请输入内容",isLetterOrNumber:"只能包含2-14位的字母和数字"}});
			}
			$page.find('select[name="cardNumType"]').val(cardNumType);
		});
		
		//提交
		$form.on('click',".btn-default",function(e){	
			//1、验证默认卡号组合为"全数字"时的情况
			//根据用户的选择获取下拉框的值
			var cardNumType=$page.find('select[name="cardNumType"] option:selected').val();
			//获取元素"打头内容"
			var firstNum=$page.find('input[name="firstNum"]');
			if(cardNumType=="1"){
				firstNum.rules("remove");
				firstNum.rules("add",{required:true,isNumber11:true,messages:{required:"请输入内容",isNumber11:"打头内容必须1-10位全数字"}});
			}
			//1、表单验证
			if (!$form.valid()) {
				return;
			}
			var batCard = $form.serializeObject();
			var staffId=model.user().userId();
			batCard.staffId=staffId;
			var method = 'batchCreateCardJob';
			
			batchCreateCardJobSvc.call(method,[batCard],function(res){
		        if(!res){
		               BootstrapDialog.show({
			                type: BootstrapDialog.TYPE_DANGER,
			                title: '批量制卡任务失败!',
			                message:  '部分卡号可能有重复哦!' ,
			                buttons: [{
			                	label: '确定',action: function(dialogItself){
			                    dialogItself.close();
			                }}]
					  });
		        	return;
		        }
		    	BootstrapDialog.success('批量制卡任务成功!请稍后到卡管理界面查询相关卡号!');
		     });
		});
}
	
	return {onCreate : onCreate,onActive : onActive};	
});
