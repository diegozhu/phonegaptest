define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new ssidPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'SSID',
		        message: $('<div></div>').load('/admin/popwin/ssid.html'),
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
		                	//获取多个id
		                	var rowId = popWin.$grid.jqGrid('getGridParam','selarrrow');
	                		if(!rowId && !popWin.initialData.ssidId){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var ssidIds=[];
	                			var ssids = [];
	                			//查询多个对象，分别把id和名称存到数组中
	                			for(var i=0;i<rowId.length;i++){
	                				var rowData= popWin.$grid.jqGrid('getRowData',rowId[i]);
	                				ssidIds.push(rowData.ssidId);
	                				ssids.push(rowData.ssid);
	                			}
	                			var data = $.extend(popWin.initialData, {ssidId: ssidIds.join(','),ssid: ssids.join(',') });
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

	
	function ssidPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	ssidPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	ssidPopWin.prototype.init = function(cb){
		//获取当前页
		
		var $form = $(".popwin_ssid").find(".detail_form");
		var STATUS={'00A':'有效','00U':'归档','00X':'无效'};
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		
		self.$grid = $("#ssid_dataTable").jqGrid({
			url :'/data/com.wboss.wcb.auth.authmgr.SsidSvc?m=querySsidListJq.object.object',
			//多选
			multiselect: true,
		    colModel: [
		        {name : 'ssidId',key:true,hidden:true},
				{label : '广播SSID名称',name : 'ssid'}, 
				{label : '描述',name : 'ssidDesc'},
				{label : '企业名称',name : 'vnoName',sortable:false}, 
				{label : '状态',name : '_status',sortable:false}
		    ],
		   
		    loadComplete:function(data){
		    	var ssidId=self.initialData.ssidId;
		    	if(ssidId){
		    	var ssidIds=ssidId.split(",");
		    	for(var i=0;i<ssidIds.length;i++){
		    		self.$grid.jqGrid('setSelection', ssidIds[i]);
		    	}
		    }
		    	//self相当于$page,self.initialData.ssidId就是在页面取ssidId值
		    	//self.$grid.jqGrid('setSelection', self.initialData.ssidId);
		    },beforeSelectRow: function (rowid, e) {
		    	var isShow = $form.status() === 'show',
		    	box = $($(e.target).closest('td')[0]).find('input[type="checkbox"]');
		    	box.attr('checked', !isShow);
		        return !isShow;  
		    },
		    pager: "#ssid_j" +
		    		"qGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({ssid: $page.find('input[name="ssid"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});