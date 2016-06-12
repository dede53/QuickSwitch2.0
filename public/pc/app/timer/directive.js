app.directive('timerDirective', function(){
	return {
		restrict: "EA",
		templateUrl: "./app/timer/index.html",
		controller: "timerController"
	}
});

app.directive('createTimerDirective', function(){
	return {
		restrict: "EA",
		templateUrl: "./app/timer/template-timer.html",
		controller: "createTimerController"
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

app.directive('timerVariableDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-variable.html'
	}
});

app.directive('timerAlertDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-alert.html'
	}
});

app.directive('timerGroupDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-time.html'
	}
});

app.directive('timerPushbulletDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-pushbullet.html'
	}
});