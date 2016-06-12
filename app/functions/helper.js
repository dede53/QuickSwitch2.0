var colors			= require('colors/safe');
var fritz 			= require('smartfritz');
var conf 			= require('./../../config.json');
var request 		= require('request');
var later 			= require('later');
var SunCalc			= require('suncalc');
var suntimes		= SunCalc.getTimes(new Date(), 51.5, -0.1);
var intervals 		= {};
function currentDate() {
    var d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function addTime(strTime) {
    var time = strTime.split(':');
    var d = currentDate();
    d.setHours(time[0]);
    d.setMinutes(time[1]);
    // d.setSeconds(time[2]);
    return d;
}

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
	log: {
		debug: function(msg){
			var now = new Date;
			var datum =  now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
			console.log(datum +': '+ colors.blue(msg));
		},
		error: function(msg){
			var now = new Date;
			var datum =  now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
			console.log(datum +': '+ colors.red(msg));
		},
		info: function(msg){
			var now = new Date;
			var datum =  now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
			console.log(datum +': '+ colors.green(msg));
		}
	},
	/*
	log: function(msg, type){
		if(!type){
			var type = 'debug';
		}
		var now = new Date;
		var datum =  now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
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
	},
	*/
	mdyToDate: function(mdy) {
		var d = mdy.split('.', 4);
		var m = d[3].split(":", 2);

		if (d.length != 4 || m.length != 2){
			return null;
		}
		// Check if date is valid
		var mon = parseInt(d[1]); 
		var	day = parseInt(d[0]);
		var	year= parseInt(d[2]);
		var hour = parseInt(m[0]);
		var min = parseInt(m[1]);
		if (d[2].length == 2) year += 2000;{
			if (day <= 31 && mon <= 12 && year >= 2015){
				return new Date(year, mon - 1, day, hour, min);
			}
		}
		return null;
	},
	// AUSLAGERN!!??
	fritzboxConnect: function(callback){
		if(conf.fritzbox.user != 'false'){
			console.log("Fritzboxnutzer: " + conf.fritzbox.user);
			console.log("FritzboxIP: " + conf.fritzbox.ip);
			var moreParam = { url: conf.fritzbox.ip };
			fritz.getSessionID(conf.fritzbox.user , conf.fritzbox.password, function(sid){
				console.log("Fritzbox Session ID: " + sid);
				if(sid == "0000000000000000"){
					console.log("Kann keine Verbindung zur Fritzbox herstellen!");
				}else{
					callback(fritz, sid);
				}
			}, moreParam);
		}
	},
	Sensor: function(nodeid, name, data, charttype, linetype, farbe, valueSuffix, yAxis, step, showAll){
		this.nodeid = nodeid;
		this.name = name;
		this.data = data;
		this.step = step;
		// this.step = Boolean(step);
		this.showAllData = showAll;
		this.type = charttype;
		this.dashStyle = linetype;
		this.color = farbe;
		this.yAxis = yAxis;
		this.connectNulls = true;
		this.marker = new Object;
		this.marker.symbol = "diamond";
		this.marker.radius = 3;
		this.tooltip = new Object;
		this.tooltip.valueSuffix = valueSuffix;
	},
	wochentag: function(i){
		var tag = (typeof(i) == 'object') ? i.getDay() : i ;
		return tag;
	},
	switchaction: function (type, id, action){
		if(action == "on" || action == 'true'){
			action = 1;
		}else{
			action = 0;
		}
		request.get({
			url:'http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/switch/' + type + '/' + id + '/' + action,
			form:
				{
				}
		},function( err, httpResponse, body){
			if(err){
				console.log( err , "error");
			}else{
				console.log("Erfolgreich an den SwitchServer gesendet");
			}
		});
		console.log('http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/switch/' + type + '/' + id + '/' + action);
	},
	getSuntime: function (type, offset){
		if(type == "sunrise"){
			var suntime 		= new Date(suntimes.sunrise);
		}else{
			var suntime 		= new Date(suntimes.sunset);
		}
		var hours 		= suntime.getHours();
		var minutes 	= suntime.getMinutes();

		if(type == "sunrise"){
			console.log("		Sonnenaufgang:	" + hours + ':' + minutes);
		}else{
			console.log("		Sonnenuntergang:	" + hours + ':' + minutes);
		}

		if(offset.number != ""){

			console.log("		Offset:		" + offset.number);
			var allInMin = hours * 60 + minutes;

			if(offset.unit == "+"){
				var newTime = allInMin + parseInt(offset.number);
			}else{
				var newTime = allInMin - parseInt(offset.number);
			}

			var hours = Math.round(newTime / 60);
			var minutes = newTime % 60;
		}

		if(minutes <= 9){
			minutes = "0" + minutes;
		}
		if(hours <= 9){
			hours = "0" + hours;
		}

		var now = hours + ':' + minutes;
		return now;
	},
	setVariable: function(name, status){
		var url = "http://" + conf.QuickSwitch.ip + ":" + conf.QuickSwitch.port + "/setVariable/" + name + "/" + status;
		request(url , function (error, response, body) {
			if (error) {
				var now = new Date;
				var datum =  now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
				console.log(datum +': '+ colors.red(error));
			}
		});
	},
	setVariableByNodeid: function(nodeid, status){
		var url = "http://" + conf.QuickSwitch.ip + ":" + conf.QuickSwitch.port + "/setVariableByNodeid/" + nodeid + "/" + status;
		request(url , function (error, response, body) {
			if (error) {
				var now = new Date;
				var datum =  now.getDate() + "." + (now.getMonth() + 1) + "." + now.getFullYear() + " " + now.getHours() + ":" + now.getMinutes() + ":" + now.getSeconds();
				console.log(datum +': '+ colors.red(error));
			}
		});
	},
	isTimeInRange: function(strLower, strUpper) {
		var now = new Date();
		var lower = addTime(strLower);
		var upper = addTime(strUpper);
		var inRange = false;
		console.log("	Prüfe Zeitraum: " + lower + '-' + upper);
		if (upper > lower) {
			// opens and closes in same day
			inRange = (now >= lower && now <= upper) ? true : false;
		} else {
			// closes in the following day
			inRange = (now >= upper && now <= lower) ? false : true;
		}
		return inRange;
	},
	currentDate: currentDate,
	cron : function(pattern, callback, id){
		var sched = later.parse.cron(pattern);
		intervals[id] = later.setInterval(callback , sched);
	},
	removeCron: function(id){
		intervals[id].clear();
	}
}