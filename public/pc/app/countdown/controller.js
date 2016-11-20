<<<<<<< HEAD
app.controller('countdownController',function($scope, socket, $rootScope){
	socket.emit('devices:devicelist');
	$scope.newCountdowntimer = {};
	$scope.newCountdowntimer.time = 2;
	$scope.newCountdowntimer.status = 0;
	$scope.newCountdowntimer.user = $rootScope.activeUser.name;
=======
app.controller('countdownController',function($scope, socket){



	$scope.deleteCountdown = function(data) {
		socket.emit('deleteCountdown', {"id":data.id});	
	}

	socket.emit('countdowns');

	socket.on('countdowns', function(data){
		$scope.activeCountdowns = data;
	});

	socket.on('newCountdown', function(data){
		$scope.activeCountdowns.push(data);
	});

});

app.controller('newCountdowntimer', function($scope, socket) {
	
	$scope.newCountdowntimer = {};
	$scope.newCountdowntimer.time = "2";
	$scope.newCountdowntimer.device = "0";
	$scope.newCountdowntimer.switchstatus = "1";

	socket.emit('devices', {type: "array"});
	socket.on('devices', function(data){
		$scope.devicelist = data;
	});
	$scope.newCountdown = function() {
		if($scope.newCountdowntimer.device == "0"){
			console.log("Gerät auswählen!");
		}else{
			socket.emit('newCountdowntimer', $scope.newCountdowntimer);
		}
	};
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
});