"use strict";
(function($){
    $.fn.serializeObject = function () {
        var result = {};
        this.find("select").each(function(i,element){
            var node = result[element.name];
            if ('undefined' !== typeof node && node !== null) {
                if ($.isArray(node)) {
                    node.push(element.value);
                } else {
                    result[element.name] = [node, element.value];
                }
            } else {
                result[element.name] = element.value;
            }
        });
        this.find("input[type!='radio'][type!='checkbox']").each(function(i,element){
            var node = result[element.name];
            if ('undefined' !== typeof node && node !== null) {
                if ($.isArray(node)) {
                    node.push(element.value);
                } else {
                    result[element.name] = [node, element.value];
                }
            } else {
                result[element.name] = element.value;
            }
        });
        this.find("input[type = 'radio']:checked").each(function(i,element){
            var node = result[element.name];
            var value = element.value;
            if(value == "on" || value == "checked")
                value = true;
            if ('undefined' !== typeof node && node !== null) {
                if ($.isArray(node)) {
                    node.push(value);
                } else {
                    result[element.name] = [node, value];
                }
            } else {
                result[element.name] = value;
            }
        });
        this.find("input[type = 'checkbox']:checked").each(function(i,element){
            var node = result[element.name];
            var value = element.value;
            if(value == "on" || value == "checked")
                value = true;
            if ('undefined' !== typeof node && node !== null) {
                if ($.isArray(node)) {
                    node.push(value);
                } else {
                    result[element.name] = [node, value];
                }
            } else {
                result[element.name] = value;
            }        });
        this.find("textarea").each(function(i,element){
            var node = result[element.name];
            if ('undefined' !== typeof node && node !== null) {
                if ($.isArray(node)) {
                    node.push(element.value);
                } else {
                    result[element.name] = [node, element.value];
                }
            } else {
                result[element.name] = element.value;
            }
        });
        return result;
    };
})(jQuery);


(function($){
    $.fn.deSerializeObject = function (obj) {
        this.find("input[type!='radio'][type!='checkbox']").each(function(idx,domElement){
            if(domElement.name)
                $(domElement).val(obj[domElement.name] == undefined ? "" : obj[domElement.name] );
        });
        this.find('select').each(function(idx,domElement){
            if(domElement.name)
                $(domElement).val(obj[domElement.name] == undefined ? "" : obj[domElement.name] );
        });
        this.find('textarea').each(function(idx,domElement){
            if(domElement.name)
                $(domElement).val(obj[domElement.name] == undefined ? "" : obj[domElement.name] );
        });
        this.find("input[type = 'radio']").each(function(idx,domElement){
            if(domElement.name)
                $(domElement).prop('checked', obj[domElement.name] == $(domElement).val());
        });
        this.find("input[type = 'checkbox']").each(function(idx,domElement){
            if(domElement.name)
                $(domElement).prop('checked', (obj[domElement.name] == undefined ? "" : obj[domElement.name]).indexOf($(domElement).val()) != -1);
        });
        
        return this;
    };
})(jQuery);



(function($){
    $.fn.reloadPage = function (obj) {
        var $self = $(this);
        var id = $self.attr('id');
        var menuId = $self.data('menu-id');
        if(!id.startsWith('tabs_modules_')){
            console.error('not a wboss module tab!');
            return ;
        }
        //nav_tabs_modules_cfg_product_offer
        $('#nav_'+id).find('.my-nav-tab-remove-icon').trigger('click');
        setTimeout(function(){
            $('#'+menuId).trigger('click');
        },0);
        return this;
    };
    $.fn.close = function (obj) {
        var $self = $(this);
        var id = $self.attr('id');
        var menuId = $self.data('menu-id');
        if(!id.startsWith('tabs_modules_')){
            console.error('not a wboss module tab!');
            return ;
        }
        //nav_tabs_modules_cfg_product_offer
        $('#nav_'+id).find('.my-nav-tab-remove-icon').trigger('click');
        return this;
    };
})(jQuery);



(function($){
    // form 增强
    $.fn.isDataChanged = function(){
        var backup = this.data('backup') || {};
        var now = this.serializeObject();
        for(var i in backup){
            if(backup[i]!= now[i])
                return true;
        }
        for(var i in now){
            if(backup[i]!= now[i])
                return true;
        }
        return false;
    }
    $.fn.privilege = function(data){
        var privilege = ko.mapping.toJS(model.user()).privilege;
        for(var i in data){
            var allow = privilege[i] !== undefined;
            var obj = data[i];
            if(obj instanceof jQuery){
                data[i].attr('data-privilege',allow).prop('disabled',!allow);
            }else if(typeof obj == "function"){
                obj(i,allow);
            }
            
        }
        return this;
    };

    $.fn.status = function (status) {
        if(status == null)
            return this.data('jquery-form-status');
        var privilege = this.data('privilege');
        switch(status){
            case "new":
                if(privilege && !privilege.create){
                    console.error('dont have create privilege,return!');
                    break;
                }
                var inputs = this.find("input").not('.manual_handle');
                inputs.prop("disabled", true);
                inputs.filter('.creatable').prop("disabled", false);
                var textarea=this.find("textarea").not('.manual_handle');
                textarea.prop("disabled", true);
                textarea.filter('.editable').prop('disabled',false);
                var selects = this.find("select").not('.manual_handle');
                selects.prop("disabled", true);
                selects.filter('.creatable').prop("disabled", false);
                var checkboxs=this.find("input[type='checkbox']").not('.manual_handle');
                checkboxs.prop("disabled", true);
                checkboxs.filter('.creatable').prop("disabled", false);
                var radios=this.find("input[type='radio']").not('.manual_handle');;
                radios.prop("disabled", true);
                radios.filter('.creatable').prop("disabled", false);
                this.find(".btn-class-edit").hide();
                this.find(".btn-class-new").hide();
                this.find(".btn-class-ok").show();
                this.find(".btn-class-cancel").show();
                this.find(".hide-when-form-status-new").show();
                break;
            case "edit":
                if(privilege && !privilege.update){
                    console.error('dont have update privilege,return!');
                    break;
                }
                var inputs = this.find("input").not('.manual_handle');
                inputs.prop("disabled", true);
                inputs.filter('.editable').prop('disabled',false);
                var textarea=this.find("textarea").not('.manual_handle');
                textarea.prop("disabled", true);
                textarea.filter('.editable').prop('disabled',false);
                var selects = this.find("select").not('.manual_handle');;
                selects.prop("disabled", true);
                selects.filter('.editable').prop("disabled", false);
                var checkboxs=this.find("input[type='checkbox']").not('.manual_handle');
                checkboxs.prop("disabled", true);
                checkboxs.filter('.editable').prop("disabled", false);
                var radios=this.find("input[type='radio']").not('.manual_handle');
                radios.prop("disabled", true);
                radios.filter('.editable').prop("disabled", false);
                this.find(".btn-class-edit").hide();
                this.find(".btn-class-new").hide();
                this.find(".btn-class-ok").show();
                this.find(".btn-class-cancel").show();
                this.find(".hide-when-form-status-edit").show();
                break;
            case "show":
                this.find("input").not('.manual_handle').prop("disabled", true);
                this.find("select").not('.manual_handle').prop("disabled", true);
                this.find("textarea").not('.manual_handle').prop("disabled", true);
                this.find("input[type='checkbox']").not('.manual_handle').prop("disabled", true);
                this.find(".btn-class-edit").show();
                this.find(".btn-class-new").show();
                this.find(".btn-class-ok").hide();
                this.find(".btn-class-cancel").hide();
                this.find(".hide-when-form-status-show").show();
                break;
        }
        this.data('jquery-form-status',status);
        return this;
    };
})(jQuery);

function setListeners($page){
$page.find(".btn-class-edit").on('click',function(e){
    var $form = $($(e.target).parents("form")[0]);
    $form.status('edit');
    $form.data('backup',$form.serializeObject());
})

$page.find(".btn-class-new").on('click',function(e){
    var $form = $($(e.target).parents("form")[0]);
    var validator = $form.data('validator');
    (validator && validator.resetForm());
    $form.status('new');
    $form.data('backup',$form.serializeObject());
    if($form.data('default') != undefined){
        $form.deSerializeObject($form.data('default'));
    }
})
$page.find(".btn-class-ok").on('click',function(e){
    var $form = $($(e.target).parents("form")[0]);
	if ($form.valid && !$form.valid()) {
		return false;
	}
})
$page.find(".btn-class-cancel").on('click',function(e){
    var $form = $($(e.target).parents("form")[0]);
    var validator = $form.data('validator');
    (validator && validator.resetForm());
    $form.status('show');
    if($form.data('backup') != undefined){
        $form.deSerializeObject($form.data('backup'));
    }
})
};
$(document).on("change",".btn-search",searchGrid);
$(document).on("click",".btn-search",function(e){
    return e.target.nodeName !== "SELECT" && searchGrid(e);    
});

function searchGrid(e){
    var $form = $($(e.target).parents(".search-form")[0]);
    //validate data-time span
    var validated = true;
    $form.find(".datetimepickerspan").each(function(i,e){
        var $this = $(e);
        var startTime = $this.find(".startTime").val().toDate('yyyy-MM-dd').getTime();
        var endTime = $this.find(".endTime").val().toDate('yyyy-MM-dd').getTime();
        var timeRange = parseDate($this.data('range')).getTime();
        if(startTime > endTime){
            BootstrapDialog.warning('开始时间不能晚于结束时间');
            validated = false;
            return false;
        }
        if(endTime - startTime > timeRange){
            BootstrapDialog.warning('时间段不能超过'+$this.data('range').replace("d","")+'天');
            validated = false;
            return false;
        }
    });
    if(!validated)
        return false;
    var gridIds = ($form.data('for-jqgrid-id') || "").split(";");  //支持以;分割的多个jqgrid
    var queryParam = JSON.stringify($form.serializeObject());
    for(var i in gridIds){
        var jqGrid = $("#"+gridIds[i]).jqGrid();
        var postData = jqGrid.jqGrid("getGridParam", "postData") || {};
          postData.param = queryParam;
           jqGrid.jqGrid("setGridParam", {search:true,datatype : 'json'}).trigger("reloadGrid", [{ page: 1}]); 
    }
}

$(document).on("keydown",".search-form input",function(e){
    if(e.keyCode != 13) return ;
    var $btn = $(e.target).parents('.search-form').find('.btn-search');//
    $btn.length != 0 && $btn.trigger("click");
    return false;
});

$(document).on("click",".btn-refresh",function(e){
    var gridId = $(e.target).parents('.ui-widget-content').attr('id').trim('gbox_');
    var jqGrid = $("#"+gridId).jqGrid();
       jqGrid.jqGrid("setGridParam", {search:true}).trigger("reloadGrid"); 
});

$(document).on("click",".btn-export",function(e){
    var gridId = $(e.target).parents('.ui-widget-content').attr('id').trim('gbox_');
    BootstrapDialog.show({
        title: '导出选项',
        message: '<div style="float:left;width:40%;text-align:left;"><b>导出格式：</b><br /><br />'
        +'<label><input type="radio" value="excel" checked name="filetype" />&nbsp;excel格式</label><br />'
        +'<label><input type="radio" value="csv" name="filetype" />&nbsp;csv格式</label></div>'
        +'<div style="float:left;width:40%;text-align:left;"><b>数据范围：</b><br /><br />'
        +'<label><input type="radio" value="page" checked name="data" />&nbsp;当前页(含查询参数)</label><br />'
        +'<label><input type="radio" value="all" name="data" />&nbsp;全量数据</label></div>'
        +'<div class="clear"></div>'
        +'<input class="hide" type="text" value="'+gridId+'" name="gridId"/>',
        buttons: [{
            label: '导出',
            action: function(dialog) {
                var exportOptions = dialog.$modalContent.serializeObject();
                var $grid = $('#'+exportOptions.gridId);
                var url = $grid.jqGrid('getGridParam','url').replace("/data/","/excel/")+"&filetype="+exportOptions.filetype;
                if(url.trim() == "" || !url.startsWith('/excel/')){
                    console.error('无法导出'+exportOptions.gridId);
                    BootstrapDialog.warning('无法导出'+exportOptions.gridId);
                    return;
                }
                var colModel = $grid.jqGrid('getGridParam','colModel');
                var colNames = [];
                var colNamesEn = [];
                for(var i = 0;i<colModel.length;i++){
                    if(colModel[i].hidden)
                        continue;
                    colNames.push(colModel[i].label);
                    colNamesEn.push(colModel[i].name);
                }
                url += "&colnames="+encodeURIComponent(encodeURIComponent(colNames.join(",")))+"&colnamesen="+colNamesEn.join(',');
                if(exportOptions.data != 'all'){
                    var postData = $grid.jqGrid("getGridParam", "postData");
                    for(var i in postData){
                        url += "&"+i+"="+encodeURIComponent(encodeURIComponent(postData[i]));
                    }
                }else{
                     url += "&exportAll="+(exportOptions.data == 'all')
                }
                console.log(url);
                window.open(url);
                dialog.close()
            }
        }, {
            label: '取消',
            action: function(dialog) {
                dialog.close()
            }
        }]
    });
});

var $content = $("#content"),
    $splitLine = $("#splitLine"),
    $sideMenu = $("#sideMenu");

$(window).resize(function(e){
    var siderbarHeight = $(".sidebar-nav").height()+80;
    var contentHeight = $("#content").height();
    var windowHeight = $(window).height();
    
    var contentTargetMinHeight = Math.max(siderbarHeight,contentHeight);
    //51 px header , 30px footer , 30 px tabs , dont know where the other 51+30+30-95=6 px go where.
    if(windowHeight > contentTargetMinHeight + 111){
        contentTargetMinHeight = windowHeight - 111;
    }
    var contentWidth = $("#content").width();
    $("#page-wrapper").css("min-height", contentTargetMinHeight + "px");
    $(".sidebar").css("min-height", contentTargetMinHeight + "px");
    var topOffset = 50;
    var width = (this.window.innerWidth > 0) ? this.window.innerWidth : this.screen.width;
    if (width < 768) {
        $('div.navbar-collapse').addClass('collapse');
        $(".sidebar").css("min-height","0px");
        topOffset = 100; // 2-row-menu
    } else {
        $('div.navbar-collapse').removeClass('collapse');
    }
    //调整页面表单大小
    $page != undefined && $page.find(".ui-jqgrid-btable").each(function(i,e){
        var $table = $(e);
        var targetWidth = $table.parents('.ui-jqgrid').parent().width();
        window.table = $table;
        //var currentWidth = $table.getGridWidth();
        $($table.setGridWidth(targetWidth).parents('.ui-jqgrid-bdiv')[0]);//.css('overflow-x','hidden');
        if(!IsPC()){
            var $pageFooterMiddle = $($(".ui-pager-table").children().children().children()[1]);
            $pageFooterMiddle.width($pageFooterMiddle.width()-20);
        }
    });
    //调整弹出框表单大小
    $(".modal-dialog .ui-jqgrid-btable").each(function(i,e){
        var $table = $(e);
        var targetWidth = $table.parents('.ui-jqgrid').parent().width();
        $($table.setGridWidth(targetWidth).parents('.ui-jqgrid-bdiv')[0]).css('overflow-x','hidden');
    });
});

//validate支持使用validate属性控制
$.metadata.setType("attr", "validate");
$(document).on("click",".pop-win > .input-group",function(e){
    var $container = $(this);
    var $input = $container.find('.pop-win-contoller');
    if($input.prop('disabled')){  //  || $input.prop('readonly') read only to avoid default mobile keyboard
        return ;
    }
    var isRemove = $(e.target).children('.glyphicon').hasClass('glyphicon-remove') || $(e.target).hasClass('glyphicon-remove');
    if(isRemove){
        $container.deSerializeObject({});
        return;
    }
    $container.find("input").each(function(i,e){
        var $e = $(e);
        $e.data('backup',$e.val());
    });
        
    require(["/admin/popwin/js/"+$input.data('pop-win')+".js"],function(popwin) {
        var initialData = $container.serializeObject();
         var popwin = popwin.createPopWin(function(){
             // init popwin date plugins and dics;
             setListeners(popwin.$page);
             ko.applyBindings(wboss._dictionary,popwin.$page[0]);
             // to diabled mobile auto pop keyboard
             popwin.$page.find('.input-group input.datepicker').prop("readonly",true);
             popwin.$page.find('.input-group input.pop-win-controller').prop("readonly",true);
             popwin.$page.find('.datepicker').each(function(i,e){
                 var $timeInput = $(e);
                 dateTimePickerOpt.defaultDate = parseDate($timeInput.data("default-value"));
                 dateTimePickerOpt.minDate = parseDate($timeInput.data("min"));
                 dateTimePickerOpt.maxDate = parseDate($timeInput.data("max"));
                 dateTimePickerOpt.format = $timeInput.data('format')|| 'YYYY-MM-DD HH:mm:ss';
                 $timeInput.datetimepicker(dateTimePickerOpt);
              });
         },initialData).on("ok",function(d){
             $container.find("input").each(function(i,e){
                var $e = $(e);
                $e.val(d[$e.attr("name")]);
            });
         }).on("cancel",function(d){
            $container.find("input").each(function(i,e){
                var $e = $(e);
                $e.val($e.data('backup'));
            });
        });
    });
});


$.jstree.openTreeNode = function(tree,nodeArray,callback){
    if(nodeArray == null || nodeArray == undefined)return;
    if(tree == null || tree == undefined)return;
    if(nodeArray.length < 1){
        callback();
        return ;
    }
    var nodeToOpen = nodeArray[0];
    nodeArray = nodeArray.slice(1);
    if(!tree.jstree('get_node',nodeToOpen)){
        $.jstree.openTreeNode(tree,nodeArray,callback);
    }else{
        tree.jstree('open_node', nodeToOpen, function(e, data) {
            $.jstree.openTreeNode(tree,nodeArray,callback);
        }, true);
    }    
}

//$.extend($.jgrid.edit, {
//    ajaxEditOptions: { contentType: "application/json" }
//});

//$.jgrid.ajaxOptions.contentType = "text/xml;charset=utf-8";