var mysql			=	require('mysql');
var conf 			=	require('./../../config.json');
var helper 			=	require('./helper.js');
var pool      		=	mysql.createPool({
	connectionLimit : 100,
	host     : conf.mysql.host,
	user     : conf.mysql.user,
	password : conf.mysql.password,
	database : 'SmartHome',
	debug    :  false
});

module.exports = {
	//client: client,
	all : function(query, callback) {
		pool.getConnection(function(err,connection){
			if(err){
				console.log(err);
				callback(err, null);
				return;
			}
			connection.query(query, function(err,rows){
				connection.release();
				if(err) {
					console.log(query + ":" + err);
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
		});
	},
	run: function(query){
		pool.getConnection(function(err,connection){
			if (err) {
				console.log(err);
				return;
			}


			connection.query(query, function(err,rows){
				if(err){
					console.log(err);
					return;
				}
				connection.release();
			});

			// connection.on('error', function(err) {
			// 	console.log(err);
			// 	return;
			// });
		});
	},
	each : function(query, callback) {
		pool.getConnection(function(err,connection){
			helper.log.debug('connected as id ' + connection.threadId);
			if (err){
				console.log(err);
				callback(err);
				return;
			}


			connection.query(query, function(err,rows){
				if(err){
					console.log(err);
					return;
				}
				connection.release();
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
}