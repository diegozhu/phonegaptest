define(function () {
	var timeSpanSvc = new Service('com.wboss.wcb.rating.config.TimeSpanCfgSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	
function onActive($page,$relativeUrl){
			
}
function onCreate($page,$relativeUrl){
	var begin = $page.find("input[name='beginTime']").datetimepicker({ format: 'YYYY-MM-DD HH:mm:ss'});
	var end = $page.find("input[name='endTime']").datetimepicker({ format: 'YYYY-MM-DD HH:mm:ss'});
	var $form = $page.find(".detail_form");
	var myDate = new Date();
	var defaultYMD = myDate.toString('yyyy-MM-dd');
	var defaultbtime = defaultYMD+' 00:00:00';
	var defaultetime = defaultYMD +' 23:59:59';
	var $table = $page.find("#cfg_time_policy_dataTable");
	var $begin = $page.find('input[name="beginTime"]'), $end = $page.find('input[name="endTime"]'),
	$wek = $page.find('select[name="wek"]');
	var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
	$page.find('input[name="vnoName"]').val(vnoName);
	$page.find('input[name="vnoId"]').val(vnoId);
	
	$form.find('input[name="vnoId"]').val(vnoId);
	$form.find('input[name="vnoName"]').val(vnoName);
	//初始值
	var defData = {timeSpanType:'DAY', wek: '2016-01-04', vnoId: vnoId, vnoName: vnoName, beginTime: '00:00:00', endTime: '23:59:59'};
	$form.data('default', defData);
	$form.deSerializeObject(defData);
	$wek.hide();
	//验证
	var validator = $form.validate();
	
	//change
	$page.find('select[name="timeSpanType"]').change(function(){
		if(this.value == "DAY"){
			begin.data('DateTimePicker').format('HH:mm:ss');
			end.data('DateTimePicker').format('HH:mm:ss');
			$begin.val('00:00:00');
			$end.val('23:59:59');
			$wek.parent().removeClass('col-lg-4');
			$begin.parent().removeClass('col-lg-8');
			$wek.hide();
			
		}else if(this.value == 'MON'){
			begin.data('DateTimePicker').format('YYYY-MM-DD HH:mm:ss');
			end.data('DateTimePicker').format('YYYY-MM-DD HH:mm:ss');
			$begin.val(defaultbtime);
			$end.val(defaultetime);
			$wek.parent().removeClass('col-lg-4');
			$begin.parent().removeClass('col-lg-8');
			$wek.hide();
		}else if(this.value == 'WEK'){
			begin.data('DateTimePicker').format('HH:mm:ss');
			end.data('DateTimePicker').format('HH:mm:ss');
			$begin.val('00:00:00');
			$end.val('23:59:59');
			$wek.parent().addClass('col-lg-4');
			$begin.parent().addClass('col-lg-8');
			$wek.show();
		}
		$wek.val('2016-01-04');
	});
	
	//新增事件
	$form.on('click',".btn-class-new",function(e){
		$wek.hide();
		$begin.parent().removeClass('col-lg-8');
		var $form = $($(e.target).parents("form")[0]);
		$form.status('new');
		$form.data('backup',$form.serializeObject());
		if($form.data('default') != undefined){
			$form.deSerializeObject($form.data('default'));
		}
		begin.data('DateTimePicker').date('00:00:00').format('HH:mm:ss');
		end.data('DateTimePicker').date('23:59:59').format('HH:mm:ss');
		$begin.val('00:00:00');
		$end.val('23:59:59');
		return false;
	});
	
	//取消事件
	$form.on('click',".btn-class-cancel",function(e){
		var data = $($(e.target).parents("form")[0]).data('backup');
		
		if(data.timeSpanType == "WEK"){
			$wek.show();
			$wek.parent().addClass('col-lg-4');
			$begin.parent().addClass('col-lg-8');
			return;
		}
		
		$wek.hide();
		$wek.parent().removeClass('col-lg-4');
		$begin.parent().removeClass('col-lg-8');
	});
	
	//新增修改
	$form.on('click',".btn-class-ok",function(e){
		if(!$form.valid()){
			return;
		}
		if($begin.val()>$end.val()){
			BootstrapDialog.alert({title:'时间提示', message:'开始时间必须小于结束时间'});
			return;
		}
		var timespan = $form.serializeObject();
		if(timespan.timeSpanType == 'WEK'){
			timespan.beginTime = $wek.val()+' '+$begin.val();
			timespan.endTime = $wek.val()+' '+$end.val();
		}
		if(timespan.timeSpanType == 'DAY'){
			timespan.beginTime = defaultYMD +' '+$begin.val();
			timespan.endTime = defaultYMD+' '+$end.val();
		}
		var method = $form.status() == "new" ? 'insertTimeSpanInfo' : 'updateTimeSpanInfo';
		var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';

		timeSpanSvc.call(method,[timespan],function(){
			jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			BootstrapDialog.success(msg);
			$form.status('show');
		});
	});
	
	//加载行数据，根据时间类型展示
	var loadRow = function(data){
		if(data.timeSpanType == 'DAY'){
			begin.data('DateTimePicker').format('HH:mm:ss');
			end.data('DateTimePicker').format('HH:mm:ss');
			$begin.val(data.beginTime.toDate().toString('HH:mm:ss'));
			$end.val(data.endTime.toDate().toString('HH:mm:ss'));
			$wek.parent().removeClass('col-lg-4');
			$begin.parent().removeClass('col-lg-8');
			$wek.hide();
    	}if(data.timeSpanType == 'MON'){
    		begin.data('DateTimePicker').format('YYYY-MM-DD HH:mm:ss');
			end.data('DateTimePicker').format('YYYY-MM-DD HH:mm:ss');
    		$begin.val(data.beginTime.toDate().toString());
			$end.val(data.endTime.toDate().toString());
			$wek.parent().removeClass('col-lg-4');
			$begin.parent().removeClass('col-lg-8');
			$wek.hide();
    	}
    	if(data.timeSpanType == 'WEK'){
    		var wek=data.beginTime.toDate().toString('yyyy-MM-dd');
    		$wek.val(wek);
    		begin.data('DateTimePicker').format('HH:mm:ss');
			end.data('DateTimePicker').format('HH:mm:ss');
    		$begin.val(data.beginTime.toDate().toString('HH:mm:ss'));
    		$end.val(data.endTime.toDate().toString('HH:mm:ss'));
    		$wek.parent().addClass('col-lg-4');
			$begin.parent().addClass('col-lg-8');
    		$wek.show();
    	}
	};
	var jqGrid = $("#cfg_time_policy_dataTable").jqGrid({
		    url: wboss.getWay + '/data/com.wboss.wcb.rating.config.TimeSpanCfgSvc?m=queryTimeSpanList4Jq.object.object',
		    colModel: [
		        {name:"timeSpanId",hidden:true},
		        { label: '时段名称', name: 'timeSpanName'},
		        { label: '时段类型', name: '_timeSpanType'},
		        { label: '时段描述', name: 'comments'},
		        { label: '开始时间', name: '_beginTime'},
		        { label: '结束时间', name: '_endTime'},
		        { name: 'staffId',hidden:true},
		        { name: 'vnoId',hidden:true},
		        { label:'企业名称', name: 'vnoName',sortable:false}
		    ],
		    onSelectRow:function(rowId){
		    	//清除之前的校验信息
				validator.resetForm();
		    	var data = jqGrid.griddata.rows[rowId-1];
		    	$page.find(".btn-class-edit").prop('disabled', false);
		    	$form.deSerializeObject(data).status('show');
		    	loadRow(data);
		    	
		    },
		    onPaging:function(){
		    	$form.status('show');
		    },
		   	onSortCol:function(){
		    	$form.status('show');
		    },
		   	loadComplete:function(data){
		   		$page.find(".btn-class-edit").prop('disabled', true);
		   		jqGrid.griddata = data;
		   		$("#cfg_time_policy_dataTable").setSelection(1);
		    	$form.status('show');
		    },
		    pager: "#cfg_time_policy_jqGridPager"
		});
}
return { onCreate : onCreate, onActive : onActive };
});

	
