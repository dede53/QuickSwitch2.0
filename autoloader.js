var fork 				= require('child_process').fork;
var express 			= require('express');
var bodyParser 			= require('body-parser');
var fs 					= require('fs');
var app 				= express();

app.use(bodyParser.json());									// for parsing application/json
app.use(bodyParser.urlencoded({ extended: true }));			// for parsing application/x-www-form-urlencoded

app.post('/switch', function (req, res) {
	// console.log(req.body);
	action(req.body.status, req.body.data);
	res.json(200);
});

/***************************************************************

{
	"protocol": 		"switch | set",
	"name": 			"Devicename",
	"buttonLabelOn": 	"ButtonTextAn",
	"buttonLabelOff": 	"ButtonTextAus",
	"CodeOn": 			"Einschaltcode",
	"CodeOff": 			"Ausschaltcode",
	"room": 			"roomid",
	"switchserver": 	"switchserverid"
}
{
	"protocol": 		"send",
	"title": 			"Titel",
	"message": 			"Nachricht",
	"receiver": 		"pushbullet iden"
}
***************************************************************/

var dir = fs.readdirSync( './actions');

var plugins 		= {};
var log_file 		= {};

console.log("Installierte Adapter:");
dir.forEach(function(file){
	if(file != "autoloader.js" && file != "log"){

		var splitedfile = file.split(".");
		var filename = splitedfile[0];
		var debugFile = __dirname + '/log/debug-' + filename + '.log';
		console.log("	" + filename);
		log_file[filename]			=	fs.createWriteStream( debugFile, {flags : 'w'});	

		plugins[filename] = fork( './actions/' + file );
		plugins[filename].on('message', function(response) {
			log_file[filename].write(response.toString());
		});
	}
});

function action(status, data){
	var transData = {
		status: status,
		data: data
	}
	try{
		plugins[data.protocol].send(transData);
	}catch(err){
		console.log("Adapter zum schalten nicht installiert: " + data.protocol);
	}
}

app.listen(4041);
console.log("SwitchServer running at http://127.0.0.1:4041");