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
			
			$page.find(".btn-search").click(function(){
				var end = $page.find('input[name="endTime"]').val();
			    if(end==''){
					BootstrapDialog.warning("日期不能为空！");
					return false;
				}
			    var endTime = $page.find("input[name='endTime']").val();
				var vnoId = $page.find("input[name='vnoId']").val();
				var postData = jqGrid.jqGrid("getGridParam", "postData");
				var queryParam = {endTime:endTime, vnoId:vnoId};
				postData.param = JSON.stringify(queryParam);
				jqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]);
			    
			});
			
			var jqGrid = $page.find("#enterprisetype_dataTable").jqGrid({
			    url: '/data/com.wboss.report.userstat.UserTypeReportSvc?m=selectUserTypeList.object.object',
			    datatype:'local',
			    recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
			    colNames: ['自营', 'SI', '自营+SI', '免费', 'ICT', '空', '体验用户数', '总数'],
			    colModel: [
			        { name: 'sumOfSelf',sortable:false},
			        { name: 'sumOfSi',sortable:false},
			        { name: 'sumOfSelfSi',sortable:false},
			        { name: 'sumOfFree',sortable:false},
			        { name: 'sumOfIct',sortable:false},
			        { name: 'sumOfEmp',sortable:false},
			        { name: 'sumOfExper',sortable:false},
			        { name: 'total',sortable:false}
			    ],
			    height: '200px'
			    //pager: "#enterprisetype_jqGridPager"
			});
			
			$page.find('.btn-report-export').on('click', function(){
				var postData = jqGrid.jqGrid("getGridParam", "postData");
				var url = $page.reqUrl + '/report/com.wboss.report.userstat.UserTypeReportSvc?m=export.object.object';
				for(var i in postData){
	                url += "&"+i+"="+encodeURIComponent(encodeURIComponent(postData[i]));
	            }
				window.open(url);
			})
	}
	return { onCreate : onCreate, onActive : onActive };
});