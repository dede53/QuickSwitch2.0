var mysql			=	require('mysql');
var conf 			=	require('./../../config.json');
var helper 			=	require('./helper.js');
var pool			=	mysql.createPool({
	connectionLimit	:	100,
	host			:	conf.mysql.host,
	user			:	conf.mysql.user,
	password		:	conf.mysql.password,
	database		:	'SmartHome',
	debug			:	false,
	charset			:	'utf8mb4_unicode_ci'
});

module.exports = {
	all : function(query, callback) {
		pool.getConnection(function(err,connection){
			if(err){
				switch(err.code){
					case "ER_ACCESS_DENIED_ERROR":
						console.log("Zugriff auf die Datenbank verweigert! Passwort und Benutzername richtig geschrieben?");
						break;
					case "ECONNREFUSED":
						console.log("Zugriff auf die Datenbank verweigert! Passwort und Benutzername richtig geschrieben?");
						// break;
					default:
						// console.log(err);
						throw(err);
						break;
				}
				callback(err, null);
				return;
			}
			connection.query(query, function(err,rows){
				connection.release();
				if(err) {
					console.log(err);
					// throw(err);
					// return;
				}
				callback(err, rows);
			});
		});
	},
	run: function(query){
		pool.getConnection(function(err,connection){
			if(err){
				switch(err.code){
					case "ER_ACCESS_DENIED_ERROR":
						console.log("Zugriff auf die Datenbank verweigert! Passwort und Benutzername richtig geschrieben?");
						break;
					case "ECONNREFUSED":
						console.log("Zugriff auf die Datenbank verweigert! Passwort und Benutzername richtig geschrieben?");
						// break;
					default:
						throw(err);
						console.log(err);
						break;
				}
				callback(err, null);
				return;
			}

			connection.query(query, function(err,rows){
				if(err){
						throw(err);
					console.log(err);
					return;
				}
				connection.release();
			});
		});
	},
	each : function(query, callback) {
		pool.getConnection(function(err,connection){
			helper.log.debug('connected as id ' + connection.threadId);
			if(err){
				switch(err.code){
					case "ER_ACCESS_DENIED_ERROR":
						console.log("Zugriff auf die Datenbank verweigert! Passwort und Benutzername richtig geschrieben?");
						break;
					case "ECONNREFUSED":
						console.log("Zugriff auf die Datenbank verweigert! Passwort und Benutzername richtig geschrieben?");
						// break;
					default:
						throw(err);
						console.log(err);
						break;
				}
				callback(err, null);
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
	helper.log.error(err);
	return;
}