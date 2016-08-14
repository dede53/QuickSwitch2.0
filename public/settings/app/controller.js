var app = 	angular.module('jsbin',[
				'ngAnimate',
				'snap',
				'ui.bootstrap',
				'ngRoute',
				'ngTouch',
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


	when('/timer', {
		templateUrl: './app/timer/index.html',
		controller: 'timerController'
	}).
	when('/editTimer/:id', {
		templateUrl: './app/timer/editTimer.html',
		controller: 'timerController'
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

	
	when('/temperature', {
		templateUrl: './app/temperature/index.html',
		controller: 'temperatureController'
	}).	
	when('/editSensor/:id', {
		templateUrl: './app/temperature/editSensor.html',
		controller: 'editSensorController'
	}).
	otherwise({
		redirectTo: '/home'
	});
}]);

app.controller('appController', function($rootScope, $scope, $location){
	$scope.switchPage = function(data){
		$scope.showmenu=!($scope.showmenu);
		if(data != ""){
			$location.url(data);
		}
	}
	$scope.abort = function(data) {
		$location.url(data);
	};
});