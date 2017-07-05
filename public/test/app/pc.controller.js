var app = 	angular.module('jsbin',[
				'ui.bootstrap',
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
		},
		socket: socket
	};
});
app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/home', {
		templateUrl: 'app/home/index.html'
	}).
	when('/devices', {
		templateUrl: 'app/devices/index.html',
		controller: 'devicesController'
	}).
	when('/temperature', {
		templateUrl: 'app/temperature/index.html',
		controller: 'temperatureController'
	}).
	when('/switchHistory', {
		templateUrl: 'app/switchHistory/index.html',
		controller: 'switchHistoryController'
	}).
	when('/timer', {
		templateUrl: 'app/timer/index.html',
		controller: 'timerController'
	}).
	when('/editTimer/:id?', {
		templateUrl: 'app/timer/editTimer.html',
		controller: 'editTimerController'
	}).
	otherwise({
		redirectTo: '/home'
	});
}]);

app.controller('appController', function($scope, socket, $rootScope, $location){
	var oldUser = "Admin";
	var newUser;
	$rootScope.storedUser = getCookie("username");
	$rootScope.list = [];
	$rootScope.alerts = {};
	$rootScope.countdowns = {};
	$rootScope.chatMessages = {};
	$rootScope.moreMessagesAvailable = true;
	
	if ($scope.storedUser != "") {
		$rootScope.activeUser = JSON.parse($scope.storedUser);
		$scope.bla = $rootScope.activeUser;
		socket.emit('room:join', $rootScope.activeUser);
	}else{
		$rootScope.activeUser = {name:"Admin",favoritDevices: [], variables:[], admin:true};
	}

	socket.emit('users:get');
	$scope.setUser = function(user){
		socket.emit('room:leave', $rootScope.activeUser);
		$rootScope.activeUser = user;
		setCookie("username", JSON.stringify(user), 365);
		socket.emit('room:join', user);
	}

	$scope.add = function(type, data){
		socket.emit(type + ':add', {user:$rootScope.activeUser, add: data});
	}
	$scope.addAll = function(type, data){
		socket.emit(type + ':addAll', {user:$rootScope.activeUser, add:data});	
	}
	$scope.remove = function(type, data){
		socket.emit(type + ':remove', {user:$rootScope.activeUser, remove: data.id});	
	}
	$scope.switch = function(type, data){
		socket.emit(type + ':switch', {user:$rootScope.activeUser, switch: data});	
	}
	$scope.switchAll = function(type, data){
		socket.emit(type + ':switchAll', {user:$rootScope.activeUser, switchAll: data});	
	}
	$scope.refresh = function(){
		socket.socket.connect();
		setTimeout(function(){
			socket.emit('room:join', $rootScope.activeUser);
		}, 2000);
	}
	socket.on('connect', function(data){
		socket.emit('room:join', $rootScope.activeUser);
		$rootScope.socketConnected = true;
	});
	socket.on('disconnect', function(data){
		$rootScope.socketConnected = false;
	});
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
	$rootScope.favorit = true;
	$rootScope.menuIcon = "keyboard_arrow_left";
	$rootScope.showmenu=false;
	$rootScope.switchPage = function(data, data1){
		$rootScope.showmenu =! ($rootScope.showmenu);
		if(data != ""){
			if(data1 != undefined){
				$location.url(data + data1);
			}else{
				$location.url(data);
			}
		}
	}
	$scope.$watch('users', function(newValue, oldValue){
		if(newValue !== undefined){
			newValue.forEach(function(user){
				if(user.name == $scope.activeUser.name){
					$scope.setUser(user);
				}
			});
		}
	});
	$rootScope.abort = function(data) {
		$location.url(data);
	};
	$rootScope.toggleMenu = function(){
		$rootScope.favorit =! ($rootScope.favorit);
		if($rootScope.favorit){
			$rootScope.menuIcon = "keyboard_arrow_left";
		}else{
			$rootScope.menuIcon = "keyboard_arrow_right";	
		}
	}
});