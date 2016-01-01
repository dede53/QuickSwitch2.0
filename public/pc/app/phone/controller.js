app.controller('phoneController',  function($scope, $rootScope, socket) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
	socket.emit('phonelist');

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('phonelist', function(data) {
		$rootScope.phonelist = data;
	});	
});