var events								= require('events');
var db									= require('./database.js');
var request 							= require('request');
var conf 								= require('./../../config.json');



function objects(){
	this.obects 						= {};
	this.active 						= {};
	// hier können die Objekte geladen werden!
	// dabei auch this.active füllen!
	var query = "SELECT devices.*, rooms.name AS Raum FROM devices, rooms WHERE devices.roomid = rooms.id;";
	db.all(query , function(err, row) {
		if (err) {
			log.error(err);
			callback(500);
		}else if(row == ""){
			callback(404);
		}else{
			row.forEach((device) => {
				this.add(device);
			});
		}
	});
	this.on('send', (object) => {
		if(!object.showStatus){
			return;
		}
		if(object.status){
			this.active[object.id] = object;
		}else{
			delete this.active[object.id];
		}
	});
}

/*

	objects.prototype 						= new events.EventEmitter();
	objects.prototype.send 					= function(id, status, callback){}
	objects.prototype.sendAll 				= function(status){}

	objects.prototype.get 					= function(id, callback){}
	objects.prototype.getAll				= function(callback){}		// Necessary? allDevices sollte reichen, oder? Nop! Da fehlt die Raumstruktur

	objects.prototype.save 					= function(data, callback){}

	objects.prototype.delete 				= function(id, callback){}
	objects.prototype.favorites 			= function(favoritDevices, callback){} // Arrays!
	objects.prototype.active 				= function(callback){}
	objects.prototype.setStatus 			= function(id, status){}

	objects.prototype.getSwitchHistory 		= function(hours, callback){}
	objects.prototype.getSwitchHistoryAll 	= function(hours, callback){}
*/

objects.prototype 						= new events.EventEmitter();
objects.prototype.send 					= function(id, status, callback){
	var data 		= this.objects[id];
	data.newStatus 	= status;
	request.post({
		url: "http://" + conf.switchserver[data.switchserver].ip + ":" + conf.switchserver[data.switchserver].port + "/action",
		form: data
	}, (error, httpResponse, body) => {
		if(error){
			console.log("Der SwitchServer (" + error.address + ":" + error.port + ") ist nicht erreichbar! Schaue in die Einstellungen -> SwitchServer oder frage deinen Admin um Rat.");
			return;
		}

		switch(httpResponse.statusCode){
            case 400:
                log.error("Kein Protocol für das Gerät " + data.name + "|" + data.Raum + " ausgewählt!");
                break;
            case 401:
                log.error("Der SwitchServer (" + conf.switchserver[data.switchserver].ip + ":" + conf.switchserver[data.switchserver].port + ") hat keinen Adapter zum schalten installiert: " + data.protocol);
                break;
            default:
                if(data.type == "device"){
                    log.info("Erfolgreich an den SwitchServer gesendet");
                    saveStatus(app, data, function(data){
                        if(callback){
                            callback(data);
                        }
                    });
                }else{
                    log.info("Erfolgreich an den SwitchServer gesendet");
                    if(callback){
                        callback(200);
                    }
                }
                break;
        }
	});
}
objects.prototype.sendAll 				= function(status, callback){
	for(var index in this.objects){
		if(this.objects[index].showStatus){
			this.send(index, status);
		}
	}
	callback(200);
}

objects.prototype.get 					= function(id, callback){
	if(callback){
		callback(this.objects[id]);
	}else{
		return this.objects[id];
	}
}

// Necessary? allDevices sollte reichen, oder? Nop, Object => Raum => Roomdevices
objects.prototype.getAll				= function(callback){
	var response = {};
	for(var index in this.rooms){
		response[index] = {
			room: 			this.rooms[index],
			roomDevices: 	{}
		}
		for(var deviceIndex in this.devices){
			response[index].roomdevices = this.devices[deviceIndex];
		}
	}

	if (callback){
		callback(this.objects);
	}else{
		return this.objects[id];
	}
}

// als zwei oder eine?
objects.prototype.save 					= function(data, callback){
	if(data.id || data.deviceid){
		data = new qsObject(data);
		var query = "UPDATE devices SET name = '"+ data.name +"', protocol = '"+ data.protocol +"', showStatus = '"+ data.showStatus +"', buttonLabelOn = '"+ data.buttonLabelOn +"', buttonLabelOff = '"+ data.buttonLabelOff +"', CodeOn = '"+ data.CodeOn +"', CodeOff = '"+ data.CodeOff +"', roomid = '"+ data.roomid +"', switchserver = '" + data.switchserver + "' WHERE deviceid = '"+ data.deviceid +"';";
		db.run(query);
		callback(undefined, this.objects[data.id]);
	}
}

objects.prototype.add 					= function(data){
	this.objects[data.id]				= new qsObject(data);
	this.emit('new', this.objects[data.id]);
}

objects.prototype.delete 				= function(id, callback){
	delete this.objects[id];
	var query = "DELETE FROM devices WHERE deviceid = "+ id +";";
	db.all(query , (err,rows) => {
		if(err){
			console.log(err);
			callback(err);
		}else{
			console.log('Delete switch with id: ' + id);
			callback("200");
		}
	});
}
objects.prototype.favorites 			= function(favoritObjects, callback){
	var objects = [];
	favoritObjects.forEach((id) => {
		objects.push(this.objects[id]);
	});
	callback(objects);
}
objects.prototype.active 				= function(callback){
	callback(Object.values(this.active));
}
objects.prototype.setStatus 			= function(id, status){
	if(id == "all"){
		for(var index in this.objects){
			this.objects[index].status = status;
		}
	}else{
		this.objects[id].status = status;
	}
}

objects.prototype.getSwitchHistory 		= function(hours, callback){}
objects.prototype.getSwitchHistoryAll 	= function(hours, callback){}

function qsObject(data){
	this.deviceid		= data.deviceid 		|| this.deviceid 		|| undefined;
	this.name 			= data.name				|| this.name 			|| "";
	this.status 		= data.status 			|| this.status 			|| 0;
	this.protocol 		= data.protocol 		|| this.protocol;
	this.adapter 		= data.adapter 			|| this.adapter;
	this.showStatus 	= data.showStatus		|| this.showStatus		|| true;
	this.buttonLabelOn 	= data.buttonLabelOn	|| this.buttonLabelOn	|| "";
	this.buttonLabelOff = data.buttonLabelOff	|| this.buttonLabelOff	|| "";
	this.codeOn 		= data.codeOn			|| this.codeOn			|| "";
	this.codeOff 		= data.codeOff			|| this.codeOff			|| "";
	this.roomid 		= data.roomid			|| this.roomid			|| -1;
	this.roomName		= data.roomName			|| this.roomName		|| "";
	this.switchserver 	= data.switchserver 	|| this.switchserver 	|| 1;

	if(data.deviceid == undefined){
		var query = "INSERT INTO devices ( name, protocol, showStatus, buttonLabelOn, buttonLabelOff, CodeOn, CodeOff, roomid, switchserver ) VALUES ('"+ this.name +"', '"+ this.protocol +"', '"+ this.showStatus +"', '"+ this.buttonLabelOn +"', '"+ this.buttonLabelOff +"', '"+ this.CodeOn +"', '"+ this.CodeOff +"', '"+ this.roomid +"', '" + this.switchserver + "');";
		db.all(query, (err, res) => {
			if(err){
				callback(err, undefined);
			}else{
				data.deviceid = res.insertId;
				return this;
			}
		});
	}else{
		return this;
	}
}