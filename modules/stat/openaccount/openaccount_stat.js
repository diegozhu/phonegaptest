define(function(){
	
	function onActive($page, $relativeUrl) {
		
	}
	
	function onCreate($page, $relativeUrl) {
		var $table = $page.find("#openaccount_parentRegion_dataTable");
		$page.find(".btn-report-export").prop('disabled', true);
		var jqParentGrid = $page.find("#openaccount_parentRegion_dataTable")
		.jqGrid(
				{
					url : $page.reqUrl +'/data/com.wboss.report.openaccount.OpenAccountSvc?m=queryProvinceJq.object.object',
					recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
					datatype:'local',
					shrinkToFit:IsPC(),
					colModel : [ 
					    {label : '区域',name : 'province',sortable:false},
					    {label : '当天新增正式用户',name : 'proNormal',sortable:false},
					    {label : '当天新增自营用户',name : 'proSelf',sortable:false},
					    {label : '各区域当天新增用户',name : 'allNum',sortable:false}
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
						rowNum:50
					//pager : "#openaccount_parentRegion_jqGridPager"
				});
	
		var jqGrid = $page.find("#openaccount_childRegion_dataTable")
		.jqGrid(
				{
					url : $page.reqUrl + '/data/com.wboss.report.openaccount.OpenAccountSvc?m=queryOpenAccountJq.object.object',
					recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
				    datatype:'local',
					shrinkToFit:IsPC(),
				    postData :{param:JSON.stringify({statDate:$page.find("input[name='statDate']").val()})},
					colModel : [
					    {label : '地市',name : 'city',sortable:false}, 
						{label : '客户经理',name : 'principal',sortable:false}, 
						{label : '当天新增正式用户',name : 'newNormalNum',sortable:false}, 
						{label : '当天新增自营用户',name : 'newSelfEmployedNum',sortable:false},
						{label : '当天新增用户合计',name : 'allNum',sortable:false}
						],
					pager : "#openaccount_childRegion_jqGridPager"
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
			jqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			jqParentGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			return false;
		});
		
		$page.find('.btn-report-export').on('click', function(){
			var postData = jqGrid.jqGrid("getGridParam", "postData");
			var url = $page.reqUrl +'/report/com.wboss.report.openaccount.OpenAccountSvc?m=export.object.object'
			for(var i in postData){
                url += "&"+i+"="+encodeURIComponent(encodeURIComponent(postData[i]));
            }
			window.open(url);
		})
		
	}

	
	return { onCreate : onCreate, onActive : onActive };
});