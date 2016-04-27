define(function (){
	
	function onActive($page,$relativeUrl){
		
	}
	function onCreate($page,$relativeUrl){
		var begin = $page.find("input[name='date']").datetimepicker({ format: 'YYYY-MM-DD'});
		var end = $page.find("input[name='endDate']").datetimepicker({ format: 'YYYY-MM-DD'});
		var $table = $page.find("#ap_stat_dataTable");
		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
		var myDate = new Date();
		var defaultdateymd = myDate.toString('yyyy-MM-dd');
		var defaultdateym = myDate.toString('yyyy-MM');
		$page.find('input[name="vnoName"]').val(vnoName);
		$page.find('input[name="vnoId"]').val(vnoId);
		var $begin = $page.find('input[name="date"]'), $end = $page.find('input[name="endDate"]');
		$begin.val(defaultdateymd);
		$end.val(defaultdateymd);
		//按日按月查询change事件
		$page.find(".statByUnitTime").change(function(){
			var tempdate = $begin.val();
			if(this.value == "true"){
				begin.data('DateTimePicker').format('YYYY-MM-DD');
				end.data('DateTimePicker').format('YYYY-MM-DD');
				var tempdateymd = tempdate.toString()+"-01";
				$begin.val(tempdateymd);
				$end.val(tempdateymd);
			}else if(this.value == "false"){
				begin.data('DateTimePicker').format('YYYY-MM');
				end.data('DateTimePicker').format('YYYY-MM');
				var tempdateym = tempdate.substring(0,7).toString();
				$begin.val(tempdateym);
				$end.val(tempdateym);
			}
		});
		
		//时间控件的change时间
		$page.find("input[name='date']").change(function(){
			var $time = $page.find("input[name='date']").val();
			if($time==""){
				$end.val("");
			}else{
				$end.val($time);
			}
		})
		
		//时间控件blur事件
		$page.find("input[name='date']").blur(function(){
			var $time = $page.find("input[name='date']").val();
			if($time==""){
				 $page.find("input[name='endDate']").val("");
			}else{
				 $page.find("input[name='endDate']").val($time);
			}
		})
		
		$page.find(".btn-query").click(function(){
			var isBySubVno = $("input[type='checkbox']").is(':checked');
			var postData = jqGrid.jqGrid("getGridParam", "postData");
			var queryParam = {statByUnitTime: $page.find(".statByUnitTime > option:selected").val(),
							  date: $page.find("input[name='date']").val(),
							  endDate: $page.find("input[name='endDate']").val(),
							  vnoId: $page.find("input[name='vnoId']").val(),
							  isBySubVno:isBySubVno};
		  	postData.param = JSON.stringify(queryParam);
			jqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
		})
		
		var jqGrid = $table.jqGrid({
			url : wboss.getWay + '/data/com.wboss.wcb.report.ApLoadReportSvc?m=queryAploadStatList.object.object',
			postData : {param:JSON.stringify({vnoId:vnoId,isBySubVno:'true',date:$begin.val(),endDate:$end.val(),statByUnitTime:'true'})},
			colModel : [{label : 'APMac',name : 'apMac',sortable:false},
			            {label : 'Ap名称',name : 'apName',sortable:false},
			            {name : "vnoId",hidden:true,sortable:false},
			            {label : '企业名称',name : 'vnoName',sortable:false},
			            {label : '时长',name : '_sumduration',sortable:false},
			            {label : '总流量',name : '_sumtraffic',sortable:false},
			            {label : '登录人次',name : '_sumcust',sortable:false}
			           ],
		    pager: "#ap_stat_jqGridPager"
		});
	}
	return { onCreate : onCreate, onActive : onActive };
});