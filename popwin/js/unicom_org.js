define(function () {
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new UnicomOrgPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'公司',
		        message: $('<div></div>').load('/admin/popwin/unicom_org.html'),
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
		                	console.log(rowId);
	                		if(!rowId && !popWin.initialData.unicomOrgId){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			debugger
	                			var unicomOrgIds=[];
	                			var orgNames = [];
	                			//查询多个对象，分别把id和名称存到数组中
	                			for(var i=0;i<rowId.length;i++){
	                				var rowData= popWin.$grid.jqGrid('getRowData',rowId[i]);
	                				unicomOrgIds.push(rowData.unicomOrgId);
	                				orgNames.push(rowData.orgName);
	                			}
	                			var data = $.extend(popWin.initialData, {unicomOrgId: unicomOrgIds.join(','),orgName: orgNames.join(',') });
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

	
	function UnicomOrgPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	UnicomOrgPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	UnicomOrgPopWin.prototype.init = function(cb){
		//获取当前页
		
		var $form = $(".popwin_unicom_org").find(".detail_form");
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		
		self.$grid = $("#popwin_unicom_org_dataTable").jqGrid({
			url :'/data/com.wboss.wcb.unicom.UnicomOrgSvc?m=queryForJqGrid.object.object',
			//多选
			//multiselect: true,
		    colModel: [
		        {label : '编号' , name : 'unicomOrgId',key:true},
				{label : '名称',name : 'orgName'}, 
				{label : '省份',name : 'province'},
				{label : '城市',name : 'city'},
				{label : '区/县',name : 'district'},
				{label : '创建日期',name : 'createDate'}
		    ],
		   
		    loadComplete:function(data){
		    	debugger
		    	if(data.unicomOrgId==""){
		    			return;
		    	}
		    	var unicomOrgId=self.initialData.unicomOrgId;
		    	if(unicomOrgId!=""){
		    	var unicomOrgIds=unicomOrgId.split(",");
		    	for(var i=0;i<unicomOrgIds.length;i++){
		    		self.$grid.jqGrid('setSelection', unicomOrgIds[i]);
		    	}
		    }
		    	//self相当于$page,self.initialData.unicomOrgId就是在页面取unicomOrgId值
		    	//self.$grid.jqGrid('setSelection', self.initialData.unicomOrgId);
		    },beforeSelectRow: function (rowid, e) {
		    	var isShow = $form.status() === 'show',
		    	box = $($(e.target).closest('td')[0]).find('input[type="checkbox"]');
		    	box.attr('checked', !isShow);
		        return !isShow;  
		    },
		    pager: "#popwin_unicom_org_jqGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({orgName: $page.find('input[name="orgName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});