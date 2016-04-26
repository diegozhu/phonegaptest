define(function () {
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new StaffPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'商品名称',
		        message: $('<div></div>').load('/admin/popwin/product_offer.html'),
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
	                		if(!rowId && !popWin.initialData.offerName){
	                			BootstrapDialog.warning("您还没有选择");
	                		}else{
	                			var offerIds=[];
	                			var	offerNames=[];
	                			for(var i = 0;i<rowId.length;i++){
	                			var rowData = popWin.$grid.jqGrid('getRowData',rowId[i]);
	                			offerIds.push(rowData.offerId);
	                			offerNames.push(rowData.offerName);
	                			}
	                			var data = $.extend(popWin.initialData, {offerIds: offerIds.join(','),offerName:offerNames.join(',') });
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

	
	function StaffPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	StaffPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}
	StaffPopWin.prototype.init = function(cb){
		var $form = $(".popwin_product_offer").find(".detail_form");
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		self.$grid = $("#product_offer_dataTable").jqGrid({
			url : '/data/com.wboss.wcb.offermgr.ProductOfferSvc?m=queryProductOfferList.object.object',
			//多选
			multiselect: true,
		    colModel: [
		    { label : '商品ID',name : 'offerId',key:true,hidden : true},
		    { label: '商品名称', name: 'offerName',width: 100},
		    { label: '定价', name: '_price',width: 200},
   	        { label: '商品编码', name: 'offerCode',width: 100},
		    ],
		    loadComplete:function(data){
		    	var offerId=self.initialData.offerIds;
		    	if (offerId) {
		    		var offerIds=offerId.split(",");
		    		for (var i=0;i<offerIds.length;i++) {
		    			self.$grid.jqGrid('setSelection', offerIds[i]);
					}
				}
		    },beforeSelectRow: function (rowid, e) {
		    	var isShow = $form.status() === 'show',
		    	box = $($(e.target).closest('td')[0]).find('input[type="checkbox"]');
		    	box.attr('checked', !isShow);
		        return !isShow;  
		    },
		    pager: "#product_offer_jqGridPager",
		    height: '300px'
		});
		$page.find('.btn-search').on("click",function(e){
			var postData = self.$grid.jqGrid("getGridParam", "postData");
			postData.param = JSON.stringify({offerName: $page.find('input[name="offerName"]').val()});
			self.$grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		});
	}
	
	return module;
});