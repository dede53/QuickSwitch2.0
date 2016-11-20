app.controller('countdownController',function($scope, socket, $rootScope){
	socket.emit('devices:devicelist');
	$scope.newCountdowntimer = {};
	$scope.newCountdowntimer.time = 2;
	$scope.newCountdowntimer.status = 0;
	$scope.newCountdowntimer.user = $rootScope.activeUser.name;
});