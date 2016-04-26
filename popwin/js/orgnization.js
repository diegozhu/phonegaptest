define(function () {

var orgnizationList = new Service('com.wboss.general.orgnization.OrgnizationSvc');
module = {
	win:[],
	createPopWin : function(cb,initialData){
		var popWin = new OrgnizationPopWin(initialData);
		popWin.$dialog = BootstrapDialog.show({
			title:'请选择组织',
	        message: $('<div></div>').load('/admin/popwin/orgnization.html'),
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

function OrgnizationPopWin(initialData){
	this.$tree = null;
	this.$page = null;
	this.$dialog = null;
	this.events = {};
	this.id = Math.random();
	this.initialData = initialData;
	module.win.push(this);
	return this;
}

OrgnizationPopWin.prototype.on = function(event,func){
	this.events[event] = this.events[event] == undefined ? [] : this.events[event];
	this.events[event].push(func);
	return this;
}

OrgnizationPopWin.prototype.init = function(cb){
	var self = this;
	var $dialog = this.$dialog;
	var $page = this.$page = $dialog.getModalBody();
	var idcaches =[];

	$page.find('.orgnization_search .btn-search').on("click",function(e){
		self.$tree.jstree("refresh");
	});

	var param = {
    'core' : {
    	multiple : true,
        data : 
        	function(node,cp){
        		var vo = $page.find('.orgnization_search').serializeObject();
        		var all = false;
        		for(var i in vo){
        			if(vo[i] != "" && vo[i] != undefined){
        				all = true;
        				break;
        			}
        		}
        		vo.parentOrgId = node.id == "#" ? null : node.id;
        		if(all){
					orgnizationList.call("queryOrgList",[vo],function(data){
	        			var idMapping = [];
	        			for(var i in data){
	        				idMapping.push(data[i].orgnizationId);
	        			}
	        			for(var i in data){
		        			var d = data[i];
		        			d.id = d.orgnizationId+"";
		        			d.text = d.orgnizationName;
		        			d.parent = (d.parentOrgId == undefined || idMapping.indexOf(d.parentOrgId) == -1 ) ? "#" : d.parentOrgId+"";
		        			d.children = false;
		        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
	        			}
	        			cp(data);
	        		});
        		}else{
        			orgnizationList.call("queryOrgList",[vo],function(data){
	        			for(var i in data){
		        			var d = data[i];
		        			d.id = d.orgnizationId+"";
		        			d.text = d.orgnizationName;
		        			d.parent = (d.parentOrgId == undefined || idcaches.indexOf(d.parentOrgId) == -1 ) ? "#" : d.parentOrgId+"";
		        			//d.children = d.leafNum > 0;
		        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
		        			idcaches.push(d.orgnizationId);
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
	state : { "key" : "popwin_orgnization_"+self.id },
	types : {
      "default" : {
        "icon" : "glyphicon glyphicon-th-list"
      },
      "leaf" : {
        "icon" : "glyphicon glyphicon-home"
      }
    }

	};

	var $tree = self.$tree = $page.find('.org-orgnization-tree').jstree(param);
	
	$tree.on("select_node.jstree", function(e, data){
            var originalData = data.node.original;
            self.data = originalData;
        }
	);

	$tree.on("ready.jstree", function(e, data){
			var currentOrgnizationId = self.initialData.orgnizationId ||self.initialData.parentOrgId;
			if(currentOrgnizationId == undefined || currentOrgnizationId == "") 
				return;
			orgnizationList.call("queryOrgListByOrgId",[ {orgnizationId: currentOrgnizationId }],function(orgnizationList){
				if(orgnizationList == null || orgnizationList.length == 0)
					return;
				var orgnization = orgnizationList[0];
				var nodeIds = orgnization.orgnizationPath.trim("-").split("-");
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