/*
var bla = [
	{
		'name':'Sensoren speichern',
		'variables':{
			'Daniel-Home':[{
				"name":"Daniel-Home",
				"status":"true",
				"mode":"match"
			}]
		},
		'conditions':{
			'time': [
				{
					"start": {
						"time": "06:44",
						"offset": {
							"number": "",
							"unit": ""
						}
					},
					"stop": {
						"time": "sunrise",
						"offset": {
							"number": "120",
							"unit": "+"
						}
					}
				}
			],
			'range': [
				{
					'start':{
						'time':'18:30'
					},
					'stop':{
						'time':'20:00'
					}
				}
			],
			'weekdays':[
				{
					"0":1,
					"1":1,
					"2":1,
					"3":1,
					"4":1,
					"5":1,
					"6":1
				}
			],
			'variables':[
				{
					'name':'Daniel',
					'value':'12',
					"condition":"größergleich"
				}
			]
		},
		'actions':{
			'device':[
				{
					'name':'Schreibtisch',
					'id':'1',
				}
			],
			'groups':[
				{
					'name':'Chillen',
					'id':1
				}
			],
			'rooms':[
				{
					'name':'...'
				}
			],
			"alerts":[
				{
					'name':'...'
				}
			]
		},
	}
];
*/
var conf					= require('./../../config.json');
var db						= require('./database.js');
var helper					= require('./helper.js');
var fs						= require('fs');
var async					= require("async");
var request					= require('request');
var later 					= require('later');

var storedTimes 			= {};

function deleteTimer(id, callback){
	var query = "DELETE FROM timer WHERE id = '" + id + "';";
	db.all(query, function(err, data){
		callback(err, data);
	});
}

function getTimer(id, callback){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer WHERE id = " + id + ";";
	db.all(query, function(err, data){
		if(err){
			helper.log.pure(err);
		}else if(data == ""){
			helper.log.error("Keinen Timer mit der ID: " + id);
		}else{
			try{
				if(data[0].variables != ""){
					data[0].variables = JSON.parse(data[0].variables.trim());
				}else{
					data[0].variables = false;
				}
				if(data[0].conditions != ""){
					data[0].conditions = JSON.parse(data[0].conditions.trim());
				}else{
					data[0].conditions = false;
				}
				if(data[0].actions){
					data[0].actions = JSON.parse(data[0].actions.trim());
				}else{
					data[0].actions = false;
				}
				callback(data[0]);
			}catch(e){
				helper.log.pure("Fehler im JSON des Timers!");
				helper.log.pure(data[0]);
				helper.log.pure(e);
				return;
			};
		}
	});
}

var getUserTimers = function(user, callback){
	var query = "SELECT id, name, active, variables, conditions, actions, user, lastexec FROM timer WHERE user = '" + user + "';";
	db.all(query, function(err, data){
		if(err){
			callback(404);
			helper.log.error(err);
		}else{
			var timers = {};
			for(var i = 0; i< data.length; i++){
				try{
					if(data[i].variables != ""){
						data[i].variables = JSON.parse(data[i].variables.trim());
					}else{
						data[i].variables = false;
					}
					if(data[i].conditions != ""){
						data[i].conditions = JSON.parse(data[i].conditions.trim());
					}else{
						data[i].conditions = false;
					}
					if(data[i].actions){
						data[i].actions = JSON.parse(data[i].actions.trim());
					}else{
						data[i].actions = false;
					}
					timers[data[i].id] = data[i];
				}catch(e){
					helper.log.error("Fehler im JSON bei diesem Timer!");
					helper.log.pure(data[i]);
				}
			}
			callback(timers);
		}
	});
}

module.exports = {
	getUserTimers: getUserTimers,
	getTimer: getTimer,
	saveTimer: function(data, callback){
		if(!data.lastexec){
			data.lastexec = new Date().getTime();
		}
		// helper.log.pure(data);
		if(data.id){
			var query = "UPDATE timer SET name = '" + data.name + "', variables = '" + JSON.stringify(data.variables) + "', conditions = '" + JSON.stringify(data.conditions) + "', actions = '" + JSON.stringify(data.actions) + "', lastexec = '" + data.lastexec + "' WHERE id = '" + data.id + "';";
			db.run(query);
			getTimer(data.id, function(data){
				callback( undefined, data);
			});
		}else{
			var query = "INSERT INTO timer (name, variables, conditions, actions, user, lastexec) VALUES ('" + data.name + "', '" + JSON.stringify(data.variables) + "', '" + JSON.stringify(data.conditions) + "', '" + JSON.stringify(data.actions) + "','" + data.user + "','" + data.lastexec + "');";
			// db.run(query);
			db.all(query, function(err, data){
				if(err){
					callback(err, undefined);
				}else{
					getTimer(data.insertId, function(data){
						console.log(data);
						callback( undefined, data);
					});
				}
			});
		}
	},
	deleteTimer: deleteTimer,
	switchTimer: function(data, callback){
		var query = "UPDATE timer SET active='" + data.active + "' WHERE id ='" + data.id + "';"
		db.run(query);
		callback(200);
	},
	switchActions: function(){}
}