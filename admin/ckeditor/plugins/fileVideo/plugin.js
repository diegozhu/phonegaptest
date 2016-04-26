$(function(){      
	// Section 1 : 按下自定义按钮时执行的代码
	
	var a= {          
			exec:function(editor){ 
				require(["/admin/popwin/js/upload.js"],function(popwin) {
					window.popwin = popwin;
					var initialData = {filetype: 'video'};
			 		popwin.createPopWin(null,initialData).on("ok",function(d){
			 			var filename=d.filename.split(",");
			 			var picurl = d.picurl.split(",");
			 			var video='';
			 			for(var i=0;i<filename.length;i++){
			 				video+='<video class="video_list" controls="controls" preload="none" width="20%" poster="'+picurl[i]+'"><source src="'+filename[i]+'" type="video/mp4"></video>';
			 			}
			 			//把图片放在textarea中显示
			 			editor.insertHtml(video);
			 		}).on("cancel",function(d){
			 		});
				});     
			}     
	},      // Section 2 : 创建自定义按钮、绑定方法
	b='fileVideo';      
	CKEDITOR.plugins.add(b,{ 
		init:function(editor){         
			editor.addCommand(b,a);              
			editor.ui.addButton('fileVideo',{                
				label:'video',           
				icon: this.path + 'video.png',      
				command:b             
				});
		}    
	});
	
	});