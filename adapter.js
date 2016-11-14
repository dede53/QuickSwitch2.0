var fs 						=	require('fs');
var cp 						=	require('child_process');
var later 					= 	require('later');
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
		"port": 4042
	}
});

app.use(bodyParser.json());									// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));			// for parsing application/x-www-form-urlencoded


app.post('/switch', function (req, res) {
	action(req.body.status, req.body.data);
	res.json(200);
});

fs.readdir('./adapter', function(err, data){
	if(err){
		adapter.log.error(err);
	}else{
		adapter.log.info("Installierte Eventlistener:");
		data.forEach(function(name){
			if(name.startsWith("~")){
				return;
			}
				var name = name.toLowerCase();
				var path = './adapter/' + name + "/index.js";
				
				adapter.log.info('	' + name);
				var debugFile = __dirname + '/log/debug-' + name + '.log';

				try{
					log_file[name]			=	fs.createWriteStream( debugFile, {flags : 'w', encoding: 'utf8'});
					plugins[name] = cp.fork( path );
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
		adapter.log.error(err);
		adapter.log.error("Adapter zum schalten nicht installiert: " + data.protocol);
	}
}
try{
	app.listen(adapter.settings.port);
	adapter.log.info("SwitchServer running at http://127.0.0.1:" + adapter.settings.port);
}catch(e){
	app.listen(adapter.settings.port + 1);
	adapter.log.info("SwitchServer running at http://127.0.0.1:" + adapter.settings.port + " Given port is used.");
}
	