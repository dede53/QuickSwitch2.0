var helper 			= require('../functions/helper.js');
var request 		= require('request');
var conf = {
	'hombot':[
		{
			'ip':'192.168.2.25',
			'port':'6260'
		}
	],
	'requesttime': '1000' // Zeit zwischen den Abfragen in Milisekunden: 10000 = 10 Sekunden; 60000 = 1 Minute; 300000 = 5 Minuten
}
var lastStatus = {};

conf.hombot.forEach(function(bot){
	lastStatus[bot.ip] = {};
});
function getStatus(){
	conf.hombot.forEach(function(bot){
		request.get({
			url:'http://' + bot.ip + ':' + bot.port + '/status.html'
		},function( err, httpResponse, body){
			if(err){
				helper.log.error("Error! \n Hombot (" + lastStatus[bot.ip].nickname + ") ist nicht erreichbar!");
				if(lastStatus[bot.ip].nickname){
					helper.setVariable(lastStatus[bot.ip].nickname, 'nicht erreichbar');
				}
				return;
			}
			var body = body.trim();
			var first = body.search('{');
			var second = body.search('}');
			try{
				var json = JSON.parse(body.slice(first -1, second +1));
			}catch(e){
				helper.log.error("JSON kann nicht geparsed werden!");
				helper.log.error(e);
			}

			// Keine Statusänderung
			if(lastStatus[bot.ip].robotstate == json.robotstate){
				return;
			}

			var status;
			switch(json.robotstate){
				case 'BACKMOVING_INIT':
					var status = 'Auf dem Weg zur Arbeit';
					break;
				case 'WORKING':
					status = 'Arbeitet';
					break;
				case 'HOMING':
					status = 'Auf dem Heimweg';
					break;
				case 'CHARGING':
					status = 'Lädt';
					break;
				case 'DOCKING':
					status = 'Docke an';
					break;
				case 'STANDBY':
					status = 'Standby';
					break;
				case 'PAUSE':
					status = 'Pause';
					break;
				default:
					status = json.robotstate;
					break;
			}
			helper.log.info('Veränderter Status: ' + status);
			lastStatus[bot.ip] = json;

			helper.setVariable(json.nickname, status);			
		});
	});
}
setInterval(getStatus, conf.requesttime);	