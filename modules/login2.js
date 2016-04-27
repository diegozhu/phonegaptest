define([],function(){
    var module = {};
    module.loginAdminSvc = new Service("com.wboss.wcb.admin.LoginAdminSvc");

    module.startSysInfoRefresh = function(){
        this.loginAdminSvc.call('getSystemInfo',[],function(res){
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
    }

    module.checkLogin = function(){
        this.loginAdminSvc.call("getLoginInfo",[],function(user){
            // login ok
            module.startSysInfoRefresh();
            user = new User(user);
            model.user(ko.mapping.fromJS(user));
            $(document).trigger('loginok');
        },function(res){
            location.href = "/admin/login.html";
        });
    };
    module.choseRole = function (){
        var user = ko.mapping.toJS(model.user);
        BootstrapDialog.show({
            type: BootstrapDialog.TYPE_WARNING,
            title: '请选择一个角色',
            message: function(dialogRef){
                var dom = "";
                user.roleList.every(function(r){
                    dom += '<button class="btn btn-default user-role-button" style="margin-left:5px;margin-top:5px;" data-role-id='+r.roleId+' data-role-name="'+r.roleName+'"><div class="login-user-avatar"></div><div class="text-overflow">'+r.roleName+'</div></button>';
                    return true;
                });
                var button = $(dom);
                button.on('click', {dialogRef: dialogRef}, function(e){
                    var roleId = $(e.currentTarget).data('role-id');
                    var roleName = $(e.currentTarget).data('role-name');
                    module.loginAdminSvc.call("changeRole",[roleId],function(user){
                        dialogRef.close();
                        location.reload();
                    });
                });
                return button ;
            }
        });
    };

    module.logout = function(){
        this.loginAdminSvc.call('logout',[],function(){
           location.href = "login.html";
        });
    };
    return module;
});
