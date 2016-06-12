var request     = require('request');

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
	request({
		url: msg,
		qs: '',
		method: 'GET'
	}, function(error, response, body){
		if(error) {
			console.log(error);
		} else {
			if(response.statusCode == 200){
				console.log( "Erfolgreich die URL aufgerufen" );
			}else{
				console.log( "Die URL meldet keinen gültigen status:" + response.statusCode );
			}
		}
	});
}