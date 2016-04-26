define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new protalPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'访问策略名称',
		        message: $('<div></div>').load('/admin/popwin/protal_acc_policy.html'),
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
	                		if(!rowId && !popWin.initialData.policyName){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var rowData = popWin.$grid.jqGrid('getRowData',rowId);
	                			var data = $.extend(popWin.initialData, {portalAccPolicyId: rowData.portalAccPolicyId,policyName: rowData.policyName });
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

	
	function protalPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	protalPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	protalPopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var TYPE_OBJ ={};
		self.$grid = $("#protal_acc_policy_dataTable").jqGrid({
		    url: '/data/com.wboss.wcb.auth.authmgr.PortalAccPolicySvc?m=queryPortalAccPolicy.object.object',
		    colModel: [
		                { label: '访问策略标识', name: 'portalAccPolicyId',key:true,hidden:true },
			   	        { label: '策略名称', name: 'policyName',width: 100},
			   	        { label: 'portal主题标识', name: 'portalThemeName',width: 200,sortable:false},
                        { label: 'VnoId',name: 'vnoId',width: 200,hidden:true},
			   	        { label:'企业名称', name: 'vnoName',sortable:false},
			   	        {label : '状态', name : '_status'
			   	     }
		    ],
		    loadComplete:function(data){
		    	self.$grid.jqGrid('setSelection', self.initialData.portalAccPolicyId);
		    },
		    pager: "#protal_acc_policy_jqGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({policyName: $page.find('input[name="policyName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});