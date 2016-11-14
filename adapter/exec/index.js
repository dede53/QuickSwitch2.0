var child_process 			= require('child_process');
var adapter 				= require('../../adapter-lib.js');
var exec 					= new adapter({
	"name": "Url",
	"loglevel": 3,
	"description": "Führt http-requests aus.",
	"settingsFile": ""
});

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	sendEXEC(status, data);
});


function sendEXEC(status, data){
	if(status == 1){
		var execString = data.CodeOn;
	}else{
		var execString = data.CodeOff;
	}
	child_process.exec(execString, function(error, stdout, stderr){
		if(error){
			exec.log.error(error);
		}else{
			exec.log.debug(stdout);
			exec.log.debug("Executing Done");
		}
	});
}