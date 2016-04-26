define(function () {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	var adMgr = new Service("com.wboss.wcb.admin.ad.AdMgrSvc");
	var adPolicy = new Service("com.wboss.wcb.admin.ad.AdGetPolicySvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new adPositionPopWin(initialData);
			var showTemplateId = popWin.initialData.showTemplateId;
			popWin.$dialog = BootstrapDialog.show({
				title:'广告位配置',
		        message: $('<div></div>').load('/admin/popwin/ad_position_instance.html'),
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
		                  	popWin.$dialog.close();
		                }
		            }
		        ]
		    });
		    return popWin;
		}
	};

	
	function adPositionPopWin(initialData){
		this.$dialog = null;
		this.jqGrid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	adPositionPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}
	adPositionPopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var $adPositionId = '';
		var jqGridContent = '';
		var $adPositionType = '';
		var $adType = '70A';
		var $formContent = $page.find(".detail_content_form");
		var $tableContent = $("#ad_instance_dataTable");
		//校验
		var validator=$formContent.validate();
		//富文本编辑器初始化
		var editor;
		self.jqGrid = $("#ad_position_dataTable").jqGrid({
			url :'/data/com.wboss.wcb.admin.ad.AdMgrSvc?m=qryAdFixedPositionByJq.object.object',
			datatype:'local',
		    colModel: [
		        {label : '',name : 'adPositionId',hidden:true},
		        {label : '广告位类型',name : '_adPositionType' },
				{label : '广告位名称',name : 'adPositionName'}, 
				{label : '广告位置',name : 'showTagId'},
				{label : '广告切换',name : '_switchFlag'},
				{label : '切换时长',name : 'switchTime'},
				{label : '广告大小',name : 'adSize'},
				{label : '广告描述',name : 'adDesc',hidden:true},
				{label : '是否允许VNO配置',name : 'isAllowVno',hidden:true},
				{label : '是否允许配置URL',name : 'isAllowLink',hidden:true},
				{label : '实例限制',name : 'insLimit'}
		    ],
		    onSelectRow : function(rowId) {
		    	var data = self.jqGrid.jqGrid("getRowData", rowId);
		    	//获取adPositionId
	        	$adPositionId = data.adPositionId;
	        	//获取广告位类型
	        	 $adPositionType = data._adPositionType;
	        	 $page.find("input[name='adPositionId']").val($adPositionId);
		    	//把参数传到另一个jqGrid 另一个jqGrid调用参数并刷新
		    	var postData = jqGridContent.jqGrid("getGridParam", "postData");
				postData.param = JSON.stringify({adPositionId: data.adPositionId});
				jqGridContent.jqGrid("setGridParam", {datatype:'json',search:true}).trigger("reloadGrid", [{ page: 1}]);
				
		    	switch($adPositionType){
		    	case "第三方广告平台连接":
		    		//先判断编辑器是否绑定，如果绑定了，先移除，再绑定
		    		if( CKEDITOR.instances['adContent'] ){ 
		    			CKEDITOR.instances['adContent'].destroy();
		    		}
			    		CKEDITOR.replace('adContent');
			    	    CKEDITOR.on('instanceReady', function(ev) {
			    	       editor = ev.editor;
			    	       editor.setReadOnly( true );
			    	       editor.setData('');
			    	    });
		    		$page.find("select[name='adType']").val("70A").css("select","selected");
		    		$page.find(".adContent").css("display","block");
		    		$page.find(".adLink").css("display","block");
		    		break;
		    	case "默认":
		    		//先判断编辑器是否绑定，如果绑定了，先移除，再绑定
		    		if( CKEDITOR.instances['adContent'] ){ 
		    			CKEDITOR.instances['adContent'].destroy();
		    		}
			    		CKEDITOR.replace('adContent');
			    	    CKEDITOR.on('instanceReady', function(ev) {
			    	       editor = ev.editor;
			    	       editor.setReadOnly( true );
			    	       editor.setData('');
			    	    });
		    		$page.find(".adContent").css("display","block");
		    		$page.find(".adLink").css("display","block");
		    		$page.find(".adFile").css("display","none");
		    		$page.find("select[name='adType']").val("70A").css("selected","selected");
		    		$adType = '70A';
		    		break;
		    	case "图片类型":
		    		if(CKEDITOR.instances['adContent']){
		    			CKEDITOR.instances['adContent'].destroy();
		    		}
		    		CKEDITOR.replace('adContent',{toolbar:[['fileImage']]});
		    		CKEDITOR.on('instanceReady', function(ev) {
		    	       editor = ev.editor;
		    	       editor.setReadOnly( true );
		    	       editor.setData('');
		    	    });
		    	    $page.find(".adContent").css("display","block");
		    		$page.find(".adLink").css("display","block");
		    		$page.find(".adFile").css("display","none");
		    		$page.find("select[name='adType']").val("70B").css("selected","selected");
		    		$adType = '70B';
		    		break;
		    	}
		    },
		    pager: "#ad_position_jqGridPager",
		    height: '300px'
		});
		//进入根据showTemplateId查询
		var postData = self.jqGrid.jqGrid("getGridParam", "postData");
		postData.param = JSON.stringify(self.initialData);
		self.jqGrid.jqGrid("setGridParam", {datatype:'json',search:true}).trigger("reloadGrid", [{ page: 1}]); 
		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName();
		//虚拟运营商初始化
		$formContent.find('input[name="vnoId"]').val(vnoId);
		$formContent.find('input[name="vnoName"]').val(vnoName);
		//设置默认值
		$formContent.data('default',{adSvcType:"POR",imgShowType:"G00",showScene:"900",status:"000",filetype:"img",vnoId:vnoId,vnoName:vnoName});
	
	    var ad = "";
	    $formContent.on('click',".btn-class-new",function(e){
	    	$formContent.data('default',{adSvcType:"POR",imgShowType:"G00",showScene:"900",status:"000",filetype:"img",adType:$adType,vnoId:vnoId,vnoName:vnoName});
	    	if(editor!=null){
	    	editor.setReadOnly( false );
	    	ad = editor.getData();
	    	editor.setData('');
	    	}
		});
	    $formContent.on('click',".btn-class-edit",function(e){
	    	if(editor!=null){
	    	editor.setReadOnly( false );
	    	ad = editor.getData();
	    	}
		});
	    $formContent.on('click',".btn-class-cancel",function(e){
	    	if(editor!=null)
	    		editor.setReadOnly( true );
	    	if(ad!='')
	    	    editor.setData(ad);
	    	
	    });
	    //新增修改删除点击事件
		$formContent.on('click', ".btn-class-ok",
				function(e) {
					if (!$formContent.valid()) {
						return;
					}
					var adInstance = $formContent.serializeObject();
					adInstance.adPositionId = $adPositionId;
					if($adPositionId==""){
						BootstrapDialog.success("没有对应的广告位！,请选择广告位！");
						return;
					}
					adInstance.adContent=editor.getData();
					//判断获取到的商户是新增或是修改
					var temp = JSON.parse(adInstance.temp);
					var add = [];
					var edit = [];
					var del = [];
					for(var i=0;i<temp.length;i++){
							if(temp[i].flag=="add")
								add.push(temp[i]);
							else if(temp[i].flag=="edit")
								edit.push(temp[i]);
							else if(temp[i].flag=="del")
								del.push(temp[i]);
            			}
					//广告运营商
					if(temp!=""){
						adInstance.alNewVnoAdIssueInstancePo = add;
						adInstance.alUpdateVnoAdIssueInstancePo = edit;
						adInstance.alDelVnoAdIssueInstancePo = del;
					}
					//删除方法
					if(adInstance.status == '00X'){
						adMgr.call("delAdInstance", [ adInstance.adInstanceId ], function() {
							jqGridContent.jqGrid("setGridParam", {
								search : true
							}).trigger("reloadGrid", [ {
								page : 1
							} ]);
							BootstrapDialog.success("删除成功!");
							$formContent.status('show');
							editor.setReadOnly( true );
					});
					}else{
					//新增修改方法
					var method = $formContent.status() == "new" ? 'addAdInstance'
							: 'updateAdInstance';
					var msg = $formContent.status() == "new" ? '添加成功！' : '更新成功！';
					adMgr.call(method, [ adInstance ], function() {
						jqGridContent.jqGrid("setGridParam", {
							search : true
						}).trigger("reloadGrid", [ {
							page : 1
						} ]);
						BootstrapDialog.success(msg);
						$formContent.status('show');
						  editor.setReadOnly( true );
					});
					}
				});
		
		jqGridContent = $tableContent.jqGrid({
			url : '/data/com.wboss.wcb.admin.ad.AdMgrSvc?m=qryAdInstanceByJqGrid.object.object',
			datatype: 'local',
			colModel : [
					{name : 'adInstanceId',hidden : true},
					{name : 'adPositionId',hidden:true},
					{label : '广告名称',name :'adName'},
					{name :'adLink',hidden:true},
					{name :'adContent',hidden:true},
					{label : '广告推送获取策略',name :'getPolicyIds',hidden:true},
					{label : '广告推送获取策略',name :'policyNames',sortable : false},
					{label : '广告服务类型',name : '_adSvcType'},
					{label : '广告类型',name : '_adType'},
			   	    {label : '状态',name : '_status'},
					{label : '',name : 'vnoId',hidden : true},
					{label : '企业名称',name : 'vnoName',sortable : false,width : 200}
					],
			onSelectRow : function(rowId) {
				//清除之前的校验信息
				validator.resetForm();
				var data = jqGridContent.adInstance.rows[rowId-1];
				var content = data.adContent;
				var adInstanceId = data.adInstanceId;
				$page.find("input[name='adInstanceId']").val(adInstanceId);
			   	$page.find(".btn-class-edit").prop('disabled', false);
			   	editor.setData(content);
		    	//设置表单状态，目前有new，edit，show三种状态，
		    	$formContent.deSerializeObject(data).status('show');
		    	//把广告发布商传递到页面上
		    	var vnoNames = [];
				var issueInstanceId =[];
				var temp = [];
				adMgr.call('qryVnoAdIssueInstanceById', [adInstanceId], function(res) {
					for ( var i in res) {
						vnoNames.push(res[i].vnoName);
						issueInstanceId.push(res[i].issueInstanceId);
						temp.push(res[i]);
					}
					//反序列化把值带到页面上
					data.vnoNames=vnoNames.join(",");
					data.issueInstanceId=issueInstanceId;
					data.temp = JSON.stringify(temp);
					$formContent.deSerializeObject(data).status('show');
				});
		    	
			},
			onPaging : function() {
				$formContent.status('show');
			},
			onSortCol : function() {
				$formContent.status('show');
			},
			loadComplete : function(data) {
				jqGridContent.adInstance = data;
				$formContent.status('show');
				//页面加载时，编辑不可用
				$formContent.find(".btn-class-edit").prop('disabled', true);
			},
			pager : "#ad_instance_jqGridPager"
		});
		debugger
		(cb || function(){})();
	}
	
	return module;
});