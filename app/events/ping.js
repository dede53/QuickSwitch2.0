var ping 			= require('ping');
var helper 			= require('./../functions/helper.js');


var hosts 			= [
	{
		"ip":'192.168.2.23',
		"name": 'Daniel-Home'
	}, 
	{
		'ip':'192.168.2.190',
		'name': ' Daniel-Tablet'
	}

];
var status 			= {};
var minTime 		= 300;// 300

hosts.forEach(function(host){
	status[host.ip] = {};
	status[host.ip].status = false;
	status[host.ip].ip = host.ip;
	status[host.ip].name = host.name;
	status[host.ip].lastChange = Math.round(new Date().getTime()/1000);
});


function checkHosts (){
	hosts.forEach(function (host) {
		ping.sys.probe(host.ip, function(isAlive){
			helper.log.debug('Prüfe ip ' + host.ip + ' auf anwesenheit.');
			if(status[host.ip].status == isAlive){
				status[host.ip].lastChange 	= Math.round(new Date().getTime()/1000);
				helper.log.debug('	Ergebnis: Kein veränderter Status! Das Gerät ist immernoch ' + status[host.ip].status);
				return;
			}
			if(isAlive == true){
				helper.log.debug('	Ergebnis: anwesend');
				status[host.ip].lastChange 	= Math.round(new Date().getTime()/1000);
				status[host.ip].status 		= isAlive;

				helper.setVariable(host.name, status[host.ip].status);
				return;
			}
			
			helper.log.debug('	Ergebnis: abwesend', "data");
			var time = Math.round(new Date().getTime()/1000) - status[host.ip].lastChange;
			if(time >= minTime){
				status[host.ip].status 		= isAlive;
				status[host.ip].lastChange 	= Math.round(new Date().getTime()/1000);
				helper.setVariable(host.name, status[host.ip].status);
				helper.log.info('	Gerät (' + host.ip + ') ist länger als ' + minTime + ' Sekunden abwesend. Status wurde geändert.');
			}else{
				helper.log.info('	Gerät (' + host.ip + ') noch keine ' + minTime + ' Sekunden abwesend! Erst ' + time + ' Sekunden sind verstrichen.');
			}
		});
	});
}

setInterval(checkHosts, 10000);
