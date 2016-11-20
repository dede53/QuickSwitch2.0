app.controller('phoneController',  function($scope, $rootScope, socket) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
<<<<<<< HEAD
	if($rootScope.phonelist == undefined){
		socket.emit('calls:get');
	}
=======
	socket.emit('phonelist');

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('phonelist', function(data) {
		$rootScope.phonelist = data;
	});	
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
});