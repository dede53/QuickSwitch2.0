app.controller('groupsController',  function($scope, $rootScope, socket) {
<<<<<<< HEAD

=======
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('groups');

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('groups', function(data) {
		$scope.grouplist = data;
	});
	
	/***********************************************
	*	Gruppe schalten
	***********************************************/
	$scope.switchgroup = function(data) {
		socket.emit('switchGroup', data);
	}
	
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
});