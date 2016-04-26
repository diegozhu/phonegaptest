define(function () {
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new StaffPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'portal主题',
		        message: $('<div></div>').load('/admin/popwin/portal_theme_id.html'),
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
	                		if(!rowId && !popWin.initialData.portalThemeId){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var rowData = popWin.$grid.jqGrid('getRowData',rowId);
	                			var data = $.extend(popWin.initialData, {portalThemeId: rowData.portalThemeId,portalThemeName: rowData.portalThemeName });
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

	
	function StaffPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	StaffPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	StaffPopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		
		self.$grid = $("#portal_acc_dataTable").jqGrid({
			url : '/data/com.wboss.wcb.admin.theme.PortalThemeSvc?m=findPortalThemeName.object.object',
		    colModel: [
		    {label : '主题标识',name : 'portalThemeId',key:true,hidden : true},
			{label : '主题名称',name : 'portalThemeName'},
			{label : '主题描述',name : 'portalThemeDesc'}
		    ],
		    loadComplete:function(data){
		    	self.$grid.jqGrid('setSelection', self.initialData.portalThemeId);
		    },
		    pager: "#portal_acc_jqGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({portalThemeName: $page.find('input[name="portalThemeName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});