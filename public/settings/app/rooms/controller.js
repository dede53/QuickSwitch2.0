app.controller('roomController',  function($scope, $rootScope, socket, $location) {
	socket.emit('rooms:get');

	$scope.deleteRoom = function(data) {
		console.log(data);
		socket.emit('room:remove', {"remove":data.id});	
	}
	$scope.saveRoom = function() {
		// Validierung!!
		socket.emit('room:save', {"save": $scope.editRoom.roomlist});
		$scope.editRoom.roomlist.name = "";
		$location.url("/rooms");
	};
});
app.controller('editRoomController',  function($scope, $rootScope, socket, $routeParams, $location) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if(!$routeParams.id){
		$scope.title = "hinzufügen";
	}else{
		$scope.title = "bearbeiten";
		socket.emit('room:get', $routeParams.id);
	}
	$scope.saveRoom = function() {
		// Validierung!!
		socket.emit('room:save', {"save": $scope.room});
		$scope.room.name = "";
		$location.url("/rooms");
	};
	$scope.abortNewRoom = function(){
		$scope.room.name = "";
		$location.url("/rooms");
	}
});