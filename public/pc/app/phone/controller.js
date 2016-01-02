app.controller('phoneController',  function($scope, $rootScope, socket) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if($rootScope.phonelist.length == 0){
		socket.emit('phonelist');
	}

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('phonelist', function(data) {
		$rootScope.phonelist = data;
	});	
});