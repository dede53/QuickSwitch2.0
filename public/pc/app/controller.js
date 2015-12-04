var app = 	angular.module('jsbin',[
				'ui.bootstrap',
				'snap',
				'ngAnimate',
				'ngRoute',
				'ngTouch',
				'highcharts-ng'
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
	when('/groups', {
		templateUrl: './app/groups/index.html',
		controller: 'groupsController'
	}).
	when('/rooms', {
		templateUrl: './app/rooms/index.html',
		controller: 'roomsController'
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


	$scope.storedUser = getCookie("username");

	if ($scope.storedUser != "") {
		$rootScope.activeUser = JSON.parse($scope.storedUser);
	}else{
		$rootScope.activeUser = {};
		$rootScope.activeUser.favoritDevices = "[1, 16, 3, 7, 14, 8, 17]";
		$rootScope.activeUser.name = "Besucher";
	}

	$scope.showmenu=false;
	$scope.switchPage = function(data){
		$scope.showmenu=!($scope.showmenu);
		if(data != ""){
			$location.url(data);
		}
	}

});