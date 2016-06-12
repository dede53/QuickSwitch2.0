var mysql			=	require('mysql');
var conf 			=	require('./../../config.json');
var helper 			= require('./helper.js');

var pool      =    mysql.createPool({
	connectionLimit : 100,
	host     : conf.mysql.host,
	user     : conf.mysql.user,
	password : conf.mysql.password,
	database : 'SmartHome',
	debug    :  false
});


/*
require('events').EventEmitter.prototype._maxListeners = 100;
var redis 			= require("redis");
var client 			= redis.createClient();
var options = {
	limit: 10
};
*/
// o.4P8ZrHsfYzdtY0vLEEqE8aBKIB9PiIj6

/*
client.on("error", function (err) {
    console.log("Error " + err);
});
module.exports = client;
*/
module.exports = {
	//client: client,
	all : function(query, callback) {
		pool.getConnection(function(err,connection){
			// helper.log.debug(query);
			// helper.log.debug('connected as id ' + connection.threadId);
			if (err) {
				helper.log.error({"code" : 100, "status" : "Error in connection database"});
				helper.log.error(err);
				callback(err);
				connection.release();
				// return;
			}else{
				connection.query(query, function(err,rows){
					if(err) {
						helper.log.error({"code" : 100, "status" : "Error in connection database"});
						helper.log.error(err);
					}else{

						callback(err, rows);
						connection.release();
					}
				});
/*
				connection.once('error', function(err) {
					helper.log.error({"code" : 100, "status" : "Error in connection database"});
					callback(err);
					connection.release();
					// return;
				});
*/
			}
		});
	},
	run: function(query){
		pool.getConnection(function(err,connection){
			// helper.log.debug(query);
			// helper.log.debug('connected as id ' + connection.threadId);
			if (err) {
				connection.release();
				helper.log.error({"code" : 100, "status" : "Error in connection database"});
				return;
			}


			connection.query(query, function(err,rows){
				if(err){
					helper.log.error(err);
					connection.release();
					return;
				}
				connection.release();
			});
/*
			connection.on('error', function(err) {
				helper.log.error({"code" : 100, "status" : "Error in connection database"});
				connection.release();
				return;
			});
*/
		});
	},
	each : function(query, callback) {
		pool.getConnection(function(err,connection){
			helper.log.debug('connected as id ' + connection.threadId);
			if (err) {
				connection.release();
				helper.log.error({"code" : 100, "status" : "Error in connection database"});
				callback(err);
				// return;
			}


			connection.query(query, function(err,rows){
				connection.release();
				if(!err) {
					rows.forEach(function(row){
						callback(err, row);
					});
				}else{
					helper.log.error(err);
				}
			});

			connection.on('error', function(err) {
				helper.log.error({"code" : 100, "status" : "Error in connection database"});
				callback(err);
				// return;
			});
		});
	}
}