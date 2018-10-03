var mariadb			=	require('mariadb');
var conf 			=	require('./../../config.json');
var helper 			=	require('./helper.js');

var pool			=	mariadb.createPool({
	connectionLimit	:	100,
	host			:	conf.mysql.host,
	user			:	conf.mysql.user,
	password		:	conf.mysql.password,
	database		:	'SmartHome',
	charset			:	'utf8mb4_unicode_ci'
});

module.exports = {
	all: function(query, callback) {
		pool.getConnection().then(conn => {
			conn.query(query).then((rows) => {
				helper.log.error(rows);
				if(rows['meta']){
					delete(rows['meta']);
				}
				callback(undefined, rows);
			})
			.then((res) => {
				// callback(undefined, res);
				// console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
				conn.end();
			})
			.catch(err => {
				//handle error
				helper.log.error(err);
				// callback(err, null);
				conn.end();
			})

		}).catch(err => {
			//not connected
			callback(err, null);
		});
	},
	run: function(query){
		pool.getConnection().then(conn => {
			conn.query(query).then((rows) => {
				helper.log.error("Run!");
				// success
			})
			.then((res) => {
				callback(undefined, res);
				console.log(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
				conn.end();
			})
			.catch(err => {
				//handle error
				callback(err, null);
				conn.end();
			})

		}).catch(err => {
			//not connected
			callback(err, null);
		});
	},
	each : function(query, callback) {
		pool.getConnection().then(conn => {
			conn.query(query).then((rows) => {
				helper.log.error(rows);
				rows.forEach(function(row){
					callback(err, row);
				});
			})
			.then((res) => {
				helper.log.error(res);
				callback(undefined, res);
				// helper.log.err(res); // { affectedRows: 1, insertId: 1, warningStatus: 0 }
				conn.end();
			})
			.catch(err => {
				//handle error
				helper.log.error(err);
				callback(err, null);
				conn.end();
			});
		}).catch(err => {
			//not connected
			callback(err, null);
		});
	}
}