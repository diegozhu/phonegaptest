define(function () {
	var portalThemeMemberSvc = new Service('com.wboss.wcb.admin.theme.PortalThemeMemberSvc');
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new accessDetailPopWin(initialData);
			
			popWin.$dialog = BootstrapDialog.show({
				title:'广告展示页面',
		        message: $('<div></div>').load('/admin/popwin/ad_mobile_show_template.html'),
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
		                	var $page = popWin.$dialog.getModalBody();
		                	var $form = $page.find(".detail_form");
		                	var e = popWin.events['ok'];
		                	var rowId = popWin.jqGrid.jqGrid('getGridParam','selrow');
		                	var mobileShowTemplateIds = initialData.mobileShowTemplateIds;
		                	var mobilePortalThemeId = initialData.mobilePortalThemeId;
		                	var rowData = popWin.jqGrid.jqGrid('getRowData',rowId);
		                	var showTemplateId = rowData.showTemplateId;
		                	var memberAlias = $form.find('input[name="memberAlias"]').val();
		                	var portalSeq = $form.find('input[name="portalSeq"]').val();
		                	if(!mobilePortalThemeId){
		                		BootstrapDialog.warning("您还没有选择主题");
		                		popWin.$dialog.close();
		                		return;
		                	}
		                	if(!rowId && !popWin.initialData.showTemplateId){
	                			BootstrapDialog.warning("您还没有选择广告页面");
	                			popWin.$dialog.close();
		                		return;
	                		}
		                	
		                	if(showTemplateId && mobileShowTemplateIds.indexOf(','+showTemplateId +',') != -1){
	                			BootstrapDialog.warning("添加了相同的广告页面");
	                			popWin.$dialog.close();
		                		return;
	                		}
		                	
		                	//验证
		                	if(!$form.valid()){
		                		return;
		                	}
		                	
                			var PortalThemeMemberPo = {portalThemeId: mobilePortalThemeId, portalTemplateId: showTemplateId, memberAlias:memberAlias, portalSeq:portalSeq};
                			portalThemeMemberSvc.call('insertPortalThemeMember', [PortalThemeMemberPo], function(res){
                				var jqGrid = $("#adp_mobile_show_template_dataTable").jqGrid();
                				var postData = jqGrid.jqGrid("getGridParam", "postData");
                			  	postData.param = JSON.stringify({portalThemeId: PortalThemeMemberPo.portalThemeId});
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
		var $table = $page.find("#adp_ad_mobile_show_template_dataTable");
		
		var SHOWMODE={};
		var TMPTYPE={};
		var STATUS={};
		//字典
		sysparam.call('getDicData',['DIC_AC_SHOW_MODE'],function(res){
			var dom = "";
			for(var i in res){
				SHOWMODE[res[i].dicValue]=res[i].dicValueName;
			}
		});
		
		sysparam.call('getDicData',['DIC_TMP_TYPE'],function(res){
			var dom = "";
			for(var i in res){
				TMPTYPE[res[i].dicValue]=res[i].dicValueName;
			}
		});
		
		sysparam.call('getDicData',['DIC_STATUS'],function(res){
			var dom = "";
			for(var i in res){
				STATUS[res[i].dicValue]=res[i].dicValueName;
			}
		});
		
		//校验
		var validator=$form.validate({
			errorPlacement : function(error, element) {
				if (element.parent().hasClass("input-group")) {
					error.appendTo(element.parent().parent());
				}else{
					error.appendTo(element.parent());
				}
			}
		});
		self.jqGrid = $table.jqGrid({
			url : wboss.getWay + '/data/com.wboss.wcb.admin.ad.AdShowTemplateSvc?m=queryAdMobileShowTemplateList4Jq.object.object',
			colModel : [{name : 'showTemplateId',hidden:true},
			            {label : '页面名称',name : 'templateName'},
			            {label : '展现模式',name : 'showMode',
			            	formatter: function (cellValue, options, row){
			            		return SHOWMODE[cellValue];
		            		}
			            },
			            {label : '页面类型',name : 'tmpType',
			            	formatter: function (cellValue, options, row){
			            		return TMPTYPE[cellValue];
		            		}
			            },
			            {label : '模板图片',name : 'picUrl'},
			            {label : '缩略图',name : 'smallPicUrl'},
			            {label : '展现时长',name : 'showDuration'},
			            {label : '展现网页',name : 'showPage'},
			            //
			            {label : '模板描述',name : 'templateDesc',},
			            {label : '状态',name : 'status',
			            	formatter : function (cellValue, options, row){
			            		return STATUS[cellValue];
			            	}
			            }
			           ],
			onSelectRow : function(rowId){
				//清除之前的校验信息
				validator.resetForm();
				var data = self.jqGrid.griddata.rows[rowId-1];
			},
		    onPaging:function(){
		    	$form.status('show');
		    },
		   	onSortCol:function(){
		    	$form.status('show');
		    },
		   	loadComplete:function(data){
		   		self.jqGrid.griddata = data;
		    },
		    pager: "#adp_ad_mobile_show_template_jqGridPager"
		});
	}	
	return module;	
});