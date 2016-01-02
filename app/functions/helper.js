var colors			= require('colors/safe');
var fritz 			= require('smartfritz');
var conf 			= require('./../../config.json');

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
	fritzboxConnect: function(callback){
		var moreParam = { url: conf.fritzbox.ip };
		fritz.getSessionID(conf.fritzbox.user , conf.fritzbox.password, function(sid){
			console.log("Fritzbox Session ID: " + sid);
			if(sid == "0000000000000000"){
				console.log("Kann keine Verbindung zur Fritzbox herstellen!");
			}else{
				callback(fritz, sid);
			}
		}, moreParam);
	},
	/*
									var data					= new Object;
								data.id						= sensor.nodeID;
								data.name					= sensor.name;
								data.data					= bla;
								data.type					= sensor.charttype;
								data.dashStyle				= sensor.linetype;
								data.lineColor 				= sensor.farbe;
								data.connectNulls			= true;

								data.marker					= new Object;
								data.marker.symbol 			= "diamond";
								data.marker.radius 			= 3;
								data.marker.fillColor 		= sensor.farbe;

								data.tooltip 				= new Object;
								data.tooltip.valueSuffix 	= " °C";
								*/

	Sensor: function(nodeid, name, data, charttype, linetype, farbe, valueSuffix, yAxis){
		this.id = nodeid;
		this.name = name;
		this.data = data;
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
	}
}