define(function() {
	var productOfferSvc = new Service('com.wboss.wcb.offermgr.ProductOfferSvc');
	var custMgrSvc = new Service('com.wboss.wcb.custmgr.CustmgrSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	var custdetail;
	var orderNums = '';
	
	function onActive($page, $relativeUrl) {
	}

	function onCreate($page, $relativeUrl) {
		var $form = $page.find(".detail_form");
		
		//默认客户类型：正式用户
		$page.find('select[name="custType"]').val("CT3");
		//默认证件类型：身份证
		$page.find('select[name="identityType"]').val("I00");
		//默认性别：男
		$page.find('select[name="custSex"]').val("S00");
		//跨域限制：否
		$page.find('select[name="domainLimit"]').val("F");
		
		//表单验证初始化
		var validator = $form.validate();
		var $table = $("#cust_productOffer_dataTable"); 
		var vnoId=$page.find('input[name="vnoId"]').val();
		
		var jqGrid = $table.jqGrid({
					url : wboss.getWay + '/data/com.wboss.wcb.offermgr.ProductOfferSvc?m=queryAllProductOfferInstance.object.object',
					postData : {param:JSON.stringify({vnoId: vnoId})},
					multiselect : true,
					recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
					autowidth:true,
					colModel : [
							{label : '商品标识',name : 'offerId',width : 100,key : true,hidden : true},
							{label : '商品名称',name : 'offerName'},
							{label : '生命周期单位',name : 'lifecycleUnit',hidden:true},
							{label : '商品周期',name : 'lifecycleValue',hidden:true},
							{label : '使用类型',name : '_useType'},
							{label : '商品周期',name : '_lifecycleValue'},
							{
								label : '订购数量',
								name : 'orderNum',
								formatter : function(cellValue, options, row) {
									var clazz = row.offerId + "_orderNum";
									var s = "<input type='text' class='"
											+ clazz
											+ " ' name='orderNum' value='1' style='width:207px;'  onkeyup='onChangeInput("+row.offerId+",this.value)' />";
									return s;
								},
								sortable : false
							}, {
								label : '生效时间',
								name : 'effDate',
								formatter : function(cellValue, options, rowObject) {									
									//生效时间默认为当前时间,可以向后修改
									var today = new Date().toString('yyyy-MM-dd hh:mm:ss');
					   	        	var clazz='effDate_'+options.rowId;
					   	        	return ['<div ', 'class="', clazz, '" >',
					   	        	        '<input inputtype="',rowObject.offerId,'" type="text" value="', today, '" class="datepicker"   style="width:240px;"  />',
					   	        	        '</div>'].join('');							
								},
							}, {
								label : '失效时间',
								name : 'expDate',
								formatter : function(cellValue, options, rowObject) {
									if(rowObject.lifecycleValue==''||rowObject.lifecycleValue==null){return '永久使用';}								
									var today = new Date().toString('yyyy-MM-dd hh:mm:ss');
							 		var expDate=new Date(today);
							 		 
									  var result=(parseInt(rowObject.lifecycleValue)*1);
								      var clazz = rowObject.offerId + "_expDate";
									  var finalDate=new Date(expDate);
									  if(rowObject.lifecycleUnit=="HOU"){
										  finalDate.setHours(expDate.getHours()+result); 
										}else if(rowObject.lifecycleUnit=="DAY"){
											   finalDate.setDate(expDate.getDate()+result);
										}else if(rowObject.lifecycleUnit=="MON"){
											finalDate.setMonth(expDate.getMonth()+result); 
							    	  }
									
									return "<input type='text' disabled class='"+ clazz+ "' name='expDate' value='"+finalDate+"' style='width:207px;'/>";
								},
							},{label : '', name : 'vnoId',hidden : true},
							{label : '企业名称',name : 'vnoName',sortable : false}
							],
					onPaging : function() {
					},
					onSortCol : function() {
					},
					loadComplete : function(data) {						
						var identityCode=$page.find('input[name="identityCode"]');
						identityCode.rules("add",{isIdCardNo:true,messages:{isIdCardNo:'身份证号格式不正确'}});
												
						
						//默认选中1个商品
						jqGrid.jqGrid('setSelection',0);
						
						$table.find('.datepicker').each(function(i,e){
				             var $timeInput = $(e);
				             var format = $timeInput.data('format') || 'YYYY-MM-DD HH:mm:ss';
				             $timeInput.datetimepicker({format:format,minDate: new Date()});
				             
				             //时间控件选择框事件
				             $timeInput.on('dp.change', function(e){
					            	 //当前时间
				            	      var effDate=e.date._d;
				            	      //当前offerId
				            	      var offerId=e.delegateTarget.attributes.inputtype.nodeValue;
					     	    	//生效时间变化，失效时间随之变化
					     			var rowData = jqGrid.jqGrid("getRowData",offerId);
					     			if(rowData.lifecycleValue==''||rowData.lifecycleValue==null){return;}
				            	 
					     			//获取订购数量
					     			 var clazz = rowData.offerId + "_orderNum";
							         var num=$page.find("."+clazz).val();
					     			if(num){
					     	    	//计算失效时间(rowId)=生效时间+商品周期*订购数量
					     			  var effDate=e.date._d;
					     				
					     			  var expDate=new Date(effDate);
					     			  var result=(parseInt(rowData.lifecycleValue))*(parseInt(num));
					     			  var finalDate=new Date(expDate);
					     			  if(rowData.lifecycleUnit=="HOU"){
					     				  finalDate.setHours(expDate.getHours()+result); 
					     			         var clazz = rowData.offerId + "_expDate";
					     			         $page.find("."+clazz).val(finalDate);
					     				}else if(rowData.lifecycleUnit=="DAY"){
					     					   finalDate.setDate(expDate.getDate()+result);
					     				         //往失效时间文本框内赋值
					     				         var clazz = rowData.offerId + "_expDate";
					     				         $page.find("."+clazz).val(finalDate);
					     				}else if(rowData.lifecycleUnit=="MON"){
					     					finalDate.setMonth(expDate.getMonth()+result); 
					     			         var clazz = rowData.offerId + "_expDate";
					     			         $page.find("."+clazz).val(finalDate);
					     	    	  }
					     			}
					     			});
				         });
					},
					pager : "cust_productOffer_jqGridPager",
					rowList:[5,10],
					rowNum:5,
					height:160
				});
		
		$page.find('.vno-popwin').on("click",function(e){
			var $container = $(this);
			var $input = $container.find('.pop-win-contoller');
			var isRemove = $(e.target).children('.glyphicon').hasClass('glyphicon-remove') || $(e.target).hasClass('glyphicon-remove');
			if(isRemove){
				$container.deSerializeObject({});
				return;
			}
			$container.find("input").each(function(i,e){
				var $e = $(e);
				$e.data('backup',$e.val());
			});
			
			require(["/admin/popwin/js/vno.js"],function(popwin) {
				window.popwin = popwin;
				var initialData = $container.serializeObject();
		 		popwin.createPopWin(null,initialData).on("ok",function(d){
		 			$container.find("input").each(function(i,e){
						var $e = $(e);
						$e.val(d[$e.attr("name")]);
						
						var postData = jqGrid.jqGrid("getGridParam", "postData");
					  	postData.param = JSON.stringify({vnoId: d.vnoId});
					  	jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					}); 			
		 		}).on("cancel",function(d){
					$container.find("input").each(function(i,e){
						var $e = $(e);
						$e.val($e.data('backup'));
					})		
		 		});
			});
			return false;
		});
		
		//1、“订购数量”文本框内容自动改变事件
		window.onChangeInput=function(offerId,num){
	    	//订购数量变化，失效时间随之变化
			var rowData = $("#cust_productOffer_dataTable").jqGrid("getRowData",offerId);
			if(rowData.lifecycleValue==''||rowData.lifecycleValue==null){return;}
			if(num){
	    	  //计算失效时间(rowId)=生效时间+商品周期*订购数量
              
			  var effDate = $page.find('.effDate_'+offerId).find('input').val();
			  var expDate=new Date(effDate);
			  var result=(parseInt(rowData.lifecycleValue))*(parseInt(num));
			  var finalDate=new Date(expDate);
			  if(rowData.lifecycleUnit=="HOU"){
				  finalDate.setHours(expDate.getHours()+result); 
			         var clazz = rowData.offerId + "_expDate";
			         $page.find("."+clazz).val(finalDate);
				}else if(rowData.lifecycleUnit=="DAY"){
					   finalDate.setDate(expDate.getDate()+result);
				         //往失效时间文本框内赋值
				         var clazz = rowData.offerId + "_expDate";
				         $page.find("."+clazz).val(finalDate);
				}else if(rowData.lifecycleUnit=="MON"){
					finalDate.setMonth(expDate.getMonth()+result); 
			         var clazz = rowData.offerId + "_expDate";
			         $page.find("."+clazz).val(finalDate);
	    	  }
			}
	    } 
		
		//2、下拉框的选择事件
		$form.on('change','select[name="identityType"]',function(e){
			//根据用户的选择获取下拉框的值
			var identityType=$page.find('select[name="identityType"] option:selected').val();
			//获取元素"证件号"
			var identityCode=$page.find('input[name="identityCode"]');
			identityCode.val('');
			//学生证
			if(identityType=="I01"){
				identityCode.rules("remove");
				identityCode.rules("add",{isNumber8:true,minlength:8,messages:{isNumber8:"学生证号必须全数字",minlength:"最小长度为8"}});
			}else if(identityType=="I02"){  //护照
				identityCode.rules("remove");
				identityCode.rules("add",{isPassport:true,messages:{isPassport:"护照号格式不正确"}});
			}else if(identityType=="I03"){ //军官证
				identityCode.rules("remove");		
				identityCode.rules("add",{minlength:6,maxlength:8,messages:{minlength:"最小长度为6",maxlength:"最大长度为8"}});
			}else{  //身份证
				identityCode.rules("remove");
				identityCode.rules("add",{isIdCardNo:true,messages:{isIdCardNo:'身份证号格式不正确'}});
			}	
			$page.find('select[name="identityType"]').val(identityType);
		});
		
		//3、文本框自动填充
		$page.find("input[name='custCode']").blur(function(){
			var custCode=$page.find("input[name='custCode']").val();
			$page.find("input[name='custName']").val(custCode);
			$page.find("input[name='mobilePhone']").val(custCode);
		});
		
		//4、口令生成方式
		$form.on('change','select[name="passType"]',function(e){
			//根据用户的选择获取下拉框的值
			var passType=$page.find('select[name="passType"] option:selected').val();
			//获取元素"证件号"
			var password=$page.find('input[name="password"]');
			var mobilePhone=$page.find('input[name="mobilePhone"]');
			//手动输入，此时手机号可以为空  0:随机，1:输入
			if(passType==1){
				$page.find('input[name="password"]').prop('disabled',false);
				$page.find('input[name="password"]').val('123456');
				mobilePhone.rules("remove");
				password.rules("remove");
				password.rules("add",{required:true,isPassword:true,messages: {required:'请输入内容',isPassword:'密码为6-10位的字母或数字'}});
			}else{
				//随机生成，此时手机号必填，且密码框置灰
				$page.find('input[name="password"]').val('');
				$page.find('input[name="password"]').prop('disabled',true);
				password.rules("remove");
				mobilePhone.rules("remove");
				mobilePhone.rules("add",{required:true,messages: {required:'请输入手机号'}});
			}});

		// 开户提交
		$page.find(".add_cust_btn").click(
				//1、验证表单内容合法性
				function() {	
					var passType=$page.find('select[name="passType"] option:selected').val();
					//获取元素"证件号"
					var password=$page.find('input[name="password"]');
					var mobilePhone=$page.find('input[name="mobilePhone"]');
					//手动
					if(passType==1){
						mobilePhone.rules("remove");
						password.rules("remove");
						password.rules("add",{required:true,isPassword:true,messages: {required:'请输入内容',isPassword:'密码为6-10位的字母或数字'}});
					}
					
					var identityCode=$page.find('input[name="identityCode"]');
					identityCode.rules("remove");
					identityCode.rules("add",{isIdCardNo:true,messages:{isIdCardNo:'身份证号格式不正确'}});
					if (!$form.valid()) {
						return;
					}
					var offerIds = jqGrid.jqGrid('getGridParam', 'selarrrow');
					if(offerIds==null||offerIds==''){
						  BootstrapDialog.show({
				                type: BootstrapDialog.TYPE_DANGER,
				                title: '请选择商品',
				                message: '请选择商品',
				                buttons: [{
				                	label: '确定',action: function(dialogItself){
				                    dialogItself.close();
				                }}]
						  });
							//默认选中1个商品
							jqGrid.jqGrid('setSelection',0);
						return ;
					}
			
					if(offerIds.length>1){
					BootstrapDialog.confirm({title:'友情提示', btnOKLabel:'确定', btnCancelLabel:'取消', message:'您选择了'+offerIds.length+'个套餐哦', callback: function(flag){
						if(flag){
							regCust();
						}
					}});
					}else{
						regCust();
					}
					
					function regCust(){
						var orderNums = [];
						for (var i = 0; i < offerIds.length; i++) {
							orderNums.push($page.find(
									'.' + offerIds[i] + '_orderNum').val());
						}
						
						//2、验证表格中订购数量是否为全数字
						var tipMsg="";
					    for(var i=0;i<orderNums.length;i++){
					    	if(!orderNums[i]){
					    		tipMsg="订购数量不能为空";
					    		showTipMsg();
					    		return ;
					    	}else if(isNaN(orderNums[i])){
					    		tipMsg="订购数量必须为全数字";
					    		showTipMsg();
					    		return ;
					    	}else if(orderNums[i]<1){
					    		tipMsg="订购数量必须大于等于1";
					    		showTipMsg();
					    		return ;
					    	}
					    }
						
						function showTipMsg(){
							  BootstrapDialog.show({
					                type: BootstrapDialog.TYPE_DANGER,
					                title: '订购数量格式不正确',
					                message: tipMsg,
					                buttons: [{
					                	label: '确定',action: function(dialogItself){
					                    dialogItself.close();
					                }}]
							  });
						}
						custdetail = $form.serializeObject();
						custdetail.offerIds = offerIds.join(',');
						custdetail.orderNums = orderNums.join(',');
						var staffId=model.user().userId();
						custdetail.staffId=staffId;
						// 注册新顾客，插入商品订购实例
						var pwdType=$page.find('select[name="pwdType"] option:selected').val();
						custMgrSvc.call('regCustBatOffers', [custdetail],
								function(res) {
									BootstrapDialog.success('开户成功!');
								});
					}
					

				});
	}
	return {
		onCreate : onCreate,
		onActive : onActive
	};
});
