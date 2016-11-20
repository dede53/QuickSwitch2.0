app.controller('phoneController',  function($scope, $rootScope, socket) {
	/***********************************************
	*	Daten anfordern
	***********************************************/
	if($rootScope.phonelist == undefined){
		socket.emit('calls:get');
	}
});