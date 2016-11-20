app.controller('devicesController', function($rootScope, $scope, socket){
	socket.emit('devices:get');
});

app.controller('activeDevices', function($rootScope, $scope, socket){

	$scope.activedeviceslist = [];
	socket.emit('devices:active');

	$scope.switchalldevices = function(data) {
		socket.emit('devices:switchAll', {"status":data.status});
	}
});

app.controller('favoritDevices', function($rootScope, $scope, socket){

});