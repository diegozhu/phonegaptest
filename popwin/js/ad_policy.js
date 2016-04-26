define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	// 添加状态
	var STATUS = {
		'00A' : '有效',
		'00U' : '归档',
		'00X' : '失效'
	};
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new adPolicyPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'广告策略名称',
		        message: $('<div></div>').load('/admin/popwin/ad_policy.html'),
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
		                	//获取id
		                var rowId = popWin.$grid.jqGrid('getGridParam','selrow');
		                	if(!rowId && !popWin.initialData.getPolicyId){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var rowData = popWin.$grid.jqGrid('getRowData',rowId);
	                			var data = $.extend(popWin.initialData, {getPolicyIds:rowData.getPolicyId,policyNames:rowData.policyName});
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

	
	function adPolicyPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	adPolicyPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	adPolicyPopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var TYPE_OBJ ={'00A':'有效','00X':'无效','00U':'归档'};
		var $from = $(".popwin_ad_policy").find(".from");
		self.$grid = $("#ad_policy_dataTable").jqGrid({
			url :'/data/com.wboss.wcb.admin.ad.AdGetPolicySvc?m=queryAdGetPolicyListJq.object.object',
			colModel : [
						{name : 'getPolicyId',hidden:true,key:true},
						{label : '广告策略名称',name : 'policyName'},
						{label : '策略描述',name : 'policyDesc'},
						{label : '',name : 'vnoId',hidden : true},
						{label : '企业名称',name : 'vnoName',sortable : false,width : 200},
						{label : '状态',name : 'status',
							formatter : function(cellValue, options,
									rowObject) {
								return STATUS[cellValue];
							}
						} ],
		    loadComplete:function(data){
		    	self.$grid.jqGrid('setSelection', self.initialData.getPolicyIds);
		    },
		    pager: "#ad_policy_jqGridPager",
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