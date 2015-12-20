var colors	= require('colors/safe');

module.exports = {
	array_key_exists: function(key, search) {
		if (!search || (search.constructor !== Array && search.constructor !== Object)) {
			return false;
		}
		return key in search;
	},
	inArray: function(needle, haystack) {
		var length = haystack.length;
		for(var i = 0; i < length; i++) {
			if(haystack[i] == needle) return true;
		}
		return false;
	},
	log: function(msg, type){
		var now = new Date;
		var datum =  now.getDate() + ":" + (now.getMonth() + 1) + ":" + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
		switch(type){
			case "info":
				console.log(datum +': '+ colors.green(msg));
				break;
			case "data":
				console.log(datum +': '+ colors.grey(msg));
				break;
			case "help":
				console.log(datum +': '+ colors.blue(msg));
				break;
			case "debug":
				console.log(datum +': '+ colors.blue(msg));
				break;
			case "warn":
				console.log(datum +': '+ colors.yellow(msg));
				break;
			case "error":
				console.log(datum +': '+ colors.red(msg));
				break;
		}
	}
}