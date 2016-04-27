define(function (){

	function onActive($page,$relativeUrl){
		
	}
	
	function onCreate($page,$relativeUrl){
		$page.find(".btn-report-export").prop('disabled', true);
		$page.on('click',".btn-search",function(e){
			var vnoId = model.user().vnoId();
			$page.find(".btn-report-export").prop('disabled', false);
			var begin = $page.find('input[name="beginDate"]').val();
			var end = $page.find('input[name="endDate"]').val();
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
			var regionName=$page.find('input[name="regionName"]').val();
			var postData = jqGroupCity.jqGrid("getGridParam", "postData");
			var postData2 = jqGrid.jqGrid("getGridParam", "postData");
			var queryParam = {vnoId:vnoId,province:regionName,beginDate:begin,endDate:end};
		  	postData.param = JSON.stringify(queryParam);
		  	postData2.param = JSON.stringify(queryParam);
		  	jqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
		  	jqGroupCity.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
		});
		
		var $table = $page.find("#unicom_bill_Province");
		var jqGrid=$table.jqGrid({
			 url: $page.reqUrl +wboss.getWay + '/data/com.wboss.report.unicombill.UnicomBillReportSvc?m=queryPrivince.object.object',
			 datatype: 'local',
			 colNames: ['省','出账用户数','无出账用户数','当月开户无出帐用户','出账用户数','无出账用户数','有出账系统无记录用户'],
			 recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
			    colModel: [
				        { label: '省', name: 'province',sortable:false},
					   	{ label: '出账用户数', name: 'usedischarge',sortable:false},
					   	{ label: '无出账用户数', name: 'usednocharge',sortable:false},
					   	{ label: '当月开户无出帐用户', name: 'monthusednocharge',sortable:false},
					   	{ label: '出账用户数', name: 'nousedischarge',sortable:false},
					   	{ label: '无出账用户数', name: 'nousednocharge',sortable:false},
					   	{ label: '有出账系统无记录用户', name: 'monthusednocharge1',sortable:false}
			   	    ],
			   	 onSelectRow:function(rowId){
			   		var rowId = jqGrid.jqGrid('getGridParam','selrow');
			   		var data = jqGrid.getRowData(rowId);
			   		var beginTime=$page.find("input[name='beginDate']").val();
			   		var endTime=$page.find("input[name='endDate']").val();
			   		
			    	//把参数传到另一个jqGrid 另一个jqGrid调用参数并刷新
			    	var postData = jqGroupCity.jqGrid("getGridParam", "postData");
					postData.param = JSON.stringify({province: data.province,beginDate:beginTime,endDate:endTime});
					jqGroupCity.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
				    },
				    loadComplete:function(data){
				    	$table.setSelection(1);
				    },
			   	  //  pager:"#unicom_bill_jqGridPager",
			   	 height: '100px'
		});
		
		$("#unicom_bill_Province").jqGrid('setGroupHeaders', {
		    useColSpanStyle: true, 
		    groupHeaders:[
		    {startColumnName: 'usedischarge', numberOfColumns: 2, titleText: '有使用记录用户'},
		    {startColumnName: 'nousedischarge', numberOfColumns: 2, titleText: '无使用记录用户'},
		    ]  
		  });
		
		
		
		var jqGroupCity=$("#unicom_bill_city").jqGrid({
			 url: $page.reqUrl + wboss.getWay + '/data/com.wboss.report.unicombill.UnicomBillReportSvc?m=queryCity.object.object',
			 datatype : 'local',
			 recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
			 colNames: ['市','出账用户数','无出账用户数','当月开户无出帐用户','出账用户数','无出账用户数','有出账系统无记录用户'],
			    colModel: [
				        { label: '市', name: 'city',sortable:false},
				    	{ label: '出账用户数', name: 'usedischarge',sortable:false},
					   	{ label: '无出账用户数', name: 'usednocharge',sortable:false},
					   	{ label: '当月开户无出帐用户', name: 'monthusednocharge',sortable:false},
					   	{ label: '出账用户数', name: 'nousedischarge',sortable:false},
					   	{ label: '无出账用户数', name: 'nousednocharge',sortable:false},
					   	{ label: '有出账系统无记录用户', name: 'monthusednocharge1',sortable:false}
			   	    ],
			   	    pager:"#unicom_bill_city_jqGridPager",
			   	 height: '100px'
		});
		
		$("#unicom_bill_city").jqGrid('setGroupHeaders', {
		    useColSpanStyle: true, 
		    groupHeaders:[
		    {startColumnName: 'usedischarge', numberOfColumns: 2, titleText: '有使用记录用户'},
		    {startColumnName: 'nousedischarge', numberOfColumns: 2, titleText: '无使用记录用户'},
		    ]  
		  });
		
		$page.find('.btn-report-export').on('click', function(){
			var postData = jqGrid.jqGrid("getGridParam", "postData");
			var url =$page.reqUrl +  '/report/com.wboss.report.unicombill.UnicomBillReportSvc?m=export.object.object'
			for(var i in postData){
                url += "&"+i+"="+encodeURIComponent(encodeURIComponent(postData[i]));
            }
			window.open(url);
		})
		
		
		
		
	
	}

	return { onCreate : onCreate, onActive : onActive };
});
