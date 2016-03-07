app.controller('devicesController', function($scope, socket){
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('devices', {"type":"object"});

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('devices', function(data) {
		$scope.devicelist = data;
	});

	$scope.formatNumber = function(i) {
		return Math.round(i * 100); 
	}

	$scope.switchdeviceSlider = function(data) {
		socket.emit('switchdevice', {"id":data.device.deviceid,"status": data.device.status});
	}
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":data.status});
	}
	socket.on('switchDevice', function(data) {
		$scope.devicelist[data.device.Raum].roomdevices[data.device.deviceid].status = data.status;
	});
	$scope.switchRoom = function(data){
		socket.emit('switchRoom', {"status": data.status, "room": data.room});
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
	
	$scope.formatNumber = function(i) {
		return Math.round(i * 100); 
	}

	socket.on('switchDevice', function(data) {
		for(var i = 0; i < $scope.favoritDevices.length; i++){
			if($scope.favoritDevices[i].deviceid == data.device.deviceid){
				$scope.favoritDevices[i].status = data.status;
			}
		}
	});
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":data.status});
	}
	$scope.switchdeviceSlider = function(data) {
		socket.emit('switchdevice', {"id":data.device.deviceid,"status":data.device.status});
	}
});