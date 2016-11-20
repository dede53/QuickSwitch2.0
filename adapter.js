var fs 						=	require('fs');
var cp 						=	require('child_process');
var later 					= 	require('later');
var async 					= 	require('async');
var express 				=	require('express.io');
var bodyParser 				=	require('body-parser');
var app 					=	express();
var plugins 				=	{};
var log_file 				=	{};
var adapterLib 				=	require('./adapter-lib.js');
var adapter 				=	new adapterLib({
	"name":"Adapter",
	"loglevel":1,
	"description": "Lädt alle Adapter aus ./adapter.",
	"settingsFile": "",
	"settings":	{
		"port": 4041
	}
});

if(!fs.existsSync("./adapter")){
	fs.mkdirSync("./adapter", 0766, function(err){
		if(err){
			console.log("mkdir ./adapter: failed: " + err);
		}
	});
}

app.use(bodyParser.json());									// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));			// for parsing application/x-www-form-urlencoded


app.post('/switch', function (req, res) {
	action(req.body.status, req.body.data);
	res.json(200);
});

app.get('/adapter/:mode/:name', function (req, res) {
	switch(req.params.mode){
		case "reload":
			stopAdapter(req.params.name, function(status){
				if(status == "gestoppt"){
					startAdapter(req.params.name, function(status){
						if(status == "gestartet"){
							res.json("reloaded");
						}
					});
				}
				
			});
			break;
		case "stop":
			stopAdapter(req.params.name, function(status){
				res.json(status);
			});
			break;
		case "start":
			startAdapter(req.params.name, function(status){
				res.json(status);
			});
			break;
		case "install":
			installAdapter(req.params.name, function(status){
				res.json(status);
			});
			break;
		case "remove":
			removeAdapter(req.params.name, function(status){
				res.json(status)
			});
			break;
		default:
			console.log("Unterstützte Modi: reload|start|stop");
			break;
	}
});

try{
	app.listen(adapter.settings.port);
	adapter.log.info("SwitchServer running at http://127.0.0.1:" + adapter.settings.port);
}catch(e){
	try{
		app.listen(adapter.settings.port + 1);
		adapter.log.info("SwitchServer running at http://127.0.0.1:" + adapter.settings.port + " Given port is used.");
	}catch(e){
		adapter.log.error("Die Adapter konnten nicht gestartet werden!");
	}
}

fs.readdir('./adapter', function(err, data){
	if(err){
		adapter.log.error(err);
	}else{
		adapter.log.info("Installierte Adapter:");
		data.forEach(function(name){
			if(name.startsWith("~")){
				return;
			}
				var name = name.toLowerCase();
				var path = './adapter/' + name + "/index.js";
				var debugFile = __dirname + '/log/debug-' + name + '.log';

				try{
					log_file[name]			=	fs.createWriteStream( debugFile, {flags : 'w', encoding: 'utf8'});
					plugins[name] = cp.fork( path );
					adapter.log.info('	' + name);
					plugins[name].on('message', function(response) {
							
						if(response.log){
							console.log(response.log.toString());
							log_file[name].write(new Date() +":"+ response.log.toString() + '\n');
						}
					});
				}catch(e){
					adapter.log.error(e);
				}
		});
	}
});

function startAdapter(name, cb){
	if(plugins[name]){
		console.log("Adapter läuft bereits!");
	}else{
		try{
			var name = name.toLowerCase();
			var path = './adapter/' + name + "/index.js";
			var debugFile = __dirname + '/log/debug-' + name + '.log';
			log_file[name]			=	fs.createWriteStream( debugFile, {flags : 'w', encoding: 'utf8'});
			plugins[name] = cp.fork( path );
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
			cb("gestartet");
		}catch(e){
			adapter.log.error(e);
			cb(404);
		}
	}
}

function stopAdapter(name, cb){
	try{
		plugins[name].kill('SIGHUP');
		adapter.log.info(name + " wurde gestoppt");
		plugins[name] = undefined;
		cb("gestoppt");
	}catch(e){
		console.log(e);
		cb(404);
	}
}

function installAdapter(name, cb){
	// https://github.com/dede53/qs-fritzbox/archive/master.zip
	// https://github.com/dede53/qs-fritzbox.git
	var url = "git clone https://github.com/dede53/qs-" + name + ".git ./adapter/" + name;
	adapter.log.error(url);
	cp.exec(url, function(error, stdout, stderr){
		if(error){
			adapter.log.error("Adapter konnte nicht installiert werden.");
			adapter.log.error(stderr);
			cb(stderr);
			return;
		}
		adapter.log.info(stdout);
		try{
			var package = fs.readFileSync('./adapter/' + name + '/package.json');
			package = JSON.parse(package);
		}catch(e){
			adapter.log.error("Fehler in der package.json von " + name);
			cb(404);
		}

		var dependencies = Object.keys(package.dependencies);
		if(dependencies.length > 0 ){
			adapter.log.debug(name + ": Abhängigkeiten installieren!");
			installDependencies(dependencies, function(status){
				if(status != 200){
					adapter.log.error("Abhängigkeiten konnten nicht installiert werden!");
					return;
				}
				adapter.log.debug(name + ": config umbennen!");
				fs.rename("./adapter/" + name + "/" + name + '.json.example', "./adapter/" + name + "/" + name + '.json', function(err){
					if(err){
						adapter.log.error(err);
						cb(404);
						return;
					}				
					adapter.log.info(stdout);
					adapter.log.debug(name + " installiert!");
					startAdapter(name, function(status){
						cb(status);
					});
				});
			});
		}else{
			if(fs.existsSync("./adapter/" + name + "/" + name + ".json.example")){
				adapter.log.debug(name + ": config umbennen!");
				fs.rename("./adapter/" + name + "/" + name + '.json.example', "./adapter/" + name + "/" + name + '.json', function(err){
					if(err){
						adapter.log.error(err);
						cb(404);
						return;
					}				
					adapter.log.info(stdout);
					adapter.log.debug(name + " installiert!");
					startAdapter(name, function(status){
						cb(status);
					});
				});
			}else{
				adapter.log.debug(name + " installiert!");
				startAdapter(name, function(status){
					cb(status);
				});
			}
		}

	});
}

function installDependencies(dependencies, cb){
	async.each(dependencies,
		function(deb, callback){
			cp.exec("npm install " + deb, function(error, stdout, stderr){
				if(error){
					adapter.log.error(error);
				}else{
					callback();
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

function removeAdapter(name, cb) {
	stopAdapter(name, function(){
		cp.exec("rm -r adapter/" + name, function(error, stdout, stderr){
			adapter.log.info(name + " wurde entfernt");
			cb("gelöscht");
		});
	});
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