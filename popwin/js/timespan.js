define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new TimeSpanPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'请选择时段策略',
		        message: $('<div></div>').load('/admin/popwin/timespan.html'),
		        onshown : function(){
					popWin.init(cb);      	
		        },
		        onhide:function(){
	            	popWin = null;
		        },
		        buttons : [
		        	{
		                label: '确定',
		                action: function(dialog) {
		                	var e = popWin.events['ok'];
		                	var rowId = popWin.$grid.jqGrid('getGridParam','selrow');
	                		if(!rowId && !popWin.initialData.timeSpanId){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var rowData = popWin.$grid.jqGrid('getRowData',rowId);
	                			var data = $.extend(popWin.initialData, {timeSpanId: rowData.timeSpanId,timeSpanName: rowData.timeSpanName });
	                			for(var i in e){
			                		typeof e[i] == "function" && e[i](data,'ok');
			                	}
			                    popWin.$dialog.close();
	                		}
	                	}
		            }, {
		                label: '取消',
		                action: function(dialog) {
		                	var e = popWin.events['cancel'];
		                	for(var i in e){
		                		typeof e[i] == "function" && e[i](popWin.data,'cancel');
		                	}
		                   	popWin.$dialog.close();
		                }
		            }
	
		        ]
		    });
		    return popWin;
		}
	};

	
	function TimeSpanPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	TimeSpanPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}
	
	var weekOBJ={'0':'周日','1':'周一','2':'周二','3':'周三','4':'周四','5':'周五','6':'周六'};
	
	TimeSpanPopWin.prototype.init = function(cb){
		var $form = $(".popwin_timespan").find(".detail_form");
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var TYPE_OBJ ={};
		//查询类型字典
		sysparam.call('getDicData',['DIC_TIEM_SPAN_TYPE'],function(res){
			for(var i in res){
				TYPE_OBJ[res[i].dicValue] = res[i].dicValueName
			}
		});
		
		self.$grid = $("#time_span_dataTable").jqGrid({
		    url: wboss.getWay + '/data/com.wboss.wcb.rating.config.TimeSpanCfgSvc?m=queryTimeSpanList4Jq.object.object',
			//多选
		//	multiselect: true,
		    colModel: [
		        {name:"timeSpanId",key:true,hidden:true},
		        { label: '时段名称', name: 'timeSpanName'},
		        { label: '时段类型', name: 'timeSpanType', formatter: function (value){ return TYPE_OBJ[value];}},
		        { label: '时段描述', name: 'comments'},
		        { label: '开始时间', name: 'beginTime',
		        	formatter : function (cellValue, options, row){
		        		if(row.timeSpanType == 'DAY'){
		        			return cellValue.toDate().toString("HH:mm:ss");
		        		}
		        		if(row.timeSpanType == 'MON'){
		        			return cellValue.toDate().getDate()+ "号 "+ cellValue.toDate().toString("HH:mm:ss");
		        		}
		        		if(row.timeSpanType == 'WEK'){  					
		        			return weekOBJ[cellValue.toDate().getDay()] +' '+ cellValue.toDate().toString("HH:mm:ss");
		        		}
		        	}
		        },
		        { label: '结束时间', name: 'endTime',
		        	formatter: function (cellValue, options, row){
		        		if(row.timeSpanType == 'DAY'){
		        			return cellValue.toDate().toString("HH:mm:ss");
		        		}
		        		if(row.timeSpanType == 'MON'){
		        			return cellValue.toDate().getDate()+ "号 "+ cellValue.toDate().toString("HH:mm:ss");
		        		}
		        		if(row.timeSpanType == 'WEK'){  					
		        			return weekOBJ[cellValue.toDate().getDay()] +' '+ cellValue.toDate().toString("HH:mm:ss");
		        		}
		        	}
		        },
		        { label:'企业名称', name: 'vnoName',sortable:false}
		    ],
		    loadComplete:function(data){
		    	self.$grid.jqGrid('setSelection', self.initialData.timeSpanId);
		    	//self.$grid.jqGrid('setSelection', self.initialData.timeSpanId);
//		    	if(data.timeSpanId==""){
//		    		return;
//		    	}
//		    	var timeSpanId = self.initialData.timeSpanId;
//		    	if(timeSpanId!=""){
//			    	var timeSpanIds=timeSpanId.split(",");
//			    	for(var i=0;i<timeSpanIds.length;i++){
//			    		self.$grid.jqGrid('setSelection',timeSpanIds[i]);
//			    	}
//		    }
		    },
//		    beforeSelectRow: function (rowid, e) {
//		    	var isShow = $form.status() === 'show',
//		    	box = $($(e.target).closest('td')[0]).find('input[type="checkbox"]');
//		    	box.attr('checked', !isShow);
//		        return !isShow;  
//		    },
		    pager: "#time_span_jqGridPager",
		    height: '300px'
		});
		
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({timeSpanName: $page.find('input[name="timeSpanName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});