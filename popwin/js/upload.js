define(function () {
	module = {
		win: [],
		createPopWin : function(cb,initialData){
			var popWin = new FilePopWin(initialData);
			popWin.$dialog = BootstrapDialog.show({
				title:'文件上传',
		        message: $('<div></div>').load('/admin/popwin/upload.html'),
		        onshown : function(){ popWin.init(cb);  },
		        onhide:function(){ popWin = null; },
		        buttons : [{
		                label: '确定',
		                action: function(dialog) {
		                	var e = popWin.events['ok'], $page = popWin.$dialog.getModalBody();
		                	var files = [], picUrls = [];
		                	$page.find("input[type = 'checkbox']:checked").each(function(i,element){
		                		files.push($(element).attr('data-url'));
		                		if($(element).attr('data-picurl')){
		                			picUrls.push($(element).attr('data-picurl'));
		                		}
		            		});
		                	var data = {filename:  files.join(','), filetype: popWin.options.filetype, picurl: picUrls.join(','),
		                			shortpath: popWin.options.shortpath};
		                	if(!data.filename){
		                		BootstrapDialog.warning("您还没有选中文件");
		                		return ;
		                	}
		                	
		                	for(var i in e){
		                		typeof e[i] == "function" && e[i](data,'ok');
		                	}
		                    popWin.$dialog.close();
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

	function FilePopWin(initialData){
		this.$dialog = null;
		this.events = {};
		this.id = Math.random();
		var opts = {vnoId: model.user().vnoId(), domain: location.host.replace(":","")};
		this.options = $.extend({}, opts, initialData, {
			urls: {upload: '/newupload?action=upload&filetype='+initialData.filetype+'&vnoId='+ opts.vnoId+'&domain='+opts.domain,
				qryList: "/newupload?action=getFilelist&filetype="+initialData.filetype+"&vnoId="+opts.vnoId+"&domain="+opts.domain,
				qryProgress: '/newupload?action=qryProgress&domain='+opts.domain,
				delFiles: "/newupload?action=delfiles&filetype="+initialData.filetype+"&domain="+opts.domain,
				qryVideoList: '/newupload?action=qryVideoInfo&domain='+ opts.domain
			}
		});
		this.accept = {img : "image/*",
		           video : "video/*",
		           audio : "audio/*",
		           flash : "application/x-shockwave-flash",
		           flv : "video/x-flv",
		           file : "*/*"};
		module.win.push(this);
		return this;
	}

	FilePopWin.prototype.on = function(event,func){
		this.events[event] = this.events[event] == undefined ? [] : this.events[event];
		this.events[event].push(func);
		return this;
	}

	FilePopWin.prototype.init = function(cb){
		var self = this, opt= self.options, $dialog = this.$dialog,$page = this.$page = $dialog.getModalBody();
		var hanlderObj = {};
		$page.find('form[name="uploadForm"]').attr('accept', self.accept[opt.filetype]);
		if(opt.filetype != 'video'){
			$page.find('.video').addClass('hide');
		}
		
		$page.find('.btn_upload').on('click', function(){
			if(!$page.find('.upload_img').val()){
				BootstrapDialog.warning('请选择文件');
				return;
			}
			
			if(opt.filetype == 'video' && !$page.find('.upload_video_img').val()){
				BootstrapDialog.warning('请选择视频封面图片');
				return;
			}
			
			upload();
		});
		
		//删除按钮
		$page.find('.view_file_form').on('click', '.close_icon',  function(e){
			BootstrapDialog.confirm('确定删除该文件?', function(result){
	            if(!result){
	            	return ;
	            } 
	            
	            delFiles($(e.target).attr('data-val'));
			 });
		});
		
		//播放按钮
		$page.find('.view_file_form').on('click', '.play-video-icon',  function(e){
			var $this = $(e.target), $video= $this.parent().find('video'), $img= $this.parent().find('img');
			$this.hide();
			$img.hide();
			$video.show();
		});
		
		var upload=function(){ 
			var uploadId = "up"+(new Date()).getTime();
			var url = opt.urls.upload + "&uploadId=" + uploadId;
			$page.find('#uploadForm').attr("action",url).submit();
			
			hanlderObj[uploadId] = (function(param){
				return window.setInterval(function(){
					queryProcess(param);
				},3000);
			})(uploadId);
			
			(function(param){
				window.setTimeout(function(){
					stopUpload(param);//3分钟以后终止查询
				},180000);
			})(uploadId);
		},
		queryProcess= function(uploadId){
			var processCount=0;
			$.ajax({  
		        type:"get",  
		        dataType:"jsonp",
		        url: opt.urls.qryProgress +"&uploadId="+ uploadId,
		        success:function(msg){
		        	var $tips = $page.find('.upload_img_tips');
		        	try{
		            	var res =msg[0];
		            	$tips.html(""); 
		            	if(res == null){
		            		processCount ++;
		            		if(processCount > 30) stopUpload(uploadId);
		            		return;
		            	}else{
		            		processCount = 0;
		            	}
		        		var per,s = res.split(" ");
		        		per = Math.ceil(s[0]/s[1] * 100);
		        		if(isNaN(per))throw "";
		        		per += "%";
		        		$tips.html(per);
		        		if("100%"== per){
		        			stopUpload(uploadId);
		        		};
		        	}catch(e){
		        		window.msg = msg || window.msg || "";
		        		if(window.msg){
		        			$tips.html("<font color='red'>"+window.msg+"</font>");
		        		}
		        		stopUpload();
		        	}
		        	loadFileList();
		        }
		    }) 
		},
		stopUpload= function(uploadId){
			clearInterval(hanlderObj[uploadId]);
			delete hanlderObj[uploadId];
		},
		loadFileList = function(){
			$.ajax({  
				cache : false,
		        type:"get",  
		        dataType:"jsonp",
		        url: opt.urls.qryList,
		        success:function(res){
		        	var fileArr = [];
		    		for(var i in res){
		    			res[i].width = 120;
		    			res[i].height = 90;
		    			res[i].fileSize = Math.ceil(res[i].fileSize/1000);
		    			
		    			fileArr.push(getFileDom(res[i]));
		    		}
		    		
		    		$page.find('.view_file_form').empty().append(fileArr.join(''));
		        }
		 });
		},
		delFiles= function(deleteFiles){
			 $.ajax({  
			        type: 'post',
			        dataType:"jsonp",
			        url: opt.urls.delFiles,
			        data:{ filenames : deleteFiles,vnoId: opt.vnoId},
			        success:function(msg){
			        	loadFileList();
			        }
			 });
		},
		getFileDom= function(data){
			return ['<div class="col-lg-',opt.filetype=='video' ? '6': '4',' col-md-4 col-sm-4 file_content">',
			        	'<span class="close_icon glyphicon glyphicon-remove" data-val="', data.newFileName,'"></span>',
				        '<div class="col-lg-12">',
				        	getDomByType(opt.filetype, data),
			            '</div>',
				        '<div class="col-lg-12">',
			              	'<span style="overflow: hidden;font-size: 10px;">文件大小:', data.fileSize, 'KB</span>',
			             '</div>',
			             '<div class="col-lg-12">',
			             		getCheckDom(data),
			              '</div>',
			        '</div>'].join('');
		},
		getDomByType= function(type, data){
			switch(type){
				case 'img':
					return ['<img title="', data.newFileName ,'" src="', data.url, '" width="', data.width, '" height="', data.height, '"/>'].join('');
				case 'file':
					return ['<img title="', data.newFileName ,'" src="/admin/img/file.jpg" width="100" height="90"/>'].join('');
				case 'video':
					return ['<div class="video_item" >',
				        		'<video  class="video_list" controls="controls" preload="none" width="100%" ',
				        			'poster="', data.picUrl, '">',
				        			'<source src="', data.url,'" type="video/mp4">',
				        		' </video >',
					        '</div>'].join('');
				default: 
					return '';
			}
		},
		getCheckDom= function(data){
			return ['<input class="col-lg-2 col-md-2 col-sm-2" type="checkbox" name="checkFile" data-url="',
			        	opt.shortpath ? data.filePath : data.url, '" ',
			        	opt.filetype=='video' ? [' data-picurl="', data.picUrl, '" '].join('') : '',
			        	(opt.filename && opt.filename.indexOf(data.url) != -1) ? ' checked="checked" ': '', '"/>', '选中'].join('');
		};
		
		loadFileList();
	}
	
	return module;
});