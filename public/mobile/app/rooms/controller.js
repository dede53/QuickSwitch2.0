app.controller('roomsController',  function($scope, $rootScope, socket) {
	socket.emit('rooms');
	socket.on('rooms', function(data) {
		$rootScope.roomlist = data;
	});
	$scope.switchroom = function(data) {
		socket.emit('switchRoom', data);
	}
});