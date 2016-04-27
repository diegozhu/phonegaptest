define(function (){

	function onActive($page,$relativeUrl){
		
	}
	
	function onCreate($page,$relativeUrl){
		var begin = $page.find('input[name="beginDate"]').val();
		var end = $page.find('input[name="endDate"]').val();
		
		var vnoId = model.user().vnoId();
		$page.find("input[name='vnoId']").val(vnoId);
		$page.find(".btn-report-export").prop('disabled', true);
		 $page.on('click',".btn-search",function(e){
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
				var queryParam = {province:regionName,benginDate:begin,endDate:end};
			  	postData.param = JSON.stringify(queryParam);
			  	jqGroupCity.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			});
		    
		var $table=$("#user_srecharge_province");
		var jqGroupProvince=$table.jqGrid({
			 url: $page.reqUrl + wboss.getWay + '/data/com.wboss.report.usersrecharge.UserSrechargeReportSvc?m=queryProvince.object.object',
			 datatype: 'local',
			 recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
			 colNames: ['省','支付宝充值笔数','支付宝充值应收(元)','支付宝充值实收(元)','支付宝实收占比','卡密充值笔数','卡密充值应收(元)','卡密充值实收(元)','卡密实收占比'],
			    colModel: [
				        { label: '省', name: 'province',sortable:false},
					   	{ label: '支付宝充值笔数', name: 'aliNum',sortable:false},
					   	{ label: '支付宝充值应收', name: 'aliReceivables',sortable:false},
					   	{ label: '支付宝充值实收', name: 'aliPaid',sortable:false},
					   	{ label: '支付宝实收占比', name: 'aliPer',sortable:false},
						{ label: '卡密充值笔数', name: 'cardNum',sortable:false},
						{ label: '卡密充值应收', name: 'cardReceivables',sortable:false},
						{ label: '卡密充值实收', name: 'cardPaid',sortable:false},
						{ label: '卡密实收占比', name: 'cardPer',sortable:false}
			   	    ],
			     	 onSelectRow:function(rowId){
					   		var rowId = jqGroupProvince.jqGrid('getGridParam','selrow');
					   		var data = jqGroupProvince.getRowData(rowId);
					    	//把参数传到另一个jqGrid 另一个jqGrid调用参数并刷新
					    	var postData = jqGroupCity.jqGrid("getGridParam", "postData");
							postData.param = JSON.stringify({province: data.province,benginDate:begin,endDate:end});
							jqGroupCity.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
						    },
						    loadComplete:function(data){
						    	$table.setSelection(1);
						    },
			   	 height: '200px'
			   	// pager:'user_srecharge_province_Pager'
		});
		
		$("#user_srecharge_province").jqGrid('setGroupHeaders', {
		    useColSpanStyle: true, 
		    groupHeaders:[
		    {startColumnName: 'aliNum', numberOfColumns: 4, titleText: '支付宝充值'},
		    {startColumnName: 'cardNum', numberOfColumns: 4, titleText: '卡密充值'},
		    ]  
		  });
	
	
	
		var jqGroupCity=$("#user_srecharge_city").jqGrid({
			 url: $page.reqUrl + wboss.getWay + '/data/com.wboss.report.usersrecharge.UserSrechargeReportSvc?m=queryCity.object.object',
			 datatype: 'local',
			 recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
			 colNames: ['市','支付宝充值笔数','支付宝充值应收(元)','支付宝充值实收(元)','支付宝实收占比','卡密充值笔数','卡密充值应收(元)','卡密充值实收(元)','卡密实收占比'],
			    colModel: [
			               { label: '市', name: 'city',sortable:false},
						 	{ label: '支付宝充值笔数', name: 'aliNum',sortable:false},
						   	{ label: '支付宝充值应收', name: 'aliReceivables',sortable:false},
						   	{ label: '支付宝充值实收', name: 'aliPaid',sortable:false},
						   	{ label: '支付宝实收占比', name: 'aliPer',sortable:false},
							{ label: '卡密充值笔数', name: 'cardNum',sortable:false},
							{ label: '卡密充值应收', name: 'cardReceivables',sortable:false},
							{ label: '卡密充值实收', name: 'cardPaid',sortable:false},
							{ label: '卡密实收占比', name: 'cardPer',sortable:false}
			   	    ],
			   	 height: '200px',
			   	 pager:'user_srecharge_city_Pager'
		});
		
		$("#user_srecharge_city").jqGrid('setGroupHeaders', {
		    useColSpanStyle: true, 
		    groupHeaders:[
		    {startColumnName: 'aliNum', numberOfColumns: 4, titleText: '支付宝充值'},
		    {startColumnName: 'cardNum', numberOfColumns: 4, titleText: '卡密充值'},
		    ]  
		  });
		
		$page.find('.btn-report-export').on('click', function(){
			var postData = jqGroupProvince.jqGrid("getGridParam", "postData");
			var url = $page.reqUrl + '/report/com.wboss.report.usersrecharge.UserSrechargeReportSvc?m=export.object.object'
			for(var i in postData){
                url += "&"+i+"="+encodeURIComponent(encodeURIComponent(postData[i]));
            }
			window.open(url);
		})
	}

	return { onCreate : onCreate, onActive : onActive };
});
