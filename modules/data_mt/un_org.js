define(function () {
//方法
var svc = new Service('com.wboss.wcb.unicom.UnicomOrgSvc');

function onActive($page,$relativeUrl){

	
}

function onCreate($page,$relativeUrl){
	
	var $form = $page.find(".detail_form");
	var $table = $("#data_mt_un_org_dataTable");
	//虚拟运行商
	var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
	$page.find('input[name="vnoId"]').val(vnoId);
	$page.find('input[name="vnoName"]').val(vnoName);
	
	//默认状态
	$form.data('default',{});
	
	//校验
	var validator=$form.validate({
		//校验后会变形，调整在下方
		errorPlacement : function(error, element) {
			if (element.parent().hasClass("input-group")) {
				error.appendTo(element.parent().parent());
			}else{
				error.appendTo(element.parent());
			}
		}});
	$form.on('click',".btn-class-ok",function(e){
		 if (!$form.valid()){
	            return;
	        }
		var obj = $form.serializeObject();
		var method = $form.status() == "new" ? 'insert' : 'modify';
		var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';

		svc.call(method,[obj],function(){
			jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			BootstrapDialog.success(msg);
			$form.status('show');
		});
	});

	var jqGrid = $table.jqGrid({
	    url: wboss.getWay + '/data/com.wboss.wcb.unicom.UnicomOrgSvc?m=queryForJqGrid.object.object',
	    colModel: [
	   	        { label: '编号', name: 'unicomOrgId',width: 200},
{ label: '名称', name: 'orgName',width: 200},
{ label: '省份', name: 'province',width: 200},
{ label: '城市', name: 'city',width: 200},
{ label: '区/县', name: 'district',width: 200},
{ label: '创建日期', name: 'createDate',width: 200},

	   	    ],
	    onSelectRow:function(rowId){
	    	//选中行是,编辑按钮可编辑
	    	$page.find(".btn-class-edit").prop('disabled', false);
	    	//清除之前的校验信息
	    	validator.resetForm();
	    	//获取选中行信息
	    	var data = jqGrid.griddata.rows[rowId-1];
	    	$form.deSerializeObject(data).status('show');
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
	    	//页面加载时，编辑不可用
	    	$page.find(".btn-class-edit").prop('disabled', true);
	    },
	    pager: "#data_mt_un_org_jqGridPager"
	});
}

return { onCreate : onCreate, onActive : onActive };
});


