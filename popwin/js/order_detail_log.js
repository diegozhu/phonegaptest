define(function () {
	var custInfoQuerySvc = new Service('com.wboss.wcb.custinfo.CustInfoQuerySvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new orderDetailPopWin(initialData);
			
			popWin.$dialog = BootstrapDialog.show({
				title:'订单明细',
		        message: $('<div></div>').load('/admin/popwin/order_detail_log.html'),
		        onshown : function(){
					popWin.init(cb);
		        },
		        onhide:function(){
	            	popWin = null;
		        },
		        buttons : [
		        	{
		                label: '关闭',
		                action: function(dialog) {
		                	var e = popWin.events['ok'];
		                	var rowId = popWin.jqGrid.jqGrid('getGridParam','selrow');
		                	var rowData = popWin.jqGrid.jqGrid('getRowData',rowId);
		                    popWin.$dialog.close();
                		}
		        	  }
		        ]
		    });
		    return popWin;
		}
	};

	function orderDetailPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	orderDetailPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	orderDetailPopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var $table = $page.find("#cust_360cust_order_detail_log_dataTable");
		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
		$page.find('input[name="vnoName"]').val(vnoName);
		$page.find('input[name="vnoId"]').val(vnoId);
		var RULETYPE={};
		var ACCESSTYPE={};
		
		//初始值
		//$form.data('default',{status:'00A',vnoId:vnoId,vnoName:vnoName,ruleType:'100',accessType:'60A'});
		//字典
		sysparam.call('getDicData',['DIC_ACCESS_DETAIL_RULE_TYPE'],function(res){
			var dom = "";
			for(var i in res){
				RULETYPE[res[i].dicValue]=res[i].dicValueName;
				dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
			}
			
			$page.find(".ruleType").append(dom);
		});
		self.jqGrid = $table.jqGrid({
			url : wboss.getWay + '/data/com.wboss.wcb.custinfo.CustInfoQuerySvc?m=queryOrderDetailLogPoByOrderID.object.object',
			datatype: 'local',
			autowidth:true,
			colModel : [
			            {label : '订单标识',name : 'orderId',width:100,hidden : true},
			            {label : '订单项名称',name : 'orderItem',width:100},
			            {label : '订单项新取值',name : 'newValue',width:100},
			            {label : '订单项原有取值',name : 'oldValue',width:100},
			            {name : 'vnoId',hidden:true},
			            {label : '企业名称',name : 'vnoName',sortable:false,width:166,hidden : true}],
			onSelectRow : function(rowId) {
				var data = self.jqGrid.griddata.rows[rowId-1];
			},height:100,width:566,shrinkToFit:true
		});
	
    	var postData= self.jqGrid.jqGrid("getGridParam", "postData");
		postData.param = JSON.stringify(self.initialData);
		self.jqGrid.jqGrid("setGridParam", {datatype: 'json', search:true}).trigger("reloadGrid", [{ page: 1}]); 
	
	}	
	return module;	
});
