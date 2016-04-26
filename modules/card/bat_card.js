define(function() {
	var batchCardMgr=new Service('com.wboss.wcb.cardinfo.BatchCardmgrSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");

	function onActive($page, $relativeUrl) {
	}

	function onCreate($page, $relativeUrl) {
		var $form = $page.find(".detail_form");
		//添加信息
		$form.on('click',".btnCommit",function(e){
			//1、验证是否选择文件
			var inputVal=$page.find("input").val();
			if(inputVal==null||inputVal==''){
				  BootstrapDialog.show({
		                type: BootstrapDialog.TYPE_DANGER,
		                title: '请选择文件',
		                message: '请选择文件',
		                buttons: [{
		                	label: '确定',action: function(dialogItself){
		                    dialogItself.close();
		                }}]
				  });
				return ;
			}
			
			var batCard = $form.serializeObject();
			var method = 'batchCard';
		     batchCardMgr.call(method,[{fieldName: 'cardNo,faceValue,pinCode,dealer,vnoCode,useMonth',fieldType:'String,Long,String,String,String,Long'},batCard.filename],function(res){
               console.log(res);
               if(res.code == '0'){
            	   BootstrapDialog.success(res.msg);
            	   return;
               }
               if(res.msg.length > 500){
            	   res.msg = res.msg.substr(0,500) + "......";
               }
               BootstrapDialog.show({
	                type: BootstrapDialog.TYPE_DANGER,
	                title: '部分卡号可能有重复哦',
	                backdrop: 'static', keyboard: false, 
	                message:  res.msg, 
	                buttons: [{
	                	label: '确定',action: function(dialogItself){
	                    dialogItself.close();
	                }}]
			  });
				//清空数据
				$page.find("input").val('');
			});
		});
}
	
	return {onCreate : onCreate,onActive : onActive};	
});
