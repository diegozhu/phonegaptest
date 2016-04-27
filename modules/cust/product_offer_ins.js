define(function(){
	var productOfferSvc = new Service('com.wboss.wcb.offermgr.ProductOfferSvc');
	var custMgrSvc = new Service('com.wboss.wcb.custmgr.CustmgrSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	var orderNums = '';
	var flag=0;
	function onActive($page, $relativeUrl) {
	}

	function onCreate($page, $relativeUrl) {
		var operateGrids = global['refreshGrid'];
		delete global['refreshGrid'];
		var custdetail=global['product_offer_data'];
		delete global['product_offer_data'];
		//1、并非从360查询页面进入
		if(!custdetail){
			flag=1;
			var $360cust_table = $("#cust_product_offer_ins_cust_dataTable");
			//默认情况下，商品订购实例div隐藏
			$page.find("#cust_product_offer_ins_productOfferInstanceWrap").hide();  
	   		//客户详细信息
			var jqGrid = $360cust_table.jqGrid({
				datatype:'local',
						url : wboss.getWay + '/data/com.wboss.wcb.custinfo.CustInfoQuerySvc?m=queryCustInfoList4Jq.object.object',
						colModel : [ 
						   	   {label : '客户ID',name : 'custId',width:100,hidden : true},
						   	   {label : '客户账号',name : 'custCode',width : 100},
						   	   {label : '密码',name : 'password',width : 100,hidden : true},
						   	   {label : '客户名称',name : 'custName'},
						   	   {label : '手机号码',name : 'mobilePhone'},
						   	   {label : '客户类型',name : 'custType',hidden : true},
						   	   {label : '客户性别',name : 'custSex',hidden : true},
						   	   {label : '跨域限制',name : 'domainLimit',hidden : true},
						   	   {label : '注册时间',name : 'registerDate',hidden : true},
						   	   {label : '证件类型',name : 'identityType'},
						   	   {label : '证件号码',name : 'identityCode'},
						   	   {label : '邮箱',name : 'mailAddr',hidden : true},
						   	   {label : '组织',name : 'orgnizationName',hidden : true},
						   	   {label : '地域',name : 'regionId',hidden : true},
						   	   {label : '',name : 'vnoId',hidden : true},
						   	   {label : '企业名称',name : 'vnoName'},
						   	   {label : '状态',name : 'status',hidden : true},
						   	   {label : '生效时间',name : 'effDate',hidden : true},
						   	   {label : '失效时间',name : 'expDate',hidden : true}
						], onSelectRow : function(rowId) {
							var  data=jqGrid.jqGrid('getRowData',rowId);
						    custdetail=data;

							//显示被隐藏的
						    $page.find("#cust_product_offer_ins_productOfferInstanceWrap").show();  
						    var gridWidth=$("#cust_product_offer_ins_productOfferInstanceWrap").width();
					    	 //隐藏查询div
							$page.find("#cust_product_offer_ins_queryWrap").hide();  
						    
					    	$('#cust_productOfferIns_ProductOfferInstancedataTable').setGridWidth(gridWidth-20);
					    	$('#cust_product_offer_ins_dataTable').setGridWidth(gridWidth-20);
					    	
						    $page.find("#cust_product_offer_ins_productOfferInstanceWrap").show();  

						    var postData = product_offer_instance_Grid.jqGrid("getGridParam", "postData");
						  	postData.param = JSON.stringify(custdetail);
						  	product_offer_instance_Grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
						  	
						  	postData = jqGridProduct.jqGrid("getGridParam", "postData");
						  	postData.param = JSON.stringify({vnoId: custdetail.vnoId});
						  	jqGridProduct.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
						},
						loadComplete : function(data) {
							if(jqGrid){
								jqGrid.griddata = data;
							}
						},
						pager:"cust_product_offer_ins_cust_jqGridPager"
					});
			
			//1、点击查询时，显示全量数据
			$page.on("click","#product_offer_ins_btnsearchcust",function(e){
				 //2、限制全量查询，必须输入查询条件
		         var mobilePhone=$page.find(".cust-search-form input[name='mobilePhone'] ").val();
		         var custCode=$page.find(".cust-search-form input[name='custCode'] ").val();
		         var custName=$page.find(".cust-search-form input[name='custName'] ").val();
                 if((mobilePhone=="")&&(custCode=="")&&(custName=="")){
             		BootstrapDialog.warning('必须输入查询条件!');
             		return false;
                }    
				
				    var mobilePhone=$page.find("input[name='mobilePhone']").val();
				    var custCode=$page.find("input[name='custCode']").val();
				    var custName=$page.find("input[name='custName']").val();
				    var status=$page.find("select[name='status'] option:selected").val();
					var postData = jqGrid.jqGrid("getGridParam", "postData");
				  	postData.param = JSON.stringify({mobilePhone:mobilePhone,custCode:custCode,custName:custName,status:status});
				  	jqGrid.jqGrid("setGridParam", {datatype: 'json',search:true}).trigger("reloadGrid", [{ page: 1}]); 
			});
			
		}else{
			//从360查询页面进入时默认查询客户div不显示
			$page.find("#cust_product_offer_ins_queryWrap").hide();  
		}
		
		//订购实例列表
		  var  product_offer_instance_Grid = $('#cust_productOfferIns_ProductOfferInstancedataTable').jqGrid({
			  url : wboss.getWay + '/data/com.wboss.wcb.offermgr.ProductOfferSvc?m=queryProductOfferInstance.object.object',
				colModel: [
				        { label: '订购实例标识', name: 'productOfferInstanceId', key: true},
				        { label: '商品', name: 'offerName'},
				        { label: '订购渠道', name: '_orderChannel'},
				        { label: '订购数量', name: 'orderNum'},
				        { label: '生效时间', name: 'effDate'},
				        { label: '失效时间', name: 'expDate'},
				        { label: '状态', name: '_status'},
				        { label: '状态时间', name: 'statusDate'},
				        { label: '创建时间', name: 'createDate'},
						{
							label : '操作',
							sortable : false,
							formatter : function(cellValue, options,
									rowObject) {
				   	        	var operateDiv=
				   	        	"<div class='productOfferInsOperate'>"+
				   	        	"<div class='edit'>"+"<input type='button' onclick='productOfferInsOperate(this, 0)' value='注销' style='width:121px;'  />" +
		   	        			"</div>" +
		   	        			"<div class='result hd'>" +
		   	        				"<input type='button' onclick='productOfferInsOperate(this, 1)' value='确定' style='width:60px;' />" +
		   	        				"<input type='button' onclick='productOfferInsOperate(this, 2)' value='取消' style='width:60px;' />" +
		   	        			"</div>" +
		   	        			"</div>";
		     			        return operateDiv;
							}
						}
				    ],
				    height: '96px',
				    pager : "cust_product_offer_ins_productOfferInstance_jqGridPager",
					onSelectRow : function(rowId) {
					   var	data = product_offer_instance_Grid.getRowData(rowId);

						//查询该商品订购实例所对应的所有商品
						productOfferSvc.call('queryProductOfferByProductOfferInsId', [{productOfferInstanceId: data.productOfferInstanceId}], function(res){
							jqGridProduct.resetSelection();
							
				    		$.each(res, function(i, row){
				    			jqGridProduct.jqGrid('setSelection',row.offerId);	
				    			var offerIds = jqGridProduct.jqGrid('getGridParam', 'selarrrow');
				    			
				    			$page.find('.' + offerIds[i] + '_orderNum').val(data.orderNum);
				    		});
					  });
					},
					loadComplete : function(data) {
						//默认隐藏其它按钮
						$page.find(".result").hide();
					},
					rowList:[5,10],
					rowNum:5
			});
		
		  
		var $table = $("#cust_product_offer_ins_dataTable");

		window.productOfferInsOperate = function(dom, flag){
			if(flag == '0'){
				$(dom).parent().parent().find('.result').show();
				$(dom).parent().hide();
			}else if(flag == '1'){
				$(dom).parent().parent().find('.edit').show();
				$(dom).parent().hide();
				//获取按钮所在行的订购实例标识
   		        //1、确定注销：
				var productOfferInstanceId=$(dom).parent().parent().find('.edit').parent().parent().parent().find('td:eq(0)').text();
        				        custMgrSvc.call('deleteProductOfferIns', [custdetail,{productOfferInstanceId:productOfferInstanceId}], function(res){
        				        	BootstrapDialog.success('注销成功');
        				        	//刷新页面 
            							var postData = product_offer_instance_Grid.jqGrid("getGridParam", "postData");
            						  	postData.param = JSON.stringify(custdetail);
            						  	product_offer_instance_Grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
            				        });
			}else{
				$(dom).parent().parent().find('.edit').show();
				$(dom).parent().hide();
			}
		}
		
		//接收传入的参数
		setTimeout(function(){
			if(!custdetail){
				return;
			}
			var postData = product_offer_instance_Grid.jqGrid("getGridParam", "postData");
		  	postData.param = JSON.stringify(custdetail);
		  	product_offer_instance_Grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
		}, 1000);
	
		
		//商品列表
		var jqGridProduct = $table.jqGrid({
					url : wboss.getWay + '/data/com.wboss.wcb.offermgr.ProductOfferSvc?m=queryAllProductOfferInstance.object.object',
					multiselect : true,
					postData : {param:JSON.stringify({vnoId: custdetail ? custdetail.vnoId : 0})},
					recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;",
					colModel : [
							{label : '商品标识',name : 'offerId',width : 100,key : true,hidden : true},
							{label : '商品名称',name : 'offerName'},
							{label : '生命周期单位',name : 'lifecycleUnit',hidden : true},
							{label : '商品周期',name : 'lifecycleValue',hidden:true},
							{label : '使用类型',name : '_useType'},
							{label : '商品周期',name : '_lifecycleValue'},
							{label : '订购数量',name : 'orderNum',
								formatter : function(cellValue, options, row) {
									var clazz = row.offerId + "_orderNum";
									var s = "<input type='text' class='"+ clazz+ "' name='orderNum' value='"+(row.orderNum==null?1:row.roderNum)+"' style='width:207px;'  onkeyup='onChangeInput("+row.offerId+",this.value)' />";
									return s;
								},
								sortable : false
							}, {label : '生效时间',name : 'effDate',
								formatter : function(cellValue, options, rowObject) {
									//生效时间默认为当前时间，可以向后修改
									var today = new Date().toString('yyyy-MM-dd hh:mm:ss');
					   	        	var clazz='effDate_'+options.rowId;
					   	        	return ['<div ', 'class="', clazz, '" >','<input inputtype="',rowObject.offerId,'"  type="text" value="', today, '" class="datepicker" style="width:240px;"  />','</div>'].join('');
								},
							}, {
								label : '失效时间',name : 'expDate',								
								formatter : function(cellValue, options, rowObject) {
									if(rowObject.lifecycleValue==''||rowObject.lifecycleValue==null){return '永久使用';}
							 		  //计算失效时间(rowId)=生效时间+商品周期*订购数量
									  //var expDate=new Date(rowObject.effDate);						
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
									
									var s = "<input type='text' disabled class='"+ clazz+ " ' name='expDate' value='"+finalDate+"' style='width:207px;'/>";
									return s;
								},
							},
							{label : '', name : 'vnoId',hidden : true},
							{label : '企业名称',name : 'vnoName',sortable : false}],
					onPaging : function() {
					},
					onSortCol : function() {
					},
					loadComplete : function(data) {
						jqGridProduct.griddata = data;
						
						//生效时间控件赋值
						$page.find('.datepicker').each(function(i,e){
				             var $timeInput = $(e);
				             var format = $timeInput.data('format') || 'YYYY-MM-DD HH:mm:ss';
				             $timeInput.datetimepicker({format:format,minDate: new Date()});
				             
				             $timeInput.on('dp.change', function(e){
					            	 //当前时间
				            	      var effDate=e.date._d;
				            	      //当前offerId
				            	      var offerId=e.delegateTarget.attributes.inputtype.nodeValue;
					            	 
					     	    	//生效时间变化，失效时间随之变化
					     			var rowData = jqGridProduct.jqGrid("getRowData",offerId);
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
					 height: '320px',
					rowList:[10,15],
					rowNum:10,
					pager : "cust_product_offer_ins_productOffer_jqGridPager"
					,onSelectRow : function(rowId) {}
				});
		
		//1、“订购数量”文本框内容自动改变事件
		window.onChangeInput=function(offerId,num){
	    	//订购数量变化，失效时间随之变化
			var rowData = jqGridProduct.jqGrid("getRowData",offerId);
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
		
		
		// 提交
		//商品订购提交时，要做统一的订购校验。暂时不考虑已订购商品的修改。
		$page.find(".product_offer_ins_btn").click(
				function() {
					var offerIds = jqGridProduct.jqGrid('getGridParam', 'selarrrow');
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
						return ;
					}
					
					if(offerIds.length>1){
						BootstrapDialog.confirm({title:'友情提示', btnOKLabel:'确定', btnCancelLabel:'取消', message:'您选择了'+offerIds.length+'个套餐哦', callback: function(flag){
							if(flag){
								updateProductOfferIns();
							}
						}});
						}else{
							updateProductOfferIns();
						}
					
					
					function updateProductOfferIns(){
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
						custdetail.offerIds = offerIds.join(',');
						custdetail.orderNums = orderNums.join(',');
						custdetail.bindFlag='false';
						custMgrSvc.call('updateProductOfferIns', [custdetail],
								function(res) {
									BootstrapDialog.success('成功!');
									//刷新页面,接收传入的参数
									setTimeout(function(){
										var postData = product_offer_instance_Grid.jqGrid("getGridParam", "postData");
									  	postData.param = JSON.stringify(custdetail);
									  	product_offer_instance_Grid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]); 
									}, 1000);
								});
					}
	
				})
				//返回
		        $page.on("click",".product_offer_ins_btnBack",function(e){	 
		        	 //判断是360页面还是商品受理页面返回
		        	 if(flag==1){
		        		 //商品受理页面
		        		 $page.reloadPage();
		        	 }else{
		        		 $page.close();
		        		 for(var i=0; i< operateGrids.length; i++){
		        			 operateGrids[i].jqGrid("setGridParam", {datatype: 'json',search:true}).trigger("reloadGrid", [{ page: 1}]); 
		        		 }
		        		 gotoPage('cust/360cust');
		        	 }
		        }); 

	}
	return {
		onCreate : onCreate,
		onActive : onActive
	};
});
