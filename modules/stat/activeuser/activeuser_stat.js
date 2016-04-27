define(function () {

var sysparam = new Service("com.wboss.general.param.SysParamSvc");
var online = new Service("com.wboss.report.activeuser.ActiveUserStatSvc");
function onActive($page, $relativeUrl){
}

function onCreate($page, $relativeUrl){
	
	var $form = $page.find(".detail_form");
	var $table = $("#stat_activeuser_stat_province_dataTable");
	var $table2 =$("#stat_activeuser_stat_city_dataTable");
	$page.find(".btn-report-export").prop('disabled', true);
	var vnoId = model.user().vnoId();
	$page.find(".btn-report-export").prop('disabled', true);
	
	  function DateDiff(start, end) {
		    var diff = Math.abs(end.toDate().getTime() - start.toDate().getTime());
		    var dayMil= 24*60*60*1000;
		    return parseInt(diff /dayMil); //把相差的毫秒数转换为天数
		}
	
	 $page.on('click',".btn-search",function(e){
		 	$page.find(".btn-report-export").prop('disabled', false);
			var begin = $page.find('input[name="beginDate"]').val();
			var end = $page.find('input[name="endDate"]').val();
			var regionId = $page.find('input[name="regionId"]').val();
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
			
			var postData = jqGrid.jqGrid("getGridParam", "postData");
			var postData2 = jqGrid2.jqGrid("getGridParam", "postData");
			var queryParam = {vnoId:vnoId,provinceId:regionId,regionId: regionId,beginDate:begin,endDate:end};
		  	postData.param = JSON.stringify(queryParam);
		  	postData2.param = JSON.stringify(queryParam);
			jqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			jqGrid2.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}])
			
		});
	
	var jqGrid = $table.jqGrid({
	    url: $page.reqUrl+wboss.getWay + '/data/com.wboss.report.activeuser.ActiveUserStatSvc?m=queryProvinceJqGrid.object.object',
	    datatype:'local',
	    recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
	    colNames: ['','省','日活跃用户','月活跃用户','周活跃用户'],
	    colModel:[
	    {name:'provinceId',hidden:true},          
		{name:'regionName',sortable:false},
		{name:'dayNum'},
		{name:'monNum'},
		{name:'wekNum'}
		],
		 onSelectRow:function(rowId){
		    	var data = jqGrid.griddata.rows[rowId-1];
		    	var postData = jqGrid2.jqGrid("getGridParam", "postData");
		    	if(data.regionName=='总计'){
		    		return false;
		    	}
				postData.param = JSON.stringify({isSelect:"true",vnoId:vnoId,provinceId: data.provinceId,beginDate:$page.find("input[name='beginDate']").val(),endDate:$page.find("input[name='endDate']").val()});
				jqGrid2.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
		  },
		  loadComplete:function(data){
		   		if(jqGrid)
		   		jqGrid.griddata = data;
		  },
		  height:'230px',
		  rowNum:50
	});

var jqGrid2 = $table2.jqGrid({
    url: $page.reqUrl+wboss.getWay + '/data/com.wboss.report.activeuser.ActiveUserStatSvc?m=queryCityJqGrid.object.object',
    datatype:'local',
    recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
    colNames: ['市', '日活跃用户','月活跃用户','周活跃用户'],
    colModel:[
	{name:'regionName',sortable:false},
	{name:'dayNum'},
	{name:'monNum'},
	{name:'wekNum'}
	],
    pager: "#stat_activeuser_stat_city_jqGridPager"
    });
	
	$table.jqGrid('setGroupHeaders',{
		 useColSpanStyle: true, 
		 groupHeaders:[
		 {startColumnName: 'dayNum', numberOfColumns: 3, titleText: '活跃用户数'}
		 ]  
	});
	
	$table2.jqGrid('setGroupHeaders', {
		 useColSpanStyle: true, 
		 groupHeaders:[
		 {startColumnName: 'dayNum', numberOfColumns: 3, titleText: '活跃用户数'}
		 ]  
	});

	//导出
	$page.find(".btn-report-export").on("click",function(){
		var postData = jqGrid.jqGrid("getGridParam", "postData");
		var url =  $page.reqUrl+'/report/com.wboss.report.activeuser.ActiveUserStatSvc?m=export.object.object'
		postData.param = JSON.stringify({vnoId:vnoId,provinceId:$page.find("input[name='regionId']").val(),beginDate:$page.find("input[name='beginDate']").val(),endDate:$page.find("input[name='endDate']").val()});
		for(var i in postData){
            url += "&"+i+"="+encodeURIComponent(encodeURIComponent(postData[i]));
        }
		window.open(url);
	});
	
}
return { onCreate : onCreate, onActive : onActive };
});


