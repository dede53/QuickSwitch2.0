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
	$scope.switchdeviceSlider = function(data) {
		socket.emit('switchdevice', {"id":data.device.deviceid,"status": $scope.devicelist[data.device.Raum][data.device.deviceid].status});
	}
	$scope.switchdevice = function(data) {
		socket.emit('switchdevice', {"id":data.id,"status":data.status});
	}
	socket.on('switchDevice', function(data) {
		$scope.devicelist[data.device.Raum][data.device.deviceid].status = data.status;
	});

});