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
<<<<<<< HEAD
=======
	$scope.deleteTimer = function(data) {
		socket.emit('deleteTimer', data);
	}
	$scope.testActions = function(data) {
		socket.emit('testActions', data);
	}

	$scope.switchTimer = function(data) {
		if(data.active == "true"){
			data.active = "false";
		}else{
			data.active = "true";
		}
		socket.emit('switchTimer', data);
	    if ($rootScope.timers[data.id].clickIcon === 'notifications') {
	        $rootScope.timers[data.id].clickIcon = 'notifications_off';
	        $rootScope.timers[data.id].fill = '#ffc0c0';
	    }
	    else {
	        $rootScope.timers[data.id].clickIcon = 'notifications';
	        $rootScope.timers[data.id].fill = 'lightgreen';
	    }
	};

	socket.emit('timers');
	$rootScope.timers = {};
	socket.on('deleteTimer', function(id){
		delete $rootScope.timers[id];
		// socket.emit('timers');
		// $scope.timers = {};
	});
	socket.on('timer', function(data){
		if(data.active == "true"){
			data.clickIcon = "notifications";
			data.fill = 'lightgreen';
		}else{
			data.clickIcon = "notifications_off";
			data.fill = '#ffc0c0';
		}
		$rootScope.timers[data.id] = data;
	});
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
});