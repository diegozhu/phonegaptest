define(function () {

var vnoList = new Service('com.wboss.wcb.admin.vnomgr.VnoListSvc');
var sysparam = new Service("com.wboss.general.param.SysParamSvc");

function onActive($page,$relativeUrl){
	
}

function onCreate($page,$relativeUrl){
	var $detailForm = $page.find(".detail_form").status('show');
	var validator = $detailForm.validate({errorPlacement: function(error, element){
		if ( element.parent().hasClass("input-group")){
			error.appendTo(element.parent().parent());
		}else{
			error.appendTo(element.parent());
		}	
	}});
	
	$page.find('.vno_search .btn-search').on("click",function(e){
		$tree.jstree("refresh");
	});
	
	sysparam.call('getDicData',['DIC_STATUS'],function(res){
		var dom = "";
		for(var i in res){
			dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
		}
		$page.find("select[name='status']").append(dom);
	});
	
	sysparam.call('getDicData',['DIC_BUSINESS_MODE_TYPE'],function(res){
		var dom = "";
		for(var i in res){
			dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
		}
		$page.find("select[name='businessMode']").append(dom);
	});
	
	sysparam.call('getDicData',['DIC_PARTNER_TYPE'],function(res){
		var dom = "";
		for(var i in res){
			dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
		}
		$page.find("select[name='partner']").append(dom);
	});
	
	sysparam.call('getDicData',['DIC_BRANCH_COMPANY_TYPE'],function(res){
		var dom = "";
		for(var i in res){
			dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
		}
		$page.find("select[name='branchCompany']").append(dom);
	});
	
	sysparam.call('getDicData',['DIC_DEALER_TYPE'],function(res){
		var dom = "";
		for(var i in res){
			dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
		}
		$page.find("select[name='dealer']").append(dom);
	});

	sysparam.call('getDicData',['DIC_INDUSTRY_TYPE'],function(res){
		var dom = "";
		for(var i in res){
			dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
		}
		$page.find("select[name='industry']").append(dom);
	});
	
	
//	$detailForm.on('click',".btn-class-new",function(e){
//		var vno = $detailForm.serializeObject();
//		 $detailForm.data('default',{status:'00A', parentVnoId: vno.vnoId, 
//		    	parentVnoName: vno.vnoName, industry: 'INS01',branchCompany:'C01',partner:'P01',businessMode:'B01',dealer:'D01'});
//	});
	
	$detailForm.on('click',".btn-class-ok",function(e){
		if (!$detailForm.valid()) {
	         return;
	    }
		
		var vno = $detailForm.serializeObject();
		var parentVnoId = vno.parentVnoId;
		var method = $detailForm.status() == "new" ? 'insertVnoListInfo' : 'updateVnoList';
		var msg = $detailForm.status() == "new" ?  '添加成功！' : '更新成功！';
		if(vno.effDate>vno.expDate){
			BootstrapDialog.warning("生效日期不能大于失效日期!");
			return false;
		}
		vnoList.call(method,[vno],function(){
			$tree.jstree("refresh");
			BootstrapDialog.success(msg);
			$detailForm.status('show');
		});
	});
	var idcaches =[];
	var $tree = $page.find('.org-vno-tree').jstree({
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
        		var vo = $page.find('.vno_search').serializeObject();
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
		        			d.type = d.leafNum > 0 ? 'default' : 'leaf';
		        			d.children = false;
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
	types : {
      "default" : {
        "icon" : "glyphicon glyphicon-th-list"
      },
      "leaf" : {
        "icon" : "glyphicon glyphicon-home"
      }
    },
 	"state" : { "key" : "model_vno" }});
	
   	//页面加载时，编辑不可用
	$page.find(".btn-class-edit").prop('disabled', true);
	
	$tree.on("select_node.jstree", function(e, data){
            var originalData = data.node.original;
           	//页面加载时，编辑不可用
        	$page.find(".btn-class-edit").prop('disabled', false);
            validator.resetForm();
            $detailForm.data('default',{status:'00A',parentVnoId: originalData.vnoId, 
            	parentVnoName: originalData.vnoName, industry: 'INS01',branchCompany:'C01',partner:'P01',businessMode:'B01',dealer:'D01',effDate : new Date().toString("yyyy-MM-dd hh:mm:ss"),expDate : '2030-01-01 00:00:00'});
            $detailForm.deSerializeObject(originalData).status('show');
            
       	   if(originalData.vnoId == 0){
       		   	$page.find("input[name='parentVnoName']").attr({"class":"form-control pop-win-contoller"});
       		    $page.find("input[name='parentVnoName']").rules("remove");
       	   }
       	   else{
       		   	$page.find("input[name='parentVnoName']").rules("remove");
      			$page.find("input[name='parentVnoName']").rules("add",{required:true});
      			$page.find("input[name='parentVnoName']").attr({"class":"form-control pop-win-contoller editable"});
       	   }
        }
	);
}

return { onCreate : onCreate, onActive : onActive };
});


