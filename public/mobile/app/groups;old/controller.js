app.controller('groupsController',  function($scope, $rootScope, socket) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('groups');

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('groups', function(data) {
		$rootScope.grouplist = data;
	});
	
	/***********************************************
	*	Gruppe schalten
	***********************************************/
	$scope.switchgroup = function(data) {
		socket.emit('switchGroup', data);
	}
});