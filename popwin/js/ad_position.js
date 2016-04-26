define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new ssidPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'广告位',
		        message: $('<div></div>').load('/admin/popwin/ad_position.html'),
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
		                	var rowId = popWin.$grid.jqGrid('getGridParam','selrow');
	                		if(!rowId && !popWin.initialData.adPositionId){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			
	                			var rowData= popWin.$grid.jqGrid('getRowData',rowId);
	                			
	                			var data = $.extend(popWin.initialData, {adPositionId:rowData.adPositionId ,adPositionName: rowData.adPositionName });
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
		
		var $form = $(".popwin_ad_position").find(".detail_form");
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		
		self.$grid = $("#ad_position_dataTable").jqGrid({
			url :'/data/com.wboss.wcb.admin.ad.AdMgrSvc?m=jqueryAdPositionVoList.object.object',
		    colModel: [
		        {name : 'adPositionId',key:true,hidden:true},
				{label : '广告位名称',name : 'adPositionName'}, 
				{label : '广告位类型',name : 'adPositionType'},
				{label : '广告位描述',name : 'adDesc'}, 
				{label : '广告位大小',name : 'adSize'}
		    ],
		    loadComplete:function(data){
		    	self.$grid.jqGrid('setSelection', self.initialData.adPositionId);
		    },
		    pager: "#ad_position_jqGridPager",
		    height: '300px'
		});
		
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({adPositionName: $page.find('input[name="adPositionName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});