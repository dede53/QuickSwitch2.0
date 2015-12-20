app.controller('timerController',function($scope, socket){

	$scope.newCountdowntimer = {};
	$scope.newCountdowntimer.time = "2";
	$scope.newCountdowntimer.device = "0";
	$scope.newCountdowntimer.switchstatus = "0";
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
		socket.emit('deleteTimer', {"id":data.id});	
	}

	socket.emit('timers');

	socket.on('timers', function(data){
		console.log(data);
		$scope.timers = data;
	});

	socket.on('newCountdown', function(data){
		$scope.activeCountdowns.push(data);
	});

});

app.controller('newTimer', function($scope, socket) {
	socket.emit('devices', {type: "array"});
	socket.on('devices', function(data){
		$scope.devicelist = data;
	});
	$scope.newCountdown = function() {
		// Validierung!!
		console.log($scope.newCountdowntimer);
		if($scope.newCountdowntimer.device == "0"){
			console.log("Gerät auswählen!");
		}else{
			console.log($scope.newCountdowntimer);
			socket.emit('newCountdowntimer', $scope.newCountdowntimer);
		}
	};
});

app.controller('weekdaysController', function($scope, socket){

});