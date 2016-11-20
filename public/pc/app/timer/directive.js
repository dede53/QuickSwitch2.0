app.directive('timerDirective', function(){
	return {
		restrict: "EA",
		templateUrl: "./app/timer/index.html",
		controller: "timerController"
	}
});

app.directive('createTimerDirective', function(){
<<<<<<< HEAD
	var controller = ['$scope', 'socket', '$rootScope', function ($scope, socket, $rootScope) {
		$scope.$watch('timer', function(newValue, oldValue) {
			if(newValue.active == 'true'){
				$scope.timer.clickIcon = "notifications";
				$scope.timer.fill = 'lightgreen';
			}else{
				$scope.timer.clickIcon = "notifications_off";
				$scope.timer.fill = '#ffc0c0';
			}
		});
		$scope.switchTimer = function(data){
			if ($scope.timer.clickIcon === 'notifications') {
				$scope.timer.clickIcon = 'notifications_off';
				$scope.timer.fill = '#ffc0c0';
			}else{
				$scope.timer.clickIcon = 'notifications';
				$scope.timer.fill = 'lightgreen';
			}
			if(data.active == "true"){
				data.active = "false";
			}else{
				data.active = "true";
			}
			socket.emit('timers:switch', {user:$rootScope.activeUser, switch: data});
		}
	}];
	return {
		restrict: "EA",
		controller: controller,
=======
	return {
		restrict: "EA",
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
		templateUrl: "./app/timer/template-timer.html"
	}
});
app.directive('timerEditDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-edit.html',
<<<<<<< HEAD
		controller: "addNewTimerController",
		// scope: {
			// devicelist: '&'
		// }
=======
		controller: "addNewTimerController"
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
	}
});
app.directive('timerWeekdaysDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-weekdays.html'
	}
});

app.directive('timerRangeDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-range.html'
	}
});
app.directive('timerTimeDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-time.html'
	}
});

app.directive('timerRandomDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-random.html'
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