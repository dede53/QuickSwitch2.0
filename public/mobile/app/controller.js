var app = 	angular.module('jsbin',[
				'ui.bootstrap',
				'ngRoute',
				'highcharts-ng',
				'ngMdIcons',
				'snap'
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
		},
		socket: socket.socket
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
	$rootScope.chatMessages = {};
	
	if ($scope.storedUser != "") {
		$rootScope.activeUser = JSON.parse($scope.storedUser);
	}else{
		$rootScope.activeUser = {name:"system",favoritDevices: [], variables:[], admin:true};
	}
	$scope.bla = $rootScope.activeUser;

	socket.emit('room:join', $rootScope.activeUser);
	socket.socket.on("connect", function(data){
		socket.emit('room:join', $rootScope.activeUser);
	})
	socket.emit('users:get');
	$scope.setUser = function(user){
		console.log("leave:" + $rootScope.activeUser.name);
		socket.emit('room:leave', $rootScope.activeUser);
		
		$rootScope.activeUser = user;
		$scope.alerts = {};
		setCookie("username", JSON.stringify(user), 365);

		console.log("join:" + $rootScope.activeUser.name);
		socket.emit('room:join', user);
		socket.emit('variables:chart', {user: user.id, hours: user.chartHour});
	}

	$scope.add = function(type, data){
		socket.emit(type + ':add', {user:$rootScope.activeUser, add: data});	
	}
	$scope.addAll = function(type, data){
		socket.emit(type + ':addAll', {user:$rootScope.activeUser, add:data});
	}
	$scope.removeAll = function(type, data){
		socket.emit(type + ':removeAll', {user:$rootScope.activeUser, remove:data});
	}
	$scope.remove = function(type, data){
		socket.emit(type + ':remove', {user:$rootScope.activeUser, remove: data});
	}
	$scope.switch = function(type, data){
		socket.emit(type + ':switch', {user:$rootScope.activeUser, switch: data});	
	}
	$scope.switchAll = function(type, data){
		socket.emit(type + ':switchAll', {user:$rootScope.activeUser, switchAll: data});	
	}
	$scope.refresh = function(){
		socket.socket.connect();
		socket.emit('room:join', $rootScope.activeUser);
	}
	socket.on('change', function(data){
		console.log(data);
		switch(data.type){
			case "push":
				if ($rootScope[data.masterType] == undefined){
					$rootScope[data.masterType] = [];
				}
				$rootScope[data.masterType].push(data.push);
				break;
			case "add":
				$rootScope[data.masterType][data.add.id] = data.add;
				break;
			case "remove":
				delete $rootScope[data.masterType][data.remove];
				break;
			case "get":
				$rootScope[data.masterType] = data.get;
				break;
			case "edit":
				if($rootScope[data.masterType] && $rootScope[data.masterType][data.edit.id]){
					$rootScope[data.masterType][data.edit.id] = data.edit;
				}
				break;
			case "switch":
				for(var i = 0; i < $rootScope.favoritDevices.length; i++){
					if($rootScope.favoritDevices[i].deviceid == data.switch.device.deviceid){
						$rootScope.favoritDevices[i].status = parseFloat(data.switch.status);
					}
				}
				if($rootScope.devices){
					$rootScope.devices[data.switch.device.Raum].roomdevices[data.switch.device.deviceid].status = parseFloat(data.switch.status);
				}
				break;
		}
		if(data.masterType == "variables"){
				if($rootScope.favoritVariables[data.edit.id]){
					$rootScope.favoritVariables[data.edit.id] = data.edit;
				}
		}
	});
	$scope.$watch('users', function(newValue, oldValue){
		if(newValue !== undefined){
			newValue.forEach(function(user){
				if(user.name == $scope.activeUser.name){
					$scope.setUser(user);
				}
			});
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