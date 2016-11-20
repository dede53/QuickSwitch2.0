app.controller('roomsController',  function($scope, $rootScope, socket) {
<<<<<<< HEAD

=======
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('rooms');

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('rooms', function(data) {
		$rootScope.roomlist = data;
	});
	
	/***********************************************
	*	Gerät schalten
	***********************************************/
	$scope.switchroom = function(data) {
		socket.emit('switchRoom', data);
	}
	
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
});