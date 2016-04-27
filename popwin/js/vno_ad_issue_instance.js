define(function() {
	var sysparam = new Service("com.wboss.general.param.SysParamSvc");
	var adMgr = new Service("com.wboss.wcb.admin.ad.AdMgrSvc");
	module = {
		win : [],
		createPopWin : function(cb, initialData) {
			var popWin = new vnoAdPopWin(initialData);
			popWin.$dialog = BootstrapDialog
					.show({
						title : '广告发布商',
						message : $('<div></div>').load(
								'/admin/popwin/vno_ad_issue_instance.html'),
						onshown : function() {
							popWin.init(cb);
						},
						onhide : function() {
							popWin = null;
						},
						buttons : [
								{
									label : '确定',
									action : function(dialog) {
										var e = popWin.events['ok'];
										var issueInstanceIds = [];
										var vnoNames = [];
										var row= popWin.$grid.jqGrid('getRowData');
										//查询多个对象，分别把id和名称存到数组中
			                			for(var i=0;i<row.length;i++){
			                				issueInstanceIds.push(row[i].issueInstanceId);
			                				vnoNames.push(row[i].vnoName);
			                			}
									   var temp = JSON.stringify(row);
									//	var rowData = popWin.$grid.jqGrid('getRowData');
											var data = $
													.extend(
															popWin.initialData,
															{
																issueInstanceId : issueInstanceIds.join(','),
																vnoNames : vnoNames.join(','),
																temp : temp
															});
											for ( var i in e) {
												typeof e[i] == "function"
														&& e[i](data, 'ok');
											}
											popWin.$dialog.close();
										}
								},
								{
									label : '取消',
									action : function(dialog) {
										var e = popWin.events['cancel'];
										for ( var i in e) {
											typeof e[i] == "function"
													&& e[i](popWin.data,
															'cancel');
										}
										popWin.$dialog.close();
									}
								}

						]
					});
			return popWin;
		}
	};

	function vnoAdPopWin(initialData) {
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	vnoAdPopWin.prototype.on = function(event, func) {
		this.events[event] = this.events[event] == undefined ? []
				: this.events[event];
		this.events[event].push(func);
		return this;
	}

	vnoAdPopWin.prototype.init = function(cb) {
		var self = this, $dialog = this.$dialog, $page = this.$page = $dialog
				.getModalBody();
		var $form = $page.find(".detail_form");
		var $table = $("#vno_ad_dataTable");
		var vnoId = model.user().vnoId(), vnoName = model.user().vnoName();
		//虚拟运营商初始化
		$form.find('input[name="vnoId"]').val(vnoId);
		$form.find('input[name="vnoName"]').val(vnoName);
		$form.data('default',{status:"00A",effDate: new Date().toString("yyyy-MM-dd hh:mm:ss"),expDate:"2030-01-01 00:00:00",vnoId:vnoId,vnoName:vnoName});
		var TYPE_OBJ = {
				'00A' : '有效',
				'00U' : '归档',
				'00X' : '失效',
				'000' : '创建',
				'00B' : '审核不通过'
			};
		var UN_TYPE_OBJ = {
			'有效' : '00A',
			'无效' : '00X',
			'归档' : '00U',
			'审核不通过' : '00B',
			'创建' : '000'
		};
		// 校验
		var validator = $form.validate({
			errorPlacement : function(error, element) {
				if (element.parent().hasClass("input-group")) {
					error.appendTo(element.parent().parent());
				} else {
					error.appendTo(element.parent());
				}
			}
		});
		// 状态
		sysparam.call('getDicData', [ 'DIC_AD_STATUS' ], function(res) {
			var dom = "";
			for ( var i in res) {
				dom += "<option class='form-control optionType' value='"
						+ res[i].dicValue + "'>" + res[i].dicValueName
						+ "</option>"
			}
			$page.find("select[name='status']").append(dom);
		});

		$form.on('click', ".btn-class-ok", function(e) {
			if (!$form.valid()) {
				return;
			}
			var vnoAd = $form.serializeObject();
			var msg = $form.status() == "new" ? '添加成功！' : '更新成功！';

			if ($form.status() == "new") {
				var rowNum = self.$grid.jqGrid('getGridParam', 'records');
				vnoAd.issueInstanceId = rowNum + 1;
				vnoAd.flag = "add";
				self.$grid.jqGrid("addRowData", rowNum + 1, vnoAd);
				BootstrapDialog.success(msg);
				$form.status('show');
			} else {
				var row = self.$grid.jqGrid('getGridParam', 'selrow');
				if(vnoAd.status =="00X" ||vnoAd.status =="00B" )
					{
					vnoAd.flag = "del";
					}else{
						vnoAd.flag = "edit";
					}
				self.$grid.jqGrid("setRowData", row, vnoAd);
				BootstrapDialog.success(msg);
				$form.status('show');
			}
		});

		self.$grid = $("#vno_ad_dataTable")
				.jqGrid(
						{
							url : wboss.getWay + '/data/com.wboss.wcb.admin.ad.AdMgrSvc?m=qryVnoAdIssueInstanceByJq.object.object',
							datatype : 'local',
							colModel : [ {
								name : 'issueInstanceId',
								hidden : true
							},{
								name : 'flag',
								hidden : true
							}, {
								name : 'adInstanceId',
								hidden : true
							}, {
								label : '生效时间',
								name : 'effDate'
							}, {
								label : '失效时间',
								name : 'expDate'
							}, {
								label : '',
								name : 'vnoId',
								hidden : true
							}, {
								label : '企业名称',
								name : 'vnoName',
								sortable : false,
								width : 200
							}, {
								label : '状态',
								name : 'status',
								formatter : function(cellValue, options, row) {
									return TYPE_OBJ[cellValue];
								},
								unformat : function(cellValue, options, row) {
									return UN_TYPE_OBJ[cellValue];
								}
							} ],
							onSelectRow : function(rowId) {
								var data = self.$grid.jqGrid("getRowData",
										rowId);
								// 清除之前的校验信息
								validator.resetForm();
								$page.find(".btn-class-edit").prop('disabled',
										false);
								// 设置表单状态，目前有new，edit，show三种状态，
								$form.deSerializeObject(data).status('show');
							},
							onPaging : function() {
								$form.status('show');
							},
							onSortCol : function() {
								$form.status('show');
							},
							loadComplete : function(data) {
								$form.status('show');
								// 页面加载时，编辑不可用
								$form.find(".btn-class-edit").prop('disabled',
										true);
							},
							pager : "#vno_ad_jqGridPager",
							height : '300px'
						});
		var adInstanceId = self.initialData.adInstanceId;
		var temp = self.initialData.temp;
		var postData = self.$grid.jqGrid("getGridParam", "postData");
		if (temp != "") {
			temp = JSON.parse(temp);
			var rowNum = self.$grid.jqGrid('getGridParam', 'records');
			self.$grid.jqGrid("addRowData", rowNum + 1, temp);
		}
		else if (adInstanceId != "") {
			postData.param = JSON.stringify(self.initialData);
			self.$grid.jqGrid("setGridParam", {
				datatype : 'json',
				search : true
			}).trigger("reloadGrid", [ {
				page : 1
			} ]);
		}
		
		debugger
		(cb || function(){})();

		
	}

	return module;
});