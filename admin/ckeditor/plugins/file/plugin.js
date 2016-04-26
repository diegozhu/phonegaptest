 $(function(){      
	// Section 1 : 按下自定义按钮时执行的代码
	
	var a= {          
			exec:function(editor){ 
				require(["/admin/popwin/js/upload.js"],function(popwin) {
					window.popwin = popwin;
					var initialData = {filetype: 'file'};
			 		popwin.createPopWin(null,initialData).on("ok",function(d){
			 			var filename=d.filename.split(",");
			 			var file='';
			 			for(var i=0;i<filename.length;i++){
			 				file+='<a href="'+filename[i]+'">下载</a>';
			 			}
			 			//把图片放在textarea中显示
			 			editor.insertHtml(file);
			 		}).on("cancel",function(d){
			 		});
				});     
			}     
	},      // Section 2 : 创建自定义按钮、绑定方法
	b='file';      
	CKEDITOR.plugins.add(b,{ 
		init:function(editor){         
			editor.addCommand(b,a);              
			editor.ui.addButton('file',{                
				label:'file',           
				icon: this.path + 'file.png',      
				command:b             
				});
		}    
	});
	
	 //CKEDITOR.instances.file.setReadOnly();
	});