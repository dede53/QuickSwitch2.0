var request     				= require('request');
var adapter 					= require('../../adapter-lib.js');

var url 						= new adapter({
	"name": "Url",
	"loglevel": 3,
	"description": "Führt http-requests aus.",
	"settingsFile": ""
});

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	sendURL(status, data);
});

function sendURL(status, data){
	if(status == 1){
		var msg = data.CodeOn;
	}else{
		var msg = data.CodeOff;
	}
	url.log.info(msg);
	request({
		url: msg,
		qs: '',
		method: 'GET'
	}, function(error, response, body){
		if(error) {
			url.log.error(error);
		} else {
			if(response.statusCode == 200){
				url.log.debug( "Erfolgreich die URL aufgerufen" );
			}else{
				url.log.error( "Die URL meldet keinen gültigen status:" + response.statusCode );
			}
		}
	});
}