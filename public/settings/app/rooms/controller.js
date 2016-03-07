app.controller('roomController',  function($scope, $rootScope, socket) {
	socket.emit('rooms');
	
	socket.on('rooms', function(data) {
		$scope.roomlist = data;
	});
	$scope.deleteRoom = function(data) {
		socket.emit('deleteRoom', {"id":data.id});	
	}
	socket.on('deletedRoom', function(data) {
		console.log(data);
		$scope.roomlist = data;
	});
});
app.controller('editRoomController',  function($scope, $rootScope, socket, $routeParams) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if(!$routeParams.id){
			$scope.editRoom = {
				title: "hinzufügen"
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
					title: "bearbeiten",
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
		$scope.abortNewRoom = function(){
			$scope.editRoom = {
				title: "Bearbeiten",
				roomlist: {
					name: ""
				}
			}
		}
});