define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new alarmDefinePopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'监控名称',
		        message: $('<div></div>').load('/admin/popwin/alarmdefine.html'),
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
	                		if(!rowId && !popWin.initialData.infoDefineCode){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var rowData = popWin.$grid.jqGrid('getRowData',rowId);
	                			var data = $.extend(popWin.initialData, {infoDefineCode: rowData.infoDefineCode,infoDefineName: rowData.infoDefineName });
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

	
	function alarmDefinePopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	alarmDefinePopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	alarmDefinePopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var TYPE_OBJ ={};
		
		self.$grid = $("#alarm_define_dataTable").jqGrid({
			url :'/data/com.wboss.iom.monitor.MonitorInfoDefineSvc?m=queryMonitorInfoDefineListJq.object.object',
		    colModel: [
		        {label : '监控信息编码',name : 'infoDefineCode',key:true},
				{label : '监控信息名称',name : 'infoDefineName'}, 
				{label : '监控信息描述',name : 'infoDefineDesc'},
				{label : '设备类型',name : '_eqType'}
		    ],
		    loadComplete:function(data){
		    	self.$grid.jqGrid('setSelection', self.initialData.infoDefineCode);
		    },
		    pager: "#alarm_define_jqGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({infoDefineName: $page.find('input[name="infoDefineName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});