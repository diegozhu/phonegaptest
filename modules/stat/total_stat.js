define(function (){
	function onActive($page,$relativeUrl){}
	
	function onCreate($page,$relativeUrl){
		var URL_PREFIX= 'modules/stat/', REPORT_URL='',STAT_DATA=[{id: '1', name: '统计报表', parentId: null, leafNum: 5},
		               {id: '101', name: '自营用户统计', parentId: '1', url: wboss.getWay + 'selfuser/selfuser_stat'},
		               {id: '102', name: '活跃用户统计', parentId: '1', url: wboss.getWay + 'activeuser/activeuser_stat'},
		               {id: '103', name: '用户统计', parentId: '1', url: wboss.getWay + 'userstatistics/userstatistics_report'},
		               {id: '104', name: '出账统计', parentId: '1', url: wboss.getWay + 'unicombill/unicom_bill'},
		               {id: '105', name: '开户统计', parentId: '1', url: wboss.getWay + 'openaccount/openaccount_stat'},
		       //      {id: '106', name: '出账明细', parentId: '1', url: wboss.getWay + 'accountdetail/accountdetail'},
		               {id: '107', name: '开户统计汇总', parentId: '1', url: wboss.getWay + 'openaccount/openaccount_summary'},
		               {id: '108', name: '用户充值', parentId: '1', url: wboss.getWay + 'usersrecharge/user_srecharge'},
		               {id: '109', name: '用户企业类型统计', parentId: '1', url: wboss.getWay + 'enterprisetype/enterprisetype_report'}];
		
		var sysparam = new Service("com.wboss.general.param.SysParamSvc");
		sysparam.call('getReportRemoteRequestParam', [{paramCode:'REPORT_REMOTE_REQUEST_PARAM'}],function(res) {
			REPORT_URL=res;
		});
		
		var $statTree = $page.find('.total-stat-tree').jstree({
		    'core' : {
		    	multiple : true,
		        data :  function(node,cp){
		        	var data = STAT_DATA, idcaches= [];
	        		for(var i in data){
        				var d = data[i];
	        			d.id = d.id+"";
	        			d.text = d.name;
	        			d.parent = (d.parentId == undefined || idcaches.indexOf(d.parentId) == -1 ) ? "#" : d.parentId+"";
	        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
	        			idcaches.push(d.id);
        			}
        			cp(data);    		     		
	        	}
		    },
			plugins : ["search",  "sort",  "types", "state" ],
			types : {"default" : {"icon" : "glyphicon glyphicon-th-list"}, "leaf" : {"icon" : "glyphicon glyphicon-home" }},
		 	state : { "key" : "model_region" }
		});
		 
		$statTree.on("select_node.jstree", function(e, data){
          var originalData = data.node.original;
          if(originalData.url){
        	  changeStat(originalData.url);
          }
        });
		
		function changeStat(module){
			var $subPage = $page.find('.tab_page'), $reportPage = $subPage.children();
			$reportPage.remove();
			module = URL_PREFIX + module;
			require(["js/require-text!"+module+".html", "js/require-text!"+module+".css",module],function(html, css,js) {
				$subPage.append("<div class='tab_stat' >"+html+"</div>");
	            // to diabled mobile auto pop keyboard
	            $subPage.find('.input-group input.datepicker').prop("readonly",true);
	            $subPage.find('.input-group input.pop-win-controller').prop("readonly",true);
	            $subPage.find('.datepicker').each(function(i,e){
                    var $timeInput = $(e);
                    dateTimePickerOpt.defaultDate = parseDate($timeInput.data("default-value"));
                    dateTimePickerOpt.minDate = parseDate($timeInput.data("min"));
                    dateTimePickerOpt.maxDate = parseDate($timeInput.data("max"));
                    dateTimePickerOpt.format = $timeInput.data('format')|| 'YYYY-MM-DD HH:mm:ss';
                    $timeInput.datetimepicker(dateTimePickerOpt);
                });
	            $reportPage = $subPage.children();
	            $reportPage.reqUrl = REPORT_URL;
	            js.onCreate($reportPage,""); 
	        });
		}
	}
	
	return { onCreate : onCreate, onActive : onActive };
});