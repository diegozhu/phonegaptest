var IntegralCustEventSvc = new Service('com.wboss.wcb.integralmgr.IntegralCustEventSvc');

define(function() {
	function onActive($page, $relativeUrl) {
	}

	function onCreate($page, $relativeUrl) {
		var STATUS={'00A':'可用','00F':'已冻结'};
		var jqGroupGrid = $("#integral_qryintegral_dataTable").jqGrid({
		    url: wboss.getWay + '/data/data/com.wboss.wcb.integralmgr.IntegralCustSvc?m=queryIntegralCustList.object.object',
		    colModel: [
		   	        { label: '积分类型', name: 'integralTypeName'},
		   	        { label: '积分', name: '#',sortable:false,formatter: function (cellValue, options, rowObject){
		   	        	return rowObject.activeAmount+rowObject.freezedAmount;
					}},
		   	        { label: '可用积分', name: 'activeAmount'},
		   	        { label: '冻结积分', name: 'freezedAmount'},
		   	        { label: '已兑换积分', name: 'usedAmount'},
		   	        { label: '企业名称', name: 'vnoName',sortable:false},
		   	        { label: '企业名称', name: 'vnoId',hidden:true},
		   	    ],
		   	    height:'200px',
		});
		
		var jqCustEvenGrid = $("#integral_cust_event_dataTable").jqGrid({
		    url: wboss.getWay + '/data/data/com.wboss.wcb.integralmgr.IntegralCustEventSvc?m=queryintegralCustEventList.object.object',
		    colModel: [
		   	        { label: '积分事件', name: 'custEventInstId'},
		   	        { label: '积分类型', name: 'integralTypeName'},
		   	        { label: '获取积分数量', name: 'amount'},
		   	        { label: '获取积分前的可用积分', name: 'oldActiveAmount'},
		   	        { label: '状态', name: 'status',formatter:function(cellValue, options, rowObject){
		   	        	return STATUS[cellValue];
		   	        }},
		   	        { label: '积分活动触发时间', name: 'tiggerDate'},
		   	        { label: '创建时间', name: 'createDate'},
		   	        { label: '操作', name: '#',sortable:false,formatter:function (cellValue, options, row){
		   	        	var operateDiv = "<input type='button' class='btn_class_freeze' onclick='operate(this, 0, \""+options.rowId+"\")' value='冻结'/>" +
   	        				"<input type='button' class='btn_class_Cancelfreeze' onclick='operate(this, 1, \""+options.rowId+"\")' value='取消冻结'/>" ;
		   	        	return operateDiv;
		   	        }
		   	        }
		   	    ],
		   	  onSelectRow:function(rowId){
		 	    	//获取选中行信息
		 	    	var data = jqCustEvenGrid.griddata.rows[rowId-1];
		 	    },
		 		loadComplete:function(data){
		 			jqCustEvenGrid.griddata = data;
			    },
		   	 height:'300px',
		   	 pager: "#integral_cust_event_jqGridPager"
		});
		
		function modifyStusts(data){
			var method='modifyIntertalCustEvenStatus';
			var msg='修改成功';
			IntegralCustEventSvc.call(method,[data],function(){
				jqCustEvenGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
				BootstrapDialog.success(msg);
			});
		};
	
		window.operate = function(dom, flag, rowid){
			if(flag == '0'){
				var data = jqCustEvenGrid.griddata.rows[rowid-1];
				if (data && data.status=='00A') {
					modifyStusts({custEventInstId: data.custEventInstId, status: $page.find('.freeze').val()});
					return;
				}
				BootstrapDialog.warning("已经冻结状态");
				
			}else if(flag == '1'){
				var data = jqCustEvenGrid.griddata.rows[rowid-1];
				if (data && data.status=='00F') {
					modifyStusts({custEventInstId: data.custEventInstId, status: $page.find('.Cancelfreeze').val()});
					return;
				}
				BootstrapDialog.warning("不是冻结状态");
				
			}
		}

		var jqItemGrid = $("#integral_present_item_dataTable").jqGrid({
		    url: wboss.getWay + '/data/data/com.wboss.wcb.integralmgr.IntegralPresentItemSvc?m=queryIntegralPresentItemList.object.object',
		    colModel: [
		   	        { label: '兑换流水', name: 'orderSeq'},
		   	        { label: '积分类型', name: 'integralTypeName'},
		   	        { label: '兑换名称', name: 'presentName'},
		   	        { label: '兑换数量', name: 'quantity'},
		   	        { label: '兑换前的可用积分', name: 'oldActiveAmount'},
		   	        { label: '兑换的积分', name: 'usedAmount'},
		   	        { label: '兑换时间', name: 'busiDate'},
		   	        { label: '办理人', name: 'staffCode'},
		   	        { label: '备注', name: 'remark'},
		   	    ],
		   	 height:'300px',
		   	 pager: "#integral_present_item_jqGridPager"
		});
		
		$page.find("button[name='btnSearchCust']").click(function(){
			var CustCode=$page.find("input[name='custCode']").val();
			//我的积分
			var postData = jqGroupGrid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({custCode: CustCode});
			jqGroupGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			//积分活动记录
			var postEven = jqCustEvenGrid.jqGrid("getGridParam", "postData");
			postEven.param = JSON.stringify({custCode: CustCode});
			jqCustEvenGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			//积分兑换记录
			var postItem = jqItemGrid.jqGrid("getGridParam", "postData");
			postItem.param = JSON.stringify({custCode: CustCode});
			jqItemGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
		});
	
	}
		
	return {
		onCreate : onCreate,
		onActive : onActive
	};
});


	
	
