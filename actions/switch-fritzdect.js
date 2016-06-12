var fritz       = require('smartfritz');

process.on('message', function(data) {
	var status = data.status;
	var data = data.data;
	fritzdect(status, data);
});

function fritzdect(status, data){
	var moreParam = { url: conf.fritzbox.ip };
	// fritz.getSessionID("user", "password", function(sid){
	fritz.getSessionID(conf.fritzbox.user, conf.fritzbox.password, function(sid){
		console.log(sid);
		if(status == 1){
			fritz.setSwitchOn(sid, data.CodeOn, function(sid){
				console.log(sid);
			});
		}else{
			fritz.setSwitchOff(sid, data.CodeOn, function(sid){
				console.log(sid);
			});
		}

	}, moreParam);
}