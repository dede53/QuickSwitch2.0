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

app.directive('colorpickerDirective', function ($rootScope) {
	return {
		restrict: 'EA',
		templateUrl: './app/devices/template-colorpicker.html',
		link: function(scope, elem, attrs) {
			/*
			elem.bind('click', function() {
				elem.css('background-color', 'white');
				scope.$apply(function() {
					scope.color = "white";
				});
			});
*/
			elem.bind('mouseover', function() {
				elem.css('cursor', 'pointer');
			});
		}
	};
});

app.directive('shutterDirective', function ($rootScope) {
	return {
		restrict: 'EA',
		templateUrl: './app/devices/template-shutter.html'
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
<<<<<<< HEAD
		templateUrl: './app/devices/template-favorit.html'
=======
		templateUrl: './app/devices/template-favorit.html',
		controller: 'favoritDevices'
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	};
});

app.directive('activeDevicesDirective', function ($rootScope) {
	return {
		restrict: 'EA',
		templateUrl: './app/devices/template-active.html',
		controller: 'activeDevices'
	};
});