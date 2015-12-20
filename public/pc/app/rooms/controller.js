app.controller('roomsController',  function($scope, socket) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('rooms');

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('rooms', function(data) {
		$scope.roomlist = data;
	});
	
	/***********************************************
	*	Gerät schalten
	***********************************************/
	$scope.switchroom = function(data) {
		socket.emit('switchRoom', data);
	}
	
});


app.controller('roomSettingController',  function($scope, $rootScope, socket) {
	socket.emit('rooms');
	
	socket.on('rooms', function(data) {
		$rootScope.roomlist = data;
	});
	$scope.deleteRoom = function(data) {
		socket.emit('deleteRoom', {"id":data.id});	
	}
	socket.on('deletedRoom', function(data) {
		console.log(data);
		$rootScope.roomlist = data;
	});
});
app.controller('editRoomController',  function($scope, $rootScope, socket, $routeParams) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if(!$routeParams.id){
			$scope.editRoom = {
				title: "Hinzufügen"
			}
	}else{
		socket.emit('room', {"id":  $routeParams.id});

		/***********************************************
		*	Daten empfangen, Scope zuordnen
		***********************************************/
		socket.on('room', function(data) {
			console.log(data);
			
			if(data.constructor === Array){

				$scope.editRoom = {
					title: "Bearbeiten",
					roomlist: data[0]
				}
			}else{
				$scope.editRoom = {
					title: "Achtung: Fehler!",
					roomlist:{
						name: data
					}
				}
			}
		});
	}
});
app.controller('saveRoomController', function($scope, socket, $location) {
		$scope.saveRoom = function() {
			// Validierung!!
			socket.emit('saveRoom', $scope.editRoom.roomlist);
			$location.url("/rooms");
		};
		socket.on('savedDevice', function(data){
			alert("Antwort:" + data);
		});
});