var app = angular.module('BlankApp', ['ngMaterial', 'ngMessages', 'ngRoute', 'material.svgAssetsCache']);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/home', {
		templateUrl: './app/home/index.html'
	}).
	// when('/devices', {
	// 	templateUrl: './app/devices/index.html',
	// 	controller: 'devicesController'
	// }).
	// when('/temperature', {
	// 	templateUrl: './app/temperature/index.html',
	// 	controller: 'temperatureController'
	// }).
	// when('/switchHistory', {
	// 	templateUrl: './app/switchHistory/index.html',
	// 	controller: 'switchHistoryController'
	// }).
	// when('/timer', {
	// 	templateUrl: './app/timer/index.html',
	// 	controller: 'timerController'
	// }).
	// when('/editTimer/:id', {
	// 	templateUrl: './app/timer/editTimer.html',
	// 	controller: 'timerController'
	// }).
	otherwise({
		redirectTo: '/home'
	});
}]);
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
app.controller('AppCtrl', function ($scope, $timeout, $mdSidenav, $log, socket, $rootScope) {
	$scope.toggleLeft = buildToggler('left');

	function buildToggler(navID) {
		return function() {
		// Component lookup should always be available since we are not using `ng-if`
			$mdSidenav(navID).toggle().then(function () {
				$log.debug("toggle " + navID + " is done");
			});
		}
	}
	$scope.progress = true;
	$scope.toggleProgress = function(){
		$scope.progress =  !$scope.progress;
		$timeout(function(){
			$scope.progress = false;
		}, 3000);
	}

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
	
	socket.on('connected', function(){
		$scope.progress = false;
	});
	socket.on('disconnect', function(){
		$scope.progress = true;
		socket.socket.connect();
		socket.emit('room:join', $rootScope.activeUser);
	});
	socket.on('change', function(data){
		$scope.progress = false;
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
					$scope[data.masterType] = new chart();
					$scope[data.masterType].setSeries(data.chart);
					$scope[data.masterType].setLoading(false);
				}
				break;
		}
	});
});
