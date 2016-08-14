var colors			= require('colors/safe');
var fritz 			= require('smartfritz');
var conf 			= require('./../../config.json');
var request 		= require('request');
var later 			= require('later');
var SunCalc			= require('suncalc');
var intervals 		= {};
function getRandomBoolean() {
	return !(Math.random()+.5|0); // (shortcut for Math.round)
	// return !(+new Date()%2); // faux-randomness
	// return Math.random()<.5; // Readable, succint
}
function parseTime(time){
	var time 		= time.split(':');
	return createTime(new Date().setHours(time[0], time[1]));
}
function createTime(time){
	time = new Date(parseInt(time));
	time.setMilliseconds(0);
	time.setSeconds(0);
	var minutes = ("0" + time.getMinutes()).slice(-2);
	var hours = ("0" + time.getHours()).slice(-2);
	return {
		timestamp: time.getTime(),
		hours: time.getHours(),
		minutes: time.getMinutes(),
		time: hours + ':' + minutes
	}
}

function addTime(strTime) {
	var time = strTime.split(':');
	var d = currentDate();
	d.setHours(time[0]);
	d.setMinutes(time[1]);
	// d.setSeconds(time[2]);
	return d;
}
function currentDate() {
	var d = new Date();
	return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}
var log = {
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
		},
		pure: function(msg){
			console.log(msg);
		}
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
	log: log,
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
	Sensor: function(nodeid, name, data, charttype, linetype, farbe, valueSuffix, yAxis, step, showAll, connectNulls){
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
		this.connectNulls = connectNulls;
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
		}if(action == "off" || action == 'false'){
			action = 0;
		}else{
			action = action;
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
		// console.log('http://' + conf.QuickSwitch.ip + ':' + conf.QuickSwitch.port + '/switch/' + type + '/' + id + '/' + action);
	},
	calculateOffset:function(timer, condition){
		var suntimes			= SunCalc.getTimes(new Date(), 51.5, -0.1);
		// Wenn noch nie ausgeführt dann letzte Ausführung auf vor 12 Stunden setzten
		timer.lastexec = parseInt(timer.lastexec);
		if(!timer.lastexec){
			timer.lastexec = new Date().getTime() - 12 * 60 * 60000;
		}

		// Uhrzeit aus Sunset/Sunrise/Standard errechenen 
		switch(condition.time){
			case "sunrise":
				var time 		= new Date(suntimes.sunrise);
				var hours 		= time.getHours();
				var minutes 	= time.getMinutes();
				log.pure("		Sonnenaufgang:	" + hours + ':' + minutes);
				break;
			case "sunset":
				var time 		= new Date(suntimes.sunset);
				var hours 		= time.getHours();
				var minutes 	= time.getMinutes();
				log.pure("		Sonnenuntergang:	" + hours + ':' + minutes);
				break;
			default:
				var time 		= condition.time.split(':');
				var hours 		= time[0];
				var minutes 	= time[1];
				time = new Date();
				time.setHours(hours, minutes);
				time = parseInt(time.getTime());
				log.pure("		Zeit:	" + hours + ':' + minutes);
				break;
		}

		
		if(condition.offset){
			var offset = condition.offset;
		}else{
			var offset = {
				number:0,
				unit:true
			}
		}
			var timeMin = time - (offset.numberMax * 60000);
			var timeMax = time + (offset.numberMax * 60000);

			// log.pure(timeMin);
			// log.pure(timeMax);
			// log.pure(timer.lastexec);
			if(timer.lastexec > timeMin && timer.lastexec < timeMax){
				log.pure("		Timer schon ausgeführt");
				return false;
			}

			// Offset verschiebung errechenen (früher/später)
			switch(offset.unit){
				case '+':
				case 'true':
				case true:
					var newUnit = true;
					break;
				case '-':
				case 'false':
				case false:
					var newUnit = false;
					break;
				case 'random':
					var newUnit = getRandomBoolean();
					if(new Date().getTime() > time){
						var newUnit = true;
					}
					break;
				default:
					var newUnit = true;
					break;
			}
			// log.pure(newUnit);
			// log.pure(offset.mode);

			if(offset.mode == 'random'){
				// log.pure('RANDOM:' + offset);
				if(new Date().getTime() < timeMax && new Date().getTime() > timeMin){
					if(newUnit == true){
						// Später
						var newOffsetNumber = Math.abs(Math.round((new Date().getTime() - time) / 60000));
						log.pure(newOffsetNumber);
						if(newOffsetNumber > offset.numberMin){
							offset.numberMin = newOffsetNumber;
						}
						// else{
							// return false;
						// }
					}else{
						// Früher
						var newOffsetNumber = Math.abs(Math.round((time - new Date().getTime()) / 60000));
						if(newOffsetNumber < offset.numberMax){
							offset.numberMax = newOffsetNumber;
						}
						// else{
							// return false;
						// }
					}
					
				}else{
					log.pure('		Zeit mit diesem Interval nicht erfüllbar');
					return false;
				}
				// Zufällige Zeiten berechnen:
				log.pure("		Interval: 		" + offset.numberMin  + "-" + offset.numberMax);
				offset.number = getRandomInt(parseInt(offset.numberMin), parseInt(offset.numberMax));
			}else{
				if(timer.lastexec > new Date().getTime() - 60000){
					log.pure("		Timer schon ausgeführt");
					return false;
				}
			}


			if(offset && offset.number != ""){
				if(newUnit == true){
					log.pure("		Offset: 		" + offset.number + " Minuten später");
					var newTime = new Date(time + (offset.number * 60000));
				}else{
					log.pure("		Offset: 		" + offset.number + " Minuten früher");
					var newTime = new Date(time - (offset.number * 60000));
				}
				var hours 		= newTime.getHours();
				var minutes 	= newTime.getMinutes();
			}
		
		// else{
		// 	if(timer.lastexec > new Date().getTime() - 60000){
		// 		log.pure("		Timer schon ausgeführt");
		// 		return false;
		// 	}else{
		// 		log.pure(' 		Timer noch nicht ausgeführt');
		// 	}
		// }
		
		minutes = ("0" + minutes).slice(-2);
		hours = ("0" + hours).slice(-2);

		var now = hours + ':' + minutes;
		log.pure("		Errechnete Zeit: 	" + now);
		return now;
	},
	calculateOffsetBefore4716: function(timer, condition){
		var suntimes			= SunCalc.getTimes(new Date(), 51.5, -0.1);

		if(condition.offset){
			var offset = condition.offset;
		}else{
			var offset = {
				mode:'normal',		// Random ja|nein
				unit: '-',			// früher|später|random
				numberMin:1, 			// Minuten mindestens	\___Random Zahl
				numberMax:10, 			// Minuten Maximal		/
				number:0 				// wenn mode=normal
			};
		}
		switch(condition.time){
			case "sunrise":
				var time 		= new Date(suntimes.sunrise);
				var hours 		= time.getHours();
				var minutes 	= time.getMinutes();
				log.pure("		Sonnenaufgang:	" + hours + ':' + minutes);
				break;
			case "sunset":
				var time 		= new Date(suntimes.sunset);
				var hours 		= time.getHours();
				var minutes 	= time.getMinutes();
				log.pure("		Sonnenuntergang:	" + hours + ':' + minutes);
				break;
			default:
				var time 		= condition.time.split(':');
				var hours 		= time[0];
				var minutes 	= time[1];
				break;
		}

		switch(offset.unit){
			case '+':
			case 'true':
			case true:
				var newUnit = true;
				break;
			case '-':
			case 'false':
			case false:
				var newUnit = false;
				break;
			case 'random':
				var newUnit = getRandomBoolean();
				break;
			default:
				var newUnit = true;
				break;
		}

		// Die Zeit wird zufällig berechnet:
		if(offset.mode == 'random'){
			log.pure("	Zufallstimer: 			" + hours + ':' + minutes + ' ' + newUnit + ' ' + offset.numberMin + '-' + offset.numberMax);
			log.pure("	Dieser Timer schaltet zwischen:" + new Date(TimeTimestampMin) + " und " + new Date(TimeTimestampMax));

			var bla = new Date();
			bla.setHours(hours, minutes);

			if(newUnit = false){
				// Früher
				var TimeMin = new Date(bla.getTime() - offset.numberMax * 60000).getTime();
				var TimeMax = new Date(bla.getTime() - offset.numberMin * 60000).getTime();

			}else{
				// Später
				var TimeMin = new Date(bla.getTime() - offset.numberMin * 60000).getTime();
				var TimeMax = new Date(bla.getTime() - offset.numberMax * 60000).getTime();

			}
			if(timer.lastexec > TimeMin){
				log.pure("		Timer schon ausgeführt");
				return;
			}
			// letzte Ausführung kleiner als time - numberMax
			// => noch nicht geschaltet
			if(!timer.lastexec){
				// Wenn noch nie ausgeführt dann letzte Ausführung auf vor 12 Stunden setzten 
				timer.lastexec = new Date().getTime() - 12 * 60 * 60000;
			}

			// => sofort schalten, da abgelaufen
			if( new Date().getTime() > TimeMax){
				log.pure(" 		Timer sofort schalten, zeitraum um!");
				offset.number = '0';
				var hours 		= new Date().getHours();
				var minutes 	= new Date().getMinutes();
				minutes = ("0" + minutes).slice(-2);
				hours = ("0" + hours).slice(-2);
				return  hours + ':' + minutes;
			}


			log.pure(" 		Timer noch nicht geschaltet");


					// var numberMax = Math.round(Math.round(new Date().getTime() - TimeTimestampMin) / 60000);
					// // if(numberMax >= 0){
					// 	if(new Date().getTime() < bla.getTime()){
					// 		offset.numberMax = offset.numberMax - numberMax;
					// 	}
					// 	if(new Date().getTime() > bla.getTime()){
					// 		offset.numberMin = offset.numberMin + (numberMax - offset.numberMax);
					// 	}
					// // }
					
					log.pure("		Interval: 		" + offset.numberMin  + "-" + offset.numberMax);
					offset.number = getRandomInt(parseInt(offset.numberMin), parseInt(offset.numberMax));
		}

		if(offset && offset.number != ""){
			if(newUnit == "+" || newUnit == true || newUnit == 'true'){
				log.pure("		Offset: 		" + offset.number + " Minuten später");
				var newTime = new Date(bla.getTime() + (offset.number * 60000));
			}else{
				log.pure("		Offset: 		" + offset.number + " Minuten früher");
				var newTime = new Date(bla.getTime() - (offset.number * 60000));
			}
			var hours 		= newTime.getHours();
			var minutes 	= newTime.getMinutes();
		}

		minutes = ("0" + minutes).slice(-2);
		hours = ("0" + hours).slice(-2);

		var now = hours + ':' + minutes;
		log.pure("		Neu errechnete Zeit: 	" + now);
		return now;
	},
	getSuntime: function (type, offset){
		var suntimes			= SunCalc.getTimes(new Date(), 51.5, -0.1);
		if(type == "sunrise"){
			var suntime 		= new Date(suntimes.sunrise);
			console.log("		Sonnenaufgang:	" + suntime.getHours() + ':' + suntime.getMinutes());
		}else{
			var suntime 		= new Date(suntimes.sunset);
			console.log("		Sonnenuntergang:	" + suntime.getHours() + ':' + suntime.getMinutes());
		}

		if(offset && offset.number != ""){
			if(offset.unit == "+"){
				console.log("		Offset: 		" + offset.number + " Minuten später");
				var suntime = new Date(suntime.getTime() + (offset.number * 60000));
			}else{
				console.log("		Offset: 		" + offset.number + " Minuten früher");
				var suntime = new Date(suntime.getTime() - (offset.number * 60000));
			}
		}
		return createTime(suntime.getTime());
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
	isTimeInRange: function(lower, upper) {
		var now = new Date();
		var inRange = false;
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
		console.log(intervals);
	},
	removeCron: function(id){
		intervals[id].clear();
		console.log(intervals);
	}
}
