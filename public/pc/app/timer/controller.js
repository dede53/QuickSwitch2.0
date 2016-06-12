app.controller('timerController',function($scope, $rootScope, socket){
	$scope.days = {
		"0":"Sonntag",
		"1":"Montag",
		"2":"Dienstag",
		"3":"Mittwoch",
		"4":"Donnerstag",
		"5":"Freitag",
		"6":"Samstag"
	}
	$scope.deleteTimer = function(data) {
		delete $scope.timers[data.name];
		socket.emit('deleteTimer', {"id":data.id});	
	}
	$scope.switchTimer = function(data) {
		if(data.active == "true"){
			data.active = "false";
		}else{
			data.active = "true";
		}
		socket.emit('switchTimer', data);
	    if ($scope.timers[data.name].clickIcon === 'notifications') {
	        $scope.timers[data.name].clickIcon = 'notifications_off';
	        $scope.timers[data.name].fill = '#ffc0c0';
	    }
	    else {
	        $scope.timers[data.name].clickIcon = 'notifications';
	        $scope.timers[data.name].fill = 'lightgreen';
	    }
	};

	socket.emit('timers');
	$scope.timers = {};
	socket.on('timer', function(data){
		if($rootScope.activeUser.name == data.user){
			if(data.active == "true"){
				data.clickIcon = "notifications";
				data.fill = 'lightgreen';
			}else{
				data.clickIcon = "notifications_off";
		        data.fill = '#ffc0c0';
			}
			$scope.timers[data.name] = data;
		}else{
			delete $scope.timers[data.name];
		}
	});
});

app.controller('newTimer', function($scope, socket) {
	
});
app.controller('createTimerController', function($scope, socket) {
	/*
	$scope.size = 48;

	$scope.clickIcon = 'notifications';
	$scope.clickIconMorph = function(name) {
	    if ($scope.timers[name].clickIcon === 'notifications') {
	        $scope.timers[name].clickIcon = 'notifications_off';
	        $scope.timers[name].fill = 'pink';
	    }
	    else {
	        $scope.timers[name].clickIcon = 'notifications';
	        $scope.timers[name].fill = 'lightgreen';
	    }
	};
	*/
});
