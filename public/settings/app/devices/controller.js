app.controller('devicesController',  function($scope, $rootScope, socket) {
	socket.emit('devices:get');
	$scope.deleteDevice = function(id) {
		socket.emit('device:remove', {"remove":id});	
	}

	$scope.switch = function(type, data){
		socket.emit(type + ':switch', {user:$rootScope.activeUser, switch: data});	
	}
});

app.controller('editDeviceController',  function($scope, $rootScope, socket, $routeParams, $location) {
	socket.emit('rooms:get');
	socket.emit("settings:get");

	// Maybe in die Datenbank auslagern??
	$scope.options = 	[
				{
					name: "Shell/exec",
					id: 'exec'
				},
				{ 
					name: "URL/WGET",
					id: 'url'
				},
				{ 
					name: "Fritz!Dect 200",
					id: 'switch-fritzdect'
				},
				{ 
					name: "Connair - Brennenstuhl",
					id: 'connair:brennenstuhl'
				},
				{ 
					name: "Connair - Intertechno",
					id: 'connair:intertechno'
				},
				{ 
					name: "Connair - Intertec",
					id: 'connair:intertec'
				},
				{ 
					name: "Connair - Elro",
					id: 'connair:elro'
				},
				{ 
					name: "Connair - Raw",
					id: 'connair:raw'
				},
				{ 
					name: "GPIO Fade",
					id: 'set-gpio'
				},
				{ 
					name: "Telefunken-TV",
					id: 'set-telefunken-tv'
				},
				{ 
					name: "Homegear - Rolladen",
					id: 'homegear:shutter'
				},
				{ 
					name: "Arduino-Infrarot",
					id: 'arduino:ir'
				},
				{ 
					name: "Arduino-Onewire",
					id: 'arduino:saveTemp'
				},
				{
					name: "Arduino-Digital-Pin",
					id: 'arduino:pinDigital'
				},
				{ 
					name: "Arduino-Analog-Pin",
					id: 'arduino:pinAnalog'
				},
				{ 
					name: "Arduino-344Mhz",
					id: 'arduino:344'
				},
				{ 
					name: "Arduino-PilightRaw",
					id: 'arduino:pilightRaw'
				}
			];

	if(!$routeParams.id){
		$scope.mode = "hinzufügen";
		$scope.device = {
			buttonLabelOn: "An",
			buttonLabelOff: "Aus",
			status: "0",
			showStatus:1,
			switchserver: "0",
			roomid:1
		}
	}else{
		socket.emit('device:get', $routeParams.id);
		$scope.mode = "bearbeiten";
	}
	$scope.submitnew = function() {
		console.log($scope.device);
		socket.emit('device:save', {user:$rootScope.activeUser, save: $scope.device});
		$location.url("/devices");
	};
});