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


	socket.on('switchDevice', function(data) {
		var device = data.device[data.device.type];
		$rootScope.devicelist[device.Raum].roomdevices[device.deviceid][data.device.type].status = parseFloat(data.status);
	});
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', data);
	}
	$scope.switchdeviceMouseDown = function(data) {
		if(parseInt(data.sendMultiple) == 1){
			$scope.interval = setInterval(function(){
				socket.emit('switchdevice', data);
			}, 300);
		}
	}
	$scope.switchdeviceMouseUp = function(data){
		if(parseInt(data.sendMultiple) == 1){
			clearInterval($scope.interval);
		}
	}
	$scope.switchRoom = function(data){
		socket.emit('switchRoom', data);
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
	console.log($rootScope.activeUser);
	socket.emit('favoritDevices', $rootScope.activeUser);
	socket.on('favoritDevices', function(data){
		console.log(data);
		$rootScope.activeUser.favoritDevices = data;
	});
	$scope.formatNumber = function(i) {
		return Math.round(i * 100); 
	}

	socket.on('switchDevice', function(data) {
		for(var i = 0; i < $rootScope.activeUser.favoritDevices.length; i++){
			if($rootScope.activeUser.favoritDevices[i][data.device.type].deviceid == data.device[data.device.type].deviceid){
				$rootScope.activeUser.favoritDevices[i][data.device.type].status = parseInt(data.status);
			}
		}
	});
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', data);
	}
	$scope.switchdeviceMouseDown = function(data) {
		if(parseInt(data.sendMultiple) == 1){
			$scope.interval = setInterval(function(){
				socket.emit('switchdevice', data);
			}, 100);
		}
	}
	$scope.switchdeviceMouseUp = function(data){
		if(parseInt(data.sendMultiple) == 1){
			clearInterval($scope.interval);
		}
	}
	
	$scope.switchdeviceSlider = function(data) {
		socket.emit('switchdevice', {"id":data.device.deviceid,"status": data.device.status});
	}
});