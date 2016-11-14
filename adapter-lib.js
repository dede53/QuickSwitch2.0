/********************************
Log-Level:
more	|	info	1	| =  1
		|	debug	2	| >= 2
		|	warning	3	| >= 3
less	|	error	4	| >= 4
********************************/

var fs 				= require('fs');
var request 		= require('request');
var conf 			= require('./config.json');
var later 			= require('later');
var intervals 		= {};

function adapter(settings){
	this.log = {
		"info": function(data){
			if(settings.loglevel == 1 ){
				try{
					if(typeof data === "object"){
						var data = JSON.stringify(data);
					}else{
						var data = data.toString();
					}
					process.send({"log":data});
				}catch(e){}
			}
		},
		"debug": function(data){
			if(settings.loglevel <= 2){
				try{
					if(typeof data === "object"){
						var data = JSON.stringify(data);
					}else{
						var data = data.toString();
					}
					process.send({"log":data});
				}catch(e){}
			}
		},
		"warning": function(data){
			if(settings.loglevel <= 3){
				try{
					if(typeof data === "object"){
						var data = JSON.stringify(data);
					}else{
						var data = data.toString();
					}
					process.send({"log":data});
				}catch(e){}
			}
		},
		"error": function(data){
			if(settings.loglevel <= 4){
				try{
					if(typeof data === "object"){
						var data = JSON.stringify(data);
					}else{
						var data = data.toString();
					}
					process.send({"log":data});
				}catch(e){}
			}
		},
		"pure": function(data){
			console.log(data);
		}
	}
	this.setSetting = function(name, status){
		this.settings[name] = status;
		fs.readFile("./adapter/" + this.name.toLowerCase() + "/" + settings.settingsFile, "utf8", function(err, data){
			if(err){
				console.log(err);
			}else{
				data[name] = status;
				fs.writeFile("./adapter/" + this.name.toLowerCase() + "/" + settings.settingsFile, data, function(err){
					if(err){
						console.log(err);
					}
				});
			}
		});
	}
	this.setVariable = function(nodeid, status){
		if(typeof status === "object"){
			try{
				var status = JSON.stringify(status);
				// var status = status.toString();
			}catch(e){
				;
			};
		}
		var url = "http://" + conf.QuickSwitch.ip + ":" + conf.QuickSwitch.port + "/setVariable/" + nodeid + "/" + status;
		var that = this;
		request(url , function (error, response, body) {
			if (error) {
				that.log.error(error);
				that.log.error(response);
				that.log.error(body);
			}
		});
	}
	this.setLoglevel = function(level){
		this.loglevel = parseInt(level);
		this.setVariable(this.name.toLowerCase() + '.loglevel', level);
	}
	this.loadSettings = function(){
		this.settings = JSON.parse(fs.readFileSync("./adapter/" + this.name.toLowerCase() + "/" + settings.settingsFile, "utf8"));
	}
	this.setStatus = function(status){
		process.send({"setState":{"name":"status","status":status}});
		this.status = status;
	}
	this.cron = function(mode, id, pattern, callback){
		if(mode == "add"){
			var sched = later.parse.cron(pattern);
			console.log(later.schedule(sched).next(10));
			intervals[id] = later.setInterval(callback , sched);
		}else{
			intervals[id].clear();
		}
	}
	this.name = settings.name;
	this.description = settings.description;
	if(settings.settings){
		this.settings = settings.settings;
	}
	if(settings.settingsFile){
		this.loadSettings();
	}
	this.setLoglevel(settings.loglevel);
}
module.exports = adapter;



