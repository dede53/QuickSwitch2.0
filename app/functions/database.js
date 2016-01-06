var mysql			=	require('mysql');
var conf 			=	require('./../../config.json');

var pool      =    mysql.createPool({
	connectionLimit : 100,
	host     : conf.mysql.host,
	user     : conf.mysql.user,
	password : conf.mysql.password,
	database : 'SmartHome',
	debug    :  false
});

require('events').EventEmitter.prototype._maxListeners = 100;


module.exports = {
	all : function(query, callback) {
		pool.getConnection(function(err,connection){
			if (err) {
				console.log({"code" : 100, "status" : "Error in connection database"});
				console.log(err);
				callback(err);
				connection.release();
				// return;
			}

			// console.log('connected as id ' + connection.threadId);

			connection.query(query, function(err,rows){
				connection.release();
				if(!err) {
					callback(err, rows);
				}else{
					console.log(err);
				}
			});

			connection.on('error', function(err) {
				console.log({"code" : 100, "status" : "Error in connection database"});
				callback(err);
				// return;
			});
		});
	},
	run: function(query){
		pool.getConnection(function(err,connection){
			if (err) {
				connection.release();
				console.log({"code" : 100, "status" : "Error in connection database"});
				return;
			}

			console.log('connected as id ' + connection.threadId);

			connection.query(query, function(err,rows){
				connection.release();
			});

			connection.on('error', function(err) {
				console.log({"code" : 100, "status" : "Error in connection database"});
				return;
			});
		});
	},
	each : function(query, callback) {
		pool.getConnection(function(err,connection){
			if (err) {
				connection.release();
				console.log({"code" : 100, "status" : "Error in connection database"});
				callback(err);
				// return;
			}

			console.log('connected as id ' + connection.threadId);

			connection.query(query, function(err,rows){
				connection.release();
				if(!err) {
					rows.forEach(function(row){
						callback(err, row);
					});
				}else{
					console.log(err);
				}
			});

			connection.on('error', function(err) {
				console.log({"code" : 100, "status" : "Error in connection database"});
				callback(err);
				// return;
			});
		});
	}
}