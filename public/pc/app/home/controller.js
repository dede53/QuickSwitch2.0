app.controller('favoritDevices', function($rootScope, $scope, socket){
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('favoritDevices', $rootScope.activeUser);

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('favoritDevices', function(data) {
		$scope.favoritDevices = data;
	});
	socket.on('switchDevice', function(data) {
		$scope.favoritDevices[data.device.deviceid].status = data.status;
	});
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":data.status});
	}
	$scope.switchdeviceSlider = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":$scope.favoritDevices[data.id].status});
	}
});

app.controller('activeDevices', function($rootScope, $scope, socket){

	$scope.activedeviceslist = [];
	socket.emit('sendActiveDevices');
	socket.on('activedevices', function(data){
		$scope.activedeviceslist = data.activedevices;
	});
	$scope.switchalldevices = function(data) {
		socket.emit('switchalldevices', {"status":data.status});
	}
});

app.controller('activeUser', function($rootScope, $scope, socket){

	socket.emit('newuser');
	socket.on('newuser', function(data) {
		$scope.values = data;
	});
	$scope.setUser = function() {
		console.log($rootScope.activeUser);
		console.log($scope.activeUser);
		socket.emit('favoritDevices', $rootScope.activeUser);
		setCookie("username", JSON.stringify($rootScope.activeUser), 365);
	}
});

app.controller('homeController', function($rootScope, $scope, socket){

});