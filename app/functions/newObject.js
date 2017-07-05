var db							=	require('./database.js');
var createSwitchServer			=	require('./newSwitchServer.js');
var request						=	require('request');
var helper						=	require('./helper');
var util = require('util');
/*****************************

{
	id,
	type: [device, object, enum]
	data:{[
		
	]},
	switch()
	set()
	get()
	delete()
}

*****************************/
var diagramEntry = function(id, name, data, charttype, linetype, farbe, valueSuffix, yAxis, step, showAll, connectNulls){
	this.id = id;
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
}

var createObject = function(bla, switchServers){
	try{
		this.id = bla.id;
		this.type = bla.type;
		this.data = JSON.parse(bla.data);
		switch(this.type){
			case "device":
			case "object":
			case "enum":
				this.switchServer = switchServers[this.data.switchServer];
				// console.log(new createSwitchServer(switchServers[object.data.switchServer]));
				// this.switchServer = new createSwitchServer(switchServers[object.data.switchServer]);
				break;
				// this.listItems = {};
				// this.data.list.forEach(function(itemId){
				// 	this.listItem[itemId] = createObject(, switchServers);
				// });
				// break;
			default:
				break;
		}
	}catch(e){
		throw e;
	}
}

createObject.prototype.get = function(){
	return this;
}
createObject.prototype.set = function(object){
	// this.object = object;
	var query = "UPDATE objects SET data = '"+ this.data +"' WHERE id = "+ this.id +";";
	db.run(query);
}

createObject.prototype.sendTo = function(status, callback){
	if(!parseInt(status)){
		switch(status){
			case "toggle":
				if(this.data.status == 0){
					status = 1;
				}else{
					status = 0;
				}
				break;
		}
	}
	// console.log(this.data);
	var that = this;
	request.post({
		url:'http://' + this.switchServer.ip + ':' + this.switchServer.port + '/switch',
		form: {
			status: status,
			data: this.data
		}
	},function( err, httpResponse, body){
		if(err){
			// log.error("Error! \n SwitchServer ist nicht erreichbar!");
			// log.error(err);
		}else{
			if(body !== '200'){
				// log.error("Der SwitchServer [" + conf.switchserver[data.switchserver].ip + ':' + conf.switchserver[data.switchserver].port + "] meldet einen Fehler mit dem Adapter: " + action);
				if(callback){
					callback(body);
				}
			}else{
				// log.info("Erfolgreich an den SwitchServer gesendet");
				that.data.status = status;
				var query = "UPDATE objects SET data = '"+ JSON.stringify(that.data) +"' WHERE id = "+ that.id +";";
				db.run(query);
				if(callback){
					callback(200);
				}
			}
		}
	});
}

createObject.prototype.switch = function(status, app, callback){
	if(this.type == "enum"){
		for(var e in this.data.list){
			this.data.listItems[this.data.list[e]].switch(status, app, callback);
		}
	}else{
		this.sendTo(status, callback);
	}
}

createObject.prototype.delete = function(callback){
	var query = "DELETE FROM devices WHERE deviceid = "+ id +";";
	delete this;
	db.all(query, function(err, res){
		if(err){
			log.error(err);
			if(callback){
				callback(err);
			}
		}else{
			log.info('Delete switch with id: ' + id);
			if(callback){
				callback("200");
			}
		}
	});
}

createObject.prototype.getSwitchHistory = function(hours, callback){
	var query = "SELECT * FROM `switch_history` WHERE time > '" + new Date(new Date().getTime() - (hours * 60000 * 60)).getTime() + "' GROUP BY deviceid;";
	db.all(query, function(err, data){
		if(err){
			console.log(err);
		}else{
			data.forEach(function(device){
				var query = "SELECT * FROM `switch_history` WHERE time > '" + new Date(new Date().getTime() - (hours * 60000 * 60)).getTime() + "' AND deviceid = '" + device.deviceid + "';";
				db.all(query, function(err, history){
					if(err){
						console.log(err);
					}else{
						var sortedData = [];
						history.forEach(function(dat){
							var value= [];
							value[0] = Math.floor(dat.time);

							dat.status = parseFloat(dat.status);
							if(dat.status == 0){
								sortedData.push([
									Math.floor(dat.time - 10),
									parseFloat(device.deviceid)
								]);
								value[1] = null;
							}else{
								value[1] = parseFloat(device.deviceid);
							}
							sortedData.push(value);
							
						});
						if(sortedData[sortedData.length -1 ][1] != null){
							sortedData.push([
								Math.floor(new Date().getTime()),
						 		sortedData[sortedData.length -1][1]
						 	]);

						}
						var sensor = new diagramEntry(device.deviceid, device.place, sortedData, 'line', 'solid', undefined, '', 0, false, true, false);
						callback(sensor);
					}
				});
			});
		}
	});
}

module.exports = createObject;