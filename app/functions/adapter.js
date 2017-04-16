var plugins 				=	{};
var log_file 				=	{};
var fs 						=	require('fs');
var cp 						=	require('child_process');
var async 					= 	require('async');

module.exports = {
	get: function(callback){
		fs.readdir('../../adapter', function(err, data){
			if(err){
				// adapter.log.error(err);
			}else{
				callback(data);
			}
		});
	},
	install: function(name, callback){
		var url = "git clone https://github.com/dede53/qs-" + name + ".git ./adapter/" + name;
		adapter.log.error(url);
		cp.exec(url, function(error, stdout, stderr){
			if(error){
				adapter.log.error("Adapter konnte nicht installiert werden.");
				adapter.log.error(stderr);
				callback(stderr);
				return;
			}
			try{
				var package = fs.readFileSync('./adapter/' + name + '/package.json');
				package = JSON.parse(package);
			}catch(e){
				adapter.log.error("Fehler in der package.json von " + name);
				callback(404);
			}

			var dependencies = Object.keys(package.dependencies);
			if(dependencies.length > 0 ){
				adapter.log.debug(name + ": Abhängigkeiten installieren!");
				installDependencies(dependencies, function(status){
					if(status != 200){
						adapter.log.error("Abhängigkeiten konnten nicht installiert werden!");
						return;
					}
					if(fs.existsSync("./adapter/" + name + "/" + name + ".json.example")){
						adapter.log.debug(name + ": config umbennen!");
						fs.rename("./adapter/" + name + "/" + name + '.json.example', "./adapter/" + name + "/" + name + '.json', function(err){
							if(err){
								adapter.log.error(err);
								callback(404);
								return;
							}				
							adapter.log.info(stdout);
							adapter.log.debug(name + " installiert!");
							startAdapter(name, function(status){
								callback(status);
							});
						});
					}else{
						adapter.log.debug(name + " installiert!");
						startAdapter(name, function(status){
							callback(status);
						});
					}
				});
			}else{
				if(fs.existsSync("./adapter/" + name + "/" + name + ".json.example")){
					adapter.log.debug(name + ": config umbennen!");
					fs.rename("./adapter/" + name + "/" + name + '.json.example', "./adapter/" + name + "/" + name + '.json', function(err){
						if(err){
							adapter.log.error(err);
							callback(404);
							return;
						}				
						adapter.log.info(stdout);
						adapter.log.debug(name + " installiert!");
						startAdapter(name, function(status){
							callback(status);
						});
					});
				}else{
					adapter.log.debug(name + " installiert!");
					startAdapter(name, function(status){
						callback(status);
					});
				}
			}

		});
	},
	remove:function(name, callback){
		stopAdapter(name, function(){
			cp.exec("rm -r " + __dirname + "/adapter/" + name, function(error, stdout, stderr){
				adapter.log.info(name + " wurde entfernt");
				callback("entfernt");
			});
		});
	},
	restart:function(name, callback){
		stopAdapter(req.params.name, function(status){
			if(status == "gestoppt"){
				startAdapter(req.params.name, function(status){
					if(status == "gestartet"){
						callback("reloaded");
					}
				});
			}
			
		});
	},
	start:function(name, callback){
		if(plugins[name]){
			console.log("Adapter läuft bereits!");
		}else{
			try{
				var name				= name.toLowerCase();
				var path				= './adapter/' + name + "/index.js";
				var debugFile			= __dirname + '/log/debug-' + name + '.log';
				log_file[name]			=	fs.createWriteStream( debugFile, {flags : 'w', encoding: 'utf8'});
				plugins[name]			= cp.fork( path );
				adapter.log.info(name + " wurde gestartet");
				log_file[name].write(new Date() +": Der Adapter wurde gestartet!\n");
				plugins[name].on('message', function(response) {
					if(response.log){
						// console.log(response.log.toString());
						log_file[name].write(new Date() +":"+ response.log.toString() + '\n');
					}
				});
				plugins[name].on('error', function(data) {
					console.log("ERROR");
					console.log(data.toString());
					log_file[name].write(new Date() +":"+ data.toString() + '\n');
				});
				plugins[name].on('disconnect', function() {
					// plugins[name] = undefined;
					console.log("DISCONNECT");
				});
				plugins[name].on('close', function() {
					// plugins[name] = undefined;
					console.log("CLOSE");
				});
				callback("gestartet");
			}catch(e){
				adapter.log.error(e);
				callback(404);
			}
		}
	},
	stop:function(name, callback){
		try{
			plugins[name].kill('SIGHUP');
			adapter.log.info(name + " wurde gestoppt");
			plugins[name] = undefined;
			callback("gestoppt");
		}catch(e){
			console.log(e);
			callback(404);
		}
	},
}
function installDependencies(dependencies, cb){
	async.each(dependencies,
		function(deb, callback){
			cp.exec("npm install " + deb, function(error, stdout, stderr){
				if(error){
					adapter.log.error(error);
				}else{
					cb();
				}
			});
		},
		function(err){
			if(err){
				cb(400);
			}else{
				cb(200);
			}
		}
	);
}

function action(status, data){
	var transData = {
		status: status,
		data: data
	}
	try{
		if(data.protocol.includes(":")){
			var protocol = data.protocol.split(":");
			plugins[protocol[0]].send(transData);
		}else{
			plugins[data.protocol].send(transData);
		}
	}catch(err){
		adapter.log.error(data);
		adapter.log.error(err);
		adapter.log.error("Adapter zum schalten nicht installiert: " + data.protocol);
	}
}