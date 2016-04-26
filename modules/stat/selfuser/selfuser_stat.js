define(function (){
	function onActive($page,$relativeUrl){
		
	}
	function onCreate($page,$relativeUrl){
		var $table = $page.find("#selfuser_stat_dataTable");
		$page.find(".btn-report-export").prop('disabled', true);

		var jqGrid = $table.jqGrid({
			url :$page.reqUrl+'/data/com.wboss.report.selfuserstat.SelfUserStatReportSvc?m=selfuserStatisticsList4Jq.object.object',
			datatype : 'local',
			shrinkToFit:IsPC(),
			recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
			colModel : [{label : '用户类别',name : '_custType',sortable:false},
			            {label : '省',name : 'province',sortable:false},
			            {label : '市',name : "city",sortable:false},
			            {label : '区(县)',name : 'country',sortable:false},
                         {label : '负责人',name : 'principal',sortable:false},
			            {label : '', name : 'vnoId',hidden : true},
						{label : '企业名称',name : 'vnoName',sortable : false},
			            {label : '账号',name : 'custCode',sortable:false},
			            {label : '状态',name : '_custStatus',sortable:false},
			            {label : '开户时间',name : 'custRegDate',sortable:false},
			            {label : '充值时间',name : 'rechargeDate',sortable:false},
			            {label : '充值方式',name : 'paymentMethod',sortable:false},
			            {label : '充值时长(天)',name : 'total',sortable:false}],
		    pager: "#selfuser_stat_jqGridPager"});
		
		$page.find(".btn-query").click(function(){
			$page.find(".btn-report-export").prop('disabled', false);
		    var beginDate=$page.find("input[name='beginDate']").val();
		    var endDate=$page.find("input[name='endDate']").val();
			var regionId=$page.find('input[name="regionId"]').val();
			var regionName=$page.find('input[name="regionName"]').val();
			var principal=$page.find('input[name="principal"]').val();
			var vnoId=model.user().vnoId();
			
			if(beginDate>endDate){
				BootstrapDialog.warning("开始时间晚于结束时间,请重新选择！");
				return false;
			}
			
			if(DateDiff(beginDate,endDate)>99){
				BootstrapDialog.warning("已超过最大天数100天,请重新选择！");
				return false;
			}
			
			var postData = jqGrid.jqGrid("getGridParam", "postData");
			var queryParam = {beginDate: beginDate,endDate: endDate,regionId:regionId,regionName:regionName,principal:principal,vnoId:vnoId};
		  	postData.param = JSON.stringify(queryParam);
			jqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			return false;
		})
		
		$page.find('.btn-report-export').on('click', function(){
			var postData = jqGrid.jqGrid("getGridParam", "postData");
			var url =$page.reqUrl + '/report/com.wboss.report.selfuserstat.SelfUserStatReportSvc?m=export.object.object'
			for(var i in postData){
                url += "&"+i+"="+encodeURIComponent(encodeURIComponent(postData[i]));
            }
			window.open(url);
		})
	}
	return { onCreate : onCreate, onActive : onActive };
});