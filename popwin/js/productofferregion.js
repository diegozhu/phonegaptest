define(function () {

var regionList = new Service('com.wboss.general.region.RegionSvc');
module = {
	win:[],
	createPopWin : function(cb,initialData){
		var popWin = new RegionPopWin(initialData);
		popWin.$dialog = BootstrapDialog.show({
			title:'请选择区域',
	        message: $('<div></div>').load('/admin/popwin/productofferregion.html'),
	        onshown : function(){
				popWin.init(cb);      	
	        },
	        onhide:function(){
	        	var newWins = [];
            	for(var i in module.win){
            		if(module.win[i].id != popWin.id)
						newWins.push(module.win[i]);            	
            	}
	        	module.win = newWins;
            	popWin.$tree.jstree('destroy');
            	popWin.$tree.remove();
            	popWin.$tree = null;
            	popWin = null;
	        },
	        buttons : [
	        	{
	                label: '确定',
	                action: function(dialog) {
	                	var e = popWin.events['ok'];
                		if(!popWin.data){
                			BootstrapDialog.warning("您还没有选择");
                		}else{
                			for(var i in e){
		                		typeof e[i] == "function" && e[i](popWin.data,'ok');
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

function RegionPopWin(initialData){
	this.$tree = null;
	this.$page = null;
	this.$dialog = null;
	this.events = {};
	this.id = Math.random();
	this.initialData = initialData;
	module.win.push(this);
	return this;
}

RegionPopWin.prototype.on = function(event,func){
	this.events[event] = this.events[event] == undefined ? [] : this.events[event];
	this.events[event].push(func);
	return this;
}

RegionPopWin.prototype.init = function(cb){
	var self = this;
	var $dialog = this.$dialog;
	var $page = this.$page = $dialog.getModalBody();
	var idcaches =[];

	if(self.initialData.regionLevel){
		$page.find('input[name="regionLevel"]').val(self.initialData.regionLevel);
	}
	$page.find('.region_search .btn-search').on("click",function(e){
		self.$tree.jstree("refresh");
	});

	var param = {
    'core' : {
    	multiple : true,
        data : 
        	function(node,cp){
        		var vo = $page.find('.region_search').serializeObject();
        		var all = false;
        		for(var i in vo){
        			if(vo[i] != "" && vo[i] != undefined){
        				all = true;
        				break;
        			}
        		}
        		vo.parentRegionId = node.id == "#" ? null : node.id;
        		if(all){
					regionList.call("queryRegionList",[vo],function(data){
	        			var idMapping = [];
	        			for(var i in data){
	        				idMapping.push(data[i].vnoId);
	        			}
	        			for(var i in data){
		        			var d = data[i];
		        			d.id = d.regionId+"";
		        			d.text = d.regionName;
		        			d.parent = (d.parentRegionId == undefined || idMapping.indexOf(d.parentRegionId) == -1 ) ? "#" : d.parentRegionId+"";
		        			d.children = false;
		        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
	        			}
	        			cp(data);
	        		});
        		}else{
        			regionList.call("queryRegionList",[vo],function(data){
	        			for(var i in data){
		        			var d = data[i];
		        			d.id = d.regionId+"";
		        			d.text = d.regionName;
		        			d.parent = (d.parentRegionId == undefined || idcaches.indexOf(d.parentRegionId) == -1 ) ? "#" : d.parentRegionId+"";
		        			//d.children = d.leafNum > 0;
		        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
		        			idcaches.push(d.regionId);
	        			}
	        			cp(data);
	        		});
        		}
    		}
    	},
	plugins : [
		"search", 
		"sort", 
		"types",
		"state"
	],
	state : { "key" : "popwin_region_"+self.id },
	types : {
      "default" : {
        "icon" : "glyphicon glyphicon-th-list"
      },
      "leaf" : {
        "icon" : "glyphicon glyphicon-home"
      }
    }

	};

	var $tree = self.$tree = $page.find('.org-region-tree').jstree(param);
	
	$tree.on("select_node.jstree", function(e, data){
            var originalData = data.node.original;
            self.data = originalData;
        }
	);

	$tree.on("ready.jstree", function(e, data){
			var currentRegionId = self.initialData.regionId ||self.initialData.parentRegionId;
			if(currentRegionId == undefined || currentRegionId == "") 
				return;
			regionList.call("queryRegionList",[ {regionId: currentRegionId} ],function(regionList){
				if(regionList == null || regionList.length == 0)
					return;
				var region = regionList[0];
				var nodeIds = region.regionCode.trim("-").split("/");
				var selectNode = nodeIds[nodeIds.length-1];
				$.jstree.openTreeNode(self.$tree,nodeIds,function(){
					self.$tree.jstree("select_node",selectNode); 
				});
			});
        }
	);
	typeof cb == "function" && cb();
	return this;
}

return module;
});