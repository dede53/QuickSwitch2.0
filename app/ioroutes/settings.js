var helper 	= require('../functions/helper.js');
var fs 		= require('fs');

module.exports = function(app, db){
	app.io.route('settings', function(req, res){
		fs.readFile('./config.json', 'utf8', function(err, settings){
			if(!err){
				var settings = JSON.parse(settings);
				req.io.emit('settings', settings);
			}
		});
	});
	app.io.route('saveSettings', function(req, res){
		fs.writeFile('./config.json',JSON.stringify(req.data), 'utf8', function(err){
			if(err){
				console.log(err);
			}
		});
	});
}