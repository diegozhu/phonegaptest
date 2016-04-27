define(function (){
	var data = {'statDay':[],'dayIncreaseUser':[],'dayRestrictUser':[], 'allRestrictUser':[], 
			'allUser':[],'onlineUser':[], 'topOnlineUser':[], 'duration':[],'traffic':[]};
	//存图标的对象
	
	
	var cbSvc= new Service('com.wboss.wcb.auth.report.ComBusiStatSvc');
	var defOpt = {
		chart: {type: 'spline', tickInterval: 10,width: 1175,height:560,zoomType: 'xy',panning: true,panKey: 'shift',
			plotBackgroundImage: 'http://www.highcharts.com/samples/graphics/sand.png'},
		plotOptions: { column: { pointPadding: 0.2, borderWidth: 0 }}
	};

	
	//每一个图表对应一个div 
	var chartsOpt = {
		'statUser': {title:{text:'用户业务'},tooltip: {valueSuffix: '个'},legend:{ itemDistance: 100},
			scrollbar: {enabled: true},chart: {		
            renderTo: 'un_manager_statUser',  marginLeft: 100}, subtitle: {text: '--UserBS'}, 
			yAxis: [ {title: { text: '数量(个)'},lineWidth: 1,min: 0},{min: 0,title: { text: '数量(个)'},  lineWidth: 1,opposite: true}]},
		
		'onlineUser': {title:{text:'在线用户'},tooltip: {valueSuffix: '个'},legend:{ itemDistance: 100},chart: {
			renderTo: 'un_manager_onlineUser', marginLeft: 150}, subtitle: {text: '--OnlineUser'}, 
			yAxis: [ {title: { text: '数量(个)'},lineWidth: 1,min: 0},{min: 0,title: { text: '数量(个)'},  lineWidth: 1,opposite: true}]},
			
		'time': {title:{text:'在线时长'},tooltip: {valueSuffix: '分钟'},chart: {
			renderTo: 'un_manager_time', marginLeft: 150}, subtitle: {text: '--OnlineTime'}, 
			yAxis: [ {title: { text: '时长(分钟)'},lineWidth: 1,min: 0},{min: 0,title: { text: '时长(分钟)'},  lineWidth: 1,opposite: true}]},
			
		'traffic': {title:{text:'用户流量'},tooltip: {valueSuffix: 'M'},chart: {
			renderTo: 'un_manager_traffic', marginLeft: 150}, subtitle: {text: '--Traffic'}, 
			yAxis: [ {title: { text: '流量(M)'},lineWidth: 1,min: 0},{min: 0,title: { text: '流量(M)'},  lineWidth: 1,opposite: true}]},
//un_manager_traffic
	};

	function onActive($page,$relativeUrl){
		
	}
	
	function onCreate($page,$relativeUrl){
		//一开始放在define里，当页面关闭时，变量没有清空，所以还是有值
		var charts={};
		var vnoId = model.user().vnoId();
		var vnoName = model.user().vnoName();
		$page.find("input[name='vnoId']").val(vnoId);
		$page.find("input[name='vnoName']").val(vnoName);
		var $table=$("#stat_op_stat_dataTable");
		var endDate=$page.find("input[name='endDate']").val();
		var jqGrid = $table.jqGrid({
		    url: wboss.getWay + '/data/com.wboss.wcb.auth.report.ComBusiStatSvc?m=jqCBSList.object.object',
//		    shrinkToFit:false,
//		    autoScroll: true, 
		    postData:{param:JSON.stringify({beginDate: getBeginDate(endDate),endDate:endDate,checked:"false",vnoId:vnoId})},
		    colModel:[
			{label:'统计日期',name:'_statDate'},
			{label:'日增加用户',name:'dayIncreaseUser',editable:true,},
			{label:'日停机用户',name:'dayRestrictUser',hidden:true},
			{label:'总停机用户',name:'allRestrictUser',hidden:true},
			{label:'总用户',name:'allUser'},
			{label:'上线人次',name:'onlineUser'},
			{label:'峰值用户数',name:'topOnlineUser'},
			{label:'峰值时刻',name:'topOnlineDate'},
			{label:'在线时长(分钟)',name:'duration'},
			{label:'计费时长(分钟)',name:'duration',hidden:true},
			{label:'在线流量(MB)',name:'traffic'},
			{label:'企业名称',name:'vnoName',sortable:false}
			],
		   	loadComplete:function(data){
		   		if(jqGrid)
		   		jqGrid.griddata = data;
		    },
		    pager: "#stat_op_stat_jqGridPager"
		});
		
		//查询点击事件，如果点击事件没用时，直接获取value值
		$page.find('.search').on("click",function(e){
			var stat = $page.find(".search-form").serializeObject();
			var checked="false";
			if(DateDiff(stat.beginDate,stat.endDate)>30){
				 return false;
			}
			//获取checkbox是否选中，选中为true,否则false
			var $child =$page.find(".vno_child").is(':checked');
			var postData = $table.jqGrid("getGridParam", "postData");
			if($child){
				checked="true";
			}
			postData.param = JSON.stringify({
				beginDate:stat.beginDate,
				endDate: stat.endDate,
				vnoId:stat.vnoId,
				checked:checked
				});
			$table.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
		
		//计算宽度
		 $(".stat").click(function(){
			 var width = $page.find(".tab-content").width();
			 //form左右内边距15，计算需要减30,获取form的父类div的width
			 $page.find("#stat_op_stat_dataTable").setGridWidth(width*0.97);
			
		 });
		
		
		$page.find(".search").on("click",function(){
			var stat = $page.find(".search-form").serializeObject();
			if(DateDiff(stat.beginDate,stat.endDate)>30){
				 BootstrapDialog.show({
	                title: '提示',
	                message:$("<div></div>").append("两个日期差不能大于31天"),
	                buttons: [{
	                    label: '确定',
	                    action: function(dialog) {
	                        dialog.close();
	                    }
	                }]
	            });
				 return;
			}
			query(stat);
		})
		function query(stat){
			cbSvc.call('queryCBSList', [stat], function(res) {
				//清空原有数据
				for(var obj in data){data[obj] = [];}
				//封装查询结果
				for ( var i in res) {
					for(var obj in data){data[obj].push(res[i][obj]);}
				}
				
				//重画chart
				
				if(charts['statUser']){
					redraw();
					return;
				}
				//初始化chart
				initChart();
			});
		}
		//初始化图表
		function initChart(){
			//动态设置x轴
			$page.find("input[name='beginDate']").val(getBeginDate(endDate));
			var statDates={};
				var xAxis={xAxis:{categories: data['statDay']}};
				
			var statUser = {};
			var series = {series: [
			    {data: data['dayIncreaseUser'], name:'日增加用户'},
			  	{data: data['dayRestrictUser'], name:'日停机用户'},
				{data: data['allRestrictUser'], name:'总停机用户'}
			  ]};
			//拼接,把最后三个拼接到userChartOpt里面,前面加个true，不会覆盖原来
			$.extend(true, statUser, defOpt, chartsOpt['statUser'],xAxis,series);
			//获取键为statUser的chart然后进行重画
			charts['statUser'] = new Highcharts.Chart(statUser);
			
			
			var onlineUser = {};
			var series2 = {series: [
			    {data: data['allUser'], name:'总用户'},
			  	{data: data['onlineUser'], name:'上线人次'},
				{data: data['topOnlineUser'], name:'峰值用户数'}
			  ]};
			//拼接,把最后三个拼接到userChartOpt里面
			$.extend(true,onlineUser, defOpt, chartsOpt['onlineUser'],xAxis, series2);
			//获取键为statUser的chart然后进行重画
			charts['onlineUser'] = new Highcharts.Chart(onlineUser);  //不能直接重画,先把图表弄出来，再进行改
			charts['onlineUser'].redraw();
			
			var time = {};
			var series3 = {series: [
				{data: data['duration'], name:'在线时长(分钟)'}
			  ]};
			//拼接,把最后三个拼接到userChartOpt里面
			$.extend(true,time, defOpt, chartsOpt['time'], xAxis,series3);
			//获取键为statUser的chart然后进行重画
			charts['time'] = new Highcharts.Chart(time);
			charts['time'].redraw();
			
			var traffic = {};
			var series4 = {series: [{data: data['traffic'], name:'在线流量(MB)'}]};
			//拼接,把最后三个拼接到userChartOpt里面
			$.extend(true,traffic, defOpt, chartsOpt['traffic'],xAxis,series4);
			//获取键为statUser的chart然后进行重画
			charts['traffic'] = new Highcharts.Chart(traffic);
			charts['traffic'].redraw();
		}
		
		
		
		//重画
		function redraw(){
			//statUser
			var chart1 = charts['statUser'];
			var chartLength=chart1.series.length;
			for(var i = 0;i<chartLength;i++){
				try{chart1.series[0].remove(false);}catch(e){console.log(e);};
			}
			chart1.addSeries({name:'日增加用户',data: data['dayIncreaseUser']},false);
			chart1.addSeries({name:'日停机用户',data: data['dayRestrictUser']},false);
			chart1.addSeries({name:'总停机用户',data: data['allRestrictUser']},false);
			chart1.xAxis[0].setCategories(data['statDay']);
			chart1.redraw();
			//onlineUser
			var chart2 = charts['onlineUser'];
			chartLength=chart2.series.length;
			for(var i = 0;i<chartLength;i++){
				try{chart2.series[0].remove(false);}catch(e){console.log(e);};
			}
			chart2.addSeries({name:'总用户',data: data['allUser']},false);
			chart2.addSeries({name:'上线人次',data: data['onlineUser']},false);
			chart2.addSeries({name:'峰值用户数',data: data['topOnlineUser']},false);
			chart2.xAxis[0].setCategories(data['statDay']);//给图表重画x轴
			
			//time
			var chart3 = charts['time'];
			chartLength=chart3.series.length;
			for(var i = 0;i<chartLength;i++){
				try{chart3.series[0].remove(false);}catch(e){console.log(e);};
			}
			chart3.addSeries({name:'在线时长(分钟)',data: data['duration']},false);
			chart3.xAxis[0].setCategories(data['statDay']);
			//traffic
			var chart4 = charts['traffic'];
			chartLength=chart4.series.length;
			for(var i = 0;i<chartLength;i++){
				try{chart4.series[0].remove(false);}catch(e){console.log(e);};
			}
			chart4.addSeries({name:'在线流量(MB)',data: data['traffic']},false);
			chart4.xAxis[0].setCategories(data['statDay']);
			
			chart1.redraw();
			chart2.redraw();
			chart3.redraw();
			chart4.redraw();
		}
		
		var endDate=$page.find("input[name='endDate']").val();
		//求出前15天的日期
		function getBeginDate(end){
			var day=14*24*60*60*1000;
			var diff=Math.abs(end.toDate().getTime()-day);
			var date = new Date(diff).format("yyyy-MM-dd");
			return date;
		}
		
		query({beginDate: getBeginDate(endDate),endDate:endDate,vnoId:vnoId});
	}

	return { onCreate : onCreate, onActive : onActive };
});
