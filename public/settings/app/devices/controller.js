app.controller('devicesController',  function($scope, $rootScope, socket) {
	socket.emit('devices', {"type":"object"});
	
	socket.on('devices', function(data) {
		$scope.devicelist = data;
	});
	$scope.deleteDevice = function(data) {
		socket.emit('deleteDevice', {"id":data.id});	
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
				},
				{ 
					name: "CCU-Programm",
					id: 10
				},
				{ 
					name: "UDP-Arduino",
					id: 11
				}
			];

	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.on('rooms', function(rooms) {
		$scope.rooms = rooms;
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
				$scope.editDevice = {
					title: "Bearbeiten",
					device: data
				}
			});
		}
	});
});

app.controller('saveDeviceController', function($scope, socket, $location) {
	$scope.submitnew = function() {
		socket.emit('saveDevice', $scope.editDevice.device);
		$location.url("/devices");
	};
});