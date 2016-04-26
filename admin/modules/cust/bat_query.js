	var BatchBusiRequestSvc = new Service('com.wboss.wcb.custmgr.BatchBusiRequestSvc');
define(function () {
function onActive($page,$relativeUrl){

	
}

function onCreate($page,$relativeUrl){
	var TYPE={'0':'初始化','1':'处理中','2':'处理完毕','3':'取消','F':'文件'};
	var TYPEDETAIL ={'1':'处理成功','2':'处理失败','3':'处理中'};
	var $table = $("#cust_bat_query_dataTable");
	//var isSelected = false;
	
	var jqGrid = $table.jqGrid({
	    url: '/data/data/com.wboss.wcb.custmgr.BatchBusiRequestSvc?m=queryBatchBusiRequestList.object.object',
	    colModel: [
	   	        { label: '批量任务实例标识', name: 'batchNo'},
	   	        { label: '批量业务类型', name: 'batchBusinessName'},
	   	        { label: '批量模式', name: 'batchMode',formatter:function(cellValue,options,rowObject){
	   	        	return rowObject._batchMode;
	   	        	
	   	        }},
	   	        { label: '文件名称', name: 'fileName'},
	   	        { label: '号段', name: 'numSection',hidden:true},
	   	        { label: '状态', name: 'status',formatter:function(cellValue, options, rowObject){
	   	        	return rowObject._status;
	   	        	
	   	        }},
	   	        { label: '执行时间',name: 'applyTime', formatter:function (cellValue, options, row){
	   	        	var clazz='apply_time_'+options.rowId;
	   	        	return ['<div ', 'class="', clazz, '" >',
	   	        	        '<span>', cellValue, '</span>',
	   	        	        '<input type="text"  value="', cellValue, '" class=" datepicker" style="display:none" />',
	   	        	        '</div>'].join('');
	   	        }},
	   	        { label: '完成时间', name: 'completedTime'},
	   	        { label: 'VnoId',name: 'vnoId',hidden:true},
	   	        { label:'企业名称', name: 'vnoName',sortable:false},
	   	        { label: '操作',name: '#',sortable:false,formatter:function (cellValue, options, row){
	   	        	//如果状态不是初始化，就不可操作
	   	        	if(row.status!='0'){
	   	        		return "<input type='button' value='不可操作 '/>";
	   	        	}
	   	        	var operateDiv = "<div class='operate'>" +
	   	        			"<div class='edit'>" +
	   	        				"<input type='button'  onclick='operate(this, 0, \""+options.rowId+"\")' value='修改执行时间 '/>" +
	   	        			"</div>" +
	   	        			"<div class='result ' style='display:none'>" +
	   	        				"<input type='button' class='btn_class_ok' onclick='operate(this, 1, \""+options.rowId+"\")' value='确定'/>" +
	   	        				"<input type='button' onclick='operate(this, 2, \""+options.rowId+"\")' value='取消'/>" +
	   	        			"</div>" +
	   	        			"</div>";
	     			return operateDiv;
	     		}}
	   	    ],
	   	 height:'300px',
	    onSelectRow:function(rowId){
	    	var data = jqGrid.griddata.rows[rowId-1];
	    	//把参数传到另一个jqGrid 另一个jqGrid调用参数并刷新
	    	var postData = jqGroupGridTemp.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({batchNo: data.batchNo});
			jqGroupGridTemp.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
		
			var postData1 = jqGroupGridCount.jqGrid("getGridParam", "postData");
			postData1.param = JSON.stringify({batchNo: data.batchNo});
			//datatype:json 首次不加载
			jqGroupGridCount.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			//获取选中行BatchNo传到搜索栏
			$page.find("input[name='batchNo']").val('');
			$page.find("input[name='batchNo']").val(data.batchNo);
			
	    },
	   	loadComplete:function(data){
	   		//选中行赋值
	   		jqGrid.griddata = data;
	   		
	   		
	    },
	    pager: "#cust_bat_query_jqGridPager"
	});
	
	function modifyApplyTime(data){
		var method='modifyBatchBusiRequestApplyTime';
		var msg='修改成功';
		BatchBusiRequestSvc.call(method,[data],function(){
			jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			BootstrapDialog.success(msg);
		});
	};
		
	
	
	var jqGroupGridCount = $("#cust_bat_query_groupDataTable").jqGrid({
	    url: '/data/data/com.wboss.wcb.custmgr.BatchBusiRequestSvc?m=queryCount.object.object',
	    datatype: 'local',
	    colModel: [
	   	        { label: '总数', name: 'total'},
	   	        { label: '成功数', name: 'successNum'},
	   	        { label: '失败数', name: 'failNum'},
	   	        { label: '处理中', name: 'handNum'},
	   	    ],
	   	    height:'20px'
	});
	
	window.operate = function(dom, flag, rowid){
		var data = jqGrid.griddata.rows[rowid-1];
		if(flag == '0' ){
			$(dom).parent().parent().find('.result').show();
			$(dom).parent().hide();
			$page.find('.apply_time_'+rowid).find('input').show();
			$page.find('.apply_time_'+rowid).find('span').hide();
			$page.find('.apply_time_'+rowid).find('.datepicker').datetimepicker({format: 'YYYY-MM-DD HH:mm:ss', minDate: new Date()});
		}else if(flag == '1'){
			$(dom).parent().parent().find('.edit').show();
			$(dom).parent().hide();
			$page.find('.apply_time_'+rowid).find('input').hide();
			$page.find('.apply_time_'+rowid).find('span').show();
			//确定，调用修改
			modifyApplyTime({batchNo: data.batchNo, applyTime: $page.find('.apply_time_'+rowid).find('input').val()});
			
		}else{
			$(dom).parent().parent().find('.edit').show();
			$(dom).parent().hide();
			$page.find('.apply_time_'+rowid).find('input').hide();
			$page.find('.apply_time_'+rowid).find('span').show();
		}
	}
	
	
	var jqGroupGridTemp = $("#bat_query_dataTable").jqGrid({
	    url: '/data/com.wboss.wcb.auth.authmgr.BatchBusiRequestDetailSvc?m=queryBatchBusiRequestDetail.object.object',
	    //首次不加载
	    datatype: 'local',
	    //复选框属性
	    multiselect : true,
	    colModel: [
	            { label: '状态', name: 'recSeqId',hidden:true},
	   	        { label: '批量任务实例明细标识', name: 'batchNo'},
	   	        { label: '客户标识', name: 'custId'},
	   	     	{ label: '手机号码', name: 'mobilePhone'},
	   	     	{ label: '状态', name: 'status',formatter:function(cellValue, options, rowObject){
	   	        	return TYPEDETAIL[cellValue];
	   	        }},
	   	        { label: '状态时间', name: 'createDate'},
	   	        { label: '创建时间', name: 'statusDate'},
	   	        { label: '错误信息', name: 'errDesc'},
	   	        { label: 'VnoId',name: 'vnoId',hidden:true},
	   	        { label: '企业名称', name: 'vnoName'}
	   	    ],
	   	 pager: "#cust_bat_query_detail_jqGridPager"
	   	
	});
	
}

return { onCreate : onCreate, onActive : onActive };
});


