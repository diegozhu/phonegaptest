define(function() {
	var cardMgrSvc = new Service('com.wboss.wcb.cardinfo.CardInfoSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
    var currentCardInfo;

	function onActive($page, $relativeUrl) {
	}

	function onCreate($page, $relativeUrl) {
		//默认卡状态：可用
		$page.find('select[name="status"]').val("0");
		$page.on('click',".btn-refresh",function(e){
			cardMgrGrid.resetSelection();
		});
		
   		//卡号详细信息
   		var  cardMgrGrid = $('#card__card_mgr_dataTable').jqGrid({
   			url : wboss.getWay + '/data/com.wboss.wcb.cardinfo.CardInfoSvc?m=queryCardInfoList4Jq.object.object',
   		    multiselect: true,
   		    colModel: [
                { label: '多个卡号', name: 'cardNos',sortable : false,hidden:true},
   		        { label: '卡号', name: 'cardNo',key: true},
   		        { label: '卡金额', name: 'faceValue'},
   		        { label: '密码', name: 'pinCode'},
   		        { label: '卡密代理商', name: 'dealer'},
   		        { label: '状态', name: '_status',sortable : false},
   		        { label: '状态时间', name: 'updateDate'},
   		        { label: '创建时间', name: 'createDate'},
				{label : '', name : 'vnoId',hidden : true},
				{label : '企业名称',name : 'vnoName',sortable : false},
				{label : '使用月份数',name : 'useMonth'}
   		    ],
   		    rowNum : 15,  
   		    onSelectRow:function(rowId){
   		    	currentCardInfo= $("#card__card_mgr_dataTable").jqGrid("getRowData",rowId);
   		    	var status=$page.find("#card_card_mgr_selectStatus option:selected").val();
   		    	//当下拉框的值为"锁定"时，按钮"解锁"才可以编辑
   		 	    var preCardNo=$page.find("input[name='preCardNo']").val();
   		 	    var sufCardNo=$page.find("input[name='sufCardNo']").val();
   		    	if(status=='2'&&!preCardNo){
   		    		$page.find(".btn[name='cardUnlock']").prop('disabled', false);
   		    	}else if(status=='0'&&!preCardNo){
				    $page.find(".btn[name='cardLock']").prop('disabled', false);
   		    	}
   		    	if(status=='2'&&preCardNo&&sufCardNo){
   		    		$page.find(".btn[name='batchCardUnlock']").prop('disabled', false);
   		    	}else if(status=='0'&&preCardNo&&sufCardNo){
 				    $page.find(".btn[name='batchCardLock']").prop('disabled', false);
   		    	}
   		    },
   		   onSelectAll:function(){
  		 	    var preCardNo=$page.find("input[name='preCardNo']").val();
   		 	    var sufCardNo=$page.find("input[name='sufCardNo']").val();
  		    	var status=$page.find("#card_card_mgr_selectStatus option:selected").val();
   		    	//当下拉框的值为"锁定"时，按钮"解锁"才可以编辑
   		    	if(status=='2'&&!preCardNo){
   		    		$page.find(".btn[name='cardUnlock']").prop('disabled', false);
   		    	}else if(status=='0'&&!preCardNo){
				    $page.find(".btn[name='cardLock']").prop('disabled', false);
   		    	}
   		    	if(status=='2'&&preCardNo&&sufCardNo){
   		    		$page.find(".btn[name='batchCardUnlock']").prop('disabled', false);
   		    	}else if(status=='0'&&preCardNo&&sufCardNo){
 				    $page.find(".btn[name='batchCardLock']").prop('disabled', false);
   		    	}
   		    },
   		    onPaging : function() {
			},
			onSortCol : function() {
			},
			loadComplete : function(data) {
				cardMgrGrid.griddata = data;
				$("#card__card_mgr_dataTable").trigger("jqGridSelectAll",true);
				//默认两个按钮无法编辑状态
				$page.find(".btn[name='cardLock']").prop('disabled', true);
				$page.find(".btn[name='batchCardLock']").prop('disabled', true);
				$page.find(".btn[name='cardUnlock']").prop('disabled', true);
				$page.find(".btn[name='batchCardUnlock']").prop('disabled', true);
				
        		$page.find("input[name='preCardNo']").prop('disabled', true);
        		$page.find("input[name='sufCardNo']").prop('disabled', true);
			},
			pager:"card_card_mgr_jqGridPager"
   		});
   		 //查询（参照全局事件封装）
        
   		//1、选择查询方式
        $page.on("click","input[name='queryType1']",function(e){	
        	//清空文本框
         	    $page.find("input").val('');
        		$page.find("input[name='cardNo']").prop('disabled', true);
        		$page.find("input[name='preCardNo']").prop('disabled', false);
        		$page.find("input[name='sufCardNo']").prop('disabled', false);
        });
        $page.on("click","#card_mgr_queryType2",function(e){	
         	    $page.find("input").val('');
        	    $page.find("input[name='cardNo']").prop('disabled', false	);
        		$page.find("input[name='preCardNo']").prop('disabled', true);
        		$page.find("input[name='sufCardNo']").prop('disabled', true);
        });
        
        //2、点击查询前验证开始卡号和结束卡号是否为空(两者要么都为空，要么均不能为空)
        $page.on("click",".btn[name='queryCardInfos']",function(e){	
    		var preCardNo=$page.find("input[name='preCardNo']").val();
    		var sufCardNo=$page.find("input[name='sufCardNo']").val();
    		
        	if((preCardNo&&!sufCardNo)||(!preCardNo&&sufCardNo)){
    				  BootstrapDialog.show({
    		                type: BootstrapDialog.TYPE_DANGER,
    		                title: '开始卡号和结束卡号',
    		                message: '开始卡号和结束卡号必填',
    		                buttons: [{
    		                	label: '确定',action: function(dialogItself){
    		                    dialogItself.close();
    		                }}]
    				  });
    				return;
    			}
    });
        
        function checkCardNoRequired(){
    		var preCardNo=$page.find("input[name='preCardNo']").val();
    		var sufCardNo=$page.find("input[name='sufCardNo']").val();
    		var cardNo=$page.find("input[name='cardNo']").val();
    		
        	if((preCardNo&&!sufCardNo)||(!preCardNo&&sufCardNo)||(!preCardNo&&!sufCardNo)){
    				  BootstrapDialog.show({
    		                type: BootstrapDialog.TYPE_DANGER,
    		                title: '开始卡号和结束卡号',
    		                message: '开始卡号和结束卡号必填',
    		                buttons: [{
    		                	label: '确定',action: function(dialogItself){
    		                    dialogItself.close();
    		                }}]
    				  });
    				return false;
    			}
        	return true;
        }
        
   		
        //3、批量锁定
        $page.on("click",".btn[name='cardLock']",function(e){	 
			var cardNos = cardMgrGrid.jqGrid('getGridParam', 'selarrrow');
			//判断是否选中卡号
			if(cardNos==null||cardNos==''){
				  BootstrapDialog.show({
		                type: BootstrapDialog.TYPE_DANGER,
		                title: '请选择卡号',
		                message: '锁定前请选择卡号',
		                buttons: [{
		                	label: '确定',action: function(dialogItself){
		                    dialogItself.close();
		                }}]
				  });
				return ;
			}
			 currentCardInfo.cardNos=cardNos.join(",");
			 currentCardInfo.status='2';
			 cardMgrSvc.call('lockCardInfo', [currentCardInfo],
					function(res) {
						BootstrapDialog.success('成功锁定!');
  					  cardMgrGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					});
		});
       
        
        //4、批量解锁(更新卡状态+更新代理商字段)
        $page.on("click",".btn[name='cardUnlock']",function(e){	 
        	//解锁之前必须先更新代理商字段
        	var dealer=$page.find("input[name='dealer']").val();
			if(dealer==null||dealer==''){
				  BootstrapDialog.show({
		                type: BootstrapDialog.TYPE_DANGER,
		                title: '请输入代理商名称',
		                message: '请输入代理商名称',
		                buttons: [{
		                	label: '确定',action: function(dialogItself){
		                    dialogItself.close();
		                }}]
				  });
			    $page.find("#card_mgr_dealer").focus();
				return ;
			}
        	

  			var cardNos = cardMgrGrid.jqGrid('getGridParam', 'selarrrow');
  			
			if(cardNos==null||cardNos==''){
				  BootstrapDialog.show({
		                type: BootstrapDialog.TYPE_DANGER,
		                title: '请选择卡号',
		                message: '解锁前请选择卡号',
		                buttons: [{
		                	label: '确定',action: function(dialogItself){
		                    dialogItself.close();
		                }}]
				  });
				return ;
			}
  			
  			 currentCardInfo.cardNos=cardNos.join(",");
  			currentCardInfo.dealer=dealer;
  			 currentCardInfo.status='0';
  			 cardMgrSvc.call('lockCardInfo', [currentCardInfo],
  					function(res) {
  						BootstrapDialog.success('成功解锁!');
  					    cardMgrGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
  					});
                  $page.find("input").val('');
	    	});
        
        //5、按号段锁定
        $page.on("click",".btn[name='batchCardLock']",function(e){	 
        	//开始卡号和结束卡号必填
        	if(!checkCardNoRequired()){
        		return;
        	}
        	//全选后可以全量锁定
  			var cardNos = cardMgrGrid.jqGrid('getGridParam', 'selarrrow');
			if(cardNos==null||cardNos==''){
				  BootstrapDialog.show({
		                type: BootstrapDialog.TYPE_DANGER,
		                title: '请全选',
		                message: '锁定前请全选卡号',
		                buttons: [{
		                	label: '确定',action: function(dialogItself){
		                    dialogItself.close();
		                }}]
				  });
				return ;
			}
        	
    		var preCardNo=$page.find("input[name='preCardNo']").val();
    		var sufCardNo=$page.find("input[name='sufCardNo']").val();
			currentCardInfo.preCardNo=preCardNo;
			currentCardInfo.sufCardNo=sufCardNo;
			 currentCardInfo.status='2';
			 cardMgrSvc.call('batchLockCardInfo', [currentCardInfo],
					function(res) {
						BootstrapDialog.success('成功按号段锁定!');
  					  cardMgrGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					});
		});
        
        //6、按号段解锁(更新卡状态+更新代理商字段)
        $page.on("click",".btn[name='batchCardUnlock']",function(e){	 
        	if(!checkCardNoRequired()){
        		return;
        	}
        	//全选后可以全量解锁
  			var cardNos = cardMgrGrid.jqGrid('getGridParam', 'selarrrow');
			if(cardNos==null||cardNos==''){
				  BootstrapDialog.show({
		                type: BootstrapDialog.TYPE_DANGER,
		                title: '请全选',
		                message: '解锁前请全选卡号',
		                buttons: [{
		                	label: '确定',action: function(dialogItself){
		                    dialogItself.close();
		                }}]
				  });
				return ;
			}
        	
    		var preCardNo=$page.find("input[name='preCardNo']").val();
    		var sufCardNo=$page.find("input[name='sufCardNo']").val();
        	//解锁之前必须先更新代理商字段
        	var dealer=$page.find("input[name='dealer']").val();
			if(dealer==null||dealer==''){
				  BootstrapDialog.show({
		                type: BootstrapDialog.TYPE_DANGER,
		                title: '请输入代理商名称',
		                message: '请输入代理商名称',
		                buttons: [{
		                	label: '确定',action: function(dialogItself){
		                    dialogItself.close();
		                }}]
				  });
			    $page.find("#card_mgr_dealer").focus();
				return ;
			}
        	
			currentCardInfo.preCardNo=preCardNo;
			currentCardInfo.sufCardNo=sufCardNo;
			currentCardInfo.dealer=dealer;
  			 currentCardInfo.status='0';
  			 cardMgrSvc.call('batchLockCardInfo', [currentCardInfo],
  					function(res) {
  						BootstrapDialog.success('成功解锁!');
  					    cardMgrGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
  					});
                  $page.find("input").val('');
	    	});
   		
}
	
	return {onCreate : onCreate,onActive : onActive};	
});
