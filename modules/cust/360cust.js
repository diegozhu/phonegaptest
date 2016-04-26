define(function() {
	var custInfoQuerySvc = new Service('com.wboss.wcb.custinfo.CustInfoQuerySvc');
	var custMgrSvc = new Service('com.wboss.wcb.custmgr.CustmgrSvc');
	var productOfferSvc = new Service('com.wboss.wcb.offermgr.ProductOfferSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
    var deSerializeData;
    var productOfferInstance;
    var currentCust = null;
    var authBindObject=null;
    var $btnEditCustInfo, $editCustInfoForm;
    var staffId=model.user().userId();
	function onActive($page, $relativeUrl) {
	}

	function onCreate($page, $relativeUrl) {
		$btnEditCustInfo = $("#cust_360cust_btnEditCustInfo");
		$editCustInfoForm=$page.find(".formEditCustInfo");
		$btnEditCustInfo.attr('disabled', 'disabled');
		var $cust_360cust_modifyAuthBindObject_form=$page.find("#cust_360cust_modifyAuthBindObject_form");		
		var $form = $page.find("#cust_360cust_custInfoDetailWrap .detail_form");
		$form.status('show');
		var $table = $("#cust_360cust_dataTable");
		//默认情况下隐藏		
		$page.find("#cust_360cust_orderLogdataWrap").hide();
		//tabs和相关业务按钮，改为显示
		$page.find("#cust_360cust_rechargeCardLog").hide();
		$page.find("#cust_360cust_ThdPaymentOrderLog").hide();
		$page.find("#cust_360cust_UserReqResultLog").hide();
		
		//隐藏所有的按钮页面
   		$page.find("#cust_360cust_modifyVno").hide();
   		$page.find("#cust_360cust_modifyPwd").hide();
  		$page.find("#cust_360cust_modifyAuthBindObject").hide();
   		$page.find("#cust_360cust_custInfo").hide();
   		$page.find("#cust_360cust_unRegCust").hide();
   		$page.find("#cust_360cust_custStatus").hide();

   		//客户详细信息
		var jqGrid = $table.jqGrid({
					url : '/data/com.wboss.wcb.custinfo.CustInfoQuerySvc?m=queryCustInfoList4Jq.object.object',
					datatype : 'local',  //禁止自动查询
					shrinkToFit:IsPC(),
					colModel : [ 
					   	   {label : '客户ID', name : 'custId', width:100, hidden : true },
						   {label : '客户账号', name : 'custCode', sortable:false, width : 100 }, 
						  {label : '密码', name : 'password', width : 100, hidden : true}, 
						  {label : '客户名称', name : 'custName', sortable:false },
						  {label : '手机号码', name : 'mobilePhone', sortable:false},
						  {label : '客户类型', name : '_custType', hidden : true}, 
						  {label : '客户性别', name : '_custSex', hidden : true }, 
						  {label : '跨域限制', name : '_domainLimit', hidden : true}, 
						  {label : '注册时间', name : 'registerDate', hidden : true },
						  {label : '证件类型', name : '_identityType', sortable:false},
						  {label : '证件号码', name : 'identityCode', sortable:false },
						  {label : '邮箱', name : 'mailAddr', hidden : true }, 
						  {label : '组织', name : 'orgnizationId', hidden : true}, 
						  {label : '地域', name : 'regionId', hidden : true },
						  {label : '', name : 'vnoId',hidden : true},
						  {label : '企业名称', name : 'vnoName', sortable:false },
						  {label : '状态', name : '_status', hidden : true },
						  {label : '生效时间', name : 'effDate', hidden : true },
						  {label : '失效时间', name : 'expDate', hidden : true }
					], 
					onSelectRow : function(rowId) {
						$btnEditCustInfo.prop('disabled', false);
					    currentCust = jqGrid.griddata.rows[rowId - 1];
					    currentCust.staffId=staffId;
						deSerializeData=$form.deSerializeObject(currentCust);
			        	deSerializeData.status('show');
						
						//当客户状态为注销、归档时，商品受理、停复机、销户、改口令、改关联设备、改虚拟运营商、改客户信息注销按钮均置为灰色,其余可用
						$page.find(".btn_operation").prop("disabled",  currentCust.status=="00U" || currentCust.status=="00X" || currentCust.status=="XXX");
						if(currentCust.status=="XXX"){
							$page.find(".btn[name='custStatus']").prop("disabled",false);
							$page.find(".btn[name='unRegCust']").prop("disabled",false);
						}
						//调用该客户的商品订购实例
						//1、商品订购信息
						var postData = productOfferInstanceGrid.jqGrid("getGridParam", "postData");
					  	postData.param = JSON.stringify(currentCust);
					  	productOfferInstanceGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					
					  	//2、登录鉴权绑定设备信息
						var postData2= authBindObjectGrid.jqGrid("getGridParam", "postData");
						postData2.param = JSON.stringify(currentCust);
					  	authBindObjectGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					  	
//					  	//3、余额收支记录
//						var postData3= balanceOperLogGrid.jqGrid("getGridParam", "postData");
//						postData3.param = JSON.stringify(data);
//						balanceOperLogGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					  	
					  	//4、订单记录信息
						var postData4= orderLogGrid.jqGrid("getGridParam", "postData");
						postData4.param = JSON.stringify(currentCust);
						orderLogGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
						//5.卡充值记录
						var postData5 = RechargeCardLogGrid.jqGrid("getGridParam", "postData");
						postData5.param = JSON.stringify({custId: currentCust.custId});
						RechargeCardLogGrid.jqGrid("setGridParam", {datatype: 'json',search:true}).trigger("reloadGrid", [{ page: 1}]);	
						// 用户上网
						var postData6 = UserReqResultLogGrid.jqGrid("getGridParam", "postData");
						postData6.param = JSON.stringify({custCode : currentCust.custCode
						});
						UserReqResultLogGrid.jqGrid("setGridParam", {datatype : 'json',search : true}).trigger("reloadGrid", [ {
							page : 1
						} ]);
						
						// 6.第三方
						var postData7 = ThdPaymentOrderLogGrid.jqGrid("getGridParam", "postData");
						postData7.param = JSON.stringify({custId : currentCust.custId});
						ThdPaymentOrderLogGrid.jqGrid("setGridParam", {datatype : 'json',search : true}).trigger("reloadGrid", [ {
							page : 1
						} ]);
					},
					loadComplete : function(data) {
						$page.find(".btn_operation").prop("disabled", true);
						 //刚进入页面或者页面查询无结果时，清除所有jqGrid里的数据
					   		if(data.rows && data.rows.length==0){
								//清空表单
								document.getElementById("cust_360cust_editcustinfo").reset();
						    	 //清除所有jqGrid里的数据
					   			if(productOfferInstanceGrid){
									productOfferInstanceGrid.jqGrid("clearGridData");
									authBindObjectGrid.jqGrid("clearGridData");
									orderLogGrid.jqGrid("clearGridData");
									RechargeCardLogGrid.jqGrid("clearGridData");
									ThdPaymentOrderLogGrid.jqGrid("clearGridData");
									//modifyAuthBindObjectGrid.jqGrid("clearGridData");
									UserReqResultLogGrid.jqGrid("clearGridData");
					   			}
						    }

				         //默认直接选中第一行,将当前顾客信息序列化到表单中
						if(data.rows && data.rows.length > 0){
							jqGrid.griddata = data;
							$table.setSelection(1);
						}
					},
				    height: '70px',
					pager:"cust_360cust_jqGridPager"
				});
		
		//商品订购信息
		var  productOfferInstanceGrid = $('#cust_360cust_ProductOfferInstancedataTable').jqGrid({
				url : '/data/com.wboss.wcb.offermgr.ProductOfferSvc?m=queryProductOfferInstance.object.object',
				shrinkToFit:IsPC(),
				colModel: [
				        { label: '商品订购实例标识', name: 'productOfferInstanceId', key: true},
				        { label: '商品', name: 'offerName' },
				        { label: '订购渠道', name: '_orderChannel'},
				        { label: '订购数量', name: 'orderNum'},
				        { label: '生效时间', name: 'effDate'},
				        { label: '失效时间', name: 'expDate'},
				        { label: '状态', name: '_status'},
				        { label: '状态时间', name: 'statusDate'},
				        { label: '创建时间', name: 'createDate'},
				        {label : '', name : 'vnoId',hidden : true},
						{label : '商品订购企业名称',name : 'vnoName',sortable : false},
						{label : '商品归属企业名称',name : 'vnoAreaName',sortable : false}
				    ],
				    height: '69px',
					loadComplete : function(data) {
						//传递数据给商品受理页面
						productOfferInstance = data;
					}
			});
		  
		  //登录鉴权绑定设备信息
		  var  authBindObjectGrid = $('#cust_360cust_authBindObjectdataTable').jqGrid({
				url : '/data/com.wboss.wcb.custinfo.CustInfoQuerySvc?m=queryAuthBindObject.object.object',
				shrinkToFit:IsPC(),
				colModel: [
				        { label: '绑定设备实例标识', name: 'bindObjectId',hidden: true},
				        { label: '设备类型', name: '_deviceType',sortable:false},
				        { label: '绑定类型', name: '_devicePropType',sortable:false},
				        { label: '绑定设备信息', name: 'devicePropValue',sortable:false},
				        { label: '匹配模式', name: '_operType',sortable:false},
				        { label: '状态', name: '_status',sortable:false},
				        { label: '客户端信息', name: 'httpClient',sortable:false},
				        { label: '状态时间', name: 'statusDate',hidden : true},
				        { label: '创建时间', name: 'createDate',hidden : true},
						{label : '', name : 'vnoId',hidden : true},
						{label : '企业名称',name : 'vnoName', sortable : false,hidden : true}
				    ],height: '45px',
					loadComplete : function(data) {					
					   if(authBindObjectGrid){
							var postData3= modifyAuthBindObjectGrid.jqGrid("getGridParam", "postData");
							postData3.param = JSON.stringify(currentCust);
							modifyAuthBindObjectGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
					   }
					}
			});
		  
		  //修改登录鉴权绑定设备信息
		  var  modifyAuthBindObjectGrid = $('#cust_360cust_modifyAuthBindObjectdataTable').jqGrid({
				url : '/data/com.wboss.wcb.custinfo.CustInfoQuerySvc?m=queryAuthBindObject.object.object',
				shrinkToFit:IsPC(),
				colModel: [
				        { label: '绑定设备实例标识', name: 'bindObjectId',hidden: true},
				        { label: '设备类型', name: '_deviceType',sortable:false},
				        { label: '绑定类型', name: '_devicePropType',sortable:false},
				        { label: '绑定设备信息', name: 'devicePropValue',sortable:false},
				        { label: '匹配模式', name: '_operType',sortable:false},
				        { label: '状态', name: '_status',sortable:false},
				        { label: '状态时间', name: 'statusDate',sortable:false},	
				        { label: '创建时间', name: 'createDate',sortable:false},
				        { label: '客户端信息', name: 'httpClient',sortable:false},
						{label : '', name : 'vnoId',hidden : true},
						{label : '企业名称',name : 'vnoName',sortable : false}
				    ],height: '115',
					width:'100%',
				    onSelectRow : function(rowId) {
				   		//选中行时,编辑按钮可用
				    	$page.find(".btn-class-edit").prop('disabled',false);
				    	//清除之前的校验信息
				    	 var validator = $cust_360cust_modifyAuthBindObject_form.validate();
				    	 validator.resetForm();
       				    var data = modifyAuthBindObjectGrid.griddata.rows[rowId-1];
       				    authBindObject=data;
				    	//设置表单状态，目前有new，edit，show三种状态，
					    $cust_360cust_modifyAuthBindObject_form.deSerializeObject(data).status('show');
				    },
				   	loadComplete:function(data){
				   		//编辑按钮默认禁用
				   		if(modifyAuthBindObjectGrid){
				   			modifyAuthBindObjectGrid.griddata = data;
				   		}
				    }
			});
		 
		  
		  //余额收支记录
//		  var  balanceOperLogGrid = $('#cust_360cust_balanceOperLogdataTable').jqGrid({
//			  url : '/data/com.wboss.wcb.custinfo.CustInfoQuerySvc?m=queryBalanceOperLogByCustID.object.object',
//				colModel: [
//				        { label: '余额收支记录标识', name: 'balanceOperLogId',width:60},
//				        { label: '金额', name: 'amount',width:30},
//				        { label: '操作前金额', name: 'beforAmount',width:50},
//				        { label: '余额标识', name: 'acctBalanceId',width:50},
//				        { label: '账户标识', name: 'acctId',width:50},
//				        { label: '操作类型', name: 'operType',width:50,
//				    		formatter: function (cellValue, options, rowObject){
//				   	        	if (cellValue=='A01') {
//									return '收入';
//								}else if (cellValue=='A02'){
//									return '支出';
//								}
//							}		
//				        },
//				        { label: '用途(来源)', name: 'useType',width:50,
//				    		formatter: function (cellValue, options, rowObject){
//				   	        	if (cellValue=='U01') {
//									return '前端存入';
//								}else if (cellValue=='U02'){
//									return '商品购买';
//								}else if (cellValue=='U03'){
//									return '前端支取';
//								}else if (cellValue=='U04'){
//								    return '调账';
//								}
//							}	
//				        },
//				        { label: '状态', name: 'status',width:50,
//				    		formatter: function (cellValue, options, rowObject){
//				   	        	if (cellValue=='5JA') {
//									return '有效';
//								}else if (cellValue=='5JB'){
//									return '冲正';
//								}
//							}	
//				        },
//				        { label: '创建时间', name: 'createDate',width:60},	
//				        { label: '状态时间', name: 'statusDate',width:50}
//				    ],height: '170px',
//				   	loadComplete:function(data){
//				   		if(balanceOperLogGrid)
//				   			balanceOperLogGrid.griddata = data;
//				    }
//			});
		  
		  //订单记录
		  var  orderLogGrid = $('#cust_360cust_orderLogdataTable').jqGrid({
			    url : '/data/com.wboss.wcb.custinfo.CustInfoQuerySvc?m=queryOrderLogPoByCustID.object.object',
			    shrinkToFit:IsPC(),
				colModel: [
				        { label: '订单标识', name: 'orderId',sortable : false},
				        { label: '订单类型名称', name: '_orderType',sortable : false},
				        { label: '办理渠道', name: 'orderChannel',sortable : false},
				        { label: '创建时间', name: 'createDate',sortable : false},
				        { label: '操作员账号', name: 'staffCode',sortable : false},
				        {label: '状态', name: '_status',sortable : false},
				        { label: '状态时间', name: 'statusDate',sortable : false},
				        { label: '订单明细', name: '',sortable : false,
							formatter : function(cellValue, options,
									rowObject) {
								var s="<div class='col-lg-3 col-sm-3 col-md-3 pop-win'><div class='input-group'><input name='orderId' class='passOrderId'  type='hidden' /><button class='btn btn-default bindingandoperate pop-win-contoller' data-pop-win='order_detail_log' type='button' name='orderDetailLog' style='width:195px;margin-left:-18px;'>明细</button></div></div>";
								return s;
							}}
				    ],height: '114px',
				    rowNum:5,
				    rowList:[5], 
				    onSelectRow : function(rowId) {
				    	//获取选中的订单orderId
				    	var  data=orderLogGrid.jqGrid('getRowData',rowId);
	       		        //1、单击明细：
		       		     $page.on("click",".btn[name='orderDetailLog']",function(e){	 
                             //获取该行的订单标识
				        	   $page.find(".passOrderId").val(''+data.orderId);
			        }); 
				    },
				   	loadComplete:function(data){
				   		if(orderLogGrid)
				   		orderLogGrid.griddata = data;
				    },
					pager:"cust_360cust_orderLogPager"
			});
		  
		  //卡密充值日志
		  var  RechargeCardLogGrid = $('#recharge_card_log_orderLogdataTable').jqGrid({
			    url : '/data/com.wboss.wcb.custmgr.ReschargeCardLogSvc?m=queryRechargeCardLogList.object.object',
			    datatype : 'local',  //禁止自动查询
			    shrinkToFit:IsPC(),
				colModel: [
				        { label: '充值卡充值流水号', name: 'rechargeLogId'},
				        { label: '充值时间', name: 'createDate'},
				        
				        { label: '卡号', name: 'cardNo'},
				        { label: '卡金额', name: 'faceValue'},
				        { label: '使用月份', name: 'useMonth'},
				        { label: '手机号', name: 'mobilePhone'},
				        { label: '商品名称', name: 'offerName'},
				        { label: '有效时间', name: 'validTime'},
				        { label: '卡密代理商', name: 'dealer'},
				        { label: '状态', name: '_status'},
				        { label: '企业名称', name: 'vnoName'}
				    ],
				    height: '114px',
				    onSelectRow : function(rowId) {
				    	var  data=RechargeCardLogGrid.jqGrid('getRowData',rowId);
				    },
					pager:"recharge_card_log_orderLogPager"
			});
		  
		//第三方订购记录
			var ThdPaymentOrderLogGrid = $('#recharge_thd_log_orderLogdataTable').jqGrid({
				        datatype : 'local',  //禁止自动查询
						url : '/data/com.wboss.wcb.thdpaymentlog.ThdPaymentOrderLogSvc?m=queryForJqGridcopy.object.object',
						shrinkToFit:IsPC(),
						colModel : [ {
							label : '支付订购记录',
							name : 'paymentOrderId',
							hidden:true
						}, {
							label : '客户名称',
							name : 'custName'
						}, {
							label : '充值号码',
							name : 'mobilePhone'
						}, {
							label : '金额(元)',
							name : '_amount'
						}, {
							label : '支付方式',
							name : '_paymentMethod',
						}, {
							label : '支付渠道',
							name : '_paymentChannel'
						}, {
							label : '状态',
							name : '_status'
						}, {
							label : '下单时间',
							name : 'createDate'
						}, {
							label : '更新时间',
							name : 'statusDate'
						}, {
							label : '第三方支付订单号',
							name : 'thdOrderSn'
						}, {
							label : '第三方支付交易号',
							name : 'thdPaySn',
							hidden:true
						},  {
							label : '第三方支付类型',
							name : '_thdType'
						}, {
							label : '第三方支付时间',
							name : 'thdPayDate',
							hidden:true
						}, {
							label : '第三方交易成功标识',
							name : 'thdSucFlag',
							hidden:true
						}, {
							label : '订购的套餐名称',
							name : 'offerName'
						}, {
							label : '订购的套餐数量',
							name : 'orderNum'
						}, {
							label : '订购的套餐生效时间',
							name : 'offerEffDate',
							hidden:true
						}, {
							label : '订购  的套餐失效时间',
							name : 'offerExpDate',
						    hidden:true	
						}, {
							label : '支付记录',
							name : 'paymentId',
							hidden:true
						}, {
							label : '商品订购实例标识',
							name : 'productOfferInstanceId',
							hidden:true
						}, {
							label : '冲正支付订购记录',
							name : 'reverPaymentOrderId',
							hidden:true
						}, {
							label : '冲正原因',
							name : 'reverReason',
							hidden:true
						}, {
							label : '企业名称',
							name : 'vnoName',
							sortable:false
						}
						],
						height : '114px',
						onSelectRow : function(rowId) {
							var data = ThdPaymentOrderLogGrid.jqGrid(
									'getRowData', rowId);
},
						pager : "#recharge_thd_log_orderLogPager"
					});
			//网上用户
			var UserReqResultLogGrid = $("#recharge_userreq_orderLogdataTable").jqGrid({
						url : '/data/com.wboss.wcb.auth.authmgr.UserReqResultSvc?m=queryUserReqList4Jqcopy.object.object',
						shrinkToFit:IsPC(),
						datatype : 'local',  //禁止自动查询
						colModel : [
								{label : '客户编码' ,name:'custCode'},
								{label : 'ACC 认证上网',name : 'opType'},
								{label : '终端MAC',name : 'staMac'},
								{label : '终端IP',name : 'staIp'},
								{label : '设备名称',name : 'acName'}, 
								{label : 'SSID',name : 'ssid'},
								{label : 'GWID',name : 'gwId'},
								{label : 'AP Mac',name : 'apMac'},
								{label : '认证结果',name : 'operResult',
									formatter : function(cellValue, options, rowObject) {
									if (cellValue == 'T') {
										return '成功';
									} else {
										return '失败';
									}
								}},
								{label : '错误编码',name : 'expCode'},
								{label : '错误信息',name : 'expDesc'},
								{label : 'AC返回值',name : 'acRet'},
								{label : '创建时间',name : 'createDate'},
								{label : '',name : 'vnoId',hidden : true},
								{label : '企业名称',name : 'vnoName',sortable : false,width : 200}
								],
								height : '114px',
								onSelectRow : function(rowId) {
									debugger
									var data = ThdPaymentOrderLogGrid.jqGrid(
											'getRowData', rowId);
								},
					 pager:"recharge_userreq_orderLogPager"
					});
			
			

		  //tabs切换
		  $page.on("click",".nav li",function(e){
			  var $t = $(e.currentTarget);
			  if($t.hasClass('active'))return;
			  $t.parent().children().removeClass('active');
			  $t.addClass('active');
			  $page.find(".xxx").hide();
			  var gridWidth = $t.parent().width();
			  var id =   $t.data('for-id');
			  $("#"+id).find('table').setGridWidth(gridWidth);
			  $("#"+id).show();
			})
			
			 var editData = $page.find('.detail_form').serializeObject();
		  
		  //1、限制全量查询，必须输入查询条件
		     $page.on("click",".cust-search-form .btn-search",function(e){
		         var mobilePhone=$page.find(".cust-search-form input[name='mobilePhone'] ").val();
		         var custCode=$page.find(".cust-search-form input[name='custCode'] ").val();
		         var custName=$page.find(".cust-search-form input[name='custName'] ").val();
                   if((mobilePhone=="")&&(custCode=="")&&(custName=="")){
						//清空表单
						document.getElementById("cust_360cust_editcustinfo").reset();
				    	 //清除所有jqGrid里的数据
			   			if(productOfferInstanceGrid){
			   				jqGrid.jqGrid("clearGridData");
							productOfferInstanceGrid.jqGrid("clearGridData");
							authBindObjectGrid.jqGrid("clearGridData");
							orderLogGrid.jqGrid("clearGridData");
							RechargeCardLogGrid.jqGrid("clearGridData");
							ThdPaymentOrderLogGrid.jqGrid("clearGridData");
							//modifyAuthBindObjectGrid.jqGrid("clearGridData");
							UserReqResultLogGrid.jqGrid("clearGridData");
			   			}
                		BootstrapDialog.warning('必须输入查询条件!');
                		return false;
                   }    
			    }); 
		     
		  

		  /* //1、改vno(业务需求暂时不做)
	     $page.on("click",".btn[name='btnVno']",function(e){	    
	   		vnoId = model.user().vnoId(), vnoName = model.user().vnoName();
			$page.find('input[name="vnoId"]').val(vnoId);
			$page.find('input[name="vnoName"]').val(vnoName);
			//显示相应的页面
	        $page.find("#cust_360custAll_wrap").hide();
	        $page.find("#cust_360cust_modifyVno").show();
	        }); 
	     
	        //2、修改运营商(后台功能有问题，暂时不做)
	       $page.on("click",".btn[name='btnModifyVno']",function(e){	 
	        	currentCust.vnoId=vnoId;  
	        	currentCust.newVnoId=$page.find('.edit_vno_div').find('input[name="vnoId"]').val();
	        	currentCust.vnoName=$page.find('.edit_vno_div').find('input[name="vnoName"]').val();  
		        custMgrSvc.call('modifyVNO', [currentCust], function(res){
		        	BootstrapDialog.success('修改成功');
		        	//自动跳转到客户详细信息页面,再次反序列化数据
		        	$page.find("#cust_360cust_modifyVno").hide();
		            $page.find(".detail_form").deSerializeObject(currentCust);
		        	$page.find("#cust_360custAll_wrap").show();
		        	  //刷新当前的订单记录信息
		        	refreshOrderLogGrid();
		    	});
		     });
	     
	        //3、改运营商后返回
	        $page.on("click",".btn[name='btnBack']",function(e){	 
		        $page.find("#cust_360custAll_wrap").show();
		        $page.find("#cust_360cust_modifyVno").hide();
	        }); 
	        */

		  //1、改口令
	        var $cust_360cust_modifyPwdForm=$page.find("#cust_360cust_modifyPwdForm");
		     $page.on("click",".btn[name='btnPwd']",function(e){	
		    	    $(window).trigger("resize");
		    	    $("body")[0].scrollTop=0;
					//显示相应的页面
			        $page.find("#cust_360custAll_wrap").hide();
			        $page.find("#cust_360cust_modifyPwd").show();
			        $('#cust_360cust_modifyPwdForm table td:first-child').css('text-align','center').siblings().css({'text-align':'left','margin-left':'50px'});
			        $page.find('.edit_pwd_div').find('input[name="password"]').val(currentCust.password);  
			    	
			    	 //表单状态设为可编辑状态
			    	 $cust_360cust_modifyPwdForm.status('edit');
			    	 var validator = $cust_360cust_modifyPwdForm.validate();
			    	 validator.resetForm();
			        }); 
		     
		        //2、确认修改口令
		        $page.on("click",".btn[name='btnModifyPwd']",function(e){	 
		        	//表单非空验证
					if (!$cust_360cust_modifyPwdForm.valid()) {
						return;
					}
					currentCust.staffId=staffId;
		        	//两次输入新密码是否一致
		        	currentCust.password=$page.find('.edit_pwd_div').find('input[name="newPwd"]').val();
			        custMgrSvc.call('modifyPwd', [currentCust], function(res){
			        	BootstrapDialog.success('修改成功');					        
			        	//自动跳转到客户详细信息页面,再次反序列化数据
			        	$page.find("#cust_360cust_modifyPwd").hide();
			            $page.find(".detail_form").deSerializeObject(currentCust);
			        	$page.find("#cust_360custAll_wrap").show();
		        	  //刷新当前的订单记录信息
			        	refreshOrderLogGrid();
			    	});
			     });
		     
			        //3、改口令返回
			        $page.on("click",".btn[name='btnBack']",function(e){	 
				        $page.find("#cust_360cust_modifyPwd").hide();
				        //刷新基本信息
						var postData= authBindObjectGrid.jqGrid("getGridParam", "postData");
						postData.param = JSON.stringify(currentCust);
						authBindObjectGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			        	  //刷新当前的订单记录信息
			        	refreshOrderLogGrid();
			        }); 
			        

		     
			  //1、改关联设备
		     $page.on("click",".btn[name='btnAuthBindObject']",function(e){
		    	 $(window).trigger("resize");
		    	  $("body")[0].scrollTop=0;
		    	 var defaultValue = {status:'00A',devicePropType:  '90B', operType: 'X00', deviceType: 'PC'};
		    	 $cust_360cust_modifyAuthBindObject_form.data('default',defaultValue).status('show');
					//显示相应的页面
		    	   var gridWidth=$("#cust_360custAll_wrap").width();
			        $page.find("#cust_360custAll_wrap").hide();
			        $("#cust_360cust_modifyAuthBindObjectdataTable").setGridWidth(gridWidth);
			    	$page.find("#cust_360cust_modifyAuthBindObject").show();
			 }); 
		   
		     
		        $page.on('click',"#cust_360cust_btnAuthBind_OK",function(e){
		    	        if (!$cust_360cust_modifyAuthBindObject_form.valid()) {
		    	        	 return;
		    	        }
		    		var editData = $cust_360cust_modifyAuthBindObject_form.serializeObject();
		     	    editData.custId=currentCust.custId;
		     	    editData.vnoId=currentCust.vnoId;
		     	    currentCust.staffId=staffId;
		    		var method = $cust_360cust_modifyAuthBindObject_form.status() == "new" ? 'insertBindDevice' : 'modifyCustBindDevice';
		    		var msg = $cust_360cust_modifyAuthBindObject_form.status() == "new" ?  '添加成功！' : '更新成功！';
		    		custMgrSvc.call(method,[currentCust,editData],function(){
		    			BootstrapDialog.success(msg);
		     	          //直接返回到详细信息页面
				        $page.find("#cust_360custAll_wrap").show();
				        $page.find("#cust_360cust_modifyAuthBindObject").hide();
				        //刷新基本信息
						var postData= authBindObjectGrid.jqGrid("getGridParam", "postData");
						postData.param = JSON.stringify(currentCust);
						authBindObjectGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
			        	  //刷新当前的订单记录信息
			        	refreshOrderLogGrid();
		    		});
		    	});
		        
		           //4、业务需求，暂时不支持编辑
					    	$page.on('click',".btn-class-new,.btn-refresh",function(e){
					    	});

					        //5、改关联设备返回
					        $page.on("click",".btn[name='btnBack']",function(e){	 
					        	//modifyAuthBindObjectGrid.resetSelection();
						        $page.find("#cust_360custAll_wrap").show();
						        $page.find("#cust_360cust_modifyAuthBindObject").hide();
						        //刷新当前客户的鉴权绑定设备信息
						    	var postData2= authBindObjectGrid.jqGrid("getGridParam", "postData");
								postData2.param = JSON.stringify(currentCust);
							  	authBindObjectGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
							    //刷新当前的订单记录信息
							  	refreshOrderLogGrid();
					        }); 
		     
		     
			  //商品受理
		     $page.on("click",".btn[name='productOffer']",function(e){
		    	    $(window).trigger("resize");
		    	    $("body")[0].scrollTop=0;
		    	    currentCust.staffId=staffId;
		    		global['product_offer_data']=currentCust;
		    		global['refreshGrid']=[orderLogGrid,productOfferInstanceGrid,authBindObjectGrid];
                   //直接跳转到“商品受理”页面
			        gotoPage('cust/product_offer_ins');
			   }); 
		     
		     
			  //1、停复机
		     $page.on("click",".btn[name='custStatus']",function(e){
		    	 $(window).trigger("resize");
		    	 $("body")[0].scrollTop=0;
		    	  //根据客户状态判断是停机还是复机
				  //当客户状态为有效时，复机按钮不可用
			      //当客户状态为失效、停用时，停机按钮不可用
		    	 //当客户状态为归档时，停复机按钮置为灰色
		    	    if(currentCust.status=="00U"){
		    	    	$page.find(".btn[name='custStatus']").prop("disabled",true);	
		    	    }else if(currentCust.status=="00A"){
						$page.find(".custStatus_Stop").prop("checked",true);	
					}else{
						$page.find(".custStatus_Reset").prop("checked",true);	
					}
					//禁用radio,设为只读
					$page.find("input[name='custStatus']").prop("disabled",true);	
					
		    	 
					//显示相应的页面
			        $page.find("#cust_360custAll_wrap").hide();
			        $page.find("#cust_360cust_custStatus").show();
				 });
		     
				     
		        //2、确认停复机
		      $page.on("click",".btn[name='modifyCustStatus']",function(e){	 
			        //获取修改停复机原因和备注
			        var reason=$page.find('.edit_custStatus_div').find("#cust_360cust_custStatusReason option:selected").val();
			        var remark=$page.find('.edit_custStatus_div').find("#cust_360cust_custStatusReacord").val();
		        	
		         	//将单个顾客信息序列化到表单中
		        	currentCust.businessReason=reason+":"+remark;
		        	currentCust.staffId=staffId;
		        	var  value= $page.find('.edit_custStatus_div').find('input:radio[name="custStatus"]:checked').val();  
			        if(value==0){
			        	currentCust.status='XXX';
			        }else{
			        	currentCust.status='00A';
			        }
		        	 custMgrSvc.call('modifyCustStatus', [currentCust], function(res){
		        		   if(value==0){
		        			   BootstrapDialog.success('停机成功');
		        			   currentCust.status='XXX';
					        	//禁用所有按钮(除了停复机和销户)
								$page.find(".btn_operation").prop("disabled",true);
					        	$page.find(".btn[name='custStatus']").prop("disabled",false);
					        	$page.find(".btn[name='unRegCust']").prop("disabled",false);
		        		   }else{
		        			   BootstrapDialog.success('复机成功');
		        			   currentCust.status='00A';
					        	//恢复所有按钮
								$page.find(".btn_operation").prop("disabled",false);
		        		   }
				        	//自动跳转到客户详细信息页面,再次反序列化数据
				        	$page.find("#cust_360cust_custStatus").hide();
				            $page.find(".detail_form").deSerializeObject(currentCust);
				        	$page.find("#cust_360custAll_wrap").show();
				        	  //刷新当前的订单记录信息
				        	refreshOrderLogGrid();
				    	});
		        }); 
			        
			        //3、停复机返回
			        $page.on("click",".btn[name='btnBack']",function(e){	 
				        $page.find("#cust_360custAll_wrap").show();
				        $page.find("#cust_360cust_custStatus").hide();
			           }); 
		            
		    $page.on("change","select[name='devicePropType']",function(e){
		    	switch(this.value){
		    	case "90A" : //不绑定，只记录
		    	case "90B" : //绑定IP
		    	case "90C" : //绑定MAC
		    	case "90D" : //绑定IP+MAC
		    	case "90E" : //绑定UUID
		    	}
		    });
		     
			  //1、销户
		     $page.on("click",".btn[name='unRegCust']",function(e){
		    	    $(window).trigger("resize");
		    	    $("body")[0].scrollTop=0;
					//显示相应的页面
			        $page.find("#cust_360custAll_wrap").hide();
			        $page.find("#cust_360cust_unRegCust").show();
				});
		     
		       //2、确认销户
		        $page.on("click",".btn[name='modifyUnRegCust']",function(e){	 		        	
		        	var   unRegCustReason= $page.find('.edit_unRegCust_div').find('input[name="unRegCustReason"]').val();  
		        	currentCust.businessReason=unRegCustReason;
		        	currentCust.status='00X';
		        	currentCust.staffId=staffId;
		        	 custMgrSvc.call('unRegCust', [currentCust], function(res){
				        	BootstrapDialog.success('销户成功');
				        	//自动跳转到客户详细信息页面,再次反序列化数据
				        	$page.find("#cust_360cust_unRegCust").hide();
				        	$page.find(".btn[name='unRegCust']").prop("disabled",true);	
				        	
							//根据custId查找客户
							custInfoQuerySvc.call('querySingleCustByCustId', [currentCust], function(res){
					        	currentCust=res[0];
					        	$page.find(".detail_form").deSerializeObject(currentCust);
					        });
				       
				        	$page.find("#cust_360custAll_wrap").show();
				        	//所有按钮置灰
							$page.find(".btn_operation").prop("disabled",true);
						     jqGrid.trigger("reloadGrid");
				        	  //刷新当前的订单记录信息
				        	 refreshOrderLogGrid();
				    	});
		        });
			        
			       //3、销户返回
			        $page.on("click",".btn[name='btnBack']",function(e){	 
				        $page.find("#cust_360custAll_wrap").show();
				        $page.find("#cust_360cust_unRegCust").hide();
			           }); 
		     
			       var $editCustInfoFormValidator =  $editCustInfoForm.validate();
			  //1、改客户信息
		     $btnEditCustInfo.on("click",function(e){
		         	//将当前顾客信息序列化到表单中
			    	 $editCustInfoForm.deSerializeObject(currentCust);
			    	 $editCustInfoFormValidator.resetForm();
			    	 var identityType=$editCustInfoForm.find('select[name="identityType"] option:selected').val();
			    	 var identityCode=$editCustInfoForm.find('input[name="identityCode"]');
					//学生证
					if(identityType=="I01"){
						identityCode.rules("add",{isNumber8:true,minlength:8,messages:{isNumber8:"学生证号必须全数字",minlength:"最小长度为8"}});
					}else if(identityType=="I02"){  //护照
						identityCode.rules("add",{isPassport:true,messages:{required: "请输入正确的护照号"}});
					}else if(identityType=="I03"){ //军官证
						identityCode.rules("add",{minlength:6,maxlength:8,messages:{minlength:"最小长度为6",maxlength:"最大长度为8"}});
					}else{  //身份证
						identityCode.rules("add",{isIdCardNo:true,messages:{isIdCardNo:'身份证号格式不正确'}});
					}
		        }); 
                      
		 	//2、下拉框的选择事件
		        $editCustInfoForm.on('change','select[name="identityType"]',function(e){
					//根据用户的选择获取下拉框的值
					var identityType=$editCustInfoForm.find('select[name="identityType"] option:selected').val();
					//获取元素"证件号"
					var identityCode=$editCustInfoForm.find('input[name="identityCode"]');
					identityCode.val('');
					//学生证
					if(identityType=="I01"){
						identityCode.rules("remove");
						identityCode.rules("add",{isNumber8:true,minlength:8,messages:{isNumber8:"学生证号必须全数字",minlength:"最小长度为8"}});
					}else if(identityType=="I02"){  //护照
						identityCode.rules("remove");
						identityCode.rules("add",{isPassport:true,messages:{required: "请输入正确的护照号"}});
					}else if(identityType=="I03"){ //军官证
						identityCode.rules("remove");		
						identityCode.rules("add",{minlength:6,maxlength:8,messages:{minlength:"最小长度为6",maxlength:"最大长度为8"}});
					}else{  //身份证
						identityCode.rules("remove");
						identityCode.rules("add",{isIdCardNo:true,messages:{isIdCardNo:'身份证号格式不正确'}});
					}	
				});
			        
		        //3、确认修改客户信息
		        $editCustInfoForm.on("click","#cust_360cust_btnECustInfo_OK",function(e){	 
		        	//表单非空验证
					if (!$editCustInfoForm.valid()) {
						return;
					}
			    	var data = $editCustInfoForm.serializeObject();
			    	data.staffId=staffId;
		        	 custMgrSvc.call('modifyCustInfo', [data], function(res){
				        	BootstrapDialog.success('修改成功');
				        	$editCustInfoForm.status('show');
    			        	//自动跳转到客户详细信息页面,再次反序列化数据
							//根据custId查找客户
							custInfoQuerySvc.call('querySingleCustByCustId', [data], function(res){
					        	currentCust=res[0];
					        	$page.find(".detail_form").deSerializeObject(currentCust);
					        });
							currentCust.staffId=staffId;
				        	  //刷新当前的订单记录信息
							refreshOrderLogGrid();
				    	}); 		  	
			    	});
   
		     //(公共方法)刷新当前的订单记录信息
		     function refreshOrderLogGrid(){
					$page.find("#cust_360cust_productOfferInstanceWrap").find('table').setGridWidth($page.find(".nav-tabs").width());
					var postData= orderLogGrid.jqGrid("getGridParam", "postData");
					postData.param = JSON.stringify(currentCust);
					orderLogGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		     }	     
}
	return {
		onCreate : onCreate,
		onActive : onActive
	};	
});
