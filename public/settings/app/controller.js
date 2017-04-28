var app = 	angular.module('jsbin',[
				'ngAnimate',
				'ui.bootstrap',
				'ngRoute',
				'highcharts-ng',
				'as.sortable',
				'ngMdIcons'
			]);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/home', {
		templateUrl: './app/home/index.html',
		controller: 'homeController'
	}).

	when('/devices', {
		templateUrl: './app/devices/index.html',
		controller: 'devicesController'
	}).
	when('/editDevice/:id', {
		templateUrl: './app/devices/editDevice.html',
		controller: 'editDeviceController'
	}).

	when('/user/', {
		templateUrl: './app/user/index.html',
		controller: 'userController'
	}).
	when('/editUser/:id', {
		templateUrl: './app/user/editUser.html',
		controller: 'editUserController'
	}).

	when('/variables/', {
		templateUrl: './app/variables/index.html',
		controller: 'variableController'
	}).
	when('/editVariable/:id', {
		templateUrl: './app/variables/editVariable.html',
		controller: 'editVariableController'
	}).

	when('/adapters/', {
		templateUrl: './app/adapter/index.html',
		controller: 'adapterController'
	}).

	when('/groups', {
		templateUrl: './app/groups/index.html',
		controller: 'groupController'
	}).
	when('/editGroup/:id', {
		templateUrl: './app/groups/editGroup.html',
		controller: 'editGroupController'
	}).

	when('/rooms', {
		templateUrl: './app/rooms/index.html',
		controller: 'roomController'
	}).
	when('/editRoom/:id', {
		templateUrl: './app/rooms/editRoom.html',
		controller: 'editRoomController'
	}).
	otherwise({
		redirectTo: '/home'
	});
}]);

app.controller('appController', function($rootScope, $scope, $location, socket){
	$scope.switchPage = function(data){
		$scope.showmenu=!($scope.showmenu);
		if(data != ""){
			$location.url(data);
		}
	}
	$scope.abort = function(data) {
		$location.url(data);
	};
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
		}
	});

	socket.on('serverError', function(data){
		alert(data);
	});
});