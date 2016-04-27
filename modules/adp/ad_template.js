define(function () {
//方法
var svc = new Service('com.wboss.wcb.admin.ad.AdShowTemplateSvc');
var sysparam = new Service("com.wboss.general.param.SysParamSvc");
wboss.addDic("DIC_TMP_TYPE","DIC_TMP_TYPE_NEW",{v:"",n:"全部"});
function onActive($page,$relativeUrl){

	
}

function onCreate($page,$relativeUrl){
	
	
	
	var $form = $page.find(".detail_form");
	var $table = $("#adp_ad_template_dataTable");
	//默认状态
	$form.data('default',{showMode:"90A",tmpType:"I",status:"00A"});
	
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
		var method = $form.status() == "new" ? 'insertAdShowTemplate' : 'modifyAdShowTemplate';
		var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';

		svc.call(method,[obj],function(){
			jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			BootstrapDialog.success(msg);
			$form.status('show');
		});
	});
	var jqGrid = $table.jqGrid({
	    url: '/data/com.wboss.wcb.admin.ad.AdShowTemplateSvc?m=queryAdShowTemplateList4Jq.object.object',
	    colModel: [
	   	        { name: 'showTemplateId',hidden:true},
				{ label: '页面名称', name: 'templateName'},
				{ label: '展现模式', name: '_showMode'},
				{ label: '页面类型', name: '_tmpType'},
				{ label: '广告模板图片', name: 'picUrl'},
				{ label: '缩略图', name: 'smallPicUrl'},
				{ label: '展现时长(秒)', name: 'showDuration'},
				{ label: '展现网页', name: 'showPage'},
				{ label: '模板描述', name: 'templateDesc'},
				{ label: '创建日期', name: 'createDate'},
				{ label: '更新日期', name: 'statusDate'}
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
	    pager: "#adp_ad_template_jqGridPager"
	});
}

return { onCreate : onCreate, onActive : onActive };
});


