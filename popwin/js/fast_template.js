define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new fastTemplatePopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'快速开户模版名称',
		        message: $('<div></div>').load('/admin/popwin/fast_template.html'),
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
	                		if(!rowId && !popWin.initialData.custTemplateId){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var rowData = popWin.$grid.jqGrid('getRowData',rowId);
	                			var data = $.extend(popWin.initialData, {custTemplateId: rowData.custTemplateId,custTemplateName: rowData.custTemplateName });
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

	
	function fastTemplatePopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	fastTemplatePopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	fastTemplatePopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var TYPE_OBJ ={};
		//查询类型字典
		sysparam.call('getDicData',['DIC_TIEM_SPAN_TYPE'],function(res){
			for(var i in res){
				TYPE_OBJ[res[i].dicValue] = res[i].dicValueName
			}
		});
		
		self.$grid = $("#fast_template_dataTable").jqGrid({
			url :'/data/com.wboss.wcb.custmgr.FastCustTemplateSvc?m=queryFastCustTemplate.object.object',
		    colModel: [
		               { label: '模板标识', name: 'custTemplateId',hidden:true,key:true},
			   	        { label: '模板名称', name: 'custTemplateName',width: 200},
			   	        { label: '模板类型', name: '_custTemplateType'},
			   	        { label: '客户名称', name: 'custName',width: 100},
			   	        { label: 'VnoId',name: 'vnoId',width: 200,hidden:true},
			   	        { label:'企业名称', name: 'vnoName',sortable:false},
			   	        {label : '状态', name : '_status'}
		    ],
		    loadComplete:function(data){
		    	self.$grid.jqGrid('setSelection', self.initialData.custTemplateId);
		    },
		    pager: "#fast_template_jqGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({custTemplateName: $page.find('input[name="custTemplateName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});