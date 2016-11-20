app.controller('phoneController',  function($scope, $rootScope, socket) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if($rootScope.phonelist == undefined){
<<<<<<< HEAD
		socket.emit('calls:get');
	}
=======
		socket.emit('phonelist');
	}

	/***********************************************
	*	Daten empfangen, Scope zuordnen
	***********************************************/
	socket.on('phonelist', function(data) {
		$rootScope.phonelist = data;
	});	
>>>>>>> d3e70a1d720f830c1b7fd87dccb9dd8e639e7874
});