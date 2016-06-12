app.controller('devicesController', function($rootScope, $scope, socket){
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('devices', {"type":"object"});

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('devices', function(data) {
		$rootScope.devicelist = data;
	});

	$scope.formatNumber = function(i) {
		return Math.round(i * 100); 
	}

	$scope.switchdeviceSlider = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status": data.status});
	}
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":data.status});
	}
	socket.on('switchDevice', function(data) {
		var device = data.device[data.device.type];
		$rootScope.devicelist[device.Raum].roomdevices[device.deviceid][data.device.type].status = parseFloat(data.status);
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
			if($scope.favoritDevices[i][data.device.type].deviceid == data.device[data.device.type].deviceid){
				$scope.favoritDevices[i][data.device.type].status = parseInt(data.status);
			}
		}
	});
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":data.status});
	}
	
	$scope.switchdeviceSlider = function(data) {
		socket.emit('switchdevice', {"id":data.device.deviceid,"status": data.device.status});
	}
});