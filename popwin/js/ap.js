define(function () {
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new apPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'ap名称',
		        message: $('<div></div>').load('/admin/popwin/ap.html'),
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
		                	var rowId = popWin.$grid.jqGrid('getGridParam','selarrrow');
	                		if(!rowId && !popWin.initialData.apId){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var apIds = [];
	                			var apNames = [];
	                			//查询多个对象，分别把id和名称存到数组中
	                			for(var i=0;i<rowId.length;i++){
	                				var rowData= popWin.$grid.jqGrid('getRowData',rowId[i]);
	                				apIds.push(rowData.apId);
	                				apNames.push(rowData.apName);
	                			}
	                	//		var rowData = popWin.$grid.jqGrid('getRowData',rowId);
	                			var data = $.extend(popWin.initialData, {apId: apIds.join(','),apName: apNames.join(',') });
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

	
	function apPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	apPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	apPopWin.prototype.init = function(cb){
		var $form = $(".popwin_ap").find(".detail_form");
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		self.$grid = $("#ap_dataTable").jqGrid({
			url : '/data/com.wboss.wcb.auth.authmgr.ApSvc?m=queryApVoList.object.object',
			//多选
			multiselect: true,
		    colModel: [{name : 'apId',hidden : true,key:true}, 
		               {label : 'Ap名称',name : 'apName',width : 200},
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
		    	if(data.apId==""){
		    		return;
		    	}
		    	var apId = self.initialData.apId;
		    	if(apId!=""){
			    	var apIds=apId.split(",");
			    	for(var i=0;i<apIds.length;i++){
			    		self.$grid.jqGrid('setSelection',apIds[i]);
			    	}
		    }
		    }
		,beforeSelectRow: function (rowid, e) {
		    	var isShow = $form.status() === 'show',
		    	box = $($(e.target).closest('td')[0]).find('input[type="checkbox"]');
		    	box.attr('checked', !isShow);
		        return !isShow;  
		    },
		    pager: "#ap_jqGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({apName: $page.find('input[name="apName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});