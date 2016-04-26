define(function () {

var vnoList = new Service('com.wboss.wcb.admin.vnomgr.VnoListSvc');
module = {
	win:[],
	createPopWin : function(cb,initialData){
		var popWin = new VnoPopWin(initialData);
		popWin.$dialog = BootstrapDialog.show({
			title:'请选择企业名称',
	        message: $('<div></div>').load('/admin/popwin/vno.html'),
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

function VnoPopWin(initialData){
	this.$tree = null;
	this.$page = null;
	this.$dialog = null;
	this.events = {};
	this.id = Math.random();
	this.initialData = initialData;
	module.win.push(this);
	return this;
}

VnoPopWin.prototype.on = function(event,func){
	this.events[event] = this.events[event] == undefined ? [] : this.events[event];
	this.events[event].push(func);
	return this;
}

VnoPopWin.prototype.init = function(cb){
	var self = this;
	var $dialog = this.$dialog;
	var $page = this.$page = $dialog.getModalBody();
	var idcaches =[];

	$page.find('.vno_search .btn-search').on("click",function(e){
		self.$tree.jstree("refresh");
	});

	var param = {
    'core' : {
    	multiple : true,
        data : 
        	function(node,cp){
        		var vo = $page.find('.vno_search').serializeObject();
        		var all = false;
        		for(var i in vo){
        			if(vo[i] != "" && vo[i] != undefined){
        				all = true;
        				break;
        			}
        		}
        		vo.parentVnoId = node.id == "#" ? null : node.id;
        		if(all){
					vnoList.call("queryVnoList4jsTreeAll",[vo],function(data){
	        			var idMapping = [];
	        			for(var i in data){
	        				idMapping.push(data[i].vnoId);
	        			}
	        			for(var i in data){
		        			var d = data[i];
		        			d.id = d.vnoId+"";
		        			d.text = d.vnoName;
		        			d.parent = (d.parentVnoId == undefined || idMapping.indexOf(d.parentVnoId) == -1 ) ? "#" : d.parentVnoId+"";
		        			d.children = false;
		        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
	        			}
	        			cp(data);
	        		});
        		}else{
        			vnoList.call("queryVnoList4jsTreeLazy",[vo],function(data){
	        			for(var i in data){
		        			var d = data[i];
		        			d.id = d.vnoId+"";
		        			d.text = d.vnoName;
	        				d.parent = d.parentVnoId == undefined ? "#" : (idcaches.indexOf(d.parentVnoId) == -1 ? "#" : d.parentVnoId+"");
		        			d.children = d.leafNum > 0;
		        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
		        			idcaches.push(d.vnoId);
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
	state : { "key" : "popwin_vno_"+self.id },
	types : {
      "default" : {
        "icon" : "glyphicon glyphicon-th-list"
      },
      "leaf" : {
        "icon" : "glyphicon glyphicon-home"
      }
    }

	};

	var $tree = self.$tree = $page.find('.org-vno-tree').jstree(param);
	
	$tree.on("select_node.jstree", function(e, data){
            var originalData = data.node.original;
            originalData.parentVnoId = originalData.vnoId;
            originalData.parentVnoName = originalData.vnoName;
            self.data = originalData;
        }
	);

	$tree.on("ready.jstree", function(e, data){
			var currentVnoId = self.initialData.vnoId ||self.initialData.parentVnoId;
			if(currentVnoId == undefined || currentVnoId == "") 
				return;
			vnoList.call("queryVnoByVnoId",[ currentVnoId ],function(vnoList){
				if(vnoList == null || vnoList.length == 0)
					return;
				var vno = vnoList[0];
				var nodeIds = vno.vnoIdPath.trim("-").split("-");
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