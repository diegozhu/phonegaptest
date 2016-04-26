/**
 * jQuery Validation Plugin 1.9.0
 * 
 * http://bassistance.de/jquery-plugins/jquery-plugin-validation/
 * http://docs.jquery.com/Plugins/Validation
 * 
 * Copyright (c) 2006 - 2011 Jörn Zaefferer
 * 
 * Dual licensed under the MIT and GPL licenses:
 * http://www.opensource.org/licenses/mit-license.php
 * http://www.gnu.org/licenses/gpl.html
 */

(function() {

	function stripHtml(value) {
		// remove html tags and space chars
		return value.replace(/<.[^<>]*?>/g, ' ').replace(/&nbsp;|&#160;/gi, ' ')
		// remove numbers and punctuation
		.replace(/[0-9.(),;:!?%#$'"_+=\/-]*/g, '');
	}
	jQuery.validator.addMethod("required", function(value, element) {
		switch( element.nodeName.toLowerCase() ) {
		case 'select':
			var val = $(element).val();
			return val && val.length > 0;
		case 'input':
			if ( this.checkable(element) )
				return this.getLength(value, element) > 0;
		default:
			return $.trim(value).length > 0;
		}
	}, "请输入必填项");
	jQuery.validator.addMethod("ip", function(value, element) {
						    var ip = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
						return this.optional(element)
								|| (ip.test(value) && (RegExp.$1 < 256
										&& RegExp.$2 < 256 && RegExp.$3 < 256 && RegExp.$4 < 256));
					}, "Ip地址格式错误");
	jQuery.validator.addMethod("maxWords", function(value, element, params) {
		return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length < params;
	}, jQuery.validator.format("Please enter {0} words or less."));

	jQuery.validator.addMethod("minWords", function(value, element, params) {
		return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length >= params;
	}, jQuery.validator.format("Please enter at least {0} words."));

	jQuery.validator.addMethod("rangeWords", function(value, element, params) {
		return this.optional(element) || stripHtml(value).match(/\b\w+\b/g).length >= params[0]
				&& value.match(/bw+b/g).length < params[1];
	}, jQuery.validator.format("Please enter between {0} and {1} words."));

})();

jQuery.validator.addMethod("letterswithbasicpunc", function(value, element) {
	return this.optional(element) || /^[a-z-.,()'\"\s]+$/i.test(value);
}, "Letters or punctuation only please");

jQuery.validator.addMethod("alphanumeric", function(value, element) {
	return this.optional(element) || /^\w+$/i.test(value);
}, "Letters, numbers, spaces or underscores only please");

jQuery.validator.addMethod("lettersonly", function(value, element) {
	return this.optional(element) || /^[a-z]+$/i.test(value);
}, "Letters only please");

jQuery.validator.addMethod("nowhitespace", function(value, element) {
	return this.optional(element) || /^\S+$/i.test(value);
}, "No white space please");

jQuery.validator.addMethod("ziprange", function(value, element) {
	return this.optional(element) || /^90[2-5]\d\{2}-\d{4}$/.test(value);
}, "Your ZIP-code must be in the range 902xx-xxxx to 905-xx-xxxx");

jQuery.validator.addMethod("integer", function(value, element) {
	return this.optional(element) || /^-?\d+$/.test(value);
}, "A positive or negative non-decimal number please");

/**
 * Return true, if the value is a valid vehicle identification number (VIN).
 * 
 * Works with all kind of text inputs.
 * 
 * @example <input type="text" size="20" name="VehicleID"
 *          class="{required:true,vinUS:true}" />
 * @desc Declares a required input element whose value must be a valid vehicle
 *       identification number.
 * 
 * @name jQuery.validator.methods.vinUS
 * @type Boolean
 * @cat Plugins/Validate/Methods
 */
jQuery.validator.addMethod("vinUS", function(v) {
	if (v.length != 17)
		return false;
	var i, n, d, f, cd, cdv;
	var LL = [ "A", "B", "C", "D", "E", "F", "G", "H", "J", "K", "L", "M", "N", "P", "R", "S", "T", "U", "V", "W", "X",
			"Y", "Z" ];
	var VL = [ 1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 7, 9, 2, 3, 4, 5, 6, 7, 8, 9 ];
	var FL = [ 8, 7, 6, 5, 4, 3, 2, 10, 0, 9, 8, 7, 6, 5, 4, 3, 2 ];
	var rs = 0;
	for (i = 0; i < 17; i++) {
		f = FL[i];
		d = v.slice(i, i + 1);
		if (i == 8) {
			cdv = d;
		}
		if (!isNaN(d)) {
			d *= f;
		} else {
			for (n = 0; n < LL.length; n++) {
				if (d.toUpperCase() === LL[n]) {
					d = VL[n];
					d *= f;
					if (isNaN(cdv) && n == 8) {
						cdv = LL[n];
					}
					break;
				}
			}
		}
		rs += d;
	}
	cd = rs % 11;
	if (cd == 10) {
		cd = "X";
	}
	if (cd == cdv) {
		return true;
	}
	return false;
}, "The specified vehicle identification number (VIN) is invalid.");

/**
 * Return true, if the value is a valid date, also making this formal check
 * dd/mm/yyyy.
 * 
 * @example jQuery.validator.methods.date("01/01/1900")
 * @result true
 * 
 * @example jQuery.validator.methods.date("01/13/1990")
 * @result false
 * 
 * @example jQuery.validator.methods.date("01.01.1900")
 * @result false
 * 
 * @example <input name="pippo" class="{dateITA:true}" />
 * @desc Declares an optional input element whose value must be a valid date.
 * 
 * @name jQuery.validator.methods.dateITA
 * @type Boolean
 * @cat Plugins/Validate/Methods
 */
jQuery.validator.addMethod("dateITA", function(value, element) {
	var check = false;
	var re = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
	if (re.test(value)) {
		var adata = value.split('/');
		var gg = parseInt(adata[0], 10);
		var mm = parseInt(adata[1], 10);
		var aaaa = parseInt(adata[2], 10);
		var xdata = new Date(aaaa, mm - 1, gg);
		if ((xdata.getFullYear() == aaaa) && (xdata.getMonth() == mm - 1) && (xdata.getDate() == gg))
			check = true;
		else
			check = false;
	} else
		check = false;
	return this.optional(element) || check;
}, "Please enter a correct date");

jQuery.validator.addMethod("dateNL", function(value, element) {
	return this.optional(element) || /^\d\d?[\.\/-]\d\d?[\.\/-]\d\d\d?\d?$/.test(value);
}, "Vul hier een geldige datum in.");

jQuery.validator.addMethod("time", function(value, element) {
	return this.optional(element) || /^([01]\d|2[0-3])(:[0-5]\d){0,2}$/.test(value);
}, "Please enter a valid time, between 00:00 and 23:59");
jQuery.validator.addMethod("time12h", function(value, element) {
	return this.optional(element) || /^((0?[1-9]|1[012])(:[0-5]\d){0,2}(\ [AP]M))$/i.test(value);
}, "Please enter a valid time, between 00:00 am and 12:00 pm");

/**
 * matches US phone number format
 * 
 * where the area code may not start with 1 and the prefix may not start with 1
 * allows '-' or ' ' as a separator and allows parens around area code some
 * people may want to put a '1' in front of their number
 * 
 * 1(212)-999-2345 or 212 999 2344 or 212-999-0983
 * 
 * but not 111-123-5434 and not 212 123 4567
 */
jQuery.validator.addMethod("phoneUS", function(phone_number, element) {
	phone_number = phone_number.replace(/\s+/g, "");
	return this.optional(element) || phone_number.length > 9
			&& phone_number.match(/^(1-?)?(\([2-9]\d{2}\)|[2-9]\d{2})-?[2-9]\d{2}-?\d{4}$/);
}, "请输入有效的手机号码");

jQuery.validator.addMethod('phoneUK', function(phone_number, element) {
	return this.optional(element) || phone_number.length > 9
			&& phone_number.match(/^(\(?(0|\+44)[1-9]{1}\d{1,4}?\)?\s?\d{3,4}\s?\d{3,4})$/);
}, 'Please specify a valid phone number');

jQuery.validator.addMethod('mobileUK', function(phone_number, element) {
	return this.optional(element) || phone_number.length > 9
			&& phone_number.match(/^((0|\+44)7(5|6|7|8|9){1}\d{2}\s?\d{6})$/);
}, 'Please specify a valid mobile number');

// TODO check if value starts with <, otherwise don't try stripping anything
jQuery.validator.addMethod("strippedminlength", function(value, element, param) {
	return jQuery(value).text().length >= param;
}, jQuery.validator.format("Please enter at least {0} characters"));

// same as email, but TLD is optional
jQuery.validator
		.addMethod(
				"email2",
				function(value, element, param) {
					return this.optional(element)
							|| /^((([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+(\.([a-z]|\d|[!#\$%&'\*\+\-\/=\?\^_`{\|}~]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])+)*)|((\x22)((((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(([\x01-\x08\x0b\x0c\x0e-\x1f\x7f]|\x21|[\x23-\x5b]|[\x5d-\x7e]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(\\([\x01-\x09\x0b\x0c\x0d-\x7f]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF]))))*(((\x20|\x09)*(\x0d\x0a))?(\x20|\x09)+)?(\x22)))@((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?$/i
									.test(value);
				}, "请输入有效的邮箱地址");

// same as url, but TLD is optional
jQuery.validator
		.addMethod(
				"url2",
				function(value, element, param) {
					return this.optional(element)
							|| /^(https?|ftp):\/\/(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)*(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i
									.test(value);
				}, jQuery.validator.messages.url);

// NOTICE: Modified version of Castle.Components.Validator.CreditCardValidator
// Redistributed under the the Apache License 2.0 at
// http://www.apache.org/licenses/LICENSE-2.0
// Valid Types: mastercard, visa, amex, dinersclub, enroute, discover, jcb,
// unknown, all (overrides all other settings)
jQuery.validator.addMethod("creditcardtypes", function(value, element, param) {

	if (/[^0-9-]+/.test(value))
		return false;

	value = value.replace(/\D/g, "");

	var validTypes = 0x0000;

	if (param.mastercard)
		validTypes |= 0x0001;
	if (param.visa)
		validTypes |= 0x0002;
	if (param.amex)
		validTypes |= 0x0004;
	if (param.dinersclub)
		validTypes |= 0x0008;
	if (param.enroute)
		validTypes |= 0x0010;
	if (param.discover)
		validTypes |= 0x0020;
	if (param.jcb)
		validTypes |= 0x0040;
	if (param.unknown)
		validTypes |= 0x0080;
	if (param.all)
		validTypes = 0x0001 | 0x0002 | 0x0004 | 0x0008 | 0x0010 | 0x0020 | 0x0040 | 0x0080;

	if (validTypes & 0x0001 && /^(51|52|53|54|55)/.test(value)) { // mastercard
		return value.length == 16;
	}
	if (validTypes & 0x0002 && /^(4)/.test(value)) { // visa
		return value.length == 16;
	}
	if (validTypes & 0x0004 && /^(34|37)/.test(value)) { // amex
		return value.length == 15;
	}
	if (validTypes & 0x0008 && /^(300|301|302|303|304|305|36|38)/.test(value)) { // dinersclub
		return value.length == 14;
	}
	if (validTypes & 0x0010 && /^(2014|2149)/.test(value)) { // enroute
		return value.length == 15;
	}
	if (validTypes & 0x0020 && /^(6011)/.test(value)) { // discover
		return value.length == 16;
	}
	if (validTypes & 0x0040 && /^(3)/.test(value)) { // jcb
		return value.length == 16;
	}
	if (validTypes & 0x0040 && /^(2131|1800)/.test(value)) { // jcb
		return value.length == 15;
	}
	if (validTypes & 0x0080) { // unknown
		return true;
	}
	return false;
}, "Please enter a valid credit card number.");

jQuery.validator
		.addMethod(
				"ipv4",
				function(value, element, param) {
					return this.optional(element)
							|| /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/i
									.test(value);
				}, "请输入有效IP地址.");

jQuery.validator
		.addMethod(
				"ipv6",
				function(value, element, param) {
					return this.optional(element)
							|| /^((([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}:[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){5}:([0-9A-Fa-f]{1,4}:)?[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){4}:([0-9A-Fa-f]{1,4}:){0,2}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){3}:([0-9A-Fa-f]{1,4}:){0,3}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){2}:([0-9A-Fa-f]{1,4}:){0,4}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){6}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(([0-9A-Fa-f]{1,4}:){0,5}:((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|(::([0-9A-Fa-f]{1,4}:){0,5}((\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b)\.){3}(\b((25[0-5])|(1\d{2})|(2[0-4]\d)|(\d{1,2}))\b))|([0-9A-Fa-f]{1,4}::([0-9A-Fa-f]{1,4}:){0,5}[0-9A-Fa-f]{1,4})|(::([0-9A-Fa-f]{1,4}:){0,6}[0-9A-Fa-f]{1,4})|(([0-9A-Fa-f]{1,4}:){1,7}:))$/i
									.test(value);
				}, "请输入有效IP地址.");

jQuery.validator
.addMethod(
		"macv6",
		function(value, element, param) {
			return this.optional(element)
					|| /[A-F\d]{2}\:[A-F\d]{2}\:[A-F\d]{2}\:[A-F\d]{2}\:[A-F\d]{2}\:[A-F\d]{2}/
							.test(value);
		}, "请输入有效MAC地址.");

jQuery.validator
.addMethod(
		"nochinese",
		function(value, element, param) {
			return this.optional(element)
//					|| /[^a-zA-Z\d\u4e00-\u9fa5]/
			||/^[\w\.]{0,32}$/
							.test(value);
		}, "含有中文或特殊字符,或长度大于32,修改后请重试");



/**
 * Return true if the field value matches the given format RegExp
 * 
 * @example jQuery.validator.methods.pattern("AR1004",element,/^AR\d{4}$/)
 * @result true
 * 
 * @example jQuery.validator.methods.pattern("BR1004",element,/^AR\d{4}$/)
 * @result false
 * 
 * @name jQuery.validator.methods.pattern
 * @type Boolean
 * @cat Plugins/Validate/Methods
 */
jQuery.validator.addMethod("pattern", function(value, element, param) {
	return this.optional(element) || param.test(value);
}, "Invalid format.");

// ===================放在validate.addmethod.js中=========================

function checkidcard(num) {
	var check = /^\d{15}|(\d{17}(\d|x|X))$/.test(num);
	if(!check) return false;
	
	var len = num.length, re;
	if (len == 15)
		re = new RegExp(/^(\d{6})()?(\d{2})(\d{2})(\d{2})(\d{3})$/);
	else if (len == 18)
		re = new RegExp(/^(\d{6})()?(\d{4})(\d{2})(\d{2})(\d{3})(\d)$/);
	else {
		// alert("请输入15或18位身份证号,您输入的是 "+len+ "位");
		return false;
	}
	var a = num.match(re);
	if (a != null) {
		if (len == 15) {
			var D = new Date("19" + a[3] + "/" + a[4] + "/" + a[5]);
			var B = D.getYear() == a[3] && (D.getMonth() + 1) == a[4] && D.getDate() == a[5];
		} else {
			var D = new Date(a[3] + "/" + a[4] + "/" + a[5]);
			var B = D.getFullYear() == a[3] && (D.getMonth() + 1) == a[4] && D.getDate() == a[5];
		}
		if (!B) {
			// alert("输入的身份证号 "+ a[0] +" 里出生日期不对！");
			return false;
		}
	}

	return true;
}

// 检查号码是否符合规范，包括长度，类型
isCardNo = function(card) {
	// 身份证号码为15位或者18位，15位时全为数字，18位前17位为数字，最后一位是校验位，可能为数字或字符X
	var reg = /(^d{15}$)|(^d{17}(d|X)$)/;
	if (reg.test(card) === false) {
		return false;
	}
	return true;
};

// 取身份证前两位,校验省份
checkProvince = function(card) {
	var province = card.substr(0, 2);
	if (vcity[province] == undefined) {
		return false;
	}
	return true;
};

// 检查生日是否正确
checkBirthday = function(card) {
	var len = card.length;
	// 身份证15位时，次序为省（3位）市（3位）年（2位）月（2位）日（2位）校验位（3位），皆为数字
	if (len == '15') {
		var re_fifteen = /^(d{6})(d{2})(d{2})(d{2})(d{3})$/;
		var arr_data = card.match(re_fifteen);
		var year = arr_data[2];
		var month = arr_data[3];
		var day = arr_data[4];
		var birthday = new Date('19' + year + '/' + month + '/' + day);
		return verifyBirthday('19' + year, month, day, birthday);
	}
	// 身份证18位时，次序为省（3位）市（3位）年（4位）月（2位）日（2位）校验位（4位），校验位末尾可能为X
	if (len == '18') {
		var re_eighteen = /^(d{6})(d{4})(d{2})(d{2})(d{3})([0-9]|X)$/;
		var arr_data = card.match(re_eighteen);
		var year = arr_data[2];
		var month = arr_data[3];
		var day = arr_data[4];
		var birthday = new Date(year + '/' + month + '/' + day);
		return verifyBirthday(year, month, day, birthday);
	}
	return false;
};

// 校验日期
verifyBirthday = function(year, month, day, birthday) {
	var now = new Date();
	var now_year = now.getFullYear();
	// 年月日是否合理
	if (birthday.getFullYear() == year && (birthday.getMonth() + 1) == month && birthday.getDate() == day) {
		// 判断年份的范围（3岁到100岁之间)
		var time = now_year - year;
		if (time >= 3 && time <= 100) {
			return true;
		}
		return false;
	}
	return false;
};
// 校验位的检测
checkParity = function(card) {
	// 15位转18位
	card = changeFivteenToEighteen(card);
	var len = card.length;
	if (len == '18') {
		var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
		var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
		var cardTemp = 0, i, valnum;
		for (i = 0; i < 17; i++) {
			cardTemp += card.substr(i, 1) * arrInt[i];
		}
		valnum = arrCh[cardTemp % 11];
		if (valnum == card.substr(17, 1)) {
			return true;
		}
		return false;
	}
	return false;
};
// 15位转18位身份证号
changeFivteenToEighteen = function(card) {
	if (card.length == '15') {
		var arrInt = new Array(7, 9, 10, 5, 8, 4, 2, 1, 6, 3, 7, 9, 10, 5, 8, 4, 2);
		var arrCh = new Array('1', '0', 'X', '9', '8', '7', '6', '5', '4', '3', '2');
		var cardTemp = 0, i;
		card = card.substr(0, 6) + '19' + card.substr(6, card.length - 6);
		for (i = 0; i < 17; i++) {
			cardTemp += card.substr(i, 1) * arrInt[i];
		}
		card += arrCh[cardTemp % 11];
		return card;
	}
	return card;
};
isIdCardNo = function(card) {
	// 是否为空
	if (card === '') {
		return false;
	}
	// 校验长度，类型
	if (isCardNo(card) === false) {
		// return false;
	}
	// 检查省份
	if (checkProvince(card) === false) {
		return false;
	}
	// 校验生日
	if (checkBirthday(card) === false) {
		return false;
	}
	// 检验位的检测
	if (checkParity(card) === false) {
		return false;
	}
	return true;
};
// 身份证号码验证
jQuery.validator.addMethod("isIdCardNo", function(value, element) {
	return this.optional(element) || checkidcard(value) ;
}, "请正确输入您的身份证号码");
// 护照号格式验证
jQuery.validator.addMethod("isPassport", function(value, element) {
	var passport = /^(1[45][0-9]{7})|(G[0-9]{8})|(P[0-9]{7})|(S[0-9]{7,8})|(D[0-9]+)$/;
	return this.optional(element) || (passport.test(value));
}, "请正确填写您的护照号");

// 手机号码验证
jQuery.validator.addMethod("isMobile", function(value, element) {
	var length = value.length;
	//var mobile = /^(((13[0-9]{1})|(15[0-9]{1}))+\d{8})$/;
	var mobileRex = /^1(3[0-9]|4[57]|5[0-35-9]|8[0-9]|70)\d{8}$/;
	var cmRex = /^(1(3[4-9]|4[7]|5[0-27-9]|7[8]|8[2-478])\d{8})|(1705\d{7})$/;
	var cuRex = /^(1(3[0-2]|4[5]|5[56]|7[6]|8[56])\d{8})|(1709\d{7})$/;
    var ctRex = /^(1(33|53|77|8[019])\d{8})|(1700\d{7})$/; 
    
	return this.optional(element) || (length == 11 && (mobileRex.test(value) 
			||cmRex.test(value) ||cuRex.test(value) ||ctRex.test(value)));
}, "请正确填写您的手机号码");

//密码为6-10位的字母或数字
jQuery.validator.addMethod("isPassword", function(value, element) {
	var length = value.length;
   // var reg = /^[\w]{6,12}$/;   //密码的格式为6-10位，只能是字母、数字和下划线
    var reg = /^[a-zA-Z0-9]{6,10}$/;
	return this.optional(element) || (reg.test(value));
}, "密码为6-10位的字母或数字");

/*批量制卡任务页面专用js校验*/
//为1-10位的字母或数字
jQuery.validator.addMethod("isLetterOrNumber", function(value, element) {
	var length = value.length;
    var reg = /^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{2,14}$/;
	return this.optional(element) || (reg.test(value));
}, "必须为2-14位的字母或数字");

//为1-10位的字母
jQuery.validator.addMethod("isLetter", function(value, element) {
	var length = value.length;
    var reg = /^[a-zA-Z]{1,10}$/;
	return this.optional(element) || (reg.test(value));
}, "必须为1-10位的字母");

//打头内容(1-10位的数字)
jQuery.validator.addMethod("isNumber16", function(value, element) {
	var length = value.length;
    var reg = /^[1-9]\d{0,9}$/;
	return this.optional(element) || (reg.test(value));
}, "必须为1-10位的数字");

//使用月份(1-24)
jQuery.validator.addMethod("isNumber15", function(value, element) {
	var length = value.length;
    var reg = /^([1-9]|1\d{1}|2[0-4])$/;
	return this.optional(element) || (reg.test(value));
}, "请填写数字,只支持正整数");

//面值金额(10~100)
jQuery.validator.addMethod("isNumber14", function(value, element) {
	var length = value.length;
    var reg = /^([1-9][0-9]|100)$/;
	return this.optional(element) || (reg.test(value));
}, "请填写数字,只支持正整数");

//卡号密码生成数(1~10000)
jQuery.validator.addMethod("isNumber13", function(value, element) {
	var length = value.length;
    var reg = /^(?!0)(?:[0-9]{1,4}|10000)$/;
	return this.optional(element) || (reg.test(value));
}, "请填写数字,只支持正整数");

//数字,只支持3~8的正整数(密码长度)
jQuery.validator.addMethod("isNumber12", function(value, element) {
	var length = value.length;
    var reg = /^[3-8]$/;
	return this.optional(element) || (reg.test(value));
}, "请填写数字,只支持正整数");

//数字,只支持10-30的正整数(卡号长度)
jQuery.validator.addMethod("isNumber10", function(value, element) {
	var length = value.length;
    var reg = /^([1-2]\d|30)$/;
	return this.optional(element) || (reg.test(value));
}, "请填写数字,只支持10~30的正整数");
/*--批量制卡任务专用js--end*/

//为1-10位的数字
jQuery.validator.addMethod("isNumber11", function(value, element) {
	var length = value.length;
    var reg = /^[1-9][0-9]{0,9}$/;
	return this.optional(element) || (reg.test(value));
}, "必须为1-10位的字母");

//非负数字，并支持小数后两位
jQuery.validator.addMethod("isNumber2", function(value, element) {
	var length = value.length;
    var reg = /^\d+(\.\d{0,2})?$/;
	return this.optional(element) || (reg.test(value));
}, "请填写数字,并支持小数后两位");
//数字，并支持小数后两位，支持负数
jQuery.validator.addMethod("isNumber2Plus", function(value, element) {
	var length = value.length;
    var reg = /^[-]?\d+(\.\d{0,2})?$/;
	return this.optional(element) || (reg.test(value));
}, "请填写数字,并支持小数后两位");
jQuery.validator.addMethod("isNumber6", function(value, element) {
	var length = value.length;
    var reg = /^\d{1,8}([\.]\d{0,2})?$/;
	return this.optional(element) || (reg.test(value));
}, "支持8位数且支持小数后两位");
//数字,只支持整数，-1
jQuery.validator.addMethod("isNumber3", function(value, element) {
	var length = value.length;
    var reg = /^\d+$|^-1$/;
	return this.optional(element) || (reg.test(value));
}, "请填写数字,只支持正整数,0和-1");

//数字,只支持整数
jQuery.validator.addMethod("isNumber4", function(value, element) {
	var length = value.length;
    var reg = /^\d+$/;
	return this.optional(element) || (reg.test(value));
}, "请填写数字,只支持正整数");
//数字，并支持小数后两位
jQuery.validator.addMethod("isNumber5", function(value, element) {
	var length = value.length;
    var reg =/^\d+(\.\d{0,3})?$|^-1$/;
	return this.optional(element) || (reg.test(value));
}, "支持小数后三位或-1");

jQuery.validator.addMethod("isNumber7", function(value, element) {
	var length = value.length;
    var reg =/^\d+(\.\d{0,2})?$|^-1$/;
	return this.optional(element) || (reg.test(value));
}, "支持小数后 两位或-1");

jQuery.validator.addMethod("isNumber8", function(value, element) {
	var length = value.length;
    var reg = /^\d+$|^0$/;
	return this.optional(element) || (reg.test(value));
}, "只支持正整数和0");

jQuery.validator.addMethod("isNumber9", function(value, element) {
	var length = value.length;
    var reg = /^\d+$|^-1$/;
	return this.optional(element) || (reg.test(value));
}, "只支持正整数和-1");


jQuery.validator.addMethod("isNumberz", function(value, element) {
	var length = value.length;
    var reg = /^[0-9]*[1-9][0-9]*$/;
	return this.optional(element) || (reg.test(value));
}, "只支持正整数");



//端口校验
jQuery.validator.addMethod("isPort", function(value, element) {
	var length = value.length;
	 var reg =  /^([0-9]|[1-9]\d|[1-9]\d{2}|[1-9]\d{3}|[1-5]\d{4}|6[0-4]\d{3}|65[0-4]\d{2}|655[0-2]\d|6553[0-5])$/;
	return this.optional(element) || (reg.test(value));
}, "上报端口请输入0到65535的整数");

// 两者必填一个
jQuery.validator.addMethod("inputValidate", function(value, element, params) {
	if($(element).val()==""){
		if($("input[id="+params[0]+"]").val()=="") {
			return false;
		}else{
			return true;
		}
	}else {
		return true;
	}
	
}, jQuery.validator.format("Please enter at least {1} characters"));

//左值比须大于右值
jQuery.validator.addMethod("GreaterThan", function(value, element, params) {
	var obj="input[id="+params[0]+"]";
	var leftValue=0;
	var rightValue=0;
	switch(params[1]) {
		case "left":
			leftValue=$(element).val();
			rightValue=$(obj).val();	
			break;
		case "right":
			leftValue=$(obj).val();
			rightValue=$(element).val();
			break;
		}
		if(parseInt(leftValue)<parseInt(rightValue)){
			return true;
		}else{
			return false;
		}
}, jQuery.validator.format("左边值应小于右边值"));

jQuery.validator.addMethod("emailPhone", function(value, element, params) {
	if($(element).val()==""){
		if($("input[id="+params+"]").val()=="") {
			return false;
		}else{
			return true;
		}
	}else {
		return true;
	}
	
},"请输入手机号或邮箱");

//唯一性校验
jQuery.validator.addMethod("uniqueCheck", function(value, element, params) {
	//禁用状态无需验证
	if($(element).prop('disabled') || $(element).prop('readonly')){
		return true;
	}
	
	//编辑状态如果是原始值，无需验证
	var $form = $($(element).parents("form")[0]);
	if($form.status() == 'edit' ){
		var backData = $form.data('backup');
		if(value == backData[element.name]){
			return true;
		}
	}
	
	if ( this.optional(element) )
		return "dependency-mismatch";

	var previous = this.previousValue(element);
	if (!this.settings.messages[element.name] )
		this.settings.messages[element.name] = {};
	previous.originalMessage = this.settings.messages[element.name].remote;
	this.settings.messages[element.name].remote = previous.message;

	if ( this.pending[element.name] ) {
		return "pending";
	}
	if ( previous.old === value ) {
		//return previous.valid;
	}

	previous.old = value;
	var validator = this;
	this.startRequest(element);
	var data = {};
	data[element.name] = value;
	if(params.params){
		for(var i=0; i< params.params.length; i++){
			data[params.params[i]]= $form.find('input[name="'+params.params[i]+'"]').val();
		}
	}
	var url = params.url,method= params.method;
	var service= new Service(url);
	service.call(method, [data], function(response){
		validator.settings.messages[element.name].remote = previous.originalMessage;
		var valid = response ? false : true ;
		if ( valid ) {
			var submitted = validator.formSubmitted;
			validator.prepareElement(element);
			validator.formSubmitted = submitted;
			validator.successList.push(element);
			validator.showErrors();
		} else {
			var errors = {};
			var message = validator.defaultMessage( element, "uniqueCheck" );
			errors[element.name] = previous.message = $.isFunction(message) ? message(value) : message;
			validator.showErrors(errors);
		}
		previous.valid = valid;
		validator.stopRequest(element, valid);
	
	});
	
	return "pending";
},"请重新填写此值");