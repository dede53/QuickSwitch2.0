app.controller('timerController',function($scope, socket){
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
		$scope.timers = data;
	});

});

app.controller('newTimer', function($scope, socket) {
	
});