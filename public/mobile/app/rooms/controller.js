<<<<<<< HEAD
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
	
=======
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
	
>>>>>>> af97e501eae31491992417dd0f792413c9d64b8f
});