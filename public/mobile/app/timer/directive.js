app.directive('timerDirective', function(){
	return {
		restrict: "EA",
		templateUrl: "./app/timer/index.html",
		controller: "timerController"
	}
});

app.directive('createTimerDirective', function(){
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
		templateUrl: "./app/timer/template-timer.html"
	}
});
app.directive('timerEditDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-edit.html',
		controller: "addNewTimerController"
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

app.directive('timerGroupDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-group.html'
	}
});

app.directive('timerRoomDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-room.html'
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

// app.directive('timerGroupDirective', function(){
// 	return {
// 		restrict: "EA",
// 		templateUrl: './app/timer/template-timer-time.html'
// 	}
// });

app.directive('timerPushbulletDirective', function(){
	return {
		restrict: "EA",
		templateUrl: './app/timer/template-timer-pushbullet.html'
	}
});