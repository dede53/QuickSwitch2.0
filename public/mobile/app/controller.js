var app = 	angular.module('jsbin',[
				'ui.bootstrap',
				
				'snap'
				
				,
				'ngAnimate',
				'ngRoute',
				'ngTouch',
				'highcharts-ng'
			]);

app.config(['$routeProvider', function($routeProvider) {
	$routeProvider.
	when('/favoriten', {
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
		redirectTo: '/favoriten'
	});
}]);

app.controller('appController', function($rootScope, $scope, $location){

	$rootScope.moreMessagesAvible = true;
	$rootScope.sharedMessages = new Array;
	
	$scope.storedUser = getCookie("username");

	if ($scope.storedUser != "") {
		$rootScope.activeUser = JSON.parse($scope.storedUser);
	}else{
		$rootScope.activeUser = {};
		$rootScope.activeUser.favoritDevices = "[1, 16, 3, 7, 14, 8, 17]";
		$rootScope.activeUser.name = "Besucher";
	}



	$scope.showmenu=false;
	$scope.toggleMenu = function(data){
		$scope.showmenu=!($scope.showmenu);
		if(data != ""){
			$location.url(data);
		}
	}

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
});