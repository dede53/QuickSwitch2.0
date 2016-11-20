var mysql			=	require('mysql');
var conf 			=	require('./../../config.json');
<<<<<<< HEAD
var helper 			=	require('./helper.js');
var pool      		=	mysql.createPool({
=======
var helper 			= require('./helper.js');

var pool      =    mysql.createPool({
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	connectionLimit : 100,
	host     : conf.mysql.host,
	user     : conf.mysql.user,
	password : conf.mysql.password,
	database : 'SmartHome',
	debug    :  false
});

<<<<<<< HEAD
=======

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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
module.exports = {
	//client: client,
	all : function(query, callback) {
		pool.getConnection(function(err,connection){
<<<<<<< HEAD
			if(err){
				console.log(err);
				connection.release();
				callback(err, null);
				return;
			}
			connection.query(query, function(err,rows){
				connection.release();
				if(err) {
					console.log(err);
					callback(err, rows);
					return;
				}
				callback(err, rows);
			});				
			
			// if (err) {
			// 	callback(err);
			// }else{
			// 	connection.query(query, function(err,rows){
			// 		if(err) {
			// 			helper.log.error({"code" : 100, "status" : "Error in connection database"});
			// 			helper.log.error(err);
			// 		}else{
			// 			callback(err, rows);
			// 			connection.release();
			// 		}
			// 	});
			// }
=======
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		});
	},
	run: function(query){
		pool.getConnection(function(err,connection){
<<<<<<< HEAD
			if (err) {
				console.log(err);
				connection.release();
=======
			// helper.log.debug(query);
			// helper.log.debug('connected as id ' + connection.threadId);
			if (err) {
				connection.release();
				helper.log.error({"code" : 100, "status" : "Error in connection database"});
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
				return;
			}


			connection.query(query, function(err,rows){
<<<<<<< HEAD
				connection.release();
				if(err){
					console.log(err);
					return;
				}
			});

			// connection.on('error', function(err) {
			// 	console.log(err);
			// 	return;
			// });

=======
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		});
	},
	each : function(query, callback) {
		pool.getConnection(function(err,connection){
			helper.log.debug('connected as id ' + connection.threadId);
			if (err) {
<<<<<<< HEAD
				console.log(err);
				callback(err);
				return;
=======
				connection.release();
				helper.log.error({"code" : 100, "status" : "Error in connection database"});
				callback(err);
				// return;
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
			}


			connection.query(query, function(err,rows){
				connection.release();
<<<<<<< HEAD
				
				if(err){
					console.log(err);
					return;
				}
				connection.removeEventListener('error', errorHandler);
				rows.forEach(function(row){
					callback(err, row);
				});
			});

			connection.on('error', errorHandler);
		});
	}
}

function errorHandler(err){
	helper.log.error({"code" : 100, "status" : "Error in connection database"});
	callback(err);
	return;
=======
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
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
}