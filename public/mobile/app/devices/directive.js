<<<<<<< HEAD
app.directive('roomdevicesDirective', function($rootScope){
	return {
		restrict: 'EA',
		templateUrl: "./app/devices/template-room.html",
		controller: "devicesController"
	};
});

app.directive('buttonDirective', function ($rootScope) {
	return {
		restrict: 'EA',
		templateUrl: './app/devices/template-button.html'
	};
});

app.directive('sliderDirective', function ($rootScope) {
	return {
		restrict: 'EA',
		templateUrl: './app/devices/template-slider.html'
	};
});

app.directive('favoritenDirective', function ($rootScope) {
	return {
		restrict: 'EA',
		templateUrl: './app/devices/template-favorit.html',
		controller: 'favoritDevices'
	};
});

app.directive('activeDevicesDirective', function ($rootScope) {
	return {
		restrict: 'EA',
		templateUrl: './app/devices/template-active.html',
		controller: 'activeDevices'
	};
=======
app.directive('buttonDirective', function ($rootScope) {
    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
        templateUrl: './app/devices/button.html'
    };
});
app.directive('sliderDirective', function ($rootScope) {
    return {
        restrict: 'EA', //E = element, A = attribute, C = class, M = comment         
        templateUrl: './app/devices/slider.html'
    };
>>>>>>> af97e501eae31491992417dd0f792413c9d64b8f
});