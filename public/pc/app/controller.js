var app = 	angular.module('jsbin',[
				'ui.bootstrap',
				'ngAnimate',
				'ngRoute',
				'ngTouch',
				'highcharts-ng',
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
	when('/switchHistory', {
		templateUrl: './app/switchHistory/index.html',
		controller: 'switchHistoryController'
	}).
	when('/timer', {
		templateUrl: './app/timer/index.html',
		controller: 'timerController'
	}).
	when('/editTimer/:id', {
		templateUrl: './app/timer/editTimer.html',
		controller: 'timerController'
	}).
	otherwise({
		redirectTo: '/home'
	});
}]);

app.controller('appController', function($rootScope, $scope, $location){

	$scope.favorit = true;
	$scope.menuIcon = "keyboard_arrow_left";
	$scope.storedUser = getCookie("username");

	if ($scope.storedUser != "") {
		$rootScope.activeUser = JSON.parse($scope.storedUser);
	}else{
<<<<<<< HEAD
		$rootScope.activeUser = {name:"system",favoritDevices:[],variables:[], admin:true};
=======
		$rootScope.activeUser = {};
		$rootScope.activeUser.favoritDevices = [];
		$rootScope.activeUser.name = "Besucher";
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	}

	$scope.showmenu=false;
	$scope.switchPage = function(data){
		$scope.showmenu=!($scope.showmenu);
		if(data != ""){
			$location.url(data);
		}
	}
	$scope.abort = function(data) {
		$location.url(data);
	};
	$scope.toggleMenu = function(){
		$scope.favorit =! ($scope.favorit);
		if($scope.favorit){
			$scope.menuIcon = "keyboard_arrow_left";
		}else{
			$scope.menuIcon = "keyboard_arrow_right";	
		}
	}
});

app.controller('favoritmenucontroller', function($scope){

});