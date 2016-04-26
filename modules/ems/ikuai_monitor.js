define(function(){
	var ikm= new Service("com.wboss.wcb.auth.authmgr.IkuaiMonitorInfoSvc");
	var vnoList= new Service("com.wboss.wcb.admin.vnomgr.VnoListSvc");
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	var ikai = new Service("com.wboss.iom.monitor.IkuaiCollectorSvc");

	function onActive($page,$relativeUrl){
		
	}
	
	function onCreate($page,$relativeUrl){
		
		sysparam.call('getDicData',['DIC_STATUS'],function(res){
			var dom = "";
			for(var i in res){
				dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
			}
			$page.find("select[name='status']").append(dom);
		});
		
		$page.find('.vno_search .btn-search').on("click",function(e){
			$tree.jstree("refresh");
		});
		
		$page.find('.online_monitor li').not(':first').on('click',function(e){
			$(e.currentTarget).parent().children('.active').removeClass('active');
			var qryStatus = $(e.currentTarget).addClass('active').data('status');
			var dataList = [];
		 	if(qryStatus == 'all'){
		 		dataList = iKuaiAllInfoArray;
		 	}else{
		 		var requiredStatus = qryStatus == 'online' ? 0 : 1;
		 		for(var i in iKuaiAllInfoArray){
		 			if(iKuaiAllInfoArray[i].onlineStatus == requiredStatus){
		 				dataList.push(iKuaiAllInfoArray[i]);
		 			}
		 		}
		 	}
        	jqGrid3.clearGridData().jqGrid('setGridParam',{ data:dataList}).trigger("reloadGrid", [{ page: 1}]);
		});

		var $ikForm=$page.find(".ik-form");
		var $alForm=$page.find(".al-form");
		var $acForm=$page.find(".ac-form");
		var idcaches =[];
		var $tree = $page.find('.org-vno-tree').jstree({
		    'core' : {
		    	multiple : true,
		        data : 
		        	function(node,cp){
						var vo = $page.find('.vno_search').serializeObject();
		        		var all = false;
		        		for(var i in vo){
		        			if(vo[i] != "" && vo[i] != undefined){
		        				all = true;
		        				break;
		        			}
		        		}
		        		var vo = $page.find('.vno_search').serializeObject();
		        		vo.parentVnoId = node.id == "#" ? null : node.id;

		        		if(all){
							vnoList.call("queryVnoList4jsTreeAll",[vo],function(data){
			        			var idMapping = [];
			        			for(var i in data){
			        				idMapping.push(data[i].vnoId);
			        			}
			        			for(var i in data){
				        			var d = data[i];
				        			d.id = d.vnoId+"";
				        			d.text = d.vnoName;
				        			d.parent = (d.parentVnoId == undefined || idMapping.indexOf(d.parentVnoId) == -1 ) ? "#" : d.parentVnoId+"";
				        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
				        			d.children = false;
			        			}
			        			cp(data);
			        		});
		        		}else{
		        			vnoList.call("queryVnoList4jsTreeLazy",[vo],function(data){
			        			for(var i in data){
				        			var d = data[i];
				        			d.id = d.vnoId+"";
				        			d.text = d.vnoName;
			        				d.parent = d.parentVnoId == undefined ? "#" : (idcaches.indexOf(d.parentVnoId) == -1 ? "#" : d.parentVnoId+"");
				        			d.children = d.leafNum > 0;
				        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
				        			idcaches.push(d.vnoId);
			        			}
			        			cp(data);
			        		});
		        		}      		     		
		        	}
		    	},
			plugins : [
				"search", 
				"sort", 
				"types",
				"state"
			],
			types : {
		      "default" : {
		        "icon" : "glyphicon glyphicon-th-list"
		      },
		      "leaf" : {
		        "icon" : "glyphicon glyphicon-home"
		      }
		    },
		 	"state" : { "key" : "model_vno" }});
		
		var iKuaiAllInfoArray = [];
		function updateIkai(vnoId){
			 ikai.call('getIkuaiHttpInfo',[jqGrid3.jqGrid("getGridParam",'postData'),{vnoId:vnoId}],function(d){
			 	iKuaiAllInfoArray = d.rows;
			 	var qryStatus = $page.find('.online_monitor .active').data('status') || 'all';
			 	var dataList = [];
			 	if(qryStatus == 'all'){
			 		dataList = iKuaiAllInfoArray;
			 	}else{
			 		var requiredStatus = qryStatus == 'online' ? 0 : 1;
			 		for(var i in iKuaiAllInfoArray){
			 			if(iKuaiAllInfoArray[i].onlineStatus == requiredStatus){
			 				dataList.push(iKuaiAllInfoArray[i]);
			 			}
			 		}
			 	}
			 	var offline = 0;  // offline status is 1
			 	for(var i in iKuaiAllInfoArray)
			 		offline += (iKuaiAllInfoArray[i].onlineStatus || 0);
            	jqGrid3.clearGridData().jqGrid('setGridParam',{ data:dataList}).trigger("reloadGrid", [{ page: 1}]);
            	$page.find('.allData').html(d.records);
		    	$page.find('.offlineData').html(offline);
		    	$page.find('.onlineData').html(d.records-offline);
		    	
            });
		}

		var vnoId;
		$tree.on("select_node.jstree", function(e, data){
            var originalData = data.node.original;
            $page.find('input[name="vnoId"]').val(originalData.vnoId);   
            //爱快传值序列化
            var postData1 = jqGrid.jqGrid("getGridParam", "postData");
            postData1.param = JSON.stringify($ikForm.serializeObject());
            jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
            //告警传值序列化
            var postdata2 = jqGrid2.jqGrid("getGridParam", "postData");
            postdata2.param = JSON.stringify($alForm.serializeObject());
            jqGrid2.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
             //在线
            vnoId=originalData.vnoId;
           	updateIkai(originalData.vnoId);
           	
           	var postdata4 = jqGrid4.jqGrid("getGridParam", "postData");
            postdata4.param = JSON.stringify({vnoId:vnoId,beginDate:cDate});
            jqGrid4.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
        });		
			
			//获得初始日期
			var createDate=$ikForm.find("input[name='createDate']").val();
			var $table1 = $("#ems_ikuai_monitor_dataTable");
			var jqGrid = $table1.jqGrid({
				url: wboss.getWay + '/data/com.wboss.iom.monitor.IkuaiMonitorInfoSvc?m=queryIKminfoVo4jList.object.object',
				postData:{param:JSON.stringify({createDate:createDate,vnoId:vnoId})},
				colModel:[
				          {name:'acId',hidden:true},
				          {label:"设备名称",name:'name'},
				          {label:"网关ID",name:'gwId'},
				          {label:"企业名称",name:'vnoName',sortable:false},
				          {label:"出口公网",name:'reflexiveAddress'},
				          {label:"状态",name:'status'},
				          {label:"创建日期",name:'createDate'},
				          ],
				          ondblClickRow:function(rowId){
				        	 var data = jqGrid.griddata.rows[rowId-1];
				        	 var content= 
			        	 			"<table><tr><td>设备名称：</td><td>"+data.name+"</td><tr>"+
			        	 			"<tr><td>运营商：</td><td>"+data.vnoName+"</td><tr>"+
			        	 			"<tr><td>网关ID：</td><td>"+data.gwId+"</td><tr>"+
			        	 			"<tr><td>CPU：</td><td>"+string(data.miCpu)+"</td><tr>"+
			        	 			"<tr><td>磁盘：</td><td>"+string(data.miDisk)+"</td><tr>"+
			        	 			"<tr><td>内存状况：</td><td>"+string(data.miMem)+"</td><tr>"+
			        	 			"<tr><td>出口公网：</td><td>"+string(data.reflexiveAddress)+"</td><tr>"+
			        	 			"<tr><td>上行流量：</td><td>"+string(data.miUpstream)+"</td><tr>"+
			        	 			"<tr><td>下行流量：</td><td>"+string(data.miDownstream)+"</td><tr>"+
			        	 			"<tr><td>用户是否下线：</td><td>"+string(data.miUserOffline)+"</td><tr>"+
			        	 			"<tr><td>AP上线：</td><td>"+string(data.apOnline)+"</td><tr>"+
			        	 			"<tr><td>Ap下线：</td><td>"+string(data.apOffline)+"</td><tr>"+
			        	 			"<tr><td>状态：</td><td>"+string(data.status)+"</td><tr>"+
			        	 			"<tr><td>创建日期：</td><td>"+data.createDate+"</td><tr></table>";
			        	 			
				        	  BootstrapDialog.show({
				                  title: '爱快路由器监控信息',
				                  message:$("<div></div>").append(content),
				                  buttons: [{
				                      label: '取消',
				                      action: function(dialog) {
				                          dialog.close();
				                      }
				                  }]
				              });
				          },
					    
					   	loadComplete:function(data){
					   		if(data.rows!=null && data.rows.length!=0 )
					   		jqGrid.griddata = data;
					    	
					    },
					    pager: "#ems_ikuai_monitor_jqGridPager"
			});
			//监控警告
			var $table2 = $("#ems_monitor_alarm_dataTable");
			//判断是否为null
			function string(data){
				if(data==null){
					return "";
				}
				return data;
			}
			var STATUS={'00A':'有效', '00X':'失效','00U':'已经处理'};
			//获得初始日期
			var date=$alForm.find("input[name='createDate']").val();
			 var jqGrid2 = $table2.jqGrid({
				url: wboss.getWay + '/data/com.wboss.iom.monitor.MonitorAlarmInfoSvc?m=queryMAIinfoVo4jList.object.object',
				postData:{param:JSON.stringify({createDate:date,vnoId:vnoId})},
				colModel:[
				          {name:'alarmInfoId',hidden:true},
				          {label:"设备类型",name:'eqType',hidden:true},
				          {label:"设备名称",name:'acName'},
				          {label:"监控信息名称",name:'infoDefineName'},
				          {label:"网关ID",name:'gwId'},
				          {label:"企业名称",name:'vnoName',sortable:false},
				          {label:"创建日期",name:'createDate'},
				          {label:"状态日期",name:'statusDate'},
				          {label:"状态",name:'_status'}
				          ],
				          ondblClickRow:function(rowId){
				        	 var data = jqGrid2.griddata.rows[rowId-1];       	 
				        	 var content= 
			        	 			"<table><tr><td>设备类型：</td><td>"+data.eqType+"</td><tr>"+
			        	 			"<tr><td>设备名称：</td><td>"+data.acName+"</td><tr>"+
			        	 			"<tr><td>企业名称：</td><td>"+data.vnoName+"</td><tr>"+
			        	 			"<tr><td>状态：</td><td>"+STATUS[data.status]+"</td><tr>"+
			        	 			"<tr><td>网关ID：</td><td>"+data.gwId+"</td><tr>"+
			        	 			"<tr><td>告警值：</td><td>"+string(data.alarmValue)+"</td><tr>"+
			        	 			"<tr><td>监控信息名称：</td><td>"+data.infoDefineName+"</td><tr>"+
			        	 			"<tr><td>监控信息编码：</td><td>"+data.infoDefineCode+"</td><tr>"+
			        	 			"<tr><td>监控信息名称：</td><td>"+data.createDate+"</td><tr>"+
			        	 			"<tr><td>监控信息名称：</td><td>"+data.statusDate+"</td><tr></table>";
				        	
				        	  BootstrapDialog.show({
				                  title: '监控告警信息',
				                  message:$("<div></div>").append(content),
				                  buttons: [{
				                      label: '取消',
				                      action: function(dialog) {
				                          dialog.close();
				                      }
				                  }]
				              });
				        }, 
					   	loadComplete:function(data){
					   		if(data.rows!=null && data.rows.length!=0 )
					   		jqGrid2.griddata = data;
					    },
					    pager: "#ems_monitor_alarm_jqGridPager"
			});
			 	
				$page.find('.btn-searchIK').on("click",function(e){
					createDate=$ikForm.find("input[name='createDate']").val();
					var tData = $table1.jqGrid("getGridParam", "postData");
					tData.param = JSON.stringify({
						createDate:createDate,
						gwId: $ikForm.find('input[name="gwId"]').val(),
						name:$ikForm.find('input[name="name"]').val(),
						vnoId:vnoId
						});
					$table1.jqGrid("setGridParam", {search:true}).trigger("reloadGrid",[{ page: 1}]); 
				});
				
				$page.find('.btn-searchIM').on("click",function(e){
					date=$alForm.find("input[name='createDate']").val();
					var pData = $table2.jqGrid("getGridParam", "postData");
					pData.param = JSON.stringify({
						createDate:date,
						acName:$alForm.find('input[name="acName"]').val(),
						gwId: $alForm.find('input[name="gwId"]').val(),
						status:$alForm.find('.status_selector').val(),
						vnoId:vnoId
						});
					$table2.jqGrid("setGridParam", {search:true}).trigger("reloadGrid",[{ page: 1}]); 
				});
				
				
			 $(".ik").click(function(){
				 var width = $page.find(".alarm_div").width();
				 //form左右内边距15，计算需要减30,获取form的父类div的width
				 $page.find("#ems_ikuai_monitor_dataTable").setGridWidth(width-30);
				
			 });
			  $(".al").click(function(){
				 var width = $page.find(".alarm_div").width();
				 $page.find("#ems_monitor_alarm_dataTable").setGridWidth(width-30);
			 });
			 $(".ikonline").click(function(){
				 var width = $page.find(".alarm_div").width();
				 $page.find("#ems_ikuai_monitor_online_dataTable").setGridWidth(width-30);
			 });
			 
			 $(".acinfo").click(function(){
				 var width = $page.find(".alarm_div").width();
				 $page.find("#ems_ac_info_dataTable").setGridWidth(width-30);
			 });
			  
			var jqGrid3 = $("#ems_ikuai_monitor_online_dataTable").jqGrid({
			  		data:[],
					colModel:[{label:"设备名称",name:'name'},
					          {label:"网关ID",name:'gwId'},
					          {label:"企业名称",name:'vnoName',sortable:false},
					          {label:"出口公网",name:'reflexiveAddress'}
					      ],
					datatype:'local',
				    pager: "#ems_ikuai_monitor_online_jqGridPager"       
			});
			var $table4 = $("#ems_ac_info_dataTable");
			var cDate=$acForm.find("input[name='createDate']").val();
			var jqGrid4 = $table4.jqGrid({
		  		url: wboss.getWay + '/data/com.wboss.wcb.auth.authmgr.IkuaiAcSvc?m=jqIkuaiAcVoLsit.object.object',
		  		datatype:'json',
		  		postData:{param:JSON.stringify({beginDate:cDate})},
				colModel:[
				          {name:'acId',hidden:true},
				          {label:"路由名称",name:'acName'},
				          {label:"网关ID",name:'gwId'},
				          {label:"企业名称",name:'vnoName',sortable:false},
				          {label:"状态",name:'_status'},
				          {label:"在线时长",name:'_onlineDuration'},
				          {label:"离线次数",name:'offLineCount'},
				          {label:"最后上线时间",name:'lastOnlineTime'},
				         ],
			    pager: "#ems_ac_info_jqGridPager"       
		});
			
			
			
		$page.find(".btn-searchAC").on("click",function(){
			cDate=$acForm.find("input[name='createDate']").val();
			var pData = $table4.jqGrid("getGridParam", "postData");
			pData.param = JSON.stringify({
				beginDate:cDate,
				vnoId:$acForm.find("input[name='vnoId']").val()
				});
			$table4.jqGrid("setGridParam", {search:true}).trigger("reloadGrid",[{ page: 1}]); 
			
		})	
			//在线爱快路由信息刷新
			$page.find(".btn-refresh").on("click",function(){
				updateIkai(vnoId);
				var refreshDate = new Date();
				$page.find(".refreshTime").html(refreshDate);
				return false;
			})
			
			//在线爱快路由信息定时刷新
			var handler;
			$page.find(".ck-refresh").click(function(){
				//定义在里面每次都新new了一个
				if(this.checked==true){
				    handler = setInterval(function(){
						   updateIkai(vnoId);
                var refreshDate = new Date();
				$page.find(".refreshTime").html(refreshDate);		   
						},1000*60*5);
				}else{
					clearInterval(handler);
				}
				
			});
			
			updateIkai();
	}
	
	
	return { onCreate : onCreate, onActive : onActive };
});