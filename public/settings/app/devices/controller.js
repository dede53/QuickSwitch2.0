app.controller('devicesController',  function($scope, $rootScope, socket) {
	socket.emit('devices', {"type":"object"});
	
	socket.on('devices', function(data) {
		$scope.devicelist = data;
	});
	$scope.deleteDevice = function(id) {
		socket.emit('deleteDevice', {"id":id});	
	}
	socket.on('deletedDevice', function(data) {
		$scope.devicelist = data;
	});
});

app.controller('editDeviceController',  function($scope, $rootScope, socket, $routeParams) {
	socket.emit('rooms');

	// Maybe in die Datenbank auslagern??
	$scope.options = 	[
				{
					name: "Shell/exec",
					id: 'send-exec'
				},
				{ 
					name: "URL/WGET",
					id: 'send-url'
				},
				{ 
					name: "Fritz!Dect 200",
					id: 'switch-fritzdect'
				},
				{ 
					name: "Connair - Brennenstuhl",
					id: 'send-connair-brennenstuhl'
				},
				{ 
					name: "Connair - Elro",
					id: 'send-connair-elro'
				},
				{ 
					name: "Connair - Raw",
					id: 'send-connair-raw'
				},
				{ 
					name: "GPIO Fade",
					id: 'set-gpio'
				},
				{ 
					name: "UDP-Arduino",
					id: 'send-arduino-udp'
				},
				{ 
					name: "Telefunken-TV",
					id: 'set-telefunken-tv'
				},
				{ 
					name: "Homematic",
					id: 'send-homematic'
				}
			];

	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.on('rooms', function(rooms) {
		$scope.rooms = rooms;
		if(!$routeParams.id){
				$scope.editDevice = {
					title: "hinzufügen",
					device: {
						type:"device",
						device:{
							buttonLabelOn: "An",
							buttonLabelOff: "Aus",
							status: "0",
							switchserver: "0"
							
						}
					}
				}
		}else{
			socket.emit('device', {"id":  $routeParams.id});

			/***********************************************
			*	Daten empfangen, Scope zuordnen
			***********************************************/

			socket.on('device', function(data) {
				$scope.editDevice = {
					title: "bearbeiten",
					device: data
				}
			});
		}
	});
});

app.controller('saveDeviceController', function($scope, socket, $location) {
	$scope.submitnew = function() {
		console.log($scope.editDevice.device);
		socket.emit('saveDevice', $scope.editDevice.device);
		$location.url("/devices");
	};
});