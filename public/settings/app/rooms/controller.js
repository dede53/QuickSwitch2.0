app.controller('roomController',  function($scope, $rootScope, socket, $location) {
	socket.emit('rooms:get');
	$scope.deleteRoom = function(data) {
		socket.emit('room:remove', {"remove":data.id});	
	}
	$scope.saveRoom = function(){
		if($scope.editRoom != undefined && $scope.editRoom.name != "") {
			socket.emit('room:save', {"save": $scope.editRoom});
			$scope.editRoom.name = "";
		}
	};
	$scope.abortNewRoom = function(){
		$scope.editRoom.name = "";
	}
});
app.controller('editRoomController',  function($scope, $rootScope, socket, $routeParams, $location) {
	if(!$routeParams.id){
		$scope.title = "hinzufügen";
	}else{
		$scope.title = "bearbeiten";
		socket.emit('room:get', $routeParams.id);
	}
	$scope.saveRoom = function() {
		if($scope.room != undefined && $scope.room.name != ""){
			socket.emit('room:save', {"save": $scope.room});
			$scope.room.name = "";
			$location.url("/rooms");
		}
	};
	$scope.abortNewRoom = function(){
		$scope.room.name = "";
		$location.url("/rooms");
	}
});