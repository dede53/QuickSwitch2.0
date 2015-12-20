<<<<<<< HEAD
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
	$scope.switchRoom = function(data){
		console.log(data);
		socket.emit('switchRoom', {"status": data.status, "id": data.id});
	}
});


app.controller('devicesSettingController',  function($scope, $rootScope, socket) {
	//socket.emit('devices', {"sort":"devices"});
	socket.emit('devices', {"type":"object"});
	
	socket.on('devices', function(data) {
		$rootScope.devicelist = data;
	});
	$scope.deleteDevice = function(data) {
		socket.emit('deleteDevice', {"id":data.id});	
	}
	socket.on('deletedDevice', function(data) {
		$rootScope.devicelist = data;
	});
});
app.controller('editDeviceController',  function($scope, $rootScope, socket, $routeParams) {
	socket.emit('rooms');
	socket.on('rooms', function(rooms) {
		$scope.rooms = rooms;
	});

	// Maybe in die Datenbank auslagern??
	$scope.options = 	[
				{
					name: "Shell/exec",
					id: 1
				},
				{ 
					name: "URL/WGET",
					id: 2
				},
				{ 
					name: "Fritz!Dect 200",
					id: 3
				},
				{ 
					name: "Milight",
					id: 4
				},
				{ 
					name: "Connair - Brennenstuhl",
					id: 5
				},
				{ 
					name: "Connair - Elro",
					id: 6
				},
				{ 
					name: "Connair - RAW-Code",
					id: 7
				},
				{ 
					name: "GPIO Fade",
					id: 8
				},
				{ 
					name: "CCU-Gerät",
					id: 9
				}
			];
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if(!$routeParams.id){
			$scope.editDevice = {
				title: "Hinzufügen",
				device: {
					buttonLabelOn: "An",
					buttonLabelOff: "Aus",
					status: "0"
				}
			}
	}else{
		socket.emit('device', {"id":  $routeParams.id});

		/***********************************************
		*	Daten empfangen, Scope zuordnen
		***********************************************/
		socket.on('device', function(data) {
			if(data.constructor === Array){

				$scope.editDevice = {
					title: "Bearbeiten",
					device: data[0]
				}
				// Array fängt bei 0 an, Protocolle erst bei 1
				var protocolid = data[0].protocol - 1;
				var protocolOptions = $scope.options[protocolid];
				$scope.editDevice.device.protocol = protocolOptions.id;

				var roomid = data[0].roomid - 1;
				var roomOptions = $scope.rooms[roomid];
				$scope.editDevice.device.room = roomOptions.id;

			}else{
				$scope.editDevice = {
					title: "Achtung: Fehler!",
					device:{
						name: data
					}
				}
			}
		});
	}
});
app.controller('saveDeviceController', function($scope, socket, $location) {
		$scope.submitnew = function() {
			// Validierung!!
			socket.emit('saveDevice', $scope.editDevice.device);
			$location.url("/devices");
		};
});
=======
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


app.controller('devicesSettingController',  function($scope, $rootScope, socket) {
	//socket.emit('devices', {"sort":"devices"});
	socket.emit('devices', {"type":"object"});
	
	socket.on('devices', function(data) {
		$rootScope.devicelist = data;
	});
	$scope.deleteDevice = function(data) {
		socket.emit('deleteDevice', {"id":data.id});	
	}
	socket.on('deletedDevice', function(data) {
		console.log(data);
		$rootScope.devicelist = data;
	});
});
app.controller('editDeviceController',  function($scope, $rootScope, socket, $routeParams) {
	socket.emit('rooms');
	socket.on('rooms', function(rooms) {
		$scope.rooms = rooms;
	});

	// Maybe in die Datenbank auslagern??
	$scope.options = 	[
				{
					name: "Shell/exec",
					id: 1
				},
				{ 
					name: "URL/WGET",
					id: 2
				},
				{ 
					name: "Fritz!Dect 200",
					id: 3
				},
				{ 
					name: "Milight",
					id: 4
				},
				{ 
					name: "Connair - Brennenstuhl",
					id: 5
				},
				{ 
					name: "Connair - Elro",
					id: 6
				},
				{ 
					name: "Connair - RAW-Code",
					id: 7
				},
				{ 
					name: "GPIO Fade",
					id: 8
				},
				{ 
					name: "CCU-Gerät",
					id: 9
				}
			];
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if(!$routeParams.id){
			$scope.editDevice = {
				title: "Hinzufügen",
				device: {
					buttonLabelOn: "An",
					buttonLabelOff: "Aus",
					status: "0"
				}
			}
	}else{
		socket.emit('device', {"id":  $routeParams.id});

		/***********************************************
		*	Daten empfangen, Scope zuordnen
		***********************************************/
		socket.on('device', function(data) {
			if(data.constructor === Array){

				$scope.editDevice = {
					title: "Bearbeiten",
					device: data[0]
				}
				// Array fängt bei 0 an, Protocolle erst bei 1
				var protocolid = data[0].protocol - 1;
				var protocolOptions = $scope.options[protocolid];
				$scope.editDevice.device.protocol = protocolOptions.id;

				var roomid = data[0].roomid - 1;
				var roomOptions = $scope.rooms[roomid];
				$scope.editDevice.device.room = roomOptions.id;

			}else{
				$scope.editDevice = {
					title: "Achtung: Fehler!",
					device:{
						name: data
					}
				}
			}
		});
	}
});
app.controller('saveDeviceController', function($scope, socket, $location) {
		$scope.submitnew = function() {
			// Validierung!!
			socket.emit('saveDevice', $scope.editDevice.device);
			$location.url("/devices");
		};
});
>>>>>>> af97e501eae31491992417dd0f792413c9d64b8f
