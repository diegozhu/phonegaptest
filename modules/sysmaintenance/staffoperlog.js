define(function () {

function onActive($page,$relativeUrl){
}

function onCreate($page,$relativeUrl){
	$("#sysmaintenance_staffoperlog_search_group .btn-search").on("click",function(){
		var postData = jqGrid.jqGrid("getGridParam", "postData");
		var queryParam = $("#sysmaintenance_staffoperlog_search_group").serializeObject();
      	postData.param = JSON.stringify(queryParam);
       	jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
	});
	
    $page.on('click',".btn-search,.btn-refresh",function(e){
		var begin = $page.find('input[name="startDate"]').val();
		var end = $page.find('input[name="endDate"]').val();
		if(DateDiff(begin,end)>6){
			BootstrapDialog.warning("已超过最大天数7天,请重新选择！");
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


/* 获取选中行  
**
var rowId =$("#privilege_rolemanage_dataTable").jqGrid('getGridParam','selrow');  
var rowData = $("#privilege_rolemanage_dataTable").getRowData(rowId);
*/
	var jqGrid = $("#sysmaintenance_staffoperlog_dataTable").jqGrid({
	    url: wboss.getWay + '/data/com.wboss.wcb.operationlog.OperationLogSvc?m=queryRoleList4Jq.object.object',
	    colModel: [
	        { label: '操作工号', name: 'staffCode' },
	        { label: '服务名', name: 'svcName',editable:true},
	        { label: '调用参数', name: 'param'},
	        { label: '操作Ip', name: 'sourIp'},
	        { label:'异常编码', name: 'expCode'},
	        { label:'创建时间', name: 'createTime'},
	        { label:'操作时间', name: 'operTime'}
	    ],
		viewrecords: true,
	    height: '400px',
	    sortable:true,
	    pgbuttons:true,
	    pager: "#sysmaintenance_staffoperlog_jqGridPager"
	});
	

}

return { onCreate : onCreate, onActive : onActive };
});


