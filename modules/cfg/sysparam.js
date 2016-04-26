'use strict';

define(function () {

var sysparam = new Service("com.wboss.general.param.SysParamSvc");
function onActive($page, $relativeUrl){
}

function onCreate($page, $relativeUrl){
	//声明
	var $page = $("#tabs_modules_cfg_sysparam");
	//调用日期控件
	$page.find('.datepicker').datetimepicker({ format: 'YYYY-MM-DD HH:mm:ss'});

	var $form = $page.find(".detail_form");
	var $table = $("#cfg_sysparam_dataTable");
	
	var vnoId = model.user().vnoId();
	var vnoName=model.user().vnoName();
	$page.find("input[name='vnoId']").val(vnoId);
	$page.find("input[name='vnoName']").val(vnoName);
	//验证
	var validator=$form.validate();
	$form.on('click',".btn-class-ok",function(e){
		if(!$form.valid()){
			return;
		}
		var param = $form.serializeObject();
		var method = 'modifySysParam';
		var msg = '更新成功！';

		sysparam.call(method,[param],function(){
			jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			BootstrapDialog.success(msg);
			$form.status('show');
		});
	});
	var jqGrid = $table.jqGrid({
	    url: wboss.getWay + '/data/com.wboss.general.param.SysParamSvc?m=queryParamList4Jq.object.object',
	    colModel:[
		{label:'参数编码',name:'paramCode'},
		{label:'参数类型编码',name:'paramTypeCode',width:'150px',editable:true},
		{label:'参数名称',name:'paramName',width:'250px'},
		{label:'参数描述',name:'paramDesc',width:'280px'},
		{label:'参数值',name:'paramValue',width:'300px',formatter:function(cellvalue, options, rowObject){
			if(cellvalue=="T"){
				return '启用';
			}else if(cellvalue=="F"){
				return '禁用';
			}
			return cellvalue;
			
		}},
		{label:'企业名称',name:'vnoName',sortable:false},
		{label:'状态',name:'_status',width:'150px'}
		],
	    onSelectRow:function(rowId){
	    	validator.resetForm();
	    	$form.find(".btn-class-edit").prop("disabled",false);
	    	var data = jqGrid.griddata.rows[rowId-1];
	    	$form.deSerializeObject(data).status('show');
	    	$form.find("[data-value-name='paramValue']").hide().attr('name',"");
	    	var $targetElement = $form.find("[data-value-type='"+data.valueType+"']").show();
	    	var valueName = $targetElement.data('value-name');
	    	$targetElement.attr('name',valueName).val(data.paramValue);
	    	switch(data.valueType){
	    	case "A01":break;		
	    	case "B01":break;
	    	case "C01":break;
	    	case "D01":
	    	case "D02":
	    	case "D03":
	    		$targetElement.find("input").attr('name',valueName).val(data.paramValue);break;
	    		break;
	    	}
	    },
	    onPaging:function(){
	    	$form.status('show');
	    },
	   	onSortCol:function(){
	    	$form.status('show');
	    },
	   	loadComplete:function(data){
	   		jqGrid.griddata = data;
	    	$form.status('show');
	    	$form.find(".btn-class-edit").prop("disabled",true);
	    },
	    pager: "#cfg_sysparam_jqGridPager"
	});
}
return { onCreate : onCreate, onActive : onActive };
});


