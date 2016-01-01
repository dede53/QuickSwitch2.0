var conf 			= require('./../../config.json');
var helper 			= require('./helper.js');

module.exports = {
	getPhonelist: function(req,res,callback){
		helper.fritzboxConnect(function(fritz, sid){
			fritz.getPhoneList(sid,function(listinfos){
				var call = new Array;
				for(var i = 0; i<=10; i++){
					var duration = listinfos[i].duration.split(":", 2);
					if(duration[0] == 0){
						listinfos[i].duration = undefined; 
					}else{
						listinfos[i].duration = duration[0];
					}
					listinfos[i].durationminutes = duration[1];
					listinfos[i].date = helper.mdyToDate(listinfos[i].date + "." + listinfos[i].time);
					call.push(listinfos[i]);
				}
				callback(call);
			});
		});
	}
}