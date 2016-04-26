define(function() {
function onCreate($page, $relativeUrl){
    $("#stat_userrequest_dataTable").jqGrid({
        url : '/data/com.wboss.wcb.auth.authmgr.UserReqResultSvc?m=queryUserReqList4Jq2.object.object',
        postData : {param:JSON.stringify($page.find('.search-form').serializeObject())},
        colModel : [
                {label : 'SSID' ,name:'ssid',width : 260},
                {label : '结果',name : '_operResult',width : 100},
                {label : '次数',name : 'count',width : 100}, 
                {label : '用户IP',name : 'staIp',width : 100}, 
                {label : 'AC返回值',name : 'acRet',width : 100}, 
                {label : '描述',name : 'expDesc',width : 260},
                {label : '',name : 'vnoId',hidden : true},
                {label : '企业名称',name : 'vnoName',sortable : false,width : 160}
            ],
        pager:stat_userrequest_jqGridPager
    });
}
$("#stat_userrequest_dataTable").jqGrid('gridResize', { minWidth: 450, minHeight: 100 });

return { onCreate : onCreate };
});