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