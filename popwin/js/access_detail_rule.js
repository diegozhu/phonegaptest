define(function () {
	var accessDetailSvc = new Service('com.wboss.wcb.rating.config.AccessDetailRuleCfgSvc');
	var accessRuleSvc = new Service('com.wboss.wcb.rating.config.AccessRuleCfgSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new accessDetailPopWin(initialData);
			
			popWin.$dialog = BootstrapDialog.show({
				title:'授权规则明细',
		        message: $('<div></div>').load('/admin/popwin/access_detail_rule.html'),
		        onshown : function(){
					popWin.init(cb);
		        },
		        onhide:function(){
	            	popWin = null;
		        },
		        buttons : [
		        	{
		                label: '绑定',
		                action: function(dialog) {
		                	var e = popWin.events['ok'];
		                	var rowId = popWin.jqGrid.jqGrid('getGridParam','selrow');
		                	var detailRuleIds = initialData.detailRuleIds;
		                	var accessId = initialData.selectAccessId;
		                	var rowData = popWin.jqGrid.jqGrid('getRowData',rowId);
		                	var detailRuleId = rowData.detailRuleId;
		                	if(!accessId){
		                		BootstrapDialog.warning("您还没有选择授权模板");
		                		popWin.$dialog.close();
		                		return;
		                	}
		                	if(!rowId && !popWin.initialData.detailRuleId){
	                			BootstrapDialog.warning("您还没有选择规则");
	                			popWin.$dialog.close();
		                		return;
	                		}
		                	
		                	if(detailRuleIds && detailRuleIds.indexOf(','+detailRuleId +',') != -1){
	                			BootstrapDialog.warning("添加了重复的规则");
	                			popWin.$dialog.close();
		                		return;
	                		}
		                	
                			var accessRuleVo = {accessId: accessId, detailRuleId: detailRuleId};
                			accessRuleSvc.call('insertAccessRule', [accessRuleVo], function(res){
                				var jqGrid = $("#cfg_access_detail_dataTable").jqGrid();
                				var postData = jqGrid.jqGrid("getGridParam", "postData");
                			  	postData.param = JSON.stringify({accessId: accessRuleVo.accessId});
                			   	jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
                			}, function(e){
                				console.log(e);
                			});
		                    popWin.$dialog.close();
                		}
	                	
		            }, {
		                label: '取消',
		                action: function(dialog) {
		                	var e = popWin.events['cancel'];
		                	for(var i in e){
		                		typeof e[i] == "function" && e[i](popWin.data,'cancel');
		                	}
		                   	popWin.$dialog.close();
		                }
		            }
		        ]
		    });
		    return popWin;
		}
	};

	function accessDetailPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	accessDetailPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	accessDetailPopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
		var $form = $page.find(".detail_form");
		var $table = $page.find("#cfg_access_detail_rule_dataTable");
		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName()
		$form.find('input[name="vnoId"]').val(vnoId);
		$form.find('input[name="vnoName"]').val(vnoName);
		$page.find('input[name="vnoName"]').val(vnoName);
		$page.find('input[name="vnoId"]').val(vnoId);
		var RULETYPE={};
		var ACCESSTYPE={};
		
		(cb||function(){})();
		//初始值
		$form.data('default',{status:'00A',vnoId: vnoId, vnoName: vnoName, ruleType:'100',accessType:'60A', ddtunit: 'sec', upunit: 'Kbs', downunit: 'Kbs'});
		//字典
		sysparam.call('getDicData',['DIC_ACCESS_DETAIL_RULE_TYPE'],function(res){
			var dom = "";
			for(var i in res){
				RULETYPE[res[i].dicValue]=res[i].dicValueName;
				dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
			}
			
			$page.find(".ruleType").append(dom);
		});
		
		sysparam.call('getDicData',['DIC_ACCESS_DETAIL_ACCESS_TYPE'],function(res){
			var dom = "";
			for(var i in res){
				ACCESSTYPE[res[i].dicValue]=res[i].dicValueName;
				if(res[i].dicValue == '60C') continue;
				dom += "<option class='form-control' value='"+res[i].dicValue+"'>"+res[i].dicValueName+"</option>"
			}
			$page.find(".accessType").append(dom);
		});
		
		//校验
		var validator=$form.validate();
		
		//类型变换事件
		$page.find(".accessType").change( function(){
				typeControl($page.find(".ruleType").val(), $(this).val());
			}
		);
		
		$page.find(".ruleType").change( function(){
			var ruleType=$(this).val(), accessType = $page.find(".accessType").val();
			typeControl(ruleType, accessType);
		});
		
		var typeControl= function(ruleType, accessType){
			$page.find(".accessType").empty();
			var dom = '';
			for(var i in ACCESSTYPE){
				if(ruleType == '100' && i == '60C') continue;
				dom += "<option class='form-control' value='"+i+"'>"+ACCESSTYPE[i]+"</option>";
			}
			$page.find(".accessType").append(dom);
			if(ruleType == '100' && accessType == '60C') accessType = '60A';
			$page.find(".accessType").val(accessType);
			unitChange(accessType);
		},
		unitChange= function(accessType){
			$(".ddtunit").empty();
			if(accessType=='60A'){
				$(".ddtunit").append("<option value='sec'>秒</option>");
				$(".ddtunit").append("<option value='min'>分</option>");
				$(".ddtunit").append("<option value='hour'>小时</option>");
			}else if(accessType=='60B'){
				$(".ddtunit").append("<option value='B'>B</option>");
				$(".ddtunit").append("<option value='KB'>KB</option>");
				$(".ddtunit").append("<option value='MB'>MB</option>");
				$(".ddtunit").append("<option value='GB'>GB</option>")
			}else if(accessType=='60C'){
				$(".ddtunit").append("<option value='sqe'>次</option>");
			}
		};
		
		//新增事件
		$form.on('click',".btn-class-new",function(e){
			var $form = $($(e.target).parents("form")[0]);
			$form.status('new');
			$form.data('backup',$form.serializeObject());
			if($form.data('default') != undefined){
				$form.deSerializeObject($form.data('default'));
			}
			
			$(".ddtunit").empty();
			$(".ddtunit").append("<option value='sec'>秒</option>");
			$(".ddtunit").append("<option value='min'>分</option>");
			$(".ddtunit").append("<option value='hour'>小时</option>");
			return false;
		});
		
		//取消事件
		$form.on('click',".btn-class-cancel",function(e){
			var $form = $($(e.target).parents("form")[0]).status('show');
			if($form.data('backup') != undefined){
				var data = $form.data('backup'), ruleType = data.ruleType,accessType = data.accessType;
				typeControl(ruleType, accessType);
				$form.deSerializeObject(data);
			}
			return false;
		});
		
		//修改
		$form.on('click',".btn-class-ok",function(e){
			if(!$form.valid()){
				return;
			}
			var ddtunit = $form.find('.ddtunit>option:selected').val();
			var accessType = $form.find('select[name="accessType"]').val();
			var upRateUnit = $form.find('.upunit').val();
			var downRateUnit = $form.find('.downunit').val();
			var accessDetail = $form.serializeObject();
			var accessDetailIds = self.initialData.detailRuleIds;
			var accessId = self.initialData.selectAccessId;
			var detailRuleId = accessDetail.detailRuleId;
			if(accessType == '60A'){
				if(ddtunit=='sec'){
					accessDetail.sessionDuration=$page.find('input[name="sessionDTT"]').val();
				}else if(ddtunit=='min'){
					accessDetail.sessionDuration=$page.find('input[name="sessionDTT"]').val()*60;
				}else if(ddtunit=='hour'){
					accessDetail.sessionDuration=$page.find('input[name="sessionDTT"]').val()*60*60;
				}
			}
			if(accessType == '60B'){
				if(ddtunit=='B'){
					accessDetail.sessionTraffic=$page.find('input[name="sessionDTT"]').val();
				}else if(ddtunit=='KB'){
					accessDetail.sessionTraffic=$page.find('input[name="sessionDTT"]').val()*1024;
				}else if(ddtunit=='MB'){
					accessDetail.sessionTraffic=$page.find('input[name="sessionDTT"]').val()*1024*1024;
				}else if(ddtunit=='GB'){
					accessDetail.sessionTraffic=$page.find('input[name="sessionDTT"]').val()*1024*1024*1024;
				}
			}
			if(accessType == '60C'){
				accessDetail.sessionTimes=$page.find('input[name="sessionDTT"]').val();
			}
			
			//8Mbps = 1MBps 1MBps = 1MB 1MB = 1024KB 1024KB = 1024KB * 1024(B)
			if(upRateUnit == "Mbs"){
				accessDetail.upRate=($page.find('input[name="upRate"]').val())/8*1024*1024;
			}else{
				accessDetail.upRate=($page.find('input[name="upRate"]').val())/8*1024;
			}
			
			if(downRateUnit == "Mbs"){
				accessDetail.downRate=($page.find('input[name="downRate"]').val())/8*1024*1024;
			}else{
				accessDetail.downRate=($page.find('input[name="downRate"]').val())/8*1024;
			}
			var method = $form.status() == "new" ? 'insertAccessRule' : 'updateAccessRule';
			var msg = $form.status() == "new" ?  '添加成功！' : '更新成功！';
			accessDetailSvc.call(method,[accessDetail],function(){
				self.jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
				BootstrapDialog.success(msg);
				$form.status('show');
				//编辑刷新
				if(accessId && method == "updateAccessRule" && accessDetailIds.indexOf(','+detailRuleId +',') != -1){
					var jqGrid = $("#cfg_access_detail_dataTable").jqGrid();
    				var postData = jqGrid.jqGrid("getGridParam", "postData");
    			  	postData.param = JSON.stringify({accessId: accessId});
    			   	jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid", [{ page: 1}]);
				}
			});
		});
		
		self.jqGrid = $table.jqGrid({
			url : '/data/com.wboss.wcb.rating.config.AccessDetailRuleCfgSvc?m=queryAccessDetailRuleList4Jq.object.object',
			height:'250px',
			colModel : [{name : 'detailRuleId',hidden:true},
			            {label : '规则名称',name : 'detailRuleName'},
			            {label : '规则描述',name : 'detailRuleDesc'},
			            {label : '规则类型',name : '_ruleType'},
			            {label : '授权类型',name : '_accessType'},
			            {label : '时段名称',name : 'timeSpanName',sortable:false},
			            {label : '授权时长',name : 'sessionDuration',
			            	formatter : function (cellValue, options, row){
			            		if(row.accessType!='60A'){
			            			return '';
			            		}
			            		return formatTime(cellValue);
			            	}
			            },
			            {label : '授权流量',name : 'sessionTraffic',
			            	formatter : function (cellValue, options, row){
			            		if(row.accessType!='60B'){
			            			return '';
			            		}
			            		return formatB(cellValue);
			            	}
			            },
			            {label : '授权次数',name : 'sessionTimes',
			            	formatter : function (cellValue, options, row){
			            		if(row.accessType!='60C'){
			            			return '';
			            		}
			            		return cellValue+ ' 次';
			            	}
			            },
			            {label : '上行带宽',name : 'upRate',
			            	formatter : function (cellValue, options, row){
			            		if((cellValue * 8)  % (1024*1024) == 0){
			            			return cellValue * 8 / (1024*1024) + "Mb/s";
			            		}else{
			            			return cellValue * 8 / 1024 + "Kb/s";
			            		}
			    
			            	}
			            }, 
			            {label : '下行带宽',name : 'downRate',
			            	formatter : function (cellValue, options, row){
			            		if((cellValue * 8) % (1024*1024) == 0){
			            			return cellValue * 8/ (1024*1024) + "Mb/s";
			            		}else{
			            			return cellValue * 8/ 1024 + "Kb/s";
			            		}
			            	}
			            },
			            {name : 'vnoId',hidden:true},
			            {label : '企业名称',name : 'vnoName',sortable:false}],
			onSelectRow : function(rowId) {
				//清除之前的校验信息
				validator.resetForm();
				var data = self.jqGrid.griddata.rows[rowId-1];
				$page.find(".btn-class-edit").prop('disabled', false);
				$form.deSerializeObject(data).status('show');
				typeControl(data.ruleType, data.accessType);
				if(data.accessType == '60A'){
					if(data.sessionDuration % 3600 == 0){
						$page.find('input[name="sessionDTT"]').val(data.sessionDuration / 3600);
						$form.find("option[value='hour']").prop("selected","selected");
					}else if(data.sessionDuration != 0 && data.sessionDuration % 60 == 0){
						$page.find('input[name="sessionDTT"]').val(data.sessionDuration / 60);
						$form.find("option[value='min']").prop("selected","selected");
					}else{
						$page.find('input[name="sessionDTT"]').val(data.sessionDuration);
						$form.find("option[value='sec']").prop("selected","selected");
					}
				}
				if(data.accessType == '60B'){
					if(data.sessionTraffic % (1024*1024*1024) == 0){
						$page.find('input[name="sessionDTT"]').val(data.sessionTraffic / (1024*1024*1024));
						$form.find("option[value='GB']").prop("selected","selected");
					}else if(data.sessionTraffic % (1024*1024) == 0){
						$page.find('input[name="sessionDTT"]').val(data.sessionTraffic / (1024*1024));
						$form.find("option[value='MB']").prop("selected","selected");
					}else if(data.sessionTraffic % 1024 == 0){
						$page.find('input[name="sessionDTT"]').val(data.sessionTraffic / 1024);
						$form.find("option[value='KB']").prop("selected","selected");
					}else{
						$page.find('input[name="sessionDTT"]').val(data.sessionTraffic);
						$form.find("option[value='B']").prop("selected","selected");
					}
				}
				if(data.accessType == '60C'){
					$page.find('input[name="sessionDTT"]').val(data.sessionTimes);
				}
				
				if((data.upRate * 8) % (1024*1024) == 0){
					$form.find('input[name="upRate"]').val((data.upRate)*8 /(1024*1024));
					$form.find(".upunit > option[value='Mbs']").prop("selected","selected");
				}else{
					$form.find('input[name="upRate"]').val((data.upRate)*8 / 1024);
					$form.find(".upunit > option[value='Kbs']").prop("selected","selected");
				}
				
				if((data.downRate * 8) % (1024*1024) == 0){
					$form.find('input[name="downRate"]').val((data.downRate)*8 /(1024*1024));
					$form.find(".downunit > option[value='Mbs']").prop("selected","selected");
				}else{
					$form.find('input[name="downRate"]').val((data.downRate)*8 / 1024);
					$form.find(".downunit > option[value='Kbs']").prop("selected","selected");
				}
			},
		    onPaging:function(){
		    	$form.status('show');
		    },
		   	onSortCol:function(){
		    	$form.status('show');
		    },
		   	loadComplete:function(data){
		   		$page.find(".btn-class-edit").prop('disabled', true);
		   		self.jqGrid.griddata = data;
		    	$form.status('show');
		    },
		    pager: "#cfg_access_detail_rule_jqGridPager"
		});
	}	
	return module;
});

