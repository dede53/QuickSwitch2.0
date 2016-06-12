app.directive('timerDirective', function(){
	return {
		restrict: "EA",
		templateUrl: "./app/timer/index.html",
		controller: "timerController"
	}
});

app.directive('timerWeekdaysDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-weekdays.html'
	}
});

app.directive('timerTimeDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-time.html'
	}
});

app.directive('timerDeviceDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-device.html'
	}
});

app.directive('timerGroupDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-time.html'
	}
});