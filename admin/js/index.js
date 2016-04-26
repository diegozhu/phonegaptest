'use strict';

console.log("this is index");

var model = { user : ko.observable(ko.mapping.fromJS(new User())),tabs:ko.observableArray([])};
var $page;
var global={};
requirejs.config({
    shim: {
    'wboss.service': {
        exports: 'wboss.service'
        }
    }
});
function User(obj){
    var a = {
        menuList: [],
        clientType: null,
        effDate: null,
        expDate: null,
        ip: null,
        lang: "",
        loginPage: "",
        mac: null,
        orgnizationId: 0,
        partyId: null,
        partyName: null,
        password: "",
        privilegePo: [],
        regionId: null,
        role: null,
        roleId: 1,
        roleList: [],
        roleName: "",
        staffPo: {},
        userCode: "",
        userId: 0,
        userName: null,
        userVisitRecorded: false,
        vnoId: 0,
        vnoName: "",
    };
    for(var i in a){
        this[i] = a[i];
    }
    for(var i in obj){
        this[i]= obj[i];
    }

    if(obj != undefined && obj.staffPo != undefined){
        for(var i in obj.staffPo){
            this[i] = obj.staffPo[i] || this[i];
        }
        delete this.staffPo;
    }
    this.displayedName = this.roleName + ' : '+ this.staffName + ' ('+this.userCode+') ';

    //process privilege
    if(obj != undefined && obj.privilegePo != undefined){
        var privilege = {};
        var privilege_mapping_id = {};
        for(var i in obj.privilegePo){
            var item = obj.privilegePo[i];
            privilege[item.privilegeCode] = item;
            privilege_mapping_id[item.privilegeId] = item;
        }
        this.privilege = privilege;
        this.privilege_mapping_id = privilege_mapping_id;  
    }
    // process menu
    if(obj != undefined && obj.alMenuPo != undefined){
        var allMenuList = obj.alMenuPo;
        var parentMenuObj = {};
        var filteredMenuPos = [];
        var randomIcon = ['fa-user','fa-envelope','fa-gear','fa-power-off','fa-dashboard','fa-bar-chart-o','fa-table','fa-edit','fa-desktop','fa-wrench','fa-arrows-v','fa-file','fa-dashboard'];
        var count = 0;
        
        for(var i in allMenuList){
            var item = allMenuList[i];
            count++;
            count = randomIcon[count] == undefined ? 0 : count;
            item.icon = randomIcon[count];
            if(item.parentMenuId == null){
                item.subMenu = [];
               
                parentMenuObj[item.menuId] = item;
            }else{
               filteredMenuPos.push(item);
            }                 
        }
        for(var i in filteredMenuPos){
            var subMenu = filteredMenuPos[i];
            var parentMenu = parentMenuObj[subMenu.parentMenuId];
            if(parentMenu == undefined){
                console.error(subMenu);
                console.error("could not find parent menu!");
            }else{
                parentMenu.subMenu.push(subMenu);
            }
        }

        for(var i in parentMenuObj){
            this.menuList.push(parentMenuObj[i]);
        }
    }
    return this;
}

model.tabClick = function(tabItem){
    if(tabItem.selected())  // already actived
        return ;
    // in-active previous selected.
    var allTabs =  model.tabs();
    for(var i in allTabs){
        var tab = allTabs[i];
        if(tab.selected() && tab.id() != tabItem.id()){
            tab.selected(false);
            var module = tab.module();
            var tabContentId = "tabs_"+module.replace(/\//gi,"_");
            $("#"+tabContentId).hide();
            break;
        }
    }
    // active 
    tabItem.selected(true);
    var module = tabItem.module();
    var tabContentId = "tabs_"+module.replace(/\//gi,"_");
    window.$page = $("#"+tabContentId).show();
    //History.pushState('', '', '/admin/'+module.replace("modules/",""));
    require([module],function(js) {
        (js.onActive||function(){})();
        $(window).trigger('resize');
    });
}

model.removeTabClick = function(tabItem){
    var module = tabItem.module(),isSelected = tabItem.selected();
    var tabContentId = "#tabs_"+module.replace(/\//gi,"_");
    $(tabContentId).remove();
    model.tabs.remove(tabItem);
    if(tabItem.selected())
        $page=null;
    if(isSelected && model.tabs().length > 0){
        var tab = model.tabs()[model.tabs().length - 1];
        var tabContentId = "tabs_"+tab.module().replace(/\//gi,"_");
        $("#nav_"+tabContentId+" .my-nav-tab").trigger('click');
    }
    model.tabs().length == 0 && $('#page-img-bg').show();
}

function openTab(dom){
    var $dom = $(dom);
    var menuId = $dom.attr('id');
    var module = "modules/"+($dom.data('page-url')||"").replace("/admin/","").replace(".html","");
    var tabContentId = "tabs_"+module.replace(/\//gi,"_");
    if($page != undefined && $page.selector == "#"+tabContentId){
        return;
    }
    var menuName = $dom.data('menu-name');
    var $tabContent = $("#"+tabContentId);
    //History.pushState('', '', '/admin/'+module.replace("modules/",""));
    var relativeUrl = location.pathname.replace(module.replace("modules/",""),"").replace("/admin","");
    console.log("loading module "+module);
    require(["js/require-text!"+module+".html",module],function(html,js) {
            // test html dom id polution
            var formatedModuleName = module.replace(/\//gi,"_").substring(8);
            var match = html.match(/ id *= *['"]{1}[a-zA-Z0-9]*['"]{1}/gi);
            for(var i in match){
                var id = match[i].replace(/ id *= *['"]{1}/gi,"").replace(/['"]{1}/gi,"");
                if(!id.startsWith(formatedModuleName)){
                    var msg =  "id请加"+formatedModuleName+"前缀防止冲突,相关id:"+id;
                    windowError(msg,module+".html",'');
                    throw msg;
                }
            }
            $(".tab").hide();
            var pageCreate = false;
            if($tabContent[0] == undefined){
                model.tabs.push(ko.mapping.fromJS({name:menuName,id:'nav_'+tabContentId,module:module,selected:false}));
                $("#tabs").append("<div class='tab' id='"+tabContentId+"' data-menu-id='"+menuId+"'>"+html+"</div>");
                $tabContent = $("#"+tabContentId);
                pageCreate = true;
            }else{
                $tabContent.show();
            }
            if(pageCreate){
                try{
                    ko.applyBindings(wboss._dictionary,$tabContent[0]);
                }catch(e){
                    console.error(e);
                }
                // to diabled mobile auto pop keyboard
                $tabContent.find('.input-group input.datepicker').prop("readonly",true);
                $tabContent.find('.input-group input.pop-win-controller').prop("readonly",true);
                $tabContent.find('.datepicker').each(function(i,e){
                    var $timeInput = $(e);
                    dateTimePickerOpt.defaultDate = parseDate($timeInput.data("default-value"));
                    dateTimePickerOpt.minDate = parseDate($timeInput.data("min"));
                    dateTimePickerOpt.maxDate = parseDate($timeInput.data("max"));
                    dateTimePickerOpt.format = $timeInput.data('format')|| 'YYYY-MM-DD HH:mm:ss';
                    $timeInput.datetimepicker(dateTimePickerOpt);
                });
                setListeners($tabContent);
                js.onCreate($tabContent,relativeUrl);
            }
            window.$page = $tabContent;
            $('#page-img-bg').hide();
            $("#nav_"+tabContentId+" .my-nav-tab").trigger('click'); 
        }
    );
}

requirejs.config({
    baseUrl: '/admin/'
});

require(["modules/login"],function(login){
    login.checkLogin();
    $("#changeRole").on("click",function(){ login.choseRole();});
    $("#logout").on("click",function(){ login.logout();});
    $("#login").on("click",function(){ login.login();});
    $("#resetPassword").on("click",function(){ login.resetPassword();});
});

ko.applyBindings(model);
$(window).trigger('resize');
$('.menuList').on("click",'.menuListItem',function(r){
    window.r = r;
    var d = $(r.currentTarget);
    if(d.hasClass('collapsed')){
        $(".fa-caret-down",d).show();
        $(".fa-caret-right",d).hide();
    }else{
        $(".fa-caret-down",d).hide();
        $(".fa-caret-right",d).show();
    }
});


$("#splitLine").on("click",function(e){
    var $dom = $(e.currentTarget);
    window.d = $dom;

    if($dom.hasClass('menu-show')){
        $dom.removeClass('menu-show');
        $dom.addClass('menu-hide');
        $($dom.children()[1]).hide();
        $($dom.children()[0]).show();
    }else{
        $dom.removeClass('menu-hide');
        $dom.addClass('menu-show');
        $($dom.children()[0]).hide();
        $($dom.children()[1]).show();
    }
    $(".menuList").animate({width:'toggle'},100,function(){
        $(window).trigger('resize');
    });
});

function requestFullScreen(el) {
    // Supports most browsers and their versions.
    var requestMethod = el.requestFullScreen || el.webkitRequestFullScreen || el.mozRequestFullScreen || el.msRequestFullscreen;
    if (requestMethod) { // Native full screen.
        requestMethod.call(el);
    } else if(typeof window.ActiveXObject !== "undefined") { // Older IE.
        
        try{
            var wscript = new ActiveXObject("WScript.Shell").SendKeys("{F11}");
        }catch(e){

        }
       
    }
    
    $(window).trigger('resize');
    return false
}

function toggleFull() {
    var elem = document.body; // Make the body go full screen.
    var isInFullScreen = (document.fullScreenElement && document.fullScreenElement !== null) ||  (document.mozFullScreen || document.webkitIsFullScreen);
    if (isInFullScreen) {
        cancelFullScreen(document);
    } else {
        requestFullScreen(elem);
    }
    $(window).trigger('resize');
    return false;
}

function cancelFullScreen(el) {
    var requestMethod = el.cancelFullScreen||el.webkitCancelFullScreen||el.mozCancelFullScreen||el.exitFullscreen;
    if (requestMethod) { // cancel full screen.
        requestMethod.call(el);
    } else if (typeof window.ActiveXObject !== "undefined") { // Older IE.
        try{
            var wscript = new ActiveXObject("WScript.Shell").SendKeys("{F11}");
        }catch(e){}
    }
}

$(document).ajaxError(processJqueryAjaxError);

window.onerror = windowError;

function windowError(message,url,lineNumber){
    console.error(message+" @"+url+':'+lineNumber);
    BootstrapDialog.show({
        message: message +" "+url+":"+lineNumber, type: BootstrapDialog.TYPE_DANGER, title: '出错啦！', buttons: [{
            label: '关闭',
            action: function (dialogItself) {
                dialogItself.close();
            }
        }]
    });
}

function processJqueryAjaxError(event, jqxhr, settings, thrownError) {
    console.error(event);
    console.error(jqxhr);
    console.error(settings);
    console.error(thrownError);
    var message = jqxhr.status +" "+thrownError+" \n\n错误URL:\n\n"+settings.url;
    if(jqxhr.status == 401){       
        message = jqxhr.status +" "+thrownError+"!\n\n 您还没有登陆或者登陆已超时：\n\n";
        BootstrapDialog.show({
            onhide:function(){
                location.reload();
            },
            message: message, type: BootstrapDialog.TYPE_DANGER, title: '出错啦！', buttons: [{
                label: '关闭',
                onhide:function(){
                    location.reload();
                },
                action: function (dialogItself) {
                    dialogItself.close();
                }
            }]
        });
        return;
    }    
    if(jqxhr.status == 403){
        message = jqxhr.status +" "+thrownError+"!\n\n 您没有访问以下链接的权限：\n\n"+settings.url;
    }
    BootstrapDialog.show({
        message: message, type: BootstrapDialog.TYPE_DANGER, title: '出错啦！', buttons: [{
            label: '关闭',
            action: function (dialogItself) {
                dialogItself.close();
            }
        }]
    });
}

// process url
$(document).on("loginok",function(res){
   // debugger
    var path = location.pathname.toLowerCase();
    if("/admin/index.html".contains(path)){
        return;
    }
    path = path.endsWith("/") ? path : path+".html";
    if(!path.contains("/"))
        return;
    if(model == null || model.user() == null){
        BootstrapDialog.show({
            message: '用户信息异常！', type: BootstrapDialog.TYPE_DANGER, title: 'Error', 
            onhide: function(){
                   require(["modules/login"],function(login){
                        login.logout();
                    });
                }
        });
        return;
    }
    var pass = false;
    var user = ko.mapping.toJS(model.user());
    for(var i in user.alMenuPo){
        if(path == user.alMenuPo[i].url){
            pass = true;
            break;
        }
    }
    if(!pass){
        BootstrapDialog.show({
            message: '没有访问'+path+' 的权限!' ,type: BootstrapDialog.TYPE_DANGER, title: 'Error', 
            onhide:function(){
                    History.pushState('', '', '/admin/');
                }
        });
    }
    var selector = 'a[data-page-url="'+path+'"]';
    var $targetSubMenu = $(selector);
    var $targetParentMenu = $targetSubMenu.closest('ul').closest('li').children();
    $($targetParentMenu[0]).trigger("click");
    $targetSubMenu.trigger('click');
});
//$.fn.datetimepicker.defaults.widgetPositioning={horizontal: "auto", vertical: "bottom"};
$.jgrid.defaults = {
    recordtext: "<span class='glyphicon glyphicon-refresh refresh pointer btn-refresh mt10'></span> &nbsp; {0}-{1}, 共{2}条   &nbsp;<a class='btn-export' href='javascript:void(0)'>导出</a>",
    emptyrecords: "没有数据",
    loadtext: "加载中...",
    pgtext : "{0}/{1}",
    mtype : 'POST',
    shrinkToFit: !/mobile/i.test(navigator.userAgent) && !/ipad/i.test(navigator.userAgent),
    autowidth: true,
    autoScroll: false,
    search:true,
    datatype : 'json',
    viewrecords : true,
    width:'100%',
    height:'auto',
    sortable : true,
    pgbuttons : true,
    rowNum : 15,
    rowList:[15,30,50,100]
}

function gotoPage(moduleName){
    //$("a[data-page-url='/admin/cfg/sysparam.html']").trigger('click');
    $("a[data-page-url='/admin/"+moduleName+".html']").trigger('click');
}