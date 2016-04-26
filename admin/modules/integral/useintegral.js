define(function() {
	var IntegralTypeSvc = new Service('com.wboss.wcb.integralmgr.IntegralTypeSvc');
	var IntegralPresentSvc=new Service('com.wboss.wcb.integralmgr.IntegralPresentSvc');
	var IntegralCustSvc=new Service('com.wboss.wcb.integralmgr.IntegralCustSvc');
	var IntegralPresentItemSvc=new Service('com.wboss.wcb.integralmgr.IntegralPresentItemSvc');
	function onActive($page, $relativeUrl) {
	}

	function onCreate($page, $relativeUrl) {
		//初始页面时，兑换按钮不可按
		$page.find('button[name="btnModifyPwd"]').prop('disabled',true);
		var UNIT_OBJ ={}, TYPE_OBJ = {}, ID_OBJ={};
		//查询用户可用积分
		function findCustAmount(){
			var msg='客户编码不存在';
			//获取输入的客户编码
			var CustCode=$page.find("input[name='custCode']").val();
			var integralCustVo={custCode:CustCode};
			IntegralPresentSvc.call('findCustactiveAmount',[integralCustVo],function(res){
				//如果没有可用积分，兑换按钮不可用
				if (res==null) {
					$page.find('button[name="btnModifyPwd"]').prop('disabled',true);
					BootstrapDialog.warning(msg);
					return;
				}	var isCustCode=$page.find("input[name='custCode']").val();
				if (isCustCode=='') {
					$page.find("input[name='activeAmount']").val('');
					return;
				}
				//数据追加到可用积分栏
				$page.find("input[name='activeAmount']").val(res.activeAmount);
				$page.find("input[name='custId']").val(res.custId);
			});
		}
		//搜索事件
		$page.find("button[name='searchCustId']").click(function(){
			findCustAmount();
			//获取兑换数量
			var InitChangeNumber=$page.find("input[name='GiftNumber']").val();
			//如果兑换数量大于0，可兑换
			if (InitChangeNumber>0) {
				$page.find('button[name="btnModifyPwd"]').prop('disabled',false);
			}
		});
		
		
		//查询积分类型
		IntegralTypeSvc.call('findIntegralType',[],function(res){
			var dom = "";
			for(var i in res){
				dom += "<option class='form-control' value='"+res[i].integralTypeId+"'>"+res[i].integralTypeName+"</option>"
			}
			$page.find(".integral_TypeName").append(dom);
		});
		
		//查询商品类型
		IntegralPresentSvc.call('findIntegralPresentType',[],function(res){
			for(var i in res){
				if(!TYPE_OBJ[res[i].presentType]){
					TYPE_OBJ[res[i].presentType] = [];
				}
				TYPE_OBJ[res[i].presentType].push(res[i]);
				UNIT_OBJ[res[i].presentId] = res[i].pointAmount;
				ID_OBJ[res[i].presentId] = res[i];
			}
			var dom = "", defKey;
			for(obj in TYPE_OBJ){
				if(!defKey){
					defKey = obj;
				}
				dom += "<option class='form-control' value='"+obj+"'>"+ obj +"</option>";
			}
			$page.find("select[name='presentType']").append(dom);
			var presents = TYPE_OBJ[defKey];
			dom="";
			for(var i in presents){
				dom += "<option class='form-control' value='"+ presents[i].presentId+"'>"+presents[i].presentName+"</option>"
			}
			$page.find(".present_Name").empty().append(dom);
			//商品描述
			if (presents) {
				var present =  presents[0];
				$page.find("textarea[name='remark']").append(present.presentDesc);
			}
			
		});
	
		//赠品名称的时间对应赠品的名称
		$page.find("select[name='presentType']").change(function(){
			var typeName = $(this).find("option:selected").text();
			var presents = TYPE_OBJ[typeName];
			var dom="";
			for(var i in presents){
				dom += "<option class='form-control' value='"+ presents[i].presentId+"'>"+presents[i].presentName+"</option>"
			}
			$page.find(".present_Name").empty().append(dom);
			//商品类型的改变时间对应描述
			var selectedVal = $page.find("select[name='presentName']").val(), obj = ID_OBJ[selectedVal];
			$page.find("textarea[name='remark']").text(obj.presentDesc);
		});
		
		
		//商品名称的事件
		$page.find("select[name='presentName']").change(function(){
			var selectedVal = $(this).val(), pointAmount = UNIT_OBJ[selectedVal], obj = ID_OBJ[selectedVal];
			var num = $page.find('input[name="GiftNumber"]').val();
			var total = parseInt(pointAmount) * parseInt(num); 
			if (isNaN(total)) {
				total=0;
				}
			$page.find('input[name="IntegralTotal"]').val(total);
			var availableIntegral=$page.find("input[name='activeAmount']").val();
			if (total > availableIntegral || total==0) {
				$page.find('button[name="btnModifyPwd"]').prop('disabled',true);
			}else{
				$page.find('button[name="btnModifyPwd"]').prop('disabled',false);
			}
			$page.find("textarea[name='remark']").text(obj.presentDesc);
			
		});
		//数量的事件
		$page.find("input[name='GiftNumber']").change(function(){
			var selectedVal=$page.find('select[name="presentName"]').val(),pointAmount = UNIT_OBJ[selectedVal];
			var num= $(this).val();
			var total = parseInt(pointAmount) * parseInt(num); 
			$page.find('input[name="IntegralTotal"]').val(total);
			var availableIntegral=$page.find("input[name='activeAmount']").val();
			if (total > availableIntegral || total==0) {
				$page.find('button[name="btnModifyPwd"]').prop('disabled',true);
			}else{
				$page.find('button[name="btnModifyPwd"]').prop('disabled',false);
			}
		});
		//修改客户积分
		var data={};
		function modifyintegralCust(data){
			var method='modifyIntegralCust';
			var msg='兑换成功';
			IntegralCustSvc.call(method,[data],function(){
				BootstrapDialog.success(msg);
			});
		};
		//添加兑换记录表
		var inser={};
		function insert(inser){
			var method='insert';
			IntegralPresentItemSvc.call(method,[inser],function(){
			});
		};
		//兑换事件
		$page.find("button[name='btnModifyPwd']").click(function(){
			//原有积分
			var activeamount=$page.find("input[name='activeAmount']").val();
			//兑换的积分
			var useamount=$page.find('input[name="IntegralTotal"]').val();
			//剩余积分
			var remainamount=parseInt(activeamount)-parseInt(useamount);
			//获取兑换商品ID
			var form=$page.find('#integral_useintegral_exchange');
			//获取下拉框中Value的值
			var presentid = $page.find('.present_Name>option:selected').val();
			var pointtypeid = form.find('.integral_TypeName>option:selected').val();
			modifyintegralCust({custId:$page.find("input[name='custId']").val(),activeAmount:remainamount, usedAmount:$page.find('input[name="IntegralTotal"]').val()});
			
			//添加积分兑换记录
			insert({custId:$page.find("input[name='custId']").val(),oldActiveAmount:activeamount,usedAmount:useamount,vnoId:model.user().vnoId(),quantity:$page.find("input[name='GiftNumber']").val(),presentId:presentid,pointTypeId:pointtypeid});
		});
		var validator=$page.find('.detail_form').validate();		
	}
	return {
		onCreate : onCreate,
		onActive : onActive
	};
});


	
	
