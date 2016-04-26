define(function () {
	var staffSvc = new Service("com.wboss.general.staff.StaffSvc");
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new accessPopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'修改密码',
				//closable: true,
            	closeByBackdrop: false,
            	closeByKeyboard: false,
		        message: $('<div></div>').load('/admin/popwin/reset_password.html'),
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
		                	var $form = popWin.$page.find('.popwin_reset_password');
		                	if(!$form.valid()){
		                		return;
		                	}
		                	var data = $form.serializeObject();
		                	if(data.password_repeat !== data.password){
		                		BootstrapDialog.warning("密码不一致！");
		                		return;
		                	}
		                	staffSvc.call('modifyStaffPass',["",data.password_old,data.password],function(){
		        				BootstrapDialog.success("修改成功！");
		                		for(var i in e){
		                			typeof e[i] == "function" && e[i](data,'ok');
		                		}
		                    	popWin.$dialog.close();
		                	});
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

	function accessPopWin(initialData){
		this.$dialog = null;
		this.$grid = null;
		this.events = {};
		this.id = Math.random();
		this.initialData = initialData;
		module.win.push(this);
		return this;
	}

	accessPopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	accessPopWin.prototype.init = function(cb){
		var self = this,$dialog = this.$dialog, $page = this.$page = $dialog.getModalBody();
	}
	
	return module;
});