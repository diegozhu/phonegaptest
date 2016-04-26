$("#chargeBeginTime").click(function() {
		var myDate = new Date();
		var min = (myDate.getFullYear() - 1) + "-" + (myDate.getMonth() + 7) + "-" + 1;
		WdatePicker({
			dateFmt : 'yyyy-MM-dd',
			// minDate:min,
			onpicked : function() {
				myDate.setFullYear($dp.cal.getP('y', 'yyyy'), $dp.cal.getP('M', 'MM'), 1);
				var max = myDate.getFullYear() + "-" + (myDate.getMonth() + 1) + "-" + (myDate.getDate() - 1);
				$("#chargeEndTime").val('').unbind('click').click(function() {
					WdatePicker({
						dateFmt : 'yyyy-MM-dd',
						minDate : '#F{$dp.$D(\'chargeBeginTime\')}',
						maxDate : max
					});
				});
			}
		});
	});