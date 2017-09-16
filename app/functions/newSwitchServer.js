var request 		=	require('request');

var switchServer = function(data){
	var bla = function(){};
	// bla.switchServer = data;
	bla.prototype.sendTo = function(data, status, callback){
		request.post({
			url:'http://' + data.ip + ':' + data.port + '/switch',
			form: {
				status: status,
				data: data
			}
		},function( err, httpResponse, body){
			if(err){
				log.error("Error! \n SwitchServer ist nicht erreichbar!");
				log.error(err);
			}else{
				if(body !== '200'){
					log.error("Der SwitchServer [" + conf.switchserver[data.switchserver].ip + ':' + conf.switchserver[data.switchserver].port + "] meldet einen Fehler mit dem Adapter: " + action);
					if(callback){
						callback(body);
					}
				}else{
					log.info("Erfolgreich an den SwitchServer gesendet");
					if(callback){
						callback(200);
					}
				}
			}
		});
	}
	return bla;
}

// switchServer.prototype.set = function(data){
// 	this.switchServer = data;
// }

// switchServer.prototype.sentTo = function(data, status, callback){

// };

module.exports = switchServer;