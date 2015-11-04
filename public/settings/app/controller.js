var app = 	angular.module('jsbin',[
				'ui.bootstrap',
				'snap',
				'ngAnimate',
				'ngRoute',
				'ngTouch',
				'highcharts-ng',
				'as.sortable'
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


	when('/groups', {
		templateUrl: './app/groups/index.html',
		controller: 'groupsController'
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
		console.log(data);
		$location.url(data);
	};
});