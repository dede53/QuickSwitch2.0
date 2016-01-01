var helper = require('../functions/helper.js');

module.exports = function(app, db){
	var phoneFunctions = require('../functions/phone.js');
	
	app.io.route('phonelist', function(req, res){
		phoneFunctions.getPhonelist(req, res, function(data){
			req.io.emit('phonelist', data);
		});
	});
}