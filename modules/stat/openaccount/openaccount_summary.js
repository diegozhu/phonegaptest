define(function(){
	
	function onActive($page, $relativeUrl) {
		
	}
	
	function onCreate($page, $relativeUrl) {
		
		var $table = $page.find("#openaccountCtiy_dataTable");
		$page.find(".btn-report-export").prop('disabled', true);
		var jqParentGrid = $page.find("#openaccountCtiy_dataTable")
		.jqGrid(
				{
					url : $page.reqUrl +wboss.getWay + '/data/com.wboss.report.openaccount.OpenAccountSvc?m=queryProvinceSumJq.object.object',
					recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
				    datatype:'local',
					shrinkToFit:IsPC(),
				    colModel : [ 
					    {label : '区域',name : 'province',sortable:false},
					    {label : '本月历史开户数',name : 'proHis',sortable:false}, 
						{label : '当天新增正式用户',name : 'proNormal',sortable:false}, 
						{label : '当天新增自营用户',name : 'proSelf',sortable:false},
					    {label : '各区域当月开户数',name : 'regionMonOpenNum',sortable:false},
						{label : '历史月份累计开户',name : 'proCur',sortable:false},
						{label : '截至当前累计开户',name : 'proCumulative',sortable:false},
						{label : '当天新增体验用户',name : 'proExp',sortable:false} 
						],
						onSelectRow : function(rowId) {
							var data = $table.getRowData(rowId);
							if(data.province == '合计'){
					    		return ;
					    	}
							data.statDate = $page.find("input[name='statDate']").val();
					    	//把参数传到另一个jqGrid 另一个jqGrid调用参数并刷新
					    	var postData = jqGrid.jqGrid("getGridParam", "postData");
							postData.param = JSON.stringify({province: data.province,statDate:data.statDate,isSelOrCli:0});
							jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
						},
						rowNum : 100
				});
		
		
		var jqGrid = $page.find("#openaccount_Region_dataTable")
		.jqGrid(
				{
					url : $page.reqUrl +wboss.getWay + '/data/com.wboss.report.openaccount.OpenAccountSvc?m=queryOpenAccountSumJq.object.object',
					recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
				    datatype:'local',
					shrinkToFit:IsPC(),
				    colModel : [ 
					    {label : '地市',name : 'city',sortable:false}, 
						{label : '本月历史开户数',name : 'monHisRegNum',sortable:false}, 
						{label : '当天新增正式用户',name : 'newNormalNum',sortable:false}, 
						{label : '当天新增自营用户',name : 'newSelfEmployedNum',sortable:false}, 
						{label : '各地市当月开户数',name : 'allNum',sortable:false},
						{label : '历史月份累计开户',name : 'monCurRegNum',sortable:false},
						{label : '截至当前累计开户',name : 'cumulativeNum',sortable:false} ,
						{label : '当天新增体验用户',name : 'dayExpNum',sortable:false} 
						],
					pager : "#openaccount_Region_jqGridPager"
				});
		
		$page.find(".btn-search").click(function(){
			$page.find(".btn-report-export").prop('disabled', false);
			var statDate = $page.find("input[name='statDate']").val();
			var regionId=$page.find('input[name="regionId"]').val();
			var province=$page.find('input[name="regionName"]').val();
			var vnoId=model.user().vnoId();
			 if(statDate==''){
					BootstrapDialog.warning("日期不能为空！");
					return false;
				}
			var postData = jqGrid.jqGrid("getGridParam", "postData");
			var postData2 = jqParentGrid.jqGrid("getGridParam", "postData");
			var queryParam = {statDate: statDate,province:province,vnoId:vnoId,isSelOrCli:1};
		  	postData.param = JSON.stringify(queryParam);
		  	postData2.param = JSON.stringify(queryParam);
		  	jqParentGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			jqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			return false;
		});
		
		$page.find('.btn-report-export').on('click', function(){
			var postData = jqGrid.jqGrid("getGridParam", "postData");
			var url = $page.reqUrl +'/report/com.wboss.report.openaccount.OpenAccountSvc?m=exportSum.object.object'
			for(var i in postData){
                url += "&"+i+"="+encodeURIComponent(encodeURIComponent(postData[i]));
            }
			window.open(url);
		})
		
	}

	
	return { onCreate : onCreate, onActive : onActive };
});