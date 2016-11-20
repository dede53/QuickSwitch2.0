		var chartConfig = {
				options:{
					chart: {
						backgroundColor: 'transparent',
						renderTo:"container",
						zoomType:"x"
					},
					navigator: {
						enabled: false,
						adaptToUpdatedData: true,
						series: []
					},
					rangeSelector: {
						enabled: false,
						inputStyle: {
							fontSize: "16px"
						},
			            buttonTheme: {
							style: {
								fontSize: "16px"
							},
						},
						labelStyle: {
							fontSize: "16px"
						},
						buttons: [{
							type: 'hour',
							count: '12',
							text: '12h'
						}, {
							type: 'hour',
							count: '24',
							text: '24h'
						},{
							type: 'all',
							count: 'all',
							text: 'Alle'
						}],
						selected: 2,
            			inputDateFormat: '%e %b %Y',
            			inputEditDateFormat: '%e %b %Y'
					},
					plotOptions: {
						series: {
							marker:{
								enabled: false
							},
			                animation: false
						}
					},
					xAxis: [{
						type: 'datetime',
						labels:{
							rotation: 0,
							style: {
								"color": '#80a3ca',
								"fontSize": "16px"
							}
						},
						dateTimeLabelFormats: {
							second: '%d.%m<br/>%H:%M:%S',
							minute: '%d.%m<br/>%H:%M',
							hour: '%d.%m<br/>%H:%M',
							day: '%d.%m<br/>%H:%M',
							week: '%d.%m.%Y',
							month: '%m.%Y',
							year: '%Y'
						}
					}],
					yAxis: [{
						allowDecimals: true,
						title: {
							text: '',
							style: {
								"color": '#80a3ca',
								"fontSize": "16px"
							}
						},
						labels: {
							format: '{value}',
							style: {
								"color": '#80a3ca',
								"fontSize": "16px"
							}
						},
						plotLines: [/*{
							value: 5,
							color: '#444488',
							dashStyle: 'shortdash',
							width: 2,
							label: {
								text: '5°C'
							}
						}*/]
					},/*
					{
						allowDecimals: true,
						title: {
							text: 'Luftfeuchtigkeit',
							style: {
								"color": '#80a3ca',
								"fontSize": "16px"
							}
						},
						labels: {
							format: '{value}',
							style: {
								"color": '#80a3ca',
								"fontSize": "16px"
							}
						},
						opposite: true
					}*/],

					legend: {
						enabled: true,
						itemStyle: {
							"fontSize": "16px"
						}
					},
					title: {
						text: ''
					},
					credits: {
						enabled: false
					},
					useHighStocks: true
				},
				series: [],
				loading: true
			}
var app = 	angular.module('jsbin',[
				'ui.bootstrap',
				'snap',
				'ngRoute',
				'highcharts-ng',
				'ngMdIcons'
			]);
app.factory('socket', function ($rootScope) {
	var socket = io.connect();
	return {
		on: function (eventName, callback) {
			socket.on(eventName, function () {  
				var args = arguments;
				$rootScope.$apply(function () {
					callback.apply(socket, args);
				});
			});
		},
		emit: function (eventName, data, callback) {
			socket.emit(eventName, data, function () {
				var args = arguments;
				$rootScope.$apply(function () {
					if (callback) {
						callback.apply(socket, args);
					}
				});
			})
		}
	};
});
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/home', {
		templateUrl: './app/home/index.html'
	}).
	when('/devices', {
		templateUrl: './app/devices/index.html',
		controller: 'devicesController'
	}).
	when('/temperature', {
		templateUrl: './app/temperature/index.html',
		controller: 'temperatureController'
	}).
	when('/timer', {
		templateUrl: './app/timer/index.html',
		controller: 'timerController'
	}).
	otherwise({
		redirectTo: '/home'
	});
}]);
app.controller('favoritmenucontroller', function($scope){

});

app.controller('appController', function($scope, socket, $rootScope, $location){
	$scope.snapOptions = {
		disable: 'none',
		addBodyClasses: true,
		hyperextensible: true,
		resistance: 0.5,
		flickThreshold: 50,
		transitionSpeed: 0.3,
		easing: 'ease',
		maxPosition: 266,
		minPosition: -300,
		tapToClose: true,
		touchToDrag: true,
		slideIntent: 40,
		minDragDistance: 5
	}
	var oldUser = "system";
	var newUser;
	// Setup the ready route, join room and broadcast to room.
	$scope.storedUser = getCookie("username");
	$scope.list = [];
	$scope.alerts = {};
	$scope.countdowns = {};
	
	if ($scope.storedUser != "") {
		$rootScope.activeUser = JSON.parse($scope.storedUser);
	}else{
		$rootScope.activeUser = {name:"system",favoritDevices: [], variables:[], admin:true};
	}
	$scope.bla = $rootScope.activeUser;

	socket.emit('room:join', $rootScope.activeUser);
	socket.emit('user:get');
	$scope.setUser = function(user){
		console.log("leave:" + $rootScope.activeUser.name);
		socket.emit('room:leave', $rootScope.activeUser);
		
		$rootScope.activeUser = user;
		setCookie("username", JSON.stringify(user), 365);

		console.log("join:" + $rootScope.activeUser.name);
		socket.emit('room:join', user);
	}

	$scope.add = function(type, data){
		socket.emit(type + ':add', {user:$rootScope.activeUser, add: data});	
	}
	$scope.addAll = function(type, data){
		socket.emit(type + ':addAll', {user:$rootScope.activeUser, add:data});	
	}
	$scope.remove = function(type, data){
		socket.emit(type + ':remove', {user:$rootScope.activeUser, id: data.id});	
	}
	$scope.switch = function(type, data){
		socket.emit(type + ':switch', {user:$rootScope.activeUser, switch: data});	
	}
	$scope.switchAll = function(type, data){
		socket.emit(type + ':switchAll', {user:$rootScope.activeUser, switchAll: data});	
	}
	socket.on('change', function(data){
		// console.log(data);
		switch(data.type){
			case "add":
				$scope[data.masterType][data.add.id] = data.add;
				break;
			case "remove":
				delete $scope[data.masterType][data.remove];
				break;
			case "get":
				$scope[data.masterType] = data.get;
				break;
			case "edit":
				if($scope[data.masterType][data.edit.id]){
					$scope[data.masterType][data.edit.id] = data.edit;
				}
				break;
			case "switch":
				for(var i = 0; i < $scope.favoritDevices.length; i++){
					if($scope.favoritDevices[i].deviceid == data.switch.device.deviceid){
						$scope.favoritDevices[i].status = parseInt(data.switch.status);
					}
				}
				if($scope.devices){
					$scope.devices[data.switch.device.Raum].roomdevices[data.switch.device.deviceid].status = parseInt(data.switch.status);
				}
				break;
			case "chart":
				if(data.chart == false){
					$scope[data.masterType] = false;	
				}else{
					$scope[data.masterType] = chartConfig;
					$scope[data.masterType].series = data.chart;
					$scope[data.masterType].loading = false;
				}
				break;
		}
	});
	$scope.favorit = true;
	$scope.showmenu=false;
	$scope.toggleMenu = function(data){
		$scope.showmenu=!($scope.showmenu);
		if(data != ""){
			$location.url(data);
		}
	}
	$scope.abort = function(data) {
		$location.url(data);
	};
});