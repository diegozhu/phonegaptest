define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new authenPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'鉴权策略名称',
		        message: $('<div></div>').load('/admin/popwin/authen.html'),
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
	                		if(!rowId && !popWin.initialData.authenId){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var rowData = popWin.$grid.jqGrid('getRowData',rowId);
	                			var data = $.extend(popWin.initialData, {authenId: rowData.authenId,authenName: rowData.authenName });
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

	
	function authenPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	authenPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	authenPopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var TYPE_OBJ ={'00A':'有效','00X':'无效','00U':'归档'};
		//查询类型字典
		sysparam.call('getDicData',['DIC_ACC_BIND_TYPE'],function(res){
			for(var i in res){
				TYPE_OBJ[res[i].dicValue] = res[i].dicValueName
			}
		});
		
		self.$grid = $("#authen_dataTable").jqGrid({
			url :'/data/com.wboss.wcb.auth.authmgr.AuthenticationSvc?m=queryAllAuthenticationList4Jq.object.object',
		    colModel: [
		            	{label : '鉴权策略标识',name : 'authenId',hidden:true,key:true},
		               	{label : '鉴权策略名称',name : 'authenName'},
		               	{label : '用户密码效验类型',name : 'upVerifyType',hidden:true},
		               	{label : '访问限制类型',name : 'accBindType',formatter:function(cellValue, options, rowObject){
		               		return TYPE_OBJ[cellValue];
		               	}},
		               	{label : '绑定终端限制计数	',name : 'bindServLimit'},
		               	{label : '访问终端限制计数',name : 'accServLimit'},
		               	{label : '优先级',name : 'priority',hidden:true},
		               	{label : '状态',name : 'status',formatter:function(cellValue, options, rowObject){
		               		return TYPE_OBJ[cellValue];
		               	}}, 
		               	{name : 'vnoId',hidden:true},
		               	{label : '虚拟运营商',name : 'vnoName',sortable:false}
		    ],
		    loadComplete:function(data){
		    	self.$grid.jqGrid('setSelection', self.initialData.authenId);
		    },
		    pager: "#authen_jqGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({authenName: $page.find('input[name="authenName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});