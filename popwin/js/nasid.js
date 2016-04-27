define(function () {
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new nasidPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'nasid',
		        message: $('<div></div>').load('/admin/popwin/nasid.html'),
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
	                		if(!rowId && !popWin.initialData.nasid){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var rowData = popWin.$grid.jqGrid('getRowData',rowId);
	                			var data = $.extend(popWin.initialData, {nasidId: rowData.nasidId,nasid: rowData.nasid });
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

	
	function nasidPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	nasidPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	nasidPopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var TYPE_OBJ ={};
		self.$grid = $("#nasid_dataTable").jqGrid({
		    url: wboss.getWay + '/data/com.wboss.wcb.admin.nasidmgr.NasidSvc?m=queryNasidListByJq.object.object',
		    colModel: [
		               { label: 'nasId', name: 'nasidId',width: 200,hidden:true },
			   	        { label: 'nasid', name: 'nasid',width: 100},
			   	     { label: 'VnoId',name: 'vnoId',width: 200,hidden:true},
			   	     { label:'虚拟运虚拟运营商', name: 'vnoName',width: 200},
			   	     {label : '状态', name : 'status',
			   	    	 formatter: function (value){ 
			   	    		 if(value=='00A')
			   	    		 return '有效';
			   	    		 else if(value=='00X')
			   	    			 return '失效';
			   	    		 else
			   	    			 return '归档';
			   	    	 }
			   	     }
		    ],
		    loadComplete:function(data){
		    	self.$grid.jqGrid('setSelection', self.initialData.nasidId);
		    },
		    pager: "#nasid_jqGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({nasid: $page.find('input[name="nasid"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});