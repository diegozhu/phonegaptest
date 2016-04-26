/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or http://ckeditor.com/license
 */

CKEDITOR.editorConfig = function( config ) {
	// Define changes to default configuration here. For example:
	// config.language = 'fr';
	// config.uiColor = '#AADC6E';
	config.filebrowserBrowseUrl =  '/CKEditorAndCKFinder/ckfinder/ckfinder.html' ;    
    config.filebrowserImageBrowseUrl =  '/CKEditorAndCKFinder/ckfinder/ckfinder.html?type=Images' ;    
    config.filebrowserFlashBrowseUrl =  '/CKEditorAndCKFinder/ckfinder/ckfinder.html?type=Flash' ;    
    config.filebrowserUploadUrl =  '/CKEditorAndCKFinder/ckfinder/core/connector/java/connector.java?command=QuickUpload&type=Files' ;    
    config.filebrowserImageUploadUrl =  '/CKEditorAndCKFinder/ckfinder/core/connector/java/connector.java?command=QuickUpload&type=Images' ;    
    config.filebrowserFlashUploadUrl =  '/CKEditorAndCKFinder/ckfinder/core/connector/java/connector.java?command=QuickUpload&type=Flash' ;    
    config.filebrowserWindowWidth = '1000';    
    config.filebrowserWindowHeight = '700';    
    config.language =  "zh-cn" ;
    
    config.toolbar = 'MyToolbar';//把默认工具栏改为‘MyToolbar’     
    
    config.toolbar_MyToolbar =     
        [     
            ['NewPage','Preview'],     
            ['Cut','Copy','Paste','PasteText','PasteFromWord','-','Scayt'],     
            ['Undo','Redo','-','SelectAll','RemoveFormat'],     
            ['file','fileImage','fileVideo','HorizontalRule','Smiley','SpecialChar','PageBreak'],     
            '/',     
            ['Styles','Format'],     
            ['Bold','Italic','Strike'],     
        ];  
    //注册自定义按钮   多个按钮注册的时候直接用逗号隔开 
    config.extraPlugins='file,fileImage,fileVideo';
    //注册自定义按钮    
  //  config.extraPlugins="file";
    config.skin = "kama";
    //工具栏是否可以收缩
    config.toolbarCanCollapse = true;  
    //取消“拖拽以改变尺寸”的功能  
    //config.resize_enabled = false;  
    //改变大 小的最大高度  
    config.resize_maxHeight = 500;  
    //改变大小的最大宽度  
    config.resize_minWidth = 500;  
    //改变大小的最小高度  
    config.resize_minHeight = 200;  
    //改变大小的最小宽度  
    config.resize_minWidth = 200;  
    config.height=100;
    //当提交包含有此编辑器的表单时，是否自动更新元素内的数据  
    config.autoUpdateElement = true;  
    config.fullPage= true;
    config.allowedContent= true;
    config.enterMode = CKEDITOR.ENTER_BR;//  屏蔽换行符<br>
    config.shiftEnterMode = CKEDITOR.ENTER_P;//:屏蔽段落<p>
    
	   
};	   

