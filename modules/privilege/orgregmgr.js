define(function () {

var regionSvc = new Service('com.wboss.general.region.RegionSvc');
var sysparam = new Service("com.wboss.general.param.SysParamSvc");
var orgSvc = new Service('com.wboss.general.orgnization.OrgnizationSvc');

function onActive($page,$relativeUrl){
	
}

function onCreate($page,$relativeUrl){
	var $regionForm = $page.find(".region_form").status('show');
	var regionValidator = $regionForm.validate({errorPlacement: function(error, element){
		if ( element.parent().hasClass("input-group")){
			error.appendTo(element.parent().parent());
		}else{
			error.appendTo(element.parent());
		}	
	}});
	
	$page.find('.region_search .btn-search').on("click",function(e){
		$regionTree.jstree("refresh");
	});
	
	sysparam.call('getDicData',['DIC_STATUS'],function(res){
		var dom = "";
		for(var i in res){
			dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
		}
		$page.find("select[name='status']").append(dom);
	});
	
	$regionForm.data('default',{status:'00A'});

	$regionForm.on('click',".btn-class-new",function(e){
		var data = $page.find('.org-region-tree').jstree().get_selected(true);
		if(data && data.length > 0){
			$.extend($regionForm.data('default'), {parentRegionId: data[0].original.regionId, parentRegionName: data[0].original.regionName});
		}
	});
	
	$regionForm.on('click',".btn-class-ok",function(e){
		if (!$regionForm.valid()) {
	         return;
	    }
		var region = $regionForm.serializeObject();
		var method = $regionForm.status() == "new" ? 'addRegion' : 'modifyRegion';
		var msg = $regionForm.status() == "new" ?  '添加成功！' : '更新成功！';

		regionSvc.call(method,[region],function(){
			$regionTree.jstree("refresh");
			BootstrapDialog.success(msg);
			$regionForm.status('show');
		});
	});
	
	var $regionTree = $page.find('.org-region-tree').jstree({
    'core' : {
    	multiple : true,
        data : 
        	function(node,cp){
        		var idcaches =[];
        		var region = $page.find('.region_search').serializeObject();
        		region.parentRegionId = node.id == "#" ? null : node.id;

    			regionSvc.call("queryRegionList",[region],function(data){
        			for(var i in data){
        				var d = data[i];
	        			d.id = d.regionId+"";
	        			d.text = d.regionName;
	        			d.parent = (d.parentRegionId == undefined || idcaches.indexOf(d.parentRegionId) == -1 ) ? "#" : d.parentRegionId+"";
	        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
	        			idcaches.push(d.regionId);
        			}
        			cp(data);
        			$regionForm.find(".btn-class-edit").prop('disabled', true);
        		});
        		     		     		
        	}
    	},
	plugins : [
		"search", 
		"sort", 
		"types",
		"state"
	],
	types : {
      "default" : {
        "icon" : "glyphicon glyphicon-th-list"
      },
      "leaf" : {
        "icon" : "glyphicon glyphicon-home"
      }
    },
 	"state" : { "key" : "model_region" }});
	
	$regionTree.on("select_node.jstree", function(e, data){
            var originalData = data.node.original;
            regionValidator.resetForm();
            $regionForm.data('default',{status:'00A', parentRegionId: originalData.parentRegionId, 
            	parentRegionName: originalData.parentRegionName});
            $regionForm.deSerializeObject(originalData).status('show');
            $regionForm.find(".btn-class-edit").prop('disabled', false);
        }
	);
	
	
	var $orgForm = $page.find(".orgnization_form").status('show');
	var orgValidator = $orgForm.validate({errorPlacement: function(error, element){
		if ( element.parent().hasClass("input-group")){
			error.appendTo(element.parent().parent());
		}else{
			error.appendTo(element.parent());
		}	
	}});
	
	$page.find('.orgnization_search .btn-search').on("click",function(e){
		$orgTree.jstree("refresh");
	});
	
	$orgForm.data('default',{status:'00A'});

	$orgForm.on('click',".btn-class-new",function(e){
		var data = $page.find('.org-orgnization-tree').jstree().get_selected(true);
		if(data && data.length > 0){
			$.extend($orgForm.data('default'), {parentOrgId: data[0].original.orgnizationId, parentOrgName: data[0].original.orgnizationName});
		}
	});
	
	$orgForm.on('click',".btn-class-ok",function(e){
		if (!$orgForm.valid()) {
	         return;
	    }
		var org = $orgForm.serializeObject();
		var method = $orgForm.status() == "new" ? 'addOrgnization' : 'modifyOrgnization';
		var msg = $orgForm.status() == "new" ?  '添加成功！' : '更新成功！';

		orgSvc.call(method,[org],function(){
			$orgTree.jstree("refresh");
			BootstrapDialog.success(msg);
			$orgForm.status('show');
		});
	});
	
	var $orgTree = $page.find('.org-orgnization-tree').jstree({
    'core' : {
    	multiple : true,
        data : 
        	function(node,cp){
        		var orgIdCaches =[];
        		var orgnization = $page.find('.orgnization_search').serializeObject();
        		orgnization.parentOrgId = node.id == "#" ? null : node.id;

    			orgSvc.call("queryOrgList",[orgnization],function(data){
        			for(var i in data){
        				var d = data[i];
	        			d.id = d.orgnizationId+"";
	        			d.text = d.orgnizationName;
	        			d.parent = (d.parentOrgId == undefined || orgIdCaches.indexOf(d.parentOrgId) == -1 ) ? "#" : d.parentOrgId+"";
	        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
	        			orgIdCaches.push(d.orgnizationId);
        			}
        			cp(data);
        			 $orgForm.find(".btn-class-edit").prop('disabled', true);
        		});
        		     		     		
        	}
    	},
	plugins : [
		"search", 
		"sort", 
		"types",
		"state"
	],
	types : {
      "default" : {
        "icon" : "glyphicon glyphicon-th-list"
      },
      "leaf" : {
        "icon" : "glyphicon glyphicon-home"
      }
    },
 	"state" : { "key" : "model_orgnization" }});
	
	$orgTree.on("select_node.jstree", function(e, data){
            var originalData = data.node.original;
            orgValidator.resetForm();
            $orgForm.data('default',{status:'00A', parentOrgId: originalData.parentOrgId, 
            	parentOrgName: originalData.parentOrgName});
            $orgForm.deSerializeObject(originalData).status('show');
            $orgForm.find(".btn-class-edit").prop('disabled', false);
        }
	
	
	);
}

	return { onCreate : onCreate, onActive : onActive };
});