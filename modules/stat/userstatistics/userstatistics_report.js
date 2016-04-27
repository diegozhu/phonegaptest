define(function(){
	
	function onActive($page, $relativeUrl) {
		
	}

	function onCreate($page, $relativeUrl) {
		var vnoId = model.user().vnoId();
		$page.find('input[name="vnoId"]').val(vnoId);
		
		$page.find('.btn-report-export').prop("disabled",true);
		$page.find('.btn-search').click(function(){
			$page.find('.btn-report-export').prop("disabled",false);
		});
		
		var $table = $page.find("#userStatistics_parentRegion_dataTable");
		var parentJqGrid = $page.find("#userStatistics_parentRegion_dataTable").jqGrid({
		    url: wboss.getWay + '/data/com.wboss.report.userstat.UserStatReportSvc?m=queryProvinceUserStatList4Jq2.object.object',
		    datatype:'local',
		    recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
		    postData :{param:JSON.stringify({regionName:$page.find("input[name='regionName']").val(),startTime:$page.find("input[name='startTime']").val(),endTime:$page.find("input[name='endTime']").val()})},
		    colNames: ['用户状态', '省', '有使用记录', '无使用记录', '有使用记录', '无使用记录', '有使用记录', '无使用记录', '有使用记录', '无使用记录', '有使用记录', '无使用记录', '有使用记录', '无使用记录'],
		    colModel: [
		        {label: '用户状态', name: 'custStatus',sortable:false},
		        {label: '省', name: 'province'},
		        {label: '有使用记录', name: 'hasUsedOfNormal',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfNormal',sortable:false},
		        {label: '有使用记录', name: 'hasUsedOfExperience',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfExperience',sortable:false},
		        {label: '有使用记录', name: 'hasUsedOfFree',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfFree',sortable:false},
		        {label: '有使用记录', name: 'hasUsedOfPre',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfPre',sortable:false},
		        {label: '有使用记录', name: 'hasUsedOfOwn',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfOwn',sortable:false},
		        {label: '有使用记录', name: 'hasUsedOfAdd',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfAdd',sortable:false}
		    ],
		    onSelectRow : function(rowId) {
				var data = $table.getRowData(rowId);
				if(data.custStatus == '总计'){
		    		return ;
		    	}
				$province = data.province;
				$custStatus = data.custStatus;
				var postDataChd = childJqGrid.jqGrid("getGridParam", "postData");
				var param = $.extend(JSON.parse(postDataChd.param), {province: $province, custStatus: $custStatus});
				postDataChd.param = JSON.stringify(param);
				childJqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			},
		    height: '250px'
		    //pager: "#userStatistics_parentRegion_jqGridPager"
		});
		
		jQuery("#userStatistics_parentRegion_dataTable").jqGrid('setGroupHeaders', {
			 useColSpanStyle: true, 
			 groupHeaders:[
			 {startColumnName: 'hasUsedOfNormal', numberOfColumns: 2, titleText: '正式用户'},
			 {startColumnName: 'hasUsedOfExperience', numberOfColumns: 2, titleText: '体验用户'},
			 {startColumnName: 'hasUsedOfFree', numberOfColumns: 2, titleText: '公免用户'},
			 {startColumnName: 'hasUsedOfPre', numberOfColumns: 2, titleText: '预用户'},
			 {startColumnName: 'hasUsedOfOwn', numberOfColumns: 2, titleText: '自营'},
			 {startColumnName: 'hasUsedOfAdd', numberOfColumns: 2, titleText: '增值合作'}
			 ]  
		});
		
		var childJqGrid = $page.find("#userStatistics_childRegion_dataTable").jqGrid({
		    url: wboss.getWay + '/data/com.wboss.report.userstat.UserStatReportSvc?m=queryCityUserStatList4Jq2.object.object',
		    datatype:'local',
		    recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
		    postData :{param:JSON.stringify({regionName:$page.find("input[name='regionName']").val(),startTime:$page.find("input[name='startTime']").val(),endTime:$page.find("input[name='endTime']").val()})},
		    colNames: ['用户状态', '市', '有使用记录', '无使用记录', '有使用记录', '无使用记录', '有使用记录', '无使用记录', '有使用记录', '无使用记录', '有使用记录', '无使用记录', '有使用记录', '无使用记录'],
		    colModel: [
		        {label: '用户状态', name: 'custStatus',sortable:false},
		        {label: '市', name: 'city'},
		        {label: '有使用记录', name: 'hasUsedOfNormal',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfNormal',sortable:false},
		        {label: '有使用记录', name: 'hasUsedOfExperience',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfExperience',sortable:false},
		        {label: '有使用记录', name: 'hasUsedOfFree',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfFree',sortable:false},
		        {label: '有使用记录', name: 'hasUsedOfPre',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfPre',sortable:false},
		        {label: '有使用记录', name: 'hasUsedOfOwn',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfOwn',sortable:false},
		        {label: '有使用记录', name: 'hasUsedOfAdd',sortable:false},
		        {label: '无使用记录', name: 'noUsedOfAdd',sortable:false}
		    ],
		    height: 200,
		    pager: "#userStatistics_childRegion_jqGridPager"
		});
		
		jQuery("#userStatistics_childRegion_dataTable").jqGrid('setGroupHeaders', {
			 useColSpanStyle: true, 
			 groupHeaders:[
	             {startColumnName: 'hasUsedOfNormal', numberOfColumns: 2, titleText: '正式用户'},
	  			 {startColumnName: 'hasUsedOfExperience', numberOfColumns: 2, titleText: '体验用户'},
	  			 {startColumnName: 'hasUsedOfFree', numberOfColumns: 2, titleText: '公免用户'},
	  			 {startColumnName: 'hasUsedOfPre', numberOfColumns: 2, titleText: '预用户'},
	  			 {startColumnName: 'hasUsedOfOwn', numberOfColumns: 2, titleText: '自营'},
	  			 {startColumnName: 'hasUsedOfAdd', numberOfColumns: 2, titleText: '增值合作'}
			 ]  
		});
		
		$page.find(".btn-search").click(function(){
			var begin = $page.find('input[name="startTime"]').val();
			var end = $page.find('input[name="endTime"]').val();
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
			
			var province = $page.find("input[name='regionName']").val();
			var startTime = $page.find("input[name='startTime']").val();
			var endTime = $page.find("input[name='endTime']").val();
			var vnoId = $page.find("input[name='vnoId']").val();
			var postDataPar = parentJqGrid.jqGrid("getGridParam", "postData");
			var queryParamPar = {province:province, startTime:startTime, endTime:endTime, vnoId:vnoId};
			postDataPar.param = JSON.stringify(queryParamPar);
		  	parentJqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
		  	var postDataChd = childJqGrid.jqGrid("getGridParam", "postData");
			var queryParamChd = {province:province, startTime:startTime, endTime:endTime, vnoId:vnoId};
			postDataChd.param = JSON.stringify(queryParamChd);
		  	childJqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
		});
		
		$page.find('.btn-report-export').on('click', function(){
			var postData = parentJqGrid.jqGrid("getGridParam", "postData");
			var url = $page.reqUrl + '/report/com.wboss.report.userstat.UserStatReportSvc?m=export.object.object';
			for(var i in postData){
                url += "&"+i+"="+encodeURIComponent(encodeURIComponent(postData[i]));
            }
			window.open(url);
		})
	}
	return { onCreate : onCreate, onActive : onActive };
})