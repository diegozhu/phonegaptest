define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new accessPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'授权名称',
		        message: $('<div></div>').load('/admin/popwin/access.html'),
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
	                		if(!rowId && !popWin.initialData.accessId){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var rowData = popWin.$grid.jqGrid('getRowData',rowId);
	                			var data = $.extend(popWin.initialData, {accessId: rowData.accessId,accessName: rowData.accessName });
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

	
	function accessPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	accessPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	accessPopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var TYPE_OBJ ={'00A':'有效','00X':'无效','00U':'归档'};
		
		self.$grid = $("#access_dataTable").jqGrid({
			url :'/data/com.wboss.wcb.rating.config.AccessCfgSvc?m=queryAllAccessInfoByJq.object.object',
		    colModel: [
		        { label : '授权模版编号',name : 'accessId', hidden:true,key:true},
				{ label : '授权模版名称',name : 'accessName'}, 
				{ label: '授权模板描述', name: 'comments'},
		        { label: '生效时间', name: 'effDate'},
		        { label: '失效时间', name: 'expDate'},
				{ label : '状态',name : 'status',formatter:function(cellValue, options, rowObject){
					return TYPE_OBJ[cellValue];
				}}	,
				{ name: 'vnoId', hidden:true},
		        { label: '虚拟运行商', name: 'vnoName',sortable:false}
		    ],
		    loadComplete:function(data){
		    	self.$grid.jqGrid('setSelection', self.initialData.accessId);
		    },
		    pager: "#access_jqGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({accessName: $page.find('input[name="accessName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});