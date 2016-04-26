define([],function(){
	var module = {};
	module.loginAdminSvc = new Service("com.wboss.wcb.admin.LoginAdminSvc");
	
	module.checkLogin = function(){
		try{
			for(var i in model.tabs()){
				try{model.removeTabClick(model.tabs()[i]);}catch(e){}
			}
		}catch(e){}
		this.loginAdminSvc.call("getLoginInfo",[],function(user){
		    module.loginOk(user,true);
		    $("#loginPage").fadeOut(500);
		},function(res){
			// disable failed dialog.
			console.log(res);
		});
	};
	module.choseRole = function (user,callback){
	    if(user == undefined || typeof user == "function"){
	        user = ko.mapping.toJS(model.user);
	    }
	    if(user == null || typeof user != "object"){
	        return;
	    }
	    BootstrapDialog.show({
	        type: BootstrapDialog.TYPE_WARNING,
	        title: '请选择一个角色',
	        message: function(dialogRef){
	            var dom = "";
	            user.roleList.every(function(r){
	                dom += '<button class="btn btn-default user-role-button" style="margin-left:5px;margin-top:5px;" data-role-id='+r.roleId+' data-role-name="'+r.roleName+'"><div class="login-user-avatar"></div><div>'+r.roleName+'</div></button>';
	                return true;
	            });
	            var button = $(dom);
	            button.on('click', {dialogRef: dialogRef}, function(e){
	                var roleId = $(e.currentTarget).data('role-id');
	                var roleName = $(e.currentTarget).data('role-name');
	                module.loginAdminSvc.call("changeRole",[roleId],function(user){
	                    (callback||function(){})(new User(user),roleId,roleName);
	                    dialogRef.close();           
	                });
	            });
	            return button ;
	        },
	        closable: false
	    });
	};

	module.loginOk = function(user,isRefreshed){
	    user = new User(user);
	    module.loginAdminSvc.call('getSystemInfo',[],function(res){
	    	var s = res.split("-");
	    	var companyName = s[0];
	    	var systemStartTime = new Date(parseInt(s[1]));
	    	$("#admin_system_info").html(companyName);
	    	setInterval(function(){
	    		var a = (new Date()).getTime() - systemStartTime.getTime();
	    		var runningTime = formatTime(parseInt(a/1000));
	    		$("#runningtime").html(systemStartTime+"启动， 运行："+runningTime);
	    	},1000);
	    	
	    });
	    setTimeout(function(){
	    	
	    },1000);
	    if(isRefreshed || user.roleList.length == 1){
	        model.user(ko.mapping.fromJS(user));
	        $("#loginPage").fadeOut(500);
	        $(document).trigger('loginok');
	    }else{
	        module.choseRole(user,function(user,roleId,roleName){
	            user.roleId = roleId;
	            user.roleName = roleName;
	            model.user(ko.mapping.fromJS(user));
	            $("#loginPage").fadeOut(500);
	            $(document).trigger('loginok');
	         });
	    }
	};

	module.login = function(){
		var username = $("#username").val() || "";
		var password = $("#password").val() || "";
		this.loginAdminSvc.call("login",[username,md5(password),""],this.loginOk);
		//handle url
	};

	module.logout = function(){
		try{
			for(var i in model.tabs()){
				try{model.removeTabClick(model.tabs()[i]);}catch(e){}
			}
		}catch(e){}
		try{
			this.loginAdminSvc.call('logout',[],function(){
				model.user(ko.mapping.fromJS(new User()));
				$("#loginPage").fadeIn(500);
			});
		}catch(e){}
	    try{
	    	$('.my-nav-tab-remove-icon').trigger('click');
	    }catch(e){}
	};

	$("#password").on("keydown",function(e){
		if(e.keyCode == 13){
			 $(".btn-login").focus();
			 module.login();
			 return false;
		}
	 });
	$("#username").on("keydown",function(e){
		if(e.keyCode == 13){
			 $(".btn-login").focus();
			 module.login();
			 return false;
		}
	 });	
	return module;
});
